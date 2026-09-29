#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <string>
#include <unordered_set>
#include <vector>

#include "src/solver/position.h"
#include "src/solver/solver.h"
#include "src/solver/settings.h"

struct Key {
    uint64_t p0{};
    uint64_t p1{};
    bool operator==(const Key& o) const noexcept { return p0 == o.p0 && p1 == o.p1; }
};

struct KeyHash {
    size_t operator()(const Key& k) const noexcept {
        uint64_t x = k.p0 + 0x9e3779b97f4a7c15ULL;
        x ^= k.p1 + 0x9e3779b97f4a7c15ULL + (x << 6) + (x >> 2);
        x ^= x >> 30; x *= 0xbf58476d1ce4e5b9ULL;
        x ^= x >> 27; x *= 0x94d049bb133111ebULL;
        x ^= x >> 31;
        return static_cast<size_t>(x);
    }
};

struct Line {
    std::array<int,4> cells{};
};

class TargetedCensus {
public:
    TargetedCensus() { build_lines(); }

    void run() {
        Position root;
        root_score = solver.solve(root);
        terminal_ply = root_score == 0 ? BOARD_WIDTH * BOARD_HEIGHT : root.moves_left(root_score);

        std::cout << "ROOT board=" << BOARD_WIDTH << 'x' << BOARD_HEIGHT
                  << " score=" << root_score
                  << " terminal_ply=" << terminal_ply << "\n" << std::flush;

        if (root_score == 0) {
            std::cout << "geometry_interval_count=" << BOARD_WIDTH * (BOARD_WIDTH + 1) / 2 << "\n";
            std::cout << "geometric_four_lines=" << lines.size() << "\n";
            std::cout << "structural_candidate_count=0\n";
            std::cout << "perfect_play_terminal_line_count=0\n";
            std::cout << "reason=exact_root_draw\n";
            return;
        }

        winner_owner = root_score > 0 ? -1 : 1;
        loser_owner = -winner_owner;

        Position prefix;
        int expected = root_score;
        std::string forced_prefix;
        for (;;) {
            if (prefix.is_game_over()) break;
            std::vector<int> optimal;
            for (int c = 0; c < BOARD_WIDTH; ++c) {
                if (!prefix.is_move_valid(c)) continue;
                Position child(prefix);
                child.move(c);
                const int child_score = -solver.solve(child, -expected, -expected + 1);
                if (child_score >= expected) optimal.push_back(c);
            }

            std::cout << "prefix_ply=" << prefix.num_moves()
                      << " expected=" << expected
                      << " optimal=";
            for (int c : optimal) std::cout << c;
            std::cout << "\n" << std::flush;

            if (optimal.size() != 1) break;
            forced_prefix.push_back(static_cast<char>('0' + optimal[0]));
            prefix.move(optimal[0]);
            expected = -expected;
        }

        const int empties_before_terminal = BOARD_WIDTH * BOARD_HEIGHT - (terminal_ply - 1);
        min_last_row = std::max(0, BOARD_HEIGHT - empties_before_terminal);

        std::vector<int> candidates;
        for (int id = 0; id < static_cast<int>(lines.size()); ++id) {
            if (structural_candidate(prefix, lines[id])) candidates.push_back(id);
        }

        std::cout << "forced_prefix=" << forced_prefix << "\n";
        std::cout << "forced_prefix_length=" << forced_prefix.size() << "\n";
        std::cout << "min_last_row_zero_based=" << min_last_row << "\n";
        std::cout << "geometry_interval_count=" << BOARD_WIDTH * (BOARD_WIDTH + 1) / 2 << "\n";
        std::cout << "geometric_four_lines=" << lines.size() << "\n";
        std::cout << "structural_candidate_count=" << candidates.size() << "\n" << std::flush;

        std::vector<int> witnessed;
        for (int id : candidates) {
            failed.clear();
            path.clear();
            visited_for_target = 0;
            null_tests_for_target = 0;

            Position p;
            const auto start = std::chrono::steady_clock::now();
            const bool ok = find_witness(p, root_score, id);
            const double sec = std::chrono::duration<double>(
                std::chrono::steady_clock::now() - start).count();

            std::cout << "TARGET line=" << id
                      << " witness=" << (ok ? "yes" : "no")
                      << " visited=" << visited_for_target
                      << " null_tests=" << null_tests_for_target
                      << " seconds=" << sec;
            if (ok) {
                witnessed.push_back(id);
                std::cout << " path=" << path;
            }
            std::cout << "\n" << std::flush;
        }

        std::cout << "perfect_play_terminal_line_count=" << witnessed.size() << "\n";
        std::cout << "WITNESSED_LINES_BEGIN\n";
        for (int id : witnessed) {
            std::cout << id << ':';
            for (int j = 0; j < 4; ++j) {
                if (j) std::cout << ';';
                int cell = lines[id].cells[j];
                std::cout << '(' << (cell % BOARD_WIDTH) << ',' << (cell / BOARD_WIDTH) << ')';
            }
            std::cout << "\n";
        }
        std::cout << "WITNESSED_LINES_END\n";
        std::cout << "total_target_states=" << total_target_states << "\n";
        std::cout << "total_null_tests=" << total_null_tests << "\n";
    }

private:
    Solver solver;
    std::vector<Line> lines;
    std::unordered_set<Key, KeyHash> failed;
    std::string path;
    int root_score = 0;
    int terminal_ply = 0;
    int min_last_row = 0;
    int winner_owner = 0;
    int loser_owner = 0;
    uint64_t visited_for_target = 0;
    uint64_t null_tests_for_target = 0;
    uint64_t total_target_states = 0;
    uint64_t total_null_tests = 0;

