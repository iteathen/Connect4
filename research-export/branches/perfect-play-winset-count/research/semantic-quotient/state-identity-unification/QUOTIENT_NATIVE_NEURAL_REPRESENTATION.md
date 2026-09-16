# Quotient-Native Neural Representation for Exact Chess Solvers

**Status:** research hypothesis; empirical qualification required  
**Date:** 2026-09-11  
**Owner branch:** `research/semantic-quotient`  
**Research direction and architecture:** Josh Oshiro  
**Adversarial analysis / reconstruction:** OpenAI ChatGPT

## Purpose

The chess quotient program creates a second opportunity beyond search-graph compression: if the solver already computes an exact relational state whose purpose is to preserve future-relevant interaction structure, the neural network need not reconstruct that relational structure from a raw spatial bitmap.

The working hypothesis is:

> A sufficiently complete, canonical quotient-native input may remove much of the architectural advantage of a Chessformer/attention model, allowing a smaller residual network or other simple feed-forward model to learn higher-order consequences of already-explicit relations at lower inference cost.

This is not a claim that ResNet is inherently superior to a transformer, nor that neural architecture becomes irrelevant. It is a claim about **where relational structure should be represented**. If exact solver state already exposes the ontology, the network should consume it rather than relearn it.

---

## 1. Architectural inversion

A conventional raw-board neural pipeline is approximately:

```text
physical board / bitmap
        |
        v
neural relation discovery
        |
        v
higher-order tactical/strategic inference
        |
        v
value / policy
```

A quotient-native pipeline instead aims for:

```text
physical augmented state x=(p,h)
        |
        v
exact relational/quotient descriptor X=(q,hq)
        |
        +-----------------------------+
        |                             |
        v                             v
 exact solver semantics        neural inference
                                      |
                                      v
                         higher-order implications
                                      |
                                      v
                     value / quotient-policy / proof cost
```

The exact state machinery owns the relational mapping. The neural model learns what those relationships imply.

This changes the role of the NN from **relation discovery + evaluation** to primarily **relation composition + prediction**.

---

## 2. Why this may reduce the advantage of Chessformer

Attention-based chess models are attractive when long-range relations must be inferred from primitive spatial inputs. Chess contains inherently non-local dependencies: pins, x-rays, batteries, king exposure, overloaded defenders, pawn breakthroughs and remote promotion races.

A transformer can learn dynamic pairwise interaction by allowing distant tokens to attend to one another.

However, if the input state already explicitly encodes the relevant relations or their canonical consequences, then much of that burden has moved outside the network.

Instead of learning:

```text
square occupancy
 -> discover attacker/target relation
 -> discover blocker relation
 -> discover pin/x-ray relation
 -> compose relations
 -> evaluate
```

the model may receive:

```text
canonical interaction / residual structure
 -> compose relations
 -> evaluate
```

Under that condition, the architectural advantage of self-attention can shrink materially.

The key qualification is that the quotient representation must itself be canonical and sufficiently explicit. A poorly ordered variable graph does not automatically become easy for a convolutional network merely because it is called relational.

---

## 3. NN input should follow semantic identity, not physical board identity

If exact quotient qualification establishes

\[
Q_T(x_1)=Q_T(x_2)=q,
\]

then a quotient-native network can consume the same input for both physical states.

A raw-board network instead receives two distinct training samples and must learn the invariance:

\[
f(p_1) \approx f(p_2).
\]

The quotient-native system enforces it structurally:

\[
p_1,p_2 \rightarrow q \rightarrow f(q).
\]

This has several potential benefits:

- reduced dataset redundancy;
- lower target variance inside exact semantic classes;
- no neural capacity spent distinguishing solver-proven irrelevant physical differences;
- easier transfer between search, proof and NN components because they speak the same semantic language;
- potentially smaller models for the same inference quality.

This is stronger than ordinary data augmentation. Exact quotienting removes redundant representations rather than asking training to learn invariance statistically.

---

## 4. Candidate quotient-native tensor layouts

The quotient does not require a transformer-style token sequence. The appropriate neural layout depends on the final packed semantic state.

### 4.1 Fixed canonical feature vector

If `q` can be packed into a stable fixed-width canonical feature vector, a residual MLP is the simplest control:

```text
packed q/hq features
      -> projection
      -> residual MLP blocks
      -> heads
```

This minimizes inference overhead and avoids imposing artificial two-dimensional locality.

### 4.2 Canonical relation tensor

