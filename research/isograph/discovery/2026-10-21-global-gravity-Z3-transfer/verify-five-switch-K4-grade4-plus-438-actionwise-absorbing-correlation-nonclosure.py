#!/usr/bin/env python3
"""Exact legal-state, action-indexed K4 residual/Euler moment nonclosure.
Only source 7x6 rules; historical optimal games and solved root never used.
Run: python3 verify-five-switch-K4-grade4-plus-438-actionwise-absorbing-correlation-nonclosure.py
"""
from collections import Counter
from itertools import combinations, product
from math import comb
import json

W,H=7,6
D=((1,0),(0,1),(1,1),(1,-1))
K4=[]
BY={(e,o):[] for e in range(42) for o in range(4)}
for c in range(W):
 for r in range(H):
  for oi,(dx,dy) in enumerate(D):
   pts=[(c+i*dx,r+i*dy) for i in range(4)]
   if all(0<=x<W and 0<=y<H for x,y in pts):
    line=tuple(x+W*y for x,y in pts)
    K4.append(line)
    for e in line:BY[e,oi].append(line)
assert len(K4)==69

def ray_win(q,c,r,p):
 """Independent directional ray checker, does not reuse the K4 list."""
 for dx,dy in D:
  n=1
  for sign in (1,-1):
   for j in range(1,4):
    x,y=c+sign*dx*j,r+sign*dy*j
    if not (0<=x<W and 0<=y<H) or q[x+W*y]!=p:break
    n+=1
  if n>=4:return True
 return False

SWITCH=(1,2,3,5,6)
def source_board(bits):
 word=[7]
 for c,b in zip(SWITCH,bits):
  if b==0:word.extend((c,c))
 word.append(7)
 for c,b in zip(SWITCH,bits):
  if b==1:word.extend((c,c))
 assert len(word)==12
 q=[0]*42;h=[0]*W
 for t,col in enumerate(word):
  c=col-1;r=h[c];h[c]+=1;p=1+t%2
  q[c+W*r]=p
  assert not ray_win(q,c,r,p)
 assert h==[2,2,2,0,2,2,2]
 assert sum(v==1 for v in q)==sum(v==2 for v in q)==6
 # Early pairs b=0 give bottom P1; late b=1 give bottom P0.
 assert all(q[c-1]==(1 if b else 2) for c,b in zip(SWITCH,bits))
 return tuple(q),tuple(h),''.join(map(str,word))

field={0:[],1:[]}
for bits in product((0,1),repeat=5):
 q,h,history=source_board(bits)
 field[sum(bits)%2].append((bits,q,h,history))
assert len(field[0])==len(field[1])==16

# Exhaustively identical complete physical ternary owner marginals order <=4.
marginals={}
for k in range(5):
 for sites in combinations(range(42),k):
  assert Counter(tuple(q[s] for s in sites) for _,q,_,_ in field[0])==Counter(
         tuple(q[s] for s in sites) for _,q,_,_ in field[1])
 marginals[k]=comb(42,k)
assert sum(marginals.values())==124314
for line in K4:
 assert Counter(tuple(q[s] for s in line) for _,q,_,_ in field[0])==Counter(
        tuple(q[s] for s in line) for _,q,_,_ in field[1])

# Test every nonempty directional Euler hazard subset at each physical frontier.
orientation_subsets=[]
for e in range(42):
 dirs=[o for o in range(4) if BY[e,o]]
 for k in range(1,len(dirs)+1):
  orientation_subsets.extend((e,s) for s in combinations(dirs,k))
assert len(orientation_subsets)==438
def hazard(q,h,p,e,os):
 if e != (e%W)+W*h[e%W]:return 0
 for o in os:
  if not any(all(q[j]==p for j in line if j!=e) for line in BY[e,o]):
   return 0
 return 1
for p in (1,2):
 for e,os in orientation_subsets:
  assert sum(hazard(q,h,p,e,os) for _,q,h,_ in field[0])==sum(
             hazard(q,h,p,e,os) for _,q,h,_ in field[1])

# The SAME real action P0 column4 bottom: firstwin absorbing transfer.
live={};mass={};flux={};raw={}
for parity in (0,1):
 kept=[];win=0;incident=0
 for bits,q,h,history in field[parity]:
  b=list(q);b[3]=1
  completed=sum(3 in line and all(b[j]==1 for j in line) for line in K4)
  assert bool(completed)==ray_win(b,3,0,1)
  if completed:
   win+=1;incident+=completed
  else:
   assert not any(all(b[j]==p for j in line) for line in K4 for p in (1,2))
   kept.append((bits,tuple(b)))
 live[parity]=kept
 flux[parity]=win;raw[parity]=incident
 assert (win,incident,len(kept))==(6,10,10)

