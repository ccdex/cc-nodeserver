const path = require("path").resolve(".")
const pathLink = path

const io = require('socket.io-client')
// const web3 = require(pathLink + '/server/public/methods/web3')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('WatchBlock')
// const configData = require(pathLink + '/static/js/config')
// const socketExplorer = io(configData.appURL)
const $$ = require(pathLink + '/server/public/methods/methods')
const socketExplorer = io($$.config.appURL)


let newBlocks = null
async function listenBlocks () {
  // logger.info(123456789)
  socketExplorer.emit('listenBlock', $$.config.appURL)
  setTimeout(() => {
    listenBlocks()
    // socketExplorer.emit('listenBlock', $$.config.appURL)
  }, 5 * 1000)
  // if (!web3.isConnected()) {
  //   logger.error('connect error!')
  //   // logger.error(web3.isConnected())
  //   setTimeout(function () {
  //     let url = $$.config.serverRPC
  //     newBlocks = null
  //     web3.setProvider(new web3.providers.HttpProvider(url))
  //     listenBlocks()
  //     socketExplorer.emit('listenBlock', 'connect error!')
  //   }, 5 * 1000)
  //   return
  // }
  // if (web3.eth.syncing) {
  //   logger.info('Info: waiting until syncing finished... (currentBlock is #' + web3.eth.syncing.currentBlock + ')');
  //   newBlocks = null
  //   setTimeout(function () {
  //     socketExplorer.emit('listenBlock', 'connect error!')
  //     listenBlocks()
  //   }, 10000)
  //   return
  // }
  // try {
  //   newBlocks = web3.eth.filter('latest')
  //   newBlocks.watch(function (error, hash) {
  //     if (error) {
  //       logger.error(error.toString())
  //     } else {
  //       // logger.info(hash)
  //       socketExplorer.emit('listenBlock', hash)
  //     }
  //   })
  // } catch (error) {
  //   // logger.error(error.toString())
  //   socketExplorer.emit('listenBlock', {
  //     error: error.toString(),
  //     tip: 'The listener failed and started to update manually!'
  //   })
  //   setTimeout(() => {
  //     web3.reset()
  //     newBlocks.stopWatching()
  //     newBlocks = null
  //     let url = $$.config.serverRPC
  //     web3.setProvider(new web3.providers.HttpProvider(url))
  //     listenBlocks()
  //   }, 1000 * 10)
  // }
}

// listenBlocks()
module.exports = listenBlocks

// setInterval(() => {
//   socket.emit('listenBlock', 1)
// }, 1000 * 5)