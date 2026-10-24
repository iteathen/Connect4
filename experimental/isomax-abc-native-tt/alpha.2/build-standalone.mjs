// Node-only copy/generation of separate stand-alone distribution boundaries.
// Maintained solver sources remain JS-only; no code conversion or native build.
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
for(const spec of [
 {id:'A',slug:'a-physical',exportName:'IsoMaxA',name:'@iteathen/isomax-next-a',desc:'compact physical column code and bitboard threat checks'},
 {id:'B',slug:'b-source',exportName:'IsoMaxB',name:'@iteathen/isomax-next-b',desc:'fixed original K4 live-line cofactor algebra'},
 {id:'C',slug:'c-guarded',exportName:'IsoMaxC',name:'@iteathen/isomax-next-c',desc:'source bitplanes with guarded two-threat fork proof and proof-aware TT'},
]) {
 const path=join(root,'standalone',`IsoMax-${spec.id}-0.3.0-alpha.2`);
 rmSync(path,{recursive:true,force:true});mkdirSync(join(path,'src'),{recursive:true});
 mkdirSync(join(path,'test'),{recursive:true});
 copyFileSync(join(root,'shared','geometry.mjs'),join(path,'src','geometry.mjs'));
 copyFileSync(join(root,'variants',spec.slug,'tt.mjs'),join(path,'src','tt.mjs'));
 if(spec.id==='A')copyFileSync(join(root,'variants',spec.slug,'state.mjs'),join(path,'src','state.mjs'));
 else copyFileSync(join(root,'shared','source-state.mjs'),join(path,'src','source-state.mjs'));
 let solver=readFileSync(join(root,'variants',spec.slug,'solver.mjs'),'utf8');
 solver=solver.replaceAll("../../shared/geometry.mjs","./geometry.mjs").replaceAll("../../shared/source-state.mjs","./source-state.mjs");
 writeFileSync(join(path,'src','solver.mjs'),solver);
 writeFileSync(join(path,'index.mjs'),`export {${spec.exportName} as IsoMaxNext} from './src/solver.mjs';\nexport {prepareGeometry} from './src/geometry.mjs';\n`);
 let cli=readFileSync(join(root,'run.mjs'),'utf8');
 cli=cli.replace("import {IsoMaxA,IsoMaxB,IsoMaxC} from './index.mjs';",`import {${spec.exportName}} from './src/solver.mjs';`)
  .replace("(params.get('variant')||'B')","(params.get('variant')||'"+spec.id+"')")
  .replace("const Clazz=({A:IsoMaxA,B:IsoMaxB,C:IsoMaxC})[variant];\nif(!Clazz)throw Error('variant must be A/B/C');",`if(variant!=='${spec.id}')throw Error('this standalone package implements variant ${spec.id}');\nconst Clazz=${spec.exportName};`);
 writeFileSync(join(path,'run.mjs'),cli);
 writeFileSync(join(path,'package.json'),JSON.stringify({name:spec.name,version:'0.3.0-alpha.2',private:true,type:'module',license:'AGPL-3.0-only',
  description:`Independent JavaScript-only IsoMax ${spec.id} ${spec.desc} prototype`,
  engines:{node:'>=26.7.0'},exports:{'.':'./index.mjs'},
  scripts:{start:'node run.mjs',test:'node --test test/*.test.mjs'}},null,2)+'\n');
 writeFileSync(join(path,'test','smoke.test.mjs'),`import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport {IsoMaxNext} from '../index.mjs';\ntest('fresh exact 4x4 draw and legal witness',()=>{\n const result=new IsoMaxNext({columns:4,rows:4,ttMiB:1}).solve([]);\n assert.equal(result.status,'EXACT');\n assert.equal(result.rootWdl,0);\n assert.ok(result.move>=0&&result.move<4);\n});\ntest('native TT scales to 10x10 without any 7x6 constant',()=>{\n const solver=new IsoMaxNext({columns:10,rows:10,ttMiB:1,nodeLimit:1});\n assert.equal(solver.geometry.columns,10);\n assert.equal(solver.geometry.lineCount,238);\n assert.throws(()=>solver.solve([9,0,9]),/node limit exceeded/);\n});\n`);
 copyFileSync(join(root,'LICENSE'),join(path,'LICENSE'));
 writeFileSync(join(path,'README.md'),`# IsoMax ${spec.id} 0.3.0-alpha.2\n\n**Independent prototype:** ${spec.desc}. JavaScript-only Node/V8; no C++, Python, native addons or opening books.\n\nThis package owns its own native TT source under \`src/tt.mjs\`; it is not a build of another candidate with a different evaluator plugged into a shared TT.\n\nQuick commands:\n\n\`\`\`sh\nnode run.mjs --columns 5 --rows 5 --tt-mib 32\nnode run.mjs --columns 7 --rows 6 --history 4214254422333 --tt-mib 32\nnode --test test/*.test.mjs\n\`\`\`\n\nFor a 10th physical column, use comma-separated 1-based moves: \`--history 4,2,10\`. The API accepts zero-based array histories.\n\nThis 0.3.0-alpha.2 version is a **single-worker local experiment**. It does not replace the shipped 0.2.0-rc.6.\n\nThe common benchmark harness, independent physical oracle, matched memory accounting and machine evidence live in the parent \`IsoMax-0.3.0-alpha.2-ABC\` suite.\n`);
 console.log(`${spec.id} -> ${path}`);
}
