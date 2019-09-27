const path = require("path").resolve(".")
const pathLink = path

const register = require(pathLink + '/server/joinCM/register/index')

function StartSocket (socket, io) {
  
  socket.on('getGitUserInfo', (req) => {
    register.getGitUserInfo('getGitUserInfo', socket, req)
  })
}




module.exports = StartSocket