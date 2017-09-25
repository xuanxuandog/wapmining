'use strict'
let expect = require("chai").expect
let EventSet = require("../eventset.js")

describe('index auto incremented', function(){
    let eventSet = new EventSet()
    let e1 = eventSet.createEvent("name1")
    let e2 = eventSet.createEvent("name2")
    expect(eventSet.index).to.equals(2)
    expect(e1).to.equals(1)
    expect(e2).to.equals(2)
})

describe('will not create duplicate event id', function(){
    let eventSet = new EventSet()
    let e1 = eventSet.createEvent("name1")
    let e2 = eventSet.createEvent("name1")
    expect(eventSet.index).to.equals(1)
    expect(e1).to.equals(1)
    expect(e2).to.equals(1)
})

describe('get name', function(){
    let eventSet = new EventSet() 
    eventSet.createEvent("name1")
    eventSet.createEvent("name2")
    expect(eventSet.getName(1)).to.equals('name1')
    expect(eventSet.getName(2)).to.equals('name2')
})
