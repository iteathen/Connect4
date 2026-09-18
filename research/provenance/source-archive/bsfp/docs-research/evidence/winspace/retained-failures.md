# Retained failures and corrections

Historical files below remain byte-for-byte in the full research bundle. This inventory is not a substitute for their contents. No wrong exact score was found in the completed qualified corpus.

- `failures/benchmark-before-adaptive.mjs.txt`: 4360 bytes; SHA-256 `210f1a97f5f7b699899ca2395763e327c1126ec3d275a06c04cd76317893365e`.
- `failures/benchmark-v1-before-warmup.mjs.txt`: 4119 bytes; SHA-256 `83c40f3cf9bd112e965b7e4554639c04bfdba29edf1aa374980514a6bd47cef0`.
- `failures/benchmark-v3-measured.mjs.txt`: 5261 bytes; SHA-256 `ff7e9cf0522d420c5b86f4e225fbf1161bb53eaf4422d6e11d49de364501e3bf`.
- `failures/corpus-input-shape.stderr`: 787 bytes; SHA-256 `2faf65fab05eb67cfb71950ea37cce81b3a2de6f6acfaa753b1b281de55711c8`.
- `failures/root-draw-before.jsonl`: 606 bytes; SHA-256 `45ea678b1e7d8539f25149715bad3a9f843dc171a3b2f319f5871629e0510229`.
- `failures/root-draw-before.stderr`: 642 bytes; SHA-256 `d7df6e43f2ea1948bb85d97b760b44fddf2e66a4efe229436b60e908201338d8`.
- `failures/solver-before-fixed-arena.mjs.txt`: 4864 bytes; SHA-256 `03113d9bd3604478810c74741d48c81717258425620bdd4cfaed1556551d6cf6`.
- `failures/solver-before-root-draw.mjs.txt`: 4831 bytes; SHA-256 `554d2b1f451b862a6caf7d271b8204fcf0ef11140c2c2ec5fbccbf733a190240`.

The initial corpus shape mistake prevented measurement. The root-draw correction removes redundant proof passes. First timing screens inadequately warmed specialized kernels and allocated new backing stores at some root changes. Later tests preallocate the backing arena. The measured v3 runner loaded the correct CORPUS file, but hashed the default corpus in its configuration header; published benchmark.mjs corrects only that metadata expression after measurement. Original rows and source snapshots remain unchanged.
