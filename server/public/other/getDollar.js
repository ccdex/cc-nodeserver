const path = require("path").resolve(".")
const pathLink = path

const httpReq = require(pathLink + '/server/public/methods/httpReq')
const $$ = require(pathLink + '/server/public/methods/methods')
const _async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('getDollar')

let coin_dollar = []

function formatDollerData (data, coin) {
  let $data = {
    toUsd: 0,
    toBtc: 0,
    percent_change_1h: 0,
    percent_change_24h: 0,
    percent_change_7d: 0,
  }
  if (data.length > 0) {
    if (coin === 'EVT1') {
      $data = {
        coin: coin,
        toUsd: data[0] && data[0].usdLast ? data[0].usdLast : 0,
        toBtc: data[0] && data[0].usdLast ? data[0].usdLast : 0,
        percent_change_1h: 0,
        percent_change_24h: 0,
        percent_change_7d: 0,
      }
    } else {
      $data = {
        coin: coin,
        toUsd: data[0] && data[0].price_usd ? data[0].price_usd : 0,
        toBtc: data[0] && data[0].price_btc ? data[0].price_btc : 0,
        percent_change_1h: data[0] && data[0].percent_change_1h ? data[0].percent_change_1h : 0,
        percent_change_24h: data[0] && data[0].percent_change_24h ? data[0].percent_change_24h : 0,
        percent_change_7d: data[0] && data[0].percent_change_7d ? data[0].percent_change_7d : 0,
      }
    }
  }
  return $data
}

let intervalDollarTime = 1000 * 60 * 60,
    intervalDollarMethods = ''
function intervalGetDollar(io) {
  let coinList = [],
      coinDollar = []

  for (let coin in $$.coinInfo) {
    $$.coinInfo[coin].coin = coin
    coinList.push($$.coinInfo[coin])
  }

  _async.eachSeries(coinList, (obj, cb) => {
    if (obj.dollarURL) {
      httpReq.https.get(obj.dollarURL).then(results => {
        let dataObj = {}
        // logger.info(results)
        if (results.code) {
          dataObj = formatDollerData(results.info, obj.coin)
        } else {
          dataObj = {
            coin: obj.coin,
            toUsd: '',
            toBtc: '',
            percent_change_1h: '',
            percent_change_24h: '',
            percent_change_7d: '',
          }
        }
        coinDollar.push(dataObj)
        cb(null, dataObj)
      })
    } else {
      cb(null, obj)
    }
  }, () => {
    coin_dollar = coinDollar
    io.sockets.emit('getDollar', coin_dollar)
    clearTimeout(intervalDollarMethods)
    intervalDollarMethods = setTimeout(() => {
      intervalGetDollar(io)
    }, intervalDollarTime)
  })
}

// intervalGetDollar()


function getDollar (socket, req, type) {
  // logger.info(coin_dollar)
  socket.emit(type, coin_dollar)
}

module.exports = {
  getDollar,
  intervalGetDollar
}