# A TRUE original rising four-window, not an inferred synthetic feature:
# (1,1),(2,2),(3,3),(4,4), grade2 owner P1 at first two sites.
rise=(0,8,16,24)
assert rise in K4
def grade2(q):
 return int(q[rise[0]]==2 and q[rise[1]]==2 and
            q[rise[2]]==0 and q[rise[3]]==0)
before=[sum(grade2(q) for _,q,_,_ in field[p]) for p in (0,1)]
after=[sum(grade2(q) for _,q in live[p]) for p in (0,1)]
assert before==[4,4],before
assert after==[3,2],after
x1=[sum(q[0]==1 for _,q in live[p]) for p in (0,1)]
assert x1==[4,5],x1

# Full source line-pattern and coarse owner-grade inequalities AFTER absorption.
pattern_differences=0;grade_differences=0
for line in K4:
 c0=Counter(tuple(q[i] for i in line) for _,q in live[0])
 c1=Counter(tuple(q[i] for i in line) for _,q in live[1])
 pattern_differences+=sum(c0[v]!=c1[v] for v in c0.keys()|c1.keys())
 for owner in (1,2):
  def grade(q):
   own=sum(q[i]==owner for i in line)
   if any(q[i]==3-owner for i in line):return "blocked"
   return str(4-own)
  a=Counter(grade(q) for _,q in live[0])
  b=Counter(grade(q) for _,q in live[1])
  grade_differences+=sum(a[v]!=b[v] for v in a.keys()|b.keys())
assert pattern_differences==38
assert grade_differences==24

# Algebraic parity coefficient: W=A+B+D-AB-BD.
# x1*W=x1x2x3+x1x5x6-x1x2x3x5x6, 5-body coefficient -1.
# Parity-even minus parity-odd on all-five monomial is -1;
# survivor x1 difference = -1; g=(1-x1)x2 has grade2 difference +1.
for bits in product((0,1),repeat=5):
 x1_,x2_,x3_,x5_,x6_=bits
 A=x1_*x2_*x3_
 B=x2_*x3_*x5_
 C=x3_*x5_*x6_
 DD=x5_*x6_
 Wevent=A+B+DD-A*B-B*DD
 assert Wevent==int(bool(A or B or C or DD))
 assert x1_*Wevent==x1_*x2_*x3_+x1_*x5_*x6_-x1_*x2_*x3_*x5_*x6_
parity_top=sum((-1 if sum(bits)%2 else 1)*int(all(bits))
               for bits in product((0,1),repeat=5))
assert parity_top==-1

result={
 "schema":1,"date":"2026-10-21",
 "status":"DEDUCTIVE_EXACT_SCOPED_SOURCE_FIELD_NONCLOSURE",
 "originalW":7,"originalH":6,"originalK4Windows":len(K4),
 "legalAlternatingNonterminalRank12StatesPerParity":[16,16],
 "equalCompleteTernarySiteMarginalsThroughDegree4":marginals,
 "equalSingleK4TernaryPatterns":69,
 "equalGravityFrontierEulerEmitterMomentsPerOwner":438,
 "equalEmitterComparisonsTwoOwners":876,
 "sameLegalAction":"P0 column4 row1 on move13",
 "firstwinSinkMassEvenOdd":[flux[0],flux[1]],
 "rawCompletedK4IncidencesEvenOdd":[raw[0],raw[1]],
 "nonterminalSurvivingBoardsEvenOdd":[len(live[0]),len(live[1])],
 "P1OriginalRisingGrade2PatternBefore":[4,4],
 "P1OriginalRisingGrade2PatternAfter":after,
 "risingLineCellsOneBased":[[1,1],[2,2],[3,3],[4,4]],
 "P0BottomColumn1After":x1,
 "postactionSingleK4TernaryPatternDifferentMoments":pattern_differences,
 "postactionSingleK4OwnerGradeDifferentMoments":grade_differences,
 "missingExactCorrelation":"five-switch x1*x2*x3*x5*x6 term of g*Win survival coupling",
 "historicalRootOrStrongOptimalKnowledgeUsed":False,
 "independentEmptyRootWinnerProved":False,
 "maintainedCI":"NOT_RUN","externalFormalProof":"NOT_RUN"
}
print(json.dumps(result,indent=2))
