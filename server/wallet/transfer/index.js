const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const web3 = require(pathLink + '/server/public/methods/web3')
const $$ = require(pathLink + '/server/public/methods/methods')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Transfer')

const mongoose = require('mongoose')
const Transfer = mongoose.model('Transfer')
const _async = require('async')

// router.post('/sendTxn', function (req, res) {
function sendTxn(socket, req, type) {
  // logger.info('send txn objext:')
  // logger.info(req)
  let data = { msg: 'error', info: '' }
  let url = req.url ? req.url : $$.config.serverRPC
  web3.setProvider(new web3.providers.HttpProvider(url))

  _async.waterfall([
    (cb) => {
      if (!req.serializedTx) {
        if (req.hash) {
          cb(null, req.hash)
        } else {
          data = { msg: 'Error', info: 'hash is null' }
          cb(data)
        }
      } else {
        web3.eth.sendRawTransaction(req.serializedTx, (err, hash) => {
          if (err) {
            data.msg = 'Error'
            data.info = 'Transaction error!'
            data.error = err.toString()
            cb(data)
          } else {
            logger.info('create new hash:' + hash)
            logger.info(hash)
            cb(null, hash)
          }
        })
      }
    }
  ], (err, result) => {
    if (err) {
      data = err
    } else {
      data.msg = 'Success'
      data.info = result
    }
    socket.emit(type, data)
  })

}

// router.post('/history', function (req, res) {
function history(socket, req, type) {
  let data = {
    msg: 'error',
    info: ''
  }
  let _params = {
		pageSize: req && req.pageSize ? req.pageSize : 50,
		skip: 0
	}
  _params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0
  // logger.info(req)
  _async.waterfall([
    (cb) => {
      Transfer.find({from: req.from, coinType: req.coin}).sort({'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, results) => {
        if (err) {
          data.msg = 'Error'
          data.info = 'Send history find error!'
          data.error = err.toString()
          logger.error(err.toString())
          cb(data)
        } else {
          // logger.info(results)
          cb(null, results)
        }
      })
    },
    (dataArr, cb) => {
      Transfer.find({from: req.from, coinType: req.coin}).countDocuments((err, results) => {
        if (err) {
          data.msg = 'Error'
          data.info = 'Send history count find error!'
          data.error = err.toString()
          logger.error(err.toString())
          cb(data)
        } else {
          data.total = results
          cb(null, dataArr)
        }
      })
    }
  ], (err, result) => {
    if (err) {
      data = err
    } else {
      data.msg = 'Success'
      data.info = result
    }
    socket.emit(type, data)
  })
}

// router.post('/receiveHistory', function (req, res) {
function receiveHistory(socket, req, type) {
  let data = {
    msg: 'error',
    info: ''
  }
  let _params = {
		pageSize: req && req.pageSize ? req.pageSize : 50,
		skip: 0
	}
  _params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0
  // logger.info(req)
  _async.waterfall([
    (cb) => {
      Transfer.find({$or: [{to: req.to}, {contractTo: req.to}], coinType: req.coin, status: req.status}).sort({'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, results) => {
        if (err) {
          data.msg = 'Error'
          data.info = 'Receive history find error!'
          data.error = err.toString()
          cb(data)
        } else {
          // logger.info('results')
          // logger.info(results)
          data.info = results
          cb(null, results)
        }
      })
    },
    (dataArr, cb) => {
      Transfer.find({$or: [{to: req.to}, {contractTo: req.to}], coinType: req.coin, status: req.status}).countDocuments((err, results) => {
        if (err) {
          data.msg = 'Error'
          data.info = 'Receive history count find error!'
          data.error = err.toString()
          cb(data)
        } else {
          data.total = results
          cb(null, dataArr)
        }
      })
    }
  ], (err, result) => {
    if (err) {
      data = err
    } else {
      data.msg = 'Success'
      // data.info = result
    }
    socket.emit(type, data)
  })
}

module.exports = {
  sendTxn,
  history,
  receiveHistory
}
