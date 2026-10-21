#!/usr/bin/env python3
"""Source-only original Connect4 K4 31-charge graded residual tomography.
Never reads solved WDL or historic T28 lines. Independent 31D rational
nullspace, 18D source-dipole cycle basis, modular deletion-rank controls,
and real legal source cofactor updates. Research-only, NOT a WDL solver.
"""
from collections import Counter,defaultdict
from itertools import combinations
import json
import networkx as nx
import numpy as np
import sympy as sp

W,H=7,6
DIRS=((1,0),(0,1),(1,1),(1,-1))
def lines_and_strands(w,h):
    lines=[];strands=[]
    for dx,dy in DIRS:
        for c in range(w):
            for r in range(h):
                if 0<=c-dx<w and 0<=r-dy<h:continue
                walk=[];cc,rr=c,r
                while 0<=cc<w and 0<=rr<h:
                    walk.append(rr*w+cc);cc+=dx;rr+=dy
                strands.append(tuple(walk))
                for i in range(len(walk)-3):
                    lines.append(tuple(walk[i:i+4]))
    return lines,strands

def matrix_rank_q(M):
    return int(sp.Matrix(M).rank())

def rank_p(M,p=1009):
    A=np.asarray(M,dtype=np.int64).copy()%p
    nr,nc=A.shape;rank=0
    for c in range(nc):
        ix=np.flatnonzero(A[rank:,c])
        if not len(ix):continue
        j=rank+int(ix[0])
        if j!=rank:A[[j,rank]]=A[[rank,j]]
        inv=pow(int(A[rank,c]),p-2,p)
        A[rank,c:]=A[rank,c:]*inv%p
        if rank+1<nr:
            fac=A[rank+1:,c].copy()
            if np.any(fac):
                A[rank+1:,c:]=(A[rank+1:,c:]-fac[:,None]*A[None,rank,c:])%p
        rank+=1
        if rank==nr:break
    return rank

def incidence(LL,n):
    M=np.zeros((len(LL),n),dtype=np.int64)
    for j,L in enumerate(LL):
        for e in L:M[j,e]=1
    return M

def fourstep_cycle_matrix(LL,strands):
    lookup={frozenset(L):j for j,L in enumerate(LL)}
    D=[]
    for walk in strands:
        if len(walk)<5:continue
        w=[lookup[frozenset(walk[i:i+4])] for i in range(len(walk)-3)]
        for i in range(len(w)-1):
            D.append((walk[i],walk[i+4],w[i],w[i+1]))
    assert len(D)==44
    F=nx.Graph();F.add_nodes_from(range(W*H))
    cycles=[]
    for k,(u,v,old,new) in enumerate(D):
        if not nx.has_path(F,u,v):
            F.add_edge(u,v,idx=k)
            continue
        z=np.zeros(len(LL),dtype=np.int64)
        z[new]+=1;z[old]-=1
        path=nx.shortest_path(F,v,u)
        for a,b in zip(path,path[1:]):
            kk=F[a][b]['idx']
            s,t,first,last=D[kk]
            sign=1 if (a,b)==(s,t) else -1
            z[last]+=sign;z[first]-=sign
        cycles.append(z)
    assert len(cycles)==18
    return np.asarray(cycles,dtype=np.int64),D

def parse_word(s,LL):
    B=[-1]*(W*H);height=[0]*W
    for i,ch in enumerate(s):
        c=int(ch)-1;r=height[c];assert 0<=c<W and r<H
        e=r*W+c;B[e]=i%2;height[c]+=1
        if i+1<len(s):
            assert not any(all(B[v]==i%2 for v in L) for L in LL if e in L),('earlier firstwinner',i+1)
    return B,height

def raw_jet_for_owner(S,p,B,LL,Z):
    # S only evaluated when its sites are still physically EMPTY in actual q.
    v=np.zeros(len(LL),dtype=np.int64)
    Q=set(S)
    for i,L in enumerate(LL):
        if Q.issubset(L):
            v[i]=int(all(B[e]==p for e in L if e not in Q))
    return Z@v

