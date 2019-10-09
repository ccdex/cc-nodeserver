const path = require('path').resolve('.')
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const DevUser = mongoose.model('DevUser')
const async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('DevUser')

function CmList (socket, req, type) {
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
      DevUser.find(params).sort({'timestamp': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      DevUser.find(params).countDocuments((err, results) => {
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

function CmEdit (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  if (req) {
    if (req.gitID || req.gitID === 0) {
      params.gitID = req.gitID
    }
    if (req.wx || req.wx === 0) {
      params.wx = req.wx
    }
    if (req.email || req.email === 0) {
      params.email = req.email
    }
    if (req.work || req.work === 0) {
      params.work = req.work
    }
    if (req.city || req.city === 0) {
      params.city = req.city
    }
    if (req.skill || req.skill === 0) {
      params.skill = req.skill
    }
    if (req.fileUrl || req.fileUrl === 0) {
      params.fileUrl = req.fileUrl
    }
    if (req.ref || req.ref === 0) {
      params.ref = req.ref
    }
    if (req.address || req.address === 0) {
      params.address = req.address
    }
  }
  params.timestamp = Date.now()
  DevUser.updateOne({ _id: req.id }, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function CmAdd (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }

  let CmSys = new DevUser({
    gitID: req.gitID.replace(/\s/g, ''),
    wx: req.wx.replace(/\s/g, ''),
    email: req.email.replace(/\s/g, ''),
    work: req.work.replace(/\s/g, ''),
    city: req.city.replace(/\s/g, ''),
    skill: req.skill.replace(/\s/g, ''),
    fileUrl: req.fileUrl,
    ref: req.ref.replace(/\s/g, ''),
    address: req.address.replace(/\s/g, ''),
    timestamp: Date.now()
  })
  CmSys.save((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function CmDele (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: ''
  }
  DevUser.remove({ _id: req.id }, (err, res) => {
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
  List: CmList,
  Edit: CmEdit,
  Dele: CmDele,
  Add: CmAdd
}
