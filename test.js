
const path = require("path").resolve(".")
const pathLink = path

const web3 = require(pathLink + '/server/public/methods/web3')

web3.setProvider(new web3.providers.HttpProvider('http://207.180.232.145:9909'))



let start = Date.now()
console.log(web3.isConnected())

console.log(web3.lilo.dcrmReqAddr('0xbC207D731F371Ba4ce3fc86E71186D88802e6fB9', 'ALL'))


console.log('success')
let end = Date.now()
console.log(end - start)



















