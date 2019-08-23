const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
const Transaction = mongoose.model( 'Transaction' )
const async = require('async')
const web3 = require(pathLink + '/server/public/methods/web3')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Txns')



// function transaction(socket, req, type) {
function TxnsList(socket, req, type, io) {
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
    if (req.blockHash) {
      params.blockHash = req.blockHash
    }
    if (req.blockNumber || req.blockNumber === 0) {
      params.blockNumber = req.blockNumber
    }
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
    if (req.isERC20) {
      params.isERC20 = req.isERC20
    }
    if (req.type) {
      params.type = req.type
    }
    if (req.$or) {
      params.$or = req.$or
    }
  }
  async.waterfall([
    (cb) => {
      Transaction.find(params).countDocuments((err, result) => {
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
      Transaction.find(params).lean(true).sort({"blockNumber": -1, 'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, result) => {
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
    // if (err) {
    //   socket.emit(type, err)
    // } else {
    //   socket.emit(type, data)
    // }
    // logger.info('transaction callback data success')
    let cbData = ''
		if (err) {
			// socket.emit(type, err)
			cbData = err
		} else {
			// socket.emit(type, data)
			cbData = data
		}
		if (io) {
			io.sockets.in(type).emit(type, cbData)
		} else {
			socket.emit(type, cbData)
		}
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
    info: ''
  }
  logger.info(_params)		
  Transaction.find({'hash': _params.hash}).lean(true).exec((err,result) => {
    if (!err) {
      data.msg = 'Success'
      if (result.length <= 0) {
        data.info = []
      } else {
        result[0].actualTx = web3.fromWei(Number(result[0].gasUsed) * Number(result[0].gasPrice), 'gwei')
        result[0].fee = web3.fromWei(Number(result[0].gasUsed) * Number(result[0].gasPrice), 'ether')
        
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

// router.post('/transferPage', (req, res) => {
// function transferPage(socket, req, type) {
function TxnsPage(socket, req, type) {
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
  List : TxnsList,
  Dtil : TxnsDtil,
  Page : TxnsPage
}