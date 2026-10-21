#!/usr/bin/env python3
"""Connect4 original K4 typed number-atlas source audit.
Source geometry is generated independently of solved game histories.
Historical terminal T28 is considered only after full-geometry controls pass.
No oracle, minimax, game successor evaluation or solver modification.
"""
import json
from collections import Counter

DIRECTIONS = [('H',1,0),('V',0,1),('R',1,1),('F',1,-1)]
P = 1009

def modular_rank(M, p=P):
    if not M: return 0
    a=[[int(v)%p for v in row] for row in M]
    n=len(a);m=len(a[0]);rank=0
    for col in range(m):
        pivot=next((i for i in range(rank,n) if a[i][col]),None)
        if pivot is None: continue
        a[rank],a[pivot]=a[pivot],a[rank]
        inv=pow(a[rank][col],p-2,p)
        for j in range(col,m): a[rank][j]=a[rank][j]*inv%p
        for i in range(rank+1,n):
            f=a[i][col]
            if f:
                for j in range(col,m):a[i][j]=(a[i][j]-f*a[rank][j])%p
        rank+=1
        if rank==n:return rank
    return rank

def make_geometry(W,H):
    cells=[(c,r) for r in range(H) for c in range(W)]
    cid={x:i for i,x in enumerate(cells)}
    strands=[]
    for name,dx,dy in DIRECTIONS:
        for c,r in cells:
            if (c-dx,r-dy) in cid: continue
            path=[];x,y=c,r
            while (x,y) in cid:
                path.append((x,y));x+=dx;y+=dy
            if path:strands.append((name,path))
    assert len(strands)==3*(W+H)-2
    windows=[];base=[];deltas=[];active=0
    for name,path in strands:
        if len(path)<4:continue
        active+=1;inds=[]
        for j in range(len(path)-3):
            inds.append(len(windows))
            windows.append((name,tuple(path[j:j+4])))
        base.append(inds[0])
        for a,b in zip(inds,inds[1:]):
            assert windows[a][1][1:]==windows[b][1][:3]
            deltas.append((a,b,windows[a][1][0],windows[b][1][-1]))
    assert len(base)==active
    assert len(base)+len(deltas)==len(windows)
    return cells,cid,strands,windows,base,deltas

def graph(verts,edges):
    parent=list(range(verts))
    def find(i):
        while parent[i]!=i:
            parent[i]=parent[parent[i]];i=parent[i]
        return i
    for a,b in edges:parent[find(a)]=find(b)
    components=len({find(i) for i in range(verts)})
    return {'vertices':verts,'edges':len(edges),'components':components,
            'cycle_rank':len(edges)-verts+components}

