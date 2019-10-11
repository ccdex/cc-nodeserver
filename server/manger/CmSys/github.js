const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const DevUser = mongoose.model('DevUser')
// const https = require('https')
const fetch = require("node-fetch")
// const formidable = require('formidable')
const async = require('async')

const $$ = require(pathLink + '/server/public/methods/methods')
const gitConfig = require(pathLink + '/static/js/config/github')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Github')

function goInvited (socket, req, type) {
  // logger.info(req)
  let data = {
    msg: 'Error',
    info: ''
  }
  // logger.info('req')
  // logger.info(req)
  // logger.info('req')
  async.waterfall([
    (cb) => {
      let url = gitConfig.invitItemURL + req.gitID.replace(/\s/g, '')
      // let url = gitConfig.invitItemURL + 'winter15627'
      fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": gitConfig.Authorization,
          "Accept": gitConfig.Accept
        },
      }).then(res => {
        // logger.info(res)
        if (res.status === 200) {
          cb(null, 1)
        } else {
          cb(null, 0)
        }
      })
    },
    (status, cb) => {
      if (status) {
        DevUser.update({gitID: req.gitID}, {'$set': {isInvited: status}}, {upsert: true}).exec((err, res) => {
          if (err) {
            logger.error(err.toString())
            data.error = err.toString()
          } else {
            data.msg = 'Success'
            data.info = res
          }
          cb(null, data)
        })
      } else {
        data.msg = 'Error'
        data.error = 'Invited error!'
        cb(null, data)
      }
    }
  ], () => {
    socket.emit(type, data)
  })
}


module.exports = {
  goInvited
}
