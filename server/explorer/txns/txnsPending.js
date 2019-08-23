const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const Ordercache = mongoose.model('Ordercache')

const _async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('PushPublicData')

function pendingList (socket, req, type) {
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
  let params = {}
  if (req) {
    if (req.$or) {
      params.$or = req.$or
    }
  }
  _async.waterfall([
    (cb) => {
      Ordercache.find(params).countDocuments((err, result) => {
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
      Ordercache.find(params).lean(true).sort({"_id": -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, result) => {
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

function pendingDtil(socket, req, type) {
  let _params = {
    hash: req.hash ? req.hash : 0
  }
  let data = {
    msg: '',
    info: ''
  }
  logger.info(_params)		
  Ordercache.find({'hash': _params.hash}).lean(true).exec((err,result) => {
    if (!err) {
      data.msg = 'Success'
      if (result.length <= 0) {
        data.info = []
      } else {
        data.info = result[0]
      }
    } else {
      logger.error(err)
      data.msg = 'Error'
      data.info = []
      data.error = err.toString()
    }
    socket.emit(type, data)
    logger.info('transferDtil callback data success')
  })
}

function pendingPage (socket, req, type) {
  let _params = {
    // timestamp: req.timestamp ? req.timestamp : 0
  }
  let sortId = 1
  if (req.page === 'next') {
    // _params.page = {'$gt': _params.timestamp}
    _params.timestamp = {'$gt': req.timestamp}
    // _params._id = {'$gt': req._id}
    sortId = 1
  } else {
    // _params.page = {'$lt': _params.timestamp}
    _params.timestamp = {'$lt': req.timestamp}
    // _params._id = {'$lt': req._id}
    sortId = -1
  }
  let data = {
    msg: '',
    info: {}
  }
  logger.info(_params)
  Ordercache.find(_params).lean(true).sort({'timestamp': sortId}).limit(1).exec((err,result) => {
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
  pendingList,
  pendingDtil,
  pendingPage
}
