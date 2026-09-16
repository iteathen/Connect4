import assert from'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';import{createHash}from'node:crypto';
const out=new URL('../../../docs/research/evidence/winspace-native/',import.meta.url),sha=x=>createHash('sha256').update(x).digest('hex');
const ls=readFileSync(new URL('confirmation.tsv',out),'utf8').trimEnd().split('\n'),keys=ls[1].split('\t');
const rows=[JSON.parse(ls[0].slice(14)),...ls.slice(2,-1).map(l=>{const a=l.split('\t'),r={kind:'trial'};keys.forEach((k,i)=>r[k]=['cohort','mode'].includes(k)?a[i]:Number(a[i]));return r;}),JSON.parse(ls.at(-1).slice(11))];
const raw=rows.map(x=>JSON.stringify(x)).join('\n')+'\n';assert.equal(sha(raw),'3a474a7bcf19a559502a878234930769d32dc76917174f489eb1f5e5dab9ec72');
const cs=readFileSync(new URL('confirmation-corpus.tsv',out),'utf8').trimEnd().split('\n');const corpus={description:cs[0].slice(14),cases:cs.slice(2).map(l=>{const[cohort,seq,expected,io]=l.split('\t');return{cohort,seq,expected:Number(expected),independentOracle:io==='false'?false:io};})};
const text=JSON.stringify(corpus,null,2)+'\n';assert.equal(sha(text),'286a2cbabc2802f4ac241796e6c9b4dc318a04b54412abb9207fe02afb763edd');
writeFileSync(new URL('restored-confirmation.jsonl',out),raw);writeFileSync(new URL('restored-confirmation-corpus.json',out),text);
console.log(JSON.stringify({status:'PASS',exactRawBytes:Buffer.byteLength(raw),exactCorpusBytes:Buffer.byteLength(text),encoding:'UTF-8',trials:rows.length-2}));
