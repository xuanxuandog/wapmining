'use strict'

let Sequence = require('./sequence.js')
let _ = require('underscore')
let WAPTreeNode = require('./waptreenode.js')
let Logger = require('./logger.js')
let log = new Logger('WAPTree')

class WAPTree {  

    /**
     * refer to http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.436.2433&rep=rep1&type=pdf for algorithm details 
     * @param {*} sequences the initial sequences, each sequence is a web access session, 
     *                      this WAP-Tree is to find all frequent sequences among these sessions(including sub sequences of each initial sequence)
     * @param {*} supportCountThreshold  for example, if threshold is 0.75 which means
     *                                   among every 100 web access sessions, certain sequence appears at least 100 * 0.75 = 75 times,
     *                                   be noted that one sequence can be supported at most once by each session, for example, if sequence 'e1,e2' appears
     *                                   twice in certain session, it can only be counted as one for that session
     * @param {*} singleEvent  if singleEvent set to true, this will be a special WAP-Tree which only count frequent single events instead of frequent sequences
     */
    constructor(sequences, supportCountThreshold, singleEvent) {
        this.sequences = sequences
        this.supportCountThreshold = supportCountThreshold
        if (singleEvent != null) {
            this.singleEvent = singleEvent
        } else {
            this.singleEvent = false //default
        }
        
        if (log.isDebugEnabled()) {
            log.debug("initial seqs:")
            log.debug(this.sequences)
        }
    }

    getResult() {
        
        let frequentEvents = this.getFrequentEvents(this.sequences, this.supportCountThreshold)

        if (log.isDebugEnabled()) {
            log.debug("frequent events:")
            log.debug(frequentEvents)
        }

        if (this.singleEvent) {
            return Object.keys(frequentEvents).map(e => new Sequence(new Array(e.toString())))
        }

        let newSequence = this.filterNoneFrequentEvents(this.sequences, frequentEvents)
        
        if(log.isDebugEnabled()) {
            log.debug("seqs to process:")
            log.debug(newSequence)
        }

        //head table:
        //(eventId -> Array[WAPTreeNode]), if eventId is 0, the value contains the root node
        let headTable = this.buildTree(newSequence)
        if (log.isDebugEnabled()) {
            log.debug("head table:")
            log.debug(headTable)
        }

        //patterns:all frequent sequences
        let patterns = this.getFrequentSequences(headTable[0],headTable)
        //output the frequent patterns
        return patterns
    }

    static getSupportCountThreshold(sequences, supportThreshold) {
        var seqCount = 0
        _.forEach(sequences, function(sequence){
            seqCount += sequence.count
        })
        
        return Math.round(seqCount * supportThreshold)
    }

    getFrequentEvents(sequences, supportCountThreshold) {
        /*
            get frequent event:
            frequent event means (the appearance of this event)/(total size of sequences) >= supportThreshold
            note: each sequence can at most contribute one for each event, which means although the event may 
            apprear more than once in some sequence, the count of that sequence is still 1
        */
        let eventCount = new Object() //eventId->support count
        let frequentEvents = new Object() //eventId->event
        _.forEach(sequences, function(sequence) {
            let events = sequence.events
            let eventsSupportedByThisSequence = new Object()
            _.forEach(events, function(event){
                if (eventsSupportedByThisSequence[event] == null) {
                    eventsSupportedByThisSequence[event] = 1
                } 
                if (frequentEvents[event] == null) {
                    frequentEvents[event] = event
                }
            })
            Object.keys(eventsSupportedByThisSequence).forEach(function(event){
                if (eventCount[event] == null) {
                    eventCount[event] = sequence.count
                } else {
                    eventCount[event] = eventCount[event] + sequence.count
                }
            })
        })
        //remove event whose appear times < supportCountThreshold
        Object.keys(eventCount).forEach(function(event){
            if (eventCount[event] < supportCountThreshold) {
                delete frequentEvents[event]
            }
        })
        
        return frequentEvents
    }

    /*
        for all sequences, remove the events that not belong to frequent events from the sequence
    */
    filterNoneFrequentEvents(sequences, frequentEvents) {
        let newSequences = new Array()
        _.forEach(sequences, function(sequence){
            let es = new Array()
            _.forEach(sequence.events, function(event){
                if (frequentEvents[event] != null) {
                    es.push(event)
                }
            })
            if (es.length > 0) {
                newSequences.push(new Sequence(es, sequence.count))
            }
        })
        return newSequences
    }

