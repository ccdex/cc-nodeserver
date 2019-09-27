const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
// const https = require('https')
const $$ = require(pathLink + '/server/public/methods/methods')
const fetch = require("node-fetch")
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

module.exports = {
  getGitUserInfo,
}

