#!/usr/bin/env python3
"""Exact, source-first original Connect4 K4 six/seven-column overlap audit.

Requires sympy and networkx. No Oracle/WDL lookup, root strong28 fixture or
recursive game-tree search. Historical center-five/terminal41 assumptions
are explicitly introduced only for the final diagnostic calculation.
"""
import json
import sympy as S
import networkx as nx

DIR = (("H",1,0),("V",0,1),("R",1,1),("F",1,-1))
HEIGHT=6

def original_windows(width):
    return [(name,tuple((c+i*dx,r+i*dy) for i in range(4)))
            for c in range(width) for r in range(HEIGHT)
            for name,dx,dy in DIR
            if all(0<=c+i*dx<width and 0<=r+i*dy<HEIGHT for i in range(4))]

def incidence(windows,width):
    return S.Matrix([[int((c,r) in coords) for _,coords in windows]
                     for r in range(HEIGHT) for c in range(width)])

def source_syzygies(B):
    kernel=B.nullspace()
    return S.Matrix.hstack(*kernel).T

def true_fourstep_cycles(width):
    windows=original_windows(width)
    idx={frozenset(coords):i for i,(_,coords) in enumerate(windows)}
    edges=[]
    for _,dx,dy in DIR:
        for c in range(width):
            for r in range(HEIGHT):
                if 0<=c-dx<width and 0<=r-dy<HEIGHT:
                    continue
                path=[]
                x,y=c,r
                while 0<=x<width and 0<=y<HEIGHT:
                    path.append((x,y))
                    x+=dx
                    y+=dy
                for i in range(len(path)-4):
                    d=S.zeros(len(windows),1)
                    d[idx[frozenset(path[i:i+4])]]-=1
                    d[idx[frozenset(path[i+1:i+5])]]+=1
                    edges.append((path[i],path[i+4],d))
    graph=nx.Graph()
    graph.add_nodes_from((c,r) for c in range(width) for r in range(HEIGHT))
    cycles=[]
    for i,(u,v,co) in enumerate(edges):
        if not nx.has_path(graph,u,v):
            graph.add_edge(u,v,edgeIndex=i)
        else:
            z=co.copy()
            route=nx.shortest_path(graph,v,u)
            for x,y in zip(route,route[1:]):
                k=graph[x][y]["edgeIndex"]
                a,b,term=edges[k]
                z+=term if (x,y)==(a,b) else -term
            assert incidence(windows,width)*z==S.zeros(width*HEIGHT,1)
            cycles.append(z)
    Z=S.Matrix.hstack(*cycles).T
    assert Z.rank()==len(cycles)
    return Z,edges

def embed(q,source,offset,target_index,n):
    ids=[target_index[frozenset((c+offset,r) for c,r in coords)]
         for _,coords in q]
    out=S.zeros(source.rows,n)
    for i in range(source.rows):
        for j,k in enumerate(ids):
            out[i,k]=source[i,j]
    return out

def reflection_even_odd(q,Z,width):
    ids={frozenset(coords):j for j,(_,coords) in enumerate(q)}
    opposite=[ids[frozenset((width-1-c,r) for c,r in coords)] for _,coords in q]
    e=S.Matrix([[Z[i,j]+Z[i,opposite[j]] for j in range(len(q))] for i in range(Z.rows)])
    o=S.Matrix([[Z[i,j]-Z[i,opposite[j]] for j in range(len(q))] for i in range(Z.rows)])
    return [int(e.rank()),int(o.rank())]

