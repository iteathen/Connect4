#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <sstream>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "solver/position.h"
#include "solver/settings.h"
#include "solver/solver.h"

struct Line {
    std::array<std::pair<int,int>,4> cells; // row,col
    const char* kind;
};

static std::vector<Line> make_lines() {
    std::vector<Line> v;
    auto add=[&](int r,int c,int dr,int dc,const char* k){
        Line L{}; L.kind=k;
        for(int i=0;i<4;i++) L.cells[i]={r+i*dr,c+i*dc};
        v.push_back(L);
    };
    for(int r=0;r<BOARD_HEIGHT;r++) for(int c=0;c<BOARD_WIDTH;c++){
        if(c+3<BOARD_WIDTH) add(r,c,0,1,"H");
        if(r+3<BOARD_HEIGHT) add(r,c,1,0,"V");
        if(c+3<BOARD_WIDTH&&r+3<BOARD_HEIGHT) add(r,c,1,1,"D+");
        if(c+3<BOARD_WIDTH&&r-3>=0) add(r,c,-1,1,"D-");
    }
    return v;
}

static std::string sig(const Line& L, bool mirror=false) {
    std::array<int,4> a{};
    for(int i=0;i<4;i++){
        int r=L.cells[i].first,c=L.cells[i].second;
        if(mirror)c=BOARD_WIDTH-1-c;
        a[i]=r*BOARD_WIDTH+c;
    }
    std::sort(a.begin(),a.end());
    std::ostringstream s;
    for(int x:a)s<<x<<',';
    return s.str();
}

static uint64_t fingerprint(Position& p){
    uint64_t k=0,m=1;
    for(int r=0;r<BOARD_HEIGHT;r++) for(int c=0;c<BOARD_WIDTH;c++){
        int q=p.get_player(r,c);
        uint64_t d=q==-1?1:(q==1?2:0);
        k+=d*m; m*=3;
    }
    return k;
}

static bool has_cell(const Line& L,int r,int c){
    for(auto [rr,cc]:L.cells) if(rr==r&&cc==c) return true;
    return false;
}

static int landing_row(Position& p,int col){
    for(int r=0;r<BOARD_HEIGHT;r++) if(p.get_player(r,col)==0) return r;
    return -1;
}

static bool target_possible(Position& p,const Line& L){
    for(auto [r,c]:L.cells) if(p.get_player(r,c)==-1) return false;
    return true;
}

static bool target_complete_for_second(Position& p,const Line& L){
    for(auto [r,c]:L.cells) if(p.get_player(r,c)!=1) return false;
    return true;
}

