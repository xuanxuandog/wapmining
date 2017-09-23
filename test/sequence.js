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