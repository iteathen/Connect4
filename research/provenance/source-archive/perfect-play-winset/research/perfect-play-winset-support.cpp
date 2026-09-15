#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <limits>
#include <sstream>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "Solver.hpp"

using GameSolver::Connect4::Position;
using GameSolver::Connect4::Solver;

namespace {

constexpr int W = 7;
constexpr int H = 6;
constexpr int CELLS = W * H;
constexpr int INVALID = Solver::INVALID_MOVE;

struct Line {
  std::array<int, 4> cells{};
  std::string kind;
  std::string name;
};

struct Board {
  std::array<int8_t, CELLS> cell{};
  std::array<uint8_t, W> height{};
  int ply = 0;

  Board() { cell.fill(-1); height.fill(0); }
};

enum class Mode { Strong, Wdl };

using ScoreRow = std::array<int16_t, W>;

std::vector<Line> makeLines() {
  std::vector<Line> out;
  auto add = [&](std::string kind, std::string name, std::array<int, 4> cells) {
    std::sort(cells.begin(), cells.end());
    out.push_back(Line{cells, std::move(kind), std::move(name)});
  };
  for (int r = 0; r < H; ++r) for (int c = 0; c <= W - 4; ++c) {
    add("horizontal", "H:r" + std::to_string(r + 1) + ":c" + std::to_string(c + 1) + "-" + std::to_string(c + 4),
        {r * W + c, r * W + c + 1, r * W + c + 2, r * W + c + 3});
  }
  for (int c = 0; c < W; ++c) for (int r = 0; r <= H - 4; ++r) {
    add("vertical", "V:c" + std::to_string(c + 1) + ":r" + std::to_string(r + 1) + "-" + std::to_string(r + 4),
        {r * W + c, (r + 1) * W + c, (r + 2) * W + c, (r + 3) * W + c});
  }
  for (int r = 0; r <= H - 4; ++r) for (int c = 0; c <= W - 4; ++c) {
    add("diag_up", "D+:r" + std::to_string(r + 1) + "c" + std::to_string(c + 1),
        {r * W + c, (r + 1) * W + c + 1, (r + 2) * W + c + 2, (r + 3) * W + c + 3});
  }
  for (int r = 3; r < H; ++r) for (int c = 0; c <= W - 4; ++c) {
    add("diag_down", "D-:r" + std::to_string(r + 1) + "c" + std::to_string(c + 1),
        {r * W + c, (r - 1) * W + c + 1, (r - 2) * W + c + 2, (r - 3) * W + c + 3});
  }
  if (out.size() != 69) throw std::runtime_error("expected exactly 69 geometric win lines");
  return out;
}

std::string cellsKey(std::array<int, 4> cells) {
  std::sort(cells.begin(), cells.end());
  std::ostringstream os;
  for (int x : cells) os << x << ',';
  return os.str();
}

std::vector<int> makeMirrorMap(const std::vector<Line>& lines) {
  std::unordered_map<std::string, int> byCells;
  for (int i = 0; i < static_cast<int>(lines.size()); ++i) byCells[cellsKey(lines[i].cells)] = i;
  std::vector<int> mirror(lines.size(), -1);
  for (int i = 0; i < static_cast<int>(lines.size()); ++i) {
    std::array<int, 4> m{};
    for (int j = 0; j < 4; ++j) {
      int r = lines[i].cells[j] / W;
      int c = lines[i].cells[j] % W;
      m[j] = r * W + (W - 1 - c);
    }
    auto it = byCells.find(cellsKey(m));
    if (it == byCells.end()) throw std::runtime_error("mirror line lookup failed");
    mirror[i] = it->second;
  }
  return mirror;
}

std::string mirrorSequence(const std::string& seq) {
  std::string out = seq;
  for (char& ch : out) ch = static_cast<char>('1' + (W - 1 - (ch - '1')));
  return out;
}

int scoreClass(int score) { return (score > 0) - (score < 0); }

class Reachability {
 public:
  Reachability(const std::string& book, Mode mode)
      : mode_(mode), lines_(makeLines()), mirror_(makeMirrorMap(lines_)), started_(std::chrono::steady_clock::now()) {
    solver_.loadBook(book);
  }

