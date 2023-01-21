use wasm_bindgen::prelude::*;

use miden_assembly::Assembler;
use miden_prover::{prove, ProgramInputs, ProofOptions};

#[wasm_bindgen(getter_with_clone)]
pub struct ProveResult {
    pub outputs: Box<[u64]>,
    pub proof: Box<[u8]>,
    pub code: String,
}

#[wasm_bindgen]
pub fn miden_prove(assembly_code: &str) -> ProveResult {
    console_error_panic_hook::set_once();
    let assembler = Assembler::default();
    //let program = assembler.compile("begin push.3 push.5 add end").unwrap();
    let program = assembler.compile(assembly_code).unwrap();
    let (outputs, proof) = prove(
        &program,
        &ProgramInputs::none(),   // we won't provide any inputs
        &ProofOptions::default(), // we'll be using default options
    )
    .unwrap();
    // println!("Program output: {:?}", outputs.stack_outputs(num_outputs));
    // assert_eq!(vec![8], outputs.stack_outputs(1));
    ProveResult {
        outputs: outputs.stack_outputs(1).to_vec().into_boxed_slice(),
        proof: proof.to_bytes().to_vec().into_boxed_slice(),
        code: assembly_code.to_string(),
    }
}
