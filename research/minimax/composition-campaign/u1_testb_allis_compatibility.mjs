import assert from 'node:assert/strict';

const W=7,H=6,CELLS=42,TYPES=['A1','A2','A3','A4','A5','A6','A7','A8','A9'];
const CODES={
 A1:{A1:'1'},
 A2:{A1:'1',A2:'1'},
 A3:{A1:'1',A2:'1',A3:'1'},
 A4:{A1:'1',A2:'1',A3:'1',A4:'3'},
 A5:{A1:'2',A2:'1',A3:'1',A4:'1&2',A5:'4'},
 A6:{A1:'2',A2:'1',A3:'1',A4:'1&2',A5:'4',A6:'4'},
 A7:{A1:'1',A2:'1',A3:'1',A4:'1',A5:'1&2',A6:'1&2',A7:'1'},
 A8:{A1:'1',A2:'1',A3:'1',A4:'3',A5:'2&3',A6:'1&2',A7:'1',A8:'3'},
 A9:{A1:'1',A2:'1',A3:'1',A4:'3',A5:'2&3',A6:'1&2',A7:'1',A8:'3',A9:'3'}
};
const lines=[];for(let r=0;r<H;r++)for(let c=0;c<W;c++)for(const[dx,dy]of[[1,0],[0,1],[1,1],[1,-1]]){const x=c+3*dx,y=r+3*dy;if(x<0||x>=W||y<0||y>=H)continue;let m=0n;for(let j=0;j<4;j++)m|=1n<<BigInt((r+j*dy)*W+c+j*dx);lines.push(m);}assert.equal(lines.length,69);
function bit(cell){return 1n<<BigInt(cell);}function won(bits,b){for(const l of lines)if((l&b)!==0n&&(l&bits)===l)return true;return false;}function empty(h,cell){const r=Math.trunc(cell/W),c=cell-r*W;return r>=h[c];}function playable(h,cell){const r=Math.trunc(cell/W),c=cell-r*W;return h[c]===r;}function row(cell){return Math.trunc(cell/W);}function col(cell){const r=row(cell);return cell-r*W;}
let seed=0x71c0b17e>>>0;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}function randomRoot(ply){let p0=0n,p1=0n;const h=new Uint8Array(W);for(let mv=0;mv<ply;mv++){const cs=[];for(let c=0;c<W;c++)if(h[c]<H){const b=bit(h[c]*W+c),mine=(mv&1)?p1:p0;if(!won(mine|b,b))cs.push(c);}if(!cs.length)return null;const c=cs[rnd()%cs.length],b=bit(h[c]*W+c);if(mv&1)p1|=b;else p0|=b;h[c]++;}return{p0,p1,h,ply};}
function liveOwnGroups(p0,p1,pl){const opp=pl?p0:p1,occ=p0|p1,out=[];for(const l of lines){if(l&opp)continue;const rem=l&~occ;if(rem)out.push({line:l,rem});}return out;}
function frag(kind,cells){return{kind,cells,key:`${kind}:${cells.toString(16)}`};}
function desc(type,squares,fragments=[],inverses=[],special=0n){const cols=new Array(W).fill(0n);for(let cell=0;cell<CELLS;cell++)if(squares&bit(cell))cols[col(cell)]|=bit(cell);const claims=[];for(const f of fragments)if(f.kind==='claim'){const cs=[];for(let i=0;i<CELLS;i++)if(f.cells&bit(i))cs.push(i);if(cs.length===2&&col(cs[0])===col(cs[1]))claims.push({col:col(cs[0]),low:Math.min(row(cs[0]),row(cs[1])),high:Math.max(row(cs[0]),row(cs[1]))});}return{type,squares,fragments,inverses,special,cols,fragmentKeys:new Set(fragments.map(f=>f.key))};}
function uniqPush(out,d){const key=`${d.type}:${d.squares.toString(16)}:${[...d.fragmentKeys].sort().join(',')}:${d.special.toString(16)}`;if(!out._keys)Object.defineProperty(out,'_keys',{value:new Set()});if(out._keys.has(key))return;out._keys.add(key);out.push(d);}
function collect(root){const h=root.h,by=Object.fromEntries(TYPES.map(t=>[t,[]]));
 // A1 Claimeven and A3 Vertical.
 for(let c=0;c<W;c++)for(let lo=0;lo<H-1;lo++){const up=lo+1,a=lo*W+c,b=up*W+c;if(!empty(h,a)||!empty(h,b))continue;const m=bit(a)|bit(b),kind=((up+1)&1)===0?'claim':'vertical',type=kind==='claim'?'A1':'A3';uniqPush(by[type],desc(type,m,[frag(kind,m)]));}
 // A2 Baseinverse.
 const play=[];for(let c=0;c<W;c++)if(h[c]<H)play.push(h[c]*W+c);for(let i=0;i<play.length;i++)for(let j=i+1;j<play.length;j++){const m=bit(play[i])|bit(play[j]);uniqPush(by.A2,desc('A2',m,[frag('baseinverse',m)]));}
 // A5 Lowinverse.
 for(let c1=0;c1<W;c1++)for(let c2=c1+1;c2<W;c2++)for(let l1=0;l1<H-1;l1++)for(let l2=0;l2<H-1;l2++){const u1=l1+1,u2=l2+1;if(((u1+1)&1)!==1||((u2+1)&1)!==1)continue;const a=l1*W+c1,b=u1*W+c1,d=l2*W+c2,e=u2*W+c2;if(![a,b,d,e].every(x=>empty(h,x)))continue;const f1=frag('vertical',bit(a)|bit(b)),f2=frag('vertical',bit(d)|bit(e));uniqPush(by.A5,desc('A5',f1.cells|f2.cells,[f1,f2],[{col:c1,low:l1,high:u1},{col:c2,low:l2,high:u2}]));}
 // A6 Highinverse.
 for(let c1=0;c1<W;c1++)for(let c2=c1+1;c2<W;c2++)for(let l1=0;l1<H-2;l1++)for(let l2=0;l2<H-2;l2++){const u1=l1+2,u2=l2+2;if(((u1+1)&1)!==0||((u2+1)&1)!==0)continue;const cells=[l1*W+c1,(l1+1)*W+c1,u1*W+c1,l2*W+c2,(l2+1)*W+c2,u2*W+c2];if(!cells.every(x=>empty(h,x)))continue;const m=cells.reduce((z,x)=>z|bit(x),0n),f1=frag('highinverse',bit(cells[0])|bit(cells[1])|bit(cells[2])),f2=frag('highinverse',bit(cells[3])|bit(cells[4])|bit(cells[5]));uniqPush(by.A6,desc('A6',m,[f1,f2],[{col:c1,low:l1,high:u1},{col:c2,low:l2,high:u2}]));}
 // A7 Baseclaim.
 for(let j=0;j<play.length;j++){const p2=play[j],r2=row(p2),c2=col(p2);if(r2+1>=H)continue;const q2=(r2+1)*W+c2;if(((r2+2)&1)!==0||!empty(h,q2))continue;for(let i=0;i<play.length;i++)if(i!==j)for(let z=i+1;z<play.length;z++)if(z!==j){const p1=play[i],p3=play[z],m=bit(p1)|bit(p2)|bit(p3)|bit(q2),claim=frag('claim',bit(p2)|bit(q2)),b1=frag('baseinverse',bit(p1)|bit(q2)),b2=frag('baseinverse',bit(p2)|bit(p3));uniqPush(by.A7,desc('A7',m,[claim,b1,b2]));}}
 // A4/A8/A9 components follow the existing marginal-coverage generator.
 for(const g of liveOwnGroups(root.p0,root.p1,1)){const empt=[];for(let cell=0;cell<CELLS;cell++)if(g.rem&bit(cell))empt.push(cell);if(!empt.length||empt.some(q=>row(q)===H-1))continue;const succ=empt.map(q=>q+W);
   const beforeFrags=[];let beforeSquares=0n;for(let i=0;i<empt.length;i++){const q=empt[i],s=succ[i],m=bit(q)|bit(s),kind=(((row(s)+1)&1)===0)?'claim':'vertical';beforeFrags.push(frag(kind,m));beforeSquares|=m;}uniqPush(by.A8,desc('A8',beforeSquares,beforeFrags));
   let ae=true;const aeFrags=[];for(const q of empt){const r=row(q),c=col(q);if(((r+1)&1)!==0||r===0||!empty(h,q-W)){ae=false;break;}const m=bit(q-W)|bit(q);aeFrags.push(frag('claim',m));}if(ae){const m=aeFrags.reduce((z,f)=>z|f.cells,0n);uniqPush(by.A4,desc('A4',m,aeFrags));}
   for(const q of empt){if(!playable(h,q))continue;for(const x of play){if(x===q||col(x)===col(q))continue;const special=bit(q)|bit(x);uniqPush(by.A9,desc('A9',beforeSquares|special,[...beforeFrags,frag('special',special)],[],special));}}
 }
 return by;}
