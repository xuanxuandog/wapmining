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
    expect(Object.keys(freEvents).length).to.equals(3)
    expect(freEvents['1'].name).to.equals('a')
    expect(freEvents['2'].name).to.equals('b')
    expect(freEvents['3'].name).to.equals('c')
})

describe('filter none frequent events', function(){
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, 0.75)
    let freEvents = tree.getFrequentEvents(seqs, 3)
    let newSeqs = tree.filterNoneFrequentEvents(seqs, freEvents)
    /*
        new sequences should be: (remove d,e,f from each sequence)
           abac
           abcac
           babac
           abacc
    */
    expect(newSeqs.length).to.equals(4)
    expect(newSeqs[0].events.map(e => e.name).toString()).to.equals('a,b,a,c')
    expect(newSeqs[1].events.map(e => e.name).toString()).to.equals('a,b,c,a,c')
    expect(newSeqs[2].events.map(e => e.name).toString()).to.equals('b,a,b,a,c')
    expect(newSeqs[3].events.map(e => e.name).toString()).to.equals('a,b,a,c,c')

})

describe('build tree', function(){
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, 0.75)
    let freEvents = tree.getFrequentEvents(seqs, 3)
    let newSeqs = tree.filterNoneFrequentEvents(seqs, freEvents)

    let headTable = tree.buildTree(newSeqs)
    /**
     * tree should look like:
     * 
     *                root
     *            a:3      b:1   
     *            b:3      a:1
     *          a:2 c:1    b:1
     *          c:2 a:1    a:1
     *          c:1 c:1    c:1
     * 
     * head table should look like:
     * 0 -> root
     * 1 -> a:3, a:2, a:1, a:1, a:1
     * 2 -> b:3, b:1, b:1
     * 3 -> c:2, c:1, c:1, c:1, c:1
     */
    expect(Object.keys(headTable).length).to.equals(4)
    //do selective checking(not check everything here)
    //check trees
    //level 1: root
    //level 2:  a:3, b:1
    expect(headTable['0'].children['1'].count).to.equals(3) 
    expect(headTable['0'].children['1'].event.name).to.equals('a')
    expect(headTable['0'].children['2'].count).to.equals(1) 
    expect(headTable['0'].children['2'].event.name).to.equals('b')
    //level 3:  b:3, a:1
    expect(headTable['0'].children['1'].children['2'].count).to.equals(3) 
    expect(headTable['0'].children['1'].children['2'].event.name).to.equals('b')
    expect(headTable['0'].children['2'].children['1'].count).to.equals(1) 
    expect(headTable['0'].children['2'].children['1'].event.name).to.equals('a')
    //omit others

    //check head table other than root node
    //1 -> a:3, a:2, a:1, a:1, a:1
    expect(headTable['1'].length).to.equals(5)
    expect(headTable['1'][1].count).to.equals(2)//a:2
    //2 -> b:3, b:1, b:1
    expect(headTable['2'].length).to.equals(3)
    expect(headTable['2'][0].count).to.equals(3)//b:3
    //3 -> c:2, c:1, c:1, c:1, c:1
    expect(headTable['3'].length).to.equals(5)
    expect(headTable['3'][4].count).to.equals(1)//the last c:1
    expect(headTable['3'][4].event.name).to.equals('c')

})

describe('get conditional prefix sequences', function(){
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, 0.75)
    let freEvents = tree.getFrequentEvents(seqs, 3)
    let newSeqs = tree.filterNoneFrequentEvents(seqs, freEvents)
    let headTable = tree.buildTree(newSeqs)

    /**
     * calculate the prefix sequences of node c:2, c:1, c:1, c:1, c:1
     * should be:  aba : 2; ab : 1; abca : 1; ab : -1; baba : 1; abac : 1; aba : -1
     * hence should be: aba:1, abca:1, baba:1, abac:1
     */
    let prefixSeqs = tree.getConditionalPrefixSequences(headTable['3'])
    expect(prefixSeqs.length).to.equals(4)
    var aba = false
    var abca = false
    var baba = false
    var abac = false
    _.forEach(prefixSeqs, function(seq){
        if (seq.id == '1,2,1') {
            aba = true
        } else if (seq.id == '1,2,3,1') {
            abca = true
        } else if (seq.id == '2,1,2,1') {
            baba = true
        } else if (seq.id == '1,2,1,3') {
            abac = true
        }
    })
    expect(aba).to.equals(true)
    expect(abca).to.equals(true)
    expect(baba).to.equals(true)
    expect(abac).to.equals(true)
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
