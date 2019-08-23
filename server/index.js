const path = require("path").resolve(".")
const pathLink = path

const $$ = require(pathLink + '/server/public/methods/methods')

const walletEnter = require(pathLink + '/server/enterGroup/wallet')
const explorerEnter = require(pathLink + '/server/enterGroup/explorer')
const dexappEnter = require(pathLink + '/server/enterGroup/dexapp')
const manger = require(pathLink + '/server/enterGroup/manger')
const public = require(pathLink + '/server/enterGroup/public')

function StartSocket (socket, io) {
    public(socket, io)
    if ($$.config.isUseEnters.wallet) {
        walletEnter(socket, io)
    }
    if ($$.config.isUseEnters.explorer) {
        explorerEnter(socket, io)
    }
    if ($$.config.isUseEnters.dexapp) {
        dexappEnter(socket, io)
    }
    if ($$.config.isUseEnters.manger) {
        manger(socket, io)
    }
}

module.exports = StartSocket
