const path = require("path").resolve(".")
const pathLink = path

require(pathLink + '/server/public/methods/db.js')
const web3 = require(pathLink + '/server/public/methods/web3')
const $$ = require(pathLink + '/server/public/methods/methods')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('account')

const mongoose = require('mongoose')
const Accounts = mongoose.model('Accounts')
const DcrmAccount = mongoose.model('DcrmAccount')
const _async = require('async')


function queryAccount(socket, req, type) {
  let data = { msg: 'Error', info: '' }
  let params = {}
  if (req && req.address) {
    params.address = req.address
  } else {
    data = { msg: 'Error', info: 'address is null' }
    socket.emit(type, data)
    return
  }
  _async.waterfall([
    (cb) => {
      Accounts.aggregate([
        {$match: {address: params.address}}
      ]).exec((err, results) => {
        if (err) {
          data = { msg: 'Error', info: 'Account find error!', error: err.toString() }
          cb(data)
        } else {
          if (results.length > 0) {
            cb(null, results[0])
          } else {
            data = { msg: 'Null', info: 'Account is null!' }
            cb(data)
          }
        }
      })
    },
    (dataObj, cb) => {
      DcrmAccount.aggregate([
        {$match: {address: params.address}},
        {$sort: {'sortId': 1}}
      ], (err, results) => {
        if (err) {
          data = { msg: 'Error', info: 'Dcrm account find error!', error: err.toString() }
          cb(data)
        } else {
          dataObj.coinType = $$.config.initCoin
          dataObj.isERC20 = 0
          dataObj.isLockin = 0
          dataObj.isLockout = 0
          dataObj.available = Number(dataObj.balance) - Number(dataObj.freeze ? dataObj.freeze : 0)
          dataObj.freeze = dataObj.freeze ? dataObj.freeze : 0
          let coinList = [dataObj]
          if (results.length > 0) {
            for (obj of results) {
              obj.available = Number(obj.balance) - Number(obj.freeze ? obj.freeze : 0)
              obj.freeze = obj.freeze ? obj.freeze : 0
              coinList.push(obj)
            }
          }
          data = { msg: 'Success', info: coinList, isConfirm: dataObj.isConfirm, publicKey: dataObj.publicKey }
          cb(null, data)
        }
      })
    }
  ], (err, results) => {
    if (err) {
      logger.error(err)
      socket.emit(type, err)
    } else {
      // logger.info(results)
      socket.emit(type, results)
    }
  })
}

// router.post('/sendTxn', (req, res) => {
function sendTxn(socket, req, type) {
  let data = { msg: 'Error', info: '' }
  if (!req.serializedTx) {
    data = { msg: 'Error', info: 'serializedTx is null' }
    socket.emit(type, data)
    return
  }
  let url = req.url ? req.url : $$.config.serverRPC
  web3.setProvider(new web3.providers.HttpProvider(url))
  web3.eth.sendRawTransaction(req.serializedTx, (err, hash) => {
    if (err) {
      data.msg = 'Error'
      data.error = err.toString()
      data.info = 'Confirm error!'
      logger.error('-------------confirm send txns-------------')
      logger.error(err.toString())
    } else {
      data.msg = 'Success'
      data.info = hash
    }
    socket.emit(type, data)
  })
}

// router.post('/createAccount', (req, res) => {
function createAccount(socket, req, type) {
  /**
   * code type:
   * 0: Request address is null
   * 1: Get dcrm coin status error
   * 2: Get all address is null
   * 3: Save address error
   * 4: Save address success
   * 5: Response coin list
   * 6: Address is null or public key error
   * 7: Dcrm address request error!
   * 8：Insufficient for request addr, need least 5 fsn!
   */
  let data = { msg: 'Error', info: '' }
  let url = req.url ? req.url : $$.config.serverRPC
  web3.setProvider(new web3.providers.HttpProvider(url))
  logger.info(url)
  let params = {}
  if (req && req && req.address) {
    params.address = req.address
  } else {
    data = { code: 0, msg: 'Error', info: 'Request address is null' }
    socket.emit(type, data)
    return
  }

  let coinState = ''
  try {
    coinState = web3.lilo.dcrmCoinStatus()
    coinState = JSON.parse(coinState).COINS
    let coinList = [{
      address: '',
      balance: 0,
      coinType: $$.config.initCoin,
      isERC20: 0,
      isLockin: 0,
      isLockout: 0,
      freeze: 0,
      available: 0
    }]
    for (let obj of coinState) {
      let coinObj = cutCoin(obj.COIN)
      coinList.push({
        address: '',
        balance: 0,
        coinType: coinObj.coin,
        isERC20: coinObj.isERC20,
        isLockin: 0,
        isLockout: 0,
        freeze: 0,
        available: 0
      })
    }
    data = { code: 5, msg: 'Response coin list', info: coinList}
    socket.emit(type, data)
  } catch (error) {
    data = { code: 1, msg: 'Error', info: 'Get dcrm coin status error!' }
    socket.emit(type, data)
    return
  }

  try {
    allAddress = web3.lilo.dcrmReqAddr(params.address, 'ALL')
    // logger.info(allAddress)
    setTimeout(() => {
      data = { code: 4, msg: 'Success', info: 'Save address success!' }
      socket.emit(type, data)
    }, 2000);
  } catch (error) {
    // logger.error('Dcrm address request error!')
    logger.error(error.toString())
    if (error.toString().indexOf('117') !== -1) {
      data = { code: 8, msg: 'Error', info: 'Insufficient for request addr, need least 5 fsn!', error: error.toString() }
    } else {
      data = { code: 7, msg: 'Error', info: 'Dcrm address request error!', error: error.toString() }
    }
    socket.emit(type, data)
  }

}


function cutCoin (coin) {
  if (coin.indexOf('ERC20') === 0) {
    return {
      coin: coin.substr(5),
      isERC20: true
    }
  }
  return {
    coin: coin,
    isERC20: false
  }
}

module.exports = {
  queryAccount,
  sendTxn,
  createAccount
}
