"""Independent physical test of COOPERATIVE legal DRAW suffixes.

Replays saved historical firstwinner-41 words from an original empty 7x6K4
board. At any selected prefix checks if at least ONE continuation can fill all
42 cells under true gravity, strict alternating ownership and firstwin stop.
This is NOT a minimax WDL solver: the P0 and P1 choices cooperate.
It is a falsifier for static owner-coloring draw-feasibility as a sufficient
schedule criterion, and for Fibonacci-only phase as a necessary DRAW condition.
Execute with Python3 and a plain text file of the 27 unique archived 41-ply
zero-based witness words (one per line).
"""
from functools import lru_cache
import sys
W, H = 7, 6
WIN = []
for c in range(W):
    for r in range(H):
        for dc, dr in [(1,0),(0,1),(1,1),(1,-1)]:
            cells = [(c+dc*i, r+dr*i) for i in range(4)]
            if all(0 <= x < W and 0 <= y < H for x,y in cells):
                WIN.append(sum(1 << (x*H+y) for x,y in cells))
assert len(WIN) == 69

def prefix_state(word, n):
    h = [0]*W
    p0 = p1 = 0
    for i, digit in enumerate(word[:n]):
        c = int(digit)
        assert 0 <= c < W and h[c] < H
        bit = 1 << (c*H+h[c])
        h[c] += 1
        if i%2 == 0: p0 |= bit
        else: p1 |= bit
        assert not any((p0&ell)==ell or (p1&ell)==ell for ell in WIN)
    return tuple(h), p0

def actual_cooperative_draw(state):
    h0,p0 = state
    @lru_cache(None)
    def check(heights, bits0):
        total = sum(heights)
        if total == W*H: return ()
        occupied = sum(((1 << n)-1) << (c*H) for c,n in enumerate(heights))
        bits1 = occupied ^ bits0
        mover = total % 2
        for c in range(W):
            if heights[c] >= H: continue
            bit = 1 << (c*H+heights[c])
            new0 = bits0 | bit if mover == 0 else bits0
            new1 = bits1 | bit if mover == 1 else bits1
            if any((new0&ell)==ell or (new1&ell)==ell for ell in WIN):
                continue
            later = list(heights)
            later[c] += 1
            suffix = check(tuple(later), new0)
            if suffix is not None: return (c+1,)+suffix
        return None
    answer = check(h0,p0)
    return answer,check.cache_info().currsize

if __name__ == "__main__":
    if len(sys.argv)!=2:
        raise SystemExit("Pass a text file of exact historical unique zero-based game words")
    words = [x.strip() for x in open(sys.argv[1]) if x.strip()]
    assert len(words)==27 and len(set(words))==27
    for w in words:
        assert len(w)==41
    statuses=[]
    for i,w in enumerate(words):
        first_no_draw = None
        n31=n37=n39=None
        for n in range(29,42):
            suffix,states = actual_cooperative_draw(prefix_state(w,n))
            feasible = suffix is not None
            if not feasible and first_no_draw is None:
                first_no_draw = n
            if n==31:n31=feasible
            if n==37:n37=feasible
            if n==39:n39=feasible
        assert first_no_draw is not None
        statuses.append((i+1,first_no_draw,n31,n37,n39))
        print("ORIGINAL_GAME",i+1,"first_legal_draw_impossible_rank",first_no_draw,
              "rank31",n31,"rank37",n37,"rank39",n39)
    print("ALL_ARCHIVED_GAMES",len(words))
    for n in (31,35,37,39,40):
        print("RANK",n,"legal_cooperative_draw_games",sum(
            actual_cooperative_draw(prefix_state(w,n))[0] is not None for w in words))
