// External benchmark adapter only. All search algorithms remain pinned upstream.
#include <chrono>
#include <iostream>
#include <stdexcept>
#include <string>
#include "solver/solver.h"
#include "benchmark-settings.h"
static_assert(BOARD_WIDTH==7 && BOARD_HEIGHT==6);
static_assert(!STRONG_SOLVES_ENABLED && NUM_THREADS==6);
static_assert(!LOAD_BOOK_FILE && !LOAD_TABLE_FILE && !UPDATE_TABLE_FILE);
static_assert(NUM_TABLE_ENTRIES==BENCH_TABLE_ENTRIES && sizeof(Entry)==8);
static_assert((NUM_TABLE_ENTRIES+1)*sizeof(Entry)<=BENCH_TT_BUDGET);
static_assert(!ENABLE_HUGE_PAGES && !ENABLE_AFFINITY);
static_assert(ENHANCED_TABLE_CUTOFF_PLIES==27 && MOVE_SCORE_JITTER==0.3f);
static_assert(Position::MIN_SCORE==-1 && Position::MAX_SCORE==1);
using Clock=std::chrono::steady_clock;
static double ms(Clock::time_point a,Clock::time_point b){return std::chrono::duration<double,std::milli>(b-a).count();}
int main(int argc,char** argv){
 const bool prepare=argc==2 && std::string(argv[1])=="--prepare-only";
 if(argc!=1&&!prepare)return 2;
 try {
  auto entry=Clock::now();
  Position pos{};Solver solver{};
  auto initialized=Clock::now();
  auto occupied=solver.benchmark_initial_nonempty_entries();
  auto workers=solver.benchmark_num_workers();
  bool empty=pos.num_moves()==0&&!pos.is_game_over();
  for(int r=0;r<BOARD_HEIGHT;r++)for(int c=0;c<BOARD_WIDTH;c++)empty=empty&&pos.get_player(r,c)==0;
  if(!empty||occupied||workers!=NUM_THREADS||solver.get_merged_stats().get_num_nodes()!=0)throw std::runtime_error("cold-state verification failed");
  auto ready=Clock::now();
  auto emit=[&](std::ostream& out){out<<"{\"event\":\"ready\",\"solver\":\"christophe\",\"root\":\"empty\",\"ply\":0,\"side_to_move\":0,\"target\":\"WDL\",\"independence_lane\":\"runtime-input-only\",\"weak\":true,\"search_started\":false,\"workers\":"<<workers
   <<",\"tt_entries\":"<<NUM_TABLE_ENTRIES<<",\"tt_allocated_entries\":"<<NUM_TABLE_ENTRIES+1<<",\"tt_bytes\":"<<(NUM_TABLE_ENTRIES+1)*sizeof(Entry)
   <<",\"tt_budget_bytes\":"<<BENCH_TT_BUDGET<<",\"initial_nonempty_entries\":0,\"initial_native_nodes\":0,\"proof_cache_capacity\":0,\"proof_cache_initial_occupied\":0,\"persisted_cache_loaded\":false,\"book_load\":false,\"table_load\":false,\"table_update\":false,\"native_affinity\":false,\"huge_pages\":false,\"initialization_ms\":"<<ms(entry,initialized)<<",\"cold_checks_ms\":"<<ms(initialized,ready)<<"}"<<std::endl;};
  emit(std::cerr);if(prepare){emit(std::cout);return 0;}
  std::cerr<<"{\"event\":\"search_start\"}"<<std::endl;
  auto start=Clock::now();Position actual_root{};auto root_ready=Clock::now();
  int score=solver.solve(actual_root);auto end=Clock::now();
  if(score<-1||score>1)throw std::runtime_error("non-WDL result");
  const auto& stats=solver.get_merged_stats();
  std::cout<<"{\"event\":\"result\",\"solver\":\"christophe\",\"status\":\"EXACT\",\"wdl\":"<<score<<",\"perspective\":\"first-player\",\"search_ms\":"<<ms(root_ready,end)<<",\"root_preparation_ms\":"<<ms(start,root_ready)<<",\"primary_ms\":"<<ms(start,end)<<",\"root_constructed_after_ready\":true,\"entry_to_result_ms\":"<<ms(entry,end)<<",\"nodes\":"<<stats.get_num_nodes()<<",\"native_search_time_ms\":"<<stats.get_search_time_ms()<<",\"workers\":6}"<<std::endl;
  return 0;
 }catch(const std::exception&){std::cerr<<"{\"event\":\"error\",\"reason\":\"cold-state or solve failure\"}"<<std::endl;return 1;}
}
