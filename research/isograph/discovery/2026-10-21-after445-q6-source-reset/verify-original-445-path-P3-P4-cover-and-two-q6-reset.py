#!/usr/bin/env python3
"""True original 6x6/7x6 K4 path-cover and two q6 repair-reset control.
No Connect4 oracle, historic28 or solved-root premises. Short physical
P0/P1/P0/P1/P0 checks are a BOUNDED independent negative validation.
"""
from collections import Counter
from itertools import combinations
import json

H = 6
D = (("H",1,0),("V",0,1),("R",1,1),("F",1,-1))

def original_lines(W):
    return [(d,tuple((c+i*dx,r+i*dy) for i in range(4)))
            for c in range(W) for r in range(H) for d,dx,dy in D
            if all(0<=c+i*dx<W and 0<=r+i*dy<H for i in range(4))]

def replay(word,W,lines):
    B=[[-1]*W for _ in range(H)]
    height=[0]*W
    for turn,cc in enumerate(word):
        c=int(cc)-1
        assert 0<=c<W and height[c]<H
        row=height[c]
        height[c]+=1
        B[row][c]=turn%2
        assert not any(all(B[y][x]==turn%2 for x,y in L) for _,L in lines)
    return B,height

def graded_live(B,p,lines):
    out=[]
    for d,L in lines:
        if any(B[y][x]==1-p for x,y in L):
            continue
        R=tuple((x,y) for x,y in L if B[y][x]<0)
        out.append((d,L,R))
    return out

def ray(B,c,r,p,W):
    for _,dx,dy in D:
        n=1
        for s in (-1,1):
            x,y=c+s*dx,r+s*dy
            while 0<=x<W and 0<=y<H and B[y][x]==p:
                n+=1
                x+=s*dx
                y+=s*dy
        if n>=4:
            return True
    return False

def state(B,height):
    return tuple(tuple(row) for row in B),tuple(height)

def physical_short(B,height,ply,depth,W,memo,counters):
    if depth<=0:
        return False
    key=(state(B,height),ply%2,depth)
    if key in memo:
        return memo[key]
    counters["physical_states"]+=1
    p=ply%2
    vals=[]
    for c in range(W):
        if height[c]>=H:
            continue
        r=height[c]
        B[r][c]=p
        height[c]+=1
        ended=ray(B,c,r,p,W)
        if ended:
            counters["physical_firstwins"]+=1
        val=(p==0) if ended else physical_short(
            B,height,ply+1,depth-1,W,memo,counters)
        B[r][c]=-1
        height[c]-=1
        vals.append(val)
    answer=any(vals) if p==0 else all(vals)
    memo[key]=answer
    return answer

results={"schema":1,"date":"2026-10-21",
         "source_original_K4_not_historic_terminal_oracle":True,
         "boards":{},"q6":{}}
for W in (6,7):
    lines=original_lines(W)
    assert len(lines)==(54 if W==6 else 69)
    B,height=replay("445",W,lines)
    grades=graded_live(B,0,lines)
    residual2=[(d,tuple((x+1,y+1) for x,y in R))
               for d,_,R in grades if len(R)==2]
    assert all(d=="H" and all(y==1 for x,y in R) for d,R in residual2)
    edges=[tuple(sorted(x for x,y in R)) for _,R in residual2]
    vertices=sorted({v for edge in edges for v in edge})
    covers=[list(s) for m in range(len(vertices)+1)
            for s in combinations(vertices,m)
            if all(any(v in s for v in edge) for edge in edges)]
    optimum=min(map(len,covers))
    best=[s for s in covers if len(s)==optimum]
    if W==6:
        assert edges==[(2,3),(3,6)] and best==[[3]]
        assert len(covers)==5
    else:
        assert edges==[(2,3),(3,6),(6,7)]
        assert best==[[2,6],[3,6],[3,7]]
        assert len(covers)==8
    results["boards"][f"{W}x6"]={
        "all_original_K4_windows":len(lines),
        "original_legal_prefix":"445",
        "P0_original_degree2_missing_cell_edges":edges,
        "source_graph_path_vertices":vertices,
        "minimum_P1_static_vertex_cover":optimum,
        "all_minimum_vertex_covers":best,
        "all_vertex_covers":len(covers),
        "Fibonacci_relation":f"F_{len(vertices)+2}={len(covers)}"
    }

W=7
lines=original_lines(W)
for word in ("445367","445632"):
    B,height=replay(word,W,lines)
    grades={}
    for p in (0,1):
        live=graded_live(B,p,lines)
        counts=dict(sorted(Counter(len(R) for _,_,R in live).items()))
        grades[str(p)]={
            "live_source_K4_residual_degree_counts":counts,
            "two_missing_original_line_witnesses":[
                {"orientation":d,
                 "original_four_cells":[(x+1,y+1) for x,y in L],
                 "remaining_two_sites":[(x+1,y+1) for x,y in R]}
                for d,L,R in live if len(R)==2]
        }
    assert 1 not in grades["0"]["live_source_K4_residual_degree_counts"]
    assert 2 not in grades["0"]["live_source_K4_residual_degree_counts"]
    memo={}
    stats={"physical_states":0,"physical_firstwins":0}
    forced=physical_short(B,height,6,5,W,memo,stats)
    P0choices=[]
    positive_q8=0
    for c in range(W):
        if height[c]>=H:
            continue
        row=height[c]
        B[row][c]=0
        height[c]+=1
        is_forced=physical_short(B,height,7,4,W,memo,stats)
        P0choices.append({"P0_move7_column":c+1,
                          "forces_P0_WIN_by_move11":is_forced})
        for c8 in range(W):
            if height[c8]>=H:
                continue
            r8=height[c8]
            B[r8][c8]=1
            height[c8]+=1
            assert not ray(B,c8,r8,1,W)
            positive_q8+=physical_short(B,height,8,3,W,memo,stats)
            B[r8][c8]=-1
            height[c8]-=1
        B[row][c]=-1
        height[c]-=1
    assert not forced and positive_q8==0
    results["q6"][word]={
        "real_column_heights":height,
        "source_K4_grades":grades,
        "earliest_possible_P0_K4_completion_ply":11,
        "P0_can_force_win_by_ply11":forced,
        "P0_move7_current_choices":P0choices,
        "P0_mate3_positive_at_49_post7_post8_states":positive_q8,
        "independent_five_ply_physical_validation":stats
    }
assert results["q6"]["445367"]["source_K4_grades"]["0"]["live_source_K4_residual_degree_counts"]=={3:5,4:47}
assert results["q6"]["445632"]["source_K4_grades"]["0"]["live_source_K4_residual_degree_counts"]=={3:4,4:47}
assert len(results["q6"]["445367"]["source_K4_grades"]["1"]["two_missing_original_line_witnesses"])==1
assert len(results["q6"]["445632"]["source_K4_grades"]["1"]["two_missing_original_line_witnesses"])==0
print(json.dumps(results,indent=2))
