#!/usr/bin/env python3
"""Original6x6/7x6 K4 four-way actual owner support-debt Fourier theorem.
Does not load Connect4 solver, historic28 winning-line oracle or q values.
Pure stdlib Python3; run: python3 verify-original-K4-support-debt-mod4.py
"""
from collections import defaultdict
import json

H=6
DIR=(("H",1,0),("V",0,1),("R",1,1),("F",1,-1))

def source_lines(width):
    out=[]
    for c in range(width):
        for r in range(H):
            for ori,dx,dy in DIR:
                pts=tuple((c+i*dx,r+i*dy) for i in range(4))
                if all(0<=x<width and 0<=y<H for x,y in pts):
                    out.append((ori,pts))
    return out

def root(width):
    return ([[-1]*width for _ in range(H)],[0]*width,0)

def grade(b,h,p,source_line):
    ori,pts=source_line
    if any(b[r][c]==1-p for c,r in pts):
        return None
    R=frozenset((c,r) for c,r in pts if b[r][c]==-1)
    S=set()
    for c in {c for c,r in R}:
        peak=max(r for cc,r in R if cc==c)
        S.update((c,r) for r in range(h[c],peak+1))
    assert S.issuperset(R)
    return (len(R),len(S-R),R,frozenset(S))

def physical_move(b,h,n,c,lines):
    width=len(h)
    b1=[row[:] for row in b]
    h1=h[:]
    r=h1[c]
    assert r<H
    h1[c]+=1
    b1[r][c]=n%2
    won=any(all(b1[rr][cc]==n%2 for cc,rr in pts)
            for _,pts in lines)
    return b1,h1,n+1,won

def expected_grade_after(g,x,owner_move):
    if g is None:return None
    k,d,R,S=g
    if x in R:
        return (k-1,d) if owner_move else None
    if x in S:
        return (k,d-1)
    return (k,d)

def verify_q(b,h,n,lines):
    comparisons=0
    for c in range(len(h)):
        if h[c]>=H:continue
        x=(c,h[c])
        bb,hh,nn,terminal=physical_move(b,h,n,c,lines)
        if terminal:continue
        for p in (0,1):
            for L in lines:
                source=grade(b,h,p,L)
                predicted=expected_grade_after(source,x,n%2==p)
                physical=grade(bb,hh,p,L)
                actual=None if physical is None else physical[:2]
                assert predicted==actual,(n,c,p,L,source,predicted,actual)
                comparisons+=1
    return comparisons

def polynomial(b,h,p,lines):
    z=defaultdict(int)
    for L in lines:
        g=grade(b,h,p,L)
        if g is not None:z[g[:2]]+=1
    return dict(z)

def at_i(coeff):
    real=imag=0
    for (_,d),multiplicity in coeff.items():
        if d%4==0:real+=multiplicity
        elif d%4==1:imag+=multiplicity
        elif d%4==2:real-=multiplicity
        else:imag-=multiplicity
    return [real,imag]

def source_word(word):
    width=7
    lines=source_lines(width)
    b,h,n=root(width)
    for s in word:
        b,h,n,win=physical_move(b,h,n,int(s)-1,lines)
        assert not win,("premature firstwinner",word,n)
    return b,h,n

spectra={}
for width in (6,7):
    lines=source_lines(width)
    assert len(lines)==(54 if width==6 else 69)
    b,h,n=root(width)
    coeff=polynomial(b,h,0,lines)
    directed={}
    for ori in "HVRF":
        spec=polynomial(b,h,0,[L for L in lines if L[0]==ori])
        directed[ori]={"coefficient_count":sum(spec.values()),"i":[*at_i(spec)]}
    assert at_i(coeff)==[0,width]
    assert directed["H"]["i"][0]==-sum(
        directed[k]["i"][0] for k in ("R","F"))
    spectra[str(width)]={
        "originalK4Windows":len(lines),
        "emptyGradePolynomial":[{"k":k,"supportDebt":d,"coefficient":v}
          for (k,d),v in sorted(coeff.items())],
        "zEqualsI":at_i(coeff),
        "contributionsByTrueOrientation":directed
    }

names=(
 "","4","44","445","445367","43556","44444",
 "444443333636613412225777255525666717751",
 "44444316171121213232325353556575766677"
)
profiles=[]
compares=0
for word in names:
    b,h,n=source_word(word)
    lines=source_lines(7)
    compares+=verify_q(b,h,n,lines)
    a=at_i(polynomial(b,h,0,lines))
    z=at_i(polynomial(b,h,1,lines))
    profiles.append({"word":word,"rank":n,
        "P0Z4":a,"P1Z4":z,"signedZ4":[a[0]-z[0],a[1]-z[1]]})

# Every rank0..42 firstwin-free position of a separately verified
# ORIGINAL legal full draw, all legal one-step next actions.
word="444443333337777774111111222222555555666666"
lines=source_lines(7)
b,h,n=root(7)
for c in word:
    compares+=verify_q(b,h,n,lines)
    b,h,n,won=physical_move(b,h,n,int(c)-1,lines)
    assert not won
compares+=verify_q(b,h,n,lines)
assert n==42 and all(x==H for x in h)

# Exact mixed-role P1 source at historic held-back q39; line IDs are
# built from all69 geometry, not imported from historic strong labels.
def role(b,h,x,p=0):
    data={"blocked_one_missing":0,"blocked_two_missing":0,
          "enabled_one_missing":0,"enabled_directions":[]}
    for L in source_lines(7):
        g=grade(b,h,p,L)
        if g is None:continue
        k,d,R,S=g
        if x in R:
            if k==1:data["blocked_one_missing"]+=1
            if k==2:data["blocked_two_missing"]+=1
        elif x in S and k==1:
            data["enabled_one_missing"]+=1
            data["enabled_directions"].append(L[0])
    return data

b,h,n=source_word("444443333636613412225777255525666717751")
mixed=role(b,h,(0,4))
assert mixed=={"blocked_one_missing":2,"blocked_two_missing":1,
               "enabled_one_missing":1,"enabled_directions":["F"]}
b,h,n=source_word("4444431617112121323232535355657576667")
vertical=role(b,h,(6,4))
assert vertical=={"blocked_one_missing":1,"blocked_two_missing":1,
                 "enabled_one_missing":0,"enabled_directions":[]}
assert compares==32016

report={
 "schema":1,"date":"2026-10-21","scope":"true original 6/7x6 K4 source geometry and owner/physical gravity, no solved game inputs",
 "spectra":spectra,"sampleCurrentFourier":profiles,
 "independentTruePerLineNextActionGradeChecks":compares,
 "originalRank39MixedBlockAndSupport":mixed,
 "originalRank37VerticalPureBlock":vertical,
 "meaning":"Gravity support Fourier at mod4 exactly cancels original H against original R+F at EMPTY on BOTH board widths. Site-owner update has block vs support signs across different original K4 line requirements. Neither determines root WDL."
}
print(json.dumps(report,indent=2))
