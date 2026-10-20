#!/usr/bin/env python3
"""Independent CPython source sampling control; no future WDL or Oracle labels.
Real original firstwin-free legal prefixes from EMPTY under *cooperative*
choice of nonwinning drops. Not perfect-play samples and not an exact census.
"""
from collections import Counter
import random,json
DIRS=((1,0),(0,1),(1,1),(1,-1))

def lines_gen(W,H):
    return [tuple((c+i*dc)*H+(r+i*dr) for i in range(4))
            for c in range(W) for r in range(H) for dc,dr in DIRS
            if all(0<=c+i*dc<W and 0<=r+i*dr<H for i in range(4))]

def check(B,h,L,W,H,n):
    A=1-n%2;D=n%2
    traps=[]
    for c in range(W):
        if H-h[c]<2:continue
        y=c*H+h[c]+1
        if any(y in line and all(e==y or B[e]==A for e in line) for line in L):
            traps.append(c)
    if not traps:return ('no_trap',None)
    non=[c for c in range(W) if c not in traps]
    odds=[c for c in non if (H-h[c])%2]
    if len(odds)%2:return ('odd_nontraps',None)
    pairs=list(zip(odds[::2],odds[1::2]))
    E=set(); U=set(); X={c*H+h[c] for c in traps}
    for c in non:
        first=h[c]+((H-h[c])%2)
        if first!=h[c]:U.add(c*H+h[c])
        E.update(c*H+r for r in range(first,H,2))
    inaccessible=set(range(W*H))-E-U-X
    mechanism=Counter()
    for line in L:
        if any(B[e]==A for e in line):continue
        G={e for e in line if B[e]==-1}
        assert G, 'terminal original K4 excluded'
        if G&inaccessible:mechanism['inaccessible']+=1
        elif any(a*H+h[a] in G and b*H+h[b] in G for a,b in pairs):
            mechanism['odd_base_pair']+=1
        elif len(G&X)>=2:mechanism['two_traps']+=1
        else:return ('D_counterline',None)
    return ('A_FIRSTWIN',{'traps':traps,'oddPairs':pairs,'mechanism':dict(mechanism)})

def sample_game(W,H,L,seed):
    rng=random.Random(seed)
    B=[-1]*(W*H);h=[0]*W
    for n in range(W*H):
        if n>=8:yield check(B,h,L,W,H,n)
        p=n%2;legal=[]
        for c in range(W):
            if h[c]>=H:continue
            x=c*H+h[c]
            if not any(x in line and all(e==x or B[e]==p for e in line) for line in L):
                legal.append(c)
        if not legal:return
        c=rng.choice(legal)
        B[c*H+h[c]]=p
        h[c]+=1

if __name__=='__main__':
    results=[]
    for W,H in [(5,6),(6,6),(7,5),(7,6),(8,6),(10,6)]:
        L=lines_gen(W,H); counts=Counter()
        for i in range(450):
            seed=0x21BA6F07+i*0x9e3779b9+W*101+H
            for disposition,v in sample_game(W,H,L,seed):
                counts['source_occurrences']+=1
                counts[disposition]+=1
                if v and v['oddPairs']:
                    counts['certified_with_odd_base_pairs']+=1
                    if v['mechanism'].get('odd_base_pair',0)>0:
                        counts['odd_pair_discharge_used']+=1
                    if v['mechanism'].get('two_traps',0)>0:
                        counts['two_trap_discharge_used']+=1
        results.append(dict(W=W,H=H,games=450,**counts))
    print(json.dumps({'schema':1,'scope':'independent exploratory local source screens; cooperative firstwin-free prefixes, no Oracle labels', 'rows':results},indent=2))
