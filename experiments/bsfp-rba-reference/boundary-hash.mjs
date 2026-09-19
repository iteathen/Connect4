import { createHash } from 'node:crypto';
import { normalizeResidualRequirements } from '../../components/bsfp/residual-winspace.mjs';

export function boundaryHash(fiber, values) {
  const coordinate = upset => normalizeResidualRequirements(fiber.shapes.filter((_, i) => upset & (1n << BigInt(i))))
    .map(shape => shape.toString(16)).sort().join('.');
  const records = values.map(value => {
    const [m, o] = fiber.unpack(value);
    return coordinate(m) + '/' + coordinate(o);
  }).sort();
  return { count: records.length, sha256: createHash('sha256').update(JSON.stringify(records)).digest('hex') };
}

