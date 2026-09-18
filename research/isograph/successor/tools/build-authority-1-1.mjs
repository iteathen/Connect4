import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const FROZEN='aea692af800f524569ea1c2fda722087cd9bca39';
const root='research/isograph/successor';
const outRoot=root+'/generated';
const inv=JSON.parse(fs.readFileSync(root+'/CONNECT4_LOGIC_CORPUS_INVENTORY_1_1_CANDIDATE.json','utf8'));

if(inv.dependency_closure?.status!=='PASS'||inv.dependency_closure?.missing_dependency_targets!==0){
  throw new Error('successor inventory is not dependency-closed');
}
if(inv.unresolved_classifications?.length) throw new Error('unresolved migration classifications remain');

function git(args,opts={}){
  return execFileSync('git',args,{maxBuffer:256*1024*1024,...opts});
}
function objectSha(p){
  return git(['rev-parse',FROZEN+':'+p],{encoding:'utf8'}).trim();
}
function bytesOf(p){
  return git(['show',FROZEN+':'+p]);
}
function enc(buf){
  return '('+[...buf].map(b=>'#'+b).join(' ')+')';
}
function utf8(buf){return buf.toString('utf8');}
function clean(){
  fs.rmSync(outRoot,{recursive:true,force:true});
  fs.mkdirSync(outRoot+'/source',{recursive:true});
  fs.mkdirSync(outRoot+'/items',{recursive:true});
}
function pushChunk(chunks,cur,members,max=780000){
  if(cur.text.length && cur.text.length>max) throw new Error('oversized chunk '+cur.text.length);
  if(cur.text.length) chunks.push({text:cur.text,members:[...members]});
}
function roleLabel(role){
  return ({
    current_logic:'^97406',
    current_policy_or_routing:'^97407',
    source_native_unresolved_logic:'^97408',
    normalized_evidence:'^97409',
    raw_evidence_or_provenance:'^97410',
    historical_only:'^97411',
    implementation_qualification:'^97412',
    non_logic_implementation:'^97413',
    classification_unresolved:'^97414'
  })[role]||'^97414';
}
const nativeRoles=new Set(['current_logic','current_policy_or_routing','source_native_unresolved_logic','normalized_evidence','historical_only']);
const unresolvedStatuses=new Set(['hypothesis','candidate_rule','open_question','missing_law','untriaged']);

clean();
const entries=[...inv.entries].sort((a,b)=>a.path.localeCompare(b.path));
const sourceSI=new Map(entries.map((e,i)=>[e.path,3000001+i]));

const claimStatuses=new Map();
const claimRoot=JSON.parse(git(['show',FROZEN+':research/canonical/CLAIM_INDEX.json'],{encoding:'utf8'}));
for(const shard of claimRoot.registries){
  const r=JSON.parse(git(['show',FROZEN+':research/canonical/'+shard],{encoding:'utf8'}));
  for(const c of r.claims) claimStatuses.set(c.id,c.status);
}

let corpus='[\n  (^97400 11000001)\n  (^97429 11000001 #'+entries.length+')\n]\n\n';
const nativeSIs=[], addressedSIs=[];
for(const e of entries){
  const si=sourceSI.get(e.path);
  const actual=objectSha(e.path);
  if(e.sha && actual!==e.sha) throw new Error('frozen object mismatch '+e.path+' inventory='+e.sha+' actual='+actual);
  const pathBuf=Buffer.from(e.path,'utf8');
  const shaBuf=Buffer.from(actual,'utf8');
  corpus+='[\n  (^97401 '+si+')\n  (^97402 '+si+' '+enc(pathBuf)+')\n  (^97403 '+si+' '+enc(shaBuf)+')\n';
  if(Number.isInteger(e.size)) corpus+='  (^97404 '+si+' #'+e.size+')\n';
  corpus+='  (^97405 '+si+' '+roleLabel(e.role)+')\n]\n\n';
  if(nativeRoles.has(e.role)&&e.type==='blob') nativeSIs.push(si);
  else addressedSIs.push(si);
}
corpus+='[\n  (^97427 11000002 ['+nativeSIs.join(' ')+'])\n  (^97428 11000003 ['+addressedSIs.join(' ')+'])\n  (^97430 11000002 #'+nativeSIs.length+')\n]\n';
fs.writeFileSync(outRoot+'/CONNECT4_LOGIC_CORPUS_1_1_CANDIDATE.isg',corpus);

const sourceChunks=[];
let srcText='',srcMembers=[],sourceDocCount=0;
const itemChunks=[];
let itemText='',itemMembers=[],itemCount=0;
const docManifest=[];
const MAX=760000;

