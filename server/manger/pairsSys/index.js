const path = require('path').resolve('.')
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const TxnsPairs = mongoose.model('TxnsPairs')
const web3 = require(pathLink + '/server/public/methods/web3')
const async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('TxnsPairs')

function pairsList (socket, req, type) {
  let _params = {
		pageSize: req && req.pageSize ? req.pageSize : 50,
		skip: 0
	}
  _params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0

  let data = { msg: 'Error', info: [] },
      params = {}
  
  if (req) {
    if (req.id) {
      params._id = req.id
    }
    if (req.searchVal && req.searchKey) {
      if (req.type) {
        const reg = new RegExp(req.searchVal, 'ig') 
        params[req.searchKey] = {'$regex': reg}
      } else {
        params[req.searchKey] = req.searchVal
      }
    }
    if (req.timestamp) {
      params.createTime = req.timestamp
    }
  }

  async.waterfall([
    (cb) => {
      TxnsPairs.find(params).sort({sortId: 1, 'createTime': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      TxnsPairs.find(params).countDocuments((err, results) => {
        if (err) {
          cb(err)
        } else {
          data.total = results
          data.info = list
          cb(null, data)
        }
      })
    }
  ], (err, res) => {
    if (err) {
      data.msg = 'Error'
      data.error = err.toString()
      logger.error(err.toString())
    } else {
      data.msg = 'Success'
      // logger.info(123)
    }
    socket.emit(type, data)
  })

  // TxnsPairs.find(params).sort({ sortId: 1 }).exec((err, res) => {
  //   if (err) {
  //     data.error = err.toString()
  //   } else {
  //     data.msg = 'Success'
  //     data.info = res
  //   }
  //   socket.emit(type, data)
  // })
}

function pairsEdit (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  if (req) {
    if (req.sortId || req.sortId === 0) {
      params.sortId = req.sortId
    }
    if (req.isShow || req.isShow === 0) {
      params.isShow = req.isShow
    }
    if (req.isTop || req.isTop === 0) {
      params.isTop = req.isTop
    }
    if (req.remark || req.remark === 0) {
      params.remark = req.remark
    }
    if (req.trade || req.trade === 0) {
      params.trade = req.trade
    }
  }
  params.updateTime = Date.now()
  TxnsPairs.updateOne({ _id: req.id }, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function pairsAdd (socket, req, type) {
  // let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  try {
    let newPair = web3.lilo.xproAddNewTrade(req.trade)
    logger.info(newPair)
    let pairsSys = new TxnsPairs({
      createTime: Date.now(),
      sortId: req.sortId ? req.sortId : 0,
      isShow: req.isShow ? req.isShow : 1,
      isTop: req.isTop ? req.isTop : 0,
      remark: req.remark,
      trade: req.trade
    })
    pairsSys.save((err, res) => {
      if (err) {
        data.error = err.toString()
      } else {
        data.msg = 'Success'
        data.info = res
      }
      socket.emit(type, data)
    })
  } catch (error) {
    socket.emit(type, data)
  }
}

function pairsDele (socket, req, type) {
  // let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  TxnsPairs.remove({ _id: req.id }, (err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function oneTouchPair (socket, req, type) {
  let pairData = [], pairArr = []
  let data = {
    msg: 'Error',
    info: ''
  }
  try {
    pairData = web3.lilo.getPairList().split(':')
  } catch (error) {
    pairData = []
  }
  logger.info(pairData)
  let timestamp = Date.now()
  async.eachSeries(pairData, (pair, cb) => {
    let updateObj = {
      createTime: timestamp,
      sortId: 0,
      isShow: 1,
      isTop: 0,
      remark: '',
      trade: pair
    }
    TxnsPairs.update({trade: pair}, {'$set': updateObj}, {upsert: true}).exec((err, res) => {
      if (err) {
        data.error = err.toString()
      } else {
        data.msg = 'Success'
        data.info = res
      }
      cb(null, pair + 'add success')
    })
  }, () => {
    socket.emit(type, data)
  })
}

module.exports = {
  List: pairsList,
  Edit: pairsEdit,
  Dele: pairsDele,
  Add: pairsAdd,
  oneTouchPair
}
