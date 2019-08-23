const path = require('path').resolve('.')
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const NewsSys = mongoose.model('NewsSys')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('NewsSys')

function newsList (socket, req, type) {
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
  NewsSys.find(params).sort({ sortId: 1 }).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function newsEdit (socket, req, type) {
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
    if (req.remark || req.remark === 0) {
      params.remark = req.remark
    }
    if (req.url || req.url === 0) {
      params.url = req.url
    }
    if (req.title || req.title === 0) {
      params.title = req.title
    }
    if (req.content || req.content === 0) {
      params.content = req.content
    }
    if (req.author || req.author === 0) {
      params.author = req.author
    }
  }
  params.updateTime = Date.now()
  NewsSys.updateOne({ _id: req.id }, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function newsAdd (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  let newsSys = new NewsSys({
    createTime: Date.now(),
    updateTime: Date.now(),
    sortId: req.sortId,
    isOutside: req.isOutside,
    isShow: req.isShow,
    url: req.url,
    remark: req.remark,
    title: req.title,
    content: req.content,
    author: req.author
  })
  newsSys.save((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function newsDele (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  NewsSys.remove({ _id: req.id }, (err, res) => {
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
  List: newsList,
  Edit: newsEdit,
  Dele: newsDele,
  Add: newsAdd
}
