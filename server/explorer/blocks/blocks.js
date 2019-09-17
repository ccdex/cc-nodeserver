const path = require("path").resolve(".")
const pathLink = path

require( pathLink + '/server/public/methods/db.js' )
const mongoose = require( 'mongoose' )
const Block = mongoose.model( 'Block' )
const async = require('async')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('Blocks')
const $$ = require(pathLink + '/server/public/methods/methods')

// function blocks(socket, req, type) {
function BlockList(socket, req, type) {
	let _params = {
		pageSize: req && req.pageSize ? req.pageSize : 50,
		skip: 0
	}
	_params.skip = req && req.pageNum ? (Number(req.pageNum - 1) * Number(_params.pageSize)) : 0
	let data = {
		msg: '',
		info: '',
		total: ''
	}
	type = type ? type : 'blocks'
	let params = {}
	if (req) {
		if (req.Txns || req.Txns === 0) {
			params.Txns = req.Txns
		}
		if (req.hash) {
			params.hash = req.hash
		}
		if (req.number || req.number === 0) {
			params.number = req.number
		}
		if (req.parentHash) {
			params.parentHash = req.parentHash
		}
	}
	async.waterfall([
		(cb) => {
			Block.find(params).countDocuments((err, result) => {
				if (err) {
					data.msg = 'Error'
					data.error = err.toString()
					data.info = []
					cb(err)
				} else {
					data.total = result
					cb(null, data)
				}
			})
		},
		(res, cb) => {
			Block.find(params).lean(true).sort({"number": -1}).skip(Number(_params.skip)).limit(Number(_params.pageSize)).exec((err,result) => {
				if (err) {
					data.msg = 'Error'
					data.error = err.toString()
					data.info = []
					cb(err)
				} else {
					data.msg = 'Success'
					for (let i = 0, len = result.length; i < len; i++) {
						result[i].reward = $$.fromWei(result[i].reward, 'ether')
					}
					data.info = result
					cb(null, data)
				}
			})
		}
	], (err) => {
		if (err) {
			logger.error(err)
		}
		socket.emit(type, data)
	})
}

function BlockDtil(socket, req, type) {
	let params = {
		number: req.number ? req.number : 0
	}
	let data = {
		msg: '',
		info: ''
	}			
	Block.find({'number': Number(params.number)}).lean(true).exec((err, result) => {
		if (!err) {
			// total()
			data.msg = 'Success'
			for (let i = 0, len = result.length; i < len; i++) {
				result[i].reward = $$.fromWei(result[i].reward, 'ether')
			}
			data.info = result[0]
		} else {
			logger.error(err)
			data.msg = 'Error'
			data.error = err.toString()
			data.info = []
		}
		socket.emit(type, data)
		// logger.info(type + ' callback data success')
	})
}

module.exports = {
  List : BlockList,
  Dtil : BlockDtil,
}