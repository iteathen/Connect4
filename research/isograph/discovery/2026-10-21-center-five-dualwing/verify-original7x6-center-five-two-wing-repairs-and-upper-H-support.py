#!/usr/bin/env python3
"""Original 7x6 five-center conditional two-wing repair and support donation.
Rebuild ALL 69 physical four-way H/V/R/F K4s and validate literal gravity,
turn order and firstwinner. The source P0 policy is constructed algebraically,
not by a Connect4 game solver. No historical 28 winning-line inputs.
"""
from collections import Counter
import json

W,H=7,6
D=(('H',1,0),('V',0,1),('R',1,1),('F',1,-1))
LINES=[(d,tuple((c+i*dx,r+i*dy) for i in range(4)))
       for c in range(W) for r in range(H) for d,dx,dy in D
       if all(0<=c+i*dx<W and 0<=r+i*dy<H for i in range(4))]
assert len(LINES)==69

def new_board(word='44444'):
    b=[[-1]*W for _ in range(H)]
    h=[0]*W
    for t,ch in enumerate(word):
        c=int(ch)-1
        assert 0<=c<W and h[c]<H
        r=h[c];h[c]+=1;b[r][c]=t%2
        assert not any(all(b[y][x]==t%2 for x,y in line) for _,line in LINES)
    return (b,h,len(word),word)

def physical_ray(b,c,r,p):
    for _,dx,dy in D:
        n=1
        for sign in (-1,1):
            x,y=c+sign*dx,r+sign*dy
            while 0<=x<W and 0<=y<H and b[y][x]==p:
                n+=1
                x+=sign*dx;y+=sign*dy
        if n>=4:return True
    return False

def legal(q):
    return [c+1 for c,h in enumerate(q[1]) if h<H]

def actual_move(q,c):
    b=[row[:] for row in q[0]]
    h=q[1][:]
    p=q[2]%2
    r=h[c-1]
    assert 1<=c<=W and r<H
    h[c-1]+=1
    b[r][c-1]=p
    via_windows=any(all(b[y][x]==p for x,y in line) for _,line in LINES)
    assert via_windows==physical_ray(b,c-1,r,p)
    return (b,h,q[2]+1,q[3]+str(c)),via_windows,r

LEFT={1,2,3}
RIGHT={5,6,7}
counts=Counter()
classification=Counter()
samples={}

for firstP1 in range(1,8):
    q6,winner,_=actual_move(new_board(),firstP1)
    assert not winner
    if firstP1==4:
        # Full center; the P0 two-stone quartic P4 path starts at c4,c5.
        q7,winner,_=actual_move(q6,5)
        assert not winner
        for reply8 in legal(q7):
            q8,winner,_=actual_move(q7,reply8)
            assert not winner
            if reply8==3:pivot9=6
            elif reply8==6:pivot9=3
            elif reply8==2:pivot9=6
            else:pivot9=3
            q9,winner,_=actual_move(q8,pivot9)
            assert not winner
            for reply10 in legal(q9):
                q10,winner,_=actual_move(q9,reply10)
                assert not winner
                bottomP1={c+1 for c in range(W) if q10[0][0][c]==1}
                both=bool(bottomP1&LEFT) and bool(bottomP1&RIGHT)
                possible_P0_win11=any(actual_move(q10,c)[1] for c in legal(q10))
                assert both or possible_P0_win11,('falsifier',q10[3])
                if not both:assert possible_P0_win11
                label='both-wings-repaired' if both else 'P0-firstwins-ply11'
                classification['P1move6CENTER/'+label]+=1
                samples.setdefault(label,q10[3])
                counts['allOriginalLegalP1Ply10Tests']+=1
    else:
        untouched=sorted(RIGHT if firstP1 in LEFT else LEFT)
        q7,winner,_=actual_move(q6,untouched[0])
        assert not winner
        for reply8 in legal(q7):
            q8,winner,row8=actual_move(q7,reply8)
            assert not winner
            counts['allOriginalLegalP1Ply8Tests']+=1
            if reply8 in untouched and row8==0:
                classification['P1move6WING/both-wings-repaired-by8']+=1
                continue
            q9,winner,_=actual_move(q8,untouched[1])
            assert not winner
            for reply10 in legal(q9):
                q10,winner,_=actual_move(q9,reply10)
                assert not winner
                bottomP1={c+1 for c in range(W) if q10[0][0][c]==1}
                both=bool(bottomP1&LEFT) and bool(bottomP1&RIGHT)
                possible_P0_win11=any(actual_move(q10,c)[1] for c in legal(q10))
                assert both or possible_P0_win11,('falsifier',q10[3])
                if not both:assert possible_P0_win11
                label='both-wings-repaired' if both else 'P0-firstwins-ply11'
                classification['P1move6WING/'+label]+=1
                samples.setdefault(label,q10[3])
                counts['allOriginalLegalP1Ply10Tests']+=1

def support_grade(q,row0,start):
    pts=tuple((c,row0) for c in range(start,start+4))
    assert ('H',pts) in LINES
    b,h=q[0],q[1]
    if any(b[y][x]==1 for x,y in pts):
        return None
    missing={(x,y) for x,y in pts if b[y][x]==-1}
    supported=set()
    for c in {x for x,y in missing}:
        high=max(y for x,y in missing if x==c)
        supported.update((c,y) for y in range(h[c],high+1))
    return len(missing),len(supported-missing)

before=new_board()
transfer={}
for c in sorted(LEFT|RIGHT):
    after,win,row=actual_move(before,c)
    assert not win and row==0
    counts_by_row={}
    for row0 in (0,2,4):
        amount=0
        for start in range(4):
            span=range(start,start+4)
            if 3 not in span or c-1 not in span:
                continue
            pre=support_grade(before,row0,start)
            post=support_grade(after,row0,start)
            if row0==0:
                assert post is None
            else:
                assert pre is not None and post is not None
                assert pre[0]==post[0]==3 and pre[1]-post[1]==1
            amount+=1
        counts_by_row[row0+1]=amount
    assert counts_by_row[1]==counts_by_row[3]==counts_by_row[5]
    transfer[str(c)]=counts_by_row

assert [transfer[str(c)][1] for c in (1,2,3,5,6,7)]==[1,2,3,3,2,1]
assert counts['allOriginalLegalP1Ply8Tests']==42
assert counts['allOriginalLegalP1Ply10Tests']==240
assert classification['P1move6WING/P0-firstwins-ply11']==174
assert classification['P1move6WING/both-wings-repaired']==30
assert classification['P1move6WING/both-wings-repaired-by8']==12
assert classification['P1move6CENTER/P0-firstwins-ply11']==28
assert classification['P1move6CENTER/both-wings-repaired']==8

print(json.dumps({
 'schema':1,'date':'2026-10-21','allOriginalK4Windows':69,
 'truePhysicalFirstFiveMovePrefix':'44444',
 'sourcePolicy':'P0 attacks untouched opposite wing if P1 move6 takes a wing bottom; P0 chooses c5 then overlapping c3/c6 P4 path pivots if P1 move6 takes center top.',
 'fullP1ResponseValidation':dict(counts),
 'classification':dict(classification),'literalExamples':samples,
 'individualP1BottomBlockVsUpperGravitySupportChange':transfer,
 'theorem':'By physical ply10 P1 must have one bottom stone in each wing or P0 FIRSTWINS by11. Any P1 bottom site c blocks a_c P0 H row1 K4s and reduces the gravity-support debt of a_c live P0 H row3 K4s and a_c live row5 K4s.',
 'noHistoric28OrSolverInputs':True,
 'rootForcedP0WinnerProved':False
},indent=2))
