const cc = require('five-bells-condition')
const crypto = require('crypto')

const preimageData = crypto.randomBytes(32)
const myFulfillment = new cc.PreimageSha256()
myFulfillment.setPreimage(preimageData)

const condition = myFulfillment.getConditionBinary().toString('hex').toUpperCase()
console.log('Condition:', condition)
// (Random hexadecimal, 72 chars in length)

// keep secret until you want to finish executing the held payment:
const fulfillment = myFulfillment.serializeBinary().toString('hex').toUpperCase()
console.log('Fulfillment:', fulfillment)

const rippleOffset = 946684800
const cancelAfter = Math.floor(Date.now() / 1000) + (24*60*60) - rippleOffset
console.log(cancelAfter)
