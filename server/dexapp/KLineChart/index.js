const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
// const DexTxns = mongoose.model('DexTxns')
const DexBlocks = mongoose.model('DexBlocks')
// const Order = mongoose.model('Order')
const KLineCharts = mongoose.model('KLineCharts')
const DexTxns = mongoose.model('DexTxns')
// const web3 = require('../methods/web3.js')
const _async = require('async')
const $$ = require(pathLink + '/server/public/methods/methods')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('KLineChart')

// function KLineChart (socket, req, type) {
//   let _limit = req && req.pageSize ? req.pageSize : 20
//   let _skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_limit)) : 0
//   let params = {}
//   let data = {
//     msg: 'Error',
//     info: ''
//   }
//   if (req && req.trade) {
//     params.trade = req.trade
//   }
//   if (req && req.$or) {
//     params.$or = req.$or
//   }
//   if (req && req.timestamp) {
//     params.timestamp = req.timestamp
//   }
//   logger.info(req)
//   logger.info(params)
//   KLineCharts.find(params).sort({timestamp: 1}).exec((err, results) => {
//     if (err) {
//       data = { msg: 'Error', info: [], error: err.toString(), tip: 'Get k line data error!' }
//       logger.error(err.toString())
//     } else {
//       if (results.length > 0) {
//         data = { msg: 'Success', info: results }
//       } else {
//         data = { msg: 'Null', info: [], tip: 'K line data is null!' }
//       }
//     }
//     socket.emit(type, data)
//   })
// }

function KLineChartGroup (io, req, pairArr) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  _async.eachSeries(pairArr, (pair, cb) => {
    _async.waterfall([
      (callback) => {
        callback(null, pair)
      },
      (type, callback) => {
        DexTxns.aggregate([
          // {$match: {trade: params.trade}},
          {$match: {trade: pair, timestamp: req.timestamp}},
          {$sort: {'timestamp': -1} },
          {$group: {
            // _id: '$height',
            
            _id: {
              $subtract: [
                {$subtract: ["$timestamp", new Date('1970-01-01') / 1000]},
                {$mod: [
                  {$subtract: ["$timestamp", new Date('1970-01-01') / 1000]},
                  req.intervalView
                ]}
              ]
            },
            high: {$max: '$price'},
            low: {$min: '$price'},
            open: {$first: '$price'},
            close: {$last: '$price'},
            volume: {$sum: 1} ,
            timestamp: {$first: '$timestamp'},
            pair: {$first: '$trade'}
          } },
          // {$sort: {'timestamp': -1} },
          {$limit: 1}
        ]).exec((err, results) => {
          if (err) {
            data = { msg: 'Error', info: [], error: err.toString(), tip: 'Get k line data error!' }
            logger.error(err.toString())
          } else {
            if (results.length > 0) {
              data = { msg: 'Success', info: results }
            } else {
              data = { msg: 'Null', info: [], tip: 'K line data is null!' }
            }
          }
          io.sockets.emit(type + 'KLines', data)
          callback(null, type + 'KLines')
        })
      }
    ], (err, res) => {
      cb(null, res)
    })
  }, (err, res) => {
    if (err) {
      logger.error(err)
    } else {
      // logger.info(res)
    }
  })
}

// function KLineChart (type, io, socket, req) {
function KLineChart (type, io, socket, req) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  if (req && req.trade) {
    params.trade = req.trade
  }
  if (req && req.$or) {
    params.$or = req.$or
  }
  if (req && req.timestamp) {
    params.timestamp = req.timestamp
  }
  // if (req && req.intervalView) {
  //   params.intervalView = req.intervalView * 60
  // }

  logger.info(req)
  logger.info(params)
  DexBlocks.aggregate([
    // {$match: {trade: params.trade}},
    {$match: params},
    {$sort: {'timestamp': 1} },
    {$group: {
      // _id: '$height',
      _id: {
        $subtract: [
          {$subtract: ["$timestamp", new Date('1970-01-01') / 1000]},
          {$mod: [
            {$subtract: ["$timestamp", new Date('1970-01-01') / 1000]},
            // params.intervalView
            // 15
            req.intervalView
          ]}
        ]
      },
      high: {$max: '$price'},
      low: {$min: '$price'},
      open: {$first: '$price'},
      close: {$last: '$price'},
      volume: {$sum: 1} ,
      timestamp: {$first: '$timestamp'},
      pair: {$first: '$trade'},
      // arr: {$push: '$timestamp'}
    } },
    {$sort: {'timestamp': 1} }
  ]).exec((err, results) => {
    if (err) {
      data = { msg: 'Error', info: [], error: err.toString(), tip: 'Get k line data error!' }
      logger.error(err.toString())
    } else {
      if (results.length > 0) {
        data = { msg: 'Success', info: results }
      } else {
        data = { msg: 'Null', info: [], tip: 'K line data is null!' }
      }
    }
    // logger.info(results)
    // if (socket) {
    //   io.sockets.emit(type, $data)
    // } else {
    // }
    socket.emit(type, data)
  })
}

function GetBestPrice (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  logger.info(req)
  if (req && req.trade) {
    params.trade = req.trade
  } else {
    data = { msg: 'Success', info: results }
    socket.emit(type, data)
    return
  }
  if (req && req.timestamp) {
    params.timestamp = req.timestamp
  }
  // logger.info(req)
  DexBlocks.aggregate([
    {$match: params},
    {$group: {
      _id: '$trade',
      h24High: {$max: '$price'},
      h24Low: {$min: '$price'}
    }}
  ]).exec((err, results) => {
    if (err) {
      data = { msg: 'Error', info: [], error: err.toString(), tip: 'Get best price data error!' }
      logger.error(err.toString())
    } else {
      data = { msg: 'Success', info: results[0] }
    }
    socket.emit(type, data)
  })
}

module.exports = {
  KLineChart,
  KLineChartGroup,
  GetBestPrice
}
