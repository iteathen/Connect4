import test from 'node:test';
import assert from 'node:assert/strict';
import {createCpcxGeometry,buildCpcxPosition} from './cpcx.mjs';
import {
  verifyCpcxFixedEventScript,
  compileCpcxPostActionWingAttack,
  classifyCpcxWingDeviation,
  certifyCpcxSecondWingDeviation,
} from './cpcx-wing.mjs';

const g=createCpcxGeometry();

function frontierFromHeights(heights){
  const out=[];
  for(let c=0;c<g.columns;c++){
    const r=heights[c];
    if(r<g.rows)out.push(r*g.columns+c);
  }
  return out;
}

test('every 44444 second wing deviation except final-trigger theft is an exact P0 first win',()=>{
  const root=buildCpcxPosition('44444',{geometry:g});
  for(let column=0;column<g.columns;column++){
    const actionCell=root.heights[column]*g.columns+column,
      wing=compileCpcxPostActionWingAttack(root,{
        actionCell,actionOwner:1,attacker:0,
      }),
      triggers=wing.anchoredLine.triggerCells,
      responses=wing.anchoredLine.requiredResponseCells,
      prefix=[
        {cell:actionCell,owner:1},
        {cell:triggers[0],owner:0},
        {cell:responses[0],owner:1},
        {cell:triggers[1],owner:0},
      ],
      v=verifyCpcxFixedEventScript(root,prefix);

    assert.equal(v.legal,true,String(column+1));
    assert.equal(v.terminal,null,String(column+1));

    const deviations=frontierFromHeights(v.finalHeights)
      .filter(cell=>cell!==responses[1]);
    let stolen=0,certified=0;

    for(const actualReplyCell of deviations){
      const d=classifyCpcxWingDeviation(wing,{decisionIndex:1,actualReplyCell}),
        c=certifyCpcxSecondWingDeviation(root,wing,{actualReplyCell});
      if(d.stealsFutureTrigger){
        stolen+=1;
        assert.equal(actualReplyCell,triggers[2],String(column+1));
        assert.equal(c.kind,'NO_CERTIFICATE',String(column+1));
        assert.equal(c.seam,'FINAL_WING_TRIGGER_STOLEN',String(column+1));
      }else{
        certified+=1;
        assert.equal(c.kind,'CERTIFIED_FIRST_WIN',String(column+1));
        assert.equal(c.exact,true,String(column+1));
        assert.equal(c.player,0,String(column+1));
        assert.equal(c.verification.terminal.player,0,String(column+1));
        assert.equal(c.verification.terminal.lineId,wing.anchoredLine.lineId,String(column+1));
      }
    }

    assert.equal(stolen,1,String(column+1));
    assert.equal(certified,deviations.length-1,String(column+1));
  }
});

test('second-wing deviation theorem is generic and remains search/oracle isolated',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('./cpcx-wing.mjs',import.meta.url),'utf8');
  for(const forbidden of [
    "'44444'",
    'ExactConnect4Oracle',
    'components/oracle',
    'solveSequence(',
    'minimax',
    'negamax',
    'alpha-beta',
    'cpc-connect4',
  ])assert.equal(source.includes(forbidden),false,forbidden);
});
