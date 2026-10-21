#!/usr/bin/env python3
"""ORIGINAL7x6 whole-state field exact WIN absorber via per-direction K4
Euler-interval hazard. Aggregate ALL legal firstwinfree histories through
ply10 in one 49-bit keyed field; no selected game path/solver/historic28.
"""
import json,time
W,H=7,6
D=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))
SHIFT=[1<<(7*c) for c in range(W)]
links=[[[] for _ in D] for e in range(42)]
for c in range(W):
 for r in range(H):
  for ori,dx,dy in D:
   q=[(c+i*dx,r+i*dy) for i in range(4)]
   if not all(0<=x<W and 0<=y<H for x,y in q):continue
   for x,y in q:
    e=x+W*y
    j=next(i for i,v in enumerate(D) if v[0]==ori)
    links[e][j].append(((r if ori=='V' else c),
      tuple((xx,yy) for xx,yy in q if (xx,yy)!=(x,y))))
for site in links:
 for group in site:group.sort()
assert sum(len(L) for site in links for L in site)==69*4
def original_euler(field,heights,e,player):
 raw=edges=activeOrientations=0
 for originalWindowStarts in links[e]:
  previous=False;v=adj=0
  for start,otherSites in originalWindowStarts:
   live=all(heights[c]>r and ((field[c]>>r)&1)==player
            for c,r in otherSites)
   v+=bool(live)
   adj+=bool(previous and live)
   previous=live
  chi=v-adj
  assert chi in (0,1)
  raw+=v;edges+=adj;activeOrientations+=chi
 return int(activeOrientations>0),raw,edges,activeOrientations
tic=time.perf_counter()
live={sum(SHIFT):1};report=[]
for rank in range(10):
 nextLive={};player=rank%2
 absorbed=rawSum=edgeSum=crossOriented=0
 allLegal=0
 for state,mass in live.items():
  words=[(state>>(7*c))&127 for c in range(W)]
  heights=[v.bit_length()-1 for v in words]
  for c in range(W):
   r=heights[c]
   if r==H:continue
   allLegal+=mass
   e=c+W*r
   if rank>=6:
    win,raw,edges,orients=original_euler(words,heights,e,player)
    assert win==int(raw>0)
   else:win=raw=edges=orients=0
   if win:
    absorbed+=mass;rawSum+=mass*raw;edgeSum+=mass*edges
    crossOriented+=mass*int(orients>=2)
   else:
    nextKey=state+(1+player)*(1<<r)*SHIFT[c]
    nextLive[nextKey]=nextLive.get(nextKey,0)+mass
 assert rawSum-edgeSum==absorbed
 report.append({'ply':rank+1,'currentMover':'P0' if player==0 else 'P1',
  'livePhysicalBoardsBefore':len(live),
  'liveTrueOrderedHistoryMassBefore':sum(live.values()),
  'physicalFirstwinnerAbsorbingMass':absorbed,
  'rawOriginalK4WindowWinIncidenceMass':rawSum,
  'adjacentK4IntervalEulerOverlapCorrection':edgeSum,
  'crossOrientationSameDropWinMass':crossOriented,
  'nextFirstwinfreePhysicalBoards':len(nextLive),
  'nextFirstwinfreeOrderedHistoryMass':sum(nextLive.values())})
 live=nextLive
for i,(absorbed,correction) in enumerate(
  [(13032,0),(44430,0),(1086882,77112),(4261058,147816)],start=7):
 assert report[i-1]['physicalFirstwinnerAbsorbingMass']==absorbed
 assert report[i-1]['adjacentK4IntervalEulerOverlapCorrection']==correction
assert all(item['crossOrientationSameDropWinMass']==0 for item in report)
print(json.dumps({'schema':1,'date':'2026-10-21',
 'status':'EXACT_GLOBAL_ORIGINAL7X6_69K4_FIRSTWINNING_SINK_EULER_HVRF_FACTOR_THROUGH10',
 'originalPhysicalK4':69,
 'theorem':'Per direction K4 windows through same actual landing form active interval; chi=#active windows-#adjacent active window pairs. Four orientation win is Boolean OR of their chi. Whole-state firstwinning flux is an exact expectation of that local tensor.',
 'allRanks':report,
 'earliestNonzeroSameOrientationOverlapPly':9,
 'crossOrientationTerminalOverlapThrough10':0,
 'historicStrong28OrSolvedRootWDLUsed':False,
 'independentRootP0WINProved':False,
 'elapsedSeconds':round(time.perf_counter()-tic,3)},indent=2))
