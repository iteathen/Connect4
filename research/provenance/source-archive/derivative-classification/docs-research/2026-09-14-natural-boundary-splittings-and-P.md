# Natural boundary splittings and the typed home of P

**Research direction / structural architecture / invariant-first and self-proving-predicate program:** Josh Oshiro  
**Formalization / implementation / qualification:** OpenAI ChatGPT

This checkpoint continues from the proved natural middle isomorphism `T:Y_line -> Y_cell` and resolves the previously noncanonical splitting boundary for the corrected quotients.

## Cell side

The corrected cell quotient is not raw column phase. It is the rank-7 image of row-plus-column parity on `im(B)`:

```text
Q_axis = I_4(columns) direct-sum I_4(rows)
```

with dimensions `4+3=7`, where each `I_4` is the span of length-4 consecutive interval vectors.

There is an explicit Connect4-defined section:

- lift the four column-interval generators by the four winning horizontals on the **bottom row**;
- lift the three row-interval generators by the three winning verticals in the **center column**.

Their axis-parity images are exactly the seven quotient generators. Therefore

```text
im(B) = Y_cell direct-sum C_axis
35    = 28     + 7.
```

The bottom row is selected by gravity and the center column by the odd-width left-right symmetry; no Gaussian complement defines this section.

## Line side

The corrected line quotient is vertical-line parity on `ker(B)`. Its image is exactly

```text
Even(F2^7) = {v : XOR(v)=0}, dim 6.
```

Use the center-star basis

```text
e_c + e_4,  c in {1,2,3,5,6,7}
```

(one-based columns). The executable control constructs three explicit six-line dependency cycles for columns 1/2/3 against the center and obtains the 5/6/7 cycles by exact left-right reflection. Every cycle is in `ker(B)` and has the requested pure-vertical-line parity.

Thus the section is a right inverse of the quotient map and

```text
ker(B) = Y_line direct-sum C_phase
34     = 28     + 6.
```

The section is left-right equivariant.

## Category correction for P

The native two-ply CPC phase operator has displacement

```text
delta_phi = e_a + e_b.
```

This has even Hamming parity for every pair and is zero exactly when `a=b`. Therefore its natural codomain is precisely

```text
Even(F2^7),
```

the **line-side** quotient above.

The control checks all ordered column pairs:

- 7 same-column cases lift to zero exactly;
- all 42 distinct-column cases are nonzero even-weight quotient coordinates and lift through the explicit line section into `ker(B)`.

Under the direct-sum coordinate representation

```text
ker(B) = Y_line direct-sum C_phase,
```

this lifted `P` displacement changes only the boundary coordinate and leaves the common `Y` coordinate fixed.

This is a typed representation statement. It does **not** claim that adding a line-dependency vector is itself a legal Connect4 game transition. It says the CPC two-ply displacement space and the corrected line boundary quotient are the same natural GF(2) object.

## Consequence

After identifying `Y_line ~= Y_cell` through the CPC/residual isomorphism, the standard incidence algebra now has explicit natural decompositions

```text
im(B)  ~= Y direct-sum Q_axis
ker(B) ~= Y direct-sum Even(F2^7).
```

Their dimensions are

```text
35 = 28 + 7
34 = 28 + 6.
```

This is the structural content hidden behind the earlier numerical identity

```text
69 = (28+7) + (28+6).
```

The `7` factor is naturally an axis-interval quotient, not raw CPC phase. The `6` factor is naturally the even two-ply phase-displacement space. This corrects the earlier attempt to force `P` onto the image-side quotient.

The next unresolved piece is residual degree descent: whether the identified `Y` has a correct support/CPC quotient at degree 3 whose dimension is genuinely 21, or whether `7*3` remains only arithmetic.
