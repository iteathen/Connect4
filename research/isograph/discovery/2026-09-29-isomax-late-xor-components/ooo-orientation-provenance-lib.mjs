import assert from 'node:assert/strict';

function bits(mask){
  const out=[];
  for(let v=mask>>>0;v;v=(v&(v-1))>>>0)out.push(31-Math.clz32(v&-v));
  return out;
}

export function generateWinningLines(W,H,K){
  const dirs=[
    {orientation:'H',dc:1,dr:0},
    {orientation:'V',dc:0,dr:1},
    {orientation:'D+',dc:1,dr:1},
    {orientation:'D-',dc:1,dr:-1}
  ];
  const out=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const d of dirs){
    const ec=c+(K-1)*d.dc,er=r+(K-1)*d.dr;
    if(ec<0||ec>=W||er<0||er>=H)continue;
    let mask=0;
    const cells=[];
    for(let i=0;i<K;i++){
      const rr=r+i*d.dr,cc=c+i*d.dc;
      cells.push({row:rr,col:cc});
      mask|=1<<(rr*W+cc);
    }
    const cellKey=cells.map(x=>x.row+':'+x.col).join(',');
    out.push({
      id:d.orientation+'|'+cellKey,
      orientation:d.orientation,
      dc:d.dc,
      dr:d.dr,
      mask:mask>>>0,
      cells
    });
  }
  out.sort((a,b)=>a.id.localeCompare(b.id));
  return out;
}

export function reflectOrientation(orientation){
  if(orientation==='D+')return 'D-';
  if(orientation==='D-')return 'D+';
  if(orientation==='H'||orientation==='V')return orientation;
  throw new Error('unknown raw orientation '+orientation);
}

export function reflectMask(mask,W,H){
  let out=0;
  for(const bit of bits(mask)){
    const row=Math.floor(bit/W),col=bit%W;
    assert.ok(row>=0&&row<H,'mask row outside board');
    out|=1<<(row*W+(W-1-col));
  }
  return out>>>0;
}

function uniqueSources(sources){
  const m=new Map();
  for(const src of sources){
    const prior=m.get(src.id);
    if(prior){
      assert.equal(prior.orientation,src.orientation,'source id orientation mismatch');
      continue;
    }
    m.set(src.id,{...src});
  }
  return [...m.values()].sort((a,b)=>a.id.localeCompare(b.id));
}

export function normalizeProvenanceRecords(records){
  const merged=new Map();
  for(const rec of records){
    const mask=rec.mask>>>0;
    let z=merged.get(mask);
    if(!z){z={mask,sources:[]};merged.set(mask,z);}
    z.sources.push(...rec.sources);
  }
  const xs=[...merged.values()]
    .map(x=>({mask:x.mask,sources:uniqueSources(x.sources)}))
    .sort((a,b)=>a.mask-b.mask);
  return xs.filter((a,i)=>!xs.some((b,j)=>
    i!==j&&a.mask!==b.mask&&(((a.mask&b.mask)>>>0)===(b.mask>>>0))
  ));
}

export function residualProvenance(lines,self,opp){
  const raw=[];
  for(const line of lines){
    if(line.mask&opp)continue;
    const mask=(line.mask&~self)>>>0;
    if(!mask)continue;
    raw.push({
      mask,
      sources:[{
        id:line.id,
        orientation:line.orientation,
        lineMask:line.mask
      }]
    });
  }
  return normalizeProvenanceRecords(raw);
}

export function foldOrientation(orientation){
  if(orientation==='D+'||orientation==='D-')return 'D';
  if(orientation==='H'||orientation==='V')return orientation;
  throw new Error('unknown raw orientation '+orientation);
}

function sortedCounts(entries){
  const m=new Map();
  for(const key of entries)m.set(key,(m.get(key)??0)+1);
  return [...m].sort((a,b)=>a[0].localeCompare(b[0]));
}

function countsKey(counts){
  return counts.map(([k,n])=>k+'='+n).join(',');
}

function allSourceInstances(occurrence){
  const out=[];
  for(const rec of occurrence.records){
    for(const src of rec.sources)out.push({rec,src,orientation:foldOrientation(src.orientation)});
  }
  return out;
}

function orientationPresence(occurrence){
  const s=new Set(allSourceInstances(occurrence).map(x=>x.orientation));
  return ['H','V','D'].filter(x=>s.has(x)).join('');
}

