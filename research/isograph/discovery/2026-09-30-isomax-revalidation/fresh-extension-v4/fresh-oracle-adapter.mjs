// Exact source adaptation, not an additional independent solver implementation.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const ORACLE_COMMIT='649596b43e59b7bedab858335f4098309288ca0e';
export const ORACLE_PATH='research/isograph/discovery/2026-09-30-isomax-revalidation/independent-oracle.mjs';
export const ORACLE_SHA256='ba2938ffe66cf74a91329f05ed1f5295c7b0b551afcdd6d0bd0cd85fc5d16096';
export const FRESH_CASES=['6x4-k3','5x4-k5'];
const root=fileURLToPath(new URL('../../../../../',import.meta.url));
let source=execFileSync('git',['show',ORACLE_COMMIT+':'+ORACLE_PATH],{cwd:root,encoding:'utf8'});
assert.equal(createHash('sha256').update(source).digest('hex'),ORACLE_SHA256);
function replace(before,after){assert.equal(source.split(before).length,2,'exact adaptation anchor changed');source=source.replace(before,after);}
replace("export const TRAINED=['6x3-k3','4x5-k4','6x3-k4'];","export const TRAINED=['6x4-k3','5x4-k5'];\nlet guard=()=>{};export function setFreshGuard(fn){guard=fn;}");
replace("assert.ok(TRAINED.includes(`${W}x${H}-k${K}`)||(toy&&W>0&&H>0&&W*H<=9&&K>=2&&K<=Math.max(W,H)),'carrier outside trained allowlist / tiny toy domain');","assert.ok(TRAINED.includes(`${W}x${H}-k${K}`),'carrier outside fresh-only allowlist');");
replace('for(const order of orders(n)){','for(const order of orders(n)){guard();');
replace('for(const code of frontier){assert.ok(!index.has(code));','for(const code of frontier){guard({states:codes.length+1});assert.ok(!index.has(code));');
replace('for(const child of children(code,cells,support(cells),rank))next.add(child);','for(const child of children(code,cells,support(cells),rank)){next.add(child);guard({states:codes.length+next.size});}');
replace('function negamax(code){const i=index.get(code);','function negamax(code){guard();const i=index.get(code);');
replace('function solve({progress=()=>{},restored=null}={}){','function solve({progress=()=>{},restored=null,saveValues=()=>{}}={}){');
replace("if(i%100000===0)progress({phase:'wdl',visited:i,total:codes.length});","if(i%100000===0){saveValues(values);progress({phase:'wdl',visited:i,total:codes.length});}");
replace('function row(code){','function row(code){guard();');
source+='\n//# sourceURL=connect4-fresh-phase2-oracle.mjs\n';
export const ADAPTED_SHA256=createHash('sha256').update(source).digest('hex');
const adapted=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
export function createFreshOracle(W,H,K,guard=()=>{}){assert.ok(FRESH_CASES.includes(`${W}x${H}-k${K}`));adapted.setFreshGuard(guard);return adapted.createOracle(W,H,K);}
