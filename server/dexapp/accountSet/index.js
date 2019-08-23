const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
// const web3 = require(pathLink + '/server/public/methods/web3')
// const $$ = require(pathLink + '/server/public/methods/methods')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('account')

const mongoose = require('mongoose')
const Accounts = mongoose.model('Accounts')
// const _async = require('async')

function setFollow (socket, req, type) {
  let data = { msg: 'Error', info: '' }
  let params = {}

  Accounts.updateOne({address: req.address}, {followPair: req.followPair}).exec((err, res) => {
    if (err) {
      data = { msg: 'Error', info: 'Account set error!', error: err.toString() }
    } else {
      data = { msg: 'Success', info: res }
    }
    socket.emit(type, data)
  })
}


module.exports = {
  setFollow
}