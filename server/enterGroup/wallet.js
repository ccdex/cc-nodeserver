const path = require("path").resolve(".")
const pathLink = path

const Accounts = require(pathLink + '/server/public/accounts/index')

const Lilo = require(pathLink + '/server/wallet/lilo/index')
const Lockin = require(pathLink + '/server/wallet/lilo/lockin')
const Transfer = require(pathLink + '/server/wallet/transfer/index')

function StartSocket (socket, io) {
  socket.on('AccountSendTxn', (req) => {
    Accounts.sendTxn(socket, req, 'AccountSendTxn')
  })
  socket.on('createAccount', (req) => {
    Accounts.createAccount(socket, req, 'createAccount')
  })
  socket.on('LiloSendTxn', (req) => {
    Lilo.sendTxn(socket, req, 'LiloSendTxn')
  })
  socket.on('lockInHistory', (req) => {
    Lockin.lockInHistory(socket, req, 'lockInHistory')
  })
  socket.on('lockOutHistory', (req) => {
    Lilo.lockOutHistory(socket, req, 'lockOutHistory')
  })
  socket.on('lockin', (req) => {
    Lilo.lockin(socket, req, 'lockin')
  })

  socket.on('TransferSendTxn', (req) => {
    Transfer.sendTxn(socket, req, 'TransferSendTxn')
  })
  socket.on('history', (req) => {
    Transfer.history(socket, req, 'history')
  })
  socket.on('receiveHistory', (req) => {
    Transfer.receiveHistory(socket, req, 'receiveHistory')
  })

}

module.exports = StartSocket
