'use strict'

let expect = require("chai").expect
let Event = require('../event.js')

describe('set id and name', function(){
    let e1 = new Event(1, 'name1')
    expect(e1.id).to.equals(1)
    expect(e1.name).to.equals('name1')
})