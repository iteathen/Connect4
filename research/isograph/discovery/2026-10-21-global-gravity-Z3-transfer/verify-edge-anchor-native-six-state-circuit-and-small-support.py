#!/usr/bin/env python3
"""Exact signed 3+3 K4/Euler kernel circuit, all pair sums and support<=5.
Run from this directory: python3 verify-edge-anchor-native-six-state-circuit-and-small-support.py
Requires SymPy. All data from legal original7x6 geometry, no solved oracle.
Prereg: docs/research/2026-10-22-frozen-source-rectangle-kernel-vs-signed-exchange-triangle.md
and docs/research/2026-10-22-frozen-edge-six-circuit-minimum-linear-support-control.md
"""
from importlib.util import spec_from_file_location, module_from_spec
from pathlib import Path
from itertools import combinations,product
from collections import Counter,defaultdict
import json
import sympy as sp

source=Path(__file__).with_name("verify-six-anchor-all-p1-all-p0-third-actions-exact.py")
spec=spec_from_file_location("c4_seven_action_source",source)
C=module_from_spec(spec);spec.loader.exec_module(C)

HEX={1:+1,2:-1,8:+1,9:-1,16:-1,18:+1}
def dot(z,m):
 return sum(t for i,t in enumerate(z) if (m>>i)&1)

def rankZ(vectors):
 return int(sp.Matrix(vectors).rank()) if vectors else 0

def getRectangles():
 ans=[]
 for i,j in combinations(range(5),2):
  others=[k for k in range(5) if k not in (i,j)]
  for vals in product((0,1),repeat=3):
   z=[0]*32
   for a,b in product((0,1),repeat=2):
    bits=[0]*5
    for k,v in zip(others,vals):bits[k]=v
    bits[i]=a;bits[j]=b
    code=sum(x<<(4-k) for k,x in enumerate(bits))
    z[code]=1 if a==b else -1
   ans.append(z)
 assert len(ans)==80
 return ans
RECTANGLES=getRectangles()

def pairSumFourPointRelations(masks):
 # Each source state is represented by its complete native feature column.
 masks=sorted(masks)
 signatures=[tuple((m>>i)&1 for m in masks) for i in range(32)]
 sums=defaultdict(list)
 for a,b in combinations(range(32),2):
  sums[tuple(x+y for x,y in zip(signatures[a],signatures[b]))].append((a,b))
 rows={};foursets=set()
 for pairs in sums.values():
  for (a,b),(c,d) in combinations(pairs,2):
   if len({a,b,c,d})!=4:continue
   v=[0]*32;v[a]=v[b]=1;v[c]=v[d]=-1
   t=tuple(v);u=tuple(-x for x in v)
   key=min(t,u)
   rows[key]=list(key)
   foursets.add(frozenset((a,b,c,d)))
 # Full unique state signatures: no two distinct legal boards are identified.
 assert len(set(signatures))==32
 return list(rows.values()),foursets,signatures

def gf2rank(columns,indices):
 base={}
 for i in indices:
  x=columns[i]
  while x:
   p=x.bit_length()-1
   if p in base:x^=base[p]
   else:base[p]=x;break
 return len(base)

def supportCensus(signatures,foursets,masks):
 columns=[sum(b<<i for i,b in enumerate(s)) for s in signatures]
 assert gf2rank(columns,range(32))==C.rankQ(masks)
 counts={};depBySize={}
 for k in range(1,6):
  gfdep=0;qdep=0;falsepos=0;deps=set()
  for ids in combinations(range(32),k):
   if gf2rank(columns,ids)==k:continue
   gfdep+=1
   # Mod-2 dependence is only a screen: exact Q rank is independently checked.
   mat=sp.Matrix([[(m>>i)&1 for i in ids] for m in masks])
   if int(mat.rank())<k:qdep+=1;deps.add(frozenset(ids))
   else:falsepos+=1
  counts[k]={"total":len(list(combinations(range(32),k))),
             "GF2Dependent":gfdep,"QDependent":qdep,
             "falseGF2Positive":falsepos}
  depBySize[k]=deps
 assert counts[1]["QDependent"]==counts[2]["QDependent"]==counts[3]["QDependent"]==0
 assert depBySize[4]==foursets
 fiveExtensions={frozenset(list(four)+[i])
   for four in foursets for i in range(32) if i not in four}
 assert depBySize[5]==fiveExtensions
 return counts

