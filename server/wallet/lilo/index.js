const path = require("path").resolve(".")
const pathLink = path
// const pathLink = './server/public/methods/'
require(pathLink + '/server/public/methods/db.js')
const httpReq = require(pathLink + '/server/public/methods/httpReq')
const $$ = require(pathLink + '/server/public/methods/methods')
// const web3 = require(pathLink + '/server/public/methods/web3')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('lilo')

// logger.info(__dirname)


const mongoose = require('mongoose')
const Lockouts = mongoose.model('Lockouts')
const _async = require('async')
// const configData = require('../../static/js/config')

// router.post('/sendTxn', (req, res) => {
// function sendTxn(socket, req, type) {
//   let data = { msg: 'Error', info: '' }
//   if (!req.serializedTx) {
//     data = { msg: 'Error', info: 'serializedTx is null' }
//     socket.emit(type, data)
//     return
//   }
//   let url = req.url ? req.url : $$.config.serverRPC
//   web3.setProvider(new web3.providers.HttpProvider(url))

//   // logger.info(req)

//   web3.eth.sendRawTransaction(req.serializedTx, (err, hash) => {
//     if (err) {
//       data.msg = 'Error'
//       data.info = 'Transaction error!'
//       data.error = err.toString()
//       logger.error('serializedTx error')
//       logger.error(err.toString())
//       cb(data)
//     } else {
//       // cb(null, hash)
//       data.msg = 'Success'
//       data.info = hash
//     }
//     socket.emit(type, data)
//   })
// }

function lockOutHistory(socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  let _params = {
		pageSize: req && req.pageSize ? req.pageSize : 50,
		skip: 0
	}
  _params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0

  let fromAddress = req.from ? req.from : ''
  _async.waterfall([
    (cb) => {
      Lockouts.find({from: fromAddress, coinType: req.coin}).sort({'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, results) => {
        if (err) {
          data.msg = 'Error'
          data.info = err
          data.error = err
          cb(data)
        } else {
          data.info = results
          // logger.info(results)
          cb(null, results)
        }
      })
    },
    (dataArr, cb) => {
      Lockouts.find({from: fromAddress, coinType: req.coin}).countDocuments((err, results) => {
        if (err) {
          data.msg = 'Error'
          data.info = err
          data.error = err
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

// router.post('/lockin', (req, res) => {
function lockin(socket, req, type) {
  if (!req.hash || !req.coin)  {
    data = { msg: 'Error', info: 'params is error!' }
    socket.emit(type, data)
    return
  }
  // const https = require('https')
	var url = $$.config.liloTxnUrl + '/gettransaction?txhash=' + req.hash + '&cointype=' + req.coin
  
  let httpType = httpReq.http
  if (url.indexOf('https') !== -1) {
    httpType = httpReq.https
  }

  httpType.setRequestTime(1000 * 50)
  httpType.get(url).then(results => {
    logger.info(url)
    logger.info(results)
    if (results.code) {
      let txnsObj = results.info
      if (txnsObj.result && txnsObj.result.FromAddress && txnsObj.result.TxOutputs) {
        let fromAddress = txnsObj.result.FromAddress
        let txnsArr = txnsObj.result.TxOutputs
        for (let arr of txnsArr) {
          if (arr.ToAddress.toLowerCase() === fromAddress.toLowerCase()) {
            data = { msg: 'Success', info: '' }
            socket.emit(type, data)
            return
          }
        }
        let to_value = 0
        for (let arr of txnsArr) {
          // logger.info(arr.ToAddress.toLowerCase())
          // logger.info(req.dcrmAddress.toLowerCase())
          // logger.info(arr.ToAddress.toLowerCase() === req.dcrmAddress.toLowerCase())
          if (arr.ToAddress.toLowerCase() === req.dcrmAddress.toLowerCase()) {
            to_value = Number(arr.Amount)
            // logger.info(to_value)
          }
        }
        data = { msg: 'Success', info: to_value }
      } else {
        data = { msg: 'Error', info: 'Query is error!', error: results.info.toString() }
      }
    } else {
      logger.error(results)
      data = { msg: 'Error', info: 'Query is null!', error: results.msg}
    }
    socket.emit(type, data)
  })
}

module.exports = {
  // sendTxn,
  lockOutHistory,
  lockin
}
