#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <unordered_map>
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

struct Lines {
    uint64_t lo{};
    uint64_t hi{};
};

static inline void add_line(Lines& m, int id) {
    if (id < 64) m.lo |= 1ULL << id;
    else m.hi |= 1ULL << (id - 64);
}

static inline bool has_line(const Lines& m, int id) {
    return id < 64 ? ((m.lo >> id) & 1ULL) : ((m.hi >> (id - 64)) & 1ULL);
}

static inline void merge_lines(Lines& a, const Lines& b) {
    a.lo |= b.lo;
    a.hi |= b.hi;
}

static inline int popcount_lines(const Lines& m) {
    return __builtin_popcountll(m.lo) + __builtin_popcountll(m.hi);
}

struct Data {
    int score = 1000000;
    bool lines_done = false;
    Lines lines{}; // canonical mirror orientation
};

class Enumerator {
public:
    Enumerator() {
        build_lines();
        memo.reserve(1 << 20);
        started = std::chrono::steady_clock::now();
    }

    int root_score(Position& p) { return score(p); }

    Lines collect(Position& p) {
        if (p.is_game_over()) {
            terminal_states++;
            Lines t = terminal_lines(p);
            if (popcount_lines(t)) terminal_wins++;
            return t;
        }

        bool mirrored = false;
        Key k = key(p, mirrored);
        auto [it, inserted] = memo.try_emplace(k);
        Data& d = it->second;

        if (d.lines_done) return mirrored ? reflect(d.lines) : d.lines;

        if (d.score == 1000000) {
            d.score = solver.solve(p);
            score_solves++;
        }
        const int parent_score = d.score;

        // An exact draw position cannot lead to a terminal win if both players
        // continue choosing exact optimal moves.
        if (parent_score == 0) {
            d.lines = {};
            d.lines_done = true;
            line_states++;
            return {};
        }

        Lines out{};
        for (int col = 0; col < BOARD_WIDTH; ++col) {
            if (!p.is_move_valid(col)) continue;
            Position child(p);
            child.move(col);
            const int move_score = -score(child);
            if (move_score != parent_score) continue;

            optimal_edges++;
            Lines child_lines = collect(child);
            merge_lines(out, child_lines);
        }

        d.lines = mirrored ? reflect(out) : out;
        d.lines_done = true;
        line_states++;

        if ((line_states & 0x3fff) == 0) progress();
        return out;
    }

    void report(Position& root, const Lines& result) {
        std::cout << "RESULT board=" << BOARD_WIDTH << "x" << BOARD_HEIGHT << "\n";
        std::cout << "root_score=" << score(root) << "\n";
        std::cout << "geometry_interval_count=" << (BOARD_WIDTH * (BOARD_WIDTH + 1) / 2) << "\n";
        std::cout << "geometric_four_lines=" << lines.size() << "\n";
        std::cout << "perfect_play_terminal_line_count=" << popcount_lines(result) << "\n";
        std::cout << "memo_positions=" << memo.size() << "\n";
        std::cout << "score_solves=" << score_solves << "\n";
        std::cout << "line_states=" << line_states << "\n";
        std::cout << "optimal_edges=" << optimal_edges << "\n";
        std::cout << "terminal_states=" << terminal_states << "\n";
        std::cout << "terminal_wins=" << terminal_wins << "\n";
        std::cout << "LINES_BEGIN\n";

        for (int id = 0; id < static_cast<int>(lines.size()); ++id) {
            if (!has_line(result, id)) continue;
            std::cout << id << ':';
            for (int j = 0; j < 4; ++j) {
                int cell = lines[id][j];
                int r = cell / BOARD_WIDTH, c = cell % BOARD_WIDTH;
                if (j) std::cout << ';';
                std::cout << '(' << c << ',' << r << ')';
            }
            std::cout << "\n";
        }
        std::cout << "LINES_END\n";
    }

private:
    Solver solver;
    std::unordered_map<Key, Data, KeyHash> memo;
    std::vector<std::array<int,4>> lines;
    std::vector<int> mirror_line;
    uint64_t score_solves = 0;
    uint64_t line_states = 0;
    uint64_t optimal_edges = 0;
    uint64_t terminal_states = 0;
    uint64_t terminal_wins = 0;
    std::chrono::steady_clock::time_point started;

    static bool key_less(const Key& a, const Key& b) {
        return a.p0 < b.p0 || (a.p0 == b.p0 && a.p1 < b.p1);
    }

