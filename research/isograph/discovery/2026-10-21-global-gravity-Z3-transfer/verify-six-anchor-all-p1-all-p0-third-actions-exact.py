#!/usr/bin/env python3
"""Exact six-anchor, seven-P1-reply, seven-P0-third-action K4/Euler closure.
Prereg: docs/research/2026-10-22-frozen-six-anchor-all-action-third-ply-boundary-rank.md
Run: python3 verify-six-anchor-all-p1-all-p0-third-actions-exact.py
No solved results, oracle, optimal lines, or full-game search.
"""
from itertools import product, combinations
from math import gcd
import json

W,H=7,6
D=((1,0),(0,1),(1,1),(1,-1))
OUT=(1,2,3,5,6,7)
K4=[]; INC=[[[] for _ in D] for _ in range(42)]
for c in range(W):
 for r in range(H):
  for d,(dx,dy) in enumerate(D):
   xy=[(c+i*dx,r+i*dy) for i in range(4)]
   if all(0<=x<W and 0<=y<H for x,y in xy):
    line=tuple(x+W*y for x,y in xy)
    K4.append((d,line))
    for e in line:INC[e][d].append(line)
assert len(K4)==69
EDIRS=[]
for e in range(42):
 ds=[d for d in range(4) if INC[e][d]]
 for k in range(1,len(ds)+1):
  EDIRS.extend((e,s) for s in combinations(ds,k))
assert len(EDIRS)==438

def ray(q,c,r,p):
 for dx,dy in D:
  n=1
  for sign in (-1,1):
   for i in range(1,4):
    x,y=c+sign*i*dx,r+sign*i*dy
    if not(0<=x<W and 0<=y<H) or q[x+W*y]!=p:break
    n+=1
  if n>=4:return True
 return False

def face(anchor):
 free=[c for c in OUT if c!=anchor]
 ans=[]
 for bits in product((0,1),repeat=5):
  word=[anchor]
  for c,b in zip(free,bits):
   if not b:word.extend((c,c))
  word.append(anchor)
  for c,b in zip(free,bits):
   if b:word.extend((c,c))
  assert len(word)==12
  q=[0]*42;h=[0]*7
  for t,c in enumerate(word):
   i=c-1;r=h[i];h[i]+=1;p=1+t%2;q[i+7*r]=p
   assert not ray(q,i,r,p)
  assert h==[2,2,2,0,2,2,2]
  assert q[anchor-1]==1 and all(q[c-1]==(1 if b else 2)
                                  for c,b in zip(free,bits))
  assert not any(all(q[z]==p for z in line) for _,line in K4
                 for p in (1,2))
  ans.append((tuple(q),tuple(h),sum(bits)%2))
 return ans

def move(state,c,p):
 if state is None:return None,0
 q,h,par=state;c-=1;r=h[c];assert r<6
 qq=list(q);hh=list(h);e=c+7*r;qq[e]=p;hh[c]+=1
 hits=sum(e in line and all(qq[z]==p for z in line) for _,line in K4)
 assert bool(hits)==ray(qq,c,r,p)
 return (None if hits else (tuple(qq),tuple(hh),par)),hits

def batch(states,c,p):
 out=[];sink=[0,0];hits=[0,0]
 for s in states:
  t,n=move(s,c,p);out.append(t)
  if n:sink[s[2]]+=1;hits[s[2]]+=n
 return out,sink,hits

def features(states):
 pats=set();h1=set();h3=set();others=set();eu=set()
 for d,line in K4:
  bins={}
  for i,s in enumerate(states):
   if s is None:continue
   key=tuple(s[0][z] for z in line)
   bins[key]=bins.get(key,0)|(1<<i)
  vs=set(bins.values());pats.update(vs)
  if d!=0:others.update(vs)
  if d==0 and line[0]//W==0:h1.update(vs)
  if d==0 and line[0]//W==2:h3.update(vs)
 for p in (1,2):
  for e,ds in EDIRS:
   m=0;col=e%W
   for i,s in enumerate(states):
    if s is None:continue
    q,h,_=s
    if h[col]>=6 or e!=col+W*h[col]:continue
    if all(any(all(z==e or q[z]==p for z in line)
                for line in INC[e][d]) for d in ds):m|=1<<i
   eu.add(m)
 return {'all':pats|eu,'K4':pats,'H1':h1,'H3':h3,
         'nonH':others,'Euler':eu}

