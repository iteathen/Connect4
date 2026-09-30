# EW-RS-089: either stratum can retain owner orientation

The complete36-map grid was structurally committed at2672005f. Seven maps pass pooled reconstruction. Six have rank352; the fully separated control has rank353.

Passing pairs (frontier | positive depth):
- TOTAL|OWNER_SEPARATED
- ABS_NET|OWNER_SEPARATED
- SIGN_UNORDERED|OWNER_SEPARATED
- OWNER_PAIR_UNORDERED|OWNER_SEPARATED
- OWNER_SEPARATED|SIGN_UNORDERED
- OWNER_SEPARATED|OWNER_PAIR_UNORDERED
- OWNER_SEPARATED|OWNER_SEPARATED

All other29 maps fail. In particular TOTAL|SIGN_UNORDERED and OWNER_PAIR_UNORDERED|OWNER_PAIR_UNORDERED retain one win-character contradiction, whereas all25 candidates with both strata nonconstant preserve the draw character. Removing either stratum loses all3 nonzero scalar characters. These refer to matched-dependency scalar codes, not board classifiers.

The earlier successful frontier-owner repair was one option. With the full bulk owner vectors, frontier TOTAL or ABS_NET also suffices. Conversely, with frontier owners retained, unordered bulk sign marginals suffice. Thus this corpus admits alternative locations for an orientation anchor; it does not force an absolute frontier-owner requirement.

No universal minimality is inferred from rank352. No coefficients are fitted. The next audit takes the finest common triangle partition and finest common linear dependency quotient of these7 successful maps. This outcome-informed choice of a new candidate family is explicit and frozen before its replay; it does not alter any prior frozen experiment. Both holdouts remain sealed.
