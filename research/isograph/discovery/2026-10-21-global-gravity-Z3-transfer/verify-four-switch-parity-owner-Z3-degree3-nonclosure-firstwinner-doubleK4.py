#!/usr/bin/env python3
"""Exact ORIGINAL7x6 H/V/R/F K4 source Z3 owner Fourier hierarchy:
TWO legal rank10 ensembles identical ALL <=3-site owner joint laws but
different P0 firstwinner transfer mass because 2 overlapping K4s can
finish on one physical drop. Pure stdlib; no root WDL/historic28 oracle.
"""
from itertools import combinations,product
from collections import Counter
import json

W,H=7,6
D=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))
lines=[]
for c in range(W):
 for r in range(H):
  for ori,dx,dy in D:
   cells=[(c+i*dx,r+i*dy) for i in range(4)]
   if all(0<=x<W and 0<=y<H for x,y in cells):
    lines.append((ori,tuple(x+W*y for x,y in cells)))
assert len(lines)==69
switches=(1,2,3,5)
E={0:[],1:[]}
for bits in product((0,1),repeat=4):
 word=[7]
 for c,b in zip(switches,bits):
  if b==0:word.extend([c,c])
 word.append(7)
 for c,b in zip(switches,bits):
  if b==1:word.extend([c,c])
 assert len(word)==10
 h=[0]*7;board=[0]*42
 for t,c1 in enumerate(word):
  c=c1-1
  r=h[c];h[c]+=1
  e=c+W*r;owner=1+t%2;board[e]=owner
  assert not any(all(board[k]==owner for k in L)
                 for ori,L in lines),(bits,t+1)
 assert h==[2,2,2,0,2,0,2]
 assert sum(x==1 for x in board)==5
 assert sum(x==2 for x in board)==5
 E[sum(bits)%2].append({
    'bits':''.join(map(str,bits)),
    'word':''.join(map(str,word)),
    'board':tuple(board),'heights':tuple(h)})
assert len(E[0])==len(E[1])==8

marginals={}
for degree in range(4):
 count=0
 for subset in combinations(range(42),degree):
  hist=[Counter(tuple(e['board'][j] for j in subset)
                for e in E[parity]) for parity in (0,1)]
  assert hist[0]==hist[1],(subset,hist)
  count+=1
 marginals[degree]=count
assert marginals=={0:1,1:42,2:861,3:11480}

flux={}
for parity in [0,1]:
 wins=[];lineIncidences=0
 for q in E[parity]:
  for c in range(W):
   r=q['heights'][c]
   if r>=H:continue
   e=c+W*r;board=list(q['board']);board[e]=1
   sourceWindows=[ori for ori,L in lines
      if e in L and all(board[j]==1 for j in L)]
   if sourceWindows:
    lineIncidences+=len(sourceWindows)
    wins.append({'bits':q['bits'],'P0NextColumn':c+1,
                 'originalWinningWindowDirections':sourceWindows})
 flux['even' if parity==0 else 'odd']={
    'physicalP0FirstwinningMoveFlux':len(wins),
    'originalWinningLineIncidenceIntensity':lineIncidences,
    'firstwinningTransitions':wins}
assert flux['even']['physicalP0FirstwinningMoveFlux']==1
assert flux['odd']['physicalP0FirstwinningMoveFlux']==2
assert flux['even']['originalWinningLineIncidenceIntensity']==2
assert flux['odd']['originalWinningLineIncidenceIntensity']==2
assert flux['even']['firstwinningTransitions'][0][
   'originalWinningWindowDirections']==['H','H']
assert all(len(q['originalWinningWindowDirections'])==1
           for q in flux['odd']['firstwinningTransitions'])
print(json.dumps({
 'schema':1,'date':'2026-10-21',
 'originalW':W,'originalH':H,
 'originalHVRFK4Windows':len(lines),
 'fieldSupport':'8 genuine firstwinfree rank10 boards per field',
 'sameCurrentGravityHeights':[2,2,2,0,2,0,2],
 'originalPhysicalOwnerMarginalJointHistogramMatches':marginals,
 'allOriginalOwnerZ3FourierModesDegree0To3Identical':True,
 'actualOriginalP0FirstwinningMove11Flux':flux,
 'genuineAlternatingGravityFirstwinfreeOneBasedHistoryWords':{
     ('even' if parity==0 else 'odd'):[q['word']
       for q in E[parity]] for parity in (0,1)},
 'reason':'A=b1*b2*b3, B=b2*b3*b5. Actual firstwin union A OR B = A+B-b1*b2*b3*b5, requiring fourth-order owner correlation to correct the double K4 window overlap.',
 'noHistoric28OrSolvedRootWDLInput':True,
 'rootEmpty7x6WINIndependentlyProved':False,
 'qualifiedIsoGraph1p2Changed':False,
 'productionSolverChanged':False
},indent=2))
