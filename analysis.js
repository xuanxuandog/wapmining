'use strict'

let WAPTree = require('./waptree.js')
let EventSet = require('./eventset.js')
let Sequence = require('./sequence.js')
let _ = require('underscore')
let Logger = require('./logger.js')
let log = new Logger('Analysis')
let TimeoutBasedSession = require('./session.js')
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
     *    "type" : "",analysis type, can be 1:frequent sequence 2: frequent events, default is frequent sequences
     *    "rawlog" : {
     *       "time" : "", field in the raw logs to store the time value, default is 'ts'
     *       "event" : "", can be three kinds of values:
     *                     1. string, which represent the field name to store the event value in rawlog
     *                     2. array of string, which means try to get the event value from rawlog in the order of the array
     *                     3. a function, which is cutomized to get event value from rawlog 
     *    },
     *    "params":{
     *       "supportThreshold" : "", support threshold when 'type' is 'frequent sequences' or 'frequent events', for example:0.75(default value)
     *                               which means among every 100 web access sessions, certain sequence appears at least 100 * 0.75 = 75 times,
     *                               be noted that one sequence can be supported at most once by each session, for example, if sequence 'e1,e2' appears
     *                               twice in certain session, it can only be counted as one for that session
     *    }
     * }
     */
    constructor(options) {
        if (options == null) {
            this.options = {
                type : Analysis.TYPE_FREQUENT_SEQUENCES,
                rawlog : {
                    time : "ts",
                    sessionInterval : 60,
                    event : "event"
                },
                params : {
                    supportThreshold : 0.75
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

        if (this.options.params == null) {
            this.options.params = {}
        }
        if (this.options.params.supportThreshold == null) {
            this.options.params.supportThreshold = 0.75
        }
    }

    getEventValue(rawlog, handler) {
        if (Array.isArray(handler)) {
            for(var i = 0; i < handler.length; i++) {
                if (rawlog[handler[i]] != null) return rawlog[handler[i]]
            }
        } else if(typeof handler === "function") {
            return handler(rawlog)
        } else {
            return rawlog[handler]
        }
    }

    getPatterns(rawlogs, label) {
        let analysis = this
        log.info("got " + rawlogs.length + " raw data(" + label + ")")
        log.info("grouping to sessions(" + label + ")...")
        let sessions = new TimeoutBasedSession(rawlogs, this.options.rawlog.time).groupToSessions()
        log.info("got " + sessions.length + " sessions(" + label + ")...")
        let eventSet = new EventSet()
        let sequences = new Array()

        log.info("converting to sequences(" + label + ")...")
        _.forEach(sessions, function(session){
            //session => sequence
            let events = new Array()
            _.forEach(session, function(rawlog){
                let event = analysis.getEventValue(rawlog, analysis.options.rawlog.event)
                let eventId = eventSet.createEvent(event)
                events.push(eventId)
            })
            sequences.push(new Sequence(events))
        })
        log.info("got " + sequences.length + " sequences(" + label + ")")
        let result = {}
        result.patterns = new Array()

        log.info("calculating support count threshold(" + label + ")...")
        let supportCountThreshold = WAPTree.getSupportCountThreshold(sequences, this.options.params.supportThreshold)
        log.info("support count threshold(" + label + "):" + supportCountThreshold)
        log.info("WAP-tree mining(" + label + ")...")
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
        if (label != null) {
            result.label = label
        }
        log.info("found " + result.patterns.length + " patterns(" + label + ")")
        if (log.isDebugEnabled()) {
            log.debug(result)
        }
        return result
    }

    /**
     * given profile patterns and sample patterns, return the percentage that how many patterns in sample patterns can be found in profile patterns
     * @param {*} profile 
     * @param {*} sample 
     */
    static matchPattern(profile, sample) {
        let result = {
            matched : {
                percentage : 0,
                patterns : new Array()
            },
            unmatched : {
                percentage : 0,
                patterns : new Array()
            }
        }
        var matchedCount = 0
        var unmatchedCount = 0
        if (profile != null && sample != null && sample.patterns != null && sample.patterns.length > 0 && profile.patterns != null && profile.patterns.length > 0) {
            
            _.forEach(sample.patterns, function(samplePattern){
                var unmatched = true
                _.forEach(profile.patterns, function(profilePattern){
                    if (Analysis.compareArray(samplePattern, profilePattern)) {
                        matchedCount = matchedCount + 1
                        result.matched.patterns.push(samplePattern)
                        unmatched = false
                    }
                })
                if (unmatched) {
                    unmatchedCount = unmatchedCount + 1
                    result.unmatched.patterns.push(samplePattern)
                }
            })
            result.matched.percentage = matchedCount / sample.patterns.length
            result.unmatched.percentage = unmatchedCount / sample.patterns.length
        } 
        if (log.isDebugEnabled()) {
            log.debug("sample(" + sample.label + ") matched profile(" + profile.label + ") with result:")
            log.debug(JSON.stringify(result))
        }
        return result
    }

    static compareArray(arr1, arr2) {
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
}

module.exports = Analysis