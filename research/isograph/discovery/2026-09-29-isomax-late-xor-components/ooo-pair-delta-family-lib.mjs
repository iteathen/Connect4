import assert from 'node:assert/strict';
import {compressedPairDelta} from './ooo-exchange-circuit-lib.mjs';

export const TOKEN_FAMILIES=['W','C','D0','D1'];

export function deltaTermFamily(term){
  if(term.startsWith('W:'))return 'W';
  if(term.startsWith('C:'))return 'C';
  if(term.startsWith('D0:'))return 'D0';
  if(term.startsWith('D1:'))return 'D1';
  throw new Error('unknown signed exchange token term '+term);
}

export function filterCompressedPairDelta(aVertex,bVertex,compressionMode,families){
  const keep=new Set(families);
  for(const f of keep)assert.ok(TOKEN_FAMILIES.includes(f),'unknown token family '+f);
  const raw=compressedPairDelta(aVertex,bVertex,compressionMode);
  if(raw==='0')return '0';
  const terms=raw.split(',').filter(Boolean);
  const kept=terms.filter(term=>keep.has(deltaTermFamily(term)));
  return kept.length?kept.join(','):'0';
}

export function familyTriangleKey(vertices,compressionMode,families){
  assert.equal(vertices.length,3,'family triangle requires exactly three vertices');
  return [
    filterCompressedPairDelta(vertices[0],vertices[1],compressionMode,families),
    filterCompressedPairDelta(vertices[0],vertices[2],compressionMode,families),
    filterCompressedPairDelta(vertices[1],vertices[2],compressionMode,families)
  ].sort().join('|||');
}

export function canonicalFamilySubset(families){
  const keep=new Set(families);
  for(const f of keep)assert.ok(TOKEN_FAMILIES.includes(f),'unknown token family '+f);
  return TOKEN_FAMILIES.filter(f=>keep.has(f));
}