If the quotient naturally exposes relationships among a bounded canonical set of entities, use a tensor such as:

\[
R[i,j,k]
\]

where `i` and `j` identify canonical entities and `k` is a relation channel.

Candidate channels may include only relations proven useful/available in the exact state, for example:

- attacks / attacked-by;
- defends / defended-by;
- blocks / blocked-by;
- pin / x-ray dependency;
- king-threat dependency;
- pawn reachability / promotion dependency;
- mobility/accessibility class;
- latent reactivation class;
- exact quotient-transition features.

A residual tensor network can then learn higher-order patterns over already-computed pairwise structure.

### 4.3 Structured residual network

If `q` consists of several fixed semantic components rather than one homogeneous tensor, use per-component projections followed by residual fusion:

```text
support/topology features --+
interaction features -------+--> residual trunk --> heads
history/rule features -------+
proof-context features ------+
```

This may preserve ownership boundaries better than forcing the entire quotient into a board-shaped image.

### 4.4 Graph/message-passing control

A graph neural network remains a valid control if the quotient retains variable entity sets or permutation-sensitive structure. The research hypothesis is not that graph/attention architectures are useless; it is that **they should have to earn their cost once relational structure is explicit**.

---

## 5. Do not force quotient state back into an 8x8 bitmap

A conventional ResNet is biased toward spatial locality. If quotient features are arbitrarily reshaped into an 8x8 image, neighboring tensor cells may have no semantic locality.

Therefore "use a ResNet" should be interpreted as:

> prefer a simple residual architecture matched to the canonical quotient layout,

not:

> pretend the quotient is still a chessboard image.

The lowest-cost model may be a residual MLP, 1-D residual network, bounded relation-tensor network, or another fixed-shape residual architecture.

The relevant comparison is inference efficiency versus prediction quality, not architectural branding.

---

## 6. Neural outputs should be quotient-native

The NN should predict objects consumed directly by the exact solver rather than reconstructing conventional physical-chess outputs unless required at an external boundary.

Candidate heads:

### 6.1 W/D/L or value prior

\[
\hat V(X)
\]

Used for ordering, aspiration initialization or other non-authoritative guidance.

### 6.2 Quotient-successor policy

Instead of scoring physical move strings, predict over unique qualified quotient successors:

