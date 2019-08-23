const path = require("path").resolve(".")
const pathLink = path

const web3 = require(pathLink + '/server/public/methods/web3')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('ValidInfo')


function validSearchType (socket, req, type) {
  let data = { msg: '', info: '' }
  if (web3.isAddress(req)) { // Address
    data = { msg: 'Success', info: 0 }
  } else if (!isNaN(req) && req.indexOf('0x') !== 0) { // block number
    data = { msg: 'Success', info: 1 }
  } else if (req.indexOf('0x') === 0) { // hash
    data = { msg: 'Success', info: 2 }
  } else {
    data = { msg: 'Success', info: 3 }
  }
  socket.emit(type, data)
}

module.exports = {
  validSearchType
}