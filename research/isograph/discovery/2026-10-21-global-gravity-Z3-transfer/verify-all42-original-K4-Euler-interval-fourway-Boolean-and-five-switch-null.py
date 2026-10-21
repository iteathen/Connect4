#!/usr/bin/env python3
"""ORIGINAL 7x6 Connect4 four-direction FIRSTWIN Euler-interval factorization.
Exact naive source Boolean inclusion-exclusion checked against four local
orientation Euler factors for ALL42 physical landing cells; no solver data.
Includes valid five-switch parity null with ALL Z3 owner marginals <=4 equal.
"""
from itertools import combinations,product
from collections import Counter,defaultdict
from math import comb
import json,random
W,H=7,6
D=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))
lines=[]
for c in range(W):
 for r in range(H):
  for ori,dx,dy in D:
   pts=tuple((c+i*dx,r+i*dy) for i in range(4))
   if all(0<=x<W and 0<=y<H for x,y in pts):
    lines.append((ori,(c,r),tuple(x+W*y for x,y in pts)))
assert len(lines)==69
def join(values):
 o=0
 for x in values:o|=x
 return o
def compact(poly):
 return {k:v for k,v in poly.items() if v}
def combine(A,B,sign=1):
 p=defaultdict(int,A)
 for k,v in B.items():p[k]+=sign*v
 return compact(p)
def mul(A,B):
 p=defaultdict(int)
 for a,va in A.items():
  for b,vb in B.items():p[a|b]+=va*vb
 return compact(p)
def naive(e):
 masks=[join(1<<t for t in L if t!=e)
        for _,_,L in lines if e in L]
 u=[0]*(1<<len(masks));p=defaultdict(int)
 for bits in range(1,len(u)):
  low=bits&-bits
  i=low.bit_length()-1
  u[bits]=u[bits^low]|masks[i]
  p[u[bits]]+=1 if bits.bit_count()%2 else -1
 return compact(p)
def euler(e):
 allp={0:1};info=[];neighbors=[]
 for o,_,_ in D:
  subset=[(start,L) for d,start,L in lines if d==o and e in L]
  subset.sort(key=lambda x:x[0][1] if o=='V' else x[0][0])
  masks=[join(1<<t for t in L if t!=e) for _,L in subset]
  direction={'H':(1,0),'V':(0,1),'R':(1,1),'F':(1,-1)}[o]
  for (s,_),(t,__) in zip(subset,subset[1:]):
   assert(t[0]-s[0],t[1]-s[1])==direction
  cur=defaultdict(int)
  for m in masks:cur[m]+=1
  for m,n in zip(masks,masks[1:]):cur[m|n]-=1
  cur=compact(cur)
  neighbors.append(join(masks))
  info.append({'direction':o,'windows':len(masks),
               'degree':max((m.bit_count() for m in cur),default=0),
               'terms':len(cur)})
  allp=mul(allp,combine({0:1},cur,-1))
 for i in range(4):
  for j in range(i+1,4):
   assert not(neighbors[i]&neighbors[j])
 return combine({0:1},allp,-1),info
