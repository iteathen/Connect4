/* Benchmark adapter only; upstream files are supplied by the build include path.
 * No position sequence or expected solved result is an input to this executable.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>

/* Preserve native progress reporting, but reserve stdout for wrapper JSON. */
static int c4_native_printf(const char *format, ...) {
  int result;
  va_list args;
  va_start(args, format);
  result = vfprintf(stderr, format, args);
  va_end(args);
  return result;
}
#define printf c4_native_printf
#define main c4_unused_upstream_main
#include "SearchGame.c"
#undef main
#undef printf

static int fail(const char *reason) {
  fprintf(stderr, "{\"event\":\"error\",\"solver\":\"fhourstones-c\",\"reason\":\"%s\"}\n", reason);
  return 2;
}

static void ready(FILE *stream, int prepare_only) {
  fprintf(stream,
    "{\"event\":\"ready\",\"solver\":\"fhourstones-c\","
    "\"prepare_only\":%s,\"search_started\":false,\"start\":\"empty\","
    "\"ply\":0,\"side_to_move\":0,\"target\":\"WDL\",\"workers\":1,"
    "\"tt_records\":%d,\"tt_score_slots\":%llu,\"tt_record_bytes\":%llu,"
    "\"tt_bytes\":%llu,\"tt_initial_occupied\":0,\"tt_initial_nonzero_fields\":0,"
    "\"proof_cache_capacity\":0,\"proof_cache_initial_occupied\":0,"
    "\"opening_book_loaded\":false,\"persisted_cache_loaded\":false,"
    "\"start_position_code\":%llu}\n",
    prepare_only ? "true" : "false", TRANSIZE,
    (unsigned long long)TRANSIZE * 2,
    (unsigned long long)sizeof(hashentry),
    (unsigned long long)TRANSIZE * sizeof(hashentry),
    (unsigned long long)positioncode());
  fflush(stream);
}

int main(int argc, char **argv) {
  int i, p, result, wdl, prepare_only = 0;
  unsigned long long occupied = 0, nonzero = 0;
  if(argc == 2 && strcmp(argv[1], "--prepare-only") == 0) prepare_only = 1;
  else if(argc != 1) return fail("only --prepare-only is accepted");
  if(WIDTH != 7 || HEIGHT != 6 || SIZE1 > 8 * sizeof(bitboard))
    return fail("unexpected board or carrier");
  if(TRANSIZE < ((bitboard)1 << (SIZE1 - LOCKSIZE)) * 31 / 32)
    return fail("upstream transposition capacity guard failed");

  trans_init();
  reset();
  emptyTT();
  for(i = 0; i < TRANSIZE; ++i) {
    occupied += (ht[i].bigscore != UNKNOWN) + (ht[i].newscore != UNKNOWN);
    nonzero += (ht[i].biglock != 0) + (ht[i].newlock != 0) +
      (ht[i].bigwork != 0) + (ht[i].bigscore != 0) + (ht[i].newscore != 0);
  }
  if(occupied || nonzero || posed || nodes || nplies || color[0] || color[1]) {
    free(ht); return fail("initial table or root was not empty");
  }
  for(i = 0; i < WIDTH; ++i) if(height[i] != H1 * i) {
    free(ht); return fail("initial gravity heights invalid");
  }
  for(p = 0; p < 2; ++p) for(i = 0; i < SIZE1; ++i) if(history[p][i]) {
    free(ht); return fail("initial history was nonzero");
  }
  ready(stderr, prepare_only);
  if(prepare_only) { ready(stdout, 1); free(ht); return 0; }

  /* solve() owns native history initialization, BOOKPLY/REPORTPLY and timing. */
  fprintf(stderr, "{\"event\":\"search_start\"}\n"); fflush(stderr);
  result = solve();
  if(result != LOSS && result != DRAW && result != WIN) {
    free(ht); return fail("root returned a bound rather than exact WDL");
  }
  wdl = result == WIN ? 1 : result == LOSS ? -1 : 0;
  if(nplies || color[0] || color[1]) {
    free(ht); return fail("solve did not restore root");
  }
  free(ht);
  printf("{\"event\":\"result\",\"solver\":\"fhourstones-c\","
    "\"status\":\"EXACT\",\"target\":\"WDL\",\"wdl\":%d,"
    "\"native_score\":%d,\"nodes\":%llu,\"tt_store_calls\":%llu,"
    "\"native_user_cpu_ms_plus_one\":%llu,\"workers\":1}\n",
    wdl, result, (unsigned long long)nodes, (unsigned long long)posed,
    (unsigned long long)msecs);
  return 0;
}
