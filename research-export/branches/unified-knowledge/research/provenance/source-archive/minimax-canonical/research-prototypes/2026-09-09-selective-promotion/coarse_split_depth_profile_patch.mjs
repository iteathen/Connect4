import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const depth=Math.max(1,Number(process.argv[2]??4)|0);
const here=dirname(fileURLToPath(import.meta.url));
const base=resolve(here,'coarse_partition_locality_control_bench.mjs');
const generated=resolve(here,`coarse_split_depth_${depth}.generated.mjs`);
let src=readFileSync(base,'utf8');
const from='const SPLIT_DEPTH=4,LANE_CAP=2,SLAB_POW=15,SLAB_ENTRIES=1<<SLAB_POW;';
const to=`const SPLIT_DEPTH=${depth},LANE_CAP=2,SLAB_POW=15,SLAB_ENTRIES=1<<SLAB_POW;`;
if(src.split(from).length!==2)throw Error('expected one split-depth patch target');
src=src.replace(from,to);
writeFileSync(generated,src);
try{
  const r=spawnSync(process.execPath,[generated,...process.argv.slice(3)],{stdio:'inherit'});
  process.exitCode=r.status??1;
}finally{
  try{unlinkSync(generated);}catch{}
}
