#!/usr/bin/env python3
"""Independent original physical 7x6 K4 odd-base interference falsifier.
The source policy is frozen separately. This enumerates ONLY attacker choices
against ONE deterministic respondent policy; it is not a future-game WDL solver.
"""
from collections import Counter
from itertools import combinations
import json

W,H,K = 7,6,4
HISTORY = '2121136126673113635772'
COOP_DRAW_SUFFIX = '45444445555777336622'
DIRECTIONS = ((1,0),(0,1),(1,1),(1,-1))

def original_lines():
    lines=[]
    for c in range(W):
        for r in range(H):
            for dc,dr in DIRECTIONS:
                cells=[(c+i*dc,r+i*dr) for i in range(K)]
                if all(0<=x<W and 0<=y<H for x,y in cells):
                    lines.append(tuple(x*H+y for x,y in cells))
    assert len(lines)==69
    return lines

def firstwin_ray(board,c,r,p):
    assert board[c*H+r]==p
    for dc,dr in DIRECTIONS:
        total=1
        for sign in (-1,1):
            x,y=c+sign*dc,r+sign*dr
            while 0<=x<W and 0<=y<H and board[x*H+y]==p:
                total+=1
                x+=sign*dc; y+=sign*dr
        if total>=K:return True
    return False

def replay_history(hist):
    B=[-1]*(W*H); hs=[0]*W
    for n,ch in enumerate(hist):
        c=int(ch)-1
        assert 0<=c<W and hs[c]<H,(n,ch,'illegal column')
        r=hs[c];hs[c]+=1;B[c*H+r]=n%2
        assert not firstwin_ray(B,c,r,n%2),(n+1,'earlier firstwin')
    return B,hs

def latent_A_singleton(B,hs,c,A):
    if H-hs[c]<2:return False
    r=hs[c]+1
    assert B[c*H+r]==-1
    B[c*H+r]=A
    result=firstwin_ray(B,c,r,A)
    B[c*H+r]=-1
    return result

