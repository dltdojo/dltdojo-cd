how to run test

- https://github.com/ruimarinho/docker-bitcoin-core/issues/24

```sh
docker compose -f - up <<\EOOF
version: "3.8"
services:
  bitcoin-srv:
    image: docker.io/ruimarinho/bitcoin-core:23
    #
    # https://github.com/ruimarinho/docker-bitcoin-core/issues/24
    #
    command: 
      - /bin/sh
      - -c 
      - |
        hostname -i
        echo $(hostname -i)/16
        bitcoin-cli --version
        # bitcoind -regtest -daemon
        bitcoind -printtoconsole -regtest -daemon -rpcport=18444 -rpcbind=0.0.0.0 -rpcallowip=$(hostname -i)/16 -rpcauth='foo:7d9ba5ae63c3d4dc30583ff4fe65a67e$9e3634e81c11659e3de036d0bf88f89cd169c1039e6e09607562d54765c649cc'
        sleep 3
        bitcoin-cli -regtest -rpcport=18444 -rpcuser=foo -rpcpassword="qDDZdeQ5vw9XXFeVnXT4PZ--tGN2xNjjR4nrtyszZx0=" getnetworkinfo
        sleep 300
    ports:
      - "18444:18444"
  bitcoin-cli:
    image: docker.io/ruimarinho/bitcoin-core:23
    command: 
      - /bin/sh
      - -c 
      - |
        alias bcli='bitcoin-cli -regtest -rpcport=18444 -rpcconnect=bitcoin-srv -rpcuser=foo -rpcpassword="qDDZdeQ5vw9XXFeVnXT4PZ--tGN2xNjjR4nrtyszZx0="'
        sleep 5
        bcli createwallet wallet101
        sleep 2
        bcli generatetoaddress 101 $(bcli getnewaddress)
        sleep 2
        # https://developer.bitcoin.org/reference/rpc/getbalance.html
        bcli getbalance "*" 6
        bcli getwalletinfo
  curl:
    image: curlimages/curl:7.86.0
    command:
      - /bin/sh
      - -c
      - |
        sleep 15
        curl -sv --user foo:qDDZdeQ5vw9XXFeVnXT4PZ--tGN2xNjjR4nrtyszZx0= \
          --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getbalance", "params": ["*", 6]}' \
          -H 'content-type: text/plain;' \
          http://bitcoin-srv:18444/
  deno:
    image: denoland/deno:1.27.0
    entrypoint: sh
    command:
      - -c
      - |
        sleep 20
        deno run --allow-net - <<\EOF
        export type JsonRpcRequest = { id: string; method: string; params: unknown[] }
        export type JsonRpcResponse = { id: string; result: unknown; error: unknown }
        const jsonrpc = async (url: string, v: JsonRpcRequest) : Promise<JsonRpcResponse> => {
            const data = { jsonrpc: '1.0', ...v };
            const body = JSON.stringify(data);
            const postOpt = {
                method: 'POST', body,
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            }
            const result = await fetch(url, postOpt).then((res) => {
                return res.json();
            });
            return result;
        }
        const url = "http://foo:qDDZdeQ5vw9XXFeVnXT4PZ--tGN2xNjjR4nrtyszZx0=@localhost:18444/";
        const req = {
            id: Math.floor(Math.random() * 10000).toString(),
            method: 'getbalance',
            params: ["*", 6]
        }
        const x = await jsonrpc(url, req);
        console.log(x.result);
        EOF
EOOF
```