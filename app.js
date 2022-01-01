const xrpl = require("xrpl")

let client = null

async function connect() {
  try {
    const PUBLIC_TEST_SERVER = "wss://s.altnet.rippletest.net:51233"
    client = new xrpl.Client(PUBLIC_TEST_SERVER)
    const response = await client.connect()
    console.log(`Connected to ${client.connection.url}`)
  } catch {
    console.log("Could not connect to test server")
  }
}
connect()

async function disconnect() {
  client.disconnect()
}

async function createAndFundWallet() {
  let response = await client.fundWallet()
  console.log(response)
  return response.wallet
}

async function getBalance(wallet) {
  let response = await client.getXrpBalance(getWalletAddress(wallet))
  console.log(`Wallet balance is ${response}`)
}

async function sendFunds(sendingWallet, amount, receivingWallet, {asCheck = false, currency = null, issuingWallet = null}) {
  let transactionData = {
    "TransactionType": "Payment",
    "Account": sendingWallet.address,
    "Destination": getWalletAddress(receivingWallet)
  }
  if (asCheck) {
    transactionData.TransactionType = "CheckCreate"
    transactionData.SendMax = amount
  } else {
    if (currency) {
      transactionData.Amount = {
        "currency": currency,
        "value": amount,
        "issuer": getWalletAddress(issuingWallet)
      }
      transactionData.DestinationTag = 1
    } else {
      transactionData.Amount = amount
    }
  }
  const preparedTransaction = await client.autofill(transactionData)
  signAndSubmitTransaction(sendingWallet, preparedTransaction)
}

async function cashCheck(wallet, amount, transactionHash) {
  let transactionData = await client.request({
    "command": "tx",
    "transaction": transactionHash
  })
  const checkID = transactionData.result.meta.AffectedNodes.find(n => n.CreatedNode?.LedgerEntryType === 'Check').CreatedNode.LedgerIndex
  const preparedTransaction = await client.autofill({
    "TransactionType": "CheckCash",
    "Account": wallet.address,
    "Amount": amount,
    "CheckID": checkID
  })
  signAndSubmitTransaction(wallet, preparedTransaction)
}

async function createEscrow(sendingWallet, amount, receivingWallet, condition, cancelAfter) {
  const preparedTransaction = await client.autofill({
    "Account": sendingWallet.address,
    "TransactionType": "EscrowCreate",
    "Amount": amount,
    "Destination": getWalletAddress(receivingWallet),
    "Condition": condition,
    "CancelAfter": cancelAfter
  })
  signAndSubmitTransaction(sendingWallet, preparedTransaction)
}

async function completeEscrow(completingWallet, condition, fulfillment, offerSequence) {
  const preparedTransaction = await client.autofill({
    "Account": completingWallet.address,
    "Owner": completingWallet.address,
    "TransactionType": "EscrowFinish",
    "Condition": condition,
    "Fulfillment": fulfillment,
    "OfferSequence": offerSequence
  })
  signAndSubmitTransaction(completingWallet, preparedTransaction)
}

async function createToken(issuingWallet, receivingWallet, currencyCode) {
  await configureIssuer(issuingWallet)
  await tokenHotWallet(receivingWallet)
  await trustLine(issuingWallet, receivingWallet, currencyCode)
}

async function configureIssuer(coldWallet, domain = "example.net") {
  const preparedTransaction = await client.autofill({
    "TransactionType": "AccountSet",
    "Account": coldWallet.address,
    "TransferRate": 0,
    "TickSize": 5,
    "Domain": bytesToHex(new TextEncoder().encode(domain)).toUpperCase(),
    "SetFlag": xrpl.AccountSetAsfFlags.asfDefaultRipple,
    "Flags": (xrpl.AccountSetTfFlags.tfDisallowXRP |
             xrpl.AccountSetTfFlags.tfRequireDestTag)
  })
  signAndSubmitTransaction(coldWallet, preparedTransaction)
}

async function tokenHotWallet(hotWallet, domain = "example.net") {
  const preparedTransaction = await client.autofill({
    "TransactionType": "AccountSet",
    "Account": hotWallet.address,
    "Domain": bytesToHex(new TextEncoder().encode(domain)).toUpperCase(),
    "SetFlag": xrpl.AccountSetAsfFlags.asfRequireAuth,
    "Flags": (xrpl.AccountSetTfFlags.tfDisallowXRP |
             xrpl.AccountSetTfFlags.tfRequireDestTag)
  })
  signAndSubmitTransaction(hotWallet, preparedTransaction)
}

async function trustLine(coldWallet, hotWallet, currencyCode, limit = "10000000000" ) {
  const preparedTransaction = await client.autofill({
    "TransactionType": "TrustSet",
    "Account": hotWallet.address,
    "LimitAmount": {
      "currency": currencyCode,
      "issuer": getWalletAddress(coldWallet),
      "value": limit
    }
  })
  signAndSubmitTransaction(hotWallet, preparedTransaction)
}

async function tokenBalance(wallet) {
  const accountResult = await client.request({
    command: "account_lines",
    account: getWalletAddress(wallet),
    ledger_index: "validated"
  })
  console.log(accountResult.result.lines)
}

function getWalletAddress(wallet) {
  return typeof(wallet) == 'string' ? wallet : wallet.address
}

async function signAndSubmitTransaction(wallet, preparedTransaction) {
  console.log("preparedTransaction transaction details:", preparedTransaction)
  signed = wallet.sign(preparedTransaction)
  const tx = await client.submitAndWait(signed.tx_blob)
  console.log("Completed transaction details:", tx)
}

function bytesToHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}
