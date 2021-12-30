const ws = require("ws")

const PUBLIC_TEST_SERVER = "wss://s.altnet.rippletest.net:51233"
const socket = new ws.WebSocket('wss://s.altnet.rippletest.net:51233')

async function subscribe(wallet) {
  const account = typeof(wallet) == 'string' ? wallet : wallet.address
  const sub_response = await api_request({
    command:"subscribe",
    accounts: [account]
  })
  if (sub_response.status === "success") {
    console.log("Successfully subscribed!")
  } else {
    console.error("Error subscribing: ", sub_response)
  }
}


const AWAITING = {}
const handleResponse = function(data) {
  if (!data.hasOwnProperty("id")) {
    console.error("Got response event without ID:", data)
    return
  }
  if (AWAITING.hasOwnProperty(data.id)) {
    AWAITING[data.id].resolve(data)
  } else {
    console.warn("Response to un-awaited request w/ ID " + data.id)
  }
}

const handleTransaction = function(data) {
  switch (data.transaction.TransactionType) {
    case "Payment":
      console.log(`You have been sent a payment of ${data.transaction.Amount} from ${data.transaction.Account}.`)
      break;
    case "CheckCreate":
      console.log(`You have been sent a check for up to ${data.transaction.SendMax} from ${data.transaction.Account}.\n
        Transaction hash is '${data.transaction.hash}'`)
      break;
    case "CheckCash":
      console.log(`You have cashed a check for ${data.transaction.Amount} from ${data.transaction.Account}.`)
      break;
    default:
      console.log("You have been sent a transaction of unknown type.")
  }
}

let autoid_n = 0
function api_request(options) {
  if (!options.hasOwnProperty("id")) {
    options.id = "autoid_" + (autoid_n++)
  }

  let resolveHolder;
  AWAITING[options.id] = new Promise((resolve, reject) => {
    // Save the resolve func to be called by the handleResponse function later
    resolveHolder = resolve
    try {
      // Use the socket opened in the previous example...
      socket.send(JSON.stringify(options))
    } catch(error) {
      reject(error)
    }
  })
  AWAITING[options.id].resolve = resolveHolder;
  return AWAITING[options.id]
}

const WS_HANDLERS = {
  "response": handleResponse,
  "transaction": handleTransaction
  // Fill this out with your handlers in the following format:
  // "type": function(event) { /* handle event of this type */ }
}
socket.addEventListener('message', (event) => {
  const parsed_data = JSON.parse(event.data)
  if (WS_HANDLERS.hasOwnProperty(parsed_data.type)) {
    // Call the mapped handler
    WS_HANDLERS[parsed_data.type](parsed_data)
  } else {
    console.log("Unhandled message from server", event)
  }
})

// Demonstrate api_request functionality
async function pingpong() {
  console.log("Ping...")
  const response = await api_request({command: "ping"})
  console.log("Pong!", response)
}
// Add pingpong() to the 'open' listener for socket
