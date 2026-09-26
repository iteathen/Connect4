import {test} from 'node:test';
import assert from 'node:assert/strict';
import {encode,decode} from './native-tree.mjs';

test('ordered incidence preserves operands, nested scopes, guard and literals',()=>{
  const source={type:'FunctionDeclaration',id:{type:'Identifier',name:'x'},body:[
    {type:'BinaryExpression',operator:'-',left:17,right:4},
    {type:'IfStatement',test:{operator:'<',left:'q',right:32},alternate:null},
    {type:'Literal',value:-0,raw:'-0'},
    {type:'Literal',value:1.25,raw:'1.25'},
    {type:'Literal',value:'\ud800\u0000'},true,false,[],{},null]};
  assert.deepEqual(decode(encode(source)),source);
  const mutant=structuredClone(source);mutant.body[0].left=4;mutant.body[0].right=17;
  assert.notEqual(encode(source),encode(mutant));
  assert.deepEqual(decode(encode(mutant)),mutant);
});
test('malformed, undeclared, duplicate fields and trailing terms fail closed',()=>{
  for(const s of ['(^999 #1)','(^980010 ((^980012 #97) #1) ((^980012 #97) #2))','(^980011 #1','(^980015) #2'])
    assert.throws(()=>decode(s));
});
