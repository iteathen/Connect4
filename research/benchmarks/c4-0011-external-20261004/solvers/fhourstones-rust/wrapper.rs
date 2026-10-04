#[path = "upstream/src/board.rs"] mod board;
#[path = "upstream/src/search.rs"] mod search;
#[path = "upstream/src/tt.rs"] mod tt;

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let prepare_only = args.as_slice() == ["--prepare-only"];
    assert!(args.is_empty() || prepare_only, "only --prepare-only is accepted");
    let mut board = board::Board::new();
    let mut solver = search::Solver::new(8_306_069);
    solver.tt.clear();
    assert_eq!(board.nplies, 0);
    assert_eq!(board.color, [0, 0]);
    assert_eq!(solver.nodes, 0);
    assert_eq!(solver.tt.posed, 0);
    assert!(solver.tt.stats().is_none());
    let ready = format!("{{\"event\":\"ready\",\"solver\":\"fhourstones-rust\",\"start\":\"empty\",\"ply\":0,\"workers\":1,\"tt_entries\":{},\"tt_bytes\":{},\"tt_initial_occupied\":0,\"opening_book_loaded\":false,\"persisted_cache_loaded\":false,\"prepare_only\":{}}}", solver.tt.len(), solver.tt.len()*8, prepare_only);
    eprintln!("{}", ready);
    if prepare_only { println!("{}", ready); return; }
    eprintln!("{{\"event\":\"search_start\"}}");
    let (score, nodes, ms) = solver.solve(&mut board);
    let wdl = match score { tt::LOSS => -1, tt::DRAW => 0, tt::WIN => 1, _ => panic!("non-exact score") };
    assert_eq!(board.nplies, 0);
    assert_eq!(board.color, [0, 0]);
    let posed = solver.tt.posed;
    drop(solver);
    println!("{{\"event\":\"result\",\"solver\":\"fhourstones-rust\",\"status\":\"EXACT\",\"wdl\":{},\"native_score\":{},\"nodes\":{},\"tt_store_calls\":{},\"native_search_ms_minimum_one\":{}}}", wdl, score, nodes, posed, ms);
}
