'use strict'

let Logger = require('./logger.js')
let log = new Logger('TimeoutBasedSession')
let _ = require('underscore')

class TimeoutBasedSession {

    constructor(rawlogs, timeField, fixedTimeout) {
        
        if (timeField != null) {
            this.timeField = timeField
        } else {
            this.timeField = 'ts'
        }
        this.fixedTimeout = fixedTimeout
        let _this = this
        if (rawlogs != null && rawlogs.length > 0) {
            this.rawlogs = rawlogs.sort(function(a,b){
                return a[_this.timeField] - b[_this.timeField]
            })
        }
    }

    groupToSessions() {
        if (this.rawlogs == null || this.rawlogs.length == 0) {
            return new Array()
        }
        let session = this
        log.info("calculating session timeout value...")
        let timeout = this.calculateTimeout()
        log.info("session timeout is " + timeout + " seconds")

        //group to sessions based on interval
        let sessions = new Array()
        var lastTime = null
        var currentSession = new Array()
        _.forEach(this.rawlogs, function(rawlog){
            let time = rawlog[session.timeField]
            if (lastTime == null || (time - lastTime) < timeout) {
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

    calculateTimeout() {
        var session = this
        if (this.fixedTimeout != null) {
            return this.fixedTimeout
        } else {
            //mapping each time diff to 60 seconds bucket and calculate the frequence for each bucket
            let buckets = new Object()
            let bucketUnit = 60 //1 minute
            var lastTime = null
            _.forEach(this.rawlogs, function(rawlog){
                let time = rawlog[session.timeField]
                if (lastTime != null) {
                    let diff = time - lastTime
                    let diffKey = Math.floor(diff / bucketUnit)
                    if (buckets[diffKey] != null) {
                        buckets[diffKey].count = buckets[diffKey].count + 1
                    } else {
                        buckets[diffKey] = {
                            count : 1,
                            time : (diffKey + 1) * 60
                        }
                    }
                } 
                lastTime = time
            })
            if (log.isDebugEnabled()) {
                log.debug("time interval distribution:")
                log.debug(buckets)
            }
            
            return Object.keys(buckets).map(k => buckets[k]).sort(function(a, b){
                return b.count - a.count
            })[0].time
        }
    }
}

module.exports = TimeoutBasedSession