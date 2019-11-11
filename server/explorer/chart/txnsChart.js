const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
const Transaction = mongoose.model( 'Transaction' )
const Block = mongoose.model( 'Block' )
const Accounts = mongoose.model( 'Accounts' )
const async = require('async')
const moment = require('moment')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('TxnsChart')

// router.post('/transfer', (req, res) => {
// function transfer(socket, req) {
const timeInterval = 1 * 60 * 60 * 24,
      // startTime = new Date('1970-01-01 00:00:00') / 1000
      startTime = new Date(moment('1970-01-01')) / 1000

function TxnsChart (socket, req, type) {
	let data = {
		msg: 'Error',
    txns: [],
    blocks: [],
    address: []
	}
	// Transaction.find({}).lean(true).sort({"timestamp": 1}).exec((err, result) => {
  async.waterfall([
    (cb) => {
      Transaction.aggregate([
        // {$match:}
        {$sort: {blockNumber: -1, timestamp: -1}},
        {$group: {
          _id: {
            $subtract: [
              {$subtract: ['$timestamp', startTime]},
              {$mod: [
                {$subtract: ["$timestamp", startTime]}, timeInterval
              ]}
            ],
          },
          // timestamp: {$push: '$timestamp'},
          txnCount: {$sum: 1}
        }},
        {$sort: {'_id': 1}},
      ]).exec((err, result) => {
        if (!err) {
          data.txns = result
          cb(null, 'Success')
        } else {
          data.txns = []
          data.info = 'Transaction query error!'
          cb(err.toString())
        }
        // socket.emit('transfer', data)
      })
    },
    (txns, cb) => {
      Block.aggregate([
        {$match: {'number': {$gt: 0} }},
        {$sort: {number: -1, timestamp: -1}},
        {$group: {
          _id: {
            $subtract: [
              {$subtract: ['$timestamp', startTime]},
              {$mod: [
                {$subtract: ["$timestamp", startTime]}, timeInterval
              ]}
            ],
          },
          difficultyAvg: {$avg: '$difficulty'},
          // blockTimeAvg: {},
          blockSizeAvg: {$avg: '$size'},
          blockCount: {$sum: 1},
          // unclesCount: {$addToSet : '$uncles'},
          // EstHashRate: {$push: '$'}
        }},
        {$sort: {'_id': 1}},
      ]).exec((err, result) => {
        if (!err) {
          data.blocks = result
          cb(null, 'Success')
        } else {
          data.blocks = []
          data.info = 'Block query error!'
          cb(err.toString())
        }
      })
    },
    (blocks, cb) => {
      Accounts.aggregate([
        {$match: {'isConfirm': {$gt: 0}, 'timestamp': {$gt: 0} }},
        {$sort: {'timestamp': 1}},
        {$group: {
          _id: {
            $subtract: [
              {$subtract: ['$timestamp', startTime]},
              {$mod: [
                {$subtract: ["$timestamp", startTime]}, timeInterval
              ]}
            ],
          },
          addressCount: {$sum: 1}
        }},
        {$sort: {'_id': 1}},
      ]).exec((err, result) => {
        if (!err) {
          data.address = result
          cb(null, 'Success')
        } else {
          data.address = []
          data.info = 'Address query error!'
          cb(err.toString())
        }
      })
    }
  ], (err, res) => {
    if (err) {
      data.error  = err
    } else {
      data.msg = 'Success'
    }
    socket.emit(type, data)
  })
}

module.exports = TxnsChart