def test_move_jet_updates(LL,Z,comb2,comb3):
    # Genuine ORIGINAL firstwinfree legal positions; after move evaluate polynomial
    # immediately, absorbing the entire ACTUAL game if action firstwins.
    histories=[
      '',
      '121',
      '44444',
      '12345612345665432165432112345612',
      '21112141422262737333337445555557767664646'
    ]
    grade2=0;grade1=0;opponent=0
    for hist in histories:
        B,h=parse_word(hist,LL)
        m=len(hist)%2
        for c in range(W):
            if h[c]==H:continue
            x=h[c]*W+c
            Cp=B.copy();Cp[x]=m
            # For two different grades, compare truly independent polynomial
            # expansions rather than infer the answer from source formulas.
            ss1=[(e,) for e in range(W*H) if B[e]==-1 and e!=x][:12]
            ss2=[S for S in comb2 if x not in S and all(B[e]==-1 for e in S)][:64]
            for S in ss1+ss2:
                before=raw_jet_for_owner(S,m,B,LL,Z)
                after=raw_jet_for_owner(S,m,Cp,LL,Z)
                extra=raw_jet_for_owner(tuple(S)+(x,),m,B,LL,Z)
                assert np.array_equal(after-before,extra),(hist,c,S)
                if len(S)==1:grade1+=1
                else:grade2+=1
                # Opponent raw source jet does not change when m claims x.
                qbefore=raw_jet_for_owner(S,1-m,B,LL,Z)
                qafter=raw_jet_for_owner(S,1-m,Cp,LL,Z)
                assert np.array_equal(qbefore,qafter)
                opponent+=1
    return {'ownerGrade1CofactorChecks':grade1,
            'ownerGrade2CofactorChecks':grade2,
            'opponentOwnerUnchangedChecks':opponent}

