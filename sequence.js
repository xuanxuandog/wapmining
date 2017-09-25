
'use strict';

class Sequence {
    constructor(events, count) {
        this.events = events;
        if (count == null) {
            this.count = 1
        } else {
            this.count = count
        }
        //event1,event2....
        this.id = events.toString()
    }

    getSubSequences() {
        /**
         * for sequence 1,2,3, will return 1, 12, 123, 2, 23, 3
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