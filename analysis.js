'use strict'

let WAPTree = require('./waptree.js')
let EventSet = require('./eventset.js')
let Sequence = require('./sequence.js')
let _ = require('underscore')

class Analysis {

    static get TYPE_FREQUENT_SEQUENCES(){
        return "frequent sequences"
    }
    static get TYPE_FREQUENT_EVENTS(){
        return "frequent events"
    }

    /**
     * 
     *  
     * {
     *    "type" : "",//analysis type, can be 1:frequent sequence 2: frequent event, default is frequent sequence
     *    "rawlog" : {
     *       "time" : "", //field in the raw logs to store the time value, default is 'ts'
     *       "sessionInterval" : //the time in seconds to split different session, default is 10 mins = 600
     *       "event" : "", //field in the raw logs to store the event name, default is 'event'
     *    },
     *    "params":{
     *       "supportThreshold" : "" //support threshold when 'type' is 'frequent sequence', for example:0.75
     *    }
     * }
     */
    constructor(options) {
        if (options == null) {
            this.options = {
                type : Analysis.TYPE_FREQUENT_SEQUENCES,
                rawlog : {
                    time : "ts",
                    sessionInterval : 600,
                    event : "event"
                },
                params : {
                    supportThreshold : 0.8
                }
            }
        } else {
            this.options = options
        }
        this.checkOptions()
    }

    checkOptions() {
        //set default value for missing fields
        if (this.options.type == null) {
            this.options.type = Analysis.TYPE_FREQUENT_SEQUENCES
        }
        if (this.options.rawlog == null) {
            this.options.rawlog = {}
        }
        if (this.options.rawlog.time == null) {
            this.options.rawlog.time = 'ts'
        }
        if (this.options.rawlog.event == null) {
            this.options.rawlog.event = 'event'
        }
        if (this.options.rawlog.sessionInterval == null) {
            this.options.rawlog.sessionInterval = 600
        }

        if (this.options.params == null) {
            this.options.params = {}
        }
        if (this.options.params.supportThreshold == null) {
            this.options.params.supportThreshold = 0.8
        }
    }

    getResult(rawlogs) {
        let analysis = this
        console.log("grouping to sessions...")
        let sessions = this.getSessions(rawlogs)
        let eventSet = new EventSet()
        let sequences = new Array()

        console.log("converting to sequences...")
        _.forEach(sessions, function(session){
            //session => sequence
            let events = new Array()
            _.forEach(session, function(rawlog){
                let event = rawlog[analysis.options.rawlog.event]
                let eventId = eventSet.createEvent(event)
                events.push(eventId)
            })
            sequences.push(new Sequence(events))
        })
        console.log("converted to " + sequences.length + " sequences")
        let result = {}
        result.patterns = new Array()
        
        console.log("calculating support count threshold...")
        let supportCountThreshold = WAPTree.getSupportCountThreshold(sequences, this.options.params.supportThreshold)
        console.log("support count threshold:" + supportCountThreshold)
        console.log("WAP-tree mining...")
        var singleEvent = false

        if (this.options.type == Analysis.TYPE_FREQUENT_EVENTS) {
            singleEvent = true
        }
        let frequentSequences = new WAPTree(sequences, supportCountThreshold, singleEvent).getResult()
        if (frequentSequences != null && frequentSequences.length > 0) {
            _.forEach(frequentSequences, function(seq){
                result.patterns.push(seq.events.map(e => eventSet.getName(e)))
            })
        }
        
        console.log("found " + result.patterns.length + " patterns")
        console.log("patterns:" + JSON.stringify(result))
        return result
    }

    analysis(profile, sample) {
        let analysis = this
        let result = {}
        if (profile != null && sample != null && sample.patterns != null && sample.patterns.length > 0) {
            result.anomaly = {}

            if (profile.patterns == null || profile.patterns.length == 0) {
                result.anomaly.patterns = sample.patterns
            } else {
                result.anomaly.patterns = new Array()
            }
            _.forEach(sample.patterns, function(samplePattern){
                var match = false
                _.forEach(profile.patterns, function(profilePattern){
                    if (analysis.compareArray(samplePattern, profilePattern)) {
                        match = true
                    }
                })
                if (!match) {
                    result.anomaly.patterns.push(samplePattern)
                }
            })
        }
        return result
    }

    compareArray(arr1, arr2) {
        if (arr1 != null && arr2 != null && arr1.length == arr2.length) {
            for (var i = 0; i < arr1.length; i = i + 1) {
                if (arr1[i] != arr2[i]) {
                    return false
                }
            }
            return true
        }
        return false
    }

    getSessions(rawlogs) {
        let timeField = this.options.rawlog.time
        let sessionInterval = this.options.rawlog.sessionInterval
        //order by time
        let sortedLogs = rawlogs.sort(function(a,b){
            return a[timeField] - b[timeField]
        })
        //group to sessions based on interval
        let sessions = new Array()
        var lastTime = null
        var currentSession = new Array()
        _.forEach(sortedLogs, function(rawlog){
            let time = rawlog[timeField]
            if (lastTime == null) {
                lastTime = time
            }
            if ((time - lastTime) < sessionInterval) {
                currentSession.push(rawlog)
            } else {
                //break to a new session
                sessions.push(currentSession)
                currentSession = new Array()
                currentSession.push(rawlog)
            }
            lastTime = time
        })
        sessions.push(currentSession)
        return sessions
    }
}

module.exports = Analysis