#!/usr/bin/env python3
"""Global action-indexed Koopman nonclosure of the original7x6 fourway
438 local WIN hazard observable interface. Entire six-state legal face;
all current p0/p1 hazards zero, but current grade2 P0 owner P4 path
determines next c3 action's c4 H hazard. No solved root/strong28 data.
"""
from itertools import combinations
import json
W,H=7,6
D=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))
K4=[]
for c in range(W):
 for r in range(H):
  for ori,dx,dy in D:
   pts=tuple((c+i*dx,r+i*dy) for i in range(4))
   if all(0<=x<W and 0<=y<H for x,y in pts):
    K4.append((ori,tuple(x+7*y for x,y in pts)))
assert len(K4)==69
physical=(1,2,5,6)
result=[]
for P0cells in combinations(physical,2):
 P1cells=tuple(c for c in physical if c not in P0cells)
 word=(P0cells[0],P1cells[0],P0cells[1],P1cells[1])
 board=[0]*42;h=[0]*7
 for i,c1 in enumerate(word):
  c=c1-1
  e=c+7*h[c];h[c]+=1
  board[e]=i%2+1
  assert not any(all(board[x]==board[e] for x in L)
                 for o,L in K4)
 assert h==[1,1,0,0,1,1,0]
 current=[(p,o,e) for p in [1,2] for o,L in K4
      for e in L if board[e]==0 and
      all(board[x]==p for x in L if x!=e)]
 assert current==[]
 # At physical move5, owner0(P0) claims bottom c3; no FIRSTWIN yet.
 board[2]=1;h[2]=1
 assert not any(all(board[x]==1 for o,L in K4))
 c4=3
 active=[o for o,L in K4 if c4 in L and
          all(board[x]==1 for x in L if x!=c4)]
 expected=any(set(edge).issubset(set(P0cells))
          for edge in [(1,2),(2,5),(5,6)])
 assert int(bool(active))==int(expected)
 result.append({'P0OriginalBottomOwners':list(P0cells),
      'P1OriginalBottomOwners':list(P1cells),
      'actualFirstwinfree4MoveHistory':''.join(map(str,word)),
      'originalP0HWinningHazardAtC4AfterP0TakesC3':int(expected)})
assert sum(r['originalP0HWinningHazardAtC4AfterP0TakesC3']
           for r in result)==3
print(json.dumps({'schema':1,'date':'2026-10-21',
 'status':'EXACT_GLOBAL_ACTIONWISE_KOOPMAN_NONCLOSURE_OF_438_IMMEDIATE_K4_WIN_HAZARDS',
 'sourceOriginalK4':69,
 'trueLegalSameHeightsPhysicalRank4States':6,
 'sameOriginalColumnHeights':[1,1,0,0,1,1,0],
 'currentAllPlayerWinHazardsAtAll42PhysicalSitesZero':True,
 'commonP0NextActualLegalAction':'column3 bottom on move5',
 'nonterminalP0ActionAll6':True,
 'KoopmanPullbackOfP0_H_C4WinningHazard':
    'OR of P0 original physical bottom two-stone edge products x1*x2, x2*x5, x5*x6, a path P4; current source grade2 owner cofactor',
 'sourceNewH_HazardPositiveAfterAction':3,
 'sourceNewH_HazardZeroAfterAction':3,
 'literalOriginalOwnersAndHistory':result,
 'correction':'Frozen single edge x1*x2 prediction was false: middle original K4 windows also generate edge x2*x5 and x5*x6. Stronger rank4 six-state moment nonclosure holds.',
 'historicalStrong28OrSolvedWDLUsed':False,
 'root7x6WinnerIndependentlyProved':False},indent=2))
