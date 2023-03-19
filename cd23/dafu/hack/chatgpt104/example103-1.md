---
apiVersion: dryrun.cd23.dltdojo/v1alpha1
kind: Solidity
metadata:
  name: Create a NFT token contract named MyCollectible
spec:
  symbol: MC0
---

```solidity
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract MyCollectible is ERC721 {
    constructor() ERC721("MyCollectible", "MCO") {
    }
}
```