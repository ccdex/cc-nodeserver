const path = require("path").resolve(".")
const pathLink = path

const web3 = require(pathLink + '/server/public/methods/web3')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('SendTxns')

function sendTxns (socket, req, type) {
  let data = { msg: '', info: '' }
  this.web3.eth.sendRawTransaction(req, (err, res) => {
    if (err) {
      data = { msg: 'Error', info: 'Transaction error!', error: err.toString() }
    } else {
      data = { msg: 'Success', info: 'Transaction success,hash: ' + res }
    }
    socket.emit(type, data)
  })
}

module.exports = {
  sendTxns
}