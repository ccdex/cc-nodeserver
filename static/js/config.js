const httpPort = 8100

let publicSet = {
  initCoin: 'CCD', // main coin
  appPort: httpPort, // app port
  appURL: 'wss://api.ccdex.top', // app url
  liloTxnUrl: 'https://data.nodes.run', // lockin txns url
  liloAddrUrl: 'http://54.183.185.30:5000/', // lockin address url
  mongoDBurl: 'mongodb://localhost:27017/ccdex', // app mongodb database url
  serverRPC: 'http://18.216.188.149:19839', // web3 server url
  refreshDataTime: 15, // page refersh time
  isUseEnters: {
    wallet: 1,
    explorer: 1,
    dexapp: 1,
    manger: 1,
    // portal: 1,
    joinCM: 1,
  },
  github: {
    url: 'https://github.com/login/oauth/access_token',
    client_id: 'ea35a2738ab45dffe14d',
    client_secret: '7194f23286ed04c4a705851138956319d39540dc'
  }
}
// const rpc = '10.192.32.40'
// const rpc = '10.192.32.19'
// const rpc = '207.180.232.138'
const rpc = '18.216.188.149'
// const port = '8774'
// const port = '9909'
publicSet.mongoDBurl = 'mongodb://' + rpc + ':27017/ccdex'
// publicSet.mongoDBurl = 'mongodb://' + rpc + ':27017/fusion'
// publicSet.mongoDBurl = 'mongodb://localhost:27017/fusion'
// publicSet.appURL = 'http://localhost:8100'
// publicSet.serverRPC = 'http://' + rpc + ':' + port
module.exports = publicSet