function flushSource(){
  if(!srcText) return;
  sourceChunks.push({text:srcText,members:[...srcMembers]});
  srcText='';srcMembers=[];
}
function flushItems(){
  if(!itemText) return;
  itemChunks.push({text:itemText,members:[...itemMembers]});
  itemText='';itemMembers=[];
}
function lexical(line,inCode){
  const t=line.trim();
  const fence=/^(?:```|~~~)/.test(t);
  if(inCode||fence) return ['code',fence];
  if(/^#{1,6}\s/.test(t)) return ['heading',false];
  if(/^\|/.test(t)) return ['table',false];
  if(/^(?:[-*+]\s+|\d+[.)]\s+)/.test(t)) return ['list',false];
  return ['prose_or_data',false];
}
const classLabel={heading:'^97115',code:'^97116',list:'^97117',table:'^97118',prose_or_data:'^97119'};

for(let objIndex=0;objIndex<entries.length;objIndex++){
  const e=entries[objIndex];
  if(!(nativeRoles.has(e.role)&&e.type==='blob')) continue;
  const si=sourceSI.get(e.path);
  const buf=bytesOf(e.path);
  const imageSI=12000000+objIndex;
  const rec='[\n  (^97415 '+imageSI+' '+si+')\n  (^97416 '+imageSI+' '+enc(buf)+')\n]\n\n';
  if(srcText && srcText.length+rec.length>MAX) flushSource();
  srcText+=rec;srcMembers.push(e.path);sourceDocCount++;

  let start=0,lineNo=0,inCode=false,docItems=0;
  const local=[];
  for(let i=0;i<=buf.length;i++){
    if(i!==buf.length&&buf[i]!==10) continue;
    const end=i;
    const lineBuf=buf.subarray(start,end);
    const nonempty=[...lineBuf].some(b=>![9,13,32].includes(b));
    if(nonempty){
      const line=utf8(lineBuf);
      const [cls,fence]=lexical(line,inCode);
      const itemSI=200000000+objIndex*100000+lineNo;
      let ir='[\n  (^97420 '+itemSI+')\n  (^97421 '+itemSI+' '+si+')\n  (^97422 '+itemSI+' #'+lineNo+')\n  (^97423 '+itemSI+' #'+start+' #'+end+')\n  (^97424 '+itemSI+' '+classLabel[cls]+')\n';
      const claims=[...new Set([...line.matchAll(/\bC4-R(\d{4})\b/g)].map(m=>'C4-R'+m[1]))].sort();
      for(const id of claims){
        const claimSI=100000+Number(id.slice(-4));
        ir+='  (^97425 '+itemSI+' '+claimSI+')\n';
        if(unresolvedStatuses.has(claimStatuses.get(id))) ir+='  (^97426 '+itemSI+' '+(400000+Number(id.slice(-4)))+')\n';
      }
      ir+=']\n\n';
      local.push(ir);docItems++;itemCount++;
      if(fence) inCode=!inCode;
    }
    lineNo++;start=i+1;
  }
  const docHeader='[\n  (^97431 '+imageSI+' #'+docItems+')\n]\n\n';
  const block=docHeader+local.join('');
  if(itemText && itemText.length+block.length>MAX) flushItems();
  itemText+=block;itemMembers.push(e.path);
  docManifest.push({path:e.path,object_si:si,image_si:imageSI,bytes:buf.length,semantic_items:docItems,role:e.role,git_object:objectSha(e.path)});
}
flushSource();flushItems();

for(let i=0;i<sourceChunks.length;i++){
  const p=outRoot+'/source/CONNECT4_LOGIC_SOURCE_IMAGE_1_1_PART_'+String(i+1).padStart(2,'0')+'.isg';
  fs.writeFileSync(p,'[\n  (^97400 '+(13000000+i)+')\n  (^97430 '+(13000000+i)+' #'+sourceChunks[i].members.length+')\n]\n\n'+sourceChunks[i].text);
}
for(let i=0;i<itemChunks.length;i++){
  const p=outRoot+'/items/CONNECT4_LOGIC_ITEMS_1_1_PART_'+String(i+1).padStart(2,'0')+'.isg';
  fs.writeFileSync(p,'[\n  (^97400 '+(14000000+i)+')\n  (^97431 '+(14000000+i)+' #'+itemChunks[i].members.length+')\n]\n\n'+itemChunks[i].text);
}

const manifest={
  schema:1,
  candidate:'connect4-isograph-logic-1.1',
  frozen_source_revision:FROZEN,
  dependency_closed:true,
  corpus_objects:entries.length,
  native_image_objects:sourceDocCount,
  content_addressed_only_objects:entries.length-sourceDocCount,
  semantic_items:itemCount,
  source_image_parts:sourceChunks.length,
  item_parts:itemChunks.length,
  roles:inv.role_counts,
  documents:docManifest
};
fs.writeFileSync(outRoot+'/CONNECT4_LOGIC_GENERATED_MANIFEST_1_1_CANDIDATE.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({corpus_objects:entries.length,native_image_objects:sourceDocCount,content_addressed_only_objects:entries.length-sourceDocCount,semantic_items:itemCount,source_parts:sourceChunks.length,item_parts:itemChunks.length},null,2));
