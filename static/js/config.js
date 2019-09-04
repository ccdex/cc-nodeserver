const httpPort = 8100

let publicSet = {
  initCoin: 'CCD', // main coin
  appPort: httpPort, // app port
  appURL: 'wss://api.ccdex.top', // app url
  liloTxnUrl: 'https://data.nodes.run', // lockin txns url
  liloAddrUrl: 'http://54.183.185.30:5000/', // lockin address url
  mongoDBurl: 'mongodb://localhost:27017/fusion', // app mongodb database url
  serverRPC: 'http://18.216.188.149:19839', // web3 server url
  refreshDataTime: 15, // page refersh time
  isUseEnters: {
    wallet: 1,
    explorer: 1,
    dexapp: 1,
    manger: 1,
    // portal: 1,
  }
}

// publicSet.mongoDBurl = 'mongodb://18.216.188.149:27017/ccdex'

module.exports = publicSet