const path = require('path').resolve('.')
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const NewsSys = mongoose.model('NewsSys')
const async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('NewsSys')

function newsList (socket, req, type) {
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
      // logger.info(isNaN(req.searchVal))
      // const reg = new RegExp(req.searchVal, 'ig') 
      if (req.type) {
        const reg = new RegExp(req.searchVal, 'ig') 
        params[req.searchKey] = {'$regex': reg}
      } else {
        params[req.searchKey] = req.searchVal
      }
    }
    if (req.timestamp) {
      params.timestamp = req.timestamp
    }
  }

  async.waterfall([
    (cb) => {
      NewsSys.find(params).sort({sortId: 1, 'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      NewsSys.find(params).countDocuments((err, results) => {
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
