// Cold, rule-only policy-family census. Never imported by a production solver.
// The checker is polynomial in the explicit geometry/residual input. Exhaustive
// policy discovery here is not claimed polynomial in the number of columns.
import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {geometry,replay} from './probe.mjs';

export function checkPolicy(g,s,p){
  if(p.partner.length!==g.columns||p.length.length!==g.columns)return false;
  for(let c=0;c<g.columns;c++){
    const remaining=g.rows-s.heights[c],mate=p.partner[c],length=p.length[c];
    if(!Number.isInteger(mate)||!Number.isInteger(length)||length<0||length>remaining)return false;
    if(mate===-1){if(length!==0||(remaining&1))return false;}
    else if(mate<0||mate>=g.columns||mate===c||length===0||p.partner[mate]!==c||p.length[mate]!==length||((remaining-length)&1))return false;
  }
  return true;
}
export function* policies(g,s){
  const partner=Array(g.columns).fill(-1),length=Array(g.columns).fill(0),used=Array(g.columns).fill(false);
  function* visit(){
    const c=used.indexOf(false);
    if(c<0){yield {partner:[...partner],length:[...length]};return;}
    const remaining=g.rows-s.heights[c];used[c]=true;
    if(!(remaining&1))yield* visit();
    for(let d=c+1;d<g.columns;d++)if(!used[d]){
      const other=g.rows-s.heights[d];if((remaining&1)!==(other&1))continue;
      used[d]=true;partner[c]=d;partner[d]=c;
      for(let n=(remaining&1)?1:2;n<=Math.min(remaining,other);n+=2){
        length[c]=n;length[d]=n;yield* visit();
      }
      used[d]=false;partner[c]=-1;partner[d]=-1;length[c]=0;length[d]=0;
    }
    used[c]=false;
  }
  yield* visit();
}
export function cover(g,s,p){
  assert.equal(checkPolicy(g,s,p),true);
  const attacker=s.rank&1;
  const residuals=g.lines.filter(l=>!l.some(x=>s.board[x]===(attacker^1))).map(l=>l.filter(x=>s.board[x]!==attacker));
  assert.ok(residuals.every(r=>r.length>0),'no policy proof after attacker terminal');
  let covered=0;const uncovered=[];
  for(const r of residuals){
    let blocked=false;
    for(const cell of r){
      const c=cell%g.columns,depth=Math.floor(cell/g.columns)-s.heights[c];
      if(depth>=p.length[c]&&((depth-p.length[c])&1)){blocked=true;break;}
      if(depth<p.length[c]){
        const mate=p.partner[c],mateCell=(s.heights[mate]+depth)*g.columns+mate;
        if(r.includes(mateCell)){blocked=true;break;}
      }
    }
    if(blocked)covered++;else uncovered.push(r);
  }
  return {residualCount:residuals.length,covered,uncovered};
}
export function analyzeCover(g,moves){
  const s=replay(g,moves);let total=0,complete=0,best=null,min=null;
  for(const p of policies(g,s)){
    total++;const c=cover(g,s,p);
    if(c.uncovered.length===0)complete++;
    if(min===null||c.uncovered.length<min){min=c.uncovered.length;best={policy:p,...c};}
  }
  return {prefix:moves.map(c=>c+1).join(''),attacker:s.rank&1,policies:total,completeCertificates:complete,minimumUncovered:min,best,
    disposition:complete?'NO_WIN_CERTIFICATE_FOUND':'NO_CERTIFICATE_IN_ENUMERATED_FAMILY'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  assert.ok(process.argv[2],'output path required');
  const g=geometry(7,6),sequences=new Set();
  for(const prefix of ['44','444','4444']){sequences.add(prefix);for(let c=1;c<=7;c++)sequences.add(prefix+c);}
  const rows=[];
  for(const seq of sequences){
    const r=analyzeCover(g,Array.from(seq,c=>Number(c)-1));rows.push(r);
    console.log(JSON.stringify({prefix:r.prefix,policies:r.policies,complete:r.completeCertificates,minimumUncovered:r.minimumUncovered}));
  }
  const result={schema:'center-prefix.synchronized-response-family.v1',createdAt:new Date().toISOString(),runtime:process.version,
    geometry:'7x6 connect-four',sourceSha256:createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex'),
    solvedInputsUsed:false,scope:'fixed disjoint-column synchronized channels with vertical tails; no value claim from failed coverage',rows};
  writeFileSync(process.argv[2],JSON.stringify(result,null,2)+'\n');
}
