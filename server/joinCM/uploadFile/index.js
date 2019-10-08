const path = require("path")
const pathLink = path.resolve(".")
const fs = require("fs")
const express = require('express')
const router = express.Router()

const logger = require(pathLink + '/server/public/methods/log4js').getLogger('UploadFile')

router.post('/', (req, res) => {

  let newName = req.files[0].path + path.parse(req.files[0].originalname).ext
  fs.rename(req.files[0].path, newName, (err) => {
    logger.info(newName)
    res.send(newName)
  })
})


module.exports = router