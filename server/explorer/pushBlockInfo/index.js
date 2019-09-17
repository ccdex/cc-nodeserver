const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
const Block = mongoose.model( 'Block' )
const Transaction = mongoose.model( 'Transaction' )
const async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('PushBlockInfo')
const $$ = require(pathLink + '/server/public/methods/methods')

const pushTimeout = 5 * 1000
let cacheData = {}

function PushBlockInfo (io) {
  let data = {
    msg: 'Success',
    blocks: [],
    txns: [],
    txnsTotal: 0
  }
  async.waterfall([
		(cb) => {
			Transaction.find().sort({blockNumber: -1, timestamp: -1}).limit(50).exec((err, result) => {
        if (err) {
					logger.error(err.toString())
					data.txnsError = err.toString()
          data.txns = []
        } else {
          data.txns = result
        }
        cb(null, data)
      })
    },
    (res, cb) => {
      Transaction.find().countDocuments((err, result) => {
        if (err) {
          logger.error(err.toString())
					data.totalError = err.toString()
        } else {
          data.txnsTotal = result
        }
        cb(null, data)
      })
    },
		(res, cb) => {
			Block.find().sort({number: -1, timestamp: -1}).limit(50).exec((err, result) => {
				if (err) {
          logger.error(err.toString())
					data.blocksError = err.toString()
					data.blocks = []
        } else {
          for (let i = 0, len = result.length; i < len; i++) {
            result[i].reward = $$.fromWei(result[i].reward, 'ether')
          }
          data.blocks = result
				}
        cb(null, data)
			})
		}
	], () => {
    cacheData = data
    io.sockets.in('pushBlocksAndTxns').emit('pushBlocksAndTxns', data)
    // logger.info(data)
    setTimeout(() => {
      PushBlockInfo (io)
    }, pushTimeout)
	})
  // logger.info(987654)
}

function getCacheData(socket, type) {
  socket.emit(type, cacheData)
}


module.exports = {
  PushBlockInfo,
  getCacheData
}
