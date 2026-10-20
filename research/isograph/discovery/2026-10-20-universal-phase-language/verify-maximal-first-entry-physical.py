#!/usr/bin/env python3
"""Independent physical gravity, four-direction ray and static-color controls for a frozen multi-trap theorem.
The policy continuation DFS is VALIDATION only, not a source/WDL classifier.
No strong-optimal outcome labels, selected 28 terminal lines or solver outputs are used."""
from collections import Counter
from itertools import combinations
import json

def grid(W,H): return [[-1]*H for _ in range(W)]

def drop(board,c,player):
    for r,owner in enumerate(board[c]):
        if owner==-1:
            board[c][r]=player
            return r
    raise ValueError('illegal full-column drop')

def win_ray(board,c,r,player,K=4):
    W,H=len(board),len(board[0])
    assert board[c][r]==player
    for dc,dr in ((1,0),(0,1),(1,1),(1,-1)):
        count=1
        for sign in (1,-1):
            x,y=c+sign*dc,r+sign*dr
            while 0<=x<W and 0<=y<H and board[x][y]==player:
                count+=1
                x+=sign*dc
                y+=sign*dr
        if count>=K:return True
    return False

def replay_one_based(hist,W,H):
    board=grid(W,H)
    heights=[0]*W
    for n,ch in enumerate(hist):
        c=int(ch)-1
        assert 0<=c<W and heights[c]<H,('illegal original move',n,ch)
        row=drop(board,c,n%2)
        heights[c]+=1
        assert not win_ray(board,c,row,n%2),('early original firstwin',n,ch)
    return board,heights

def latent_upper_target(board,heights,c,owner):
    H=len(board[0])
    if heights[c]+1>=H:return False
    upper=heights[c]+1
    assert board[c][upper]==-1
    board[c][upper]=owner
    terminal=win_ray(board,c,upper,owner)
    board[c][upper]=-1
    return terminal

def first_entry_guard_independent(board,heights,traps,D):
    W,H=len(board),len(board[0])
    A=1-D
    E={(c,r) for c in range(W) if c not in traps for r in range(heights[c],H,2)}
    X={(c,heights[c]) for c in traps}
    failures=[]
    viable=0
    for c in range(W):
        for r in range(H):
            for dc,dr in ((1,0),(0,1),(1,1),(1,-1)):
                line=[(c+j*dc,r+j*dr) for j in range(4)]
                if not all(0<=x<W and 0<=y<H for x,y in line):continue
                if any(board[x][y]==A for x,y in line):continue
                residual={(x,y) for x,y in line if board[x][y]==-1}
                assert residual,('unexpected terminal D line',line)
                outside=residual-E
                if not outside or (len(outside)==1 and next(iter(outside)) in X):
                    failures.append((line,residual,outside))
                viable+=1
    return E,X,failures,viable

def validate_policy_all_opponent_choices(hist,W,H):
    board,heights=replay_one_based(hist,W,H)
    D=len(hist)%2
    A=1-D
    traps=[c for c in range(W) if latent_upper_target(board,heights,c,A)]
    assert traps,('no traps',hist)
    nontraps=[c for c in range(W) if c not in traps]
    assert all((H-heights[c])%2==0 for c in nontraps)
    E,X,bad,viable=first_entry_guard_independent(board,heights,traps,D)
    assert not bad,('source guard failure',hist,bad)
    m=sum((H-heights[c])//2 for c in nontraps)
    stats=Counter()
    depths=Counter()
    def check(B,hs,steps):
        assert steps<=2*m+2
        stats['responder_turn_nodes']+=1
        for c in range(W):
            if hs[c]>=H:continue
            stats['opponent_D_actions']+=1
            bb=[col[:] for col in B]
            hh=hs[:]
            row=drop(bb,c,D)
            hh[c]+=1
            assert not win_ray(bb,c,row,D),('D FIRSTWIN counterexample',hist,steps,c)
            arow=drop(bb,c,A)
            hh[c]+=1
            assert arow==row+1,('upper response inaccessible',hist,steps,c)
            if c in traps:
                assert hh[c]==heights[c]+2,('trap entered before final turn',hist,steps,c)
                assert win_ray(bb,c,arow,A),('trap failed to win',hist,steps,c)
                stats['trap_A_firstwins']+=1
                depths[steps+2]+=1
            elif win_ray(bb,c,arow,A):
                stats['early_A_firstwins']+=1
                depths[steps+2]+=1
            else:
                check(bb,hh,steps+2)
    check(board,heights,0)
    assert stats['opponent_D_actions']==stats['trap_A_firstwins']+stats['early_A_firstwins']+stats['responder_turn_nodes']-1
    return dict(W=W,H=H,history=hist,rank=len(hist),D=D,A=A,
                trapColumnsOneBased=[c+1 for c in traps],heights=heights,
                pairedReservoir=m,remainingDLineRequirements=viable,
                E=sorted(E),trapFrontiers=sorted(X),policyChecks=dict(stats),
                firstWinPlies=dict(sorted(depths.items())))

def count_balanced_original_K4free_static(hist,W,H):
    board,heights=replay_one_based(hist,W,H)
    need=(W*H+1)//2-sum(owner==0 for col in board for owner in col)
    future=[(c,r) for c in range(W) for r in range(heights[c],H)]
    lineMasks=[]
    for c in range(W):
        for r in range(H):
            for dc,dr in ((1,0),(0,1),(1,1),(1,-1)):
                line=[(c+j*dc,r+j*dr) for j in range(4)]
                if all(0<=x<W and 0<=y<H for x,y in line):
                    lineMasks.append(sum(1<<(x*H+y) for x,y in line))
    existing0=sum(1<<(c*H+r) for c in range(W) for r in range(H) if board[c][r]==0)
    fullMask=(1<<(W*H))-1
    answer=0
    for subset in combinations(range(len(future)),need):
        owner0=existing0
        for i in subset:
            c,r=future[i]
            owner0|=1<<(c*H+r)
        owner1=fullMask^owner0
        if all((owner0&mask)!=mask and (owner1&mask)!=mask for mask in lineMasks):
            answer+=1
    return answer

if __name__=='__main__':
    records=[]
    for W,H,hist in [
        (5,6,'51345313332312145115'),
        (6,6,'33334334114464156266564561'),
        (7,5,'624627765714441453277266325'),
        (7,6,'74254126764411163322446')]:
        row=validate_policy_all_opponent_choices(hist,W,H)
        row['balancedStaticOriginalK4free']=count_balanced_original_K4free_static(hist,W,H)
        records.append(row)
    draw='742541267644111633224467663171722753355553'
    board,heights=replay_one_based(draw,7,6)
    assert len(draw)==42 and heights==[6]*7
    assert records[-1]['balancedStaticOriginalK4free']==1031
    assert records[-1]['policyChecks']['opponent_D_actions']==512
    # Earlier rank16 true 7x6 source is physically tested, but a 26-cell
    # static K4-free coefficient expansion is intentionally NOT run here.
    early=validate_policy_all_opponent_choices('6326226316246461',7,6)
    assert early['policyChecks']['opponent_D_actions']==15071
    early['balancedStaticOriginalK4free']='NOT_RUN_26_FREE_CELLS'
    records.append(early)
    print(json.dumps({'sourcePolicyExamples':records,'legalCooperativeFull42DrawOnProvedWinSource':draw},indent=2))
