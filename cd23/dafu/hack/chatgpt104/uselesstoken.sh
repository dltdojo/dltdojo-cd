#!/bin/sh
#
# https://etherscan.io/address/0x27f706edde3aD952EF647Dd67E24e38CD0803DD6#code
pushd chatgpt230313
echo -e "\n# explain script $(date)\n" >> ../uselesstoken.md
cat ../uselesstoken.sh | deno run -A app.ts chatgpt -r code -m 'explain the following shell script:' -i >> ../uselesstoken.md
echo -e "\n# explain contract $(date)\n" >> ../uselesstoken.md
cat ../uselesstoken.sol | deno run -A app.ts chatgpt -r code -m 'Help me explain the following solidity contract:' -i >> ../uselesstoken.md
echo -e "\n# review contract $(date)\n" >> ../uselesstoken.md
cat ../uselesstoken.sol | deno run -A app.ts chatgpt -r code -m 'Help me review the following solidity contract and let me known if there are any security vulnderabilities?:' -i >> ../uselesstoken.md
popd