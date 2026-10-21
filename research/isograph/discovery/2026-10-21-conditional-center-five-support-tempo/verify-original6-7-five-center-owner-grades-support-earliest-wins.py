#!/usr/bin/env python3
"""TRUE original 6x6/7x6 K4 center-five owner cofactor and gravity debt.
No Connect4 game solver, historic28 terminal labels or known WDL labels.
"""
from collections import Counter
import json

H=6
D=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))

def source_lines(W):
    return [(o,tuple((c+i*dc,r+i*dr) for i in range(4)))
            for c in range(W) for r in range(H) for o,dc,dr in D
            if all(0<=c+i*dc<W and 0<=r+i*dr<H for i in range(4))]

def physical_board(W,word,lines):
    b=[[-1]*W for _ in range(H)]
    h=[0]*W
    wins=[]
    for t,cc in enumerate(word):
        c=int(cc)-1
        assert 0<=c<W and h[c]<H
        row=h[c]
        h[c]+=1
        b[row][c]=t%2
        k4=[ori for ori,L in lines if all(b[y][x]==t%2 for x,y in L)]
        if k4:wins.append((t+1,t%2,k4))
    return b,h,wins

def cofactor_spectrum(b,h,lines,p):
    degrees=Counter()
    supports=Counter()
    by_direction=Counter()
    zero_debt=[]
    for ori,L in lines:
        if any(b[r][c]==1-p for c,r in L):
            continue
        R={(c,r) for c,r in L if b[r][c]<0}
        k=len(R)
        S=set()
        for c in {c for c,r in R}:
            peak=max(r for cc,r in R if cc==c)
            S.update((c,r) for r in range(h[c],peak+1))
        d=len(S-R)
        degrees[k]+=1
        if k==3:
            supports[d]+=1
            by_direction[ori]+=1
            if d==0:zero_debt.append([(c+1,r+1) for c,r in L])
    return {
        'liveOriginalK4ByMissingOwnerSites':dict(sorted(degrees.items())),
        'grade3GravitySupportDebtHistogram':dict(sorted(supports.items())),
        'grade3ByActualOrientation':dict(sorted(by_direction.items())),
        'zeroGravityDebtGrade3K4Windows':zero_debt
    }

witness={
    6:{'P0':'44444131516','P1':'444441213263'},
    7:{'P0':'44444151617','P1':'444441213263'}
}
report={'schema':1,'date':'2026-10-21',
        'historical28AndRootSolverNeverInputs':True,'boards':{}}
for W in (6,7):
    lines=source_lines(W)
    assert len(lines)==(54 if W==6 else 69)
    b,h,won=physical_board(W,'44444',lines)
    assert not won
    fields={str(p):cofactor_spectrum(b,h,lines,p) for p in (0,1)}
    assert all(not set(d['liveOriginalK4ByMissingOwnerSites'])&
               {0,1,2} for d in fields.values())
    assert min(fields['0']['grade3GravitySupportDebtHistogram'])==0
    assert min(fields['1']['grade3GravitySupportDebtHistogram'])==3
    samples={}
    for key,word in witness[W].items():
        _,_,events=physical_board(W,word,lines)
        p=0 if key=='P0' else 1
        t=11 if key=='P0' else 12
        assert len(events)==1 and events[0][0]==t and events[0][1]==p
        samples[key]={
            'literalOriginalOneBasedWord':word,
            'soleFirstwinningPly':t,
            'winner':key,'originalK4WinningDirections':events[0][2]
        }
    report['boards'][f'{W}x6']={
        'originalK4WindowCount':len(lines),
        'actualSourceFirstwinFreeFiveCenterWord':'44444',
        'columnHeights':h,'originalOwnerCofactorFields':fields,
        'earliestPhysicallyPossibleOriginalFirstwinnerPly':{'P0':11,'P1':12},
        'explicitGravityLegalFirstwinnerWitnesses':samples
    }
assert report['boards']['6x6']['originalOwnerCofactorFields']['0']['liveOriginalK4ByMissingOwnerSites']=={3:18,4:19}
assert report['boards']['7x6']['originalOwnerCofactorFields']['0']['liveOriginalK4ByMissingOwnerSites']=={3:24,4:24}
assert report['boards']['6x6']['originalOwnerCofactorFields']['1']['liveOriginalK4ByMissingOwnerSites']=={3:14,4:19}
assert report['boards']['7x6']['originalOwnerCofactorFields']['1']['liveOriginalK4ByMissingOwnerSites']=={3:18,4:24}
print(json.dumps(report,indent=2))
