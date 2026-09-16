#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { openSolvedBDD } from './quotient-solved-bdd-source.mjs';
import { geometry, empty, play, replay, describe, residuals, cofactor, capacityAllowed } from './quotient-structural-discovery-signature.mjs';

const physicalKey = s => s.owners.map(v=>v+1).join(''); // exact content, not a hash
const digest = x => createHash('sha256').update(x).digest('hex'); // provenance only
function difference(a,b) {
  return a.map((terms,p)=>terms.filter(t=>!b[p].some(u=>JSON.stringify(t)===JSON.stringify(u))));
}
function distance(a,b) { return a.reduce((n,x,i)=>n+(x!==b[i]),0); }
function summarize(g, row) {
  const d=describe(g,row.s);
  return { movesZeroBased:row.path, ...row.label, support:row.s.heights, boundaryPotential:d.boundaryPotential,
    residuals:d.R, singletons:d.singletons, precursors:d.precursors };
}

export async function audit({ directory, maxPly=8, perRank=8192, seconds=300 }) {
  if(!Number.isInteger(perRank)||perRank<1||!Number.isInteger(maxPly)||maxPly<1||maxPly>8||!Number.isFinite(seconds)||seconds<=0) throw Error('invalid audit bounds');
  const start=performance.now(), deadline=start+seconds*1000;
  const checkTime=()=>{if(performance.now()>deadline)throw Error('audit deadline exceeded; no complete evidence published');};
  const g=geometry(7,6), db=await openSolvedBDD(directory,maxPly+1);
  const openingBytes=await readFile(join(directory,'openingbook_w7_h6_d8.csv'));
  const book=new Map(openingBytes.toString().trim().split(/\r?\n/).map(line=>{
    const [key,text]=line.split(',').map(s=>s.trim()), score=Number(text);
    if(!/^\d+$/.test(key)||!Number.isInteger(score)||score===0||Math.abs(score)>100)throw Error('invalid book row');
    return [key,score];
  }));
  const names=['exact','boundaryCapacity','degree2','degree3','span','degree2Span','degree2Jet','ownerJet'];
  const results=Object.fromEntries(names.map(n=>[n,{classes:0,mixedValueClasses:0,mixedWinBitClasses:0,mixedPlayerClasses:0,representatives:{}}]));
  const rankStats=[], claims={ immediate:0,double:0,forced:0,reflection:0,roleExchange:0,order:0,bookPresent:0,bookAbsent:0 };
  let layer=[{s:empty(g),path:[]}], allRows=0;
  for(let rank=0;rank<=maxPly;rank++) {
    checkTime();
    const groups=Object.fromEntries(names.map(n=>[n,new Map()]));
    const values=[0,0,0];
    const selected=layer.length<=perRank ? layer : Array.from({length:perRank},(_,i)=>layer[Math.floor(i*layer.length/perRank)]);
    for(let index=0;index<selected.length;index++) {
      if(index%128===0)checkTime();
      const row=selected[index], s=row.s, d=describe(g,s);
      row.description=d;
      row.label=db.query(g,s); values[row.label.relative+1]++; allRows++;
      const rule=capacityAllowed(g,s,d);
      if(rule.kind==='immediate'){assert.equal(row.label.relative,1);claims.immediate++;}
      if(rule.kind==='double'){assert.equal(row.label.relative,-1);claims.double++;}
      if(rule.kind==='forced'){
        const child=play(g,s,Math.floor(rule.cells[0]/g.height));
        const value=child.terminal===2?0:child.terminal!==null?1:(0-db.query(g,child).relative);
        assert.equal(row.label.relative,value); claims.forced++;
      }
      if(rank===8){
        if(book.has(row.label.key)){assert.equal(Math.sign(book.get(row.label.key)),row.label.relative);claims.bookPresent++;}
        else { claims.bookAbsent++; /* No inference from absence. BDD still supplies label. */ }
      }
      if(index%64===0){
        const mirrored=replay(g,row.path.map(c=>g.width-1-c));
        assert.equal(db.query(g,mirrored).relative,row.label.relative);claims.reflection++;
        const swapped={...s,owners:s.owners.map(x=>x<0?x:1-x)};
        assert.deepEqual(residuals(g,swapped),[d.R[1],d.R[0]]);claims.roleExchange++;
        const reversed={...g,lines:[...g.lines].reverse().map(l=>[...l].reverse())};
        assert.deepEqual(describe(reversed,s).signatures,d.signatures);claims.order++;
        assert.deepEqual(describe(g,{...s,solvedValue:42}).signatures,d.signatures);
        for(let c=0;c<g.width;c++)if(s.heights[c]<g.height){
          const child=play(g,s,c);
          assert.deepEqual(cofactor(d.R,s.ply%2,c*g.height+s.heights[c]),residuals(g,child));
        }
      }
      for(const name of names){
        const signature=d.signatures[name];
        let group=groups[name].get(signature);
        if(!group){group={rows:[],codes:new Set()};groups[name].set(signature,group);}
        group.codes.add(row.label.code);
        // Keep enough representatives per value for compact one-swap diagnostics.
        if(group.rows.filter(x=>x.label.code===row.label.code).length<12)group.rows.push(row);
      }
    }
    for(const name of names){
      const r=results[name];r.classes+=groups[name].size;
      for(const [signature,group] of groups[name]){
        checkTime();
        if(group.codes.size<2)continue;
        r.mixedValueClasses++;
        r.firstMixedRank ??= rank;
        const winMix=group.codes.has('00');
        const signMix=group.codes.has('01')&&group.codes.has('11');
        if(winMix)r.mixedWinBitClasses++;
        if(signMix)r.mixedPlayerClasses++;
        for(const category of ['value',...(winMix?['winBit']:[]),...(signMix?['playerBit']:[])]){
          for(const a of group.rows)for(const b of group.rows){
            if(a.label.code===b.label.code)continue;
            if(category==='winBit'&&((a.label.code==='00')===(b.label.code==='00')))continue;
            if(category==='playerBit'&&(a.label.code==='00'||b.label.code==='00'))continue;
            const changes=distance(a.s.owners,b.s.owners);
            const old=r.representatives[category];
            if(old && (changes>old.cost[0] || changes===old.cost[0]&&rank>old.cost[1]))continue;
            const da=a.description,dbb=b.description;
            const delta=[difference(da.R,dbb.R),difference(dbb.R,da.R)];
            const cost=[changes,rank,delta.flat(2).length];
            if(old && !(cost[0]<old.cost[0] || cost[0]===old.cost[0]&&(cost[1]<old.cost[1] || cost[1]===old.cost[1]&&cost[2]<old.cost[2])))continue;
            r.representatives[category]={cost,signature:JSON.parse(signature),a:summarize(g,a),b:summarize(g,b),residualDifference:delta};
          }
        }
      }
    }
    rankStats.push({rank,candidateStates:layer.length,queriedStates:selected.length,sideToMoveValues:{loss:values[0],draw:values[1],win:values[2]}});
    process.stdout.write(JSON.stringify(rankStats.at(-1))+'\n');
    if(rank===maxPly)break;
    const next=new Map();
    for(const row of selected)for(let c=0;c<g.width;c++)if(row.s.heights[c]<g.height){
      const s=play(g,row.s,c);if(s.terminal!==null)continue;
      const key=physicalKey(s);if(!next.has(key))next.set(key,{s,path:[...row.path,c]});
    }
    layer=[...next.entries()].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0).map(([,row])=>row);
  }
  assert.equal(results.exact.mixedValueClasses,0,'exact semantic identity falsified');
  const representatives=[];
  for(const [name,r] of Object.entries(results))for(const [category,pair]of Object.entries(r.representatives)) {
    const checks=[];
    for(const side of ['a','b']){
      const x=pair[side],s=replay(g,x.movesZeroBased);
      assert.deepEqual(db.query(g,s),{key:x.key,relative:x.relative,winner:x.winner,code:x.code});
      const actions=[];
      for(let c=0;c<g.width;c++)if(s.heights[c]<g.height){
        const child=play(g,s,c);
        actions.push({column:c,value:child.terminal===2?0:child.terminal!==null?1:(0-db.query(g,child).relative)});
      }
      // Qualification of source polarity by one-step relation, not a solver.
      assert.equal(Math.max(...actions.map(x=>x.value)),x.relative);
      checks.push({side,actions});
    }
    representatives.push({projection:name,category,...pair,checks});
    delete r.representatives[category];
  }
  const diagnosticPair=representatives.find(r=>r.projection==='degree2Jet');
  const temporalDiagnostic=[];
  if(diagnosticPair){
    let frontier=[{a:replay(g,diagnosticPair.a.movesZeroBased),b:replay(g,diagnosticPair.b.movesZeroBased),path:[]}];
    for(let depth=1;depth<=2;depth++){
      const next=[],differences=[];
      for(const row of frontier)for(let c=0;c<g.width;c++)if(row.a.heights[c]<g.height){
        const a=play(g,row.a,c),b=play(g,row.b,c);
        if(a.terminal!==null||b.terminal!==null)continue;
        const da=describe(g,a),dbb=describe(g,b),path=[...row.path,c];
        if(da.signatures.degree2!==dbb.signatures.degree2)differences.push({path,residualsA:da.R.map(r=>r.filter(t=>t.length<=2)),residualsB:dbb.R.map(r=>r.filter(t=>t.length<=2))});
        next.push({a,b,path});
      }
      temporalDiagnostic.push({depth,compared:next.length,distinctions:differences.length,first:differences[0]??null});
      if(differences.length)break;frontier=next;
    }
  }
  checkTime();
  return {schema:1,claim:'Finite counterexamples to lossy structural projections; no unbounded completeness theorem.',
    limits:{maxPly,perRank,seconds,selection:'exact-content sorted, evenly spaced rank sample; only sampled parents expanded'},
    provenance:{doi:'10.5281/zenodo.14582823',archiveMD5:'59750231c1131ee352a8bda03f231aea',files:db.provenance,
      openingBook:{bytes:openingBytes.length,sha256:digest(openingBytes),absence:'unknown; never label authority'}},
    allRows,rankStats,results,claims,representatives,temporalDiagnostic,elapsedSeconds:(performance.now()-start)/1000};
}

if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const [directory,out,cap='8192']=process.argv.slice(2);
  if(!directory||!out)throw Error('usage: node audit.mjs <solution-directory> <output.json> [per-rank]');
  const result=await audit({directory,perRank:Number(cap)});
  const text=JSON.stringify(result)+'\n'; // Compact machine evidence; interpretation lives in the note.
  if(Buffer.byteLength(text)>1024*1024)throw Error('evidence size limit exceeded');
  await writeFile(out,text);
  process.stdout.write(JSON.stringify({allRows:result.allRows,results:result.results,claims:result.claims,seconds:result.elapsedSeconds})+'\n');
}
