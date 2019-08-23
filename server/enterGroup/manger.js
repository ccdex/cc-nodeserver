const path = require('path').resolve('.')
const pathLink = path

const AdverSys = require(pathLink + '/server/manger/adverSys/index')
const NewsSys = require(pathLink + '/server/manger/newsSys/index')
const PairsSys = require(pathLink + '/server/manger/pairsSys/index')
const Users = require(pathLink + '/server/manger/user/index')

function StartSocket (socket, io) {
  // 广告系统
  socket.on('adverAdd', (req) => {
    AdverSys.Add(socket, req, 'adverAdd')
  })
  socket.on('adverDele', (req) => {
    AdverSys.Dele(socket, req, 'adverDele')
  })
  socket.on('adverEdit', (req) => {
    AdverSys.Edit(socket, req, 'adverEdit')
  })
  socket.on('adverList', (req) => {
    AdverSys.List(socket, req, 'adverList')
  })
  // 新闻系统
  socket.on('newsAdd', (req) => {
    NewsSys.Add(socket, req, 'newsAdd')
  })
  socket.on('newsDele', (req) => {
    NewsSys.Dele(socket, req, 'newsDele')
  })
  socket.on('newsEdit', (req) => {
    NewsSys.Edit(socket, req, 'newsEdit')
  })
  socket.on('newsList', (req) => {
    NewsSys.List(socket, req, 'newsList')
  })
  // 交易对管理
  socket.on('pairsAdd', (req) => {
    PairsSys.Add(socket, req, 'pairsAdd')
  })
  socket.on('pairsDele', (req) => {
    PairsSys.Dele(socket, req, 'pairsDele')
  })
  socket.on('pairsEdit', (req) => {
    PairsSys.Edit(socket, req, 'pairsEdit')
  })
  socket.on('pairsList', (req) => {
    PairsSys.List(socket, req, 'pairsList')
  })
  socket.on('oneTouchPair', (req) => {
    PairsSys.oneTouchPair(socket, req, 'oneTouchPair')
  })
  // 用户系统
  socket.on('createUser', (req) => {
    Users.createUser(socket, req, 'createUser')
  })
  socket.on('deleUser', (req) => {
    Users.deleUser(socket, req, 'deleUser')
  })
  socket.on('editUser', (req) => {
    Users.editUser(socket, req, 'editUser')
  })
  socket.on('findUser', (req) => {
    Users.findUser(socket, req, 'findUser')
  })
  socket.on('validUser', (req) => {
    Users.validUser(socket, req, 'validUser')
  })
}

module.exports = StartSocket
