const path = require('path').resolve('.')
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const RoleSys = mongoose.model('RoleSys')
const async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('RoleSys')


function roleList(socket, req, type) {
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
      params.updatetime = req.timestamp
    }
  }

  async.waterfall([
    (cb) => {
      RoleSys.find(params).sort({'updatetime': -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err, res) => {
        if (err) {
          cb(err)
        } else {
          cb(null, res)
        }
      })
    },
    (list, cb) => {
      RoleSys.find(params).countDocuments((err, results) => {
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
  // RoleSys.find(params).exec((err, res) => {
  //   if (err) {
  //     logger.error(err.toString())
  //     data.err = err.toString()
  //   } else {
  //     data.msg = 'Success'
  //     data.info = res
  //   }
  //   socket.emit(type, data)
  // })
}

function roleEdit(socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: []
  }
  RoleSys.updateOne(params,{}).exec((err, res) => {
    if (err) {
      logger.error(err.toString())
      data.err = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function roleAdd(socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: []
  }
  let roleSys = new RoleSys({
    name: req.name,
    type: req.type,
    limitAuthor: req.limitAuthor,
    createtime: Date.now(),
    updatetime: Date.now(),
  })
  roleSys.save((err, res) => {
    if (err) {
      logger.error(err.toString())
      data.err = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function roleDele(socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: []
  }
  RoleSys.remove(params).exec((err, res) => {
    if (err) {
      logger.error(err.toString())
      data.err = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

module.exports = {
  List: roleList,
  Edit: roleEdit,
  Add: roleAdd,
  Dele: roleDele
}
