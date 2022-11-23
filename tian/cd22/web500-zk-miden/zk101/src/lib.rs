use wasm_bindgen::prelude::*;

use miden_assembly::Assembler;
use miden_prover::{prove, ProgramInputs, ProofOptions};

#[wasm_bindgen]
pub struct ProveResult {
    outputs: Box<[u64]>,
    proof: Box<[u8]>,
}

#[wasm_bindgen]
pub fn miden_prove() -> u32 {
    // instantiate the assembler
    let assembler = Assembler::default();

    // "begin push.3 push.5 add end"
    // this is our program, we compile it from assembly code
    let program = assembler.compile("begin push.3 push.5 add end").unwrap();

    // let's execute it and generate a STARK proof
    let (outputs, proof) = prove(
        &program,
        &ProgramInputs::none(),   // we won't provide any inputs
        1,                        // we'll return one item from the stack
        &ProofOptions::default(), // we'll be using default options
    )
    .unwrap();
    // assert_eq!(vec![8], outputs);
    // ProveResult { outputs: outputs.to_vec().into_boxed_slice(), proof: proof.to_bytes().to_vec().into_boxed_slice() }
    0
}
