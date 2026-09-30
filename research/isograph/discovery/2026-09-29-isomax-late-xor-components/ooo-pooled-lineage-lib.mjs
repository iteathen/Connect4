import assert from 'node:assert/strict';import {exchangeCircuitKey} from './ooo-exchange-circuit-lib.mjs';import {familyTriangleKey} from './ooo-pair-delta-family-lib.mjs';import {roleDepthTriangleKey} from './ooo-pair-delta-index-lib.mjs';import {ownerQuotientTriangleKey} from './ooo-pair-delta-owner-lib.mjs';import {sixBucketTriangleKey} from './ooo-six-bucket-count-lib.mjs';import {familySaturationTriangleKey} from './ooo-six-bucket-family-saturation-lib.mjs';import {signChannelTriangleKey} from './ooo-sign-channel-coupling-lib.mjs';import {JOINT_DA_CANDIDATES} from './ooo-joint-da-scalar-lib.mjs';
export const POOLED_LINEAGE_MODES=Object.freeze(['FULL_SELECTED_VERTEX','EXACT_DELTA','SIGN_ALL_TOKENS','SIGNED_PARITY_ALL_TOKENS','SIGNED_PARITY_CD_EXACT','ROLELESS_DEPTHLESS_OWNER_SEPARATED','OWNER_SYMMETRIC_EXACT','UNIFORM_CLIP3','FAMILY_SEPARATED','PMEC-01','PMEC-02','PMEC-03','PMEC-04']);
export function lineageTriangleKey(v,mode){
 assert.ok(POOLED_LINEAGE_MODES.includes(mode));
 if(mode==='FULL_SELECTED_VERTEX')return exchangeCircuitKey(v,'FULL_TRIPLE_MOTIF');
 if(mode==='EXACT_DELTA')return exchangeCircuitKey(v,'EXCHANGE_EXACT_DELTA_TRIANGLE');
 if(mode==='SIGN_ALL_TOKENS'||mode==='SIGNED_PARITY_ALL_TOKENS')return familyTriangleKey(v,mode==='SIGN_ALL_TOKENS'?'SIGN':'SIGNED_PARITY',['W','C','D0','D1']);
 if(mode==='SIGNED_PARITY_CD_EXACT')return roleDepthTriangleKey(v,'SIGNED_PARITY','C_EXACT_ROLE','D_EXACT_DEPTH');
 if(mode==='ROLELESS_DEPTHLESS_OWNER_SEPARATED')return roleDepthTriangleKey(v,'SIGNED_PARITY','C_ROLELESS','D_DEPTHLESS');
 if(mode==='OWNER_SYMMETRIC_EXACT')return ownerQuotientTriangleKey(v,'D_SYMMETRIC_MARGINALS');
 if(mode==='UNIFORM_CLIP3')return sixBucketTriangleKey(v,'BUCKET_CLIP3');
 if(mode==='FAMILY_SEPARATED')return familySaturationTriangleKey(v,{C:'PRESENCE',D:'CLIP3',A:'CLIP2'});
 return signChannelTriangleKey(v,JOINT_DA_CANDIDATES.find(c=>c.id===mode));
}
