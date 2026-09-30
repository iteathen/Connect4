import assert from 'node:assert/strict';import {roleDepthTriangleKey} from './ooo-pair-delta-index-lib.mjs';
export const POOLED_ROLE_DEPTH_MODES=Object.freeze(['SIGN','SIGNED_PARITY'].flatMap(e=>['C_EXACT_ROLE','C_ROLELESS'].flatMap(c=>['D_EXACT_DEPTH','D_DEPTH_PARITY','D_DEPTHLESS'].map(d=>[e,c,d].join('|')))));
export function pooledRoleDepthKey(v,mode){assert.ok(POOLED_ROLE_DEPTH_MODES.includes(mode));return roleDepthTriangleKey(v,...mode.split('|'));}
