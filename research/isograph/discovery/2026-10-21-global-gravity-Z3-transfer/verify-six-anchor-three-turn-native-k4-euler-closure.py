#!/usr/bin/env python3
"""Exact independent original 7x6 three-turn action-indexed K4/Euler rank control.
No solved games, no minimax, no historical optimal opening.
Python 3.8+: python verify-six-anchor-three-turn-native-k4-euler-closure.py
"""
from itertools import product, combinations
from math import gcd
import json

W,H=7,6
D=((1,0),(0,1),(1,1),(1,-1))
OUT=(1,2,3,5,6,7)
K4=[]
INC=[[[] for _ in D] for _ in range(W*H)]
for x in range(W):
 for y in range(H):
  for d,(dx,dy) in enumerate(D):
   pts=tuple(x+i*dx+W*(y+i*dy) for i in range(4)
     if 0<=x+i*dx<W and 0<=y+i*dy<H)
   if len(pts)==4:
    K4.append((d,pts))
    for e in pts:INC[e][d].append(pts)
assert len(K4)==69

def ray(q,c,r,p):
 for dx,dy in D:
  n=1
  for sign in (-1,1):
   for i in range(1,4):
    xx=c+sign*i*dx;yy=r+sign*i*dy
    if not(0<=xx<W and 0<=yy<H) or q[xx+W*yy]!=p:break
    n+=1
  if n>=4:return True
 return False

def face(anchor):
 free=[c for c in OUT if c!=anchor]
 a=[]
 for bits in product((0,1),repeat=5):
  word=[anchor]
  for c,b in zip(free,bits):
   if not b:word.extend((c,c))
  word.append(anchor)
  for c,b in zip(free,bits):
   if b:word.extend((c,c))
  assert len(word)==12
  q=[0]*42;h=[0]*7
  for t,move in enumerate(word):
   col=move-1;r=h[col];h[col]+=1;p=1+t%2
   q[col+W*r]=p
   assert not ray(q,col,r,p)
   assert not any(all(q[e]==p for e in line) for _,line in K4)
  assert h==[2,2,2,0,2,2,2]
  y=tuple(int(q[c-1]==1) for c in OUT)
  assert y[OUT.index(anchor)]==1
  assert all(y[OUT.index(c)]==b for c,b in zip(free,bits))
  a.append((q,h,sum(bits)%2,y))
 return a

def move(s,column,p):
 if s is None:return None,0
 q,h,par,y=s;c=column-1;r=h[c];assert r<H
 q=q.copy();h=h.copy();h[c]+=1;e=c+W*r;q[e]=p
 hits=sum(e in cells and all(q[j]==p for j in cells) for _,cells in K4)
 assert bool(hits)==ray(q,c,r,p)
 return (None if hits else (q,h,par,y)),hits

def feat(states):
 pat=set();patH1=set();patDirs=[set() for _ in D];eu=set();slots=0
 for d,cells in K4:
  p={}
  for i,s in enumerate(states):
   if s is None:continue
   key=tuple(s[0][e] for e in cells)
   p[key]=p.get(key,0)|(1<<i)
  vs=set(p.values());pat|=vs;patDirs[d]|=vs
  if d==0 and cells[0]//W==0:patH1|=vs
 for owner in (1,2):
  for e in range(42):
   dirs=[d for d in range(4) if INC[e][d]]
   for length in range(1,len(dirs)+1):
    for ds in combinations(dirs,length):
     slots+=1;m=0
     for i,s in enumerate(states):
      if s is None:continue
      q,h,par,y=s;c=e%W
      if h[c]>=H or e!=c+W*h[c]:continue
      if all(any(all(j==e or q[j]==owner for j in cells)
                 for cells in INC[e][d]) for d in ds):m|=1<<i
     eu.add(m)
 assert slots==876
 return {'all':pat|eu,'K4':pat,'H1':patH1,'dir':patDirs,'Euler':eu}