def rankQ(masks):
 base={}
 for m in masks:
  if not m:continue
  v=[(m>>i)&1 for i in range(32)]
  for k in range(32):
   if not v[k]:continue
   if k not in base:base[k]=v;break
   b=base[k];a=v[k];bb=b[k]
   v=[bb*x-a*y for x,y in zip(v,b)]
   g=0
   for z in v:g=gcd(g,z)
   if g>1:v=[z//g for z in v]
  if len(base)==32:break
 return len(base)

def rankP(masks,p):
 base={}
 for m in masks:
  if not m:continue
  v=[(m>>i)&1 for i in range(32)]
  for k in range(32):
   if not v[k]:continue
   if k not in base:
    inv=pow(v[k],-1,p)
    base[k]=[(z*inv)%p for z in v];break
   b=base[k];t=v[k];v=[(x-t*y)%p for x,y in zip(v,b)]
  if len(base)==32:break
 return len(base)

def checked_rank(masks):
 r=rankQ(masks)
 assert r==rankP(masks,1009)==rankP(masks,10007)
 return r

def run():
 rows=[]
 for anchor in OUT:
  source=face(anchor);F0=features(source)['all'];r0=checked_rank(F0)
  after1,sink1,_=batch(source,4,1)
  V1=F0|features(after1)['all'];r1=checked_rank(V1)
  assert (r0,r1)=={1:(18,24),2:(16,22),3:(13,19),
                   5:(13,19),6:(16,22),7:(18,24)}[anchor]
  byReply=[];combined=set(V1)
  for reply in range(1,8):
   after2,sink2,_=batch(after1,reply,2)
   assert sink2==[0,0]
   V2=V1|features(after2)['all'];r2=checked_rank(V2)
   assert r2==r1
   one=[];joint=set(V2)
   for action in range(1,8):
    after3,sink3,incident3=batch(after2,action,1)
    F3=features(after3)
    r3=checked_rank(V2|F3['all'])
    gain=r3-r2
    families={key:rankQ(V2|F3[key])-r2 for key in
              ('K4','H1','H3','nonH','Euler')}
    if action!=4:assert gain==0 and sum(sink3)==0
    elif reply==4:assert gain==0
    else:
     assert gain=={1:2,2:1,3:2,5:2,6:1,7:2}[anchor]
     assert families['H1']==gain and families['Euler']==0
     assert sum(s is not None for s in after3)==13
    one.append({'P0Column':action,'rank':r3,
                'newDirections':gain,'newFamilyDirections':families,
                'P0FirstwinsParity':sink3,'P0K4IncidencesParity':incident3,
                'survivors':sum(s is not None for s in after3)})
    joint.update(F3['all']);combined.update(F3['all'])
   byReply.append({'P1Column':reply,'rankAfterP1':r2,
                    'allP0ThirdJointRank':checked_rank(joint),
                    'P0ThirdActions':one})
  rows.append({'anchor':anchor,'rank0':r0,'rankAfterFirstP0Center':r1,
               'firstP0CenterWinsParity':sink1,
               'allP1P0ThirdJointRank':checked_rank(combined),
               'P1Replies':byReply})
 for i in range(3):
  a,b=rows[i],rows[5-i]
  assert a['anchor']+b['anchor']==8
  assert a['allP1P0ThirdJointRank']==b['allP1P0ThirdJointRank']
  for j in range(7):
   x,y=a['P1Replies'][j],b['P1Replies'][6-j]
   assert x['allP0ThirdJointRank']==y['allP0ThirdJointRank']
   for k in range(7):
    u,v=x['P0ThirdActions'][k],y['P0ThirdActions'][6-k]
    assert (u['rank'],u['newDirections'],u['survivors'],
            sum(u['P0FirstwinsParity']))==(
            v['rank'],v['newDirections'],v['survivors'],
            sum(v['P0FirstwinsParity']))
 return {'schema':1,'status':'EXACT_7X6_SCOPED_ACTIONWISE_RANK',
         'rootIndependent':True,'originalK4Count':69,
         'perOwnerEulerSubsetMoments':438,
         'sourceStatesAcrossSixFaces':192,
         'individualThreePlyActionCombinations':294,
         'maintainedNodeCI':'NOT_RUN','rootWinnerTheorem':'OPEN',
         'results':rows}

if __name__=='__main__':
 print(json.dumps(run(),indent=2))
