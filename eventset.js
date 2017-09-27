'use strict'

let Logger = require('./logger.js')
let log = new Logger('EventSet')

class EventSet {
    constructor() {
        this.names = {}
        this.indexes = {}
        this.index = 0
    }

    createEvent(name) {
        if (this.names[name] == null) {
            this.index = this.index + 1
            this.indexes[this.index] = name
            this.names[name] = this.index
            log.debug(this.index + ":" + name)
        }
        return this.names[name]
    }

    getName(index) {
        return this.indexes[index]
    }
}

module.exports = EventSet