    Key raw_key(Position& p, bool mirror_board) const {
        Key k{};
        for (int r = 0; r < BOARD_HEIGHT; ++r) {
            for (int c = 0; c < BOARD_WIDTH; ++c) {
                int v = p.get_player(r, c);
                if (!v) continue;
                int cc = mirror_board ? BOARD_WIDTH - 1 - c : c;
                int bit = r * BOARD_WIDTH + cc;
                if (v < 0) k.p0 |= 1ULL << bit;
                else k.p1 |= 1ULL << bit;
            }
        }
        return k;
    }

    Key key(Position& p, bool& mirrored) const {
        Key physical = raw_key(p, false);
        Key reflected = raw_key(p, true);
        mirrored = key_less(reflected, physical);
        return mirrored ? reflected : physical;
    }

    int score(Position& p) {
        if (p.is_game_over()) return solver.solve(p);

        bool mirrored = false;
        Key k = key(p, mirrored);
        Data& d = memo[k];
        if (d.score == 1000000) {
            d.score = solver.solve(p);
            score_solves++;
        }
        return d.score;
    }

    Lines terminal_lines(Position& p) const {
        Lines out{};
        for (int id = 0; id < static_cast<int>(lines.size()); ++id) {
            int first = lines[id][0];
            int r0 = first / BOARD_WIDTH, c0 = first % BOARD_WIDTH;
            int owner = p.get_player(r0, c0);
            if (!owner) continue;

            bool ok = true;
            for (int j = 1; j < 4; ++j) {
                int cell = lines[id][j];
                int r = cell / BOARD_WIDTH, c = cell % BOARD_WIDTH;
                if (p.get_player(r, c) != owner) {
                    ok = false;
                    break;
                }
            }
            if (ok) add_line(out, id);
        }
        return out;
    }

    Lines reflect(const Lines& in) const {
        Lines out{};
        for (int id = 0; id < static_cast<int>(lines.size()); ++id) {
            if (has_line(in, id)) add_line(out, mirror_line[id]);
        }
        return out;
    }

    static std::array<int,4> sorted(std::array<int,4> a) {
        std::sort(a.begin(), a.end());
        return a;
    }

    void build_lines() {
        const int dirs[4][2] = {{1,0},{0,1},{1,1},{1,-1}};

        for (int r = 0; r < BOARD_HEIGHT; ++r) {
            for (int c = 0; c < BOARD_WIDTH; ++c) {
                for (auto& d : dirs) {
                    int c3 = c + 3*d[0], r3 = r + 3*d[1];
                    if (c3 < 0 || c3 >= BOARD_WIDTH || r3 < 0 || r3 >= BOARD_HEIGHT) continue;

                    std::array<int,4> line{};
                    for (int i = 0; i < 4; ++i) {
                        line[i] = (r + i*d[1]) * BOARD_WIDTH + (c + i*d[0]);
                    }
                    lines.push_back(line);
                }
            }
        }

        mirror_line.assign(lines.size(), -1);
        for (int i = 0; i < static_cast<int>(lines.size()); ++i) {
            std::array<int,4> mirrored{};
            for (int j = 0; j < 4; ++j) {
                int cell = lines[i][j];
                int r = cell / BOARD_WIDTH, c = cell % BOARD_WIDTH;
                mirrored[j] = r * BOARD_WIDTH + (BOARD_WIDTH - 1 - c);
            }
            mirrored = sorted(mirrored);

            for (int j = 0; j < static_cast<int>(lines.size()); ++j) {
                if (sorted(lines[j]) == mirrored) {
                    mirror_line[i] = j;
                    break;
                }
            }

            if (mirror_line[i] < 0) {
                std::cerr << "mirror mapping failure\n";
                std::exit(3);
            }
        }
    }

    void progress() const {
        using namespace std::chrono;
        auto seconds = duration_cast<std::chrono::seconds>(steady_clock::now() - started).count();
        std::cerr << "progress board=" << BOARD_WIDTH << 'x' << BOARD_HEIGHT
                  << " states=" << line_states
                  << " memo=" << memo.size()
                  << " solves=" << score_solves
                  << " seconds=" << seconds << '\n';
    }
};

int main() {
    Position root;
    Enumerator enumerator;
    int root_score = enumerator.root_score(root);

    std::cout << "ROOT board=" << BOARD_WIDTH << 'x' << BOARD_HEIGHT
              << " score=" << root_score << "\n";

    Lines result{};
    if (root_score != 0) result = enumerator.collect(root);

    enumerator.report(root, result);
    return 0;
}
