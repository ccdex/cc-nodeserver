const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const DevUser = mongoose.model('DevUser')
// const https = require('https')
const fetch = require("node-fetch")
// const formidable = require('formidable')
const fs = require('fs')
const async = require('async')

const $$ = require(pathLink + '/server/public/methods/methods')
const gitConfig = require(pathLink + '/static/js/config/github')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Register')

function getGitUserInfo(type, socket, req) {
  const params = {
    client_id: gitConfig.client_id,
    client_secret: gitConfig.client_secret,
    code: req.code
  }
  fetch(gitConfig.loginURL, {
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
    let url = gitConfig.userURL + token
    fetch(url).then(res2 => {
      return res2.json()
    }).then(response => {
      // logger.info(response)
      if (response.login) {
        socket.emit(type, {
          msg: 'Success',
          username: response.login,
          email: response.email
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

// function invitation (type, socket, req) {
//   fetch(gitConfig.invitItemURL, {
//     method: "PUT",
//     headers: {
//       "Authorization": gitConfig.Authorization,
//       "Accept": gitConfig.Accept
//     },
//   }).then(res => {
//       console.log(res)
//       console.log(res.text())
//   })
// }

function joinCM (type, socket, req) {
  let data = {
    msg: 'Error',
    info: ''
  }
  // logger.info(req)
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
  async.waterfall([
    (cb) => {
      DevUser.findOne({gitID: req.gitID}).exec((err, res) => {
        let state = {id: "", isInvited: ""}
        if (res && res.gitID) {
          state = {gitID: res.gitID, isInvited: res.isInvited ? res.isInvited : 0}
        }
        cb(null, state)
      })
    },
    (state, cb) => {
      if (state.gitID && state.isInvited) {
        cb(null, 1)
      } else {
        let url = gitConfig.invitItemURL + req.gitID.replace(/\s/g, '')
        // let url = gitConfig.invitItemURL + 'winter15627'
        fetch(url, {
          method: "PUT",
          headers: {
            "Authorization": gitConfig.Authorization,
            "Accept": gitConfig.Accept
          },
        }).then(res => {
          if (res.status === 200) {
            cb(null, 1)
          } else {
            cb(null, 0)
          }
        })
      }
    },
    (status, cb) => {
      if (req.gitID.replace(/\s/g, '') === req.ref.replace(/\s/g, '')) {
        req.ref = ''
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
        isInvited: status,
        timestamp: Date.now()
      }
      // logger.info(params)
      DevUser.update({gitID: req.gitID}, {'$set': params}, {upsert: true}).exec((err, res) => {
        if (err) {
          logger.error(err.toString())
          data.error = err.toString()
        } else {
          data.msg = 'Success'
          data.info = res
        }
        cb(null, data)
      })
    }
  ], () => {
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
      // logger.info(res)
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
  // logger.info(req)
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
    let fileUrl = $$.config.file.upload + req.substr(req.lastIndexOf('/') + 1)
    // logger.info(req)
    // logger.info(fileUrl)
    // logger.info(req.lastIndexOf('/'))

    if (fs.existsSync(fileUrl)) {
      fs.unlinkSync(fileUrl)
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

