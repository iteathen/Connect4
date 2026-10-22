// Independent original7x6 physical K4 check of the JS width3 tensor.
// Explicitly enumerate the 69 windows, and forbid complete windows when
// adding the rightmost column of each window; no optimized H/R/F bit formula.
// Verify the JS static partition Z and four exact pinned-site marginals.
// This is a STATIC hypothetical binary-site field, not gravity/gameplay.
// g++ -O3 -std=c++17 verify-original7x6-K4-Boolean-pivotality-explicit69.cpp -o verify
#include <array>
#include <vector>
#include <iostream>
#include <cassert>
#include <utility>
using namespace std;
struct Cell {int col,row;};
struct Window {array<Cell,4> t;};
constexpr int W=7,H=6,SPACE=1<<18;
vector<Window> last[W];
void init(){
 const int steps[4][2]={{1,0},{0,1},{1,1},{1,-1}};
 int total=0;
 for(int r=0;r<H;r++)for(int c=0;c<W;c++)for(const auto &step:steps){
  Window win;bool fit=true;int right=0;
  for(int i=0;i<4;i++){
   int cc=c+i*step[0],rr=r+i*step[1];
   if(cc<0||cc>=W||rr<0||rr>=H){fit=false;break;}
   win.t[i]={cc,rr};if(cc>right)right=cc;
  }
  if(fit){last[right].push_back(win);total++;}
 }
 assert(total==69);
}
inline bool valid(int i,int s,int d){
 const unsigned char bits[4]={(unsigned char)d,(unsigned char)(s&63),(unsigned char)((s>>6)&63),(unsigned char)(s>>12)};
 for(const Window &w:last[i]){
  bool has=true;
  for(int j=0;j<4;j++){
   const auto &t=w.t[j];
   if((bits[i-t.col]&(1<<t.row))==0){has=false;break;}
  }
  if(has)return false;
 }
 return true;
}
long long calc(int fixCol=-1,int fixRow=-1,int fixBit=-1){
 static long long a[SPACE],b[SPACE];
 for(int s=0;s<SPACE;s++)a[s]=0;a[0]=1;
 for(int i=0;i<W;i++){
  for(int s=0;s<SPACE;s++)b[s]=0;
  for(int s=0;s<SPACE;s++)if(a[s]){
   for(int d=0;d<64;d++){
    if(i==fixCol&&((d>>fixRow)&1)!=fixBit)continue;
    if(!valid(i,s,d))continue;
    b[((s&4095)<<6)|d]+=a[s];
   }
  }
  for(int s=0;s<SPACE;s++)a[s]=b[s];
 }
 long long n=0;for(long long v:a)n+=v;return n;
}
int main(){
 init();
 long long Z=calc();
 assert(Z==439428365759LL);
 cout<<"Z="<<Z<<"\n";
 const vector<pair<int,int>> spots={{3,2},{3,0},{0,0},{2,2}};
 const long long expected[]={149598088717LL,111434791827LL,36789765449LL,127272240843LL};
 int k=0;
 for(auto [col,row]:spots){
  const long long n0=calc(col,row,0),n1=calc(col,row,1);
  assert(n0+n1==Z&&n0-n1==expected[k++]);
  cout<<"c="<<col+1<<",r="<<row+1<<",n0="<<n0<<",n1="<<n1<<",pivot="<<n0-n1<<"\n";
 }
 cout<<"INDEPENDENT_EXPLICIT_69_K4_STATIC_TRANSFER_PASS\n";
}