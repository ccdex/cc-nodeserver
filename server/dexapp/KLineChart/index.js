const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
// const DexTxns = mongoose.model('DexTxns')
const DexBlocks = mongoose.model('DexBlocks')
const moment = require('moment')
// const DexTxns = mongoose.model('DexTxns')
// const web3 = require('../methods/web3.js')
// const _async = require('async')
// const $$ = require(pathLink + '/server/public/methods/methods')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('KLineChart')


// function KLineChart (type, io, socket, req) {
function KLineChart (type, socket, req) {
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
  DexBlocks.aggregate([
    // {$match: {trade: params.trade}},
    {$match: params},
    {$sort: {'number': -1, 'timestamp': -1, 'squence': -1} },
    {$group: {
      // _id: '$height',
      _id: {
        $subtract: [
          {$subtract: ["$timestamp", new Date(moment('1970-01-01')) / 1000]},
          {$mod: [
            {$subtract: ["$timestamp", new Date(moment('1970-01-01')) / 1000]}, req.intervalView
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
    socket.emit(type, data)
  })
}

module.exports = {
  KLineChart,
}
