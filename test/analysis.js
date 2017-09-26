'use strict'
let expect = require("chai").expect
let Analysis = require('../analysis.js')
let Sequence = require('../sequence.js')
let _ = require('underscore')

describe('get sessions', function(){
    let analysis = new Analysis()
    let rawlogs = new Array()
    rawlogs.push({ts : 1506399984.831362})
    rawlogs.push({ts : 1506499995.831362})
    rawlogs.push({ts : 1507499985.831362})
    rawlogs.push({ts : 1506499985.831362})
    rawlogs.push({ts : 1506399985.831362})
    let sessions = analysis.getSessions(rawlogs)
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

describe('get pattern', function(){
    let analysis = new Analysis({params:{supportThreshold:0.6}})
    let rawlogs = new Array()
    rawlogs.push({ts : 1506399984.831362, event : 'a'})
    rawlogs.push({ts : 1506499995.831362, event : 'b'})
    rawlogs.push({ts : 1507499985.831362, event : 'c'})
    rawlogs.push({ts : 1506499985.831362, event : 'a'})
    rawlogs.push({ts : 1506399985.831362, event : 'b'})

    let result = analysis.getResult(rawlogs)
    /**
     * should be:
     * {"1":"a","2":"b","1,2":"a,b"}
     */
    expect(Object.keys(result).length).to.equals(3)
    expect(result['1']).to.equals('a')
    expect(result['2']).to.equals('b')
    expect(result['1,2']).to.equals('a,b')
})

describe('analysis', function(){
    let analysis = new Analysis({params:{supportThreshold:0.6}})
    let profile = {1:"a", 2:"b"}
    let sample = {2:"b", 3:"c"}
    let result = analysis.analysis(profile, sample)
    /**
     * should be:
     * {"anomaly":{"3":"c"}}
     */
    expect(result['anomaly']['3']).to.equals('c')
    expect(Object.keys(result['anomaly']).length).to.equals(1)
})