  int run() {
    Position root;
    const auto rootScores = scoresFor(root);
    int rootBest = -2000;
    for (int s : rootScores) if (s != INVALID) rootBest = std::max(rootBest, static_cast<int>(s));
    std::cout << "ROOT mode=" << modeName() << " best=" << rootBest << " scores=";
    for (int c = 0; c < W; ++c) std::cout << (c ? "," : "") << rootScores[c];
    std::cout << std::endl;
    if (rootBest <= 0) throw std::runtime_error("root is not a first-player win under oracle");

    std::vector<int8_t> reachable(lines_.size(), -1);
    std::vector<std::string> witness(lines_.size());
    for (int target = 0; target < static_cast<int>(lines_.size()); ++target) {
      const int reflected = mirror_[target];
      if (target > reflected) continue;
      dead_.clear();
      Board board;
      std::string path;
      const auto beforeQueries = oracleQueries_;
      const auto targetStart = std::chrono::steady_clock::now();
      bool ok = dfs(root, board, target, path);
      reachable[target] = reachable[reflected] = ok ? 1 : 0;
      if (ok) {
        witness[target] = path;
        witness[reflected] = target == reflected ? path : mirrorSequence(path);
      }
      auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now() - targetStart).count();
      std::cout << "TARGET mode=" << modeName()
                << " id=" << target
                << " mirror=" << reflected
                << " name=" << lines_[target].name
                << " reachable=" << (ok ? 1 : 0)
                << " queries=" << (oracleQueries_ - beforeQueries)
                << " dead=" << dead_.size()
                << " ms=" << elapsed;
      if (ok) std::cout << " witness=" << path;
      std::cout << std::endl;
    }

    int count = 0, horizontal = 0, vertical = 0, diagUp = 0, diagDown = 0;
    for (int i = 0; i < static_cast<int>(reachable.size()); ++i) {
      if (reachable[i] < 0) throw std::runtime_error("unclassified win line after symmetry expansion");
      if (!reachable[i]) continue;
      ++count;
      if (lines_[i].kind == "horizontal") ++horizontal;
      else if (lines_[i].kind == "vertical") ++vertical;
      else if (lines_[i].kind == "diag_up") ++diagUp;
      else if (lines_[i].kind == "diag_down") ++diagDown;
    }

    auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now() - started_).count();
    std::cout << "WINSET_SUPPORT mode=" << modeName()
              << " count=" << count
              << " horizontal=" << horizontal
              << " vertical=" << vertical
              << " diag_up=" << diagUp
              << " diag_down=" << diagDown
              << " oracle_queries=" << oracleQueries_
              << " analyze_cache=" << scoreCache_.size()
              << " elapsed_ms=" << elapsed
              << std::endl;

