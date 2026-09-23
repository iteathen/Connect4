# Reviewed JSMinSys function inventory

Revision: `64ba37a11522b533a1de87942a14921fe690ef86`.
All 237 exported function bodies were read. Selection and precondition analysis
by family is in [the application review](jsminsys-rba-helper-review.md).
The pinned catalog owns detailed per-function preconditions and symbolic costs;
this inventory does not create a second authority or assert runtime qualification.

## src/word32.mjs (15)

- `bitTest32`
- `bitSet32`
- `bitSetI32`
- `bitClear32`
- `bitClearI32`
- `bitToggle32`
- `bitToggleI32`
- `firstSetBitIndex32`
- `firstSetHighBitIndex32`
- `isolatedBitIndex32`
- `isolatedHighBitIndex32`
- `popcount32`
- `popcount32Sparse`
- `subset32`
- `cardinalityClass32`

## src/word64x32.mjs (29)

- `and2x32Into`
- `or2x32Into`
- `xor2x32Into`
- `zero2x32`
- `equal2x32`
- `shl2x32Lt32Into`
- `shl2x32Ge32Into`
- `ushr2x32Lt32Into`
- `ushr2x32Ge32Into`
- `shl2x32Lt32PreparedInto`
- `shl2x32Ge32PreparedInto`
- `ushr2x32Lt32PreparedInto`
- `ushr2x32Ge32PreparedInto`
- `shl2x32Into`
- `ushr2x32Into`
- `add2x32Into`
- `sub2x32Into`
- `firstSetBitIndex2x32`
- `clearLowestSetBit32`
- `clearIsolatedBitI32`
- `clearIsolatedBit32`
- `clearLowestSetBitI32`
- `cardinalityClass2x32`
- `fillPopcount10Table32`
- `popcount2x32High10Table`
- `popcount2x32High10Sparse`
- `popcount2x32SparseBits`
- `popcount2x32SparseHigh`
- `popcount2x32`

## src/indexed32.mjs (32)

- `fillLandingCells32`
- `fillLandingCellsByOrder32`
- `landingCell32`
- `heightFromPacked3Support32`
- `landingCellFromPacked3Support32`
- `maskContains32`
- `maskContainsI32`
- `maskContains2x32`
- `maskContains2xI32`
- `projectMaskedPrefix2x32Into`
- `residualBase32`
- `residualTransition32`
- `fillResidualActionMajor32`
- `residualActionBase32`
- `residualTransitionActionMajor32`
- `powerOfTwoIndex32`
- `ttHit32`
- `ttReplace32`
- `ttUpdateValue32`
- `fillI32Sentinel32`
- `probe3x32SentinelSlot32`
- `probe2x32IdSlot32`
- `publish2x32IdSlot32`
- `selectGreater32`
- `selectLess32`
- `playableColumn32`
- `playableKnownCell32`
- `fillCoordinateTables32`
- `decodeColumnPowerOfTwo32`
- `decodeRowPowerOfTwo32`
- `decodeColumn32`
- `decodeRow32`

## src/state32.mjs (69)

- `restoreCallerOwnedResidualFrame32`
- `sideFromPly32`
- `applyMove1x32`
- `undoMove1x32`
- `applyMove32`
- `undoMove32`
- `applyMove1x32CallerPly`
- `undoMove1x32CallerPly`
- `applyMove32CallerPly`
- `undoMove32CallerPly`
- `applyMove1x32KnownCell`
- `applyMove1x32CallerPlyKnownCell`
- `applyMove32KnownCell`
- `applyMove32CallerPlyKnownCell`
- `undoMove1x32KnownCell`
- `undoMove1x32CallerPlyKnownCell`
- `undoMove32KnownCell`
- `undoMove32CallerPlyKnownCell`
- `plyFromPackedSupport32`
- `supportFromPackedSupport32`
- `sideFromPackedSupport32`
- `plyFromPackedRankLow32`
- `supportFromPackedRankLow32`
- `sideFromPackedRankLow32`
- `applyMove1x32PackedPly`
- `undoMove1x32PackedPly`
- `applyMove32PackedPly`
- `undoMove32PackedPly`
- `applyMove1x32PackedPlyKnownCell`
- `undoMove1x32PackedPlyKnownCell`
- `applyMove32PackedPlyKnownCell`
- `undoMove32PackedPlyKnownCell`
- `supportFromPackedMeta32`
- `playableHighFromPackedMeta32`
- `applyMove32PackedMeta`
- `undoMove32PackedMeta`
- `applyMove32PackedMetaKnownCell`
- `undoMove32PackedMetaKnownCell`
- `supportFromPackedAll32`
- `playableFromPackedAll32`
- `applyMove1x32PackedAll`
- `undoMove1x32PackedAll`
- `applyMove1x32PackedAllKnownCell`
- `undoMove1x32PackedAllKnownCell`
- `supportFromCenterOmittedMeta32`
- `playableHighFromCenterOmittedMeta32`
- `applyMove32CallerPlyCenterOmitted`
- `undoMove32CallerPlyCenterOmitted`
- `applyMove32CallerPlyCenterOmittedKnownCell`
- `undoMove32CallerPlyCenterOmittedKnownCell`
- `supportFromCenterOmittedAll32`
- `playableFromCenterOmittedAll32`
- `applyMove1x32CallerPlyCenterOmitted`
- `undoMove1x32CallerPlyCenterOmitted`
- `applyMove1x32CallerPlyCenterOmittedKnownCell`
- `undoMove1x32CallerPlyCenterOmittedKnownCell`
- `applyMove32CallerPlyCenterOmittedCenter`
- `undoMove32CallerPlyCenterOmittedCenter`
- `applyMove32CallerPlyCenterOmittedCenterKnownCell`
- `undoMove32CallerPlyCenterOmittedCenterKnownCell`
- `supportFromCallerPlyMeta32`
- `playableHighFromCallerPlyMeta32`
- `advanceMirroredSupport32`
- `applyMove32CallerPlyMetaKnownCell`
- `undoMove32CallerPlyMetaKnownCell`
- `supportFromCallerPlyMeta1x32`
- `playableFromCallerPlyMeta1x32`
- `applyMove1x32CallerPlyMetaKnownCell`
- `undoMove1x32CallerPlyMetaKnownCell`

