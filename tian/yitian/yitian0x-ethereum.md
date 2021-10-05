# YiTian0x Ethereum

任務

- 建立一個立即可用的環境
- curl jsonrpc 部署一個 ERC20 合約
- curl jsonrpc 部署一個 NFT 合約
- CASE 2021-09-ethjs


```sh
cat <<\EOF | DOCKER_BUILDKIT=1  docker build -t eth-now -
# syntax=docker/dockerfile:1.3-labs
FROM docker.io/node:16.10-bullseye-slim
WORKDIR /usr/app
RUN <<\CORE
apt-get update && apt-get install -y openssl curl jq
SOLC_VER="v0.8.9"
curl -s -f -L "https://github.com/ethereum/solidity/releases/download/${SOLC_VER}/solc-static-linux" -o /usr/bin/solc
chmod +x /usr/bin/solc
npm --global config set user root
npm install ganache-cli --global
npm init -y
npm install --save @openzeppelin/contracts
CORE
EOF
```

jsonrpc 部署一個 NFT 合約

```sh
docker run -i --rm -w /usr/app eth-now /bin/bash <<\EOF
solc --version
ganache-cli --version
cat <<\CORE > nft.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyCollectible is ERC721 {
    constructor() ERC721("MyCollectible", "MCO") {
    }
}
CORE
#
solc @openzeppelin/=$(pwd)/node_modules/@openzeppelin/ --optimize --bin --abi -o bin nft.sol
ls -al bin
BYTECODE=$(cat bin/MyCollectible.bin)
echo $BYTECODE
#
ganache-cli --mnemonic "horn hammer original lemon chapter weird gun pond fortune blush cupboard cat" &
# account list
# (0) 0x5fe9dD4c80ab7742B62Fb40CE1fBE37D226645A1 (100 ETH)
# (1) 0xfB3Ce1611272f443B406BcE2e2dd1eEA85Ad340E (100 ETH)
sleep 5
ADDR1=0x5fe9dD4c80ab7742B62Fb40CE1fBE37D226645A1
curl -ivL -H "Content-Type: application/json" -X POST -d '{"jsonrpc":"2.0","method":"eth_coinbase", "id":1}' http://localhost:8545

printf -v GETBALANCE '{"jsonrpc":"2.0","method":"eth_getBalance", "params": ["%s", "latest"], "id":2}' $ADDR1
printf -v UNLOCKACC '{"jsonrpc":"2.0","method":"personal_unlockAccount", "params":["%s", "%s", 300], "id":3}' $ADDR1 ANYPASSWORD
printf -v DEPLOY '{"jsonrpc":"2.0","method":"eth_sendTransaction", "params": [{"from": "%s", "data": "0x%s", "gas": "0x20ce23"}], "id":4}' $ADDR1 $BYTECODE
curl -isv -H "Content-Type: application/json" -X POST -d "$GETBALANCE" http://localhost:8545
echo
curl -isv -H "Content-Type: application/json" -X POST -d "$UNLOCKACC" http://localhost:8545
echo
echo $DEPLOY
TransactionHash=$(curl -s -H "Content-Type: application/json" -X POST -d "$DEPLOY" http://localhost:8545 | jq -r .result )
echo $TransactionHash
printf -v TXREC '{"jsonrpc":"2.0","method":"eth_getTransactionReceipt", "params": ["%s"], "id":10}' $TransactionHash
curl -s -H "Content-Type: application/json" -X POST -d "$TXREC" http://localhost:8545 | jq .
EOF
```

