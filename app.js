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
  const walletAddress = typeof(wallet) == 'string' ? wallet : wallet.address
  let response = await client.getXrpBalance(walletAddress)
  console.log(`Wallet balance is ${response}`)
}

async function sendFunds(wallet1, amount, wallet2, asCheck = false) {
  const receivingWallet = typeof(wallet2) == 'string' ? wallet2 : wallet2.address
  let transactionData = {
    "TransactionType": "Payment",
    "Account": wallet1.address,
    "Destination": receivingWallet
  }
  if (asCheck) {
    transactionData.TransactionType = "CheckCreate"
    transactionData.SendMax = amount
  } else {
    transactionData.Amount = amount
  }
  const prepared = await client.autofill(transactionData)

  const max_ledger = prepared.LastLedgerSequence
  console.log("Prepared transaction details:", prepared)

  signed = wallet1.sign(prepared)
  const tx = await client.submitAndWait(signed.tx_blob)
  console.log("Completed transaction details:", tx)
}

async function cashCheck(wallet, amount, transactionHash) {
  let transactionData = await client.request({
    "command": "tx",
    "transaction": transactionHash
  })
  const checkID = transactionData.result.meta.AffectedNodes.find(n => n.CreatedNode.LedgerEntryType === 'Check').CreatedNode.LedgerIndex

  const prepared = await client.autofill({
    "TransactionType": "CheckCash",
    "Account": wallet.address,
    "Amount": amount,
    "CheckID": checkID
  })
  console.log("Prepared transaction details:", prepared)

  signed = wallet.sign(prepared)
  const tx = await client.submitAndWait(signed.tx_blob)
  console.log("Completed transaction details:", tx)
}
