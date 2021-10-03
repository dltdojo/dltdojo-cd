# OpenPGP

- [GnuPG - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/GnuPG)
- [Using GPG to Encrypt Your Data - HECC Knowledge Base](https://www.nas.nasa.gov/hecc/support/kb/using-gpg-to-encrypt-your-data_242.html)
- [The GNU Privacy Handbook](https://www.gnupg.org/gph/en/manual/book1.html)
- [Sequoia-PGP](https://sequoia-pgp.org/)
- [GPG Encryption Guide - Part 1 | Tutonics](https://tutonics.com/2012/11/gpg-encryption-guide-part-1.html)
- [GPG Encryption Guide - Part 2 (Asymmetric Encryption) | Tutonics](https://tutonics.com/2012/11/gpg-encryption-guide-part-2-asymmetric.html)
- [How to hash and sign files with GPG and a bit of Bash | Stardust | Starbeamrainbowlabs](https://starbeamrainbowlabs.com/blog/article.php?article=posts/405-hash-sign-files.html)
- [Testing GPG Keys With Docker... and fail - iMil.net](https://imil.net/blog/posts/2020/testing-gpg-keys-with-docker/)

```
FROM alpine:latest
LABEL maintainer "iMil"

ENV GPG_TTY /dev/console
# Install packages
RUN apk --no-cache add gnupg bash

CMD ["/bin/bash"]
```

# ETH Metamask

- E2E testing for dApps using Puppeteer + MetaMask [decentraland/dappeteer: 🏌🏼‍E2E testing for dApps using Puppeteer + MetaMask](https://github.com/decentraland/dappeteer)
- Using Puppeteer in order to perform actions on the Metamask pop up. [immutable/MM-puppeteer](https://github.com/immutable/MM-puppeteer)


# compound finance

- [Compound - Github](https://github.com/compound-finance)
- [Fix COMP distribution bug by TylerEther · Pull Request #165 · compound-finance/compound-protocol](https://github.com/compound-finance/compound-protocol/pull/165)
- [compound-protocol/spec/scenario at master · compound-finance/compound-protocol](https://github.com/compound-finance/compound-protocol/tree/master/spec/scenario)
- [compound-protocol/Scenario.js at master · compound-finance/compound-protocol](https://github.com/compound-finance/compound-protocol/blob/master/tests/Scenario.js)

> The Compound Protocol has a simple scenario evaluation tool to test and evaluate scenarios which could occur on the blockchain. This is primarily used for constructing high-level integration tests. The tool also has a REPL to interact with local the Compound Protocol (similar to truffle console).