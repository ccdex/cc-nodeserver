const path = require("path").resolve(".")
const pathLink = path

const Accounts = require(pathLink + '/server/public/accounts/index')
const Other = require(pathLink + '/server/public/other/getBaseInfo')
const GetDollar = require(pathLink + '/server/public/other/getDollar')
const validInfo = require(pathLink + '/server/public/other/validInfo')


function walletEnter(socket, io) {
  socket.on('queryAccount', (req) => {
    Accounts.queryAccount(socket, req, 'queryAccount')
  })
  socket.on('base', (req) => {
    Other.base(socket, req, 'base')
  })
  socket.on('changeWei', (req) => {
    Other.changeWebWei(socket, req, 'changeWei')
  })
  socket.on('getCoinDollar', (req) => {
    GetDollar.getDollar(socket, req, 'getCoinDollar')
  })
  socket.on('validInfo', (req) => {
    validInfo.validSearchType(socket, req, 'validInfo')
  })
}


module.exports = walletEnter