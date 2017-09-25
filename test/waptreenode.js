'use strict'

let expect = require("chai").expect
let WAPTreeNode = require("../waptreenode.js")

describe('new root', function(){
    let root = WAPTreeNode.rootNode()
    expect(root.parent).to.be.null
    expect(root.count).to.equals(0)
    expect(root.event).to.be.null
    expect(root.children).to.be.null
})

describe('add child to root', function(){
    let root = WAPTreeNode.rootNode()
    let c = new WAPTreeNode(root, 1, 2)
    expect(c.event).to.equals(1)
    expect(c.count).to.equals(2)
    expect(c.children).to.be.null
    expect(c.parent).to.equals(root)

    expect(Object.keys(root.children).length).to.equals(1)
    expect(root.children[1]).to.equals(c)
})

describe('has child', function(){
    let root = WAPTreeNode.rootNode()
    expect(root.hasChild(1)).to.equals(false)
    new WAPTreeNode(root, 1, 1)
    expect(root.hasChild(1)).to.equals(true)
})

describe('get child', function(){
    let root = WAPTreeNode.rootNode()
    expect(root.getChild(1)).to.be.null
    let c = new WAPTreeNode(root, 1, 1)
    expect(root.getChild(1)).to.equals(c)
})

describe('add count', function(){
    let root = WAPTreeNode.rootNode()
    let c = new WAPTreeNode(root, 1, 1)
    c.addCount(3)
    expect(c.count).to.equals(4)
})

describe('get prefix events', function(){
    let root = WAPTreeNode.rootNode()
    let c1 = new WAPTreeNode(root, 1, 1)
    let c2 = new WAPTreeNode(c1, 2, 1)
    let c3 = new WAPTreeNode(c2, 3, 1)

    //c3's prefix events should be 1,2
    let prefixEvents = c3.getPrefixEvents()
    expect(prefixEvents.length).to.equals(2)
    expect(prefixEvents[0]).to.equals(1)
    expect(prefixEvents[1]).to.equals(2)
})

describe('has only one branch, positive', function(){
    let root = WAPTreeNode.rootNode()
    let c1 = new WAPTreeNode(root, 1, 1)
    let c2 = new WAPTreeNode(c1, 2, 1)
    let c3 = new WAPTreeNode(c2, 3, 1)
    expect(root.hasOnlyOneBranch()).to.equals(true)
})

describe('has only one branch, negative', function(){
    let root = WAPTreeNode.rootNode()
    let c1 = new WAPTreeNode(root, 1, 1)
    let c2 = new WAPTreeNode(root, 2, 1)
    let c3 = new WAPTreeNode(c2, 3, 1)
    expect(root.hasOnlyOneBranch()).to.equals(false)
})

describe('get one branch suffix events', function(){
    let root = WAPTreeNode.rootNode()
    let c1 = new WAPTreeNode(root, 1, 1)
    let c2 = new WAPTreeNode(c1, 2, 1)
    let c3 = new WAPTreeNode(c2, 3, 1)
    let events = root.getOneBranchSuffixEvents()
    expect(events.length).to.equals(3)
    expect(events[0]).to.equals(1)
    expect(events[1]).to.equals(2)
    expect(events[2]).to.equals(3)
})

describe('get one branch suffix events with empty result', function(){
    let root = WAPTreeNode.rootNode()
    let events = root.getOneBranchSuffixEvents()
    expect(events.length).to.equals(0)
})