function codeFor(a,b){const ia=TYPES.indexOf(a),ib=TYPES.indexOf(b),hi=ia>=ib?a:b,lo=ia>=ib?b:a;return CODES[hi][lo];}
function constraint1(a,b){return(a.squares&b.squares)===0n;}
function noClaimBelowInverse(claims,inverses){for(const q of claims)for(const inv of inverses)if(q.col===inv.col&&q.high<inv.low)return false;return true;}
function constraint2(a,b){return noClaimBelowInverse(a.claims,b.inverses)&&noClaimBelowInverse(b.claims,a.inverses);}
function constraint3(a,b){for(let c=0;c<W;c++){const x=a.cols[c],y=b.cols[c],over=x&y;if(over!==0n){if((over&(a.special|b.special))!==0n)return false;if(x!==y)return false;}}return true;}
function inverseCols(d){let m=0;for(const x of d.inverses)m|=1<<x.col;return m;}
function constraint4(a,b){if(!constraint1(a,b))return false;const x=inverseCols(a),y=inverseCols(b),over=x&y;return over===0||x===y;}
function allisOracle(a,b){const code=codeFor(a.type,b.type);for(const k of code.split('&')){if(k==='1'&&!constraint1(a,b))return false;if(k==='2'&&!constraint2(a,b))return false;if(k==='3'&&!constraint3(a,b))return false;if(k==='4'&&!constraint4(a,b))return false;}return true;}
function genericCompat(a,b){
 const shared=a.squares&b.squares;if((shared&(a.special|b.special))!==0n)return false;
 let shareable=0n;const bk=new Map(b.fragments.map(f=>[f.key,f]));for(const f of a.fragments){const g=bk.get(f.key);if(g)shareable|=f.cells;}if((shared&~shareable)!==0n)return false;
 // Partial overlap inside one column means two response programs release different event sets.
 for(let c=0;c<W;c++){const x=a.cols[c],y=b.cols[c];if((x&y)!==0n&&x!==y)return false;}
 // A claim resolved below an inverse flips the release parity before the inverse obligation.
 if(!constraint2(a,b))return false;
 // Overlapping inverse families must own the same columns; otherwise one response releases only part of the other's event set.
 const x=inverseCols(a),y=inverseCols(b),over=x&y;if(over!==0&&x!==y)return false;
 return true;
}
function brief(d){return{type:d.type,squares:d.squares.toString(16),fragments:d.fragments.map(f=>f.key),claims:d.claims,inverses:d.inverses,special:d.special.toString(16)};}
const stats={pairs:0,agree:0,tableAllowed:0,genericAllowed:0,falseNegative:0,genericExtra:0,overlapExtra:0},byPair={},examples={falseNegative:[],genericExtra:[]};
for(const ply of[12,16,20,24,28,32])for(let k=0;k<36;k++){const root=randomRoot(ply);if(!root)continue;const by=collect(root);for(const t of TYPES)if(by[t].length>12)by[t].length=12;for(let i=0;i<TYPES.length;i++)for(let j=0;j<=i;j++){const ta=TYPES[i],tb=TYPES[j],key=`${ta}|${tb}`,s=byPair[key]??(byPair[key]={pairs:0,tableAllowed:0,genericAllowed:0,falseNegative:0,genericExtra:0});for(const a of by[ta])for(const b of by[tb]){if(a===b)continue;const expected=allisOracle(a,b),got=genericCompat(a,b);stats.pairs++;s.pairs++;if(expected){stats.tableAllowed++;s.tableAllowed++;}if(got){stats.genericAllowed++;s.genericAllowed++;}if(expected===got){stats.agree++;continue;}if(expected&&!got){stats.falseNegative++;s.falseNegative++;if(examples.falseNegative.length<24)examples.falseNegative.push({code:codeFor(a.type,b.type),a:brief(a),b:brief(b)});}else{stats.genericExtra++;s.genericExtra++;if((a.squares&b.squares)!==0n)stats.overlapExtra++;if(examples.genericExtra.length<24)examples.genericExtra.push({code:codeFor(a.type,b.type),shared:(a.squares&b.squares).toString(16),a:brief(a),b:brief(b)});}}}}
assert(stats.pairs>100000,'insufficient pair corpus');
console.log(JSON.stringify({kind:'connect4-u1-testb-allis-compatibility',status:'complete',authority:'differential research only; generic extras are not proof authority and table-allowed false negatives must be resolved before generic compatibility can replace the Allis oracle',oracle:{source:'Victor Allis thesis section 7.4',constraints:{1:'square sets disjoint',2:'no Claimeven below inverse',3:'column-wise square sets disjoint or equal',4:'square sets disjoint and inverse-column sets disjoint or equal'},note:'the thesis explicitly excludes some semantically combinable redundant overlaps, so table-false/generic-true cases are retained separately rather than automatically called unsound'},generic:'type-blind identical response-fragment sharing + exact per-column overlap + claim/inverse release precedence + inverse-column consistency',stats,byPair,examples},null,2));