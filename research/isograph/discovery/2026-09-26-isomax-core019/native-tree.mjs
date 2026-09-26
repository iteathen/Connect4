// Qualification infrastructure, never imported by a solver.
export function encode(x){
  if(x===null)return '(^980015)';
  if(typeof x==='boolean')return `(^980014 #${+x})`;
  if(typeof x==='string')return `(^980012${Array.from({length:x.length},(_,i)=>` #${x.charCodeAt(i)}`).join('')})`;
  if(typeof x==='number'){
    const b=new DataView(new ArrayBuffer(8));b.setFloat64(0,x,false);
    return `(^980013 #${b.getUint32(0,false)} #${b.getUint32(4,false)})`;
  }
  if(Array.isArray(x))return `(^980011${x.map(v=>' '+encode(v)).join('')})`;
  if(typeof x==='object')return `(^980010${Object.entries(x).map(([k,v])=>` (${encode(k)} ${encode(v)})`).join('')})`;
  throw new TypeError('unsupported value');
}
export function decode(text){
  const tokens=text.match(/\(|\)|\^\d+|#\d+|\S+/g)||[];let p=0;
  const take=x=>{if(tokens[p++]!==x)throw new Error('unexpected token');};
  const uint=()=>{const t=tokens[p++];if(!/^#\d+$/.test(t))throw new Error('expected integer');const n=Number(t.slice(1));if(!Number.isSafeInteger(n))throw new Error('integer overflow');return n;};
  function value(){
    take('(');const tag=tokens[p++];let out;
    if(tag==='^980010'){
      out={};while(tokens[p]!==')'){
        take('(');const key=value();if(typeof key!=='string'||Object.hasOwn(out,key))throw new Error('invalid field');
        const v=value();Object.defineProperty(out,key,{value:v,enumerable:true,writable:true,configurable:true});take(')');
      }
    }else if(tag==='^980011'){out=[];while(tokens[p]!==')')out.push(value());}
    else if(tag==='^980012'){const a=[];while(tokens[p]!==')'){const n=uint();if(n>65535)throw new Error('UTF16 range');a.push(String.fromCharCode(n));}out=a.join('');}
    else if(tag==='^980013'){const hi=uint(),lo=uint();if(hi>0xffffffff||lo>0xffffffff)throw new Error('IEEE range');const b=new DataView(new ArrayBuffer(8));b.setUint32(0,hi,false);b.setUint32(4,lo,false);out=b.getFloat64(0,false);}
    else if(tag==='^980014'){const n=uint();if(n>1)throw new Error('boolean range');out=!!n;}
    else if(tag==='^980015')out=null;
    else throw new Error('undeclared tag');
    take(')');return out;
  }
  const out=value();if(p!==tokens.length)throw new Error('trailing input');return out;
}
