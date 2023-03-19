---
apiVersion: dryrun.cd23.dltdojo/v1alpha1
kind: Solidity
metadata:
  name: give me a NFT token contract named MyBar201
spec:
  symbol: MBR
  type: 
    - burnable
---

```solidity
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
contract MyBar201 is ERC721, ERC721Burnable {
    constructor() ERC721("MyBar201", "MBR") {}
}
```