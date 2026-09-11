# Semantic quotient versus raw encoding size — clarification

**Date:** 2026-09-10  
**Applies to:** `docs/research/2026-09-10-minimum-description-semantic-quotient.md`

The identified-line candidate `(support,H0,H1)` should be called the first **semantic quotient control**, not assumed to be the first smaller raw encoding.

For standard 7x6, two independent 69-bit line-hit masks already require 138 logical bits before support is encoded, while the familiar physical board key is only 49 bits. Therefore carrying `(support,H0,H1)` literally can use more bits per record than a colored-board key.

Its value is different:

1. it merges many distinct historical boards into one future-equivalent semantic class;
2. it exposes monotone/local transitions;
3. it provides a better domain on which to compute a still smaller behavioral quotient;
4. after quotienting, the intended runtime representation is a dense class ID plus the minimum required context, not necessarily the raw line-hit masks.

Thus the minimum-description program distinguishes:

```text
semantic compression
    = fewer future-distinct classes

raw encoding compression
    = fewer stored bits/bytes per runtime record
```

The former can enable the latter but does not imply it automatically.

The correct experiment order remains:

```text
physical board
  -> exact semantic quotient control
  -> coarsest future-behavior partition
  -> dense class IDs / flat transitions
  -> measure actual record bytes and proof time
```

This clarification does not change the identified-line exactness evidence or the MQ1-MQ7 experiment program; it narrows the storage claim.