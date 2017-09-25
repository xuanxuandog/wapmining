'use strict'

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
        }
        return this.names[name]
    }

    getName(index) {
        return this.indexes[index]
    }
}

module.exports = EventSet