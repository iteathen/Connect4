import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const FROZEN='aea692af800f524569ea1c2fda722087cd9bca39';
const inventoryPath='research/isograph/successor/CONNECT4_LOGIC_CORPUS_INVENTORY_1_1_CANDIDATE.json';
const inv=JSON.parse(fs.readFileSync(inventoryPath,'utf8'));
const entries=new Map(inv.entries.map(x=>[x.path,x]));

function gitShow(p){
  return execFileSync('git',['show',FROZEN+':'+p],{encoding:'utf8',maxBuffer:128*1024*1024});
}
const ls=execFileSync('git',['ls-tree','-r','--name-only',FROZEN],{encoding:'utf8',maxBuffer:128*1024*1024})
  .split(/\r?\n/).filter(Boolean);
const files=new Set(ls);
const dirs=new Set();
for(const f of files){
  const parts=f.split('/');
  for(let i=1;i<parts.length;i++) dirs.add(parts.slice(0,i).join('/'));
}

function resolveRef(source,raw){
  let s=raw.trim();
  if(!s||s.startsWith('#')||/^[a-z]+:\/\//i.test(s)||s.startsWith('mailto:')) return null;
  s=s.split('#')[0].split('?')[0];
  if(!s) return null;
  if(s.startsWith('/')) s=s.slice(1);
  else if(s.startsWith('./')||s.startsWith('../')) s=path.posix.normalize(path.posix.join(path.posix.dirname(source),s));
  else if(!s.includes('/')){
    const local=path.posix.normalize(path.posix.join(path.posix.dirname(source),s));
    if(files.has(local)||dirs.has(local)) s=local;
  }
  s=s.replace(/^\.\//,'');
  if(files.has(s)||dirs.has(s)) return s;
  return null;
}

function refsFrom(source,text){
  const out=new Set();
  let m;
  const md=/\]\(([^)]+)\)/g;
  while((m=md.exec(text))){
    const r=resolveRef(source,m[1]); if(r) out.add(r);
  }
  const ticks=/`([^`\n]+)`/g;
  while((m=ticks.exec(text))){
    const token=m[1].trim();
    if(token.length>300||/\s/.test(token)&&!/[/.]/.test(token)) continue;
    const candidates=token.split(/[ ,;]+/).filter(Boolean);
    for(const c of candidates){
      if(!/[/.]/.test(c)) continue;
      const r=resolveRef(source,c.replace(/[,:;.)]+$/,'')); if(r) out.add(r);
    }
  }
  const plain=/(?:^|[\s("'=])((?:docs|research|reference|components|benchmarks|experiments|tools)\/[A-Za-z0-9_.\/-]+)/gm;
  while((m=plain.exec(text))){
    const r=resolveRef(source,m[1].replace(/[,:;.)]+$/,'')); if(r) out.add(r);
  }
  return [...out];
}

const traversedRoles=new Set([
  'current_logic','current_policy_or_routing','source_native_unresolved_logic',
  'normalized_evidence','implementation_qualification'
]);

const missing=new Map();
const edges=[];
for(const e of inv.entries){
  if(!traversedRoles.has(e.role)) continue;
  if(!files.has(e.path)) continue;
  if(!/\.(md|json|ya?ml|txt)$/i.test(e.path)) continue;
  let text;
  try{text=gitShow(e.path);}catch{continue;}
  for(const target of refsFrom(e.path,text)){
    edges.push({from:e.path,from_role:e.role,to:target,to_kind:files.has(target)?'file':'directory',included:entries.has(target)});
    if(!entries.has(target)){
      const key=target;
      const a=missing.get(key)||{target,to_kind:files.has(target)?'file':'directory',from:[]};
      a.from.push({path:e.path,role:e.role});
      missing.set(key,a);
    }
  }
}
const result={
  schema:1,
  frozen_revision:FROZEN,
  inventory_objects:inv.entries.length,
  traversed_roles:[...traversedRoles],
  reference_edges:edges.length,
  missing_dependency_targets:missing.size,
  missing:[...missing.values()].sort((a,b)=>a.target.localeCompare(b.target))
};
fs.mkdirSync('out/isograph-1-1',{recursive:true});
fs.writeFileSync('out/isograph-1-1/DEPENDENCY_CLOSURE_AUDIT.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({inventory_objects:result.inventory_objects,reference_edges:result.reference_edges,missing_dependency_targets:result.missing_dependency_targets},null,2));
for(const x of result.missing.slice(0,200)) console.log('MISSING',x.target,'<-',x.from.map(y=>y.path).join(', '));
if(result.missing_dependency_targets) process.exitCode=2;
