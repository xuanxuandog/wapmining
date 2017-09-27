'use strict'

let WAPTree = require('./waptree.js')
let EventSet = require('./eventset.js')
let Sequence = require('./sequence.js')
let _ = require('underscore')
let Logger = require('./logger.js')
let log = new Logger('Analysis')
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
     *    "type" : "",//analysis type, can be 1:frequent sequence 2: frequent events, default is frequent sequences
     *    "rawlog" : {
     *       "time" : "", //field in the raw logs to store the time value, default is 'ts'
     *       "sessionInterval" : //the time in seconds to split different session, default is 10 mins = 600
     *       "event" : "", can be three kinds of values:
     *                     1. string, which represent the field name to store the event value in rawlog
     *                     2. array of string, which means try to get the event value from rawlog in the order of the array
     *                     3. a function, which is cutomized to get event value from rawlog 
     *    },
     *    "params":{
     *       "supportThreshold" : "" //support threshold when 'type' is 'frequent sequences' or 'frequent events', for example:0.75(default value)
     *                               //which means among every 100 web access sessions, certain sequence appears at least 100 * 0.75 = 75 times,
     *                               //be noted that one sequence can be supported at most once by each session, for example, if sequence 'e1,e2' appears
     *                               //twice in certain session, it can only be counted as one for that session
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
        if (this.options.rawlog.sessionInterval == null) {
            this.options.rawlog.sessionInterval = 60
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

    getPatterns(rawlogs) {
        let analysis = this
        log.info("got " + rawlogs.length + " raw data")
        log.info("grouping to sessions...")
        let sessions = this.getSessions(rawlogs)
        log.info("got " + sessions.length + " sessions...")
        let eventSet = new EventSet()
        let sequences = new Array()

        log.info("converting to sequences...")
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
        log.info("got " + sequences.length + " sequences")
        let result = {}
        result.patterns = new Array()

        log.info("calculating support count threshold...")
        let supportCountThreshold = WAPTree.getSupportCountThreshold(sequences, this.options.params.supportThreshold)
        log.info("support count threshold:" + supportCountThreshold)
        log.info("WAP-tree mining...")
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
        
        log.info("found " + result.patterns.length + " patterns")
        log.info(result)
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