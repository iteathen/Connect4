#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

#include "Solver.hpp"

using GameSolver::Connect4::Position;
using GameSolver::Connect4::Solver;

namespace {
constexpr int W = 7, H = 6, CELLS = 42;

struct Line { std::array<int,4> cells; std::string kind; std::string name; };
struct Board {
  std::array<int8_t,CELLS> cell;
  std::array<uint8_t,W> height;
  int ply;
  Board(): ply(0) { cell.fill(-1); height.fill(0); }
};
struct Mask { uint64_t lo=0, hi=0; };

Mask merge(Mask a, Mask b) { return {a.lo | b.lo, a.hi | b.hi}; }
void add(Mask& m, int id) { if (id < 64) m.lo |= 1ULL << id; else m.hi |= 1ULL << (id-64); }
bool has(Mask m, int id) { return id < 64 ? ((m.lo >> id)&1ULL) : ((m.hi >> (id-64))&1ULL); }

std::vector<Line> makeLines() {
  std::vector<Line> out;
  auto push=[&](std::array<int,4> c,std::string kind,std::string name){ std::sort(c.begin(),c.end()); out.push_back({c,kind,name}); };
  for(int r=0;r<H;r++) for(int c=0;c<=W-4;c++) push({r*W+c,r*W+c+1,r*W+c+2,r*W+c+3},"horizontal","H:r"+std::to_string(r+1)+":c"+std::to_string(c+1)+"-"+std::to_string(c+4));
  for(int c=0;c<W;c++) for(int r=0;r<=H-4;r++) push({r*W+c,(r+1)*W+c,(r+2)*W+c,(r+3)*W+c},"vertical","V:c"+std::to_string(c+1)+":r"+std::to_string(r+1)+"-"+std::to_string(r+4));
  for(int r=0;r<=H-4;r++) for(int c=0;c<=W-4;c++) push({r*W+c,(r+1)*W+c+1,(r+2)*W+c+2,(r+3)*W+c+3},"diag_up","D+:r"+std::to_string(r+1)+"c"+std::to_string(c+1));
  for(int r=3;r<H;r++) for(int c=0;c<=W-4;c++) push({r*W+c,(r-1)*W+c+1,(r-2)*W+c+2,(r-3)*W+c+3},"diag_down","D-:r"+std::to_string(r+1)+"c"+std::to_string(c+1));
  if(out.size()!=69) throw std::runtime_error("line universe drift");
  return out;
}

class Run {
 public:
  Run(const std::string& book): lines_(makeLines()), started_(std::chrono::steady_clock::now()) { solver_.loadBook(book); }
  int run() {
    Position root; Board board;
    Mask result=dfs(root,board);
    int total=0,h=0,v=0,du=0,dd=0;
    for(int i=0;i<69;i++) if(has(result,i)) {
      total++;
      if(lines_[i].kind=="horizontal")h++;
      else if(lines_[i].kind=="vertical")v++;
      else if(lines_[i].kind=="diag_up")du++;
      else dd++;
    }
    auto ms=std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now()-started_).count();
    std::cout<<"STRONG_DAG_SUPPORT count="<<total<<" horizontal="<<h<<" vertical="<<v<<" diag_up="<<du<<" diag_down="<<dd<<" states="<<memo_.size()<<" oracle_calls="<<oracleCalls_<<" elapsed_ms="<<ms<<"\n";
    std::cout<<"STRONG_DAG_IDS ids=";
    bool first=true;
    for(int i=0;i<69;i++) if(has(result,i)){ if(!first)std::cout<<','; first=false; std::cout<<i<<':'<<lines_[i].name; }
    std::cout<<"\n";
    return 0;
  }
 private:
  Solver solver_;
  std::vector<Line> lines_;
  std::unordered_map<uint64_t,Mask> memo_;
  uint64_t oracleCalls_=0;
  std::chrono::steady_clock::time_point started_;

  bool complete(const Line& line,const Board& b,int player) const { for(int x:line.cells) if(b.cell[x]!=player)return false; return true; }
  Mask terminalMask(const Board& b,int player) const { Mask m; for(int i=0;i<69;i++) if(complete(lines_[i],b,player)) add(m,i); return m; }

  Mask dfs(const Position& p, Board& b) {
    uint64_t key=static_cast<uint64_t>(p.key());
    auto it=memo_.find(key); if(it!=memo_.end()) return it->second;
    auto scores=solver_.analyze(p); oracleCalls_++;
    int best=-2000; for(int s:scores) if(s!=Solver::INVALID_MOVE) best=std::max(best,s);
    if(best==-2000) throw std::runtime_error("nonterminal state has no legal score");
    Mask out;
    int mover=b.ply&1;
    for(int c=0;c<W;c++) {
      if(scores[c]!=best || b.height[c]>=H) continue;
      int r=b.height[c], cell=r*W+c;
      bool win=p.isWinningMove(c);
      b.cell[cell]=static_cast<int8_t>(mover); b.height[c]++; b.ply++;
      if(win) {
        if(mover!=0) throw std::runtime_error("strong-optimal root path reached second-player win");
        out=merge(out,terminalMask(b,0));
      } else {
        Position child=p; child.playCol(c); out=merge(out,dfs(child,b));
      }
      b.ply--; b.height[c]--; b.cell[cell]=-1;
    }
    memo_.emplace(key,out);
    if((memo_.size()%1000000)==0) std::cerr<<"PROGRESS states="<<memo_.size()<<" oracle_calls="<<oracleCalls_<<"\n";
    return out;
  }
};
}

int main(int argc,char** argv){
  if(argc!=2){ std::cerr<<"usage: strong-dag-winset-support <7x6.book>\n"; return 2; }
  try { Run r(argv[1]); return r.run(); }
  catch(const std::exception& e){ std::cerr<<"ERROR: "<<e.what()<<"\n"; return 1; }
}
