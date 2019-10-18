const fs = require("fs")
const https = require('https')
const path = require("path").resolve(".")
const pathLink = path
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('UploadImg')


function cbImg(type, socket, req) {
  logger.info(req)
  logger.info(req.file)
  fs.readFile(req.file, (err, data) => {
    console.log(err)
    console.log(data)
  })
  // fs.readFile(pathLink + '/images/bg.jpg', (err, data) => {
  //   socket.emit(type, data)
  // })
}

module.exports = {
  cbImg
}