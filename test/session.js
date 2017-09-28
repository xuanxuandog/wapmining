'use strict'
let expect = require("chai").expect
let TimeoutBasedSession = require('../session.js')

describe('calculate timeout', function(){
    let session = new TimeoutBasedSession(getRawlogs())
    expect(session.calculateTimeout()).to.equals(60)
})

describe('get sessions', function(){
    let sessions = new TimeoutBasedSession(getRawlogs()).groupToSessions()
    /**
     * should be:
     * [
     * { ts: 1506399984.831362 }, { ts: 1506399985.831362 }
     * { ts: 1506499985.831362 }, { ts: 1506499995.831362 }
     * { ts: 1507499985.831362 }
     * ]
     */
    expect(sessions.length).to.equals(3)
    expect(sessions[0][0].ts).to.equals(1506399984.831362)
    expect(sessions[0][1].ts).to.equals(1506399985.831362)
    expect(sessions[1][0].ts).to.equals(1506499985.831362)
    expect(sessions[1][1].ts).to.equals(1506499995.831362)
    expect(sessions[2][0].ts).to.equals(1507499985.831362)
})


function getRawlogs() {
    let rawlogs = new Array()
    rawlogs.push({ts : 1506399984.831362})
    rawlogs.push({ts : 1506499995.831362})
    rawlogs.push({ts : 1507499985.831362})
    rawlogs.push({ts : 1506499985.831362})
    rawlogs.push({ts : 1506399985.831362})
    return rawlogs
}