def perform():
 rows=[]
 for anchor in C.OUT:
  start=C.face(anchor);s1,firstSink,_=C.batch(start,4,1)
  F0=C.features(start);F1=C.features(s1)
  V1=F0["all"]|F1["all"];r1=C.checked_rank(V1)
  vecs=[[(m>>i)&1 for i in range(32)] for m in sorted(V1) if m]
  null=sp.Matrix(vecs).nullspace()
  nullDim=len(null)
  assert nullDim==32-r1
  acceptedRect=[z for z in RECTANGLES if all(dot(z,m)==0 for m in V1)]
  rectRank=rankZ(acceptedRect)
  four,foursets,signatures=pairSumFourPointRelations(V1)
  fourRank=rankZ(four)
  affineCount=sum(1 for z in four if not (
    0==__import__('functools').reduce(lambda a,b:a^b,
      [i for i,t in enumerate(z) if t],0)))
  assert affineCount==0
  assert rectRank==fourRank
  if anchor in (1,7):
   assert (r1,nullDim,len(acceptedRect),rectRank,len(four),fourRank)==(24,8,7,7,10,7)
  elif anchor in (2,6):
   assert (r1,nullDim,len(acceptedRect),rectRank,len(four),fourRank)==(22,10,14,10,29,10)
  else:
   assert (r1,nullDim,len(acceptedRect),rectRank,len(four),fourRank)==(19,13,18,13,38,13)
  row={"anchor":anchor,"sourceRank":C.rankQ(F0["all"]),
       "postFirstCenterRank":r1,"annihilatorDim":nullDim,
       "axisRectanglesTested":80,"axisRectanglesAdmitted":len(acceptedRect),
       "axisRectangleSpanRank":rectRank,"allTwoPlusTwoRelations":len(four),
       "fourPointRelationRank":fourRank,
       "fourPointSupportSets":len(foursets),
       "allFourPointRelationsAreAffineGF2Planes":True}
  if anchor in (1,7):
   z=[HEX.get(i,0) for i in range(32)]
   assert dot(z,0)==0
   assert all(dot(z,m)==0 for m in V1)
   assert rankZ(four+[z])==8
   hexsupport=frozenset(HEX)
   assert not any(g<=hexsupport for g in foursets)
   row["QDependentSupportUpToFive"]=supportCensus(signatures,foursets,V1)
   row["threePlusThreeCircuit"]={"sourceIndicesSigned":HEX,
      "ownerSwitchBitsByIndex":{
       str(i):''.join(str((i>>(4-k))&1) for k in range(5)) for i in HEX},
      "cannotBeGeneratedByAnyTwoPlusTwo":True,
      "allProperSubsetsQIndependent":True}
   stage=[]
   pos=[i for i,v in HEX.items() if v==1]
   neg=[i for i,v in HEX.items() if v==-1]
   assert len(pos)==len(neg)==3 and all(s1[i] is not None for i in HEX)
   for reply in range(1,8):
    s2,p1sink,_=C.batch(s1,reply,2)
    assert p1sink==[0,0]
    assert all(dot(z,m)==0 for m in C.features(s2)["all"])
    s3,p0sink,_=C.batch(s2,4,1)
    f3=C.features(s3)
    detectable=any(dot(z,m)!=0 for m in f3["all"])
    assert detectable==(reply!=4)
    fourDualRank=rankZ([[dot(f,m) for m in f3["all"]] for f in four])
    assert fourDualRank==(1 if reply!=4 else 0)
    assert C.rankQ(V1|f3["all"])-r1==(2 if reply!=4 else 0)
    pluswins=sum(s2[i] is not None and s3[i] is None for i in pos)
    minuswins=sum(s2[i] is not None and s3[i] is None for i in neg)
    assert pluswins==minuswins==(2 if reply!=4 else 0)
    pluslive=[i for i in pos if s3[i] is not None]
    minuslive=[i for i in neg if s3[i] is not None]
    if reply!=4:assert pluslive==[18] and minuslive==[9]
    else:assert len(pluslive)==len(minuslive)==3
    # The first nonanchor peripheral physical bottom owner is a row1 K4 pattern sum.
    witnesscol=[c for c in C.OUT if c!=anchor][0]-1
    ownerMomentDifference=sum(int(s3[i][0][witnesscol]==1) for i in pluslive)-sum(
       int(s3[i][0][witnesscol]==1) for i in minuslive)
    assert ownerMomentDifference==(1 if reply!=4 else 0)
    stage.append({"P1Reply":reply,"secondP0CenterDetectsHexCircuit":detectable,
                  "2plus2CircuitImageRank":fourDualRank,
                  "nativeTotalImageRank":2 if reply!=4 else 0,
                  "plusMinusSecondP0FirstWins":[pluswins,minuswins],
                  "plusMinusLiveCounts":[len(pluslive),len(minuslive)],
                  "originalRow1P0OwnerSurvivorDifference":ownerMomentDifference})
   row["sevenP1ReplyCircuitOutcomes"]=stage
  rows.append(row)
 assert rows[0]["QDependentSupportUpToFive"]==rows[-1]["QDependentSupportUpToFive"]
 return {"status":"ORIGINAL7X6_SOURCE_ONLY_SIGNED_HEXAGON_CIRCUIT_EXACT_Q",
         "originalK4":69,"nativeEulerPerOwner":438,"sourceFaceStateCount":32,
         "rootGameOutcome":"NOT_PROVED","maintainedCI":"NOT_RUN",
         "interpretation":"Six-source-state signed contrast is not September descriptor-delta identity.",
         "anchors":rows}
if __name__=="__main__":print(json.dumps(perform(),indent=2))
