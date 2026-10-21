#!/usr/bin/env python3
"""Original 7x6 true K4 source P0 degree-3 H z4 vs z2 gravity response.
No solved-game data, strong28 winning line IDs, or game-value searches.
"""
from collections import Counter
import json

W,H=7,6
D=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))
LINES=[(o,tuple((c+i*dx,r+i*dy)for i in range(4)))
       for c in range(W) for r in range(H) for o,dx,dy in D
       if all(0<=c+i*dx<W and 0<=r+i*dy<H for i in range(4))]
assert len(LINES)==69

b=[[-1]*W for _ in range(H)]
h=[0]*W
for i in range(5):
    b[h[3]][3]=i%2
    h[3]+=1

def source_P0_horizontal_degree3(B,height):
    hist=Counter()
    for o,points in LINES:
        if o!='H' or any(B[y][x]==1 for x,y in points):
            continue
        R={(x,y) for x,y in points if B[y][x]==-1}
        if len(R)!=3:
            continue
        S=set()
        for c in {x for x,y in R}:
            peak=max(y for x,y in R if x==c)
            S.update((c,y) for y in range(height[c],peak+1))
        hist[len(S-R)]+=1
    return hist

before=source_P0_horizontal_degree3(b,h)
assert dict(before)=={0:4,6:4,12:4}
changes=[]
for c in (1,2,3,5,6,7):
    bb=[row[:] for row in b]
    hh=h[:]
    assert hh[c-1]==0
    bb[0][c-1]=1
    hh[c-1]=1
    assert not any(all(bb[y][x]==1 for x,y in pts)for _,pts in LINES)
    after=source_P0_horizontal_degree3(bb,hh)
    change={d:after[d]-before[d] for d in sorted(set(before)|set(after))
            if after[d]!=before[d]}
    a=sum(1 for o,pts in LINES
          if o=='H' and all(y==0 for x,y in pts)
          and (3,0) in pts and (c-1,0) in pts)
    assert change=={0:-a,5:a,6:-a,11:a,12:-a}
    char_i=sum(v*(1j)**d for d,v in change.items())
    char_neg=sum(v*(-1)**d for d,v in change.items())
    assert char_i==-a and char_neg==-5*a
    changes.append({'P1OriginalBottomColumn':c,'a':a,
         'polynomialCoefficientChanges':change,
         'Z4AtI':[int(char_i.real),int(char_i.imag)],
         'Z2AtMinusOne':char_neg,
         'differenceZ2MinusZ4':char_neg-int(char_i.real)})
assert [x['a']for x in changes]==[1,2,3,3,2,1]

print(json.dumps({
  'schema':1,'date':'2026-10-21','originalAllK4Windows':len(LINES),
  'conditionalSourcePrefix':'44444',
  'sourceProjection':'Player0 live original H K4 with exactly 3 missing physical sites',
  'P0OriginalHGrade3InitialPolynomial':dict(before),
  'P1OriginalBottomWingMoves':changes,
  'sourceAlgebra':'Delta(z)=a_c[-1+z^5-z^6+z^11-z^12]',
  'fourthRootZ4':'Delta(i)=-a_c because upper row3/row5 support advances cancel',
  'parityZ2':'Delta(-1)=-5a_c because both upper support advances reinforce',
  'notSignedRootWDL':True,'historic28OrConnect4SolverUsed':False
},indent=2))
