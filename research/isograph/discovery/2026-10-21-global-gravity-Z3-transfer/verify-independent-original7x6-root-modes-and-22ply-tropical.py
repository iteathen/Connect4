#!/usr/bin/env python3
"""Independent Python reconstruction of original 69 physical K4s:
static root upper-mate matroid projection and genuine rank22 tropical WSL
certificate. No complete original-game state enumeration or solved labels.
Run: python3 verify-independent-original7x6-root-modes-and-22ply-tropical.py
"""
from collections import Counter

W, H = 7, 6
windows = []
for c in range(W):
    for r in range(H):
        for dx, dy, name in ((1, 0, "H"), (0, 1, "V"), (1, 1, "R"), (1, -1, "F")):
            cells = tuple((c + k * dx, r + k * dy) for k in range(4))
            if all(0 <= x < W and 0 <= y < H for x, y in cells):
                windows.append((name, cells))
assert len(windows) == 69
counts = Counter(name for name, _ in windows)
assert counts == {"H": 24, "V": 21, "R": 12, "F": 12}

# The empty-board fixed upper-mate P1 contract has P0 free lower
# sites at physical rows 1,3,5. This is NOT a universal P1 strategy.
upper_mate_free = {(c, r) for c in range(W) for r in (0, 2, 4)}
gaps = Counter(4 - len(set(cells) & upper_mate_free) for _, cells in windows)
surviving = [cells for _, cells in windows if set(cells) <= upper_mate_free]
assert gaps == {0: 12, 2: 45, 4: 12} and len(surviving) == 12
no_four = sum(not (m & (m >> 1) & (m >> 2) & (m >> 3)) for m in range(128))
assert no_four == 108 and no_four ** 3 == 1259712

# ONE genuinely legal source history; no child strategic values queried.
history = "2121136126673113635772"
board = [[-1] * H for _ in range(W)]
heights = [0] * W
for ply, column in enumerate(history):
    col = int(column) - 1
    board[col][heights[col]] = ply % 2
    heights[col] += 1
    assert not any(
        all(board[x][y] == ply % 2 for x, y in cells)
        for _, cells in windows
    )
assert heights == [6, 4, 4, 0, 1, 4, 3]

# Physical respondent P1 first-entry trap: D enters column c, then
# P1 takes the newly playable cell just above it to FIRSTWIN.
traps = []
for c in range(W):
    if H - heights[c] < 2:
        continue
    if any(
        (c, heights[c] + 1) in cells
        and all(board[x][y] == 1 for x, y in cells if (x, y) != (c, heights[c] + 1))
        for _, cells in windows
    ):
        traps.append(c)
assert traps == [3]
odd = [c for c in range(W) if c not in traps and (H - heights[c]) % 2 == 1]
assert odd == [4, 6]

raw = [
    frozenset((c, r) for c, r in cells if board[c][r] == -1)
    for _, cells in windows
    if all(board[c][r] != 1 for c, r in cells)
]
assert len(raw) == 26
unique = set(raw)
antichain = [g for g in unique if not any(other < g for other in unique)]
assert len(antichain) == 22

free = set()
for c in range(W):
    if c in traps:
        continue
    remaining = H - heights[c]
    for r in range(heights[c] + remaining % 2, H, 2):
        free.add((c, r))
q_pair = {(c, heights[c]) for c in odd}
x_trap = {(c, heights[c]) for c in traps}
def matroid_rank(g):
    return len(g & free) + int(bool(g & q_pair)) + int(bool(g & x_trap))
profile = Counter(len(g) - matroid_rank(g) for g in antichain)
assert profile == {1: 11, 2: 4, 3: 3, 4: 4}
assert min(profile) == 1
print("INDEPENDENT_ORIGINAL7X6_K4", dict(counts))
print("EMPTY_ROOT_VERTICAL_MATE", dict(gaps), "UNBLOCKED", len(surviving),
      "FOUR_RUN_FREE", no_four, "THREE_ROWS", no_four**3)
print("RANK22_SOURCE", heights, "TRAPS", [c+1 for c in traps],
      "ODD_Q", [c+1 for c in odd], "MINIMAL", len(antichain),
      "NULLITIES", dict(sorted(profile.items())), "GAMMA", min(profile))
print("PASS_INDEPENDENT_PYTHON_GEOMETRY_AND_TROPICAL_SOURCE")
