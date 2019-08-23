
const path = require("path").resolve(".")
const pathLink = path

const web3 = require(pathLink + '/server/public/methods/web3')
const $$ = require(pathLink + '/server/public/methods/methods')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('getBaseInfo')
// logger.info($$)
// router.post('/base', (req, res) => {
function base(socket, req, type) {
  let data = {
    msg: 'Error',
    info: {}
  }
  let url = req.url ? req.url : $$.config.serverRPC
  web3.setProvider(new web3.providers.HttpProvider(url))
  // logger.info(req)
  let params = {}
  params.from = req.from ? req.from.replace(/\s+/g, '') : ''
  params.to = req.to ? req.to.replace(/\s+/g, '') : ''
  params.coin = req.coin ? req.coin.replace(/\s+/g, '') : ''
  params.value = req.value ? req.value.replace(/\s+/g, '') : ''
  params.nonceType = (req.nonceType || req.nonceType === 0) ? req.nonceType.toString().replace(/\s+/g, '') : ''

  if ( ( params.to && !web3.isAddress(params.to) ) || ( params.from && !web3.isAddress(params.from) ) ) {
    data = {
      msg: 'Error',
      info: 'Address error!'
    }
    socket.emit(type, data)
    return
  }

  var batch = web3.createBatch()
  if (params.to) {
    batch.add(web3.eth.estimateGas.request({to: params.to}, function(error, result) {
      if(error) {
        logger.error('data.info.gasLimit')
        logger.error(error.toString())
        data.info.gasLimit = error
      } else {
        data.info.gasLimit = web3.toBigNumber(result).toString(10)
      }
    }))
  }
  if (params.from) {
    if (params.coin && params.coin !== $$.config.initCoin) {
      batch.add(web3.lilo.dcrmGetBalance.request(params.from, params.coin, function(error, result) {
        if(error) {
          logger.error('data.info.balance')
          logger.error(error.toString())
          data.info.balance = error
        } else {
          result = $$.fromWei(result, params.coin)
          data.info.balance = web3.toBigNumber(result).toString(10)
        }
      }))
    }
    if (params.coin && params.coin === $$.config.initCoin) {
      batch.add(web3.eth.getBalance.request(params.from, function(error, result) {
        if(error) {
          logger.error('data.info.balance')
          logger.error(error.toString())
          data.info.initBalance = error
        } else {
          // logger.info(result)
          result = $$.fromWei(result, params.coin)
          // logger.info(result)
          // logger.info(web3.toBigNumber(result).toString(10))
          data.info.initBalance = web3.toBigNumber(result).toString(10)
        }
      }))
    }
    batch.add(web3.eth.getTransactionCount.request(params.from, "pending", function(error, result) {
    // batch.add(web3.lilo.GetTransactionCountByPoolType.request(params.from, "pending", Number(params.nonceType), function(error, result) {
      if(error) {
        logger.error('data.info.nonce')
        logger.error(error.toString())
        data.info.nonce = error
      } else {
        data.info.nonce = web3.toBigNumber(result).toString(10)
      }
    }))
  }
  batch.add(web3.version.getNode.request(function(error, result) {
    if(error) {
      logger.error('data.info.netWorkInfo')
      logger.error(error.toString())
      data.info.netWorkInfo = error
    } else {
      data.info.netWorkInfo = result
    }
  }))
  batch.add(web3.eth.getGasPrice.request(function(error, result) {
    if(error) {
      logger.error('data.info.gasPrice')
      logger.error(error.toString())
      data.info.gasPrice = error
    } else {
      data.info.gasPrice = web3.toBigNumber(result).toString(10)
      data.msg = 'Success'
      if (params.value) {
        data.info.value = $$.toWei(params.value, params.coin)
      }
      socket.emit(type, data)
    }
  }))

  batch.execute()
}

// router.post('/$$', (req, res) => {
function changeWebWei(socket, req, type) {
  let data = {
    msg: 'Error',
    info: ''
  }
  let params = {}
  params.type = req.type ? req.type.replace(/\s+/g, '') : ''
  params.balance = req.balance ? req.balance.replace(/\s+/g, '') : 0
  params.coin = req.coin ? req.coin.replace(/\s+/g, '') : ''
  let balance = 0
  if (params.type === 'fromWei') {
    balance = $$.fromWei(params.balance, params.coin)
  } else {
    balance = $$.toWei(params.balance, params.coin)
  }
  data = {
    msg: 'Success',
    info: balance
  }
  socket.emit(type, data)
}

module.exports = {
  base,
  changeWebWei
}
