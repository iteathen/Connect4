// Restore the exact frozen corpus from compact UTF-8, no binary transport.
import{readFileSync,writeFileSync}from'node:fs';
import{createHash}from'node:crypto';
const rows=[];let cohort,sourceCohort;
for(const line of readFileSync(new URL('./corpus.txt',import.meta.url),'utf8').trim().split('\n')){
 if(line.startsWith('@')){[cohort,sourceCohort]=line.slice(1).split(' ');continue;}
 const x={id:rows.length,cohort};if(sourceCohort)x.sourceCohort=sourceCohort;x.seq=line;rows.push(x);
}
const text=JSON.stringify(rows,null,2)+'\n';
if(createHash('sha256').update(text).digest('hex')!=='838c62300cb5178b7c92133964e66b1cb45f748e86ae442a03c465d632849b82')throw Error('corpus digest mismatch');
writeFileSync(new URL('./corpus.json',import.meta.url),text);
console.log('Restored '+rows.length+' frozen positions.');