static std::string moves_string(const std::vector<int>& v);\n\nclass Finder {
public:
    Finder(): lines(make_lines()) {}

    bool find(int target,std::vector<int>& witness,double seconds){
        Position root{};
        dead.clear(); calls=0; timed_out=false;
        deadline=std::chrono::steady_clock::now()+std::chrono::milliseconds((long long)(seconds*1000));
        std::vector<int> path;
        bool ok=dfs(root,target,path);
        if(ok) witness=path;
        return ok;
    }

    bool validate(const std::vector<int>& path,int target){
        Position p{};
        std::cerr<<"VALIDATE target="<<target<<" length="<<path.size()<<" path="<<moves_string(path)<<"\\n";
        for(size_t ply=0;ply<path.size();ply++){
            if(p.is_game_over()){std::cerr<<"FAIL early-gameover before ply "<<(ply+1)<<"\\n";return false;}
            int best=solver.solve(p), col=path[ply];
            if(!p.is_move_valid(col)){std::cerr<<"FAIL illegal ply "<<(ply+1)<<" col "<<col<<"\\n";return false;}
            board before=p.move(col);
            int mv=-solver.solve(p,-best,-best+1);
            if(mv<best){std::cerr<<"FAIL nonoptimal ply "<<(ply+1)<<" best "<<best<<" mv "<<mv<<"\\n";p.unmove(before);return false;}
            if(ply+1<path.size() && p.is_game_over()){std::cerr<<"FAIL terminal-at ply "<<(ply+1)<<"\\n";p.unmove(before);return false;}
        }
        bool len=path.size()==(size_t)(BOARD_WIDTH*BOARD_HEIGHT);
        bool over=p.is_game_over(), draw=p.is_draw(), targetok=target_complete_for_second(p,lines[target]);
        if(!(len&&over&&!draw&&targetok))
            std::cerr<<"FAIL final len="<<len<<" over="<<over<<" draw="<<draw<<" target="<<targetok<<" moves="<<p.num_moves()<<"\\n";
        return len&&over&&!draw&&targetok;
    }

    const std::vector<Line>& get_lines() const { return lines; }
    uint64_t get_calls() const { return calls; }
    bool timeout() const { return timed_out; }

private:
    bool dfs(Position& p,int target,std::vector<int>& path){
        if((++calls & 1023)==0 && std::chrono::steady_clock::now()>deadline){
            timed_out=true; return false;
        }
        const Line& L=lines[target];
        if(!target_possible(p,L)) return false;
        if(p.is_game_over()){
            if(p.num_moves()==BOARD_WIDTH*BOARD_HEIGHT && target_complete_for_second(p,L)) return true;
            return false;
        }

        uint64_t key=fingerprint(p);
        if(dead.count(key)) return false;

        int best=solver.solve(p);
        struct M{int c,r,prio;};
        std::vector<M> ms;
        bool first=(p.num_moves()%2)==0;
        for(int c=0;c<BOARD_WIDTH;c++) if(p.is_move_valid(c)){
            int r=landing_row(p,c);
            if(first && has_cell(L,r,c)) continue; // target would be poisoned
            int prio=0;
            if(!first && has_cell(L,r,c)) prio=2;
            else if(first && !has_cell(L,r,c)) prio=1;
            ms.push_back({c,r,prio});
        }
        std::stable_sort(ms.begin(),ms.end(),[](const M&a,const M&b){return a.prio>b.prio;});

        for(auto m:ms){
            board before=p.move(m.c);
            if(!target_possible(p,L)){p.unmove(before);continue;}
            int mv=-solver.solve(p,-best,-best+1);
            if(mv>=best){
                path.push_back(m.c);
                if(dfs(p,target,path)) { p.unmove(before); return true; }
                path.pop_back();
                if(timed_out){p.unmove(before);return false;}
            }
            p.unmove(before);
        }
        dead.insert(key);
        return false;
    }

    Solver solver;
    std::vector<Line> lines;
    std::unordered_set<uint64_t> dead;
    std::chrono::steady_clock::time_point deadline;
    uint64_t calls=0;
    bool timed_out=false;
};

static std::string moves_string(const std::vector<int>& v){
    std::string s; for(int c:v)s.push_back(char('0'+c)); return s;
}
static std::vector<int> reflect_moves(const std::vector<int>& v){
    std::vector<int> r=v; for(int& c:r)c=BOARD_WIDTH-1-c; return r;
}

int main(int argc,char** argv){
    static_assert(BOARD_WIDTH==6 && BOARD_HEIGHT==6);
    Finder f;
    const auto& lines=f.get_lines();
    std::unordered_map<std::string,int> bysig;
    for(size_t i=0;i<lines.size();i++) bysig[sig(lines[i])]=(int)i;
    std::vector<int> candidates,reps;
    for(size_t i=0;i<lines.size();i++){
        bool top=false; for(auto [r,c]:lines[i].cells) if(r==BOARD_HEIGHT-1) top=true;
        if(top)candidates.push_back((int)i);
    }
    for(int id:candidates){
        int mid=bysig.at(sig(lines[id],true));
        if(id<=mid) reps.push_back(id);
    }
    if(argc!=2){std::cerr<<"need representative index 0.."<<reps.size()-1<<"\n";return 5;}
    int ri=std::stoi(argv[1]);
    if(ri<0||ri>=(int)reps.size())return 6;
    int id=reps[ri],mid=bysig.at(sig(lines[id],true));
    std::vector<int> w;
    bool ok=f.find(id,w,150.0);
    std::cout<<"REP_INDEX "<<ri<<"\n";
    std::cout<<"LINE "<<id<<" MIRROR "<<mid<<" KIND "<<lines[id].kind<<"\n";
    std::cout<<"OK "<<ok<<" TIMEOUT "<<f.timeout()<<" DFS_CALLS "<<f.get_calls()<<"\n";
    if(!ok) return f.timeout()?2:7;
    if(!f.validate(w,id)){std::cerr<<"VALIDATION_FAILED\n";return 3;}
    auto rw=reflect_moves(w);
    if(!f.validate(rw,mid)){std::cerr<<"REFLECTION_VALIDATION_FAILED\n";return 4;}
    std::cout<<"WEIGHT "<<(id==mid?1:2)<<"\n";
    std::cout<<"WITNESS "<<moves_string(w)<<"\n";
    std::cout<<"REFLECTED "<<moves_string(rw)<<"\n";
    std::cout<<"CELLS";
    for(auto [r,col]:lines[id].cells) std::cout<<" ("<<col+1<<","<<r+1<<")";
    std::cout<<"\n";
    return 0;
}
