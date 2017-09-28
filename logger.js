'use strict'

let log4js = require('log4js')

class Logger {
    constructor(name) {
        let logger = log4js.getLogger(name)
        logger.level = 'debug'
        logger.level = 'info'
        return logger
    }
}

module.exports = Logger