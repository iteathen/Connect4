import assert from 'node:assert/strict';import {ownerCorrelationPairKey} from './ooo-pooled-owner-correlation-lib.mjs';import {stratumSymbol} from './ooo-pooled-stratum-summary-lib.mjs';
export const POOLED_NATIVE_DOMAIN_MODES=Object.freeze(['OBSERVED','FRONTIER_CLOSED','BULK_CLOSED','BOTH_CLOSED']);
const sorted=t=>t.map(p=>JSON.stringify(p)).sort().map(p=>JSON.parse(p));
export function triangleRecord(v){assert.equal(v.length,3);return sorted([[0,1],[0,2],[1,2]].map(([i,j])=>{const raw=ownerCorrelationPairKey(v[i],v[j],'OWNER_SEPARATED'),at=raw.indexOf('|O{');return {c:raw.slice(0,at),o:JSON.parse(raw.slice(at+3,-1))};}));}
export function swapStrata(t,mask){assert.ok(Number.isInteger(mask)&&mask>=0&&mask<4);return sorted(t.map(p=>({c:p.c,o:p.o.map((v,i)=>v.map((n,j)=>mask&(j<2?1:2)?p.o[1-i][j]:n))})));}
export function summaryRecordKey(t,mode){const [z,p]=mode.split('|');return t.map(r=>r.c+'|Z{'+stratumSymbol(r.o.map(v=>v.slice(0,2)),z)+'}|P{'+stratumSymbol(r.o.map(v=>v.slice(2)),p)+'}').sort().join('|||');}
