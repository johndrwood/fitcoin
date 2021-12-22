const xrpl = require("xrpl")

async function main() {

  // Define the network client
  const PUBLIC_TEST_SERVER = "wss://s.altnet.rippletest.net:51233"
  const client = new xrpl.Client(PUBLIC_TEST_SERVER)
  await client.connect()

  let response = await client.request({
    "command": "ledger",
    "ledger_index": "validated",
    "transactions": true
  });
  console.log(response);

  // Disconnect when done (If you omit this, Node.js won't end the process)
  client.disconnect()
}

main()
