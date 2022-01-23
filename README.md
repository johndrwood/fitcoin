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

----
### connect
Connect to the XRP Ledger Testnet at `wss://s.altnet.rippletest.net:51233`.
```
connect()
```
---

### disconnect
Close the connection.
```
disconnect()
```
---

### createAndFundWallet
Creates a new wallet and funds it with 1000 XRP.

This is an asynchronous request and so it returns a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). This means the promise's `then` method needs to be used to access the wallet object in the repsonse.
```
let wallet
createAndFundWallet().then(response => wallet = response)
```
---

### checkBalance
Check the XRP balance of a wallet.

#### Parameters
- wallet
  - Either a `String` representing the wallet's `classicAddress` or a [Wallet object](https://js.xrpl.org/classes/Wallet.html).
```
getBalance("abcdefghijklABCDEFGHIJKL1234567890")
getBalance(wallet)
```
---

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
---

### cashCheck
Accept payment sent as a check. Can be accepted for any amount up to the max amount of the transaction.

#### Parameters
- wallet
  - The wallet address or wallet object of the accepting wallet.
- amount
  - `String` representing the amount to be accepted.
- transactionHash
  - `String` of the transaction hash in which the check was sent
```
cashCheck(wallet, "25000", "330BCF9DE6244E95F63EE59195F742A0A06D17ABCBF79962D5F49EB8F4EDCF78")
```
---

### createEscrow
Set up a smart contract using an escrow. Requires a cryptographic condition that is set up with `.load sc.js`.

#### Parameters
- sendingWallet
  - The sending wallet's address or wallet object.
- amount
  - `String` for the number of tokens to send. Sent in "drops" of XRP, where 1,000,000 drops equals 1 XRP.
- receivingWallet
  - The receiving wallet's address or wallet object.
- condition
  - `String` of the cryptographic condition for fulfilling the contract.
- cancelAfter
  - `Number` representing the time after which the contract is automatically cancelled.
```
createEscrow(sendingWallet, "1000", receivingWallet, "A02580200B83831A2132AE114725779D7A57BFB661960CD433CB2958B7DEB89F6D96AB86810120", 696304498)
```
---

### completeEscrow
Set up a smart contract using an escrow. Requires a cryptographic condition.

#### Parameters
- completingWallet
  - The completing wallet's address or wallet object.
- condition
  - `String` of the cryptographic condition for fulfilling the contract.
- fulfillment
  - `String` for the fulfillment of the cryptographic condition.
- offerSequence
  - `Number` for the `Sequence` number from the **createEscrow** transaction.
```
completeEscrow(completingWallet, "A02580200B83831A2132AE114725779D7A57BFB661960CD433CB2958B7DEB89F6D96AB86810120", "A02280209A9C1F839062D9541FF76587EC082B3DF6CEB4070790330D91687037A490CB11", 1)
```
---

### configureIssuer
Set up the wallet for issuing a new token.

#### Parameters
- coldWallet
  - The issuing wallet's address or wallet object.
```
configureIssuer(wallet)
```
---

### tokenHotWallet
Set up a wallet to receive tokens from the issuing wallet.

#### Parameters
- hotWallet
  - The receiving wallet's address or wallet object.
```
tokenHotWallet(wallet)
```
---

### trustLine
Create a trust line between the issuing and receiving wallets.

#### Parameters
- coldWallet
  - The issuing wallet's address or wallet object.
- hotWallet
  - The receiving wallet's address or wallet object.
- currencyCode
  - `String` fot the currency code of the new token.
- limit _optional_
  - `String` representing the maximum number of tokens that can exist. Default is "10000000000".
```
trustLine(coldWallet, hotWallet, "FIT")
```
---

### checkTokenBalance
Check the token balance of a wallet.

#### Parameters
- wallet
  - The wallet's address or wallet object.
```
checkTokenBalance(wallet)
```
---
