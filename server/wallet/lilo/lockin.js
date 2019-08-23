const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const httpReq = require(pathLink + '/server/public/methods/httpReq')
const $$ = require(pathLink + '/server/public/methods/methods')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('lockin')

const mongoose = require('mongoose')
const Lockins = mongoose.model('Lockins')
const _async = require('async')

function lockInHistory(socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  let _params = {
		pageSize: req && req.pageSize ? req.pageSize : 100,
		skip: 0
	}
  _params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0
  
  let fromAddress = req.from ? req.from : ''
  _async.waterfall([
    (cb) => {
      Lockins.find({from: fromAddress, coinType: req.coin}).sort({'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, results) => {
        if (err) {
          data.msg = 'Error'
          data.info = err
          data.error = err
          cb(data)
        } else {
          cb(null, results)
          // logger.info(results)
        }
      })
    },
    (arr, cb) => {
      // logger.info(req.coin)
      // logger.info(fromAddress)
      // let url = getLockinUrl({coin: req.coin, address: req.from})
      // $$.getCoinInfo(req.coin, 'isCase')
      let url = $$.config.liloAddrUrl + `txs/${req.coin}/${req.dcrmAddress}`

      // const url = 'http://5.189.139.168:5000/txs/ETH/0x0196c2126d248a846a610f5e189ebf6b5ac3d238'
      logger.info(url)
      let httpType = httpReq.http
      if (url.indexOf('https') !== -1) {
        httpType = httpReq.https
      }
      try {
        httpType.setRequestTime(1000 * 30)
        httpType.get(url).then(results => {
          let txnsArr = [], txnsObj = {}, txnsArr1 = []
          logger.info(results)
          if (results.code) {
            txnsArr = results.info
            for (let obj of txnsArr) {
              for (let obj1 of obj.TxOutputs) {
                if (obj1.ToAddress.toLowerCase() === req.dcrmAddress.toLowerCase()) {
                  txnsArr1.push({
                    // timestamp: obj.Timestamp,
                    timestamp: Date.now(),
                    from: obj.FromAddress,
                    to: obj1.ToAddress,
                    value: obj1.Value,
                    outHash: obj.Txhash
                  })
                }
              }
            }
            logger.info(txnsArr1)
            cb(null, arr, txnsArr1)
          } else {
            // logger.error(results.msg + ':' + url)
            logger.error(results)
            cb(null, arr, [])
          }
        })
      } catch (error) {
        data = { msg: 'Error', info: 'Get lockin info error!', error: error.toString() }
        cb(data)
      }
    },
    (data, urldata, cb) => {
      let arrObj = []
      let newArr = []
      let objArr = {}
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          arrObj.push(data[i])
        }
      }
      if (urldata && urldata.length > 0 && (typeof urldata).toLowerCase() === "object") {
        for (let i = 0; i < urldata.length; i++) {
          if  (urldata[i].to.toLowerCase() === req.dcrmAddress.toLowerCase()) {
            arrObj.push(urldata[i])
          }
        }
      }
      for (let i = 0; i < arrObj.length; i++) {
        if (!objArr[arrObj[i].outHash]) {
          newArr.push(arrObj[i])
          objArr[arrObj[i].outHash] = true
        }
      }
      for (let i = 0; i < newArr.length; i++) {
        if (!newArr[i].hash) {
          newArr[i].status = '3'
          newArr[i].hash = newArr[i].outHash
          newArr[i].value2 = newArr[i].value
          // logger.info(newArr[i].value)
          // logger.info(req.coin)
          newArr[i].value = $$.fromWei(newArr[i].value, req.coin)
        } else {
          newArr[i].value = newArr[i].contractValue ? Number(Number(newArr[i].contractValue).toFixed(16)) : Number(Number(newArr[i].value).toFixed(16))
        }
      }
      cb(null, newArr)
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
module.exports = {
  lockInHistory
}