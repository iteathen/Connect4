#!/usr/bin/env python3
"""Independent six-anchor original 7x6 K4/Euler absorbing-rank control.
No solved-game labels or recursive game valuation. Requires Python 3.8+.
Run: python verify-six-anchor-original7x6-K4-Euler-action-kernel-independent.py
"""
from itertools import combinations, product
from math import gcd
import time

W,H=7,6
D=((1,0),(0,1),(1,1),(1,-1))
windows=[]
links=[[[] for _ in D] for _ in range(42)]
for x in range(7):
    for y in range(6):
        for d,(dx,dy) in enumerate(D):
            z=[(x+j*dx,y+j*dy) for j in range(4)]
            if all(0<=a<7 and 0<=b<6 for a,b in z):
                L=tuple(a+7*b for a,b in z)
                windows.append((d,L))
                for e in L: links[e][d].append(L)
assert len(windows)==69

def checks(board,c,r,owner):
    """Independent directional ray check; does not use generated windows."""
    for dx,dy in D:
        ct=1
        for sign in (-1,1):
            for j in range(1,4):
                x,y=c+sign*j*dx,r+sign*j*dy
                if not(0<=x<7 and 0<=y<6) or board[x+7*y]!=owner:break
                ct+=1
        if ct>=4:return True
    return False

def face(anchor):
    free=[x for x in (1,2,3,5,6,7) if x!=anchor]
    arr=[]
    for bits in product((0,1),repeat=5):
        word=[anchor]+[x for c,b in zip(free,bits) if b==0 for x in (c,c)]+[anchor]+[x for c,b in zip(free,bits) if b==1 for x in (c,c)]
        q=[0]*42;h=[0]*7
        for t,x in enumerate(word):
            c=x-1;row=h[c];h[c]+=1;p=t%2+1
            q[c+7*row]=p
            assert not checks(q,c,row,p)
        assert h==[2,2,2,0,2,2,2]
        assert q[anchor-1]==1 and q[anchor-1+7]==2
        assert all(q[c-1]==(1 if b else 2) for c,b in zip(free,bits))
        arr.append((q,h,sum(bits)%2))
    assert len(arr)==32
    return arr

def getfeatures(arr):
    """All original K4 complete ternary patterns, plus both-owner 438 Euler slots."""
    found=set()
    for _,L in windows:
        maps={}
        for i,s in enumerate(arr):
            if s is not None:
                q,h,pa=s
                k=tuple(q[e] for e in L)
                maps[k]=maps.get(k,0)|(1<<i)
        found.update(maps.values())
    slots=0
    for p in (1,2):
        for e in range(42):
            orient=[d for d in range(4) if links[e][d]]
            for k in range(1,len(orient)+1):
                for combo in combinations(orient,k):
                    slots+=1
                    mask=0
                    for i,s in enumerate(arr):
                        if s is None:continue
                        q,h,pa=s
                        col=e%7
                        if e!=col+7*h[col]:continue
                        if all(any(all(j==e or q[j]==p for j in ln) for ln in links[e][d]) for d in combo):
                            mask|=1<<i
                    found.add(mask)
    assert slots==876
    return found

def modrank(rows,p=1009):
    basis={}
    for mask in rows:
        v=[mask>>i&1 for i in range(32)]
        for col in range(32):
            if not v[col]:continue
            if col not in basis:
                inv=pow(v[col],-1,p)
                basis[col]=[(x*inv)%p for x in v]
                break
            y=v[col];b=basis[col]
            v=[(x-y*z)%p for x,z in zip(v,b)]
    return len(basis)

def rankQ(masks):
    """Fraction-free exact Gaussian elimination over rational numbers."""
    bases={}
    for m in masks:
        v=[(m>>i)&1 for i in range(32)]
        for i in range(32):
            if v[i]==0:continue
            if i in bases:
                b=bases[i];a=v[i];den=b[i]
                v=[den*x-a*y for x,y in zip(v,b)]
                g=0
                for x in v:g=gcd(g,x)
                if g>1:v=[x//g for x in v]
            else:
                bases[i]=v
                break
    return len(bases)

start=time.monotonic()
results=[]
for anchor in (1,2,3,5,6,7):
    arr=face(anchor);base=getfeatures(arr)
    b=rankQ(base)
    assert b==modrank(base,1009)==modrank(base,10007)
    summaries=[]
    for c in range(7):
        nxt=[];win=[0,0];inc=[0,0]
        for q,h,par in arr:
            q=q[:];h=h[:];r=h[c];e=c+7*r;h[c]+=1;q[e]=1
            matches=[L for d,L in windows if e in L and all(q[j]==1 for j in L)]
            assert bool(matches)==checks(q,c,r,1)
            if matches:
                win[par]+=1;inc[par]+=len(matches);nxt.append(None)
            else:nxt.append((q,h,par))
        post=getfeatures(nxt)
        allfeatures=base|post
        k=rankQ(allfeatures)
        assert k==modrank(allfeatures,1009)==modrank(allfeatures,10007)
        fifth=sum(sum((1 if arr[i][2]==0 else -1)*(m>>i&1) for i in range(32))!=0 for m in post)
        summaries.append({"column":c+1,"firstWinEvenOdd":win,"K4IncidencesEvenOdd":inc,
                          "joinedRankQ":k,"newDirections":k-b,"degree5PostRows":fifth})
    results.append({"anchor":anchor,"initialRankQ":b,"actions":summaries})
# The next assertions are post-discovery regression controls, not preregistered numerical targets.
expected={1:(18,24,[6,6]),2:(16,22,[7,7]),3:(13,19,[8,8]),
          5:(13,19,[8,8]),6:(16,22,[7,7]),7:(18,24,[6,6])}
for r in results:
    a=r["anchor"];b,k,win=expected[a]
    assert r["initialRankQ"]==b
    for action in r["actions"]:
        if action["column"]==4:
            assert action["joinedRankQ"]==k and action["firstWinEvenOdd"]==win
            assert action["degree5PostRows"]>0 and action["newDirections"]==6
        else:
            assert action["joinedRankQ"]==b and action["firstWinEvenOdd"]==[0,0]
for i in range(3):
    left,right=results[i],results[5-i]
    assert left["anchor"]+right["anchor"]==8
    for a in left["actions"]:
        b=right["actions"][7-a["column"]]
        assert (a["joinedRankQ"],a["firstWinEvenOdd"],a["degree5PostRows"])==(
                b["joinedRankQ"],b["firstWinEvenOdd"],b["degree5PostRows"])
print("PASS: 6 anchors, 192 legal rank12 source constructions, 42 action maps")
for r in results:
    a=r["actions"][3]
    print("anchor",r["anchor"],"native",r["initialRankQ"],
          "P0 c4 joined",a["joinedRankQ"],"sink E/O",a["firstWinEvenOdd"],
          "grade5",a["degree5PostRows"])
print("exact rational and prime1009/10007 ranks agree; reflection PASS")
print("elapsed_seconds",round(time.monotonic()-start,4))
