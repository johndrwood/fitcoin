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
  let response = await client.getXrpBalance(wallet.address)
  console.log(`Wallet balance is ${response}`)
}

async function sendFunds(wallet1, amount, wallet2) {
  const prepared = await client.autofill({
    "TransactionType": "Payment",
    "Account": wallet1.address,
    "Amount": amount,
    "Destination": wallet2.address
  })

  const max_ledger = prepared.LastLedgerSequence
  console.log("Prepared transaction details:", prepared)

  signed = wallet1.sign(prepared)
  const tx = await client.submitAndWait(signed.tx_blob)
  console.log("Completed transaction details:", tx)
}