    void build_lines() {
        const int dirs[4][2] = {{1,0},{0,1},{1,1},{1,-1}};
        for (int r = 0; r < BOARD_HEIGHT; ++r) {
            for (int c = 0; c < BOARD_WIDTH; ++c) {
                for (auto& d : dirs) {
                    const int c3 = c + 3*d[0], r3 = r + 3*d[1];
                    if (c3 < 0 || c3 >= BOARD_WIDTH || r3 < 0 || r3 >= BOARD_HEIGHT) continue;

                    Line line;
                    for (int i = 0; i < 4; ++i)
                        line.cells[i] = (r + i*d[1]) * BOARD_WIDTH + (c + i*d[0]);
                    lines.push_back(line);
                }
            }
        }
    }

    Key physical_key(Position& p) const {
        Key k{};
        for (int r = 0; r < BOARD_HEIGHT; ++r) {
            for (int c = 0; c < BOARD_WIDTH; ++c) {
                const int owner = p.get_player(r, c);
                if (!owner) continue;
                const int bit = r * BOARD_WIDTH + c;
                if (owner < 0) k.p0 |= 1ULL << bit;
                else k.p1 |= 1ULL << bit;
            }
        }
        return k;
    }

    bool structural_candidate(Position& prefix, const Line& line) const {
        bool possible_last_landing = false;
        for (int cell : line.cells) {
            const int r = cell / BOARD_WIDTH, c = cell % BOARD_WIDTH;
            const int owner = prefix.get_player(r, c);
            if (owner == loser_owner) return false;
            if (owner == 0 && r >= min_last_row) possible_last_landing = true;
        }
        return possible_last_landing;
    }

    bool target_complete(Position& p, int line_id) const {
        for (int cell : lines[line_id].cells) {
            const int r = cell / BOARD_WIDTH, c = cell % BOARD_WIDTH;
            if (p.get_player(r, c) != winner_owner) return false;
        }
        return true;
    }

    bool target_viable(Position& p, int line_id) const {
        int need = 0;
        for (int cell : lines[line_id].cells) {
            const int r = cell / BOARD_WIDTH, c = cell % BOARD_WIDTH;
            const int owner = p.get_player(r, c);
            if (owner == loser_owner) return false;
            if (owner == 0) need++;
        }

        int winner_turns_left = 0;
        for (int ply = p.num_moves(); ply < terminal_ply; ++ply) {
            const int mover_owner = (ply & 1) ? 1 : -1;
            if (mover_owner == winner_owner) winner_turns_left++;
        }
        return need <= winner_turns_left;
    }

    int landing_cell(Position& p, int col) const {
        for (int r = 0; r < BOARD_HEIGHT; ++r)
            if (p.get_player(r, col) == 0) return r * BOARD_WIDTH + col;
        return -1;
    }

    bool cell_in_target(int cell, int line_id) const {
        for (int t : lines[line_id].cells) if (t == cell) return true;
        return false;
    }

    bool find_witness(Position& p, int expected, int line_id) {
        visited_for_target++;
        total_target_states++;

        if (!target_viable(p, line_id)) return false;

        if (p.is_game_over()) {
            return p.num_moves() == terminal_ply && target_complete(p, line_id);
        }
        if (p.num_moves() >= terminal_ply) return false;

        Key k = physical_key(p);
        if (failed.contains(k)) return false;

        const int current_owner = (p.num_moves() & 1) ? 1 : -1;
        std::vector<std::pair<int,int>> ordered;
        for (int c = 0; c < BOARD_WIDTH; ++c) {
            if (!p.is_move_valid(c)) continue;
            const int cell = landing_cell(p, c);
            const bool on_target = cell >= 0 && cell_in_target(cell, line_id);

            int priority = 0;
            if (current_owner == winner_owner) priority = on_target ? 100 : 0;
            else priority = on_target ? -100 : 0;

            const int twice_center = BOARD_WIDTH - 1;
            priority -= std::abs(2*c - twice_center);
            ordered.push_back({-priority, c});
        }
        std::sort(ordered.begin(), ordered.end());

        for (auto [neg_priority, c] : ordered) {
            Position child(p);
            child.move(c);
            if (!target_viable(child, line_id)) continue;

            null_tests_for_target++;
            total_null_tests++;
            const int move_score = -solver.solve(child, -expected, -expected + 1);
            if (move_score < expected) continue;

            path.push_back(static_cast<char>('0' + c));
            if (find_witness(child, -expected, line_id)) return true;
            path.pop_back();
        }

        failed.insert(k);
        return false;
    }
};

int main() {
    TargetedCensus census;
    census.run();
    return 0;
}
