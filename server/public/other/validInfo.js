const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
const Transaction = mongoose.model( 'Transaction' )
const DexTxns = mongoose.model( 'DexTxns' )

const async = require('async')

const web3 = require(pathLink + '/server/public/methods/web3')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('ValidInfo')


function validSearchType (socket, req, type) {
  // logger.info(req)
  let data = { msg: '', info: '' }
  async.waterfall([
    (cb) => {
      if (web3.isAddress(req)) {
        data = { msg: 'Success', info: 0 }
        // logger.info(data)
        cb(data)
      } else {
        // logger.info(1)
        cb(null, req)
      }
    },
    (info, cb) => {
      if (!isNaN(req) && req.indexOf('0x') !== 0) {
        data = { msg: 'Success', info: 1 }
        // logger.info(data)
        cb(data)
      } else {
        // logger.info(2)
        cb(null, req)
      }
    },
    (info, cb) => {
      Transaction.find({hash: req}).exec((err, res) => {
        // logger.info(err)
        // logger.info(res)
        if (res && res.length > 0) {
          data = { msg: 'Success', info: 2 }
          // logger.info(data)
          cb(data)
        } else {
          // logger.info(3)
          cb(null, req)
        }
      })
    },
    (info, cb) => {
      DexTxns.find({hash: req}).exec((err, res) => {
        if (res && res.length > 0) {
          data = { msg: 'Success', info: 3 }
          // logger.info(data)
          cb(data)
        } else {
          // logger.info(4)
          cb(null, req)
        }
      })
    },
  ], (typeData, res) => {
    
    if (typeData) {
      socket.emit(type, typeData)
    } else {
      data = { msg: 'Success', info: '' }
      socket.emit(type, data)
    }
  })
  // if (web3.isAddress(req)) { // Address
  //   data = { msg: 'Success', info: 0 }
  // } else if (!isNaN(req) && req.indexOf('0x') !== 0) { // block number
  //   data = { msg: 'Success', info: 1 }
  // } else if (req.indexOf('0x') === 0) { // hash
  //   data = { msg: 'Success', info: 2 }
  // } else {
  //   data = { msg: 'Success', info: '' }
  // }
  // socket.emit(type, data)
}

module.exports = {
  validSearchType
}