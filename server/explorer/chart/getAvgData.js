const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
let Transaction = mongoose.model( 'Transaction' )
const Block = mongoose.model( 'Block' )
const $$ = require(pathLink + '/server/public/methods/methods')
const async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Other')

let compare = function compare (property) {
	return function (a, b) {
		let value1 = a[property]
		let value2 = b[property]
		if (Date.parse(value1) > Date.parse(value2)) {
			return -1
		} else if (value1 < value2) {
			return 1
		} else {
			return 0
		}
	}
}

let cacheData = {
	txns: [],
	blocks: []
}
let cacheTime = Date.now()

function getAvgData(socket, req, type) {
	let data = {
		txns: [],
		blocks: []
	}
	if (!cacheData.blockError && !cacheData.txnsError && (cacheData.txns.length > 0 || cacheData.blocks.length > 0)) {
		// let _n = Date.now()
		let _s = Date.parse($$.getBeforeDate(0) + ' ' + '00:00:00')
		let _e = Date.parse($$.getBeforeDate(0) + ' ' + '23:59:59')
		if (_s < cacheTime <= _e) {
			socket.emit(type, cacheData)
			return
		}
	}
	// let dataArr = req.dataArr.length > 0 ? req.dataArr : []
	
	let nowDate = Date.parse($$.getBeforeDate(0) + ' ' + '00:00:00') / 1000
	let d7 = nowDate - (60 * 60 * 24 * 7)
	async.waterfall([
		(cb) => {
			Block.aggregate([
				{$sort: {number: -1, timestamp: -1}},
				{$match: {timestamp: {$gte: d7, $lt: nowDate}}},
				{$group: {
					_id: {
						$subtract: [
							{$subtract: ['$timestamp', new Date('1970-01-01') / 1000]},
							{
								$mod: [
									{$subtract: ['$timestamp', new Date('1970-01-01') / 1000]}, 60 * 60 * 24
								]
							}
						]
					},
					count: {$sum: 1},
					startTime: {$last: '$timestamp'},
					endTime: {$first: '$timestamp'}
				}}
			]).exec((err, results) => {
				// logger.info(err)
				// logger.info(results)
				if (err) {
					data.blockError = err.toString()
				} else {
					data.blocks = results
				}
				cb(null, results)
			})
		},
		(res, cb) => {
			Transaction.aggregate([
				{$sort: {blockNumber: -1, timestamp: -1}},
				{$match: {timestamp: {$gte: d7, $lt: nowDate}}},
				{$group: {
					_id: {
						$subtract: [
							{$subtract: ['$timestamp', new Date('1970-01-01') / 1000]},
							{
								$mod: [
									{$subtract: ['$timestamp', new Date('1970-01-01') / 1000]}, 60 * 60 * 24
								]
							}
						]
					},
					count: {$sum: 1}
				}}
			]).exec((err, results) => {
				// logger.info(err)
				// logger.info(results)
				if (err) {
					data.txnsError = err.toString()
				} else {
					data.txns = results
				}
				cb(null, results)
			})
		}
	], () => {
		cacheData = data
		cacheTime = Date.now()
		socket.emit(type, data)
	})
}

// function getAvgData(socket, req, type) {
// 	let dataArr = req.dataArr.length > 0 ? req.dataArr : []
// 	let data = {
// 		msg: '',
// 		blockTime: '',
// 		trans: [],
// 		blocks: []
// 	}
// 	let getAvg = (startTime, endTime) => {
// 		let nowTime = Date.parse(new Date())
// 		async.waterfall([
// 			(cb) => {
// 				Block.find({'timestamp': {'$lte': endTime}}).lean(true).sort({"timestamp": -1}).limit(1).exec((err, result) => {
// 					if (!err) {
// 						data.msg = 'Success'
// 						data.blocks.push({timestamp: endTime, data: result[0]})
// 						cb(null, data)
// 					} else {
// 						data.msg = 'Error'
// 						data.blocks = []
// 						cb(data)
// 					}
// 				})
// 			},
// 			(data, cb) => {
// 				if (data && data.blocks && (data.blocks.length === (dataArr.length - 1)) ) {
// 					Block.find({'timestamp': {'$lte': nowTime}}).lean(true).sort({"timestamp": -1}).limit(2).exec((err, result) => {
// 						if (!err) {
// 							// total()
// 							if (result.length > 1) {
// 								data.blockTime = result[0].timestamp - result[1].timestamp
// 							} else {
// 								data.blockTime = 0
// 							}
// 							data.msg = 'Success'
// 							cb(null, data)
// 						} else {
// 							data.msg = 'Error'
// 							data.blockTime = ''
// 							cb(data)
// 						}
// 					})
// 				} else {
// 					cb(null, data)
// 				}
// 			},
// 			(data, cb) => {
// 				if (isNaN(startTime)) {
// 					cb(null, data)
// 					return
// 				}
// 				Transaction.find({'timestamp': { '$gt': startTime, '$lte': endTime} }).countDocuments((err, result) => {
// 					if (!err) {
// 						data.msg = 'Success'
// 						data.trans.push({timestamp: startTime, data: result})
// 						cb(null, data)
// 					} else {
// 						data.msg = 'Error'
// 						data.trans = []
// 						cb(data)
// 					}
// 				})
// 			}
// 		], (err, data) => {
// 			if (err) {
// 				socket.emit(type, data)
// 			} else {
// 				if (data && data.trans && (data.trans.length === (dataArr.length - 1)) ) {
// 					data.trans.sort(compare('timestamp'))
// 					data.blocks.sort(compare('timestamp'))
// 					socket.emit(type, data)
// 				}
// 			}
// 		})
// 	}
// 	for (let i = 0; i < dataArr.length; i++) {
// 		let startTime = Date.parse(dataArr[i + 1] + ' ' + '00:00:00') / 1000
// 		let endTime = Date.parse(dataArr[i] + ' ' + '00:00:00') / 1000
// 		getAvg(startTime, endTime)
// 	}
// }

module.exports = {
  Avg : getAvgData
}