    std::cout << "REACHABLE_IDS mode=" << modeName() << " ids=";
    bool first = true;
    for (int i = 0; i < static_cast<int>(reachable.size()); ++i) if (reachable[i]) {
      if (!first) std::cout << ',';
      first = false;
      std::cout << i << ':' << lines_[i].name;
    }
    std::cout << std::endl;
    return 0;
  }

 private:
  Solver solver_;
  Mode mode_;
  std::vector<Line> lines_;
  std::vector<int> mirror_;
  std::unordered_map<uint64_t, ScoreRow> scoreCache_;
  std::unordered_set<uint64_t> dead_;
  uint64_t oracleQueries_ = 0;
  std::chrono::steady_clock::time_point started_;

  const char* modeName() const { return mode_ == Mode::Strong ? "strong" : "wdl"; }

  ScoreRow scoresFor(const Position& p) {
    const uint64_t key = static_cast<uint64_t>(p.key());
    auto it = scoreCache_.find(key);
    if (it != scoreCache_.end()) return it->second;
    const auto raw = solver_.analyze(p);
    if (raw.size() != W) throw std::runtime_error("oracle analyze did not return seven scores");
    ScoreRow row{};
    for (int c = 0; c < W; ++c) row[c] = static_cast<int16_t>(raw[c]);
    scoreCache_.emplace(key, row);
    ++oracleQueries_;
    return row;
  }

  std::vector<int> optimalColumns(const ScoreRow& scores) const {
    int best = -2000;
    for (int c = 0; c < W; ++c) if (scores[c] != INVALID) best = std::max(best, static_cast<int>(scores[c]));
    if (best == -2000) return {};
    std::vector<int> out;
    const int cls = scoreClass(best);
    for (int c = 0; c < W; ++c) {
      if (scores[c] == INVALID) continue;
      if ((mode_ == Mode::Strong && scores[c] == best)
          || (mode_ == Mode::Wdl && scoreClass(scores[c]) == cls)) out.push_back(c);
    }
    return out;
  }

  bool lineContains(int target, int cell) const {
    const auto& xs = lines_[target].cells;
    return std::find(xs.begin(), xs.end(), cell) != xs.end();
  }

  bool lineComplete(int target, const Board& board, int player) const {
    for (int cell : lines_[target].cells) if (board.cell[cell] != player) return false;
    return true;
  }

  int movePriority(const Board& board, int target, int col) const {
    const int mover = board.ply & 1;
    const int row = board.height[col];
    const int cell = row * W + col;
    const bool targetCell = lineContains(target, cell);
    bool targetColumn = false;
    for (int x : lines_[target].cells) if ((x % W) == col) { targetColumn = true; break; }
    if (mover == 0) {
      if (targetCell) return 0;
      if (targetColumn) return 1;
      return 2 + std::abs(col - 3);
    }
    if (!targetColumn) return std::abs(col - 3);
    if (!targetCell) return 10 + std::abs(col - 3);
    return 100;
  }

  bool dfs(const Position& p, Board& board, int target, std::string& path) {
    const uint64_t key = static_cast<uint64_t>(p.key());
    if (dead_.find(key) != dead_.end()) return false;

    auto scores = scoresFor(p);
    auto columns = optimalColumns(scores);
    std::stable_sort(columns.begin(), columns.end(), [&](int a, int b) {
      return movePriority(board, target, a) < movePriority(board, target, b);
    });

    const int mover = board.ply & 1;
    for (int col : columns) {
      if (board.height[col] >= H) continue;
      const int row = board.height[col];
      const int cell = row * W + col;
      if (mover == 1 && lineContains(target, cell)) continue; // target can no longer be a red win set

      const bool winsNow = p.isWinningMove(col);
      board.cell[cell] = static_cast<int8_t>(mover);
      ++board.height[col];
      ++board.ply;
      path.push_back(static_cast<char>('1' + col));

      bool success = false;
      if (winsNow) {
        success = mover == 0 && lineComplete(target, board, 0);
      } else {
        Position child = p;
        child.playCol(col);
        success = dfs(child, board, target, path);
      }

      if (success) return true;
      path.pop_back();
      --board.ply;
      --board.height[col];
      board.cell[cell] = -1;
    }

    dead_.insert(key);
    return false;
  }
};

} // namespace

int main(int argc, char** argv) {
  if (argc != 3) {
    std::cerr << "usage: winset-support <7x6.book> <strong|wdl>\n";
    return 2;
  }
  const std::string modeArg = argv[2];
  Mode mode;
  if (modeArg == "strong") mode = Mode::Strong;
  else if (modeArg == "wdl") mode = Mode::Wdl;
  else {
    std::cerr << "mode must be strong or wdl\n";
    return 2;
  }
  try {
    Reachability run(argv[1], mode);
    return run.run();
  } catch (const std::exception& e) {
    std::cerr << "ERROR: " << e.what() << '\n';
    return 1;
  }
}
