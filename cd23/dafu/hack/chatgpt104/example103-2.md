---
apiVersion: dryrun.cd23.dltdojo/v1alpha1
kind: Solidity
metadata:
  name: Create a NFT contract named MyFoo101
spec:
  symbol: FAR
  type: 
    - mintable
---

```solidity
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract MyFoo101 is ERC721, Ownable {
    constructor() ERC721("MyFoo101", "FAR") {}
    function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
```