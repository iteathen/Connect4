// Benchmark entrypoint only. Search/position/table algorithms remain upstream.
#include <chrono>
#include <filesystem>
#include <iostream>
#include <stdexcept>
#include <string>

#include "solver/solver.h"

static_assert(BOARD_WIDTH == 7 && BOARD_HEIGHT == 6);
static_assert(!STRONG_SOLVES_ENABLED && NUM_THREADS == 4);
static_assert(!LOAD_BOOK_FILE && !LOAD_TABLE_FILE && !UPDATE_TABLE_FILE);
static_assert(NUM_TABLE_ENTRIES == 134217757 && sizeof(Entry) == 8);
static_assert(!ENABLE_HUGE_PAGES && !ENABLE_AFFINITY);
static_assert(ENHANCED_TABLE_CUTOFF_PLIES == 27 && MOVE_SCORE_JITTER == 0.3f);
static_assert(Position::MIN_SCORE == -1 && Position::MAX_SCORE == 1);

using Clock = std::chrono::steady_clock;
static double milliseconds(Clock::time_point begin, Clock::time_point end) {
    return std::chrono::duration<double, std::milli>(end - begin).count();
}

static std::string json_string(const std::string& value) {
    const char hex[] = "0123456789abcdef";
    std::string result = "\"";
    for (unsigned char c : value) {
        if (c == '"' || c == '\\') {
            result += '\\';
            result += static_cast<char>(c);
        } else if (c < 32) {
            result += "\\u00";
            result += hex[c >> 4];
            result += hex[c & 15];
        } else {
            result += static_cast<char>(c);
        }
    }
    return result + '"';
}

int main(int argc, char** argv) {
    const auto entry_time = Clock::now();
    const bool prepare_only = argc == 2 && std::string(argv[1]) == "--prepare-only";
    if (argc != 1 && !prepare_only) {
        std::cerr << "Usage: christophe-benchmark [--prepare-only]\n";
        return 2;
    }
    try {
        Position pos{};
        Solver solver{};
        const auto initialized_time = Clock::now();

        // These cold accessors never run after any worker has started searching.
        const auto occupied = solver.benchmark_initial_nonempty_entries();
        const auto workers = solver.benchmark_num_workers();
        bool empty_root = pos.num_moves() == 0 && !pos.is_game_over();
        for (int row = 0; row < BOARD_HEIGHT; ++row) {
            for (int col = 0; col < BOARD_WIDTH; ++col) {
                empty_root = empty_root && pos.get_player(row, col) == 0;
            }
        }
        if (!empty_root || occupied != 0 || workers != NUM_THREADS ||
            solver.get_merged_stats().get_num_nodes() != 0) {
            throw std::runtime_error("cold-state verification failed");
        }
        const auto ready_time = Clock::now();
        auto emit_ready = [&](std::ostream& out) {
            out << "{\"schema\":\"c4-0011-christophe-v1\",\"event\":\"ready\","
                << "\"independence_lane\":\"runtime-input-only\",\"exact_target\":\"WDL\","
                << "\"root\":\"empty\",\"width\":7,\"height\":6,\"root_moves\":0,"
                << "\"strong_solves\":false,\"search_threads\":" << workers
                << ",\"table_capacity\":" << NUM_TABLE_ENTRIES
                << ",\"table_allocated_entries\":" << NUM_TABLE_ENTRIES + 1
                << ",\"table_allocated_bytes\":" << (NUM_TABLE_ENTRIES + 1) * sizeof(Entry)
                << ",\"initial_nonempty_entries\":" << occupied
                << ",\"initial_native_nodes\":0,\"book_load\":false,\"table_load\":false,"
                << "\"table_update\":false,\"native_affinity\":false,\"huge_pages\":false,"
                << "\"prepare_only\":" << (prepare_only ? "true" : "false")
                << ",\"initialization_ms\":" << milliseconds(entry_time, initialized_time)
                << ",\"cold_checks_ms\":" << milliseconds(initialized_time, ready_time)
                << ",\"cwd\":" << json_string(std::filesystem::current_path().generic_string())
                << ",\"executable_argument\":" << json_string(argv[0]) << "}\n";
            out.flush();
        };
        emit_ready(std::cerr);
        if (prepare_only) {
            emit_ready(std::cout);
            return 0;
        }

        // No progress printer, no oracle, no best-action/PV follow-up search.
        std::cerr << "{\"event\":\"search_start\"}" << std::endl;
        const auto search_start = Clock::now();
        const int score = solver.solve(pos);
        const auto search_end = Clock::now();
        if (score < -1 || score > 1) {
            throw std::runtime_error("upstream returned a non-WDL score");
        }
        const auto& stats = solver.get_merged_stats();
        std::cout << "{\"schema\":\"c4-0011-christophe-v1\",\"event\":\"result\","
                  << "\"exact_target\":\"WDL\",\"perspective\":\"first-player\","
                  << "\"root\":\"empty\",\"score\":" << score
                  << ",\"wdl\":" << json_string(score > 0 ? "win" : score < 0 ? "loss" : "draw")
                  << ",\"search_ms\":" << milliseconds(search_start, search_end)
                  << ",\"entry_to_result_ms\":" << milliseconds(entry_time, search_end)
                  << ",\"native_negamax_nodes\":" << stats.get_num_nodes()
                  << ",\"native_search_time_ms\":" << stats.get_search_time_ms() << "}\n";
        std::cout.flush();
        return 0;
    } catch (const std::exception& error) {
        std::cerr << "{\"event\":\"error\",\"message\":" << json_string(error.what()) << "}\n";
        return 1;
    }
}