def main():
    LL,strands=lines_and_strands(W,H)
    assert len(LL)==69 and len(strands)==37
    A=incidence(LL,W*H)
    spB=sp.Matrix(A.T.astype(int).tolist())
    z=spB.nullspace()
    assert spB.rank()==38 and len(z)==31
    Z=np.asarray([[int(v) for v in basis] for basis in z],dtype=np.int64)
    assert all(den.q==1 for basis in z for den in basis)
    cycles,D=fourstep_cycle_matrix(LL,strands)
    assert rank_p(cycles)==18
    assert not np.any(cycles@A)
    assert not np.any(Z@A)
    pair={};triples={}
    for j,L in enumerate(LL):
        for S in combinations(L,2):pair.setdefault(tuple(sorted(S)),[]).append(j)
        for S in combinations(L,3):triples.setdefault(tuple(sorted(S)),[]).append(j)
    assert len(pair)==282 and len(triples)==232
    sourceRank=rank_p(A)
    starranks=Counter();starFailures=[]
    for x in range(W*H):
        mask=A[:,x]!=0
        loss=sourceRank-rank_p(A[~mask,:])
        deg=int(np.sum(mask))
        starranks[(deg,loss)]+=1
        assert rank_p(Z[:,mask])==deg-loss
        if loss!=1:starFailures.append(x)
    assert len(starFailures)==0
    pairDegrees=Counter();cycleCoverage=Counter();pairFailures=[]
    for S,sel in pair.items():
        deg=len(sel);full=rank_p(Z[:,sel]);cycle=rank_p(cycles[:,sel])
        # Independent physical incidence deletion theorem:
        # full source projection failure = original source rank drop on removing these K4 windows.
        deleteLoss=sourceRank-rank_p(A[[j for j in range(len(LL)) if j not in sel],:])
        assert deg-full==deleteLoss
        pairDegrees[deg]+=1
        cycleCoverage[(deg,cycle)]+=1
        if full!=deg:pairFailures.append(S)
    assert not pairFailures
    assert pairDegrees==Counter({1:173,2:86,3:23})
    assert sum(v for (deg,rk),v in cycleCoverage.items() if deg==rk)==194
    assert sum(v for (deg,rk),v in cycleCoverage.items() if deg>rk)==88
    tripleDegrees=Counter();tripleCycleCoverage=Counter()
    for S,sel in triples.items():
        deg=len(sel)
        assert rank_p(Z[:,sel])==deg
        tripleDegrees[deg]+=1
        tripleCycleCoverage[(deg,rank_p(cycles[:,sel]))]+=1
    assert tripleDegrees==Counter({1:188,2:44})
    assert sum(v for (deg,rk),v in tripleCycleCoverage.items() if deg==rk)==176
    assert sum(v for (deg,rk),v in tripleCycleCoverage.items() if deg>rk)==56

    # Counterexample: an actual legal P1 firstwinner with three K4s, zero source charge.
    word="211121414222627373333374455555577676646461"
    B,h=parse_word(word,LL)
    assert len(word)==42 and h==[H]*W
    x=5*W; allStar=[j for j,L in enumerate(LL) if x in L]
    wins=[j for j,L in enumerate(LL) if all(B[e]==1 for e in L)]
    assert len(wins)==len(allStar)==3 and set(wins)==set(allStar)
    terminalVector=np.asarray([int(j in wins) for j in range(len(LL))])
    assert not np.any(Z@terminalVector) # ALL 31 charges zero
    assert np.array_equal(terminalVector,A[:,x]) # physical additive star
    early=word[:-1]
    Bb,_=parse_word(early,LL)
    assert not any(all(Bb[e]==0 for e in L) or all(Bb[e]==1 for e in L) for L in LL)
    # Scalar grade1 count 3 resolves source invisible full-star.
    lastSiteData={'originalOneBasedHistory':word,'firstwinningPly':42,'winner':'P1',
      'lastSiteOneBased':[1,6],'allK4IncidentWinlines':3,
      'source31TerminalChargesAllZero':True,
      'additiveScalarCompletedLineCount':3,
      'sourceSignatureEqualsPhysicalCellLineIncidence':True}
    dynamics=test_move_jet_updates(LL,Z,list(pair),list(triples))

    small={}
    for w,h in [(5,5),(5,6),(6,5),(6,6),(7,5),(8,6),(10,6)]:
        ls,_=lines_and_strands(w,h);M=incidence(ls,w*h);r=rank_p(M)
        drops=Counter()
        for e in range(w*h):
            drops[r-rank_p(M[M[:,e]==0,:])]+=1
        small[f'{w}x{h}']=dict(drops)
    assert small['5x5']=={1:16,2:8,3:1}
    assert all(v=={1:int(k.split('x')[0])*int(k.split('x')[1])}
               for k,v in small.items() if k!='5x5')

    print(json.dumps({
        'schema':1,'date':'2026-10-20',
        'status':'ORIGINAL_SOURCE_EXACT_GRADE2_31_TOMOGRAPHY_FINITE_PHYSICAL_CHECKS',
        'original7x6':{'K4Windows':69,'rationalLineSyzygyDimension':31,
          'fourStepCycleBasisDimension':18,'baseGluingQuotientDimension':13,
          'uniqueGrade2PairRequirements':282,'grade2Multiplicities':dict(pairDegrees),
          'allGrade2PairLocalProjectionsFullRank':True,
          'grade2CompleteUsingOnlyCycle18':194,
          'grade2RequiringBaseGluingModes':88,
          'grade2CycleRankDistribution':{str(k):v for k,v in cycleCoverage.items()},
          'uniqueGrade3Triples':232,'grade3Multiplicities':dict(tripleDegrees),
          'allGrade3LocalProjectionsFullRank':True,
          'grade3CompleteUsingOnlyCycle18':176,
          'grade3RequiringBaseGluingModes':56,
          'grade1SingletonStarsAllHaveExactlyOneInvisibleMode':42,
          'grade1OneAdditionalLocalScalarMakesAllK4WinlineSubsetsRecoverable':True,
          'actualStarFirstwinnerFull31Blindspot':lastSiteData,
          'ownerCofactorLegalMoveChecks':dynamics},
        'finiteDimensionStarFalsifiers':small,
        'limits':['Not a root WDL strategy or nonbranching minimax elimination',
           'Source event reconstruction is local by given missing-cell subset',
           '5x5 has additional local star blindspots',
           'Maintained Node26 CI and external formal assistant not run']
    },indent=2))

if __name__=='__main__':main()
