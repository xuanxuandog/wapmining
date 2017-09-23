'use strict'

let Event = require('./event.js')

class EventSet {
    constructor() {
        this.events = {}
        this.index = 0
    }

    createEvent(name) {
        if (this.events[name] == null) {
            this.index = this.index + 1
            this.events[name] = new Event(this.index, name)
        }
        return this.events[name]
    }
}

module.exports = EventSet