const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
const DexTxns = mongoose.model( 'DexTxns' )
const async = require('async')
// const web3 = require(pathLink + '/server/public/methods/web3')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('TxnsDex')



// function transaction(socket, req, type) {
function TxnsList(socket, req, type) {
// const transaction = (socket, req, type) => {
  let _params = {
    pageSize: req && req.pageSize ? req.pageSize : 20,
    skip: 0
  }
  _params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0
  let data = {
    msg: '',
    info: [],
    total: ''
  }
  let params = {}
  if (req) {
    if (req.parentHash) {
      params.parentHash = req.parentHash
    }
    if (req.number || req.number === 0) {
      params.number = req.number
    }
    if (req.from && !req.to) {
      params.from = req.from
    }
    if (req.hash !== undefined) {
      params.hash = req.hash
    }
    if (req.side) {
      params.side = req.side
    }
    
    if (req.trade) {
      params.trade = req.trade
    }
    if (req.$or) {
      params.$or = req.$or
    }
  }
  async.waterfall([
    (cb) => {
      DexTxns.find(params).countDocuments((err, result) => {
        if (!err) {
          data.msg = 'Success'
          data.total = result
          cb(null, data)
        } else {
					logger.error(err.toString())
          data.msg = 'Error'
					data.error = err.toString()
          data.info = []
          cb(data)
        }
      })
    },
    (data, cb) => {
      DexTxns.find(params).lean(true).sort({"number": -1, 'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, result) => {
        if (!err) {
          data.msg = 'Success'
          data.info = result
          cb(null, data)
        } else {
					logger.error(err.toString())
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

// router.post('/transferDtil', (req, res) => {
// function transferDtil(socket, req, type) {
function TxnsDtil(socket, req, type) {
  let _params = {
    hash: req.hash ? req.hash : 0
  }
  let data = {
    msg: '',
    info: {}
  }
  logger.info(_params)
  DexTxns.find({'hash': _params.hash}).sort({'Number': 1}).lean(true).exec((err,result) => {
    if (!err) {
      if (result.length <= 0) {
        data.msg = 'Null'
        data.info = {}
      } else {
        data.msg = 'Success'
        // result[0].actualTx = web3.fromWei(Number(result[0].gasUsed) * Number(result[0].gasPrice), 'gwei')
        // result[0].fee = web3.fromWei(Number(result[0].gasUsed) * Number(result[0].gasPrice), 'ether')
        data.info = result
      }
    } else {
      logger.error(err.toString())
      data.msg = 'Error'
      data.info = {}
      data.error = err.toString()
    }
    socket.emit(type, data)
    logger.info('transferDtil callback data success')
  })
}

// router.post('/transferPage', (req, res) => {
// function transferPage(socket, req, type) {
function TxnsPage(socket, req, type) {
  let _params = {
    // timestamp: req.timestamp ? req.timestamp : 0
  }
  let sortId = 1
  if (req.page === 'next') {
    _params.number = {'$gt': req.number}
    // _params.timestamp = {'$gt': req.timestamp}
    // _params._id = {'$gt': req._id}
    sortId = 1
  } else {
    _params.number = {'$lt': req.number}
    // _params.timestamp = {'$lt': req.timestamp}
    // _params._id = {'$lt': req._id}
    sortId = -1
  }
  let data = {
    msg: '',
    info: {}
  }
  logger.info(_params)
  DexTxns.find(_params).lean(true).sort({'number': sortId,'timestamp': sortId}).limit(1).exec((err,result) => {
    if (!err) {
      data.msg = 'Success'
      data.info = result
    } else {
      logger.error(err.toString())
      data.msg = 'Error'
      data.error = err.toString()
      data.info = {}
    }
    socket.emit(type, data)
    // logger.info('transferPage callback data success')
  })
}

module.exports = {
  List : TxnsList,
  Dtil : TxnsDtil,
  Page : TxnsPage
}