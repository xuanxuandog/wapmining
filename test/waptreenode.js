'use strict'

let expect = require("chai").expect
let WAPTreeNode = require("../waptreenode.js")
let Event = require("../event.js")

describe('new root', function(){
    let root = WAPTreeNode.rootNode()
    expect(root.parent).to.be.null
    expect(root.count).to.equals(0)
    expect(root.event).to.be.null
    expect(root.children).to.be.null
})

describe('add child to root', function(){
    let root = WAPTreeNode.rootNode()
    let e = new Event(1,'n1')
    let c = new WAPTreeNode(root, e, 2)
    expect(c.event).to.equals(e)
    expect(c.count).to.equals(2)
    expect(c.children).to.be.null
    expect(c.parent).to.equals(root)

    expect(Object.keys(root.children).length).to.equals(1)
    expect(root.children['1']).to.equals(c)
})