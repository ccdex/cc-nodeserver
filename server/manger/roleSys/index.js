const path = require('path').resolve('.')
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const RoleSys = mongoose.model('RoleSys')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('RoleSys')


function roleList(socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: []
  }
  RoleSys.find(params).exec((err, res) => {
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
