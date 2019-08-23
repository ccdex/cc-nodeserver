const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const path = require("path").resolve(".")
const pathLink = path
// const web3 = require('./server/web3')
const config = require('./static/js/config')
const httpPort =  config.appPort

const logger = require(pathLink + '/server/public/methods/log4js').getLogger('App')

app.use(express.static(require('path').join(__dirname, 'public')))

app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', '3.2.1')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

const httpServer = http.createServer(app).listen(httpPort)

const io = require('socket.io')({})
io.attach(httpServer)




const StartSocket = require('./server/index')
const startServer = require(pathLink + '/server/dexapp/order/pushPublicData')
const GetDollar = require(pathLink + '/server/public/other/getDollar')
const Blocks = require(pathLink + '/server/explorer/blocks/blocks')
const Txns = require(pathLink + '/server/explorer/txns/txns')
GetDollar.intervalGetDollar(io)

if (config.isUseEnters.dexapp) {
  startServer(io)
}



let peopleCount = 0
io.on('connection', function (socket) {
  peopleCount ++
  StartSocket(socket, io)



  socket.on('listenBlock', hax => {
    // logger.info(hax)
    if (config.isUseEnters.explorer) {
      Blocks.List(socket, '', 'blocksRefresh', io)
      Txns.List(socket, '', 'transactionRefresh', io)
    }
  })
  
  socket.on('joinDataList', (data) => {
    socket.join(data)
  })

  socket.on('leaveDataList', (data) => {
    socket.leave(data)
  })
  
  socket.on('disconnect',function(){
    peopleCount--;
  })
  logger.info(peopleCount + ' user')
})

const watchBlock = require(pathLink + '/server/watchBlock')
try {
  watchBlock()
} catch (error) {
  logger.error(error.toString())
}