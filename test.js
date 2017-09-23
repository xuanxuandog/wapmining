
'use strict';

let Sequence = require('./sequence.js')
let WAPTree = require('./waptree.js')
let WAPTreeNode = require('./waptreenode.js')
let EventSet = require('./eventset.js')
let Event = require('./event.js')

let eventSet = new EventSet()
console.log(eventSet.createEvent('name1'))
console.log(eventSet.createEvent('name2'))

let root = new WAPTreeNode(undefined, undefined, 0)
let c1 = new WAPTreeNode(root, eventSet.createEvent('name1'), 3)
let c2 = new WAPTreeNode(c1, eventSet.createEvent('name2'), 5)
let s = new Sequence(new Array(eventSet.createEvent('name1'), eventSet.createEvent('name3')), 3)
let s1 = new Sequence(new Array(eventSet.createEvent('name1'), eventSet.createEvent('name3')))


