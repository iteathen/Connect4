#!/usr/bin/env python3
"""Original7x6 whole-game-space field T_p across ALL available states per
rank through move10; terminal firstwins absorbed in owner-specific sinks.
Count OVERLAPPING true original K4 windows separately from physical WIN
events. No Connect4 solved-game Oracle, historical strong28 or minimax.
Uses exact 49-bit seven-column bottom-up owner sentinel encoding.
"""
from collections import defaultdict
import json
W,H=7,6
SHIFT=[1<<(7*c) for c in range(W)]
DIRS=[('H',1,0),('V',0,1),('R',1,1),('F',1,-1)]
K4=[]
for c in range(W):
 for r in range(H):
  for ori,dx,dy in DIRS:
   q=[(c+i*dx,r+i*dy) for i in range(4)]
   if all(0<=x<W and 0<=y<H for x,y in q):
    K4.append((ori,[x+W*y for x,y in q]))
assert len(K4)==69
INCIDENT=[[] for _ in range(42)]
for ori,line in K4:
 for e in line:INCIDENT[e].append((ori,tuple(x for x in line if x!=e)))
def words(key):
 return [(key>>(7*c))&127 for c in range(W)]
def height(local):
 return local.bit_length()-1
def terminal_windows(codewords,hs,e,p):
 out=[]
 for ori,other in INCIDENT[e]:
  if all(hs[j%W]>j//W and
         ((codewords[j%W]>>(j//W))&1)==p
         for j in other):out.append(ori)
 return out

live={sum(SHIFT):1}
report={'schema':1,'date':'2026-10-21',
 'scope':'All possible legal original7x6 firstwinfree board states reached from EMPTY, merging histories in each rank through10; not a perfect-play strategy distribution.',
 'originalK4Windows':69,'gravityLocalOwnerWords':127,
 'gravityProductStateCount':127**7,
 'rankHistoryField':[],'firstwinnerAbsorbedHistoryFlux':[]}
for rank in range(11):
 mass=sum(live.values())
 report['rankHistoryField'].append({
  'rank':rank,'distinctTrueFirstwinfreePhysicalBoards':len(live),
  'nonterminalLegalOrderedHistoryMass':mass})
 if rank<=6:assert mass==7**rank
 if rank==10:break
 nxt={};p=rank%2
 byori=defaultdict(int);byMultiplicity=defaultdict(int)
 physicallyLegalDropMass=0
 absorbed=0;multi=0;cross=0
 for key,count in live.items():
  cols=words(key);hs=[height(s) for s in cols]
  for c in range(W):
   r=hs[c]
   if r>=H:continue
   physicallyLegalDropMass+=count
   win=terminal_windows(cols,hs,c+W*r,p) if rank>=6 else []
   if win:
    absorbed+=count;byMultiplicity[len(win)]+=count
    if len(win)>1:multi+=count
    if len(set(win))>1:cross+=count
    for direction in win:byori[direction]+=count
   else:
    destination=key+SHIFT[c]*((1+p)<<r)
    nxt[destination]=nxt.get(destination,0)+count
 report['firstwinnerAbsorbedHistoryFlux'].append({
  'move':rank+1,'mover':'P0' if p==0 else 'P1',
  'allLegalDropHistoryMass':physicallyLegalDropMass,
  'absorbedDistinctPhysicalFirstwinnerHistoryMass':absorbed,
  'originalK4LineIncidenceByOrientation':dict(byori),
  'simultaneouslyFirstwinningTwoOrMoreOriginalK4HistoryMass':multi,
  'crossOrientationSimultaneousFirstwinningHistoryMass':cross,
  'originalWinLineMultiplicityHistogram':dict(byMultiplicity),
  'firstwinfreeSurvivingHistoryMass':sum(nxt.values())})
 live=nxt
assert [(x['rank'],x['distinctTrueFirstwinfreePhysicalBoards'],
         x['nonterminalLegalOrderedHistoryMass'])
        for x in report['rankHistoryField']]==[
 (0,1,1),(1,7,7),(2,49,49),(3,238,343),
 (4,1120,2401),(5,4263,16807),(6,16422,117649),
 (7,54131,810504),(8,182383,5628804),
 (9,538774,38307690),(10,1618398,263770588)]
assert [report['firstwinnerAbsorbedHistoryFlux'][i-1][
 'absorbedDistinctPhysicalFirstwinnerHistoryMass']
 for i in range(7,11)]==[13032,44430,1086882,4261058]
assert [report['firstwinnerAbsorbedHistoryFlux'][i-1][
 'simultaneouslyFirstwinningTwoOrMoreOriginalK4HistoryMass']
 for i in range(7,11)]==[0,0,77112,147816]
assert [report['firstwinnerAbsorbedHistoryFlux'][i-1][
 'crossOrientationSimultaneousFirstwinningHistoryMass']
 for i in range(7,11)]==[0,0,0,0]
print(json.dumps(report,indent=2))
