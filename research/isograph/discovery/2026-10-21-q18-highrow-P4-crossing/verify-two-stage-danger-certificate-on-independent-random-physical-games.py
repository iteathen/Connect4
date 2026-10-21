#!/usr/bin/env python3
"""Independent true original7x6 directional-RAY control for structural two-stage
P0 danger-intersection certificate from ANY real P1-to-move q.
Short 4-ply P1/P0/P1/P0 physical test is validation ONLY.
No solved root WDL, historical strong28 K4 labels or game solver.
"""
from pathlib import Path
from contextlib import redirect_stdout
import runpy,io,random,json
from collections import Counter
producer=Path(__file__).with_name(
 'verify-any-P1-turn-two-stage-singleton-fork-danger-certificate.py')
with redirect_stdout(io.StringIO()):
    module=runpy.run_path(str(producer))
source_certificate=module['source_certificate']
W,H=7,6
DIR=((1,0),(0,1),(1,1),(1,-1))
def literal_board(q):
    a,b,h,t=q
    return [[0 if a&(1<<(c+7*r)) else
             (1 if b&(1<<(c+7*r)) else -1)
             for c in range(W)] for r in range(H)]
def actual_ray(b,e,p):
    c,r=e%W,e//W
    for dx,dy in DIR:
        n=1
        for k in (-1,1):
            x,y=c+k*dx,r+k*dy
            while 0<=x<W and 0<=y<H and b[y][x]==p:
                n+=1
                x+=k*dx;y+=k*dy
        if n>=4:return True
    return False
def legal(q):
    return [c for c in range(W) if q[2][c]<H]
def physical_move(q,c):
    a,b,h,t=q
    assert h[c]<H
    hs=list(h);e=c+7*hs[c];hs[c]+=1
    p=t%2
    newbit=(1<<e)
    qq=(a|newbit,b,tuple(hs),t+1) if p==0 else (
         a,b|newbit,tuple(hs),t+1)
    return qq,actual_ray(literal_board(qq),e,p)
def literal_p0_forces_firstwin_within_four(q):
    assert q[3]%2==1
    for firstP1 in legal(q):
        q1,P1win=physical_move(q,firstP1)
        if P1win:return False
        canP0=False
        for replyP0 in legal(q1):
            q2,P0win=physical_move(q1,replyP0)
            if P0win:canP0=True;break
            allP1Lose=True
            for secondP1 in legal(q2):
                q3,P1win2=physical_move(q2,secondP1)
                if P1win2 or not any(
                    physical_move(q3,lastP0)[1]
                    for lastP0 in legal(q3)):
                    allP1Lose=False;break
            if allP1Lose:
                canP0=True;break
        if not canP0:return False
    return True
seed=20261021
randomizer=random.Random(seed)
qempty=(0,0,(0,)*W,0)
stats=Counter()
samples=[]
for g in range(2000):
    q=qempty
    while True:
        if q[3]%2==1:
            stats['actualFirstwinfreeP1ToMoveVisits']+=1
            proof=source_certificate(q)
            if proof['certified']:
                stats['sourceCertificates']+=1
                stats['category_'+proof['reason']]+=1
                assert literal_p0_forces_firstwin_within_four(q),(
                    'false positive',q,proof)
                stats['independentFourPlyRayValidations']+=1
                if len(samples)<8:
                    samples.append({'ply':q[3],'source':proof,
                      'originalColumnHeights':list(q[2])})
        choices=legal(q)
        if not choices:break
        col=randomizer.choice(choices)
        q,firstwin=physical_move(q,col)
        if firstwin:break
    stats['randomTrueFirstwinnerStoppedGames']+=1
assert stats['actualFirstwinfreeP1ToMoveVisits']==20556
assert stats['sourceCertificates']==337
assert stats['category_block-releases-early-S']==105
assert stats['category_compulsory-singleton-plus-two-site-fork']==232
assert stats['independentFourPlyRayValidations']==337
print(json.dumps({'schema':1,'date':'2026-10-21','randomSeed':seed,
 'originalTrueGravityAndDirectionalRay':True,
 'sourceOnlyStructuralCertificate':True,
 'boundedFourPlyGameValueChecksForIndependentFalsificationOnly':True,
 'counts':dict(stats),'sample':samples,
 'conclusion':'Zero false positive source defensive-obligation certificates in independent legal firstwinfree random positions, but this is a sufficient local rule and NOT original7x6 empty-root WDL.'},indent=2))
