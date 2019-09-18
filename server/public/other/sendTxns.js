const path = require("path").resolve(".")
const pathLink = path

const web3 = require(pathLink + '/server/public/methods/web3')
const $$ = require(pathLink + '/server/public/methods/methods')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('SendTxns')

function sendTxns (socket, req, type) {
  let data = { msg: '', info: '' }
  logger.info(req)
  if (!req.signSerializedTx) {
    data = { msg: 'Error', info: 'hash is null' }
    socket.emit(type, data)
    return
  }
  let url = req.url ? req.url : $$.config.serverRPC
  web3.setProvider(new web3.providers.HttpProvider(url))
  web3.eth.sendRawTransaction(req.signSerializedTx, (err, res) => {
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