## src/mix32.mjs (27)

- `mix2x32PowerOfTwoIndex`
- `xorTupleHash32`
- `xorTupleHash10x32`
- `updateXorTupleHash32`
- `publish3x32Locator32`
- `mix3x32Locator`
- `mix3x32PowerOfTwoIndex`
- `mix32`
- `mix32Medium`
- `mix32Strong`
- `fillReflect3Tables32`
- `fillReflectExactSmall32`
- `reflectPacked3ExactTable32`
- `reflectPacked3x16`
- `reflectPacked3x24`
- `reflectPacked3x32`
- `reflectPacked3Direct32`
- `reflectPacked3Columns2`
- `reflectPacked3Columns3`
- `reflectPacked3Columns4`
- `reflectPacked3Columns5`
- `reflectPacked3Columns6To7`
- `reflectPacked3Columns8`
- `reflectPacked3Columns9`
- `reflectPacked3Columns10`
- `canonicalPrimaryCompare32`
- `canonicalMin32`

## src/frontier32.mjs (14)

- `normalizeMinimalI32InPlace`
- `normalizeMaximalI32InPlace`
- `normalizeMinimalU32LazyInPlace`
- `normalizeMaximalU32LazyInPlace`
- `normalizeMinimal2x32LazyInPlace`
- `normalizeMaximal2x32LazyInPlace`
- `normalizeMinimalI32LazyInPlace`
- `normalizeMaximalI32LazyInPlace`
- `normalizeMinimal2xI32LazyInPlace`
- `normalizeMaximal2xI32LazyInPlace`
- `normalizeMinimal2xI32InPlace`
- `normalizeMaximal2xI32InPlace`
- `normalizeMinimal2x32InPlace`
- `normalizeMaximal2x32InPlace`

## src/search32.mjs (30)

- `reuseGroupedWord32`
- `negateScore32`
- `raiseLowerBound32`
- `lowerUpperBound32`
- `cutoff32`
- `maxValueCutsOff32`
- `minValueCutsOff32`
- `maxChildRaisesAlpha32`
- `minChildLowersBeta32`
- `argMaxPlayable32`
- `argMaxPlayableSlot32`
- `argMaxPlayableSlot2Nonempty32`
- `argMaxPlayableSlot3Nonempty32`
- `argMaxPlayableSlot4Nonempty32`
- `argMaxPlayableSlot5Nonempty32`
- `argMaxPlayableSlot6Nonempty32`
- `argMaxPlayableSlot7Nonempty32`
- `argMaxPlayableSlot8Nonempty32`
- `argMaxPlayableSlot9Nonempty32`
- `argMaxPlayableSlot10Nonempty32`
- `argMaxPlayableSlot2ScalarsNonempty32`
- `argMaxPlayableSlot3ScalarsNonempty32`
- `argMaxPlayableSlot4ScalarsNonempty32`
- `argMaxPlayableSlot5ScalarsNonempty32`
- `argMaxPlayableSlot6ScalarsNonempty32`
- `argMaxPlayableSlot7ScalarsNonempty32`
- `argMaxPlayableSlot8ScalarsNonempty32`
- `argMaxPlayableSlot9ScalarsNonempty32`
- `argMaxPlayableSlot10ScalarsNonempty32`
- `physicalColumnFromMoveSlot32`

## src/atomic32.mjs (7)

- `atomicTryClaim32`
- `atomicTryClaimLoadFirst32`
- `atomicRelease32`
- `atomicReleaseNoNotify32`
- `atomicExchange32`
- `atomicAdd32`
- `atomicSub32`

## src/queue32.mjs (10)

- `queueEnqueue32`
- `queueDequeue32`
- `queueEnqueueOwnedNext32`
- `queueDequeueOwnedNext32`
- `queueTryEnqueue32`
- `queueTryDequeue32`
- `queueTryEnqueueOwnedPosition32`
- `queueTryDequeueOwnedPosition32`
- `queueTryEnqueueOwnedNext32`
- `queueTryDequeueOwnedNext32`

## src/capacity32.mjs (4)

- `isPowerOfTwo32`
- `nextPowerOfTwo32`
- `rehashOverwrite32`
- `allocateTypedCapacity`
