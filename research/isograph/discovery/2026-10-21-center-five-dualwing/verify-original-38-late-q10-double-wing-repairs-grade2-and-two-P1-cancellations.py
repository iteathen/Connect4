#!/usr/bin/env python3
"""Real ORIGINAL Connect4 7x6 K4 late two-wing center-five forcing controls.
Recreates conditional P0 policy from true owner/gravity state. Cross-checks
69 physical H/V/R/F K4 windows against independent four-way ray. Uses no
historical 28 firstwinning line IDs, root solved-WDL labels, or full solver.
"""
from collections import Counter
import json

W,H=7,6
DIR=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))
LINES=[(o,tuple((c+i*dx,r+i*dy) for i in range(4)))
       for c in range(W) for r in range(H) for o,dx,dy in DIR
       if all(0<=c+i*dx<W and 0<=r+i*dy<H for i in range(4))]
assert len(LINES)==69

def actual_ray(b,c,r,p):
    for _,dx,dy in DIR:
        n=1
        for sign in (-1,1):
            x,y=c+sign*dx,r+sign*dy
            while 0<=x<W and 0<=y<H and b[y][x]==p:
                n+=1;x+=sign*dx;y+=sign*dy
        if n>=4:return True
    return False

def replay(word):
    b=[[-1]*W for _ in range(H)]
    h=[0]*W
    for t,ch in enumerate(word):
        c=int(ch)-1
        assert 0<=c<W and h[c]<H
        r=h[c]
        h[c]+=1
        b[r][c]=t%2
        original=any(all(b[y][x]==t%2 for x,y in cells)
                     for _,cells in LINES)
        assert original==actual_ray(b,c,r,t%2)
        assert not original,('premature WIN',word,t+1)
    return b,h

def legal_columns(h):
    return [c+1 for c in range(W) if h[c]<H]

def direct_firstwin_columns(b,h,p):
    out=[]
    for col in legal_columns(h):
        c=col-1
        r=h[c]
        b[r][c]=p
        by_windows=any(all(b[y][x]==p for x,y in cells)
                       for _,cells in LINES)
        assert by_windows==actual_ray(b,c,r,p)
        b[r][c]=-1
        if by_windows:out.append(col)
    return out

def current_owner_grade(b,h,p):
    out=[]
    for orientation,cells in LINES:
        if any(b[y][x]==1-p for x,y in cells):continue
        missing={(x,y) for x,y in cells if b[y][x]==-1}
        support=set()
        for c in {x for x,y in missing}:
            peak=max(y for x,y in missing if x==c)
            support.update((c,y) for y in range(h[c],peak+1))
        out.append({
            'orientation':orientation,
            'missingCount':len(missing),
            'gravitySupportDebt':len(support-missing),
            'physicalSourceK4':[(x+1,y+1) for x,y in cells],
            'missingPhysicalCells':sorted((x+1,y+1) for x,y in missing)
        })
    return out

def independent_physical_mate3(b,h):
    # P0 current move11, P1 move12, P0 terminal move13 only.
    choices=[]
    for col in legal_columns(h):
        c=col-1
        r=h[c]
        b[r][c]=0
        h[c]+=1
        guaranteed=bool(actual_ray(b,c,r,0))
        if not guaranteed:
            guaranteed=True
            for reply in legal_columns(h):
                d=reply-1
                rr=h[d]
                b[rr][d]=1
                h[d]+=1
                if actual_ray(b,d,rr,1):
                    guaranteed=False
                elif not direct_firstwin_columns(b,h,0):
                    guaranteed=False
                b[rr][d]=-1
                h[d]-=1
        b[r][c]=-1
        h[c]-=1
        if guaranteed:choices.append(col)
    return choices

