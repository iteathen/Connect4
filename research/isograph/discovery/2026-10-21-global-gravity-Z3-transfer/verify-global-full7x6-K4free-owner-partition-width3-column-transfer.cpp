// Whole-board original W7H6K4 STATIC firstwinfree owner-coloring partition.
// Exact finite-range width-three column transfer. No game tree, no Oracle,
// no historic strong28. This counts colorings only, not alternating-time
// reachable drawn games and NOT perfect-play WDL.
// Compile: g++ -O3 -std=c++20 verify-full-7x6-K4free-partition.cpp -o partition
#include <iostream>
#include <vector>
#include <array>
#include <cstdint>
#include <algorithm>
#include <numeric>
#include <bit>
#include <cassert>
using namespace std;
using Poly=array<uint64_t,43>;
static inline int ix(int a,int b,int c){return (a<<12)|(b<<6)|c;}
static inline bool eq4(int a,int b,int c,int d){return a==b&&b==c&&c==d;}
static bool verticalGood(int c){
 for(int r=0;r<=2;r++)
  if(eq4((c>>r)&1,(c>>(r+1))&1,(c>>(r+2))&1,(c>>(r+3))&1))
   return false;
 return true;
}
static bool quartetGood(int a,int b,int c,int d){
 // 12 genuine ORIGINAL H/R/F K4 windows per group of 4 columns:
 // 6 H row placements, 3 rising and 3 falling row shifts.
 for(int r=0;r<6;r++)
  if(eq4((a>>r)&1,(b>>r)&1,(c>>r)&1,(d>>r)&1))
   return false;
 for(int r=0;r<3;r++)
  if(eq4((a>>r)&1,(b>>(r+1))&1,(c>>(r+2))&1,(d>>(r+3))&1))
   return false;
 for(int r=3;r<6;r++)
  if(eq4((a>>r)&1,(b>>(r-1))&1,(c>>(r-2))&1,(d>>(r-3))&1))
   return false;
 return true;
}
static vector<int> allowed(){
 vector<int> v;
 for(int x=0;x<64;x++)if(verticalGood(x))v.push_back(x);
 return v;
}
// Transfer the exact owner-count generating polynomial over ALL 3-column
// boundary states. No full-board enumeration of 2^(6*width) colored states.
static vector<uint64_t> transfer(int width,const vector<int>&v,size_t&edges){
 vector<Poly> dp(1<<18),next(1<<18);
 auto p0=[](int a){return 6-std::popcount((unsigned)a);};
 for(int a:v)for(int b:v)for(int c:v)
  dp[ix(a,b,c)][p0(a)+p0(b)+p0(c)]++;
 edges=0;
 for(int w=4;w<=width;w++){
  for(auto &poly:next)poly.fill(0);
  for(int a:v)for(int b:v)for(int c:v){
   const auto &A=dp[ix(a,b,c)];
   bool present=false;
   for(int k=0;k<=6*(w-1);k++)if(A[k]){present=true;break;}
   if(!present)continue;
   for(int d:v){
    if(!quartetGood(a,b,c,d))continue;
    edges++;
    auto &B=next[ix(b,c,d)];
    int shift=p0(d);
    for(int k=0;k<=6*(w-1);k++)B[k+shift]+=A[k];
   }
  }
  dp.swap(next);
 }
 vector<uint64_t> coeff(6*width+1);
 for(const auto&v:dp)
  for(int k=0;k<=6*width;k++)coeff[k]+=v[k];
 return coeff;
}
static bool independentOriginalFourColumnK4Free(int a,int b,int c,int d){
 // INDEPENDENT literal 4x6 original H/V/R/F K4 generator/checker:
 // Separate from the twelve specialized quartet masks above.
 int words[4]={a,b,c,d};
 const int dc[4]={1,0,1,1},dr[4]={0,1,1,-1};
 for(int col=0;col<4;col++)for(int row=0;row<6;row++)
  for(int dir=0;dir<4;dir++){
   int owner=-1;bool valid=true,same=true;
   for(int k=0;k<4;k++){
    int x=col+dc[dir]*k,y=row+dr[dir]*k;
    if(x<0||x>=4||y<0||y>=6){valid=false;break;}
    int bit=(words[x]>>y)&1;
    if(owner>=0&&bit!=owner)same=false;
    owner=bit;
   }
   if(valid&&same)return false;
  }
 return true;
}
static vector<uint64_t> independentBruteWidth4(const vector<int>&v){
 vector<uint64_t> poly(25);
 for(int a:v)for(int b:v)for(int c:v)for(int d:v){
  if(!independentOriginalFourColumnK4Free(a,b,c,d))continue;
  int p0=24-(std::popcount((unsigned)a)+std::popcount((unsigned)b)+
       std::popcount((unsigned)c)+std::popcount((unsigned)d));
  poly[p0]++;
 }
 return poly;
}
int main(){
 auto good=allowed();assert(good.size()==48);
 size_t e4=0,e6=0,e7=0;
 auto Z4=transfer(4,good,e4);
 auto independent=independentBruteWidth4(good);
 assert(Z4==independent);
 auto Z6=transfer(6,good,e6);
 auto Z7=transfer(7,good,e7);
 for(const auto &coeff:{Z4,Z6,Z7})
  for(size_t k=0;k<coeff.size();k++)
   assert(coeff[k]==coeff[coeff.size()-1-k]);
 cout<<"{\"schema\":1,\"date\":\"2026-10-21\","
     <<"\"originalBoard\":\"true W7xH6 K4 H/V/R/F\","
     <<"\"scope\":\"STATIC completely filled physical owner colorings only; excludes neither alternating reachability nor previous firstwins because final contains no K4; not full-game WDL\","
     <<"\"validSixBitFullColumnOwnerWords\":"<<good.size()<<","
     <<"\"independentW4OriginalK4BrutePass\":true,"
     <<"\"results\":[";
 for(int w:{4,6,7}){
  const auto& coeff=(w==4?Z4:w==6?Z6:Z7);
  uint64_t total=accumulate(coeff.begin(),coeff.end(),uint64_t(0));
  cout<<(w==4?"":",")<<"{\"width\":"<<w
      <<",\"originalK4WindowCount\":"<<3*w+12*(w-3)
      <<",\"K4FreeFullOwnerColorings\":"<<total
      <<",\"balancedK4FreeFullOwnerColorings\":"<<coeff[3*w]
      <<",\"ownerCountDistribution\":[";
  for(size_t k=0;k<coeff.size();k++)
   cout<<(k?",":"")<<coeff[k];
  cout<<"]}";
 }
 cout<<"],\"emptyRootPerfectWinnerProved\":false}"<<endl;
}
