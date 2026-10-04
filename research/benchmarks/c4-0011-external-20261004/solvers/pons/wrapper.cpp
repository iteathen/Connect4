// Benchmark adapter; upstream Solver.cpp/headers come from a staged include path.
#include <cassert>
#include <cstddef>
#include <cstdint>
#include <cstring>
#include <type_traits>
#include <vector>
#include <string>
#include <iostream>
#include <fstream>

#include "Solver.cpp"

using namespace GameSolver::Connect4;
static_assert(Position::WIDTH == 7 && Position::HEIGHT == 6, "7x6 benchmark only");
static_assert(std::is_same<Position::position_t, uint64_t>::value, "native 64-bit board required");

// Read-only audit access through pointers to members. Explicit template
// instantiation may name private members; no class tokens/layout are rewritten.
template<class Tag, typename Tag::type Member> struct AuditAccess {
  friend typename Tag::type audit_member(Tag) { return Member; }
};
using AuditKey = uint_t<Position::WIDTH * (Position::HEIGHT + 1) - 24>;
using AuditTable = TranspositionTable<AuditKey, Position::position_t, uint8_t, 24>;
using BookTable = TableGetter<Position::position_t, uint8_t>;
struct SolverTableTag { using type = AuditTable Solver::*; friend type audit_member(SolverTableTag); };
struct SolverBookTag { using type = OpeningBook Solver::*; friend type audit_member(SolverBookTag); };
struct KeysTag { using type = AuditKey *AuditTable::*; friend type audit_member(KeysTag); };
struct ValuesTag { using type = uint8_t *AuditTable::*; friend type audit_member(ValuesTag); };
struct BookPointerTag { using type = BookTable *OpeningBook::*; friend type audit_member(BookPointerTag); };
struct BookDepthTag { using type = int OpeningBook::*; friend type audit_member(BookDepthTag); };
template struct AuditAccess<SolverTableTag, &Solver::transTable>;
template struct AuditAccess<SolverBookTag, &Solver::book>;
template struct AuditAccess<KeysTag, &AuditTable::K>;
template struct AuditAccess<ValuesTag, &AuditTable::V>;
template struct AuditAccess<BookPointerTag, &OpeningBook::T>;
template struct AuditAccess<BookDepthTag, &OpeningBook::depth>;

static int fail(const char *reason) {
  std::cerr << "{\"event\":\"error\",\"solver\":\"pons\",\"reason\":\""
    << reason << "\"}" << std::endl;
  return 2;
}

static void ready(std::ostream &out, bool prepare_only, std::size_t capacity) {
  out << "{\"event\":\"ready\",\"solver\":\"pons\",\"prepare_only\":"
    << (prepare_only ? "true" : "false")
    << ",\"search_started\":false,\"start\":\"empty\",\"ply\":0,\"side_to_move\":0,"
    "\"target\":\"WDL\",\"weak\":true,\"workers\":1,\"tt_entries\":" << capacity
    << ",\"tt_key_bytes\":" << sizeof(AuditKey)
    << ",\"tt_value_bytes\":" << sizeof(uint8_t)
    << ",\"tt_bytes\":" << capacity * (sizeof(AuditKey) + sizeof(uint8_t))
    << ",\"tt_initial_occupied\":0,\"tt_initial_nonzero_keys\":0,"
    "\"proof_cache_capacity\":0,\"proof_cache_initial_occupied\":0,"
    "\"opening_book_loaded\":false,\"opening_book_pointer_null\":true,"
    "\"opening_book_depth\":-1,\"persisted_cache_loaded\":false,\"start_key\":0}"
    << std::endl;
}

int main(int argc, char **argv) {
  const bool prepare_only = argc == 2 && std::strcmp(argv[1], "--prepare-only") == 0;
  if(argc != 1 && !prepare_only) return fail("only --prepare-only is accepted");
  try {
    int score;
    unsigned long long nodes;
    {
      Solver solver;
      Position position;
      solver.reset();
      // Capacity exactly mirrors the frozen TT template expression, not a score.
      constexpr std::size_t capacity = next_prime(uint64_t(1) << 24);
      const AuditTable &table = solver.*audit_member(SolverTableTag{});
      const OpeningBook &book = solver.*audit_member(SolverBookTag{});
      const AuditKey *keys = table.*audit_member(KeysTag{});
      const uint8_t *values = table.*audit_member(ValuesTag{});
      std::size_t occupied = 0, nonzero_keys = 0;
      for(std::size_t i = 0; i < capacity; ++i) {
        occupied += values[i] != 0;
        nonzero_keys += keys[i] != 0;
      }
      if(occupied || nonzero_keys || solver.getNodeCount()) return fail("initial transposition state was nonzero");
      if(book.*audit_member(BookPointerTag{}) != nullptr || book.*audit_member(BookDepthTag{}) != -1)
        return fail("opening book was not empty");
      if(position.nbMoves() || position.key() || position.canWinNext()) return fail("initial root was not empty");
      for(int col = 0; col < Position::WIDTH; ++col)
        if(!position.canPlay(col) || position.isWinningMove(col)) return fail("initial legal moves invalid");
      ready(std::cerr, prepare_only, capacity);
      if(prepare_only) { ready(std::cout, true, capacity); return 0; }
      std::cerr << "{\"event\":\"search_start\"}" << std::endl;
      score = solver.solve(position, true);
      nodes = solver.getNodeCount();
      if(position.nbMoves() || position.key()) return fail("root changed during solve");
    } // Destroy TT/book before the result record; external timing includes cleanup.
    const int wdl = (score > 0) - (score < 0);
    std::cout << "{\"event\":\"result\",\"solver\":\"pons\",\"status\":\"EXACT\","
      "\"target\":\"WDL\",\"weak\":true,\"wdl\":" << wdl << ",\"native_score\":" << score
      << ",\"nodes\":" << nodes << ",\"workers\":1}" << std::endl;
    return 0;
  } catch(const std::exception &) {
    return fail("initialization or solve threw an exception");
  }
}
