const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
const Transaction = mongoose.model( 'Transaction' )
const Block = mongoose.model( 'Block' )
const Accounts = mongoose.model( 'Accounts' )
const async = require('async')
const moment = require('moment')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('AccountChart')
const timeInterval = 1 * 60 * 60 * 24,
      // startTime = new Date('1970-01-01 00:00:00') / 1000
      startTime = new Date(moment('1970-01-01')) / 1000
function AccountChart (socket, req, type) {
  let data = {msg: 'Error', info: []}
  Accounts.aggregate([
    // {$match:}
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
      // timestamp: {$push: '$timestamp'},
      addressCount: {$sum: 1},
      // timestamp: _id
    }},
    {$sort: {'_id': 1}},
  ]).exec((err, result) => {
    if (!err) {
      data.msg = 'Success'
      data.info = result
    } else {
      data.info = []
    }
    socket.emit(type, data)
  })
}

module.exports = AccountChart