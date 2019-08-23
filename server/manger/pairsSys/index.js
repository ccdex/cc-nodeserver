const path = require('path').resolve('.')
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const TxnsPairs = mongoose.model('TxnsPairs')
const web3 = require(pathLink + '/server/public/methods/web3')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('TxnsPairs')

function pairsList (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: []
  }
  // logger.info(req)
  if (req) {
    if (req.id) {
      params._id = req.id
    }
  }
  TxnsPairs.find(params).sort({ sortId: 1 }).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
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
  web3.lilo.xproAddNewTrade(req.trade)
  let pairsSys = new TxnsPairs({
    createTime: Date.now(),
    sortId: req.sortId,
    isShow: req.isShow,
    isTop: req.isTop,
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
  for (let pair of pairData) {
    pairArr.push({
      createTime: Date.now(),
      sortId: 0,
      isShow: 1,
      isTop: 0,
      remark: '',
      trade: pair
    })
  }
  TxnsPairs.insertMany(pairArr, { ordered: false }, (err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
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
