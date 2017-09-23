'use strict'

let Sequence = require('./sequence.js')
let _ = require('underscore')
let WAPTreeNode = require('./waptreenode.js')

class WAPTree {
    constructor(sequences, supportThreshold) {
        this.sequences = sequences
        this.supportThreshold = supportThreshold
    }

    getResult() {
        
        let supportCountThreshold = this.getSupportCountThreshold(this.sequences, this.supportThreshold)

        let frequentEvents = this.getFrequentEvents(this.sequences, supportCount)

        let newSequence = this.filterNoneFrequentEvents(this.sequences, frequentEvents)
        
        //head table:
        //(eventId -> Array[WAPTreeNode]), if eventId is 0, the value contains the root node
        let headTable = this.buildTree(newSequence)

        //patterns:
        //all frequent sequences
        let patterns = this.getFrequentSequences(headTable)

        //output the frequent patterns
        return patterns
    }

    getSupportCountThreshold(sequences, supportThreshold) {
        var supportCountThreshold = 0
        _.forEach(sequences, function(sequence){
            supportCountThreshold += sequence.count
        })
        supportCountThreshold = supportCountThreshold * supportThreshold
        return supportCountThreshold
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
                if (eventsSupportedByThisSequence[event.id] == null) {
                    eventsSupportedByThisSequence[event.id] = 1
                } 
                if (frequentEvents[event.id] == null) {
                    frequentEvents[event.id] = event
                }
            })
            Object.keys(eventsSupportedByThisSequence).forEach(function(eventId){
                if (eventCount[eventId] == null) {
                    eventCount[eventId] = sequence.count
                } else {
                    eventCount[eventId] = eventCount[eventId] + sequence.count
                }
            })
        })
        //remove event whose appear times < supportCountThreshold
        Object.keys(eventCount).forEach(function(eventId){
            if (eventCount[eventId] < supportCountThreshold) {
                delete frequentEvents[eventId]
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
                if (frequentEvents[event.id] != null) {
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
        headTable['0'] = root

        _.forEach(sequences, function(sequence){
            //insert the sequence from root
            var currentNode = root
            _.forEach(sequence.events, function(event){
                if (currentNode.hasChild(event.id)) {
                    currentNode = currentNode.getChild(event.id)
                    currentNode.addCount(sequence.count)
                } else {
                    currentNode = new WAPTreeNode(currentNode, event, sequence.count)
                    //update head table
                    if (headTable[event.id] == null) {
                        headTable[event.id] = new Array(currentNode)
                    } else {
                        headTable[event.id].push(currentNode)
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
        return undefined  
    }

    buildConditionalSequences(eventId, headTable) {
        return undefined 
    }
}


module.exports = WAPTree