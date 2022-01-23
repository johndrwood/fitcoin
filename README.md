# Fitcoin Hackathon

Functionality below is based on the [XRP Ledger JS tutorial](https://xrpl.org/get-started-using-javascript.html) and the [xrpl JS api](https://js.xrpl.org/).

## Setup

1. Clone the repo with `git@github.com:johndrwood/fitcoin.git`
1. `cd fitcoin`
1. Install the npm packages `npm install`
1. Start up the NodeJS REPL `node`
1. Load the code into the REPL:
	1. `.load app.js` for all of the ledger functionality
	1. `.load ws.js` to listen for wallet activity using WebSockets
	1. `.load sc.js` to be able to set conditions for smart contracts

## NodeJS REPL API

The following are some methods that can be run in a NodeJS REPL to perform various actions on the XRP Ledger. Node v14.16.1 was used.

### connect
Connect to the XRP Ledger Testnet at `wss://s.altnet.rippletest.net:51233`.
```
connect()
```

### disconnect
Close the connection.
```
disconnect()
```

### createAndFundWallet
Creates a new wallet and funds it with 1000 XRP.

This is an asynchronous request and so it returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). This means the promise's `then` method needs to be used to access the wallet object in the repsonse.
```
let wallet
createAndFundWallet().then(response => wallet = response)
```

### getBalance
Get the XRP balance of a referenced wallet.

#### Parameters
- wallet
  - Either a `String` representing the wallet's `classicAddress` or a [Wallet object](https://js.xrpl.org/classes/Wallet.html).

```
getBalance("abcdefghijklABCDEFGHIJKL1234567890")
getBalance(wallet)
```

### sendFunds
Send funds to another wallet. Can optionally be sent as a check or as a custom token.

#### Parameters
- sendingWallet
  - The sending wallet's address or wallet object.
- amount
  - `String` for the number of tokens to send. Sent in "drops" of XRP, where 1,000,000 drops equals 1 XRP.
- receivingWallet
  - The receiving wallet's address or wallet object.
- asCheck _optional_
  - `Boolean` indicating if transaction is a check. Defaults to `false`.
- currency _optional_
  - `String` representing an alternate token currency. Defaults to `null` which sends as XRP.
- issuingWallet _optional_
  - The wallet address or wallet object for the issung wallet of the alternate token. Defaults to `null`.

```
sendFunds(sendingWallet, "50000", receivingWallet)
sendFunds(sendingWallet, "50000", receivingWallet, true)
sendFunds(sendingWallet, "50000", receivingWallet, false, "FIT", issuingWallet)
```

### cashCheck
Accept payment sent as a check. Can be accepted for any amount up to the max amount of the transaction.

#### Parameters
- wallet
  - The wallet address or wallet object of the accepting wallet.
- amount
  - `String` representing the amount to be accepted.
- transactionHash
  - `String` of the transaction hash in which the check was sent
