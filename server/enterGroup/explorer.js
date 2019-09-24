const path = require("path").resolve(".")
const pathLink = path

const AccountOther = require(pathLink + '/server/explorer/accounts/accounts')

const Orders = require(pathLink + '/server/explorer/orders/index')

const Blocks = require(pathLink + '/server/explorer/blocks/blocks')

const Txns = require(pathLink + '/server/explorer/txns/txns')
const TxnsDex = require(pathLink + '/server/explorer/txns/txnsDex')
const TxnsPending = require(pathLink + '/server/explorer/txns/txnsPending')

const PushBlockInfo = require(pathLink + '/server/explorer/pushBlockInfo/index')

const ChartsPrice = require(pathLink + '/server/explorer/chart/getPrice')
const ChartsTxns = require(pathLink + '/server/explorer/chart/txnsChart')
const ChartsAccount = require(pathLink + '/server/explorer/chart/accountChart')

const getAvgData = require(pathLink + '/server/explorer/chart/getAvgData')

// const sendTxns = require(pathLink + '/server/public/other/sendTxns')

function StartSocket (socket, io) {

    socket.on('getBlocksAndTxns', () => {
        PushBlockInfo.getCacheData(socket, 'getBlocksAndTxns')
    })


    socket.on('getPrice', (req) => {
        ChartsPrice.Price(socket, req, 'getPrice')
    })

    socket.on('transaction', (req) => {
        Txns.List(socket, req, 'transaction')
    })
    
    socket.on('blocks', (req) => {
        Blocks.List(socket, req, 'blocks')
    })

    socket.on('transferDtil', (req) => {
        Txns.Dtil(socket, req, 'transferDtil')
    })
    socket.on('transferPage', (req) => {
        Txns.Page(socket, req, 'transferPage')
    })
    
    socket.on('txnsDexList', (req) => {
        TxnsDex.List(socket, req, 'txnsDexList')
    })
    socket.on('txnsDexDtil', (req) => {
        TxnsDex.Dtil(socket, req, 'txnsDexDtil')
    })
    socket.on('txnsDexPage', (req) => {
        TxnsDex.Page(socket, req, 'txnsDexPage')
    })

    socket.on('txnsPending', (req) => {
        TxnsPending.pendingList(socket, req, 'txnsPending')
    })
    socket.on('txnsPendingDtil', (req) => {
        TxnsPending.pendingDtil(socket, req, 'txnsPendingDtil')
    })
    socket.on('txnsPendingPage', (req) => {
        TxnsPending.pendingPage(socket, req, 'txnsPendingPage')
    })


    socket.on('getAvgData', (req) => {
        getAvgData.Avg(socket, req, 'getAvgData')
    })
    
    socket.on('blockNum', (req) => {
        Blocks.Dtil(socket, req, 'blockNum')
    })


    socket.on('getOrders', (req) => {
        Orders.List(socket, req, 'getOrders')
    })
    socket.on('OrdersPage', (req) => {
        Orders.List(socket, req, 'OrdersPage')
    })

    socket.on('topAccounts', (req) => {
        AccountOther.TopA(socket, req, 'topAccounts')
    })
    socket.on('getAccounts', (req) => {
        AccountOther.TopA(socket, req, 'getAccounts')
    })
    socket.on('accountTxn', (req) => {
        AccountOther.ATxn(socket, req, 'accountTxn')
    })
    socket.on('accountLiloTxn', (req) => {
        AccountOther.ATxn(socket, req, 'accountLiloTxn')
    })

    socket.on('transactionChart', (req) => {
        ChartsTxns(socket, req, 'transactionChart')
    })
    socket.on('addressChart', (req) => {
        ChartsAccount(socket, req, 'addressChart')
    })

    // socket.on('sendTxns', (req) => {
    //     sendTxns.sendTxns(socket, req, 'sendTxns')
    // })
}

module.exports = StartSocket