    /*
        build trees and return the head table
    */
    buildTree(sequences) {
        let headTable = new Object()
        let root = WAPTreeNode.rootNode()
        headTable[0] = root

        _.forEach(sequences, function(sequence){
            //insert the sequence from root
            var currentNode = root
            _.forEach(sequence.events, function(event){
                if (currentNode.hasChild(event)) {
                    currentNode = currentNode.getChild(event)
                    currentNode.addCount(sequence.count)
                } else {
                    currentNode = new WAPTreeNode(currentNode, event, sequence.count)
                    //update head table
                    if (headTable[event] == null) {
                        headTable[event] = new Array(currentNode)
                    } else {
                        headTable[event].push(currentNode)
                    }
                }
            })
        })
        return headTable     
    }

    /*
        return all frequent access patterns
    */
    getFrequentSequences(rootNode, headTable) {
        let result = new Array()
        //1 if tree has only one branch, return all sub-sequences of the sequence in this branch
        //2 else if tree has multiple branchs, for every event in headTable except root:
        //  2.1 add a sequence of the single event to the result
        //  2.2 get conditional prefix sequences of that event
        //  2.3 build WAPTree for that sequences and recursively get result(all prefix sequences of that event), then append that event and add them to the result

        if (rootNode.hasOnlyOneBranch()) {
            //1 if tree has only one branch, return all sub-sequences of the sequence in this branch
            let events = rootNode.getOneBranchSuffixEvents()
            if (events != null && events.length > 0) {
                return new Sequence(events).getSubSequences()
            } else {
                return result
            }
        } else {
            //2 else if tree has multiple branchs, for every event in headTable except root:
            let events = Object.keys(headTable).filter(event => event != 0) //filter root
            for (var i = 0; i < events.length; i = i + 1) {
                let event = events[i]
                //2.1 add a sequence of this single event to the result 
                result.push(new Sequence(new Array(headTable[event][0].event.toString())))
                //2.2 get conditional prefix sequences of that event
                let conPrefixSequences = this.getConditionalPrefixSequences(headTable[event])
                //console.log("ps of " + event + ":" + conPrefixSequences.map(c => c.id + "(" + c.count + ")").toString())
 
                //2.3 build WAPTree for that sequences and recursively get result(all prefix sequences of that event), then append that event and add them to the result
                if (conPrefixSequences != null && conPrefixSequences.length > 0) {
                    let patterns = new WAPTree(conPrefixSequences, this.supportCountThreshold).getResult()//recursively
                    if (patterns != null) {
                        _.forEach(patterns, function(pattern){
                            //append current event to that prefix sequence and then add to result
                            let arr = pattern.events
                            arr.push(headTable[event][0].event)
                            result.push(new Sequence(arr))
                        })
                    }
                }
            }
        }
        return result  
    }

    /*
     * get all the conditional prefix sequences of given event
     * based on the head table  
     */
    getConditionalPrefixSequences(eventNodes) {
        let seqsMap = new Object()// seqId -> Sequence
        _.forEach(eventNodes, function(eventNode){
            let prefixEvents = eventNode.getPrefixEvents()
            if (prefixEvents.length > 0) {
                let seq = new Sequence(prefixEvents, eventNode.count)
                if (seqsMap[seq.id] != null) {
                    seqsMap[seq.id].count = seqsMap[seq.id].count + eventNode.count
                } else {
                    seqsMap[seq.id] = seq
                }
                //check whether need add duplicate prefix sequence with minus count
                for(var i = 0; i < prefixEvents.length; i = i + 1) {
                    if (prefixEvents[i] == eventNode.event) {
                        //create a new sequence from the begining of prefixEvents to the former event of 
                        //this prefixEvent, and set the sequence count be minus of eventNode.count
                        let minusSeq = new Sequence(prefixEvents.slice(0, i), eventNode.count * -1)
                        if (seqsMap[minusSeq.id] != null) {
                            seqsMap[minusSeq.id].count = seqsMap[minusSeq.id].count - eventNode.count
                        } else {
                            seqsMap[minusSeq.id] = minusSeq
                        }
                    }
                }
            }
        })
        return Object.keys(seqsMap).map(seqId => seqsMap[seqId]).filter(seq => seq.count >0)
    }
}


module.exports = WAPTree