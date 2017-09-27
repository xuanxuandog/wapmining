'use strict'

let Analysis = require('./analysis.js')
let _ = require('underscore')
let Logger = require('./logger.js')
let log = new Logger('ProcessHost')

class ProcessHost {
    constructor(ip) {
        this.ip = ip
    }

    process() {
        let pro = this
        this.collectData2(function(rawlogs){
            let analysis = new Analysis({
                type : Analysis.TYPE_FREQUENT_EVENTS,
                rawlog : {
                    sessionInterval : 10,
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
                    sessionInterval : 10,
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
        log.info("collecting raw data...")
        var request = require('request');
        request.get("http://frp.7yu.io:9834/v1/host/" + this.ip + "/recentFlow", function(err, res, body) {
            if (!err && res.statusCode === 200) {
                var fs = require('fs');
                var stream = fs.createWriteStream("test.json");
                stream.once('open', function(fd) {
                  stream.write(body)
                  stream.end();
                });
                callback(JSON.parse(body))
            } else {
                console.log(err)
            }
        });
    }

    collectData2(callback) {
        let fs = require('fs')
        fs.readFile('./test.json', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          callback(JSON.parse(data))
        });
    }
}



let ph = new ProcessHost("192.168.1.148")
ph.process()