def source(W,H):
    cells,cid,strands,windows,base,deltas=make_geometry(W,H)
    N=len(windows);C=len(cells);S=len(strands);A=len(base);E=len(deltas)
    assert N==4*W*H-9*(W+H)+18 and A==3*(W+H)-14
    assert S-A==12 and E==4*W*H-12*(W+H)+32
    graph_d=graph(C,[(cid[old],cid[new]) for a,b,old,new in deltas])
    assert graph_d['components']==16
    assert len({(c%4,r%4) for c,r in cells})==16
    for a,b,old,new in deltas:
        assert (old[0]%4,old[1]%4)==(new[0]%4,new[1]%4)
    residue=lambda c,r:4*(r%4)+(c%4)
    Q=[[0]*A for i in range(16)]
    for j,wi in enumerate(base):
        for c,r in windows[wi][1]:Q[residue(c,r)][j]+=1
    rq=modular_rank(Q);r2=modular_rank(Q,2)
    assert rq==12 and r2==9
    M=[[0]*C for _ in windows]
    for j,(name,path) in enumerate(windows):
        for v in path:M[j][cid[v]]=1
    B_Q=modular_rank(M);B_2=modular_rank(M,2)
    assert B_Q==C-4 and B_2==C-7
    f=lambda c,r:[(-1)**r*[1,0,-1,0][c%4],
                    (-1)**r*[0,1,0,-1][c%4],
                    (-1)**c*[1,0,-1,0][r%4],
                    (-1)**c*[0,1,0,-1][r%4]]
    assert all(sum(f(c,r)[i] for c,r in path)==0
               for _,path in windows for i in range(4))
    # Original real line-intersection topology. On large grids counting is bounded.
    overlap_edges=[]
    if W==7 and H==6:
        site_sets=[set(path) for _,path in windows]
        overlap_edges=[(i,j) for i in range(N) for j in range(i+1,N)
                       if site_sets[i].intersection(site_sets[j])]
        assert graph(N,overlap_edges)=={
            'vertices':69,'edges':821,'components':1,'cycle_rank':753}
    out={'W':W,'H':H,'sites':C,'strands':S,'active_strands':A,
         'short_strands':S-A,'original_lines':N,
         'adjacent_window_differences':E,
         'cell_dipole_graph':graph_d,
         'residue_classes':16,
         'base_quotient_rank_Q':rq,'base_quotient_rank_F2':r2,
         'cell_line_rank_Q':B_Q,'cell_line_rank_F2':B_2,
         'spatial_nullity_Q':C-B_Q,'spatial_nullity_F2':C-B_2,
         'line_syzygies_Q':N-B_Q,'line_syzygies_F2':N-B_2,
         'dipole_cycle_syzygies':graph_d['cycle_rank'],
         'base_gluing_syzygies_Q':A-rq,
         'base_gluing_syzygies_F2':A-r2,
         'relative_line_modes':N-1,
         'additive_relative_Q':B_Q-1,
         'nonadditive_relative_Q':N-B_Q}
    assert out['line_syzygies_Q']==out['dipole_cycle_syzygies']+out['base_gluing_syzygies_Q']
    assert out['line_syzygies_F2']==out['dipole_cycle_syzygies']+out['base_gluing_syzygies_F2']
    if W!=7 or H!=6:return out
    out['full_line_overlap_graph']=graph(N,overlap_edges)
    # Natural 37 strand scalar biases: each site sums its four strand weights.
    SB=[[0]*S for _ in range(C)]
    for j,(name,path) in enumerate(strands):
        for c in path:SB[cid[c]][j]=1
    SBQ=modular_rank(SB)
    assert SBQ==30
    PB=[[sum(M[k][i]*SB[i][j] for i in range(C)) for j in range(S)] for k in range(N)]
    rankPS=modular_rank(PB)
    assert rankPS==30
    # Historian's terminal T only after all full69 checks succeed:
    finals={(c,r) for c in range(W) for r in (4,5) if (c,r)!=(3,4)}
    T=[i for i,(_,l) in enumerate(windows) if any(e in finals for e in l) and
       (3,1) not in l and (3,3) not in l]
    assert len(T)==28
    mt=[M[i] for i in T]
    assert modular_rank(mt)==26 and modular_rank(mt,2)==26
    ts=[PB[i] for i in T]
    assert modular_rank(ts)==24
    edges_T=[(a,b) for a,i in enumerate(T) for b,j in enumerate(T)
             if b>a and set(windows[i][1]).intersection(windows[j][1]).intersection(finals)]
    GT=graph(28,edges_T)
    assert GT=={'vertices':28,'edges':102,'components':1,'cycle_rank':75}
    orient=Counter(windows[i][0] for i in T)
    assert orient=={'V':12,'H':8,'R':4,'F':4}
    # Two historically selected line syzygies, checked as 3 true adjacent-window dipole cycles.
    z=[
        {frozenset([(2,1),(2,2),(2,3),(2,4)]):-1,
         frozenset([(2,1),(3,2),(4,3),(5,4)]):1,
         frozenset([(2,2),(2,3),(2,4),(2,5)]):1,
         frozenset([(2,5),(3,5),(4,5),(5,5)]):-1,
         frozenset([(3,2),(4,3),(5,4),(6,5)]):-1,
         frozenset([(3,5),(4,5),(5,5),(6,5)]):1},
        {frozenset([(0,5),(1,5),(2,5),(3,5)]):1,
         frozenset([(0,5),(1,4),(2,3),(3,2)]):-1,
         frozenset([(1,4),(2,3),(3,2),(4,1)]):1,
         frozenset([(1,5),(2,5),(3,5),(4,5)]):-1,
         frozenset([(4,1),(4,2),(4,3),(4,4)]):-1,
         frozenset([(4,2),(4,3),(4,4),(4,5)]):1}]
    where={frozenset(path):i for i,(_,path) in enumerate(windows)}
    triangles=[]
    for zk in z:
        assert all(where[k] in T for k in zk)
        assert all(sum(zk.get(frozenset(windows[i][1]),0)*M[i][col]
                       for i in range(N))==0 for col in range(C))
        paired=[]
        for ia,ib,old,new in deltas:
            ca=zk.get(frozenset(windows[ia][1]),0)
            cb=zk.get(frozenset(windows[ib][1]),0)
            if ca!=0 and cb!=0:
                assert ca==-cb
                paired.append((old,new,cb))
        assert len(paired)==3
        assert len({e for old,new,coeff in paired for e in (old,new)})==3
        triangles.append([{'from':list(old),'to':list(new),'factor':coeff}
                          for old,new,coeff in paired])
    out['strand_bias_site_map_rank_Q']=SBQ
    out['strand_bias_additive_relative_Q']=rankPS-1
    out['strand_bias_exact_gauge_dim_Q']=S-SBQ
    out['strand_bias_missing_additive_relative_Q']=(B_Q-1)-(rankPS-1)
    out['strong_T28_conditional_diagnostic']={
      'selected_count':28,'orientation_counts':dict(orient),
      'original_physical_incidence_rank_Q':modular_rank(mt),
      'original_physical_incidence_rank_F2':modular_rank(mt,2),
      'relative_graph':GT,'relative_modes':27,
      'additive_relative_modes_Q':25,
      'strand_bias_relative_modes_Q':modular_rank(ts)-1,
      'syzygies':2,'two_three_dipole_triangles':triangles,
      'full_to_terminal_restriction_kernel_dimensions':{
        'relative_modes':68-27,'strand_bias':29-23,
        'additional_additive':(37-29)-(25-23),
        'nonadditive':31-2,
        'full_other_dipole_cycles':18-2,
        'full_base_gluing_syzygies':13}}
    return out

if __name__=='__main__':
    boards=[(5,5),(5,6),(6,6),(7,5),(7,6),(8,6),(10,6)]
    results=[source(*dims) for dims in boards]
    print(json.dumps({'schema':1,'status':'REPRODUCIBLE_SOURCE_ONLY_TYPED_INCIDENCE_AUDIT',
     'domain':'original K4 W,H>=5, seven finite test dimensions; symbolic proofs separate',
     'full_source_before_conditional_T28':True,
     'rows':results,
     'not_WDL':['Historical T28 uses externally solved opening/time premises',
       'Q and F2 ranks are different field computations',
       'No strategic future values or opponent models computed',
       'Graph rank and cubic charge space are not game-value classifiers']
    },indent=2))
