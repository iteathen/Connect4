import {readFileSync} from 'node:fs';
import {prepareConnect4RbaGeometry,runLazySmpConnect4Rba32} from './isomax/index.mjs';
const prepareOnly=process.argv.slice(2).length===1&&process.argv[2]==='--prepare-only';
if(process.argv.length!==2&&!prepareOnly)throw Error('only --prepare-only accepted');
const profile=JSON.parse(readFileSync(new URL('./isomax/profile.json',import.meta.url)));
if(profile.geometry.columns!==7||profile.geometry.rows!==6||profile.options.workers!==4)throw Error('frozen profile mismatch');
const geometry=prepareConnect4RbaGeometry(profile.geometry),moves=[];
const ready={event:'ready',solver:'isomax',start:'empty',ply:0,prepare_only:prepareOnly,workers:4,
  rlc_enabled:false,opening_book_loaded:false,persisted_cache_loaded:false,
  tt_initial_occupied:0,tt_evidence:'fresh zero-filled allocation in host/workers when invoked; not an occupancy measurement',
  node:process.version,v8:process.versions.v8,profile};
console.error(JSON.stringify(ready));
if(prepareOnly){console.log(JSON.stringify(ready));}else{
  const trace=[];
  console.error(JSON.stringify({event:'handoff',moves,trace,search_calls:1,rlc_enabled:false}));
  console.error(JSON.stringify({event:'search_start'}));
  const result=await runLazySmpConnect4Rba32(moves,{geometry,...profile.options});
  console.log(JSON.stringify({event:'result',solver:'isomax',status:result.status,wdl:result.rootWdl,
    target:'exact WDL of empty 7x6 root',rlc_enabled:false,computed_moves:moves,trace,result}));
  if(result.status!=='EXACT')process.exitCode=1;
}
