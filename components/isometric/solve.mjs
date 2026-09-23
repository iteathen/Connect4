import {fromMoves7x6} from './rba/ingress.mjs';
import {IsoMaxBranchManager} from './execution/branch-manager.mjs';

// COLD public solver ingress. The only external state format is legal replay.
export async function solve7x6(moves,{workers=1,capacity=4096,buckets=4096,
  timeoutMs=120000,signal,boundaryDepth=2,boundaryCapacity=256,
  boundaryBudget=100000}={}){
  const root=fromMoves7x6(moves);
  const manager=new IsoMaxBranchManager({workers,capacity,buckets,timeoutMs,
    kernelURL:new URL('./rba/kernel.mjs',import.meta.url).href,
    kernelData:{boundaryDepth,boundaryCapacity,boundaryBudget}});
  return manager.run(root.words,{reflected:!!root.reflected,signal});
}
