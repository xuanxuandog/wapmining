'use strict'

let expect = require("chai").expect
let Sequence = require("../sequence.js")
let Event = require("../event.js")

describe('init with default count 1', function() {
    let seq = new Sequence(new Array(new Event(1,"n1"),new Event(2,"n2")))
    expect(seq.count).to.equals(1)
    expect(seq.events.length).to.equals(2)
    expect(seq.events[0].id).to.equals(1)
    expect(seq.events[0].name).to.equals("n1")
    expect(seq.events[1].id).to.equals(2)
    expect(seq.events[1].name).to.equals("n2")
})

describe('init with given count', function() {
    let seq = new Sequence(new Array(new Event(1,"n1"),new Event(2,"n2")), 2)
    expect(seq.count).to.equals(2)
    expect(seq.events.length).to.equals(2)
    expect(seq.events[0].id).to.equals(1)
    expect(seq.events[0].name).to.equals("n1")
    expect(seq.events[1].id).to.equals(2)
    expect(seq.events[1].name).to.equals("n2")
})

describe('test id', function(){
    let seq = new Sequence(new Array(new Event(1,"n1"),new Event(2,"n2")), 2)
    expect(seq.id).to.equals('1,2') 
})

describe('get sub sequences', function(){
    let seq = new Sequence(new Array(new Event(1, "a"), new Event(2, "b"), new Event(3, "c")))
    let subSeqs = seq.getSubSequences()
    //subSeqs is a, ab, abc, b, bc, c
    expect(subSeqs.length == 6)
    expect(subSeqs[0].id).to.equals("1")//a
    expect(subSeqs[1].id).to.equals("1,2")//a,b
    expect(subSeqs[2].id).to.equals("1,2,3")//a,b,c
    expect(subSeqs[3].id).to.equals("2")//b
    expect(subSeqs[4].id).to.equals("2,3")//b,c
    expect(subSeqs[5].id).to.equals("3")//c
})