# Chunk probe diagnostic

Research direction / architecture: Josh Oshiro  
Implementation / qualification: OpenAI ChatGPT

Instrumented lookup counters, not CPU/cache-miss timing. A touched 64-byte block is an address-range count; cache line size, residency, evictions, latency and temporal locality are not measured. Histogram bin 64 includes >=64; maxProbe is exact.

Result, every search/proof/descriptor counter, memory and growth match uninstrumented baseline.

Mean slots examined: 1.060. One-slot lookups: 94.75%. Maximum: 10. Extra collision reads: 164221.

| Chunk dictionary | Unique chunks | Hash load | Mean slots | One-slot % | Max slots | Reserved MiB | Touched read blocks MiB |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0 | 227 | 0.043% | 1.010 | 98.97 | 2 | 4.00 | 0.015 |
| 1 | 199 | 0.038% | 1.009 | 99.12 | 2 | 4.00 | 0.014 |
| 2 | 432 | 0.082% | 1.005 | 99.55 | 2 | 4.00 | 0.029 |
| 3 | 158 | 0.030% | 1.002 | 99.85 | 3 | 4.00 | 0.011 |
| 4 | 52 | 0.010% | 1.000 | 100.00 | 1 | 4.00 | 0.004 |
| 5 | 4442 | 0.847% | 1.070 | 93.19 | 4 | 4.00 | 0.285 |
| 6 | 12239 | 2.334% | 1.048 | 95.40 | 4 | 4.00 | 0.695 |
| 7 | 2503 | 0.477% | 1.000 | 99.99 | 2 | 4.00 | 0.166 |
| 8 | 8423 | 1.607% | 1.053 | 94.97 | 4 | 4.00 | 0.508 |
| 9 | 132068 | 25.190% | 1.112 | 91.19 | 10 | 4.00 | 2.963 |
