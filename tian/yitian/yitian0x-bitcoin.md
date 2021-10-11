# YiTian0x Bitcoin

任務

- T1 製作單一個節點的測試鏈、建立錢包並互相發送交易
- T2 製作一個鏈上資料紀錄
- T3 製作一個 3 節點測試鏈

# T1 bitcoin regtest

```sh
docker run -i -w /app --rm dltdojo/yitian:01-dlt <<\EOF
bitcoind -printtoconsole -regtest=1 -fallbackfee=0.00001 & 
sleep 5
bitcoin-cli -regtest -getinfo
bitcoin-cli -regtest createwallet "miner"
bitcoin-cli -regtest createwallet "alice"
bitcoin-cli -regtest createwallet "bob"
MINER=$(bitcoin-cli -regtest -rpcwallet="miner" getnewaddress)
ALICE=$(bitcoin-cli -regtest -rpcwallet="alice" getnewaddress)
BOB=$(bitcoin-cli -regtest -rpcwallet="bob" getnewaddress)
bitcoin-cli -regtest generatetoaddress 110 $MINER
bitcoin-cli -regtest -getinfo
bitcoin-cli -regtest -rpcwallet="miner" getwalletinfo
bitcoin-cli -regtest -rpcwallet="miner" -named sendtoaddress address="$ALICE" amount=2 fee_rate=25
bitcoin-cli -regtest -rpcwallet="miner" -named sendtoaddress address="$BOB" amount=0.5 fee_rate=25
bitcoin-cli -regtest generatetoaddress 5 $MINER
bitcoin-cli -regtest -rpcwallet="alice" getwalletinfo
bitcoin-cli -regtest -rpcwallet="bob" getwalletinfo
EOF
```

- [sendtoaddress — Bitcoin](https://developer.bitcoin.org/reference/rpc/sendtoaddress.html)

# T2 data on chain

- [Learning-Bitcoin-from-the-Command-Line/04_4_Sending_Coins_with_a_Raw_Transaction.md](https://github.com/BlockchainCommons/Learning-Bitcoin-from-the-Command-Line/blob/master/04_4_Sending_Coins_with_a_Raw_Transaction.md)
- [Learning-Bitcoin-from-the-Command-Line/08_2_Sending_a_Transaction_with_Data.md](https://github.com/BlockchainCommons/Learning-Bitcoin-from-the-Command-Line/blob/master/08_2_Sending_a_Transaction_with_Data.md)

# WIP: 3-nodes

```sh
sh or k8s or skaffold ?
```


# WIP: bitcoin p2p

```sh
docker run -it --rm --name foo shark101 termshark -i eth0 -Y bitcoin
docker exec foo curl http://www.apache.org
docker exec foo curl http://www.w3.org
```

- [FreekPaans/bitcoin-multi-node-regtest: Run a multinode bitcoin network in an isolated environment.](https://github.com/FreekPaans/bitcoin-multi-node-regtest)
- [第八章 比特幣網路 · Mastering Bitcoin 2nd Edition - 繁中](https://cypherpunks-core.github.io/bitcoinbook_2nd_zh/%E7%AC%AC%E5%85%AB%E7%AB%A0.html)
- [P2P Network — Bitcoin](https://developer.bitcoin.org/devguide/p2p_network.html)
- [Bitcoins the hard way: Using the raw Bitcoin protocol](http://www.righto.com/2014/02/bitcoins-hard-way-using-raw-bitcoin.html)
- [How to Perform a Nmap Vulnerability Scan using NSE scripts](https://securitytrails.com/blog/nmap-vulnerability-scan)


# WIP: CASE Provably Fair Loot Box

- [Loot box - Wikipedia](https://en.wikipedia.org/wiki/Loot_box)
- [台灣線上遊戲轉蛋法推動- 提點子 -公共政策網路參與平臺](
https://join.gov.tw/idea/detail/ee5dd8b8-bdeb-4d5e-8315-bb0601169d68)
- [Satoshi Dice - Bitcoin Wiki](https://en.bitcoin.it/wiki/Satoshi_Dice)


# 其它

TODO

- How Bitcoin and Ethereum solved the Halting Problem differently | by infernal_toast | Medium
https://infernaltoast.medium.com/how-bitcoin-and-ethereum-solved-the-halting-problem-differently-cffbb4e3045c