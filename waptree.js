'use strict'

let Sequence = require('./sequence.js')
let _ = require('underscore')

class WAPTree {
    constructor(sequences, supportThreshold) {
        this.sequences = sequences
        this.supportThreshold = supportThreshold
    }

    getResult() {
        var supportCountThreshold = 0
        _.forEach(sequences, function(sequence){
            supportCountThreshold += sequence.count
        })
        supportCountThreshold = supportCountThreshold * supportThreshold

        let frequentEvents = this.getFrequentEvents(sequences, supportCount)

        console.log(frequentEvents)

        let newSequence = this.filterNoneFrequentEvents(sequences, frequentEvents)
        
        //head table:
        //(eventId -> Array[WAPTreeNode]), if eventId is 0, the value contains the root node
        let headTable = this.buildTree(newSequence)

        //patterns:
        //all frequent sequences
        let patterns = this.getFrequentSequences(headTable)

        //output the frequent patterns
        return patterns
    }

    getFrequentEvents(sequences, supportCountThreshold) {
        /*
            get frequent event:
            frequent event means (the appearance of this event)/(total size of sequences) >= supportThreshold
            note: each sequence can at most contribute one for each event, which means although the event may 
            apprear more than once in some sequence, the count of that sequence is still 1
        */
        let eventCount = new Object() //eventId->support count
        let allEvents = new Object() //eventId->event
        _.forEach(sequences, function(sequence) {
            let events = sequence.events
            let eventsSupportedByThisSequence = new Object()
            _.forEach(events, function(event){
                if (eventsSupportedByThisSequence[event.id] == null) {
                    eventsSupportedByThisSequence[event.id] = 1
                } 
                if (allEvents[event.id] == null) {
                    allEvents[event.id] = event
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
        Object.keys(eventCount).forEach(function(eventId){
            if (eventCount[eventId] < supportCountThreshold) {
                delete allEvents[eventId]
            }
        })
        
        return Object.keys(allEvents).map(k => allEvents[k])
    }

    /*
        return new sequences that doesn't contain none frequent events
    */
    filterNoneFrequentEvents(sequences, frequentEvents) {
        return undefined
    }

    /*
        build trees and head table
    */
    buildTree(sequences) {
        return undefined     
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

    getResult(){

    }
}


module.exports = WAPTree