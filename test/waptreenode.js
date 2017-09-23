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

describe('has child', function(){
    let root = WAPTreeNode.rootNode()
    expect(root.hasChild('1')).to.equals(false)
    new WAPTreeNode(root, new Event(1, 'n1'), 1)
    expect(root.hasChild('1')).to.equals(true)
})

describe('get child', function(){
    let root = WAPTreeNode.rootNode()
    expect(root.getChild('1')).to.be.null
    let c = new WAPTreeNode(root, new Event(1, 'n1'), 1)
    expect(root.getChild('1')).to.equals(c)
})

describe('add count', function(){
    let root = WAPTreeNode.rootNode()
    let c = new WAPTreeNode(root, new Event(1, 'n1'), 1)
    c.addCount(3)
    expect(c.count).to.equals(4)
})

describe('get prefix events', function(){
    let root = WAPTreeNode.rootNode()
    let c1 = new WAPTreeNode(root, new Event(1, 'n1'), 1)
    let c2 = new WAPTreeNode(c1, new Event(2, 'n2'), 1)
    let c3 = new WAPTreeNode(c2, new Event(3, 'n3'), 1)

    //c3's prefix events should be n1,n2
    let prefixEvents = c3.getPrefixEvents()
    expect(prefixEvents.length).to.equals(2)
    expect(prefixEvents[0].name).to.equals('n1')
    expect(prefixEvents[1].name).to.equals('n2')
})