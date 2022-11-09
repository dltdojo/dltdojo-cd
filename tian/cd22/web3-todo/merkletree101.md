Proof Of Reserves Audit | Full Reserves | Kraken https://www.kraken.com/proof-of-reserves

```sh
docker run -i --init busybox <<\EOF
ACCOUNT_CODE="8dc20f34da8cea8dd0f46b001694f5123ecd30d786c5eb92ad1a013703a4f8d1"
IIBAN="AB12C34DEFG5KSQI"
AUDIT_ID="PR30JUN22"
RECORD_ID=$(echo -n "${ACCOUNT_CODE}${IIBAN}${AUDIT_ID}" | sha256sum | head -c 64)
BALANCES="BTC:0.2600852178,全家桶.雞腿:1.5,全家桶.雞翅:2.5,ETH:5.275,ETH2.S:10.13,USDC:50.0"
MERKLE_HASH="${RECORD_ID},${BALANCES}"
HASH_RESULT=$(echo -n ${MERKLE_HASH} | sha256sum | head -c 64)

echo "Record ID: ${RECORD_ID}"
echo "Merkle Hash: ${MERKLE_HASH}"
echo "SHA Result: ${HASH_RESULT}"
echo "Merkle Leaf: $(echo -n ${HASH_RESULT} | head -c 16)"
EOF
```

merkletrees

```js
import { MerkleTree, Helper } from "https://deno.land/x/merkletrees/mod.ts"
import chai from "https://esm.sh/chai@4.3.6";
chai.config.truncateThreshold = 0;
const exampleArray = ["monkey", "ant", "fish", "tiger", "dog", "horse", "cow", "chicken"]
const merkleTree = new MerkleTree(exampleArray)
const investigatedEntry = "dog"
const indexEntry = exampleArray.indexOf(investigatedEntry);
chai.assert.equal(indexEntry, 4);
const proofElements = merkleTree.getProofElements(indexEntry)
chai.assert.deepEqual(proofElements,
    ['fd62862b6dc213bee77c2badd6311528253c6cb3107e03c16051aa15584eca1c',
        'a12b2f7a5ddb20963c22654f6b22a6955c9956a20c76a0e8f169a437aafb4c98',
        'e9d73a36d1d0625f59ff3cfbc8722e5821d0490890727a6198e891af1d55bf00'])

const investigatedEntryHashed = Helper.sha256(investigatedEntry)
chai.assert.equal(investigatedEntryHashed, "cd6357efdd966de8c0cb2f876cc89ec74ce35f0968e11743987084bd42fb8944")
const rootHash = merkleTree.getRootHash()
chai.assert.equal(rootHash, "189aaa2268731fee116df2ceb2bb9bb55314449c4101539412bf68b806289733")
const isValid = merkleTree.verify(proofElements, investigatedEntryHashed, rootHash, indexEntry)
chai.assert(isValid);
chai.assert.equal("valid: that dog is in the array at index: 4", `valid: that ${investigatedEntry} is in the array at index: ${indexEntry}`); 
type MerkleProof = {
    proofElements: string[],
    rootHash: string,
    indexEntry: number
}
const isElementValid = (target: string, pi: MerkleProof) => {
    const entryHashed = Helper.sha256(target)
    chai.assert.equal(entryHashed, "cd6357efdd966de8c0cb2f876cc89ec74ce35f0968e11743987084bd42fb8944")
    return merkleTree.verify(pi.proofElements, entryHashed, pi.rootHash, pi.indexEntry)
}
chai.assert(isElementValid("dog",{proofElements, rootHash, indexEntry}))
```