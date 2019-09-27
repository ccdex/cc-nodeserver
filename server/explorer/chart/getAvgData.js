const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
let Transaction = mongoose.model( 'Transaction' )
const Block = mongoose.model( 'Block' )
const $$ = require(pathLink + '/server/public/methods/methods')
const async = require('async')
const moment = require('moment')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('GetAvgData')

let cacheData = {
	txns: [],
	blocks: []
}
let cacheTime = Date.now()

function getAvgData(socket, req, type) {
	if (!cacheData.blockError && !cacheData.txnsError && (cacheData.txns.length > 0 || cacheData.blocks.length > 0)) {
		let _s = Date.parse($$.getBeforeDate(0) + ' ' + '00:00:00')
		let _e = Date.parse($$.getBeforeDate(0) + ' ' + '23:59:59')
		if (_s < cacheTime && cacheTime <= _e) {
			socket.emit(type, cacheData)
			return
		}
	}
	let data = {
		txns: [],
		blocks: []
	}
	let intervalView = 60 * 60 * 24
	let params = {
		timestamp: {
			$gt: Date.parse(moment($$.getBeforeDate(7))) / 1000,
			$lte: Date.parse(moment($$.getBeforeDate(0))) / 1000
		}
	}
	async.waterfall([
		(cb) => {
			Block.aggregate([
				{$sort: {number: -1, timestamp: -1}},
				{$match: params},
				{$group: {
					_id: {
						$subtract: [
							{$subtract: ["$timestamp", new Date(moment('1970-01-01')) / 1000]},
							{$mod: [
								{$subtract: ["$timestamp", new Date(moment('1970-01-01')) / 1000]}, intervalView
							]}
						]
					},
					count: {$sum: 1},
					startTime: {$last: '$timestamp'},
					endTime: {$first: '$timestamp'},
					timestamp: {$last: '$timestamp'}
				}}
			]).exec((err, result) => {
				if (err) {
					data.blockError = err.toString()
				} else {
					data.blocks = result
				}
				cb(null, result)
			})
		},
		(res, cb) => {
			Transaction.aggregate([
				{$sort: {blockNumber: -1, timestamp: -1}},
				{$match: params},
				{$group: {
					_id: {
						$subtract: [
							{$subtract: ["$timestamp", new Date(moment('1970-01-01')) / 1000]},
							{$mod: [
								{$subtract: ["$timestamp", new Date(moment('1970-01-01')) / 1000]}, intervalView
							]}
						]
					},
					count: {$sum: 1},
					timestamp: {$last: '$timestamp'}
				}}
			]).exec((err, result) => {
				if (err) {
					data.txnsError = err.toString()
				} else {
					data.txns = result
				}
				cb(null, result)
			})
		}
	], () => {
		cacheData = data
		cacheTime = Date.now()
		socket.emit(type, data)
	})
}
module.exports = {
  Avg : getAvgData
}
