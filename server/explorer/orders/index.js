const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
const Orders = mongoose.model( 'Orders' )
const async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Orders')
function OrderList(socket, req, type) {
  // const transaction = (socket, req, type) => {
  let _params = {
    pageSize: req && req.pageSize ? req.pageSize : 20,
    skip: 0
  }
  _params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0
  let data = {
    msg: '',
    info: '',
    total: ''
  }
  type = type ? type : 'transaction'
  let params = {}
  if (req) {
    if (req.from && !req.to) {
      params.from = req.from
    }
    if (req.hash !== undefined) {
      params.hash = req.hash
    }
    if (req.to && !req.from) {
      params.to = req.to
    }
    if (req.from && req.to) {
      // { $or: [{"to": _params.addr}, {"from": _params.addr}] }
      params.$or = [{"to": req.to}, {"from": req.from}]
    }
    
    if (req.addr) {
      // { $or: [{"to": _params.addr}, {"from": _params.addr}] }
      params.$or = [{"to": req.addr}, {"from": req.addr}]
    }
    if (req.$or) {
      params.$or = req.$or
    }
  }
  logger.info(params)
  async.waterfall([
    (cb) => {
      Orders.find(params).countDocuments((err, result) => {
        if (!err) {
          data.msg = 'Success'
          data.total = result
          cb(null, data)
        } else {
          logger.error(err)
          data.msg = 'Error'
          data.error = err.toString()
          data.info = []
          cb(data)
        }
      })
    },
    (data, cb) => {
      Orders.find(params).lean(true).sort({"blockNumber": -1, 'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, result) => {
        if (!err) {
          data.msg = 'Success'
          data.info = result
          cb(null, data)
        } else {
          logger.error(err)
          data.msg = 'Error'
          data.error = err.toString()
          data.info = []
          cb(data)
        }
      })
    }
  ], (err, data) => {
    if (err) {
      socket.emit(type, err)
    } else {
      socket.emit(type, data)
    }
    logger.info('transaction callback data success')
  })
}

function OrderPage(socket, req, type) {
  let _params = {
    // timestamp: req.timestamp ? req.timestamp : 0
  }
  let sortId = 1
  if (req.page === 'next') {
    _params.blockNumber = {'$gt': req.blockNumber}
    // _params.timestamp = {'$gt': req.timestamp}
    // _params._id = {'$gt': req._id}
    sortId = 1
  } else {
    _params.blockNumber = {'$lt': req.blockNumber}
    // _params.timestamp = {'$lt': req.timestamp}
    // _params._id = {'$lt': req._id}
    sortId = -1
  }
  let data = {
    msg: '',
    info: {}
  }
  logger.info(_params)
  Transaction.find(_params).lean(true).sort({'blockNumber': sortId,'timestamp': sortId}).limit(1).exec((err,result) => {
    if (!err) {
      data.msg = 'Success'
      data.info = result[0]
      
    } else {
      logger.error(err)
      data.msg = 'Error'
      data.error = err.toString()
      data.info = {}
    }
    socket.emit(type, data)
    // logger.info('transferPage callback data success')
  })
}

module.exports = {
  List: OrderList,
  Page: OrderPage
}