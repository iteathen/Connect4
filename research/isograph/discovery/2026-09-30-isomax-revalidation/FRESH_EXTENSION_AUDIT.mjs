// Metadata/source-declaration audit only. Never opens board result payloads.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../../../..');
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024});
const head=git(['rev-parse','HEAD']).trim();
const refs=git(['for-each-ref','--format=%(refname) %(objectname)','refs/heads','refs/remotes','refs/tags']).trim().split('\n');
const reachableCommitCount=Number(git(['rev-list','--all','--count']).trim());
const historicalPaths=[...new Set(git(['log','--all','--full-history','--format=','--name-only']).split('\n').filter(Boolean))];
const candidates=['4x6-k3','3x8-k3','5x4-k5','6x4-k3'].map(label=>{
  const [,w,h,k]=label.match(/(\d+)x(\d+)-k(\d+)/);
  // Delimit by alphanumerics, allowing underscore-delimited artifact filenames.
  const filenamePattern=new RegExp(`(^|[^0-9A-Za-z])${w}x${h}-?k${k}($|[^0-9A-Za-z])`,'i');
  const filenameMatches=historicalPaths.filter(p=>filenamePattern.test(p));
  const named=`${w}[xX]${h}-?[kK]${k}`;
  const dimensions=`\\[[[:space:]]*${w},[[:space:]]*${h},[[:space:]]*${k}[[:space:]]*\\]|auditCase\\([[:space:]]*${w},[[:space:]]*${h},[[:space:]]*${k}[[:space:]]*\\)`;
  const searchRegex=named+'|'+dimensions;
  const history=git(['log','--all','--full-history','-m','--format=COMMIT:%H','--name-only','-G',searchRegex,'--','*.mjs','*WARRANT*.json','*.yml']);
  let commit=null;const sourceDeclarationMatches=[];
  for(const line of history.split('\n')){if(line.startsWith('COMMIT:'))commit=line.slice(7);else if(line.trim())sourceDeclarationMatches.push({commit,path:line.trim()});}
  return {label,dimensions:[+w,+h,+k],filenameMatches,sourceDeclarationMatches,searchRegex,status:filenameMatches.length||sourceDeclarationMatches.length?'PRIOR_REFERENCE_FOUND_EXCLUDE':'REPOSITORY_FRESH_WITHIN_DECLARED_METADATA_SEARCH_SCOPE',nonAffineStatus:'UNKNOWN_NO_BOARD_TEST',scalarPayloadRead:false};
});
const result={schema:'connect4.isomax.fresh_extension.metadata_audit.v1',head,canonicalOwner:'research/semantic-quotient',authorityEffect:'NONE',availableRefs:refs,reachableCommitCount,historicalPathCount:historicalPaths.length,scope:'All available refs/reachable history: every historical pathname; literal board labels and [W,H,K]/auditCase(W,H,K) source declarations in .mjs, *WARRANT*.json and .yml; matching diffs return commit/path only.',limitations:'Not a proof against private/external exposure or every dynamically assembled dimension object. Outcome payloads are excluded.',sealedExclusions:['3x6-k4','5x3-k4'],phase1WarrantChanged:false,newBoardEnumeration:false,newScalarReplay:false,candidates};
fs.writeFileSync(path.join(here,'FRESH_EXTENSION_METADATA.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({head,refs:refs.length,reachableCommitCount,historicalPaths:historicalPaths.length,candidates:candidates.map(({label,status,filenameMatches,sourceDeclarationMatches})=>({label,status,filenameMatches,sourceDeclarationMatches}))},null,2));
