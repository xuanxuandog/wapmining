'use strict'

let Analysis = require('./analysis.js')
let _ = require('underscore')

class ProcessHost {
    constructor(ip) {
        this.ip = ip
    }

    process() {
        let pro = this
        this.collectData(function(rawlogs){
            console.log("got " + rawlogs.length + " raw data")
            console.log("preprocessing...")
            pro.preprocess(rawlogs)
            let analysis = new Analysis({
                type : Analysis.TYPE_FREQUENT_EVENTS,
                rawlog : {
                    sessionInterval : 60
                },
                params : {
                    supportThreshold : 0.2
                }  
            })
            analysis.getResult(rawlogs)

            let analysis2 = new Analysis({
                type : Analysis.TYPE_FREQUENT_SEQUENCES,
                rawlog : {
                    sessionInterval : 60
                },
                params : {
                    supportThreshold : 0.2
                }  
            })
            analysis2.getResult(rawlogs)
        })
    }

    preprocess(rawlogs) {
        _.forEach(rawlogs, function(rawlog) {
            if (rawlog.host != null) {
                rawlog.event = rawlog.host
            } else {
                rawlog.event = rawlog.ip
            }
        })
    }

    collectData(callback) {
        console.log("collecting raw data...")
        var request = require('request');
        request.get("http://frp.7yu.io:9834/v1/host/" + this.ip + "/recentFlow", function(err, res, body) {
            if (!err && res.statusCode === 200) {
                callback(JSON.parse(body))
            } else {
                console.log(err)
            }
        });
    }
}


let ph = new ProcessHost("192.168.1.127")
ph.process()