#include <algorithm>
#include <array>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

#include "solver/position.h"
#include "solver/settings.h"
#include "solver/solver.h"

struct Line {
    std::array<std::pair<int,int>,4> cells; // row, col
    const char* kind;
};

struct Fingerprint {
    uint64_t key;
    bool mirrored;
};

static std::vector<Line> make_lines() {
    std::vector<Line> lines;
    auto add = [&](int r, int c, int dr, int dc, const char* kind) {
        Line line{};
        line.kind = kind;
        for (int i = 0; i < 4; ++i) line.cells[i] = {r + i*dr, c + i*dc};
        lines.push_back(line);
    };

    for (int r = 0; r < BOARD_HEIGHT; ++r) {
        for (int c = 0; c < BOARD_WIDTH; ++c) {
            if (c + 3 < BOARD_WIDTH) add(r,c,0,1,"H");
            if (r + 3 < BOARD_HEIGHT) add(r,c,1,0,"V");
            if (c + 3 < BOARD_WIDTH && r + 3 < BOARD_HEIGHT) add(r,c,1,1,"D+");
            if (c + 3 < BOARD_WIDTH && r - 3 >= 0) add(r,c,-1,1,"D-");
        }
    }
    return lines;
}

static Fingerprint fingerprint(Position& pos) {
    uint64_t direct = 0, mirror = 0, mul = 1;
    for (int r = 0; r < BOARD_HEIGHT; ++r) {
        for (int c = 0; c < BOARD_WIDTH; ++c) {
            const int p0 = pos.get_player(r,c);
            const int p1 = pos.get_player(r,BOARD_WIDTH - 1 - c);
            direct += uint64_t(p0 == -1 ? 1 : (p0 == 1 ? 2 : 0)) * mul;
            mirror += uint64_t(p1 == -1 ? 1 : (p1 == 1 ? 2 : 0)) * mul;
            mul *= 3;
        }
    }
    return mirror < direct ? Fingerprint{mirror,true} : Fingerprint{direct,false};
}

class Enumerator {
public:
    Enumerator() : lines(make_lines()) {
        if (lines.size() > 64) {
            std::cerr << "This experiment expects <=64 geometric lines.\n";
            std::exit(2);
        }

        line_reflect.resize(lines.size());
        std::unordered_map<std::string,size_t> by_cells;
        for (size_t i = 0; i < lines.size(); ++i) by_cells.emplace(line_key(lines[i], false), i);
        for (size_t i = 0; i < lines.size(); ++i) {
            auto it = by_cells.find(line_key(lines[i], true));
            if (it == by_cells.end()) {
                std::cerr << "Unable to reflect line " << i << "\n";
                std::exit(3);
            }
            line_reflect[i] = it->second;
        }
    }

    uint64_t collect(Position& pos, int best) {
        const Fingerprint fp = fingerprint(pos);
        if (auto it = memo.find(fp.key); it != memo.end()) {
            return fp.mirrored ? reflect_mask(it->second) : it->second;
        }
        ++states;

        if (pos.is_game_over()) {
            const uint64_t out = terminal_lines(pos);
            memo.emplace(fp.key, fp.mirrored ? reflect_mask(out) : out);
            return out;
        }

        uint64_t out = 0;
        for (int col = 0; col < BOARD_WIDTH; ++col) {
            if (!pos.is_move_valid(col)) continue;

            const board before = pos.move(col);

            // Parent exact score already tells us the exact score of every
            // optimal child. A null-window query is enough to distinguish
            // optimal from suboptimal moves; do not re-solve this state.
            const int child_score = -solver.solve(pos, -best, -best + 1);
            if (child_score >= best) {
                ++optimal_edges;
                out |= collect(pos, -best);
            }

            pos.unmove(before);
        }

        memo.emplace(fp.key, fp.mirrored ? reflect_mask(out) : out);
        return out;
    }

    void run() {
        Position root{};
        const int root_score = solver.solve(root);

        // Under perfect play a theoretical draw has no terminal winning line.
        const uint64_t mask = root_score == 0 ? 0 : collect(root, root_score);

        int count = 0;
        for (size_t i = 0; i < lines.size(); ++i) if (mask & (uint64_t(1) << i)) ++count;

        std::cout << "BOARD " << BOARD_WIDTH << "x" << BOARD_HEIGHT << "\n";
        std::cout << "ROOT_SCORE " << root_score << "\n";
        std::cout << "ROOT_MOVES_LEFT " << root.moves_left(root_score) << "\n";
        std::cout << "GEOMETRIC_WINNING_LINES " << lines.size() << "\n";
        std::cout << "PERFECT_TERMINAL_WINNING_LINES " << count << "\n";
        std::cout << "PERFECT_PLAY_STATES_VISITED " << states << "\n";
        std::cout << "OPTIMAL_EDGES_VISITED " << optimal_edges << "\n";
        std::cout << "LINE_SET_BEGIN\n";

        for (size_t i = 0; i < lines.size(); ++i) {
            if (!(mask & (uint64_t(1) << i))) continue;
            std::cout << i << " " << lines[i].kind;
            for (const auto& [r,c] : lines[i].cells) {
                std::cout << " (" << (c+1) << "," << (r+1) << ")";
            }
            std::cout << "\n";
        }
        std::cout << "LINE_SET_END\n";
    }

private:
    std::string line_key(const Line& line, bool mirrored) const {
        std::array<int,4> cells{};
        for (int i = 0; i < 4; ++i) {
            const auto [r,c0] = line.cells[i];
            const int c = mirrored ? BOARD_WIDTH - 1 - c0 : c0;
            cells[i] = r * BOARD_WIDTH + c;
        }
        std::sort(cells.begin(), cells.end());
        std::string key;
        for (int cell : cells) {
            key += std::to_string(cell);
            key.push_back(',');
        }
        return key;
    }

    uint64_t reflect_mask(uint64_t mask) const {
        uint64_t out = 0;
        while (mask) {
            const unsigned i = __builtin_ctzll(mask);
            out |= uint64_t(1) << line_reflect[i];
            mask &= mask - 1;
        }
        return out;
    }

    uint64_t terminal_lines(Position& pos) {
        if (pos.is_draw()) return 0;

        // get_player(): -1 = first player, +1 = second player.
        const int last_player = (pos.num_moves() & 1) ? -1 : 1;
        uint64_t out = 0;

        for (size_t i = 0; i < lines.size(); ++i) {
            bool full = true;
            for (const auto& [r,c] : lines[i].cells) {
                if (pos.get_player(r,c) != last_player) {
                    full = false;
                    break;
                }
            }
            if (full) out |= uint64_t(1) << i;
        }
        return out;
    }

    Solver solver;
    std::vector<Line> lines;
    std::vector<size_t> line_reflect;
    std::unordered_map<uint64_t,uint64_t> memo;
    uint64_t states = 0;
    uint64_t optimal_edges = 0;
};

int main() {
    Enumerator e;
    e.run();
    return 0;
}
