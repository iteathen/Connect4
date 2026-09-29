#include <array>
#include <cstdint>
#include <iostream>
#include <random>
#include <string>
#include <vector>

#include "solver/position.h"
#include "solver/settings.h"
#include "solver/solver.h"

static int landing_row(Position& p,int col){
    for(int r=0;r<BOARD_HEIGHT;r++) if(p.get_player(r,col)==0) return r;
    return -1;
}
static bool target_cell(int r,int c){ return c==0 && r>=2 && r<=5; }
static bool target_possible(Position& p){
    for(int r=2;r<=5;r++) if(p.get_player(r,0)==-1) return false;
    return true;
}
static bool target_complete(Position& p){
    for(int r=2;r<=5;r++) if(p.get_player(r,0)!=1) return false;
    return true;
}
static std::string str(const std::vector<int>& p){
    std::string s; for(int c:p)s.push_back(char('0'+c)); return s;
}

static bool validate(Solver& solver,const std::vector<int>& path){
    Position p{};
    for(size_t i=0;i<path.size();i++){
        if(p.is_game_over()) return false;
        int best=solver.solve(p), c=path[i];
        if(!p.is_move_valid(c)) return false;
        board before=p.move(c);
        int mv=-solver.solve(p,-best,-best+1);
        if(mv<best){p.unmove(before);return false;}
        if(i+1<path.size() && p.is_game_over()){p.unmove(before);return false;}
    }
    return path.size()==36 && p.is_game_over() && p.has_opponent_won() && target_complete(p);
}

int main(){
    static_assert(BOARD_WIDTH==6 && BOARD_HEIGHT==6);
    Solver solver;
    std::mt19937_64 rng(0x6f757465725636ULL);

    for(int attempt=0;attempt<12000;attempt++){
        Position p{};
        std::vector<int> path;
        bool dead=false;
        while(!p.is_game_over()){
            int best=solver.solve(p);
            bool first=(p.num_moves()%2)==0;
            struct Opt{int c;int r;int weight;};
            std::vector<Opt> opts;
            int total=0;
            for(int c=0;c<6;c++) if(p.is_move_valid(c)){
                int r=landing_row(p,c);
                if(first && target_cell(r,c)) continue;
                board before=p.move(c);
                if(!target_possible(p)){p.unmove(before);continue;}
                int mv=-solver.solve(p,-best,-best+1);
                p.unmove(before);
                if(mv<best) continue;
                int w=1;
                if(!first && target_cell(r,c)) w=(attempt<6000?40:5);
                else if(first && c!=0) w=(attempt<6000?4:2);
                else if(!first && c!=0) w=2;
                opts.push_back({c,r,w}); total+=w;
            }
            if(opts.empty()){dead=true;break;}
            std::uniform_int_distribution<int> pick(1,total);
            int x=pick(rng), chosen=opts.back().c;
            for(auto o:opts){x-=o.weight;if(x<=0){chosen=o.c;break;}}
            p.move(chosen); path.push_back(chosen);
        }
        if(!dead && p.num_moves()==36 && p.has_opponent_won() && target_complete(p)){
            if(!validate(solver,path)){std::cerr<<"candidate validation failed\n";return 3;}
            std::cout<<"FOUND attempt="<<attempt<<"\n";
            std::cout<<"WITNESS "<<str(path)<<"\n";
            std::vector<int> refl=path; for(int& c:refl)c=5-c;
            if(!validate(solver,path)) return 4;
            std::cout<<"REFLECTED "<<str(refl)<<"\n";
            return 0;
        }
        if((attempt+1)%1000==0) std::cout<<"ATTEMPTS "<<(attempt+1)<<"\n";
    }
    std::cout<<"NO_WITNESS_IN_SAMPLE\n";
    return 2;
}
