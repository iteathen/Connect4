#!/usr/bin/env python3
"""Independent original-7x6 source-only WLD certificate reimplementation.
For q7=4214254 with P1 first b1=2 or b1=7, P0 c4:
P1's second response b2 is met by P0 c6 iff b2=3 else P0 c3.
The resulting q11 true P1 normalized original-K4 requirements have one
matroid-independent residual, always from ORIGINAL H4 row5 c4..c7,
which P0's online policy strictly firstwins below at row4.
All other original P1 residuals are matroid-dependent.
No complete game state enumeration, recursive WLD, oracle, or sub-five game.
"""
from collections import Counter, defaultdict

W, H = 7, 6
DIRECTIONS = (("H",1,0), ("V",0,1), ("R",1,1), ("F",1,-1))
LINES = []
for name, dx, dy in DIRECTIONS:
    for c in range(1, W+1):
        for r in range(1, H+1):
            line = tuple((c+i*dx,r+i*dy) for i in range(4))
            if all(1 <= x <= W and 1 <= y <= H for x,y in line):
                LINES.append((name,line))
assert Counter(name for name,_ in LINES) == Counter(H=24,V=21,R=12,F=12)
ORIGINAL = set(LINES)

def physical_board(word):
    h, owner = [0]*W, {}
    for i,c in enumerate(map(int,word)):
        r = h[c-1] + 1
        assert r <= H
        h[c-1] = r
        owner[(c,r)] = i%2
        assert not any(all(owner.get(x)==i%2 for x in line)
                       for _,line in LINES), "a source prefix already firstwon"
    return h,owner

def minimal_wsl(owner,p):
    sources = defaultdict(list)
    for direction,line in LINES:
        if any(owner.get(x)==1-p for x in line):
            continue
        missing = frozenset(x for x in line if x not in owner)
        if missing:
            sources[missing].append((direction,line))
    return {g:provenance for g,provenance in sources.items()
            if not any(h < g for h in sources)}

def pairings(cols):
    if not cols:
        yield ()
        return
    a,*rest = cols
    for i,b in enumerate(rest):
        for tail in pairings(rest[:i]+rest[i+1:]):
            yield ((a,b),)+tail

def proved_strict_shadow(owner,heights,traps,direction,line):
    if direction == "V" or min(r for _,r in line)<=1:
        return False
    lower = tuple((c,r-1) for c,r in line)
    if (direction,lower) not in ORIGINAL:
        return False
    for c,r in line:
        if owner.get((c,r)) == 0:
            return False
        if owner.get((c,r-1)) == 0:
            continue
        if (c,r-1) in owner or (c,r) in owner or c in traps:
            return False
        first_D_tail = heights[c-1] + (6-heights[c-1])%2 + 1
        if r-2 < first_D_tail or (r-2-first_D_tail)%2 != 0:
            return False
    return True

result = []
for b1 in (2,7):
    for b2 in range(1,8):
        a2 = 6 if b2==3 else 3
        word = "4214254"+str(b1)+"4"+str(b2)+str(a2)
        heights,owner = physical_board(word)
        A = minimal_wsl(owner,0)
        D = minimal_wsl(owner,1)
        traps = [c for c in range(1,8)
                 if heights[c-1]<=4 and
                    frozenset({(c,heights[c-1]+2)}) in A]
        assert 3 in traps
        odd = [c for c in range(1,8)
               if c not in traps and (6-heights[c-1])%2==1]
        assert len(odd)%2==0
        frames = []
        for Q in pairings(odd):
            E = {(c,r) for c in range(1,8) if c not in traps
                 for r in range(heights[c-1]+(6-heights[c-1])%2+1,7,2)}
            blocks = [{(c,heights[c-1]+1) for c in pair} for pair in Q]
            X = {(c,heights[c-1]+1) for c in traps}
            def rank(g):
                return len(g & E)+sum(bool(g & block) for block in blocks)+bool(g & X)
            dependent = 0
            shadowed = []
            unresolved = []
            for g,provenance in D.items():
                gap = len(g)-rank(g)
                assert gap>=0
                if gap>0:
                    dependent += 1
                    continue
                valid = [line for direction,line in provenance
                         if proved_strict_shadow(owner,heights,traps,direction,line)]
                if valid:
                    shadowed.append((g,valid))
                else:
                    unresolved.append((g,provenance))
            if not unresolved:
                frames.append((Q,dependent,shadowed))
        assert frames, (b1,b2,"no legal P0 source certificate")
        Q,dependent,shadowed = frames[0]
        assert dependent==len(D)-1 and len(shadowed)==1
        g,valid = shadowed[0]
        row5 = tuple((c,5) for c in range(4,8))
        assert row5 in valid and g <= frozenset(row5)
        result.append({
            "b1":b1,"b2":b2,"a2":a2,"history":word,
            "P1MinimumWSL":len(D),"P1MatroidDependent":dependent,
            "P1StrictFirstwinShadowed":1,"trap":traps,"oddBases":odd,
            "legalQ":Q,"missingP1Row5":sorted(g),
            "originalP1SourceLine":"H row5 c4-c7"
        })
    print("FIRST_REPLY",b1,"ALL_SEVEN_P1_NEXT_RESPONSES_SOURCE_CERTIFIED")
assert len(result)==14
for row in result:
    print(row)
print("PASS_INDEPENDENT_ORIGINAL7X6_SOURCE_Q9_TWO_P0_WINS_14_CASES")
