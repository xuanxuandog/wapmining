
'use strict';

class Sequence {
    constructor(events, count) {
        this.events = events;
        if (count == null) {
            this.count = 1
        } else {
            this.count = count
        }
    }
}

module.exports = Sequence