def source_pair_barrier(B,hs):
    D=len(HISTORY)%2;A=1-D; original=original_lines()
    traps=[c for c in range(W) if latent_A_singleton(B,hs,c,A)]
    outside=[c for c in range(W) if c not in traps]
    odd=[c for c in outside if (H-hs[c])%2]
    assert traps==[3] and odd==[4,6] and A==1
    pairs=list(zip(odd[::2],odd[1::2]))
    E=set();U=set();X={c*H+hs[c] for c in traps}
    for c in outside:
        start=hs[c]+((H-hs[c])%2)
        if start>hs[c]:U.add(c*H+hs[c])
        for r in range(start,H,2):E.add(c*H+r)
    counts=Counter();pairKilled=[]
    for line in original:
        if any(B[e]==A for e in line):continue
        G={e for e in line if B[e]==-1}
        assert G
        if any(e not in E|U|X for e in G):counts['inaccessible']+=1
        elif any(a*H+hs[a] in G and b*H+hs[b] in G for a,b in pairs):
            counts['odd_base_pair']+=1
            pairKilled.append({'originalK4':[(e//H+1,e%H+1) for e in line],
                               'Dmissing':[(e//H+1,e%H+1) for e in sorted(G)]})
        elif len(G&X)>=2:counts['two_traps']+=1
        else:raise AssertionError(('D counterfirstwin remains possible in model',G))
    assert counts['odd_base_pair']==1 and pairKilled[0]['originalK4']==[(4,1),(5,2),(6,3),(7,4)]
    return {'respondent':A,'attacker':D,'trapColumnsOneBased':[c+1 for c in traps],
            'matchedOddBaseColumnsOneBased':[[a+1,b+1] for a,b in pairs],
            'E':[ (e//H+1,e%H+1) for e in sorted(E)],
            'U':[ (e//H+1,e%H+1) for e in sorted(U)],
            'X':[ (e//H+1,e%H+1) for e in sorted(X)],
            'originalResidualLineDischarge':dict(counts),
            'pairDischargedDiagonal':pairKilled,
            'nontrapResponsePairs':sum((H-hs[c]) for c in outside)//2,
            'maxFurtherPlies':2*(sum(H-hs[c] for c in outside)//2)+2},pairs,traps

def validate_all_P0_options(board,hs,pairs,traps,maxPlies):
    D=len(HISTORY)%2;A=1-D
    match={c:d for a,b in pairs for c,d in ((a,b),(b,a))}
    stats=Counter();winDepths=Counter()
    def visit(B,h,untriggered,plies):
        assert plies<=maxPlies
        stats['P0_turn_positions']+=1
        for c in range(W):
            if h[c]>=H:continue
            stats['P0_move_choices']+=1
            b=B[:]; hh=h[:];r=hh[c]; hh[c]+=1;b[c*H+r]=D
            assert not firstwin_ray(b,c,r,D),('unexpected P0 K4 before reply',plies,c)
            if c in traps:mate=c
            elif c in untriggered:mate=match[c]
            else:mate=c
            assert hh[mate]<H,('mate inaccessible',plies,c,mate)
            mr=hh[mate];hh[mate]+=1;b[mate*H+mr]=A
            if c in traps:
                assert mate==c and mr==r+1
                assert firstwin_ray(b,mate,mr,A),'latent trap not a K4'
            elif c not in untriggered:
                assert mr==r+1,'upper mate wrong physical support'
            nextPending=untriggered-{c,mate}
            if firstwin_ray(b,mate,mr,A):
                stats['P1_firstwins']+=1;winDepths[plies+2]+=1
            else:
                assert c not in traps,'trap cannot survive respondent move'
                visit(b,hh,nextPending,plies+2)
    visit(board,hs,set(match),0)
    assert stats['P0_move_choices']==stats['P1_firstwins']+stats['P0_turn_positions']-1
    assert stats['P0_move_choices']==7183 and stats['P1_firstwins']==3592
    return {'stats':dict(stats),'winDepthsFurtherPlies':dict(sorted(winDepths.items()))}

def static_count(B,hs):
    original=original_lines();line_masks=[sum(1<<e for e in line) for line in original]
    future=[c*H+r for c in range(W) for r in range(hs[c],H)]
    P0mask=sum(1<<e for e,o in enumerate(B) if o==0)
    total0=(W*H+1)//2
    required0=total0-sum(o==0 for o in B)
    allMask=(1<<(W*H))-1
    result=0
    for chosen in combinations(future,required0):
        own0=P0mask
        for e in chosen:own0|=1<<e
        own1=allMask^own0
        if all((own0&line)!=line and (own1&line)!=line for line in line_masks):result+=1
    assert result==551
    return result

def main():
    board,hs=replay_history(HISTORY)
    assert hs==[6,4,4,0,1,4,3]
    cert,pairs,traps=source_pair_barrier(board,hs)
    policy=validate_all_P0_options(board,hs,pairs,traps,cert['maxFurtherPlies'])
    balanced=static_count(board,hs)
    finalBoard,finalHeights=replay_history(HISTORY+COOP_DRAW_SUFFIX)
    assert len(HISTORY+COOP_DRAW_SUFFIX)==42 and finalHeights==[H]*W
    print(json.dumps({'status':'PASS_DEDUCTIVE_SOURCE_GUARD_AND_INDEPENDENT_7183_ADVERSARIAL_PHYSICAL_CHOICE_CONTROLS',
      'scope':'original true physical 7x6 K4, P0 first/alternating, firstwin stop',
      'historyOneBased':HISTORY,'rank':len(HISTORY),'heights':hs,
      'original69WindowSourceCertificate':cert,
      'independentPhysicalPolicy':policy,
      'staticBalancedK4FreeTerminals':balanced,
      'actualLegalCooperativeDrawOneBased':HISTORY+COOP_DRAW_SUFFIX,
      'claimBoundary':'Sufficient signed P1 WIN from this q, NOT universal WDL/root win prediction, no external oracle input, maintained Node26 CI not run'},indent=2))
if __name__=='__main__':main()