if __name__=="__main__":
    w={k:original_windows(k) for k in (5,6,7)}
    b={k:incidence(w[k],k) for k in w}
    sy={k:source_syzygies(b[k]) for k in w}
    cyc={k:true_fourstep_cycles(k)[0] for k in w}
    assert [len(w[k]) for k in (5,6,7)]==[39,54,69]
    assert [b[k].rank() for k in (5,6,7)]==[26,32,38]
    assert [sy[k].rank() for k in (5,6,7)]==[13,22,31]
    assert [cyc[k].rank() for k in (5,6,7)]==[6,12,18]

    target={frozenset(cells):i for i,(_,cells) in enumerate(w[7])}
    K_L=embed(w[6],sy[6],0,target,len(w[7]))
    K_R=embed(w[6],sy[6],1,target,len(w[7]))
    K_M=embed(w[5],sy[5],1,target,len(w[7]))
    C_L=embed(w[6],cyc[6],0,target,len(w[7]))
    C_R=embed(w[6],cyc[6],1,target,len(w[7]))
    C_M=embed(w[5],cyc[5],1,target,len(w[7]))
    assert K_L.col_join(K_R).rank()==31
    assert K_L.rank()+K_R.rank()-K_L.col_join(K_R).rank()==13
    assert K_L.col_join(K_M).rank()==K_L.rank()
    assert K_R.col_join(K_M).rank()==K_R.rank()
    assert C_L.col_join(C_R).rank()==18
    assert C_L.rank()+C_R.rank()-C_L.col_join(C_R).rank()==6
    assert C_L.col_join(C_M).rank()==C_L.rank()
    assert C_R.col_join(C_M).rank()==C_R.rank()

    # This terminal test is explicitly CONDITIONED on accepted old 7x6
    # strong-optimal first-five center and P0 firstwinner move41 facts.
    F={(c,r) for c in range(7) for r in (4,5)}-{(3,4)}
    T=[i for i,(_,cells) in enumerate(w[7])
       if F.intersection(cells) and not {(3,1),(3,3)}.intersection(cells)]
    assert len(F)==13 and len(T)==28
    J=S.Matrix([[int(cell in w[7][i][1]) for i in T] for cell in sorted(F)])
    assert J.rank()==13
    left=C_L[:,T]
    right=C_R[:,T]
    both=left.col_join(right)
    leftStar=left.col_join(J)
    rightStar=right.col_join(J)
    fullStar=both.col_join(J)
    assert left.rank()==right.rank()==12
    assert both.rank()==18
    assert leftStar.rank()==rightStar.rank()==25
    assert fullStar.rank()==28
    uniform=S.ones(1,28)
    assert leftStar.col_join(uniform).rank()==26
    assert rightStar.col_join(uniform).rank()==26
    assert fullStar.col_join(uniform).rank()==28
    # Strength qualification: full line-syzygy module of one embedded
    # six-wide board PLUS landing stars already spans T28, unlike
    # its cycle-only 12-dimensional submodule.
    assert K_L[:,T].rank()==K_R[:,T].rank()==17
    assert K_L[:,T].col_join(J).rank()==K_R[:,T].col_join(J).rank()==28
    assert sy[7][:,T].rank()==22

    result={
      "schema":1,
      "scope":"TRUE open original K4 width5,6,7 height6 source from EMPTY; historic T28 is separate conditional diagnostic",
      "source":[{"W":k,"H":6,"K4Windows":len(w[k]),
                 "physicalIncidenceRankQ":int(b[k].rank()),
                 "lineSyzygyKernelDimQ":int(sy[k].rank()),
                 "fourStepCycleDimQ":int(cyc[k].rank()),
                 "baseGluingQuotientDimQ":int(sy[k].rank()-cyc[k].rank())}
                for k in (5,6,7)],
      "fullSevenFromTwoSix":{
        "lineCounts":"69=54+54-39",
        "siteImageRanks":"38=32+32-26",
        "sourceLineKernelDimensions":"31=22+22-13",
        "actualSourceKernelEqualsSumOfTwoSixSubspaces":True,
        "sourceKernelIntersectionExactlyMiddleFive":True,
        "sourceDipoleCycleDimensions":"18=12+12-6",
        "allCyclesGeneratedByTwoEmbeddedSixSubspaces":True,
        "overlapFiveSyzygyReflectionEvenOdd":reflection_even_odd(w[5],sy[5],5)},
      "historicallyConditionedTerminal":{
        "targetLineSetCardinality":len(T),"eligibleLandingSiteCount":len(F),
        "oneEmbeddedSixCycleProjectionRank":int(left.rank()),
        "oppositeEmbeddedSixCycleProjectionRank":int(right.rank()),
        "bothSixCycleProjectionRank":int(both.rank()),
        "landingStarRank":int(J.rank()),
        "oneSixCyclePlusLandingRank":int(leftStar.rank()),
        "bothSixCyclePlusLandingRank":int(fullStar.rank()),
        "newAbsoluteTerminalCoordinatesFromSecondSixCycleModule":3,
        "uniformLineGaugeInOneSixPlusLanding":False,
        "uniformLineGaugeInBothSixPlusLanding":True,
        "newRelativeTerminalCoordinatesFromSecondSixCycleModule":2,
        "rationalSourceFullKernel31ProjectionRank":int(sy[7][:,T].rank()),
        "entireOneSixKernelProjectionRank":int(K_L[:,T].rank()),
        "entireOneSixKernelPlusLandingRank":int(K_L[:,T].col_join(J).rank()),
        "importantScope":"The terminal 28/13 geometry was generated using historical strong-optimal first five center column moves and firstwin move41; NOT derived from EMPTY."
      },
      "limitations":["Source syzygy gluing is exact, but it is NOT a proof all adaptive P1 defensive strategies fail on 7x6.",
                     "Fixed matching local-to-global UNSAT is for explicit restricted stationary defense potentiality.",
                     "No external CI / formal proof assistant or signed nonrecursive universal WDL result."]
    }
    print(json.dumps(result,indent=2))
