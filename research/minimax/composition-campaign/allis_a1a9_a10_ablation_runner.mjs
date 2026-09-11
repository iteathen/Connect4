import assert from 'node:assert/strict';
import fs from 'node:fs';

const disabled=(process.argv[2]??'').split(',').filter(Boolean);
assert(disabled.length,'pass comma-separated disabled rule families');
const sourcePath=new URL('./allis_a1a9_a10_exact.mjs',import.meta.url);let source=fs.readFileSync(sourcePath,'utf8');
const before="const A123=new Set(['A1','A2','A3']),A1A9=new Set(TYPES),plies=[28,30,32,34,36]";
const setLiteral=JSON.stringify(disabled);
const after=`const A123=new Set(['A1','A2','A3']),DISABLED=new Set(${setLiteral}),A1A9=new Set(TYPES.filter(t=>!DISABLED.has(t))),plies=[28,30,32,34,36]`;
assert(source.includes(before),'A1A9 allowed-set seam not found');source=source.replace(before,after);
source=source.replace("kind:'connect4-allis-a1-a9-compatible-a10-exact'","kind:'connect4-allis-a1-a9-compatible-a10-ablation',disabled:[...DISABLED]");
source=source.replace("if(falseClaims)process.exitCode=2;","");
const tmp=new URL(`./.generated_allis_a1a9_ablate_${disabled.join('_')}.mjs`,import.meta.url);fs.writeFileSync(tmp,source);try{await import(tmp.href+`?v=${Date.now()}`);}finally{fs.rmSync(tmp,{force:true});}
