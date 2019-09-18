const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const merge = require('merge')
// const DexTxns = mongoose.model('DexTxns')
const DexBlocks = mongoose.model('DexBlocks')
const Ordercache = mongoose.model('Ordercache')
const TxnsPairs = mongoose.model('TxnsPairs')
const $$ = require(pathLink + '/server/public/methods/methods')
const web3 = require(pathLink + '/server/public/methods/web3.js')
const _async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('PushPublicData')

let pendingPairInterval = '',
    PairInterval = '',
    intervalTime = 1000 * 3,
    pendingIntervalTime = 500,
    chartNameObj= {
      getTxnsPairs: 'getTxnsPairs',
      pendingBuy: '-buys',
      pendingSell: '-sells',
      OrderBooks: '-OrderBooks',
      endTxns: '-endTxns',
      KLines: '-KLines'
    }

let oldTime = Date.now()
// let pairData, pairArrWeb3 = []
// try {
//   pairData = web3.lilo.getPairList().split(':')
//   pairArrWeb3 = [...pairData]
// } catch (error) {
//   pairArrWeb3 = []
// }

function PushPublicData (io, socket) {
  let nowTime = Date.now(),
      data = {
        getTxnsPairs: [],
        endTxns: [],
        KLines: []
      },
      _timestamp = {
        $gte: Number( $$.toTime( nowTime - (24 * 60 * 60 * 1000) ) ),
        $lte: Number($$.toTime(nowTime)),
      }
  let pushMethods = (pairArr) => {
    _async.eachSeries(pairArr, (pair, cb) => {

      let tradeData = JSON.parse(JSON.stringify(pair))
      pair = tradeData.trade
      // logger.info(pair)
      if (!pair) {
        cb(null, pair)
      }
      _async.waterfall([
        (callback) => {
          DexBlocks.aggregate([
            {$match: {trade: pair, timestamp: _timestamp}},
            {$sort: {'number': -1, 'timestamp': -1, 'squence': -1}},
            {$group: {
              _id: '$trade',
              openPrice: {$last: '$price'},
              high24: {$max: '$price'},
              low24: {$min: '$price'},
              volume: {$sum: '$volumes'}
            }},
          ]).exec((err, results) => {
            callback(null, results)
          })
        },
        (results, callback) => {
          DexBlocks.find({trade: pair}).sort({'number': -1, 'timestamp': -1, 'squence': -1}).limit(50).exec((err, res) => {
            if (err) {
              logger.error(err.toString())
            } else {
              data.endTxns[pair] = res

              if (results && results.length > 0) {
                let closePrice = res[0] && res[0].price ? Number(res[0].price) : 0,
                    openPrice = results[0].openPrice ? Number(results[0].openPrice) : 0,
                    pecent = 0
                if (closePrice === 0 || openPrice === 0) {
                  pecent = 0
                } else {
                  pecent = closePrice / openPrice
                }
                
                data.getTxnsPairs.push({
                  change: Number(pecent) * 100,
                  volume: results[0].volume,
                  price: closePrice,
                  pair: pair,
                  high24: results[0].high24,
                  low24: results[0].low24,
                  isTop: tradeData.isTop,
                  isShow: tradeData.isShow,
                })
              } else {
                data.getTxnsPairs.push({
                  change: 0,
                  volume: 0,
                  price: 0,
                  pair: pair,
                  high24: 0,
                  low24: 0,
                  isTop: tradeData.isTop,
                  isShow: tradeData.isShow,
                })
              }
            }
            callback(null, res)
          })
        },
        (res, callback) => {
          DexBlocks.aggregate([
            {$match: {trade: pair, timestamp: {$gt: $$.toTime(oldTime),$lte: $$.toTime(nowTime)}}},
            {$sort: {'timestamp': -1} },
            {$group: {
              _id: '$number',
              high: {$max: '$price'},
              low: {$min: '$price'},
              open: {$last: '$price'},
              close: {$first: '$price'},
              volume: {$sum: 1} ,
              timestamp: {$first: '$timestamp'},
              pair: {$first: '$trade'}
            } },
            {$sort: {'timestamp': -1} },
            {$limit: 1}
          ]).exec((err, results) => {
            if (err) {
              logger.error(err.toString())
            } else {
              // logger.info(results)
              if (res && res.length > 0 && results.length > 0) {
                results[0].close = res[0].price
              }
              // logger.info(results)
              data.KLines[pair] = results
            }
            callback(null, pair)
          })
        }
      ], () => {
        cb(null, pair)
      })
    }, () => {
      for (let pair of pairArr) {
        let _pair = pair.trade
        // let _pair = pair
        io.sockets.in(_pair + chartNameObj.KLines).emit(_pair + chartNameObj.KLines, (data.KLines[_pair] ? data.KLines[_pair] : []))
        io.sockets.in(_pair + chartNameObj.endTxns).emit(_pair + chartNameObj.endTxns, (data.endTxns[_pair] ? data.endTxns[_pair] : []))
      }
      // logger.info(chartNameObj.getTxnsPairs)
      // logger.info(data.getTxnsPairs)
      io.sockets.in(chartNameObj.getTxnsPairs).emit(chartNameObj.getTxnsPairs, data.getTxnsPairs)
      oldTime = nowTime
    })
  }

  let pushPendingMethods = (pairArr) => {
    _async.eachSeries(pairArr, (pair, cb) => {
      pair = pair.trade
      if (!pair) {
        cb(null, pair)
      }
      _async.waterfall([
        (callback) => {
          Ordercache.aggregate([
            {$sort: {'price': -1}},
            {$match: {trade: pair, side: 'buy'}},
            {$group: {
              _id: '$price',
              price: {$first: '$price'},
              volume: {$sum: '$volume'},
              total: {$sum: '$total'}
            }},
            {$sort: {'price': -1}},
            {$limit: 100}
          ]).exec((err, res) => {
            let _arr = []
            if (err) {
              logger.error(err.toString())
            } else {
              _arr = res
            }
            callback(null, _arr)
          })
        },
        (arr, callback) => {
          Ordercache.aggregate([
            {$sort: {'price': 1}},
            {$match: {trade: pair, side: 'sell'}},
            {$group: {
              _id: '$price',
              price: {$first: '$price'},
              volume: {$sum: '$volume'},
              total: {$sum: '$total'}
            }},
            {$sort: {'price': 1}},
            {$limit: 100}
          ]).exec((err, res) => {
            let _arr = []
            if (err) {
              logger.error(err.toString())
            } else {
              _arr = res
            }
            io.sockets.in(pair + chartNameObj.OrderBooks).emit(pair + chartNameObj.OrderBooks, {
              buys: arr,
              sells: _arr
            })
            callback(null, pair)
          })
        },
      ], (err, result) => {
        cb(null, result)
      })
    }, (err, result) => {
      clearTimeout(pendingPairInterval)
      pendingPairInterval = setTimeout(() => {
        pushPendingMethods(pairArr)
      }, pendingIntervalTime)
    })
  }
  
  TxnsPairs.find({isShow: 1}).exec((err, res) => {
    // logger.info(res)
    if (res && res.length > 0) {
      let _arr = []
      for (let _i of res) {
        _arr.push(_i)
      }
      pushPendingMethods(_arr)
      pushMethods(_arr)
    } else {
      io.sockets.in(chartNameObj.getTxnsPairs).emit(chartNameObj.getTxnsPairs, [])
    }
    clearTimeout(PairInterval)
    PairInterval = setTimeout(() => {
      PushPublicData(io, socket)
    }, intervalTime)
  })
}


