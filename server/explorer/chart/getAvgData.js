const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
let Transaction = mongoose.model( 'Transaction' )
const Block = mongoose.model( 'Block' )
const $$ = require(pathLink + '/server/public/methods/methods')
const async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('GetAvgData')

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
		let _s = Date.parse($$.getBeforeDate(0) + ' ' + '00:00:00')
		let _e = Date.parse($$.getBeforeDate(0) + ' ' + '23:59:59')
		if (_s < cacheTime && cacheTime <= _e) {
			socket.emit(type, cacheData)
			return
		}
	}
	let dateArr = []
	for (let i = 1; i <= 7; i++) {
		let _s = Date.parse($$.getBeforeDate(i) + ' ' + '00:00:00') / 1000
		let _e = Date.parse($$.getBeforeDate(i) + ' ' + '23:59:59') / 1000
		dateArr.push({
			timestamp: {
				$gt: _s,
				$lte: _e
			}
		})
	}
	async.eachSeries(dateArr, (params, callback) => {
		// logger.info(params)
		async.waterfall([
			(cb) => {
				Block.aggregate([
					{$sort: {number: -1, timestamp: -1}},
					{$match: params},
					{$group: {
						_id: null,
						count: {$sum: 1},
						startTime: {$last: '$timestamp'},
						endTime: {$first: '$timestamp'},
						timestamp: {$last: '$timestamp'}
					}}
				]).exec((err, result) => {
					if (err) {
						data.blockError = err.toString()
					} else {
						data.blocks.push(...result)
					}
					cb(null, result)
				})
			},
			(res, cb) => {
				Transaction.find(params).sort({blockNumber: -1, timestamp: -1}).countDocuments((err, result) => {
					if (err) {
						data.txnsError = err.toString()
					} else {
						data.txns.push({count: result, timestamp: params.timestamp.$gt})
					}
					cb(null, result)
				})
			}
		], () => {
			callback(null, params)
		})
	}, () => {
		// logger.info(data)
		cacheData = data
		cacheTime = Date.now()
		socket.emit(type, data)
	})
}

module.exports = {
  Avg : getAvgData
}