cases=[]
LEFT={1,2,3}
RIGHT={5,6,7}
for p6 in range(1,8):
    if p6==4:
        p7=5
        for p8 in legal_columns(replay('44444'+str(p6)+str(p7))[1]):
            if p8==3:p9=6
            elif p8==6:p9=3
            elif p8==2:p9=6
            else:p9=3
            s9='44444'+str(p6)+str(p7)+str(p8)+str(p9)
            for p10 in legal_columns(replay(s9)[1]):
                word=s9+str(p10)
                b,h=replay(word)
                bottomP1={c+1 for c in range(W) if b[0][c]==1}
                if bottomP1&LEFT and bottomP1&RIGHT:
                    cases.append(('center',word,b,h))
    else:
        opposite=[5,6,7] if p6 in LEFT else [1,2,3]
        p7=opposite[0]
        s7='44444'+str(p6)+str(p7)
        for p8 in legal_columns(replay(s7)[1]):
            b8,h8=replay(s7+str(p8))
            if p8 in opposite and b8[0][p8-1]==1:
                # EARLY successful P1 repair at move8: separately scoped,
                # not a late repair in the present move10 study.
                continue
            p9=opposite[1]
            s9=s7+str(p8)+str(p9)
            for p10 in legal_columns(replay(s9)[1]):
                word=s9+str(p10)
                b,h=replay(word)
                bottomP1={c+1 for c in range(W) if b[0][c]==1}
                if bottomP1&LEFT and bottomP1&RIGHT:
                    cases.append(('wing',word,b,h))
assert len(cases)==38

records=[]
for branch,word,b,h in cases:
    immediate=direct_firstwin_columns(b,h,0)
    originalP0Grade2=[g for g in current_owner_grade(b,h,0)
                      if g['missingCount']==2]
    originalP1Grade2=[g for g in current_owner_grade(b,h,1)
                      if g['missingCount']==2]
    mate3=independent_physical_mate3(b,h)
    records.append({
        'branch':branch,'literalWord':word,'originalP0ImmediateMove11':immediate,
        'P0Mate3Move11Choices':mate3,'P0grade2SourceK4':originalP0Grade2,
        'P1grade2SourceK4':originalP1Grade2
    })

survive=[v for v in records if not v['originalP0ImmediateMove11']]
exceptions=[v for v in survive if not v['P0grade2SourceK4']]
signatures=Counter(
    (v['branch'],bool(v['originalP0ImmediateMove11']),
     len(v['P0grade2SourceK4']),bool(v['P0Mate3Move11Choices']))
    for v in records)
allUnique=set()
surviveUnique=set()
for v in records:
    b,h=replay(v['literalWord'])
    marker=(tuple(tuple(row) for row in b),tuple(h))
    allUnique.add(marker)
    if not v['originalP0ImmediateMove11']:
        surviveUnique.add(marker)

assert len(records)==38 and len(allUnique)==28
assert len(survive)==24 and len(surviveUnique)==18
assert sum(bool(v['P0grade2SourceK4']) for v in survive)==22
assert [v['literalWord'] for v in exceptions]==['4444435567','4444445632']
assert all(not v['P0Mate3Move11Choices'] for v in survive)
hist=Counter((x['orientation'],x['gravitySupportDebt']) for v in survive
             for x in v['P0grade2SourceK4'])
assert hist=={('F',2):6,('F',1):1,('R',3):8,('R',2):6,('R',1):1}

print(json.dumps({
    'schema':1,'date':'2026-10-21','originalK4Windows':len(LINES),
    'conditionalSourceFirstFive':'44444',
    'lateBothWingRepairHistoriesAtQ10':len(records),
    'distinctActualQ10BoardsIn38Histories':len(allUnique),
    'P1SurvivesP0ImmediateK4Move11HistoryCount':len(survive),
    'distinctActualSurvivingQ10Boards':len(surviveUnique),
    'survivorsWithP0LiveSourceGrade2Diagonal':22,
    'survivorsWithNoP0LiveSourceGrade2':2,
    'sourceP0Grade2OrientationAndGravityDebt':[
        {'orientation':o,'supportDebt':d,'count':n}
        for (o,d),n in sorted(hist.items())],
    'P0GuaranteedShortMate3AtSurvivingQ10':0,
    'exceptionalP1Preblocks':[
        {'literalWord':v['literalWord'],
         'P1OriginalLiveTwoMissingK4Count':len(v['P1grade2SourceK4'])}
        for v in exceptions],
    'caseHistogram':[
        {'branch':b,'P0ImmediateWin11':imm,'P0grade2Count':g,
         'P0Mate3':mate,'histories':n}
        for (b,imm,g,mate),n in sorted(signatures.items())],
    'qualification':'Firstwinfree real original bounded q10 check of a predeclared source P0 conditional policy, NOT original empty-root forced WIN.',
    'solverOrHistorical28Used':False
},indent=2))
