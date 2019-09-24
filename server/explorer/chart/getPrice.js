const path = require("path").resolve(".")
const pathLink = path

const https = require('https')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('GetPrice')

let mainCoinDollar = ''

function getPrice () {
  // const https = require('https')
	var url = 'https://graphs2.coinmarketcap.com/currencies/fusion/' //输入任何网址都可以

	// logger.info('-----------------------')
	
	https.get(url,function(res){
		var html=''
		res.on('data',function(data){
			html += data
		})
		res.on('end',function(){
			// socket.emit(type, html)
			mainCoinDollar = html
			setTimeout(() => {
				getPrice()
			}, 1000 * 60 * 60 * 8)
		})
	}).on('error',function(){
		logger.error('获取资源出错！')
		setTimeout(() => {
			getPrice()
		}, 1000 * 10)
	})
}

function setPrice (socket, req, type) {
	socket.emit(type, mainCoinDollar)
}

getPrice()

module.exports = {
  Price : setPrice
}