\[
P(q'\mid X), \qquad q'\in Succ_Q(X).
\]

If several physical moves map to the same quotient transition, they need not receive separate neural probability mass for search purposes.

A witness map can recover a concrete legal move when the external interface requires one.

### 6.3 Proof-cost prediction

Predict expected work to establish W/D/L or a typed proof fact:

\[
\widehat C_{proof}(X,q').
\]

This can drive move ordering or proof scheduling directly.

### 6.4 Bound/certificate utility prediction

Predict which successor or structural relation is most likely to yield a useful exact bound or transferable proof certificate.

### 6.5 Optional strong-distance refinement

The default product contract can remain W/D/L while a separate head estimates distance-sensitive information for optional refinement.

---

## 7. Neural output is never proof authority

The quotient may be exact; the NN is not.

Neural outputs may control:

- ordering;
- scheduling;
- aspiration guesses;
- proof-cost priorities;
- candidate structural hypotheses;
- cache-admission heuristics.

They may not independently publish:

- exact W/D/L;
- transition equivalence;
- proof-transfer equivalence;
- terminal legality;
- exact alpha-beta bounds;
- certified history collapse.

All exact facts remain owned by qualified symbolic/search/proof machinery.

This boundary allows aggressive neural experimentation without weakening solver correctness.

---

## 8. Quotient-native training targets

The bounded quotient experiments can generate stronger supervision than ordinary game-result labels.

### 8.1 Transition-class supervision

For exact bounded domains, train positive and negative pairs using qualified `Q_T` classes:

\[
Q_T(x_1)=Q_T(x_2)
\]

versus

\[
Q_T(x_1)\neq Q_T(x_2).
\]

This supports contrastive or metric-learning experiments.

Hard negatives should deliberately include states that are spatially similar but semantically different because of:

- latent reactivation;
- castling rights;
- en-passant state;
- repetition context;
- pins/x-rays;
- different quotient successor sets.

### 8.2 Successor-signature supervision

Train against the exact quotient successor signature:

\[
Sig_Q(X)=\{Q_T(X'):X\rightarrow X'\}.
\]

This encourages the latent representation to preserve future-relevant behavior rather than superficial board similarity.

### 8.3 Proof-transfer supervision

Once a typed `R_P` relation is discovered and qualified, use it to train proof-reuse predictors without confusing value equality with certificate transferability.

### 8.4 Exact oracle targets

Use available W/D/L and distance information, including the existing local 6/7-piece tablebase source after format/rule verification, as oracle supervision where compatible with the declared rule contract.

---

## 9. Learned quotient discovery is allowed only as hypothesis generation

A neural encoder may also be trained to find compressed latent structure:

\[
z=f_\theta(X)
\]

with objectives that preserve terminal observations, W/D/L, transition signatures and successor predictability while encouraging compact latent representations.

This can suggest candidate invariants or clusters.

However:

> neural proximity is not semantic equivalence.

Any learned collapse must be extracted into, or checked against, an exact structural criterion before it can influence `Q_T` or `R_P` authority.

The NN is therefore a structural microscope for quotient discovery, not the definition of the quotient.

---

## 10. Experimental architecture campaign

Compare models on the **same qualified quotient input** before deciding that attention is necessary.

Recommended controls:

1. linear / shallow MLP baseline;
2. residual MLP on fixed canonical quotient features;
3. residual tensor network on canonical relation features;
4. lightweight graph/message-passing model if variable structure remains;
5. Chessformer/attention control;
6. conventional bitmap ResNet control where useful for comparison.

Hold constant where practical:

- training examples;
- target heads;
- parameter budget classes;
- training compute;
- inference precision;
- batch conditions;
- solver integration contract.

Measure both standalone predictive quality and solver-level utility.

### Primary NN metrics

- W/D/L calibration and accuracy;
- quotient-action top-k accuracy;
- proof-cost ranking quality;
- inference latency;
- throughput;
- VRAM footprint;
- parameter count;
- sample efficiency.

### Final solver metric

The promotion metric is still:

\[
\boxed{\text{time to exact proof}}
\]

The best standalone network is not necessarily the best solver network.

---

## 11. Key hypotheses

### H1 — relation extraction has been externalized

If `q` already contains the future-relevant relational substrate, attention provides less marginal value than it does over raw board inputs.

### H2 — simpler models become competitive

A small residual network over `q` can match or exceed the solver utility of a larger Chessformer at lower inference cost.

### H3 — quotienting improves sample efficiency

Exact semantic merging removes redundant physical examples and reduces the burden of learning invariances statistically.

### H4 — quotient-native policy is cheaper

Ranking unique quotient successors is easier and cheaper than predicting a conventional physical move policy when multiple moves share one semantic child.

### H5 — exact quotient + neural hints is stronger than neural quotienting

The solver should compute/qualify exact equivalence while the NN estimates consequences and proof economics. Letting the NN define equivalence would sacrifice the correctness advantage of the architecture.

---

## 12. Falsifiers

The hypothesis weakens or fails if experiments show that:

- `q` remains nearly as spatial/raw as a conventional board, so relation extraction was not actually externalized;
- canonical quotient features are expensive to construct relative to their solver benefit;
- Chessformer materially outperforms residual models even when all receive equivalent relational information and inference cost is accounted for;
- quotient-native policy loses critical physical action information not recoverable through qualified witness mappings;
- NN training on quotient states is harmed by class aggregation or history fragmentation;
- the end-to-end exact solver is slower despite improved standalone NN metrics.

---

## 13. Current architectural hypothesis

The strongest candidate architecture is:

```text
                   augmented physical state x=(p,h)
                              |
                              v
                  exact relational state X=(q,hq)
                         /             \
                        /               \
                       v                 v
             exact solver algebra    quotient-native NN
             Q_T / R_P / proofs      residual-first control
                       \                 /
                        \               /
                         v             v
                    exact search / proof scheduling
                              |
                              v
                       certified result
```

Bitboards may remain an execution adapter where they are physically faster. They are not required to be the neural ontology.

The resulting design principle is:

> **Do not make the neural network relearn relations that the exact state representation already knows. Expose the ontology once, then train the network to learn its consequences.**

---

## Non-claims

- no claim that a ResNet/residual model will beat Chessformer before measurement;
- no claim that every relational quotient admits a useful fixed tensor layout;
- no claim that NN similarity establishes exact quotient identity;
- no claim that physical bitboards must be removed from move generation;
- no claim that quotient-native policy can discard physical witness mappings;
- no solver promotion until end-to-end time-to-exact-proof improvement is demonstrated.