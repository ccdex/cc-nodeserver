const path = require("path").resolve(".")
const pathLink = path

const Accounts = require(pathLink + '/server/public/accounts/index')
// const sendTxns = require(pathLink + '/server/public/other/sendTxns')


const AccountSet = require(pathLink + '/server/dexapp/accountSet/index')
// const GetDollar = require(pathLink + '/server/public/other/getDollar')

const Order = require(pathLink + '/server/dexapp/order/index')

// const GetBaseInfo = require(pathLink + '/server/public/other/getBaseInfo')

const KlineChart = require(pathLink + '/server/dexapp/KLineChart/index')

const AdverSys = require(pathLink + '/server/dexapp/banner/index')
const NewsSys = require(pathLink + '/server/dexapp/news/index')

const startServer = require(pathLink + '/server/dexapp/order/pushPublicData')

function StartSocket (socket, io) {

  socket.on('getInitData', (req) => {
    startServer.getInitData(socket, req, 'getInitData')
  })

  socket.on('setFollow', (req) => {
    AccountSet.setFollow(socket, req, 'setFollow')
  })

  // socket.on('queryAccount', (req) => {
  //     Accounts.queryAccount(socket, req, 'queryAccount')
  // })
  socket.on('AccountSendTxn', (req) => {
      Accounts.sendTxn(socket, req, 'AccountSendTxn')
  })
  // socket.on('createAccount', (req) => {
  //     Accounts.createAccount(socket, req, 'createAccount')
  // })
  
  // socket.on('getCoinDollar', (req) => {
  //   // console.log(req)
  //   GetDollar.getDollar(socket, req, 'getCoinDollar')
  // })

  socket.on('getSelfOrder', (req) => {
    Order.getSelfOrder(socket, req, 'getSelfOrder')
  })
  socket.on('getEndTxns', (req) => {
    Order.getEndTxns(socket, req, 'getEndTxns')
  })

  // socket.on('baseData', (req) => {
  //   GetBaseInfo.base(socket, req, 'baseData')
  // })

  socket.on('KlineChart', (req) => {
    KlineChart.KLineChart('KlineChart', socket, req)
  })

  socket.on('adverInfo', (req) => {
    AdverSys.List(socket, req, 'adverInfo')
  })
  
  socket.on('newsList', (req) => {
    NewsSys.List(socket, req, 'newsList')
  })
}

module.exports = StartSocket
