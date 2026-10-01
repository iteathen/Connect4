// Independent packed arithmetic; greatest pivots avoid the low-column fill chain.
// Pivot order changes neither the matrix nor its rank. No scalar inputs here.
export function packedRankScalable(rows, {check = () => {}} = {}) {
  const pivots = new Map();
  let count = 0;
  for (const source of rows) {
    let row = 0n;
    for (const col of source) row ^= 1n << BigInt(col);
    while (row) {
      const hex = row.toString(16);
      const pivot = 4 * (hex.length - 1) + Math.floor(Math.log2(parseInt(hex[0], 16)));
      const prior = pivots.get(pivot);
      if (prior === undefined) { pivots.set(pivot, row); break; }
      row ^= prior;
    }
    if (++count % 256 === 0) check();
  }
  return pivots.size;
}
