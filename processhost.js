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
            let analysis = new Analysis({
                type : Analysis.TYPE_FREQUENT_EVENTS,
                rawlog : {
                    sessionInterval : 60,
                    event : ['host','ip']
                },
                params : {
                    supportThreshold : 0.2
                }  
            })
            analysis.getPatterns(rawlogs)

            let analysis2 = new Analysis({
                type : Analysis.TYPE_FREQUENT_SEQUENCES,
                rawlog : {
                    sessionInterval : 60,
                    event : ['host','ip']
                },
                params : {
                    supportThreshold : 0.2
                }  
            })
            analysis2.getPatterns(rawlogs)
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