def rankQ(masks):
 bases={}
 for m in masks:
  a=[(m>>i)&1 for i in range(32)]
  for j in range(32):
   if not a[j]:continue
   if j in bases:
    b=bases[j];av=a[j];bv=b[j]
    a=[bv*x-av*z for x,z in zip(a,b)]
    g=0
    for x in a:g=gcd(g,x)
    if g>1:a=[x//g for x in a]
   else:bases[j]=a;break
 return len(bases)

def rankmod(masks,p):
 bases={}
 for m in masks:
  a=[(m>>i)&1 for i in range(32)]
  for j in range(32):
   if not a[j]:continue
   if j in bases:
    b=bases[j];x=a[j]
    a=[(u-x*v)%p for u,v in zip(a,b)]
   else:
    inv=pow(a[j],-1,p)
    bases[j]=[u*inv%p for u in a];break
 return len(bases)

def run(y,v):return any(all(y[j+k]==v for k in range(3)) for j in range(4))
allSafe=sum(not run([(m>>i)&1 for i in range(6)],0)
   and not run([(m>>i)&1 for i in range(6)],1) for m in range(64))
assert allSafe==26

result=[]
for anchor in OUT:
 source=face(anchor);F0=feat(source);r0=rankQ(F0['all'])
 p0=[];sink0=[0,0]
 for s in source:
  q,hit=move(s,4,1);p0.append(q)
  if hit:sink0[s[2]]+=1
 F1=feat(p0);V01=F0['all']|F1['all'];r01=rankQ(V01)
 assert r01-r0==6
 rows=[];allThird=set(V01)
 for reply in range(1,8):
  p1=[];sink1=[0,0]
  for s in p0:
   q,hit=move(s,reply,2);p1.append(q)
   if hit:sink1[s[2]]+=1
  assert sink1==[0,0]
  F2=feat(p1);V012=V01|F2['all'];r012=rankQ(V012)
  assert r012==r01
  p0second=[];sink2=[0,0];inc2=[0,0]
  for s in p1:
   q,hit=move(s,4,1);p0second.append(q)
   if hit:
    sink2[s[2]]+=1
    inc2[s[2]]+=hit
   if s is not None and reply!=4:
    assert bool(hit)==run(s[3],0)
  F3=feat(p0second);V0123=V012|F3['all']
  rr=rankQ(V0123)
  assert rr==rankmod(V0123,1009)==rankmod(V0123,10007)
  dK4=rankQ(V012|F3['K4'])-r012
  dH1=rankQ(V012|F3['H1'])-r012
  dE=rankQ(V012|F3['Euler'])-r012
  living=sum(s is not None for s in p0second)
  if reply!=4:
   assert living==13 and sum(sink0)+sum(sink2)==19
   assert dH1==rr-r012
  else:
   assert sink2==[0,0] and living==32-sum(sink0)
  # The scalar terminal emission is already visible before the new censor.
  u=0;s=0;before=0
  for i,t in enumerate(source):
   y=t[3]
   if not run(y,1):
    before|=1<<i
    if run(y,0):u|=1<<i
    else:s|=1<<i
  assert rankQ(V012|{u,s,before})==r012
  allThird|=F3['all']
  rows.append({
    'P1Column':reply,'rankAfterP1':r012,'rankAfterP0Third':rr,
    'newDirectionsAfterP1':r012-r01,'newDirectionsAfterThird':rr-r012,
    'thirdK4OnlyNew':dK4,'thirdHRow1OnlyNew':dH1,'thirdEulerOnlyNew':dE,
    'P1Firstwins':[0,0],'P0ThirdFirstwinsParity':sink2,
    'P0ThirdK4IncidencesParity':inc2,'thirdLiveStates':living,
    'secondCenterWinAndLiveMasksAlreadyInPriorSpan':True})
 together=rankQ(allThird)
 assert together==rankmod(allThird,1009)==rankmod(allThird,10007)
 result.append({'anchor':anchor,'initialNativeRank':r0,
  'afterP0CenterRank':r01,'P0CenterFirstwinsParity':sink0,
  'allP1AndP0ThirdCollectiveRank':together,'responses':rows})

for a,b in zip(result[:3],reversed(result[3:])):
 assert a['anchor']+b['anchor']==8
 assert (a['initialNativeRank'],a['afterP0CenterRank'],a['allP1AndP0ThirdCollectiveRank'])==(
     b['initialNativeRank'],b['afterP0CenterRank'],b['allP1AndP0ThirdCollectiveRank'])
 for i in range(7):
  x=a['responses'][i];y=b['responses'][6-i]
  assert (x['rankAfterP0Third'],x['newDirectionsAfterThird'],sum(x['P0ThirdFirstwinsParity']))==(
      y['rankAfterP0Third'],y['newDirectionsAfterThird'],sum(y['P0ThirdFirstwinsParity']))
for a in result:
 assert a['allP1AndP0ThirdCollectiveRank']==a['responses'][0]['rankAfterP0Third']
out={
 'status':'PASS_ORIGINAL7X6_TWO_AND_THREE_TURN_RATIONAL_GF1009_GF10007',
 'source':'original physical 69 K4 + independent rays, no solved result',
 'sourceLegalRank12Constructions':192,'sixAnchors':6,'eachP1ActionChecked':7,
 'ownerEulerSlotsPerField':876,
 'FibonacciNo000No111SixBits':allSafe,'fixedAnchorSurvivors':13,
 'residualWitness':'bottom-row horizontal K4 patterns unchanged in physical board; twice-surviving mass B*(1-L)*(1-U)',
 'results':result,
 'globalRootGameProved':False,
 'maintainedCI':'NOT_RUN'
}
print(json.dumps(out,indent=2))
