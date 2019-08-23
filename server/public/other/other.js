const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
let Transaction = mongoose.model( 'Transaction' )
const Block = mongoose.model( 'Block' )
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

function getAvgData(socket, req, type) {
	let dataArr = req.dataArr.length > 0 ? req.dataArr : []
	let data = {
		msg: '',
		blockTime: '',
		trans: [],
		blocks: []
	}
	let getAvg = (startTime, endTime) => {
		let nowTime = Date.parse(new Date())
		async.waterfall([
			(cb) => {
				Block.find({'timestamp': {'$lte': endTime}}).lean(true).sort({"timestamp": -1}).limit(1).exec((err, result) => {
					if (!err) {
						data.msg = 'Success'
						data.blocks.push({timestamp: endTime, data: result[0]})
						cb(null, data)
					} else {
						data.msg = 'Error'
						data.blocks = []
						cb(data)
					}
				})
			},
			(data, cb) => {
				if (data && data.blocks && (data.blocks.length === (dataArr.length - 1)) ) {
					Block.find({'timestamp': {'$lte': nowTime}}).lean(true).sort({"timestamp": -1}).limit(2).exec((err, result) => {
						if (!err) {
							// total()
							if (result.length > 1) {
								data.blockTime = result[0].timestamp - result[1].timestamp
							} else {
								data.blockTime = 0
							}
							data.msg = 'Success'
							cb(null, data)
						} else {
							data.msg = 'Error'
							data.blockTime = ''
							cb(data)
						}
					})
				} else {
					cb(null, data)
				}
			},
			(data, cb) => {
				if (isNaN(startTime)) {
					cb(null, data)
					return
				}
				Transaction.find({'timestamp': { '$gt': startTime, '$lte': endTime} }).countDocuments((err, result) => {
					if (!err) {
						data.msg = 'Success'
						data.trans.push({timestamp: startTime, data: result})
						cb(null, data)
					} else {
						data.msg = 'Error'
						data.trans = []
						cb(data)
					}
				})
			}
		], (err, data) => {
			if (err) {
				socket.emit(type, data)
			} else {
				if (data && data.trans && (data.trans.length === (dataArr.length - 1)) ) {
					data.trans.sort(compare('timestamp'))
					data.blocks.sort(compare('timestamp'))
					socket.emit(type, data)
				}
			}
		})
	}
	for (let i = 0; i < dataArr.length; i++) {
		let startTime = Date.parse(dataArr[i + 1] + ' ' + '00:00:00') / 1000
		let endTime = Date.parse(dataArr[i] + ' ' + '00:00:00') / 1000
		getAvg(startTime, endTime)
	}
}

module.exports = {
  Avg : getAvgData
}
