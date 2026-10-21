#!/usr/bin/env python3
"""Source-only original-K4 31-syzygy graded firstwin-charge and local-star controls.
The 5040 histories are cooperative full gravity shuffles from one original valid
rank32 source, NOT perfect play or a future strategic WDL computation.
No historical strong28 IDs, oracle, or solver evaluation are used.
"""
from collections import Counter, defaultdict
from itertools import combinations, permutations
import json
import numpy as np
import sympy as sp

DIRS=((1,0),(0,1),(1,1),(1,-1))
def orig_lines(W,H):
    return [tuple((r+i*dy)*W+(c+i*dx) for i in range(4))
            for c in range(W) for r in range(H) for dx,dy in DIRS
            if all(0<=c+i*dx<W and 0<=r+i*dy<H for i in range(4))]

def rank_mod(M,p=1009):
    A=np.asarray(M,dtype=np.int64).copy()%p
    nr,nc=A.shape; k=0
    for c in range(nc):
        ix=np.flatnonzero(A[k:,c])
        if not len(ix):continue
        j=k+int(ix[0])
        if j!=k:A[[j,k]]=A[[k,j]]
        inv=pow(int(A[k,c]),p-2,p)
        A[k,c:]=(A[k,c:]*inv)%p
        if k+1<nr:
            mul=A[k+1:,c].copy()
            if np.any(mul):
                A[k+1:,c:]=(A[k+1:,c:]-mul[:,None]*A[None,k,c:])%p
        k+=1
        if k==nr:break
    return k

def incidence(LL,n):
    A=np.zeros((len(LL),n),dtype=np.int64)
    for j,L in enumerate(LL):
        for x in L:A[j,x]=1
    return A

def ray_won(B,W,H,e,p):
    c,r=e%W,e//W
    for dx,dy in DIRS:
        k=1
        for sign in (-1,1):
            x,y=c+sign*dx,r+sign*dy
            while 0<=x<W and 0<=y<H and B[y*W+x]==p:
                k+=1;x+=sign*dx;y+=sign*dy
        if k>=4:return True
    return False

