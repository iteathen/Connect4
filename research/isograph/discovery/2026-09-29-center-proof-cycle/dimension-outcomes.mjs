// Descriptive external-data analysis only. Never imported by proof producers.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

export function parseTable(html){
  const rows=[];
  for(const tr of html.matchAll(/<tr>(.*?)<\/tr>/gs)){
    const cells=[...tr[1].matchAll(/<t[hd]>(.*?)<\/t[hd]>/gs)].map(m=>m[1].trim());
    if(!cells.slice(1).some(x=>['+','-','='].includes(x)))continue;
    const height=Number(cells[0]);assert.ok(Number.isInteger(height)&&height>=4);
    cells.slice(1).forEach((value,i)=>{
      assert.ok(['+','-','='].includes(value));
      rows.push({width:i+4,height,firstPlayerWdl:{'+':1,'=':0,'-':-1}[value]});
    });
  }
  assert.ok(rows.length>0);return rows;
}
export function summarize(rows){
  const groups={};
  for(const r of rows){
    const key=`width-${r.width%2?'odd':'even'}_height-${r.height%2?'odd':'even'}`;
    groups[key]??={boards:0,firstWins:0,draws:0,secondWins:0};
    groups[key].boards++;
    groups[key][r.firstPlayerWdl===1?'firstWins':r.firstPlayerWdl===0?'draws':'secondWins']++;
  }
  return groups;
}
export function analyze(html){
  const rows=parseTable(html);
  const contrasts=[];
  for(const a of rows)for(const axis of ['width','height']){
    const other=axis==='width'?'height':'width';
    const b=rows.find(b=>b[other]===a[other]&&b[axis]===a[axis]+2);
    if(b&&a.firstPlayerWdl!==b.firstPlayerWdl)contrasts.push({axis,
      from:[a.width,a.height,a.firstPlayerWdl],to:[b.width,b.height,b.firstPlayerWdl]});
  }
  return {source:'https://tromp.github.io/c4/c4.html',
    sourceSha256:createHash('sha256').update(html).digest('hex'),
    status:'DESCRIPTIVE_EXTERNAL_OUTCOMES_NOT_PROOF_PREMISES',
    boardCount:rows.length,parity:summarize(rows),
    widthAtLeastSix:summarize(rows.filter(r=>r.width>=6)),
    sameParityOutcomeContrasts:contrasts,rows,
    limitations:['nonrandom and incomplete board-size coverage','nearby boards are not independent samples',
      'outcomes do not identify which player can enforce parity control','no fitted classifier or inferential p-value']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const result=analyze(readFileSync(new URL('BOARD_SIZE_SOURCE.html',import.meta.url),'utf8'));
  writeFileSync(new URL('BOARD_SIZE_ANALYSIS.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({boards:result.boardCount,parity:result.parity,widthAtLeastSix:result.widthAtLeastSix}));
}
