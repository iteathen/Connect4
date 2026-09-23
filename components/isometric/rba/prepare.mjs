// COLD geometry preparation. BigInt/Map/objects here never enter hot execution.
// Stable v0 IDs: cardinality, then ascending row-major 42-bit cell mask.
export function prepareRba7x6() {
  const lines=[];
  for(let r=0;r<6;r++) for(let c=0;c<7;c++) for(const [dc,dr] of [[1,0],[0,1],[1,1],[1,-1]]) {
    if(c+3*dc<7 && r+3*dr>=0 && r+3*dr<6)
      lines.push(Array.from({length:4},(_,i)=>(r+i*dr)*7+c+i*dc));
  }
  const masks=new Set();
  for(const line of lines) for(let bits=1;bits<16;bits++) {
    let mask=0n;
    for(let i=0;i<4;i++) if(bits&(1<<i)) mask|=1n<<BigInt(line[i]);
    masks.add(mask);
  }
  const count=x=>{let n=0;while(x){x&=x-1n;n++;}return n;};
  const shapes=[...masks].sort((a,b)=>count(a)-count(b)||(a<b?-1:a>b?1:0));
  if(shapes.length!==625 || lines.length!==69) throw Error('standard geometry invariant');
  const ids=new Map(shapes.map((m,i)=>[m,i]));
  const g={shapeLo:new Uint32Array(625),shapeHi:new Uint32Array(625),
    lineShift:new Uint32Array(276),lineRow:new Uint32Array(276),
    lineShape:new Uint32Array(69*16),reflect:new Uint32Array(625),
    remove:new Int32Array(625*42),contains:new Uint32Array(625*42),
    subset:new Uint32Array(625*625)};
  for(let l=0;l<69;l++) {
    for(let i=0;i<4;i++){g.lineShift[l*4+i]=(lines[l][i]%7)*3;g.lineRow[l*4+i]=(lines[l][i]/7)|0;}
    for(let bits=1;bits<16;bits++) {
      let mask=0n;for(let i=0;i<4;i++) if(bits&(1<<i))mask|=1n<<BigInt(lines[l][i]);
      g.lineShape[l*16+bits]=ids.get(mask);
    }
  }
  for(let i=0;i<625;i++) {
    const s=shapes[i];g.shapeLo[i]=Number(s&0xffffffffn);g.shapeHi[i]=Number(s>>32n);
    let mirror=0n;
    for(let cell=0;cell<42;cell++) {
      const bit=1n<<BigInt(cell);g.contains[i*42+cell]=(s&bit)?1:0;
      const image=s&~bit;g.remove[i*42+cell]=image?ids.get(image):-1;
      if(s&bit)mirror|=1n<<BigInt(((cell/7)|0)*7+6-cell%7);
    }
    g.reflect[i]=ids.get(mirror);
    for(let j=0;j<625;j++)g.subset[i*625+j]=(shapes[j]&~s)===0n?1:0;
  }
  return g;
}

export function prepareCoordinateScratch7x6() {
  return {seen:new Uint32Array(20),basis:new Uint32Array(69),
    mirrorBasis:new Uint32Array(69),inverse:new Uint32Array(625),mirror:new Uint32Array(8)};
}
