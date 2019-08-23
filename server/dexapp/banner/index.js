const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const mongoose = require('mongoose')
const AdverSys = mongoose.model('AdverSys')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('AdverSys')

function adverList (socket, req, type) {
  let params = {}
  let data = {
    msg: 'Error',
    info: []
  }
  // logger.info(req)
  if (req) {
    if (req.id) {
      params._id = req.id
    }
  }
  AdverSys.find(params).sort({sortId: 1}).exec((err, res) => {
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
  List: adverList
}