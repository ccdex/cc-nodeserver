const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const DevUser = mongoose.model('DevUser')
// const https = require('https')
const fetch = require("node-fetch")
// const formidable = require('formidable')
const fs = require('fs')

const $$ = require(pathLink + '/server/public/methods/methods')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Register')

function getGitUserInfo(type, socket, req) {

  let url = $$.config.github.url
  const params = {
    client_id: $$.config.github.client_id,
    client_secret: $$.config.github.client_secret,
    code: req.code
  }
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(params)
  }).then(res => {
    // logger.info(res)
    return res.text()
  }).then(body => {
    //解析并返回access_token
    let args = body.split("&")
    let arg = args[0].split("=")
    let access_token = arg[1]
    // logger.info(access_token)
    return access_token
  }).then(token => {
    let url = "https://api.github.com/user?access_token=" + token
    fetch(url).then(res2 => {
      return res2.json()
    }).then(response => {
      // logger.info(response)
      if (response.login) {
        socket.emit(type, {
          msg: 'Success',
          username: response.login
        })
      } else {
        socket.emit(type, {
          msg: 'Error',
          error: 'Timeout'
        })
      }
    })
  })
}

function joinCM (type, socket, req) {
  let data = {
    msg: 'Error',
    info: ''
  }
  logger.info(req)
  if (
    !req.gitID ||
    !req.wx ||
    !req.email ||
    !req.work ||
    !req.city ||
    !req.skill ||
    // !req.fileUrl ||
    !req.ref
  ) {
    data.error = '必填项不得为空'
    socket.emit(type, data)
    return
  }
  let params = {
    gitID: req.gitID.replace(/\s/g, ''),
    wx: req.wx.replace(/\s/g, ''),
    email: req.email.replace(/\s/g, ''),
    work: req.work.replace(/\s/g, ''),
    city: req.city.replace(/\s/g, ''),
    skill: req.skill.replace(/\s/g, ''),
    fileUrl: req.fileUrl,
    ref: req.ref.replace(/\s/g, ''),
    address: req.address.replace(/\s/g, ''),
    createTime: Date.now()
  }
  // logger.info(params)
  DevUser.update({gitID: req.gitID}, {'$set': params}, {upsert: true}).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      data.msg = 'Success'
      data.info = res
    }
    socket.emit(type, data)
  })
}

function findDevUser (type, socket, req) {
  let data = {
    msg: 'Error',
    info: []
  }
  DevUser.findOne({gitID: req.gitID}).exec((err, res) => {
    if (err) {
      data.error = err.toString()
    } else {
      logger.info(res)
      if (res && res.gitID) {
        data.msg = 'Success'
        data.info = res
      } else {
        data.msg = 'Null'
      }
    }
    socket.emit(type, data)
  })
}

function uploadFile (type, socket, req) {
  logger.info(req)
  socket.emit(type, req)
  // let  form = new formidable.IncomingForm()
  // form.uploadDir = req.name
  // form.keepExtensions = true

  // form.on('field', (field, value) => {
  //   console.log(field)
  //   console.log(value)
  // })
  // form.on('end', () => {
  //   res.end('上传完成!')
  // })

  // form.parse(req)
}

function removeFile (type, socket, req) {
  // logger.info(fs.existsSync(req))
  try {
    if (fs.existsSync(req)) {
      fs.unlinkSync(req)
      socket.emit(type, {
        msg: 'Success',
        tip: 'Remove file success!'
      })
    } else {
      socket.emit(type, {
        msg: 'Null',
        tip: 'File is Null!'
      })
    }
  } catch (error) {
    socket.emit(type, {
      msg: 'Error',
      error: error.toString()
    })
  }
}


module.exports = {
  getGitUserInfo,
  joinCM,
  findDevUser,
  removeFile,
  uploadFile
}

