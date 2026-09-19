// Offline/cold qualification only. Never import into recursive execution.
// Exact content, not this sampling hash or any pool-local ID, owns equality.
export function classHash(pool,id) {
  if (id===-1) return 0x7f4a7c15;
  let h=2166136261;
  for(let w=0;w<20;w++) h=Math.imul(h^pool.wordAt(id,w),16777619);
  return h>>>0;
}
export function sampleHash(a,b,support) {
  return (Math.imul(a^support,16777619)^Math.imul(b,2246822519))>>>0;
}
function content(pool,id) {
  if(id===-1)return 'terminal';
  let result='';
  for(let w=0;w<20;w++)result+=pool.wordAt(id,w).toString(16).padStart(8,'0');
  return result;
}
export function portableKey(pool,p0,p1,support) {
  return support+'/'+content(pool,p0)+'/'+content(pool,p1);
}
