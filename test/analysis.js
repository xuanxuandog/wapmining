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
     * {"patterns":[["a"],["a","b"],["b"]]}
     */
    expect(result.patterns.length).to.equals(3)
    expect(result.patterns[0].length).to.equals(1)
    expect(result.patterns[0][0]).to.equals('a')

    expect(result.patterns[1].length).to.equals(2)
    expect(result.patterns[1][0]).to.equals('a')
    expect(result.patterns[1][1]).to.equals('b')
    
    expect(result.patterns[2].length).to.equals(1)
    expect(result.patterns[2][0]).to.equals('b')
})

describe('analysis', function(){
    let analysis = new Analysis({params:{supportThreshold:0.6}})
    let profile = {"patterns":[["a"],["b"]]}
    let sample = {"patterns":[["a"],["c"]]}
    let result = analysis.analysis(profile, sample)
    /**
     * should be:
     * {"anomaly":{"patterns":[["c"]]}}
     */
    expect(result.anomaly.patterns.length).to.equals(1)
    expect(result.anomaly.patterns[0].length).to.equals(1)
    expect(result.anomaly.patterns[0][0]).to.equals('c')

})