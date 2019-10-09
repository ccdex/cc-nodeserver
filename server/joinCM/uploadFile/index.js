const path = require("path")
const pathLink = path.resolve(".")

const fs = require("fs")
const express = require('express')
const router = express.Router()

const $$ = require(pathLink + '/server/public/methods/methods')
const logger = require(pathLink + '/server/public/methods/log4js').getLogger('UploadFile')

router.post('/', (req, res) => {

  let newName = req.files[0].path + path.parse(req.files[0].originalname).ext
  let newName1 = $$.config.file.download + req.files[0].filename + path.parse(req.files[0].originalname).ext
  fs.rename(req.files[0].path, newName, (err) => {
    if (err) {
      logger.error(err.toString())
    }
    res.send(newName1)
    // res.send('newName1')
  })
})


module.exports = router