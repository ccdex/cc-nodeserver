const path = require('path').resolve('.')
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const AdverSys = mongoose.model('AdverSys')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('AdverSys')

function adverList (socket, req, type) {
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
  AdverSys.find(params).sort({ sortId: 1 }).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function adverEdit (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  if (req) {
    if (req.sortId || req.sortId === 0) {
      params.sortId = req.sortId
    }
    if (req.isOutside || req.isOutside === 0) {
      params.isOutside = req.isOutside
    }
    if (req.isShow || req.isShow === 0) {
      params.isShow = req.isShow
    }
    if (req.img || req.img === 0) {
      params.img = req.img
    }
    if (req.remark || req.remark === 0) {
      params.remark = req.remark
    }
    if (req.url || req.url === 0) {
      params.url = req.url
    }
  }
  AdverSys.updateOne({ _id: req.id }, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function adverAdd (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  let adverSys = new AdverSys({
    timestamp: Date.now(),
    sortId: req.sortId,
    isOutside: req.isOutside,
    isShow: req.isShow,
    img: req.img,
    url: req.url,
    remark: req.remark
  })
  adverSys.save((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function adverDele (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  AdverSys.remove({ _id: req.id }, (err, res) => {
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
  List: adverList,
  Edit: adverEdit,
  Dele: adverDele,
  Add: adverAdd
}
