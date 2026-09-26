// Author-side source oracle. Never supplied to a cold decoder.
export const controls=[
  ['c01','export function f(a,b){return a-b;}'],
  ['c02','export function f(a,b){return b-a;}'],
  ['c03','export function f(a,b){return a>>>b;}'],
  ['c04','export function f(a,b){return a>>b;}'],
  ['c05','export function f(a,b){return a>=b?1:0;}'],
  ['c06','export function f(a,b){return a>b?1:0;}'],
  ['c07','export function f(a,b){let x=a;function g(x){return x+1;}return g(b)+x;}'],
  ['c08','export function f(a,b){let x=a;function g(y){return x+1;}return g(b)+x;}'],
  ['c09','export function f(a,b){let x=0;if(a&&++x)return x;return x;}'],
  ['c10','export function f(a,b){let x=0;if(a&++x)return x;return x;}'],
  ['c11','export function f(a,b){try{return a;}finally{return b;}}'],
  ['c12','export function f(a,b){try{return b;}finally{return a;}}'],
];
