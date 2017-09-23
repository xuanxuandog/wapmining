'use strict'
let expect = require("chai").expect
let WAPTree = require("../waptree.js")
let EventSet = require("../eventset.js")
let Sequence = require("../sequence.js")
let _ = require("underscore")

describe('get support count threhsold', function(){
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, 0.75)
    let supportCountThreshold = tree.getSupportCountThreshold(seqs, 0.75)
    //support count threshold is number of sequences * support threshold which is 4 * 0.75 = 3
    expect(supportCountThreshold).to.equals(3)
})

describe('get frequent events', function() {
    
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, 0.75)
    
    //frequent events should be 'a','b','c'
    let freEvents = tree.getFrequentEvents(seqs, 3)
    expect(freEvents.length).to.equals(3)
    expect(freEvents[0].id).to.equals(1)
    expect(freEvents[0].name).to.equals('a')
    expect(freEvents[1].id).to.equals(2)
    expect(freEvents[1].name).to.equals('b')
    expect(freEvents[2].id).to.equals(3)
    expect(freEvents[2].name).to.equals('c')
})


function getTestSequences() {
    /*
        abdac
        eaebcac
        babfaec
        afbacfc
    */
    let eventSet = new EventSet()
    let ea = eventSet.createEvent("a")
    let eb = eventSet.createEvent("b")
    let ec = eventSet.createEvent("c")
    let ed = eventSet.createEvent("d")
    let ee = eventSet.createEvent("e")
    let ef = eventSet.createEvent("f")
    let seqs = new Array(new Sequence(new Array(ea,eb,ed,ea,ec))
                        ,new Sequence(new Array(ee,ea,ee,eb,ec,ea,ec))
                        ,new Sequence(new Array(eb,ea,eb,ef,ea,ee,ec))
                        ,new Sequence(new Array(ea,ef,eb,ea,ec,ef,ec)))
    return seqs

}
