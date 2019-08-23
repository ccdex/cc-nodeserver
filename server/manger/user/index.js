const path = require('path').resolve('.')
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const Users = mongoose.model('Users')
const encryption = require(pathLink + '/server/public/methods/encryption')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Users')

function createUser (socket, req, type) {
  let params = {}
  let data = { msg: 'Error', info: '' }

  logger.info(req)

  if (req && req.mobile) {
    params.mobile = req.mobile
  } else {
    data = { msg: 'Error', info: 'Mobile phone number cannot be empty!' }
    socket.emit(type, data)
    return
  }
  if (req && req.password) {
    params.password = encryption(req.password)
  } else {
    data = { msg: 'Error', info: 'Password cannot be empty!' }
    socket.emit(type, data)
    return
  }
  logger.info(params)
  let user = new Users({
    username: '',
    mobile: params.mobile,
    password: params.password,
    createTime: Date.now(),
    updateTime: Date.now(),
    role: 3,
    latestLoginIP: req.latestLoginIP,
    latestLoginCity: req.latestLoginCity,
  })
  logger.info(user)
  user.save((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function deleUser (socket, req, type) {
  let params = {}
  let data = { msg: 'Error', info: '' }
  if (req && req.mobile) {
    params.mobile = req.mobile
  } else {
    data = { msg: 'Error', info: 'Mobile phone number cannot be empty!' }
    socket.emit(type, data)
    return
  }
  Users.remove(params, (err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function editUser (socket, req, type) {
  let params = {}, findParam = {}
  let data = { msg: 'Error', info: '' }
  if (req && req.mobile) {
    params.mobile = req.mobile
  } else {
    data = { msg: 'Error', info: 'Mobile phone number cannot be empty!' }
    socket.emit(type, data)
    return
  }
  if (req) {
    if (req.role || req.role === 0) {
      params.role = req.role
    }
    if (req.password || req.password === 0) {
      params.password = encryption(req.password)
    }
    if (req.username || req.username === 0) {
      params.username = req.username
    }
    
    if (req.latestLoginIP || req.latestLoginIP === 0) {
      params.latestLoginIP = req.latestLoginIP
    }
    if (req.latestLoginCity || req.latestLoginCity === 0) {
      params.latestLoginCity = req.latestLoginCity
    }
    
    if (req.oldPwd) {
      findParam.password = encryption(req.oldPwd)
    }
  }
  params.updateTime = Date.now()
  findParam.mobile = req.mobile
  Users.updateOne(findParam, params).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function findUser (socket, req, type) {
  let params = {}
  let data = { msg: 'Error', info: '' }
  // logger.info(req)
  if (req) {
    if (req.id) {
      params._id = req.id
    }
    if (req.username) {
      params.username = req.username
    }
    if (req.mobile) {
      params.mobile = req.mobile
    }
    if (req.role) {
      params.role = req.role
    }
  }
  Users.find(params).sort({ role: 1 }).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function validUser (socket, req, type) {
  let params = {}, updateParams = {}
  let data = { msg: 'Error', info: '' }
  // logger.info(req)
  if (req) {
    if (req.password || req.password === 0) {
      params.password = encryption(req.password)
    }
    if (req.username) {
      params.$or = [{username: req.username}]
      if (!isNaN(req.username)) {
        params.$or.push({mobile: req.username})
      }
      // {
      //   username: req.username,
      //   mobile: req.mobile,
      // }
    }
    if (req.latestLoginIP || req.latestLoginIP === 0) {
      updateParams.latestLoginIP = req.latestLoginIP
    }
    if (req.latestLoginCity || req.latestLoginCity === 0) {
      updateParams.latestLoginCity = req.latestLoginCity
    }
    updateParams.updateTime = Date.now()
  }
  logger.info(params)
  Users.find(params).sort({ role: 1 }).exec((err, res) => {
    if (err) {
      data.error = err.toString()
      data.info = 'No such user'
    } else {
      // logger.info(res)
      if (res.length > 0) {
        data.msg = 'Success'
        data.info = res
        Users.updateOne({_id: res[0]._id}, updateParams).exec((error, results) => {
          if (error) {
            logger.error(error.toString())
          } else {
            logger.info(results)
          }
        })
      } else {
        data.msg = 'Null'
        data.info = 'No such user'
      }
    }
    socket.emit(type, data)
  })
}

module.exports = {
  createUser,
  deleUser,
  editUser,
  findUser,
  validUser
}