import assert from 'node:assert/strict';import {ownerCorrelationPairKey} from './ooo-pooled-owner-correlation-lib.mjs';
export const POOLED_OWNER_COHERENCE_MODES=Object.freeze(['OWNER_SEPARATED','PAIR_FORMAL_SWAP','TRIANGLE_FORMAL_SWAP','PAIR_VERTEX_SWAP','TRIANGLE_VERTEX_SWAP']);
export function swapVertexOwners(v){const p=v.split('|');assert.equal(p.length,4);return [p[0],p[1],'dh0='+p[3].slice(4),'dh1='+p[2].slice(4)].join('|');}
export function formalSwapPairKey(key){const i=key.indexOf('|O{'),o=JSON.parse(key.slice(i+3,-1));assert.equal(o.length,2);return key.slice(0,i)+'|O{'+JSON.stringify([o[1],o[0]])+'}';}
const pairs=v=>[[0,1],[0,2],[1,2]].map(([i,j])=>ownerCorrelationPairKey(v[i],v[j],'OWNER_SEPARATED'));
const triangle=keys=>keys.slice().sort().join('|||'),min=(a,b)=>a<=b?a:b;
export function ownerCoherenceTriangleKey(v,mode){assert.equal(v.length,3);assert.ok(POOLED_OWNER_COHERENCE_MODES.includes(mode));const p=pairs(v);if(mode==='OWNER_SEPARATED')return triangle(p);if(mode==='PAIR_FORMAL_SWAP')return triangle(p.map(k=>min(k,formalSwapPairKey(k))));if(mode==='TRIANGLE_FORMAL_SWAP')return min(triangle(p),triangle(p.map(formalSwapPairKey)));const swapped=pairs(v.map(swapVertexOwners));if(mode==='PAIR_VERTEX_SWAP')return triangle(p.map((k,i)=>min(k,swapped[i])));return min(triangle(p),triangle(swapped));}
