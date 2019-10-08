const path = require("path").resolve(".")
const pathLink = path

const register = require(pathLink + '/server/joinCM/register/index')
const cbFile = require(pathLink + '/server/joinCM/cbFile/index')

function StartSocket (socket, io) {
  
  socket.on('getGitUserInfo', (req) => {
    register.getGitUserInfo('getGitUserInfo', socket, req)
  })
  socket.on('joinCM', (req) => {
    register.joinCM('joinCM', socket, req)
  })
  socket.on('findDevUser', (req) => {
    register.findDevUser('findDevUser', socket, req)
  })

  socket.on('uploadFile', (req) => {
    register.uploadFile('uploadFile', socket, req)
  })
  socket.on('removeFile', (req) => {
    register.removeFile('removeFile', socket, req)
  })

  socket.on('cbImg', (req) => {
    cbFile.cbImg('cbImg', socket, req)
  })
}




module.exports = StartSocket