function orientationCounts(occurrence,ownerSeparated=false){
  const src=allSourceInstances(occurrence);
  if(ownerSeparated){
    const parts=[];
    for(const owner of [0,1]){
      const counts={H:0,V:0,D:0};
      for(const x of src)if(x.rec.owner===owner)counts[x.orientation]++;
      parts.push('o'+owner+'[H='+counts.H+',V='+counts.V+',D='+counts.D+']');
    }
    return parts.join('|');
  }
  const counts={H:0,V:0,D:0};
  for(const x of src)counts[x.orientation]++;
  return 'H='+counts.H+',V='+counts.V+',D='+counts.D;
}

function cellExpanded(occurrence){
  const out=[];
  for(const rec of occurrence.records){
    for(const src of rec.sources){
      const orientation=foldOrientation(src.orientation);
      for(const cell of rec.cells){
        out.push({
          owner:rec.owner,
          orientation,
          depth:cell.depth,
          role:cell.role,
          phase:occurrence.capsByRole[cell.role]??0
        });
      }
    }
  }
  return out;
}

function pairIncidence(occurrence){
  const byRole=new Map();
  for(const rec of occurrence.records){
    const os=new Set(rec.sources.map(x=>foldOrientation(x.orientation)));
    for(const cell of rec.cells){
      let s=byRole.get(cell.role);
      if(!s){s=new Set();byRole.set(cell.role,s);}
      for(const o of os)s.add(o);
    }
  }
  const counts={HV:0,HD:0,VD:0};
  for(const s of byRole.values()){
    if(s.has('H')&&s.has('V'))counts.HV++;
    if(s.has('H')&&s.has('D'))counts.HD++;
    if(s.has('V')&&s.has('D'))counts.VD++;
  }
  return 'HV='+counts.HV+',HD='+counts.HD+',VD='+counts.VD;
}

function exactOrientationKey(occurrence){
  const records=occurrence.records.map(rec=>{
    const cells=[...rec.cells]
      .sort((a,b)=>a.role-b.role||a.depth-b.depth)
      .map(x=>x.depth+':'+x.role)
      .join(',');
    const src=rec.sources
      .map(x=>x.orientation)
      .sort()
      .join(',');
    return 'o'+rec.owner+'|cells='+cells+'|src='+src;
  }).sort();
  return 'w'+occurrence.width+
    '|cap='+occurrence.capsByRole.join('.')+
    '|'+records.join('||');
}

export function summarizeOrientationOccurrence(occurrence,mode){
  assert.ok(Number.isInteger(occurrence.width)&&occurrence.width>=1,'invalid occurrence width');
  assert.equal(occurrence.capsByRole.length,occurrence.width,'role phase width mismatch');

  if(mode==='ORI_PRESENCE')return orientationPresence(occurrence);
  if(mode==='ORI_COUNTS')return orientationCounts(occurrence,false);
  if(mode==='OWNER_ORI_COUNTS')return orientationCounts(occurrence,true);

  const cells=cellExpanded(occurrence);
  if(mode==='ORI_ROLE_PHASE_COUNTS'){
    return countsKey(sortedCounts(cells.map(x=>x.orientation+'|p'+x.phase)));
  }
  if(mode==='ORI_DEPTH_HISTOGRAM'){
    return countsKey(sortedCounts(cells.map(x=>x.orientation+'|d'+x.depth)));
  }
  if(mode==='OWNER_ORI_DEPTH_HISTOGRAM'){
    return countsKey(sortedCounts(cells.map(x=>'o'+x.owner+'|'+x.orientation+'|d'+x.depth)));
  }
  if(mode==='PAIR_ORI_INCIDENCE')return pairIncidence(occurrence);
  if(mode==='OWNER_ORI_PHASE_DEPTH'){
    return countsKey(sortedCounts(cells.map(x=>'o'+x.owner+'|'+x.orientation+'|p'+x.phase+'|d'+x.depth)));
  }
  if(mode==='EXACT_ORIENTATION_PROVENANCE')return exactOrientationKey(occurrence);
  if(mode==='FULL_DESCRIPTOR_PLUS_EXACT_ORIENTATION'){
    assert.ok(typeof occurrence.baseDescriptor==='string','base descriptor required for reconstruction control');
    return occurrence.baseDescriptor+'@@'+exactOrientationKey(occurrence);
  }
  throw new Error('unknown orientation occurrence summary mode '+mode);
}