profiles=[]
for e in range(42):
 whole=naive(e)
 exact,terms=euler(e)
 assert whole==exact,(e,whole,exact)
 profiles.append({'site':[e%7+1,e//7+1],
    'incidentOriginalK4':sum(t['windows'] for t in terms),
    'numberNonzeroBooleanCoefficients':len(whole),
    'formalMaxDegree':max((k.bit_count() for k in whole),default=0),
    'degreeHistogram':dict(Counter(k.bit_count() for k in whole)),
    'directionWindowsAndTerms':terms})
assert max(s['formalMaxDegree'] for s in profiles)==16
degree16Sites=[s['site'] for s in profiles if s['formalMaxDegree']==16]
assert len(degree16Sites)==8
assert sum(2**sum(t['windows']>0 for t in s['directionWindowsAndTerms'])-1
           for s in profiles)==438
# Independent Boolean assignment evaluation, no chronology assumption.
rng=random.Random(20261021)
for t in range(15000):
 e=rng.randrange(42)
 board=[rng.randrange(2) for _ in range(42)]
 expected=any(all(board[j] for j in L if j!=e)
              for d,start,L in lines if e in L)
 poly,_=euler(e)
 got=sum(coef*int(all(board[j] for j in range(42)
                      if m&(1<<j))) for m,coef in poly.items())
 assert got==int(expected)

def replay(word):
 board=[0]*42
 hs=[0]*7
 for t,col in enumerate(word):
  c=col-1
  assert hs[c]<6
  e=c+7*hs[c];hs[c]+=1
  board[e]=1+t%2
  assert not any(all(board[j]==board[e] for j in L)
                 for _,_,L in lines)
 return tuple(board),tuple(hs)
SWITCH=(1,2,3,5,6)
ens={0:[],1:[]}
for b in product([0,1],repeat=5):
 word=[7]
 for c,x in zip(SWITCH,b):
  if x==0:word.extend([c,c])
 word.append(7)
 for c,x in zip(SWITCH,b):
  if x==1:word.extend([c,c])
 assert len(word)==12
 board,hs=replay(word)
 assert hs==(2,2,2,0,2,2,2)
 assert board.count(1)==board.count(2)==6
 ens[sum(b)%2].append({'bits':''.join(map(str,b)),
                         'word':''.join(map(str,word)),
                         'board':board,'hs':hs})
assert len(ens[0])==len(ens[1])==16
hist={}
for k in range(5):
 n=0
 for subset in combinations(range(42),k):
  a=Counter(tuple(item['board'][e] for e in subset)
            for item in ens[0])
  b=Counter(tuple(item['board'][e] for e in subset)
            for item in ens[1])
  assert a==b
  n+=1
 assert n==comb(42,k)
 hist[k]=n
assert sum(hist.values())==124314
flux={}
for parity in (0,1):
 wins=[]
 for item in ens[parity]:
  for c,r in enumerate(item['hs']):
   b=list(item['board'])
   e=c+7*r;b[e]=1
   found=[ori for ori,start,L in lines
          if e in L and all(b[j]==1 for j in L)]
   if found:
    wins.append({'bits':item['bits'],'column':c+1,
                 'winOriginalK4Orientations':found})
 flux['even' if parity==0 else 'odd']={
     'physicalTerminalHistoryFlux':len(wins),
     'originalK4LineIncidences':sum(len(x['winOriginalK4Orientations'])
                                    for x in wins),
     'examples':wins}
assert [flux[s]['physicalTerminalHistoryFlux'] for s in ('even','odd')]==[6,6]
assert [flux[s]['originalK4LineIncidences'] for s in ('even','odd')]==[10,10]
print(json.dumps({'schema':1,'date':'2026-10-21',
 'status':'PROVED_SOURCE_42_SITE_EULER_TENSOR_WIN_BOOLEAN_AND_NEGATIVE_FIVE_SWITCH_PARITY',
 'trueOriginalK4Lines':69,'all42NaiveVsEulerCoefficientComparisons':42,
 'independentRandomBooleanTruthTableTrials':15000,
 'formalMaxPolynomialDegree':16,
 'sitesAttainingDegree16':degree16Sites,
 'localFourOrientationSubsetHazardMomentSlots':438,
 'actualLegalFiveSwitchParitySourceRank':12,
 'actualLegalParityFieldBoardSupportEach':16,
 'matchingFullTernaryOwnerMarginalCountsBySubsetSize':hist,
 'matchedMarginalTotal':sum(hist.values()),
 'terminalFirstwinFluxFiveSwitchNull':flux,
 'fullPhysicalOriginalK4LinkProfiles':profiles,
 'proof':'Each direction K4 windows completing at the same landing e have an interval of active start indices, so hazard is Euler chi=sum active vertices-sum active adjacent edges, formal degree<=4. Four disjoint direction neighbor fibers OR via 1-prod(1-hazard), degree<=16. On five-switch bottom path, omitted middle original H windows erase the hypothesized fifth-order parity flux difference.',
 'historicSolvedGameDataUsed':False,
 'emptyRootWinnerProvedIndependently':False,
 'maintainedCI':'NOT_RUN'},indent=2))
