const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const DexTxns = mongoose.model('DexTxns')
// const DexBlocks = mongoose.model('DexBlocks')
const Orders = mongoose.model('Orders')
const $$ = require(pathLink + '/server/public/methods/methods')
// const web3 = require('../methods/web3.js')
// const _async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Orders')

// async function getEndTxns (socket, req, type) {
//   let _limit = req && req.pageSize ? req.pageSize : 20
//   let params = {}
//   let data = {
//     msg: 'Error',
//     info: ''
//   }
//   if (req && req.trade) {
//     params.trade = req.trade
//     // params.trade = 'ETH/BTC'
//   } else {
//     socket.emit(type, data)
//     return
//   }
//   DexTxns.aggregate([
//     {$match: {'trade': params.trade } },
//     {$group: {_id: '$height', price: {$push: "$price"}, volumes: {$sum: "$quantity"}, timestamp: {$first: "$timestamp"} }},
//     {$sort: {'_id': -1}},
//     {$limit: _limit}
//   ]).exec((err, result) => {
//     if (err) {
//       data.msg = 'Error'
//       data.info = err
//       logger.error(err.toString())
//     } else {
//       data.msg = 'Success'
//       data.info = result
//       socket.emit(type, data)
//     }
//   })
// }

function getSelfOrder (socket, req, type) {
  let _limit = req && req.pageSize ? req.pageSize : 20
  let _skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_limit)) : 0
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  if (req && req.side) {
    params.side = req.side.toLowerCase()
  }
  if (req && req.pair) {
    params.pair = req.pair
  }
  if (req && (req.status || req.status === 0)) {
    params.status = req.status
  }
  if (req && req.timestamp) {
    if (req.timestamp === '1 Day') {
      params.timestamp = {
        '$gte': $$.toTime(Date.now() - 1000 * 60 * 60 * 24)
      }
    } else if (req.timestamp === '1 Week') {
      params.timestamp = {
        '$gte': $$.toTime(Date.now() - 1000 * 60 * 60 * 24 * 7)
      }
    } else if (req.timestamp === '1 Month') {
      params.timestamp = {
        '$gte': $$.toTime(Date.now() - 1000 * 60 * 60 * 24 * 30)
      }
    } else if (req.timestamp === '3 Months') {
      params.timestamp = {
        '$gte': $$.toTime(Date.now() - 1000 * 60 * 60 * 24 * 30 * 3)
      }
    }
  }
  if (req && req.from) {
    params.from = req.from
  }
  if (req && req.$or) {
    params.$or = req.$or
  }
  // logger.info(params)
  Orders.find(params).sort({'timestamp': -1}).skip(Number(_skip)).limit(Number(_limit)).exec((err, result) => {
    if (err) {
      data.msg = 'Errpr'
      data.info = 'Query order is error!'
      data.error = err.toString()
      logger.error(err.toString())
    } else {
      data.msg = 'Success'
      data.info = result
      socket.emit(type, data)
    }
  })
}

function getEndTxns (socket, req, type) {
  let _limit = req && req.pageSize ? req.pageSize : 20
  let _skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_limit)) : 0
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  if (req && req.side) {
    params.side = req.side.toLowerCase()
  }
  if (req && req.pair) {
    params.trade = req.pair
  }
  if (req && req.timestamp) {
    if (req.timestamp === '1 Day') {
      params.timestamp = {
        '$gte': $$.toTime(Date.now() - 1000 * 60 * 60 * 24)
      }
    } else if (req.timestamp === '1 Week') {
      params.timestamp = {
        '$gte': $$.toTime(Date.now() - 1000 * 60 * 60 * 24 * 7)
      }
    } else if (req.timestamp === '1 Month') {
      params.timestamp = {
        '$gte': $$.toTime(Date.now() - 1000 * 60 * 60 * 24 * 30)
      }
    } else if (req.timestamp === '3 Months') {
      params.timestamp = {
        '$gte': $$.toTime(Date.now() - 1000 * 60 * 60 * 24 * 30 * 3)
      }
    }
  }
  if (req && req.from) {
    params.from = req.from
  }
  if (req && req.$or) {
    params.$or = req.$or
  }
  logger.info(params)
  DexTxns.find(params).sort({'timestamp': -1}).skip(Number(_skip)).limit(Number(_limit)).exec((err, result) => {
    if (err) {
      data.msg = 'Errpr'
      data.info = 'Query order is error!'
      data.error = err.toString()
      logger.error(err.toString())
    } else {
      data.msg = 'Success'
      data.info = result
      socket.emit(type, data)
    }
  })
}



module.exports = {
  getSelfOrder,
  getEndTxns,
}
