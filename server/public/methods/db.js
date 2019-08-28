const mongoose = require( 'mongoose' )
const Schema   = mongoose.Schema
const $$ = require('./methods')
const logger = require('./log4js').getLogger('DB')

const Block = new Schema({
  number: {type: Number},
  hash: {type: String},
  parentHash: {type: String},
  nonce: {type: String},
  sha3Uncles: {type: String},
  logsBloom: {type: String},
  transactionsRoot: {type: String},
  stateRoot: {type: String},
  receiptRoot: {type: String},
  miner: {type: String},
  difficulty: {type: String},
  totalDifficulty: {type: String},
  size: {type: Number},
  extraData: {type: String},
  gasLimit: {type: Number},
  gasUsed: {type: Number},
  timestamp: {type: Number},
  blockTime: {type: Number},
  txns: {type: Number},
  reward: {type: Number},
  avgGasprice: {type: Number},
  uncles: [String]
}, {collection: "Blocks"})

const Accounts = new Schema({
  address: {type: String},
  timestamp: {type: Number},
  updatetime: {type: Number},
  publicKey: {type: String},
  followPair: {type: String},
  isConfirm: {type: Number},
  balance: {type: Number, default: 0}
}, {collection: 'Accounts'})

const DcrmAccount = new Schema({
  keyId: {type: String},
  address: {type: String},
  dcrmAddress: {type: String},
  coinType: {type: String},
  balance: {type: Number, default: 0},
  isERC20: {type: Boolean},
  isLockin: {type: Boolean},
  isLockout: {type: Boolean},
  timestamp: {type: Number},
  sortId: {type: Number}
}, {collection: 'DcrmAccounts'})

const Transaction = new Schema({
  hash: {type: String},
  hashArray: {type: Array},
  nonce: {type: Number},
  blockHash: {type: String},
  blockNumber: {type: Number},
  transactionIndex: {type: Number},
  from: {type: String},
  to: {type: String},
  value: {type: String},
  gas: {type: Number},
  gasPrice: {type: String},
  gasLimit: {type: String},
  timestamp: {type: Number},
  input: {type: String},
}, {collection: "Transactions"})

const Lockouts = new Schema({
  value: {type: Number},
  contractValue: {type: Number},
  coinType: {type: String},
  input: {type: String},
  to: {type: String},
  contractTo: {type: String},
  from: {type: String},
  timestamp: {type: Number},
  hash: {type: String},
  status: {type: Number},
  nonce: {type: Number},
  gasPrice: {type: Number},
  gasLimit: {type: Number}
}, {collection: 'Lockouts'})

const Lockins = new Schema({
  value: {type: Number},
  contractValue: {type: Number},
  coinType: {type: String},
  input: {type: String},
  to: {type: String},
  contractTo: {type: String},
  from: {type: String},
  timestamp: {type: Number},
  hash: {type: String},
  outHash: {type: String},
  status: {type: Number},
  nonce: {type: Number},
  gasPrice: {type: Number},
  gasLimit: {type: Number}
}, {collection: 'Lockins'})

const Transfer = new Schema({
  value: {type: Number},
  contractValue: {type: Number},
  coinType: {type: String},
  input: {type: String},
  to: {type: String},
  contractTo: {type: String},
  from: {type: String},
  timestamp: {type: Number},
  hash: {type: String},
  status: {type: Number},
  nonce: {type: Number},
  gasPrice: {type: Number},
  gasLimit: {type: Number}
}, {collection: 'Transfers'})

const Ordercache = new Schema({
  trade: {type: String},
  side: {type: String},
  price: {type: Number},
  total: {type: Number},
  volumes: {type: Number}
}, {collection: "OrderCaches"})

const DexBlocks = new Schema({
  trade: {type: String},
  number: {type: Number},
  orders: {type: Number},
  price: {type: Number},
  timestamp: {type: Number},
  volumes: {type: Number}
}, {collection: "DexBlocks"})

const DexTxns = new Schema({
  from: {type: String},
  height: {type: Number},
  hash: {type: String},
  ordertype: {type: String},
  price: {type: Number},
  quantity: {type: Number},
  rule: {type: String},
  side: {type: String},
  timestamp: {type: Number},
  trade: {type: String},
  completed: {type: Number},
}, {collection: "DexTxns"})

