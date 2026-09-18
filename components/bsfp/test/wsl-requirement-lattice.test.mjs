import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPackedResidualRequirementLattice,
  packedRequirementClosureSubset,
} from '../wsl-requirement-lattice.mjs';
import {
  createResidualState,
  createResidualWinspaceProfile,
  residualRequirementsImply,
  residualStateAtLeastAsFavorableToP0,
} from '../residual-winspace.mjs';
import { createBsfpSupportLatticeProfile } from '../support-lattice.mjs';

function row(table, index, wordCount) {
  return table.subarray(index * wordCount, (index + 1) * wordCount);
}

function firstMultisetPermutations(values, limit) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const keys = [...counts.keys()].sort((a, b) => a - b);
  const result = [];
  const current = [];
  function visit() {
    if (result.length >= limit) return;
    if (current.length === values.length) {
      result.push(Object.freeze(current.slice()));
      return;
    }
    for (const key of keys) {
      const remaining = counts.get(key);
      if (remaining === 0) continue;
      counts.set(key, remaining - 1);
      current.push(key);
      visit();
      current.pop();
      counts.set(key, remaining);
      if (result.length >= limit) return;
    }
  }
  visit();
  return result;
}

function residualAfterSequence(sequence, geometry) {
  const profile = createResidualWinspaceProfile(geometry);
  const support = createBsfpSupportLatticeProfile(geometry);
  const heights = new Uint8Array(geometry.columns);
  let p0Requirements = profile.initialRequirements;
  let p1Requirements = profile.initialRequirements;
  for (let ply = 0; ply < sequence.length; ply += 1) {
    const column = sequence[ply];
    const rowIndex = heights[column];
    assert.ok(rowIndex < geometry.rows);
    const landingCell = rowIndex * geometry.columns + column;
    const transition = profile.applyPlacement({
      p0Requirements,
      p1Requirements,
      mover: ply & 1,
      landingCell,
    });
    assert.equal(transition.kind, 'nonterminal');
    p0Requirements = transition.p0Requirements;
    p1Requirements = transition.p1Requirements;
    heights[column] += 1;
  }
  return createResidualState({
    supportIndex: support.encodeHeights(Array.from(heights)),
    sideToMove: sequence.length & 1,
    p0Requirements,
    p1Requirements,
  });
}

test('standard 7x6 connect-4 residual universe is WSL-625 encoded in 20 u32 words', () => {
  const lattice = createPackedResidualRequirementLattice({ columns: 7, rows: 6, connect: 4 });
  assert.equal(lattice.winningLineCount, 69);
  assert.equal(lattice.requirementCount, 625);
  assert.equal(lattice.wordCount, 20);
  assert.equal(lattice.packedBytesPerClosure, 80);
  assert.equal(lattice.upwardClosureTableU32().length, 625 * 20);
});

test('packed WSL-625 singleton implication matches exact subset semantics for all 625x625 pairs', () => {
  const lattice = createPackedResidualRequirementLattice({ columns: 7, rows: 6, connect: 4 });
  const table = lattice.upwardClosureTableU32();
  for (let antecedentId = 0; antecedentId < lattice.requirementCount; antecedentId += 1) {
    const antecedent = lattice.requirementMasks[antecedentId];
    const left = row(table, antecedentId, lattice.wordCount);
    for (let consequentId = 0; consequentId < lattice.requirementCount; consequentId += 1) {
      const consequent = lattice.requirementMasks[consequentId];
      const right = row(table, consequentId, lattice.wordCount);
      const expected = (consequent & ~antecedent) === 0n;
      assert.equal(
        packedRequirementClosureSubset(left, right),
        expected,
        `singleton implication ${antecedentId} -> ${consequentId}`,
      );
    }
  }
});

test('packed requirement-set implication matches maintained residual implication', () => {
  const lattice = createPackedResidualRequirementLattice({ columns: 7, rows: 6, connect: 4 });
  const masks = lattice.requirementMasks;
  const samples = [];
  for (let seed = 0; seed < 48; seed += 1) {
    const width = seed % 7;
    const requirements = [];
    for (let lane = 0; lane < width; lane += 1) {
      requirements.push(masks[(seed * 53 + lane * 97 + 11) % masks.length]);
    }
    samples.push(requirements);
  }
  for (let left = 0; left < samples.length; left += 1) {
    for (let right = 0; right < samples.length; right += 1) {
      assert.equal(
        lattice.requirementsImplyPacked(samples[left], samples[right]),
        residualRequirementsImply(samples[left], samples[right]),
        `composite implication sample ${left} -> ${right}`,
      );
    }
  }
});

test('packed residual dominance matches maintained semantics across legal histories sharing one support', () => {
  const geometry = { columns: 7, rows: 6, connect: 4 };
  const lattice = createPackedResidualRequirementLattice(geometry);
  const sequences = firstMultisetPermutations([0, 0, 1, 1, 2, 2], 24);
  const states = sequences.map((sequence) => residualAfterSequence(sequence, geometry));
  assert.equal(new Set(states.map((state) => `${state.supportIndex}:${state.sideToMove}`)).size, 1);
  for (let left = 0; left < states.length; left += 1) {
    for (let right = 0; right < states.length; right += 1) {
      assert.equal(
        lattice.residualStateAtLeastAsFavorablePacked(states[left], states[right]),
        residualStateAtLeastAsFavorableToP0(states[left], states[right]),
        `legal residual dominance sample ${left} >= ${right}`,
      );
    }
  }
});
