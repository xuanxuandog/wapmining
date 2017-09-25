'use strict'
let expect = require("chai").expect
let WAPTree = require("../waptree.js")
let WAPTreeNode = require("../waptreenode.js")
let EventSet = require("../eventset.js")
let Sequence = require("../sequence.js")
let _ = require("underscore")

describe('get support count threhsold', function(){
    let seqs = getTestSequences()
    //support count threshold is number of sequences * support threshold which is 4 * 0.75 = 3
    expect(WAPTree.getSupportCountThreshold(seqs, 0.75)).to.equals(3)
})

describe('get frequent events', function() {
    
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, WAPTree.getSupportCountThreshold(seqs, 0.75))
    
    //frequent events should be 1,2,3
    let freEvents = tree.getFrequentEvents(seqs, 3)
    expect(Object.keys(freEvents).length).to.equals(3)
    expect(freEvents[1]).to.equals(1)
    expect(freEvents[2]).to.equals(2)
    expect(freEvents[3]).to.equals(3)
})

describe('filter none frequent events', function(){
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, WAPTree.getSupportCountThreshold(seqs, 0.75))
    let freEvents = tree.getFrequentEvents(seqs, 3)
    let newSeqs = tree.filterNoneFrequentEvents(seqs, freEvents)
    /*
        new sequences should be: (remove 4,5,6 from each sequence)
           1213
           12313
           21213
           12133
    */
    expect(newSeqs.length).to.equals(4)
    expect(newSeqs[0].id).to.equals('1,2,1,3')
    expect(newSeqs[1].id).to.equals('1,2,3,1,3')
    expect(newSeqs[2].id).to.equals('2,1,2,1,3')
    expect(newSeqs[3].id).to.equals('1,2,1,3,3')

})

describe('build tree', function(){
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, WAPTree.getSupportCountThreshold(seqs, 0.75))
    let freEvents = tree.getFrequentEvents(seqs, 3)
    let newSeqs = tree.filterNoneFrequentEvents(seqs, freEvents)

    let headTable = tree.buildTree(newSeqs)
    /**
     * tree should look like:
     * 
     *                root
     *            1:3      2:1   
     *            2:3      1:1
     *          1:2 3:1    2:1
     *          3:2 1:1    1:1
     *          3:1 3:1    3:1
     * 
     * head table should look like:
     * 0 -> root
     * 1 -> 1:3, 1:2, 1:1, 1:1, 1:1
     * 2 -> 2:3, 2:1, 2:1
     * 3 -> 3:2, 3:1, 3:1, 3:1, 3:1
     */
    expect(Object.keys(headTable).length).to.equals(4)
    //do selective checking(not check everything here)
    //check trees
    //level 1: root
    //level 2:  1:3, 2:1
    expect(headTable['0'].children['1'].count).to.equals(3) 
    expect(headTable['0'].children['1'].event).to.equals(1)
    expect(headTable['0'].children['2'].count).to.equals(1) 
    expect(headTable['0'].children['2'].event).to.equals(2)
    //level 3:  b:3, a:1
    expect(headTable['0'].children['1'].children['2'].count).to.equals(3) 
    expect(headTable['0'].children['1'].children['2'].event).to.equals(2)
    expect(headTable['0'].children['2'].children['1'].count).to.equals(1) 
    expect(headTable['0'].children['2'].children['1'].event).to.equals(1)
    //omit others

    //check head table other than root node
    //1 -> 1:3, 1:2, 1:1, 1:1, 1:1
    expect(headTable['1'].length).to.equals(5)
    expect(headTable['1'][1].count).to.equals(2)//1:2
    //2 -> b:3, b:1, b:1
    expect(headTable['2'].length).to.equals(3)
    expect(headTable['2'][0].count).to.equals(3)//2:3
    //3 -> c:2, c:1, c:1, c:1, c:1
    expect(headTable['3'].length).to.equals(5)
    expect(headTable['3'][4].count).to.equals(1)//the last 3:1
    expect(headTable['3'][4].event).to.equals(3)

})

