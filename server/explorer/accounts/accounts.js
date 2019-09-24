const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
const Accounts = mongoose.model( 'Accounts' )
const DcrmAccount = mongoose.model( 'DcrmAccount' )
const Transaction = mongoose.model( 'Transaction' )
const async = require('async')
const web3 = require(pathLink + '/server/public/methods/web3')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Accounts')

function TopAccountList (socket, req, type) {
	let params = {
		pageSize: req.pageSize ? req.pageSize : 20,
		skip: 0,
		balance: req.balance || req.balance === 0 ? req.balance : 20
	}
	let data = {
		msg: '',
		info: '',
		total: ''
	}
	params.skip = req.pageNum ? (Number(req.pageNum - 1) * Number(params.pageSize)) : 0
	logger.info(params)	
	async.waterfall([
		(cb) => {
			Accounts.find({'balance': {'$gte': params.balance}}).countDocuments((err, result) => {
				if (!err) {
					data.msg = 'Success'
					data.total = result
					cb(null, data)
				} else {
					data.msg = 'Error'
					data.info = err
					cb(data)
				}
			})
		},
		(data, cb) => {
			Accounts.aggregate([
				{$match: {'balance': {'$gte': params.balance} } },
				{$group: {_id: null, 'balance': {$sum: '$balance'}}}
			]).exec((err, result) => {
				if (err) {
          logger.error(err)
          data.msg = 'Error'
					data.info = err
					cb(data)
				} else {
					if (result.length > 0) {
						data.balance = web3.toBigNumber(result[0].balance).toString(10)
					}
					cb(null, data)
				}
			})
		},
		(data, cb) => {
			// Accounts.find({'balance': {'$gte': params.balance}}).lean(true).sort({"balance": -1}).skip(params.skip).limit(Number(req.pageSize)).exec((err,result) => {
			Accounts.aggregate([
				// {
				// 	$lookup: {
				// 		from: "Transaction",
				// 		localField: "address",
				// 		foreignField: "from",
				// 		as: "arr",
				// 	}
				// },
				{$sort: {"balance": -1}},
				{$match: {'balance': {'$gte': params.balance}}},
				// {$group: { _id: null, 'total': {'$divide': ['$balance', 5]} } },
				{$skip: params.skip},
				{$limit: Number(req.pageSize)}
			]).exec((err, result) => {
				if (!err) {
					// logger.info(result)
					data.msg = 'Success'
					for (let i = 0; i < result.length; i++) {
						result[i].percentage = ((Number(result[i].balance) / Number(data.balance)) * 100).toFixed(2) + '%'
					}
					data.info = result
					cb(null, data)
				} else {
					data.msg = 'Error'
					data.info = err
					cb(data)
				}
			})
		}
	], (err, data) => {
		if (err) {
			logger.error(err)
			socket.emit(type, err)
		} else {
			socket.emit(type, data)
		}
		// socket.emit(type, data)
		logger.info(type + ' callback data success')
	})

}

function AccountTxn(socket, req, type) {
	let params = {
		pageSize: req.pageSize ? req.pageSize : 20,
		skip: 0,
		addr: req.addr
	}
	let data = {
		msg: '',
		info: '',
		total: ''
	}
	let _param = {
		$or: [{"to": params.addr}, {"from": params.addr}]
	}
	params.skip = req.pageNum ? (Number(req.pageNum - 1) * Number(params.pageSize)) : 0

	if (req.isERC20) {
		_param.isERC20 = req.isERC20
	}
	if (req.type) {
		_param.type = req.type
	}
	if (req.$or) {
		_param.$or = req.$or
	}
	logger.info(_param)
	async.waterfall([
		(cb) => {
			Transaction.find(_param).countDocuments((err, result) => {
				if (!err) {
					data.msg = 'Success'
					data.total = result
					cb(null, data)
				} else {
					data.msg = 'Error'
					data.info = err
					cb(data)
				}
			})
		},
		(data, cb) => {
			Transaction.find(_param).lean(true).sort({"timestamp": -1}).skip(params.skip).limit(Number(req.pageSize)).exec((err,result) => {
				if (!err) {
					data.msg = 'Success'
					data.info = result
					cb(null, data)
				} else {
					data.msg = 'Error'
					data.info = err
					cb(data)
				}
			})
		}
	], (err, data) => {
		if (err) {
			socket.emit(type, err)
		} else {
			socket.emit(type, data)
		}
		// socket.emit(type, data)
		logger.info(type + ' callback data success')
	})
}

// function accountDtil (socket, req) {
function AccountDtil (socket, req, type) {
	let params = req && req.address ? req.address : ''
	let data = { msg: '', info: '' }
	async.waterfall([
		(cb) => {
			Accounts.find({'address': params}).exec((err, result) => {
				if (err) {
					data = { msg: 'Error', info: 'Accounts is error!', error: err.toString() }
					cb(data)
				} else {
					data.info = result[0]
					cb(null, data)
				}
			})
		},
		($data, cb) => {
			DcrmAccount.find({'address': params}).sort({sortId: 1}).exec((err, result) => {
				if (err) {
					data = { msg: 'Error', info: 'Dcrm account is error!', error: err.toString() }
					cb(data)
				} else {
					if (result.length <= 0) {
						data.dcrm = 'Dcrm account is null!'
					} else {
						data.dcrm = result
					}
					data.msg = 'Success'
					cb(null, data)
				}
			})
		},
	], (err, res) => {
		if (err) {
			socket.emit(type, err)
		} else {
			socket.emit(type, data)
		}
		logger.info('accountDtil callback data success')
	})
}

module.exports = {
  Dtil : AccountDtil,
  ATxn : AccountTxn,
  TopA : TopAccountList
}
