'use strict'

let Analysis = require('./analysis.js')
let _ = require('underscore')
let Logger = require('./logger.js')
let log = new Logger('ProcessHost')
let Q = require('q')

class ProcessHost {

    static process() {
        let promises = new Array()

        var profileDeferred = Q.defer()
        ProcessHost.getProfiles(function(profiles){
            profileDeferred.resolve(profiles)
        })
        promises.push(profileDeferred.promise)
        //192.168.1.229  xiaomi
        //192.168.1.224 iphone6splus
        //192.168.1.148 iphone6s
        //192.168.1.187 xiaomi air cleaner
        //192.168.1.159 kindle
        
        let test = ["192.168.1.224", "192.168.1.148", "192.168.1.229", "192.168.1.159"]
        
        _.forEach(test, function(ip){
            var deferred = Q.defer();
            ProcessHost.collectData(ip, function(rawlogs){
                let analysis = new Analysis({
                    type : Analysis.TYPE_FREQUENT_SEQUENCES,
                    rawlog : {
                        sessionInterval : 60,
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
            let profiles = results[0].value
            for (var i = 1; i < results.length; i++) {
                let sample = results[i].value
                _.forEach(profiles, function(profile){
                    Analysis.matchPattern(profile, sample)
                })
            }
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

    static collectData2(fileName, callback) {
        let fs = require('fs')
        fs.readFile(fileName, 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          callback(JSON.parse(data))
        });
    }

    static collectData3(fileName, callback) {
        let fs = require('fs')
        fs.readFile(fileName, 'utf8', function(err, data){
            if (err) {
                return log.error(err)
            } 
            let lines = data.split("\n")
            let arr = new Array()
            _.forEach(lines, function(line){
                if (line != null && line.startsWith('{')) {
                    arr.push(JSON.parse(line))
                }
                
            })
            //log.info(arr)
            callback(arr)
        })
    }

    static getProfiles(callback) {
        let fs = require('fs')
        fs.readFile('./profiles.json', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          callback(JSON.parse(data))
        });
    }

    static calculateProfile(ip) {
        ProcessHost.collectData3("./" + ip + ".json", function(rawlogs){
            let newlogs = rawlogs.map(l => {
                let l1 = new Object()
                l1.ts = l.ts
                if (l.af != null) {
                    let ks = Object.keys(l.af)
                    if (ks.length > 0 && ks[0] != 'undefined') {
                        l1.event = ks[0]
                    } else {
                        l1.event = l.dh
                    }
                } else {
                    l1.event = l.dh
                }
                return l1
            })
            let analysis = new Analysis({
                    type : Analysis.TYPE_FREQUENT_SEQUENCES,
                    rawlog : {
                        sessionInterval : 60
                    },
                    params : {
                        supportThreshold : 0.1
                    }  
            })
            analysis.getPatterns(newlogs, ip)
        })
    }
}

//ProcessHost.process()
ProcessHost.calculateProfile('192.168.1.159')
//ProcessHost.calculateProfile('192.168.1.224')
//ProcessHost.calculateProfile('192.168.1.229')