describe('get conditional prefix sequences', function(){
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, WAPTree.getSupportCountThreshold(seqs, 0.75))
    let freEvents = tree.getFrequentEvents(seqs, 3)
    let newSeqs = tree.filterNoneFrequentEvents(seqs, freEvents)
    let headTable = tree.buildTree(newSeqs)

    /**
     * calculate the prefix sequences of node 3:2, 3:1, 3:1, 3:1, 3:1
     * should be:  121 : 2; 12 : 1; 1231 : 1; 12 : -1; 2121 : 1; 1213 : 1; 121 : -1
     * hence should be: 121:1, 1231:1, 2121:1, 1213:1
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

describe('getFrequentSequences only one branch', function(){
    let root = WAPTreeNode.rootNode()
    let c1 = new WAPTreeNode(root, 1, 1)
    let c2 = new WAPTreeNode(c1, 2, 1)
    let c3 = new WAPTreeNode(c2, 3, 1)

    let tree = new WAPTree(null, null)
    let patterns = tree.getFrequentSequences(root, null)
    //should be 1,12,123,2,23,3
    expect(patterns.length).to.equals(6)
    expect(patterns[0].id).to.equals("1") 
    expect(patterns[1].id).to.equals("1,2")/
    expect(patterns[2].id).to.equals("1,2,3")
    expect(patterns[3].id).to.equals("2")
    expect(patterns[4].id).to.equals("2,3")
    expect(patterns[5].id).to.equals("3")
})

describe('getFrequentSequences only one branch with empty result', function(){
    let root = WAPTreeNode.rootNode()
    let tree = new WAPTree(null, null)
    let patterns = tree.getFrequentSequences(root, null)
    expect(patterns.length).to.equals(0)
})

describe('getFrequentSequences multiple branches', function(){
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, WAPTree.getSupportCountThreshold(seqs, 0.75))
    let freEvents = tree.getFrequentEvents(seqs, 3)
    let newSeqs = tree.filterNoneFrequentEvents(seqs, freEvents)
    let headTable = tree.buildTree(newSeqs)
    let patterns = tree.getFrequentSequences(headTable[0],headTable)
    /** patterns should be: 
     *  1
        1,1
        2,1
        1,2,1
        2
        1,2
        3
        1,3
        1,1,3
        2,1,3
        1,2,1,3
        2,3
        1,2,3
     */
    expect(patterns.length).to.equals(13)
    expect(patterns[0].id).to.equals('1') 
    expect(patterns[1].id).to.equals('1,1') 
    expect(patterns[2].id).to.equals('2,1') 
    expect(patterns[3].id).to.equals('1,2,1') 
    expect(patterns[4].id).to.equals('2') 
    expect(patterns[5].id).to.equals('1,2')
    expect(patterns[6].id).to.equals('3')
    expect(patterns[7].id).to.equals('1,3')
    expect(patterns[8].id).to.equals('1,1,3')
    expect(patterns[9].id).to.equals('2,1,3')
    expect(patterns[10].id).to.equals('1,2,1,3')
    expect(patterns[11].id).to.equals('2,3')
    expect(patterns[12].id).to.equals('1,2,3')        
})

describe('get result', function(){
    let seqs = getTestSequences()
    let tree = new WAPTree(seqs, WAPTree.getSupportCountThreshold(seqs, 0.99))
    let patterns = tree.getResult()
    /** patterns should be: 
     *  1
        1,1
        2,1
        1,2,1
        2
        1,2
        3
        1,3
        1,1,3
        2,1,3
        1,2,1,3
        2,3
        1,2,3
     */
    expect(patterns.length).to.equals(13)
    expect(patterns[0].id).to.equals('1') 
    expect(patterns[1].id).to.equals('1,1') 
    expect(patterns[2].id).to.equals('2,1') 
    expect(patterns[3].id).to.equals('1,2,1') 
    expect(patterns[4].id).to.equals('2') 
    expect(patterns[5].id).to.equals('1,2')
    expect(patterns[6].id).to.equals('3')
    expect(patterns[7].id).to.equals('1,3')
    expect(patterns[8].id).to.equals('1,1,3')
    expect(patterns[9].id).to.equals('2,1,3')
    expect(patterns[10].id).to.equals('1,2,1,3')
    expect(patterns[11].id).to.equals('2,3')
    expect(patterns[12].id).to.equals('1,2,3') 
})


function getTestSequences() {
    /*
        12413
        5152313
        2126153
        1621363
    */
    return new Array(new Sequence(new Array(1,2,4,1,3))
                        ,new Sequence(new Array(5,1,5,2,3,1,3))
                        ,new Sequence(new Array(2,1,2,6,1,5,3))
                        ,new Sequence(new Array(1,6,2,1,3,6,3)))
}
