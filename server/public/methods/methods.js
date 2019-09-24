const path = require("path").resolve(".")
const pathLink = path


const configData = require(pathLink + '/static/js/config')
const coinInfo = require(pathLink + '/static/js/config/coininfo')
const web3 = require(pathLink + '/server/public/methods/web3')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Methods')

function getCoinInfo (coin, param) {
  coin = coin.toUpperCase()
  if (param) {
    if (typeof coinInfo[coin] !== 'undefined' && typeof coinInfo[coin][param] !== 'undefined') {
      return coinInfo[coin]
    }
  } else if (!param) {
    if (typeof coinInfo[coin] !== 'undefined') {
      return coinInfo[coin]
    }
  }
  return ''
}

function fromTime (timestamp) {
  if (timestamp.toString().length === 10) {
    timestamp = Number(timestamp) * 1000
  } else if (timestamp.toString().length > 13) {
    timestamp = timestamp.toString().substring(0, 13)
  }
  return Number(timestamp)
}

function toTime (timestamp) {
  // console.log(timestamp.toString().length)
  if (timestamp.toString().length >= 13) {
    timestamp = timestamp.toString().substring(0, 10)
  }
  return Number(timestamp)
}

function fromWei (balance, coin) {
  coin = coin.toUpperCase()
  if (typeof coinInfo[coin] !== 'undefined' && coinInfo[coin].rate) {
    balance = Number(balance) / Math.pow(10, coinInfo[coin].rate)
  } else {
    if (coin === 'GWEI') {
      balance = web3.fromWei(balance, 'gwei')
    } else {
      balance = web3.fromWei(balance, 'ether')
    }
  }
  return balance
}

function toWei (balance, coin) {
  coin = coin.toUpperCase()
  if (typeof coinInfo[coin] !== 'undefined' && coinInfo[coin].rate) {
    balance = Number(balance) * Math.pow(10, coinInfo[coin].rate)
  } else {
    if (coin === 'GWEI') {
      balance = web3.toWei(balance, 'gwei')
    } else {
      balance = web3.toWei(balance, 'ether')
    }
  }
  return Number(balance).toFixed()
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

function toSum(arr, param) {
  let num = 0
  for (let obj of arr) {
    num += Number(obj[param])
  }
  return num
}

function smallToBigSort() {
  return (a, b) => {
    for (let obj in arguments) {
      if (Number(a[arguments[obj]]) > Number(b[arguments[obj]])) {
        return 1
      }
    }
    return -1
  }
}

function bigToSmallSort() {
  return (a, b) => {
    for (let obj in arguments) {
      if (Number(a[arguments[obj]]) > Number(b[arguments[obj]])) {
        return -1
      }
    }
    return 1
  }
}

function getBeforeDate(n) {
  // let n = n
  let s
  let d = new Date()
  let year = d.getFullYear()
  let mon = d.getMonth() + 1
  let day = d.getDate()
  if(day <= n) {
    if(mon > 1) {
      mon = mon - 1;
    } else {
      year = year - 1
      mon = 12
    }
  }
  d.setDate(d.getDate() - n)
  year = d.getFullYear()
  mon = d.getMonth() + 1
  day = d.getDate()
  s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day)
  return s
}

module.exports = {
  coinInfo: coinInfo,
  config: configData,
  getCoinInfo,
  fromTime,
  toTime,
  fromWei,
  toWei,
  cutCoin,
  toSum,
  smallToBigSort,
  bigToSmallSort,
  getBeforeDate,
}
