const httpPort = 8100
let protocolHttp = 'ws:'
if (typeof location !== 'undefined' && location.protocol === 'https:') {
  protocolHttp = 'wss:'
}

let publicSet = {
  initCoin: 'FSN', // main coin
  appPort: httpPort, // app port
  appURL: 'wss://walletapp.dcrm.network', // app url
  faucetURL: 'wss://walletapp.dcrm.network/faucet', // faucet url
  liloTxnUrl: 'https://data.nodes.run', // lockin txns url
  liloAddrUrl: 'http://54.183.185.30:5000/', // lockin address url
  mongoDBurl: 'mongodb://localhost:27017/fusion', // app mongodb database url
  bipPath: "m/44'/1'/0'/0", // 
  serverRPC: 'http://39.98.244.51:30401', // web3 server url
  clientRPC: 'http://39.98.244.51:30401', // web3 client url
  refreshDataTime: 15, // page refersh time
  isUseEnters: {
    wallet: 1,
    explorer: 1,
    dexapp: 1,
    manger: 1,
    // portal: 1,
  }
}

const rpc = '207.180.232.145'
// const rpc = '10.192.32.11'
// const rpc = '10.192.33.196'
// const rpc = '10.192.32.154'
// const rpc = '207.180.232.138'
// const port = '9904'
// const port = '9903'
const port = '9909'
// const port = '7311'

publicSet.appURL = 'http://localhost:' + httpPort
// publicSet.appURL = 'http://104.210.49.28:' + httpPort
// publicSet.appURL = 'http://' + rpc + ':' + httpPort
publicSet.serverRPC = 'http://' + rpc + ':' + port
publicSet.clientRPC = 'http://' + rpc + ':' + port
publicSet.mongoDBurl = 'mongodb://' + rpc + ':27017/fusion'
publicSet.faucetURL = 'ws://' + rpc + ':30499/faucet'
publicSet.liloAddrUrl = 'http://5.189.139.168:5000/'

module.exports = publicSet