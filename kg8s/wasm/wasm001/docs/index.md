
The Hyperledger Fabric SDK for Node.js provides a powerful API to interact with a Hyperledger Fabric blockchain. The SDK is designed to be used in the Node.js JavaScript runtime.


### Overview

Hyperledger Fabric is the operating system of an enterprise-strength permissioned blockchain network. For a high-level overview of the fabric, visit [http://hyperledger-fabric.readthedocs.io/en/latest/](http://hyperledger-fabric.readthedocs.io/en/latest/).

Applications can be developed to interact with the blockchain network on behalf of the users. APIs are available to:
* invoke transactions by calling the chaincode.
* receive events based on new blocks added to the ledger.


### How different components of Hyperledger Fabric work together

The [Transaction Flow](http://hyperledger-fabric.readthedocs.io/en/latest/txflow.html) document provides an excellent description of the application/SDK, peers, and orderers working together to process transactions and produce blocks.

Security is enforced with digital signatures. All requests must be signed by users with appropriate enrollment certificates. For a user's enrollment certificate to be considered valid, it must be signed by a trusted Certificate Authority (CA). Fabric supports any standard CAs. In addition, Fabric provides a CA server. See this [overview](http://hyperledger-fabric-ca.readthedocs.io/en/latest/users-guide.html#overview).
