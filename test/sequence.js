'use strict'

let expect = require("chai").expect
let Sequence = require("../sequence.js")

describe('init with default count 1', function() {
    let seq = new Sequence(new Array(1,2))
    expect(seq.count).to.equals(1)
    expect(seq.events.length).to.equals(2)
    expect(seq.events[0]).to.equals(1)
    expect(seq.events[1]).to.equals(2)
})

describe('init with given count', function() {
    let seq = new Sequence(new Array(1,2), 2)
    expect(seq.count).to.equals(2)
    expect(seq.events.length).to.equals(2)
    expect(seq.events[0]).to.equals(1)
    expect(seq.events[1]).to.equals(2)
})

describe('test id', function(){
    let seq = new Sequence(new Array(1,2))
    expect(seq.id).to.equals('1,2') 
})

describe('get sub sequences', function(){
    let seq = new Sequence(new Array(1, 2, 3))
    let subSeqs = seq.getSubSequences()
    //subSeqs is 1, 2, 3, 12,123,23
    expect(subSeqs.length == 6)
    expect(subSeqs[0].id).to.equals("1")
    expect(subSeqs[1].id).to.equals("2")
    expect(subSeqs[2].id).to.equals("3")
    expect(subSeqs[3].id).to.equals("1,2")
    expect(subSeqs[4].id).to.equals("1,2,3")
    expect(subSeqs[5].id).to.equals("2,3")
    
})

describe('get sub sequences for duplicate', function(){
    let seq = new Sequence(new Array(1, 1))
    let subSeqs = seq.getSubSequences()
    //subSeqs is 1,11
    expect(subSeqs.length == 2)
    expect(subSeqs[0].id).to.equals("1")
    expect(subSeqs[1].id).to.equals("1,1")
})