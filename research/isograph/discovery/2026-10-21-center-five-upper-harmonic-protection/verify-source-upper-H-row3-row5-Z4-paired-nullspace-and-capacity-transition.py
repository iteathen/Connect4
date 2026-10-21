#!/usr/bin/env python3
"""Source-exact 6x6/7x6 conditional center-five upper H K4 Fourier pairing.
No historical terminal-28 IDs, solved game values or Connect4 game solver.
"""
import json,random

K=4;H=6
DIR=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))

def build(W):
 return [(ori,tuple((c+i*dx,r+i*dy)for i in range(4)))
         for c in range(W)for r in range(H)for ori,dx,dy in DIR
         if all(0<=c+i*dx<W and 0<=r+i*dy<H for i in range(4))]

def played(W,word,lines):
 B=[[-1]*W for _ in range(H)];h=[0]*W
 for i,ch in enumerate(word):
  c=int(ch)-1;p=i%2;r=h[c]
  assert 0<=c<W and r<H
  B[r][c]=p;h[c]+=1
  assert not any(all(B[y][x]==p for x,y in pts)for _,pts in lines)
 return B,h

def grade(B,h,pts,p=0):
 if any(B[y][x]==1-p for x,y in pts):return None
 R={(c,r)for c,r in pts if B[r][c]==-1}
 S=set()
 for c in {x for x,y in R}:
  peak=max(y for x,y in R if x==c)
  S.update((c,y)for y in range(h[c],peak+1))
 return len(R),len(S-R)

def pairs(W,B,h,lines):
 records=[]
 for start in range(W-3):
  cols=range(start,start+4)
  assert 3 in cols
  lo=tuple((c,2)for c in cols)
  hi=tuple((c,4)for c in cols)
  assert ('H',lo)in lines and ('H',hi)in lines
  records.append({'oneBasedSpan':[c+1 for c in cols],
    'row3':grade(B,h,lo),'row5':grade(B,h,hi)})
 return records

report={'schema':1,'date':'2026-10-21',
  'scope':'True original K4 physical H-row3/row5 center-five pair only, all remaining noncenter h<=2; no ROOT WDL proof',
  'sourceSolvedGameDataUsed':False,'results':[]}
for W,word in [(6,'4444432311255466'),(7,'444446526337114725')]:
 lines=build(W);B,h=played(W,word,lines)
 assert len(lines)==(54 if W==6 else 69)
 assert len(word)==6+2*(W-1)
 assert h[3]==6 and all(h[c]==2 for c in range(W)if c!=3)
 r=pairs(W,B,h,lines)
 assert all(rec['row3']==(3,0) and rec['row5']==(3,6)for rec in r)
 broke=[]
 for c in range(W):
  if c==3:continue
  BB=[row[:] for row in B];hh=h[:]
  BB[2][c]=0;hh[c]+=1  # at maximal layer capacity next mover P0
  impacted=0
  z4upper=0j
  for rec in pairs(W,BB,hh,lines):
   if c+1 in rec['oneBasedSpan']:
    assert rec['row3']==(2,0) and rec['row5']==(3,5)
    impacted+=1
   else:assert rec['row3']==(3,0)and rec['row5']==(3,6)
   for label in ('row3','row5'):
    value=rec[label]
    if value and value[0]==3:z4upper+=1j**value[1]
  assert z4upper==1j*impacted,(W,c,z4upper,impacted)
  assert impacted in (1,2,3)
  assert not any(all(BB[y][x]==0 for x,y in pts)for _,pts in lines)
  broke.append({'claimOneBasedColumn':c+1,
    'P0ThirdRowClaimAtRank':len(word)+1,
    'centerIntersectingHSpansAffected':impacted,
    'newP0Grade2OriginalHRow3SourceCount':impacted,
    'remainingP0HUpperGrade3Z4':[int(z4upper.real),int(z4upper.imag)]})
 # Reconstruct many actual real source positions BEFORE first noncenter row3.
 rng=random.Random(20261021+W)
 checks=0;paths=0
 for _ in range(1200):
  s='44444';BB,hh=played(W,s,lines)
  for ply0 in range(5,6+2*(W-1)):
   for rec in pairs(W,BB,hh,lines):
    assert rec['row3'] and rec['row5']
    assert rec['row3'][0]==rec['row5'][0]==3
    assert rec['row5'][1]-rec['row3'][1]==6
    checks+=1
   legal=[c for c in range(W)if hh[c]<(6 if c==3 else 2)]
   rng.shuffle(legal)
   opts=[]
   for c in legal:
    p=ply0%2;r0=hh[c];BB[r0][c]=p
    firstwin=any(all(BB[y][x]==p for x,y in pts)for _,pts in lines)
    BB[r0][c]=-1
    if not firstwin:opts.append(c)
   if not opts:break
   c=rng.choice(opts);BB[hh[c]][c]=ply0%2;hh[c]+=1;s+=str(c+1)
  paths+=1
 report['results'].append({
  'W':W,'H':6,'originalTrueK4Windows':len(lines),
  'survivingOriginalHRow3Row5SourcePairCondition':
  'For each H K4 through c4, when all outer columns h<=2, both grade3 P0 live, debt(row5)=debt(row3)+6; at z=i their sum0.',
  'legallyReachedMaximumBottomTwoLayerWord':word,
  'maximumSourceCapacityRank':len(word),
  'columnHeightsAtMaximum':h,
  'firstNoncenterRow3SourceJunctionMustBeClaimedByRank':7+2*(W-1),
  'nextMovePlayerAtMaximum':'P0',
  'physicalThirdRowFirstClaimSourceTests':broke,
  'firstwinnerFreeRandomConditionalTrajectories':paths,
  'independentPhysicalUpperPairK4GradeChecks':checks,
  'mismatches':0})
print(json.dumps(report,indent=2))