- [使用编译器 — Solidity develop 文档](https://solidity-cn.readthedocs.io/zh/stable/using-the-compiler.html)
- [Installing the Solidity Compiler — Solidity 0.8.10 documentation](https://docs.soliditylang.org/en/latest/installing-solidity.html#static-binaries)
- [Create a new contract by JSON-RPC of cpp-ethereum - Ethereum Stack Exchange](https://ethereum.stackexchange.com/questions/6870/create-a-new-contract-by-json-rpc-of-cpp-ethereum)
- [solidity - Solc Compiler : File import callback not supported - Ethereum Stack Exchange](https://ethereum.stackexchange.com/questions/103975/solc-compiler-file-import-callback-not-supported)
- [Compiling and deploying an Ethereum Smart Contract, using solc and web3. ](https://gist.github.com/tomconte/4edb83cf505f1e7faf172b9252fff9bf)
- [trufflesuite/ganache: A tool for creating a local blockchain for fast Ethereum development.](https://github.com/trufflesuite/ganache)



# CASE 2021-09-ethjs

```sh
docker run -i --rm docker.io/node:16.10-alpine3.12 /bin/sh <<\EOF
mkdir -p /opt/app && cd /opt/app
npm init -y && npm install --save ethjs-util@0.1.4
cat <<\CORE > main.js
const util = require('ethjs-util');
[33974229950.550003 ,33974229950.55003, 33974229950.5503 , 33974229950.5, 33974229950].forEach(e => {
  console.log(`intToBuffer(${e})=`);
  console.log(util.intToBuffer(e));
});
CORE
node main.js 
EOF

docker run -i --rm -w /app docker.io/buildkite/puppeteer:10.0.0 /bin/sh <<\EOF
npm init -y && npm install --save ethjs-util@0.1.4
cat <<\CORE > server.js
const http = require('http');
const html = `
<HTML>
<HEAD>
<TITLE>DLTDOJO-CD</TITLE>
<script type="text/javascript" 
  src="https://cdn.jsdelivr.net/npm/ethjs-util@0.1.4/dist/ethjs-util.min.js"></script>
</HEAD>
<BODY>
<H2 id="result">TEST</H2>
<script>
function toHexString(byteArray) {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}
document.getElementById("result").innerHTML = "intToBuffer(33974229950.550003)=" 
  + toHexString(ethUtil.intToBuffer(33974229950.550003));
</script>
</BODY>
</HTML>
`;

function start_server() {
  const server = http.createServer();
  server.on('request', (req, res) => {
    if (req.url == '/test.html') {
            res.write(html);
            res.end();
        } else {
            res.end('Invalid Request!');
        }
    });
    server.listen(8080);
}
start_server();
CORE
cat <<\CORE > test.js
const util = require('ethjs-util');
const puppeteer = require('puppeteer');

function node_test() {
  [33974229950.550003 ,33974229950.55003, 33974229950.5503 , 33974229950.5, 33974229950].forEach(e => {
    console.log(`intToBuffer(${e})=`);
    console.log(util.intToBuffer(e));
  });
}

node_test();

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:8080/test.html", {waitUntil: 'networkidle0'});
  const html = await page.content(); // serialized HTML of page DOM.
  console.log(html);
  await browser.close();
})();
CORE
node --version
node server.js &
sleep 3
node test.js
EOF
```

下面測試結果可看出 nodejs 與 puppeteer headless chrome 都用 V8 但有差異，不確定是否版本差異，至於 Firefox 的 SpiderMonkey 或是 Safari 的 JavaScriptCore 以及各式各樣手機瀏覽器內的 JavaScript Engine 是否類似還要實際開瀏覽器來比對。

```
v14.16.0
intToBuffer(33974229950.550003)=
<Buffer 7e 90 59 bb>
intToBuffer(33974229950.55003)=
<Buffer 07 e9 05 9b be>
intToBuffer(33974229950.5503)=
<Buffer 07 e9 05 9b be>
intToBuffer(33974229950.5)=
<Buffer 07 e9 05 9b be>
intToBuffer(33974229950)=
<Buffer 07 e9 05 9b be>

...
<h2 id="result">intToBuffer(33974229950.550003)=7e9059bb0e8ccd</h2>
```

- [Passing decimal values to FeeMarketEIP1559Transaction generates invalid output silently · Issue #1497 · ethereumjs/ethereumjs-monorepo](https://github.com/ethereumjs/ethereumjs-monorepo/issues/1497)
- [ethjs/ethjs-util: A simple set of Ethereum JS utilities such toBuffer and isHexPrefixed.](https://github.com/ethjs/ethjs-util)
- [The V8 JavaScript Engine](https://nodejs.dev/learn/the-v8-javascript-engine)
- [Ethereum Transaction Hash (Txhash) Details | Etherscan](https://etherscan.io/tx/0x2c9931793876db33b1a9aad123ad4921dfb9cd5e59dbb78ce78f277759587115)
- [天價手續費分析：Bitfinex「2,300萬鎂ETH」Gas費案例背後原因解析 | 動區動趨-最具影響力的區塊鏈媒體 (比特幣, 加密貨幣)](https://www.blocktempo.com/analysis-of-sky-high-transaction-fees-bitfinex-23-million-eth-gas-fee/)


利用 cypress 測試 chrome 與 firefox，這次只測試前端，cypress 有個本地端靜態 HTTP 服務。

```sh
# NOTE: cypress/included image size > 1GB 
docker pull cypress/included:8.5.0
docker run -i -w /app --entrypoint=/bin/bash docker.io/cypress/included:8.5.0 <<\EOF
cat <<\CORE > ethjs-util.html
<HTML><HEAD><TITLE>DLTDOJO-CD</TITLE>
<script type="text/javascript" 
  src="https://cdn.jsdelivr.net/npm/ethjs-util@0.1.4/dist/ethjs-util.min.js"></script>
</HEAD>
<BODY><P>intToBuffer(33974229950.550003)=<span id="result">0</span></P>
<script>
function toHexString(byteArray) {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}
document.getElementById("result").innerHTML = toHexString(ethUtil.intToBuffer(33974229950.550003));
</script>
</BODY>
</HTML>
CORE
cat <<\CORE > cypress.json
{ "video": false , "screenshotOnRunFailure": false, "pluginsFile": false, "supportFile": false }
CORE
mkdir -p /app/cypress/integration
cat <<\CORE > /app/cypress/integration/ethjs_spec.js
// Cypress will automatically attempt to serve your files 
// if you don't provide a host and baseUrl is not defined. 
describe('ethjs.util Test', () => {
  it('Visits the ethjs test page', () => {
    cy.visit('ethjs-util.html')
    cy.get('#result').should(($r) => {
        const text = $r.text()
        expect(text).to.equal('07e9059bbe')
    })
  })
})
CORE

node --version
cypress info
cypress run --browser firefox
cypress run --browser chrome
EOF
```

兩種瀏覽器執行結果一樣

```
  1) ethjs.util Test
       Visits the ethjs test page:

      Timed out retrying after 4000ms
      + expected - actual

      -'7e9059bb0e8ccd'
      +'07e9059bbe'
```

- [Run Cypress with a single Docker command](https://www.cypress.io/blog/2019/05/02/run-cypress-with-a-single-docker-command/)
- [visit | Cypress Documentation](https://docs.cypress.io/api/commands/visit#Syntax)
- [End-to-End Testing Web Apps: The Painless Way · mtlynch.io](https://mtlynch.io/painless-web-app-testing/)
- [cypress-io/cypress-docker-images: Docker images with Cypress dependencies and browsers](https://github.com/cypress-io/cypress-docker-images)

如果只測靜態網頁可省掉上述 server.js 的啟動，不過如果要一起送到前端測試還是寫 server.js 來跑。

```sh
docker run -i -w /app --entrypoint=/bin/bash docker.io/cypress/included:8.5.0 <<\EOF
npm init -y && npm install --save ethjs-util@0.1.4
cat <<\CORE > server.js
const http = require('http');
const util = require('ethjs-util');
const html = `
<HTML><HEAD><TITLE>DLTDOJO-CD</TITLE>
<script type="text/javascript" 
  src="https://cdn.jsdelivr.net/npm/ethjs-util@0.1.4/dist/ethjs-util.min.js"></script>
</HEAD>
<BODY>
<P>ethUtil.intToBuffer(33974229950.550003)=<span id="be-result">_TPL_RESULT_</span></P>
<P>ethUtil.intToBuffer(33974229950.550003)=<span id="fe-result">0</span></P>
<script>
function toHexString(byteArray) {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}
document.getElementById("fe-result").innerHTML = toHexString(ethUtil.intToBuffer(33974229950.550003));
</script>
</BODY>
</HTML>`;

function start_server() {
  const server = http.createServer();
  server.on('request', (req, res) => {
    if (req.url == '/test.html') {
      const nodejsResult = util.intToBuffer(33974229950.550003).toString('hex');
      res.write(html.replace('_TPL_RESULT_',nodejsResult));
      res.end();
    } else {
      res.end('Invalid Request!');
    }
  });
  server.listen(8080);
}
start_server();
CORE

cat <<\CORE > cypress.json
{ "video": false , "screenshotOnRunFailure": false, "pluginsFile": false, "supportFile": false }
CORE
mkdir -p /app/cypress/integration
cat <<\CORE > /app/cypress/integration/ethjs_spec.js
describe('ethjs.util test', () => {
  before(() => {
    cy.visit('http://localhost:8080/test.html')
  });
  it('[BackEnd] test ethjs.util.intToBuffer', () => {
    cy.get('#be-result').should('have.text', '07e9059bbe');
  })
  it('[FrontEnd] test ethjs.util.intToBuffer', () => {
    cy.get('#fe-result').should(($r) => {
        expect($r.text()).to.equal('07e9059bbe')
    })
  })
})
CORE

node --version
node server.js &
sleep 3
cypress info
cypress run --browser firefox
cypress run --browser chrome
EOF
```

兩個結果一樣，摘錄 chrome 部份測試結果。

```
 1) ethjs.util test
       [BackEnd] test ethjs.util.intToBuffer:

      Timed out retrying after 4000ms
      + expected - actual

      -'7e9059bb'
      +'07e9059bbe'
      
      at Context.eval (http://localhost:8080/__cypress/tests?p=cypress/integration/ethjs_spec.js:104:26)

  2) ethjs.util test
       [FrontEnd] test ethjs.util.intToBuffer:

      Timed out retrying after 4000ms
      + expected - actual

      -'7e9059bb0e8ccd'
      +'07e9059bbe'
      
      at Context.eval (http://localhost:8080/__cypress/tests?p=cypress/integration/ethjs_spec.js:108:28)

```

# TODO

# Gas Fee 狀態機轉移

兩種調整模式差異

- [Ethereum Virtual Machine (EVM) | ethereum.org](https://ethereum.org/en/developers/docs/evm/)
- [Ethereum Virtual Machine Opcodes](https://www.ethervm.io/)
- [Istanbul Network Upgrade Specification](https://github.com/ethereum/execution-specs/blob/82b1ba358cb231b6d70144321874fe4b6079d625/network-upgrades/mainnet-upgrades/istanbul.md)
  - [Eip 1884 v3 (#19743) · ethereum/go-ethereum@3e993ff](https://github.com/ethereum/go-ethereum/commit/3e993ff64a9c2e9651fae11aaee55032cd6b0c3e)
  - [[PAN-2989] EIP-1884 - Repricing for trie-size-dependent opcodes (#1795) · hyperledger/besu@c4e7dcb](https://github.com/hyperledger/besu/commit/c4e7dcbe80b09f9ac060fd315d114662a2b1782b)
- [Berlin Network Upgrade Specification](https://github.com/ethereum/execution-specs/blob/82b1ba358cb231b6d70144321874fe4b6079d625/network-upgrades/mainnet-upgrades/berlin.md)
  - [EIP-2929: Gas cost increases for state access opcodes](https://eips.ethereum.org/EIPS/eip-2929)
  - [all: implement EIP-2929 (gas cost increases for state access opcodes)… · ethereum/go-ethereum@6487c00](https://github.com/ethereum/go-ethereum/commit/6487c002f6b47e08cb9814f16712c6789b313a97)
  - [Implementation of EIP-2929 (#1387) · hyperledger/besu@0f69337](https://github.com/hyperledger/besu/commit/0f69337944f78f240eb9cb3d603e253a5fcd8403)



# Compound

Compound test ?

- [Fix COMP distribution bug by TylerEther · Pull Request #165 · compound-finance/compound-protocol](https://github.com/compound-finance/compound-protocol/pull/165)