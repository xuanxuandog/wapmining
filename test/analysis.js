'use strict'
let expect = require("chai").expect
let Analysis = require('../analysis.js')
let Sequence = require('../sequence.js')
let _ = require('underscore')

describe('set event value by field name', function() {
    let analysis = new Analysis()
    let rawlogs = new Array()
    rawlogs.push({ts : 1, event : 'e1'})
    let p = analysis.getPatterns(rawlogs)
    //{"patterns":[["e1"]]}
    expect(p.patterns[0][0]).to.equals('e1')
})

describe('set event value by fields name', function(){
    let analysis = new Analysis({
        rawlog:{
            event:['host','ip']
        }
    })
    let rawlogs = new Array()
    rawlogs.push({ts : 1, host : 'e1'})
    rawlogs.push({ts : 2, ip : 'e2'})
    let p = analysis.getPatterns(rawlogs)
    //{"patterns":[["e1"],["e2"],["e1","e2"]]}
    expect(p.patterns[0][0]).to.equals('e1')
    expect(p.patterns[1][0]).to.equals('e2')
    expect(p.patterns[2][0]).to.equals('e1')
    expect(p.patterns[2][1]).to.equals('e2')
})

describe('set event value by function', function(){
    let analysis = new Analysis({
        rawlog:{
            event: function(rawlog){
                return rawlog['e']
            }
        }
    })
    let rawlogs = new Array()
    rawlogs.push({ts : 1, e : 'e1'})
    let p = analysis.getPatterns(rawlogs)
    //{"patterns":[["e1"]]}
    expect(p.patterns[0][0]).to.equals('e1')
})

describe('get pattern', function(){
    let analysis = new Analysis({params:{supportThreshold:0.6}})
    let rawlogs = new Array()
    rawlogs.push({ts : 1506399984.831362, event : 'a'})
    rawlogs.push({ts : 1506499995.831362, event : 'b'})
    rawlogs.push({ts : 1507499985.831362, event : 'c'})
    rawlogs.push({ts : 1506499985.831362, event : 'a'})
    rawlogs.push({ts : 1506399985.831362, event : 'b'})

    let result = analysis.getPatterns(rawlogs)
    /**
     * should be:
     * { patterns: [ [ 'a' ], [ 'b' ], [ 'a', 'b' ] ] }
     */
    expect(result.patterns.length).to.equals(3)
    expect(result.patterns[0].length).to.equals(1)
    expect(result.patterns[0][0]).to.equals('a')

    expect(result.patterns[1].length).to.equals(1)
    expect(result.patterns[1][0]).to.equals('b')

    expect(result.patterns[2].length).to.equals(2)
    expect(result.patterns[2][0]).to.equals('a')
    expect(result.patterns[2][1]).to.equals('b')
    
    
})

describe('findAnomaly', function(){
    let profile = {"patterns":[["a"],["b"]]}
    let sample = {"patterns":[["a"],["c"]]}
    let result = Analysis.findAnomaly(profile, sample)
    /**
     * should be:
     * {"anomaly":{"patterns":[["c"]]}}
     */
    expect(result.anomaly.patterns.length).to.equals(1)
    expect(result.anomaly.patterns[0].length).to.equals(1)
    expect(result.anomaly.patterns[0][0]).to.equals('c')

})


describe('match pattern', function(){
    let profile = {"patterns":[["a"],["b"]]}
    let sample = {"patterns":[["a"],["c"]]}
    expect(Analysis.matchPattern(profile, sample)).to.equals(0.5)
})