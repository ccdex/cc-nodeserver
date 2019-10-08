const fs = require("fs")
const https = require('https')
const path = require("path").resolve(".")
const pathLink = path

function cbImg(type, socket, req) {
  fs.readFile(pathLink + '/images/bg.jpg', (err, data) => {
    socket.emit(type, data)
  })
}

module.exports = {
  cbImg
}