function getInitData(socket, req, type) {
  let data = {
		msg: 'Success',
		info: '',
		getTxnsPairs: []
	}
  let nowTime = Date.now()
  let _timestamp = {
    $gte: Number( $$.toTime( nowTime - (24 * 60 * 60 * 1000) ) ),
    $lte: Number($$.toTime(nowTime)),
  }
  _async.waterfall([
    (cb) => {
      TxnsPairs.find({isShow: 1}, {trade: 1, isTop: 1, sortId: 1}).exec((err, results) => {
        if (results && results.length > 0) {
          cb(null, results)
        } else {
          if (err) {
            cb(err)
          } else {
            cb('Trade is null!')
          }
        }
      })
    },
    (res, cb) => {
      // logger.info(res)
      DexBlocks.aggregate([
        {$match: {timestamp: _timestamp}},
        {$sort: {'number': -1, 'timestamp': -1}},
        {$group: {
          _id: '$trade',
          openPrice: {$last: '$price'},
          closePrice: {$first: '$price'},
          high24: {$max: '$price'},
          low24: {$min: '$price'},
          volume: {$sum: '$volumes'}
        }},
      ]).exec((err, results) => {
        if (err) {
          cb(err)
        } else {
          let arr = []
          let str = JSON.stringify(results)
          for (let obj of res) {
            if (str.indexOf(obj.trade) !== -1) {
              for (let obj1 of results) {
                if (obj.trade === obj1._id) {
                  let obj2 = merge(obj, obj1)
                  arr.push(obj2)
                  break
                }
              }
            } else {
              let obj2 = merge(obj, {
                openPrice: 0,
                closePrice: 0,
                high24: 0,
                low24: 0,
                volume: 0,
              })
              arr.push(obj2)
            }
          }
          // logger.info(arr)
          cb(null, arr)
        }
      })
    },
    (results, cb) => {
      DexBlocks.find({trade: req.trade}).sort({'number': -1, 'timestamp': -1}).limit(50).exec((err, res) => {
        if (err) {
          logger.error(err.toString())
        } else {
          data.info = res
          if (results && results.length > 0) {
            for (let obj of results) {
              let closePrice = obj.closePrice ? Number(obj.closePrice) : 0,
                  openPrice = obj.openPrice ? Number(obj.openPrice) : 0,
                  pecent = 0
              if (req.trade === obj.trade) {
                closePrice = res[0] && res[0].price ? Number(res[0].price) : 0
              }
              if (closePrice === 0 || openPrice === 0) {
                pecent = 0
              } else {
                pecent = closePrice / openPrice
              }
              data.getTxnsPairs.push({
                change: Number(pecent) * 100,
                volume: obj.volume,
                price: closePrice,
                pair: obj.trade,
                high24: obj.high24,
                low24: obj.low24,
                isTop: obj.isTop,
                isShow: obj.isShow,
              })
            }
          } else {
            data.getTxnsPairs.push({
              change: 0,
              volume: 0,
              price: 0,
              pair: req.trade,
              high24: 0,
              low24: 0,
              isTop: 1,
              isShow: 1,
            })
          }
        }
        cb(null, res)
      })
    }
  ], (err) => {
    if (err) {
      logger.info(err.toString())
    }
    socket.emit(type, data)
  })
}

function startServer (io, socket) {
  PushPublicData(io, socket)
  // pendingTxns(io, socket)
}

module.exports = {
  startServer,
  getInitData
}