export function freezeGridThenReplay(grid,prepare,replay){
  function freeze(value){
    if(value&&typeof value==='object'){
      for(const child of Object.values(value))freeze(child);
      Object.freeze(value);
    }
    return value;
  }
  // No replay callback is reachable until every preparation succeeds.
  const prepared=Object.freeze(grid.map(candidate=>freeze(prepare(candidate))));
  return prepared.map(replay);
}
