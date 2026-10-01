#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const library=process.argv[2];
assert(library);
const EXPECTED='bf23d3a67652cd42e1975f29c7dc4eed54f7eb42';
const git=(...args)=>execFileSync('git',['-C',library,...args],{encoding:'utf8'}).trim();
assert.equal(git('rev-parse','HEAD'),EXPECTED);

const load=name=>import(pathToFileURL(resolve(library,'addons',name+'.mjs')).href);
const {prepareConnect4RbaGeometry}=await load('rba-connect4-geometry');
const {connect4RbaFromMoves}=await load('rba-connect4-ingress');
const g=prepareConnect4RbaGeometry({columns:7,rows:6});

const parentSequence='444441566666232222423311';
const rows=[];
for(let response=1;response<=7;response++){
  const triggerSequence=parentSequence+'5';
  const trigger=connect4RbaFromMoves(Array.from(triggerSequence,c=>Number(c)-1),{geometry:g,canonical:false});
  assert.equal(trigger.words[g.metaOffset]&3,0);
  if(trigger.words[response-1]>=6)continue;

  const replySequence=triggerSequence+String(response);
  const reply=connect4RbaFromMoves(Array.from(replySequence,c=>Number(c)-1),{geometry:g,canonical:false});
  const replyTerminal=reply.words[g.metaOffset]&3;
  const row={
    responseColumn:response,
    replySequence,
    replyTerminal,
    replyRank:replySequence.length,
    replySupport:Array.from(reply.words.slice(0,7)),
    followupColumn:5,
    followupLegal:reply.words[4]<6,
    followupTerminal:null,
    followupSequence:null,
    followupRank:null,
    followupSupport:null
  };
  if(!replyTerminal&&reply.words[4]<6){
    const followupSequence=replySequence+'5';
    const followup=connect4RbaFromMoves(Array.from(followupSequence,c=>Number(c)-1),{geometry:g,canonical:false});
    row.followupSequence=followupSequence;
    row.followupRank=followupSequence.length;
    row.followupTerminal=followup.words[g.metaOffset]&3;
    row.followupSupport=Array.from(followup.words.slice(0,7));
  }
  rows.push(row);
}

console.log(JSON.stringify({
  schema:'connect4.cpc_d13_trigger5_immediate_followup_probe.v1',
  oracleUsed:false,
  solvedInputsUsed:false,
  parent:{sequence:parentSequence,rank:parentSequence.length},
  firstAttackColumn:5,
  rows,
  conclusion:[
    'This probe asks only whether attacker column 5 is an immediate terminal move after each physically legal defender reply to the first column-5 trigger.',
    'It does not infer anything about replies whose first move is already terminal, and it makes no minimax claim beyond the enumerated local two-ply response set.'
  ],
  boundary:[
    'No oracle, solved W/D/L, best-move label, or physical-board identity is used.',
    'A universal terminal followup across every legal nonterminal defender reply would be a local forced-completion certificate at this exact state, not a global theorem for earlier states.'
  ]
},null,2));