def star_controls():
    out=[]
    for W,H in [(5,5),(5,6),(6,5),(6,6),(7,5),(7,6),(8,6),(10,6),(8,8)]:
        LL=orig_lines(W,H);A=incidence(LL,W*H)
        full=rank_mod(A)
        counts=Counter();failure=[]
        for site in range(W*H):
            r=rank_mod(A[A[:,site]==0,:])
            k=full-r
            counts[k]+=1
            if k!=1:failure.append([site%W+1,site//W+1,k])
        out.append(dict(W=W,H=H,lines=len(LL),physicalIncidenceRank=full,
                        localStarBlindnessDimensions=dict(sorted(counts.items())),
                        extraInvisibleStarSites=failure))
    return out

def temporal_control():
    W,H=7,6
    LL=orig_lines(W,H);n=len(LL)
    A=incidence(LL,W*H)
    C=sp.Matrix(A.astype(int).tolist()).T
    Z=C.nullspace()
    assert C.rank()==38 and len(Z)==31
    assert all(d.q==1 for z in Z for d in z)
    ZM=np.asarray([[int(u) for u in z] for z in Z],dtype=np.int64)
    bysite=[[] for _ in range(W*H)]
    for j,L in enumerate(LL):
        for e in L:bysite[e].append(j)

    prefix="12345612345665432165432112345612"
    assert len(prefix)==32
    B0=[-1]*(W*H);hs0=[0]*W
    for t,letter in enumerate(prefix):
        c=int(letter)-1;p=t%2
        e=hs0[c]*W+c;hs0[c]+=1;B0[e]=p
        assert not ray_won(B0,W,H,e,p)
    assert [H-u for u in hs0]==[0,0,1,1,1,1,6]

    stats=Counter();firstPly=Counter()
    signatureOwners=defaultdict(set);signatureCounts=Counter()
    hypotSig=Counter();lateNonzero=0
    nonzeroWinButInvisible=0
    actualSourceJetsBeforeWinNonzero=0
    firstWinningMultiplicity=Counter()
    firstwinnerEventRankInput=[]
    firstwinnerSignatures=[]
    fullFinalBothOwnerK4=0
    for sparse in combinations(range(10),4):
        for perm in permutations((2,3,4,5)):
            suffix=[6]*10
            for idx,c in zip(sparse,perm):suffix[idx]=c
            bd=B0.copy();hh=hs0.copy()
            win=None; signedInc=np.zeros(31,dtype=np.int64)
            hypEver0=hypEver1=False
            for t,c in enumerate(suffix):
                p=(32+t)%2;e=hh[c]*W+c;hh[c]+=1;bd[e]=p
                winners=[j for j in bysite[e] if all(bd[x]==p for x in LL[j])]
                assert bool(winners)==ray_won(bd,W,H,e,p)
                if winners:
                    inc=np.sum(ZM[:,winners],axis=1,dtype=np.int64)*((-1)**p)
                    signedInc+=inc
                    if p==0:hypEver0=True
                    else:hypEver1=True
                    if win is None:
                        win=(p,33+t,tuple(map(int,inc)),len(winners),winners)
                if win is None:
                    # All full-line charges must be zero on legal nonterminal states.
                    actualSourceJetsBeforeWinNonzero+=int(bool(np.any(signedInc)))
            if win is None:
                state="DRAW";signature=(0,)*31
                stats[state]+=1
            else:
                pp,ply,signature,mult,wins=win
                state="P0_WIN" if pp==0 else "P1_WIN"
                stats[state]+=1;firstPly[(ply,state)]+=1
                firstWinningMultiplicity[mult]+=1
                firstwinnerEventRankInput.append([int(j in wins) for j in range(n)])
                if not any(signature):nonzeroWinButInvisible+=1
                firstwinnerSignatures.append(signature)
            signatureOwners[signature].add(state)
            signatureCounts[(state,signature)]+=1
            hypot=tuple(map(int,signedInc))
            hypotSig[hypot]+=1
            lateNonzero+=int(hypot!=signature)
            fullFinalBothOwnerK4+=int(hypEver0 and hypEver1)
    assert sum(stats.values())==5040
    assert stats==Counter({"P0_WIN":1350,"P1_WIN":564,"DRAW":3126})
    assert not actualSourceJetsBeforeWinNonzero
    vs=list(signatureOwners)
    r=rank_mod(np.asarray(vs,dtype=np.int64))
    assert len(vs)==13 and r==7
    collide={str(v):sorted(w) for v,w in signatureOwners.items() if len(w)>1}
    assert not collide
    assert nonzeroWinButInvisible==0
    return {
        'originalK4Lines':n,'sourceRationalIncidenceRank':38,
        'sourceSyzygyDimension':31,'sourcePrefixOneBased':prefix,
        'allFullGravityFutureSuffixes':5040,'actualFirstwinnerCounts':dict(stats),
        'actualFirstwinnerAbsolutePlyHistogram':
            {f"{ply}/{state}":v for (ply,state),v in sorted(firstPly.items())},
        'firstwinningMultiplicityHistogram':dict(firstWinningMultiplicity),
        'allOriginalActualNonterminal31ChargesIdenticallyZero':True,
        'winsWithAll31ChargeSignatureZero':nonzeroWinButInvisible,
        'terminalDistinctFull31Signatures':len(vs),
        'terminalSignatureSpanRank':r,
        'observedTerminalSignatureWinnerOrDrawCollisions':collide,
        'hypotheticalFull42DistinctChargeSignatures':len(hypotSig),
        'hypotheticalFull42ChargeDiffersFromActualStopped':lateNonzero,
        'hypotheticalFull42BothOwnersCompleteK4Count':fullFinalBothOwnerK4,
        'sourceAll69FirstwinnerLineEventMatrixRankMod1009':
            rank_mod(np.asarray(firstwinnerEventRankInput,dtype=np.int64)),
        'scopeWarning':'All 5040 paths are one actual q32 follow-up cohort, NOT perfect play; terminal charge collision-free in this cohort is NOT a universal game classifier.'
    }

if __name__=='__main__':
    print(json.dumps({
        'schema':1,'date':'2026-10-20',
        'status':'ORIGINAL_PHYSICAL_FINITE_CONTROLS_REPRODUCIBLE_NO_STRATEGIC_WDL',
        'sourceStarProjection':star_controls(),
        'sourceCubicSyzygyTimeCharge':temporal_control(),
        'qualificationBoundary':[
          'Every full-line charge zero at any actual firstwinner-free q',
          'All-star firstwinner (possible spectral dark win) not ruled out',
          'Maintained Node26 CI and external proof assistant not run',
          'Production solver and qualified IsoGraph1.2 untouched'
        ]
    },indent=2))