const Orders = new Schema({
  value: {type: Number},
  trade: {type: String},
  to: {type: String},
  from: {type: String},
  timestamp: {type: Number},
  hash: {type: String},
  nonce: {type: Number},
  gasPrice: {type: Number},
  gasLimit: {type: Number},
  price: {type: Number},
  quantity: {type: Number},
  side: {type: String},
  data: {type: String},
  status: {type: Number}
}, {collection: "Orders"})

const KLineCharts = new Schema({
  timestamp: {type: Number},
  close: {type: Number},
  open: {type: Number},
  high: {type: Number},
  low: {type: Number},
  volume: {type: Number},
  trade: {type: String},
  keyId: {type: String},
}, {collection: "KLineCharts"})

const TxnsPairs = new Schema({
  trade: { type: String },
  isShow: { type: Number },
  isTop: { type: Number },
  sortId: { type: Number },
  createTime: { type: Number },
  remark: { type: String }
}, { collection: 'TxnsPairs' })

const AdverSys = new Schema({
  timestamp: {type: Number},
  sortId: {type: Number},
  img: {type: String},
  url: {type: String},
  remark: {type: String},
  isOutside: {type: Number},
  isShow: {type: Number},
}, {collection: "AdverSys"})

const NewsSys = new Schema({
  createTime: {type: Number},
  updateTime: {type: Number},
  sortId: {type: Number},
  url: {type: String},
  remark: {type: String},
  title: {type: String},
  content: {type: String},
  author: {type: String},
  isOutside: {type: Number},
  isShow: {type: Number},
}, {collection: "NewsSys"})

const Users = new Schema({
  username: {type: String},
  mobile: {type: Number, index: { unique: true }},
  password: {type: String},
  createTime: {type: Number},
  updateTime: {type: Number},
  role: {type: Number},
  latestLoginIP: {type: String},
  latestLoginCity: {type: String},
}, {collection: 'Users'})

const RoleSys = new Schema({
  name: {type: String},
  createTime: {type: Number},
  updateTime: {type: Number},
  type: {type: Number},
  limitAuthor: {type: Object},
}, {collection: 'RoleSys'})



mongoose.model('Block', Block)
mongoose.model('Transaction', Transaction)
mongoose.model('Lockouts', Lockouts)
mongoose.model('Lockins', Lockins)
mongoose.model('Transfer', Transfer)
mongoose.model('Accounts', Accounts)
mongoose.model('DcrmAccount', DcrmAccount)
mongoose.model('Ordercache', Ordercache)
mongoose.model('DexBlocks', DexBlocks)
mongoose.model('DexTxns', DexTxns)
mongoose.model('Orders', Orders)
mongoose.model('KLineCharts', KLineCharts)
mongoose.model('TxnsPairs', TxnsPairs)
mongoose.model('AdverSys', AdverSys)
mongoose.model('NewsSys', NewsSys)
mongoose.model('Users', Users)
mongoose.model('RoleSys', RoleSys)


mongoose.Promise = global.Promise
logger.info("db.js")
logger.info($$.config.mongoDBurl)
mongoose.connect(process.env.MONGO_URI || $$.config.mongoDBurl, {
  useCreateIndex: true,
  useNewUrlParser: true
})


module.exports = {
  Block:            mongoose.model('Block'),
  Transaction:      mongoose.model('Transaction'),
  Lockouts:         mongoose.model('Lockouts'),
  Lockins:          mongoose.model('Lockins'),
  Transfer:         mongoose.model('Transfer'),
  Accounts:         mongoose.model('Accounts'),
  DcrmAccount:      mongoose.model('DcrmAccount'),
  Ordercache:       mongoose.model('Ordercache'),
  DexBlocks:        mongoose.model('DexBlocks'),
  DexTxns:          mongoose.model('DexTxns'),
  Orders:           mongoose.model('Orders'),
  KLineCharts:      mongoose.model('KLineCharts'),
  TxnsPairs:        mongoose.model('TxnsPairs'),
  AdverSys:         mongoose.model('AdverSys'),
  NewsSys:          mongoose.model('NewsSys'),
  Users:            mongoose.model('Users'),
  RoleSys:          mongoose.model('RoleSys'),
}