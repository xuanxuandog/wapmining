
'use strict';

class Sequence {
    constructor(events, count) {
        this.events = events;
        if (count == null) {
            this.count = 1
        } else {
            this.count = count
        }
        //eventId1,eventId2....
        this.id = events.map(e => e.id).toString()
    }

    getSubSequences() {
        /**
         * for sequence abc, will return a, ab, abc, b, bc, c
         */
        let result = new Array()
        for(var i = 0; i < this.events.length; i = i + 1) {
            //add all events sequence starting with this event(inclusive)
            for (var j = 0; i + j < this.events.length; j = j + 1) {
                result.push(new Sequence(this.events.slice(i, i + j + 1)))
            }
        }
        return result
    }
}

module.exports = Sequence