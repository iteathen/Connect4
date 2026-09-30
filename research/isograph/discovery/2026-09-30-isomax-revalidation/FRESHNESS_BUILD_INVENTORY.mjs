import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const outDir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(outDir,'../../../..');
const head='a0d439449e398c5ce5a70ccbc9b3a38f3df16928';
const observedWorkingHead=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const tracked=git(['ls-tree','-r','--name-only',head]).trim().split('\n');
const labelRE=/\b(\d+)x(\d+)-?k(\d+)\b/gi;
const labels=text=>[...new Set([...text.matchAll(labelRE)].map(m=>`${+m[1]}x${+m[2]}-k${+m[3]}`))].sort();
// Strict allowlist: warrants are declarations. No result/evidence/scalar payload is opened.
const warrants=tracked.filter(p=>p.startsWith('research/isograph/discovery/')&&/\/EXPERIMENTAL_WARRANT[^/]*\.json$/.test(p));
const declarationSources=warrants.map(p=>{
  const b=execFileSync('git',['show',head+':'+p],{cwd:root});
  return {path:p,sha256Bytes:createHash('sha256').update(b).digest('hex'),labels:labels(b.toString('utf8'))};
});
const filenameSources=tracked.map(p=>({path:p,labels:labels(p)})).filter(x=>x.labels.length);
const availableRefs=git(['for-each-ref','--format=%(refname) %(objectname)','refs/heads','refs/remotes','refs/tags']).trim().split('\n');
const reachableCommitCount=Number(git(['rev-list','--all','--count']).trim());
const historyPaths=[...new Set(git(['log','--all','--full-history','--format=','--name-only','--','research','.github/workflows']).split('\n').filter(Boolean))];
const historyFilenameSources=historyPaths.map(p=>({path:p,labels:labels(p)})).filter(x=>x.labels.length);
const candidateLabels=['5x4-k3','3x7-k4','7x3-k4'];
const historicalSourceHits=[];
for(const label of candidateLabels){
  const [_,w,h,k]=label.match(/(\d+)x(\d+)-k(\d+)/);
  const named=`${w}[xX]${h}-?[kK]${k}`;
  const dimensions=`\\[[[:space:]]*${w},[[:space:]]*${h},[[:space:]]*${k}[[:space:]]*\\]|auditCase\\([[:space:]]*${w},[[:space:]]*${h},[[:space:]]*${k}[[:space:]]*\\)`;
  const found=git(['log','--all','--full-history','-m','--format=COMMIT:%H','--name-only','-G',named+'|'+dimensions,'--','*.mjs','*WARRANT*.json','*.yml']);
  let commit=null;
  for(const line of found.split('\n')){
    if(line.startsWith('COMMIT:'))commit=line.slice(7);
    else if(line.trim())historicalSourceHits.push({label,commit,path:line.trim(),meaning:'source/declaration changed on a matching line; exposure conservative; no scalar payload read'});
  }
}
const candidates=['5x4-k3','3x7-k4','7x3-k4'].map((label,i)=>{
  const matches=[...declarationSources,...filenameSources,...historyFilenameSources].filter(x=>x.labels.includes(label)).map(x=>x.path);
  matches.push(...historicalSourceHits.filter(x=>x.label===label).map(x=>x.commit+':'+x.path));
  return {order:i+1,label,matches:[...new Set(matches)],status:matches.length?'PRIOR_LABEL_PRESENT__EXCLUDED':'REPOSITORY_FRESH_WITHIN_DECLARED_METADATA_SEARCH_SCOPE',nonAffineStatus:'UNKNOWN_NOT_TESTED',scalarAccessThisAudit:false};
});
const out={schema:'connect4.isomax.revalidation.freshness_metadata_inventory.v1',head,observedWorkingHead,canonicalOwner:'research/semantic-quotient',authorityEffect:'NONE',status:'RESERVATION_ONLY',scope:{trackedFilenames:tracked.length,warrantDeclarations:warrants.length,sourceHashConvention:'exact Git blob bytes at pinned head',sourceContentPolicy:'Pinned experimental-warrant declarations plus historical source/declaration diff searches outputting only commit/path metadata; no result/evidence payloads',historicalRefCoverage:'all available refs/reachable history; filenames under research and workflows; candidate labels and explicit [W,H,K]/auditCase(W,H,K) source declarations in .mjs/*WARRANT*.json/.yml',limitations:'Does not detect every possible indirect/dynamic board declaration or private/external exposure',reachableCommitCount,historicalPaths:historyPaths.length,availableRefs},newScalarReplay:false,sealedOutcomeFilesOpened:false,sealedExclusions:['3x6-k4','5x3-k4'],trainedHardCases:['6x3-k3','4x5-k4','6x3-k4'],declarationSources,filenameSources,historyFilenameSources,historicalSourceHits,candidates};
fs.writeFileSync(path.join(outDir,'FRESHNESS_LABEL_INVENTORY.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({status:out.status,warrants:warrants.length,filenameMatches:filenameSources.length,candidates},null,2));
