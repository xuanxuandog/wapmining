'use strict'

let Analysis = require('./analysis.js')
let _ = require('underscore')
let Logger = require('./logger.js')
let log = new Logger('ProcessHost')
let Q = require('q')

class ProcessHost {

    static process() {
        let pro = this
        let promises = new Array()
        //192.168.1.229  xiaomi
        //192.168.1.224 iphone6splus
        //192.168.1.148 iphone6s
        let test = ["192.168.1.224", "192.168.1.148"] //two iphones
        //let test = ["192.168.1.224", "192.168.1.229"]  //iphone and xiaomi

        _.forEach(test, function(ip){
            var deferred = Q.defer();
            ProcessHost.collectData(ip, function(rawlogs){
                let analysis = new Analysis({
                    type : Analysis.TYPE_FREQUENT_SEQUENCES,
                    rawlog : {
                        sessionInterval : 10,
                        event : ['host','ip']
                    },
                    params : {
                        supportThreshold : 0.1
                    }  
                })
                deferred.resolve(analysis.getPatterns(rawlogs, ip))
            })
            promises.push(deferred.promise)
        })

        Q.allSettled(promises).then(function(results) {
            let profile = results[0].value
            let sample = results[1].value
            Analysis.matchPattern(profile, sample)
        })
        
    }

    static collectData(ip, callback) {
        log.info("collecting raw data for " + ip + " ...")
        var request = require('request');
        request.get("http://frp.7yu.io:9834/v1/host/" + ip + "/recentFlow", function(err, res, body) {
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

    static collectData2(ip, callback) {
        let fs = require('fs')
        fs.readFile('./kindle.json', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          callback(JSON.parse(data))
        });
    }
}

ProcessHost.process()