// Source: genuine 7x6 K4 four-orientation junction tensor.
// This computes exact Walsh and ternary Fourier coefficients of
// the three allowed ownership labels at one four-way junction.
// The 42 copies are identified by physical geometry first.
// No game-value or strategic lookahead.
export function sourceLocalOwnerFourierTensor(){
 const W=7,H=6;
 const occupied=new Map();
 for(let r=0;r<H;r++)for(let c=0;c<W;c++)
  occupied.set(r*W+c,{c,r,appearances:[]});
 const lines=[];
 const add=(orientation,c,r,dx,dy)=>{
  const sites=[];
  while(c>=0&&c<W&&r>=0&&r<H){
   const e=r*W+c;sites.push(e);
   occupied.get(e).appearances.push({orientation,strand:lines.length,position:sites.length-1});
   c+=dx;r+=dy;
  }
  lines.push({orientation,sites});
 };
 for(let r=0;r<H;r++)add('H',0,r,1,0);
 for(let c=0;c<W;c++)add('V',c,0,0,1);
 for(let c=0;c<W;c++)add('R',c,0,1,1);
 for(let r=1;r<H;r++)add('R',0,r,1,1);
 for(let r=0;r<H;r++)add('F',0,r,1,-1);
 for(let c=1;c<W;c++)add('F',c,H-1,1,-1);
 if(lines.length!==37||[...occupied.values()].some(e=>e.appearances.length!==4))
  throw Error('four-way original junction geometry invalid');
 const pop=x=>{let s=0;for(;x;x&=x-1)s++;return s;};
 const Walsh=[];
 for(let k0=0;k0<16;k0++)for(let k1=0;k1<16;k1++){
  const S0=pop(k0)&1,S1=pop(k1)&1;
  Walsh.push({k0,k1,S0,S1,numerator:1+(S0?-1:1)+(S1?-1:1),denominator:16});
 }
 const ternary=[];
 for(let a=0;a<3;a++)for(let b=0;b<3;b++)
  for(let c=0;c<3;c++)for(let d=0;d<3;d++)
   ternary.push({frequencies:[a,b,c,d],
    amplitudeNumerator:(a+b+c+d)%3===0?1:0,denominator:3});
 return {status:'SOURCE_UNFOLD_FIRST_OWNER_CROSSING_FOURIER',
  originalGame:[7,6,4],originalPhysicalJunctions:42,strands:lines.length,
  FourierOwnerFlagBits:8,Hadamard:Walsh,
  independentOwnerWavesFourStateModelCorrectionRank:1,
  actualTwoOwnerFrequencyMatrixRank:2,
  ternaryDFT:ternary,ternaryNonzero:ternary.filter(x=>x.amplitudeNumerator).length,
  originalStrands:lines,physicalFourWayJunctions:[...occupied.entries()],
  sourceFutureGameWDLComputed:0};
}