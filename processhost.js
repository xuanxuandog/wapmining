'use strict'

let Analysis = require('./analysis.js')
let _ = require('underscore')
let Logger = require('./logger.js')
let log = new Logger('ProcessHost')
let Q = require('q')


let test = {
    "192.168.1.224" : "iphone6s plus",
    "192.168.1.148" : "iphone6s",
    "192.168.1.229" : "xiaomi phone",
    "192.168.1.159" : "kindle",
    "192.168.1.187" : "xiaomi air cleaner",
    "192.168.1.127" : "huawei phone",
    "192.168.1.61" : "xiaomi phone 2",
    "192.168.1.28" : "ipad"
}

class ProcessHost {

    static process() {
        let promises = new Array()

        var profileDeferred = Q.defer()
        ProcessHost.getProfiles(function(profiles){
            profileDeferred.resolve(profiles)
        })
        promises.push(profileDeferred.promise)

        _.forEach(Object.keys(test), function(ip){
            var deferred = Q.defer();
            ProcessHost.collectData(ip, function(rawlogs){
                let analysis = new Analysis({
                    type : Analysis.TYPE_FREQUENT_SEQUENCES,
                    rawlog : {
                        event : ['host','ip']
                    },
                    params : {
                        supportThreshold : 0.15
                    }  
                })
                deferred.resolve(analysis.getPatterns(rawlogs, ip + " " + test[ip]))
            })
            promises.push(deferred.promise)
        })


        Q.allSettled(promises).then(function(results) {
            let profiles = results[0].value
            for (var i = 1; i < results.length; i++) {
                let sample = results[i].value
                var matchPercentage = 0
                var targetProfile = null
                _.forEach(profiles, function(profile) {
                    let p = Analysis.matchPattern(profile, sample)
                    if (p.matched.percentage > matchPercentage) {
                        matchPercentage = p.matched.percentage
                        targetProfile = profile
                    }
                })
                if (matchPercentage == 0) {
                    log.info("can't find matched profile for sample " + sample.label)
                    if (sample.patterns != null && sample.patterns.length > 0) {
                        log.info("sample " + sample.label + " has patterns not profiled:")
                        //log.info(sample.patterns)
                    }
                } else {
                    log.info("sample[" + sample.label + "] matched profile[" + targetProfile.label + "](" + (matchPercentage * 100).toFixed(2) + "%)")
                }
                
            }
        })
    }

    static collectData(ip, callback) {
        log.info("collecting raw data for " + ip + " " + test[ip] + "...")
        var request = require('request');
        request.get("http://frp.7yu.io:9834/v1/host/" + ip + "/recentFlow", function(err, res, body) {
            if (!err && res.statusCode === 200) {
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

    static calculateProfile(ips) {

        let promises = new Array()
        

        _.forEach(ips, function(ip){
            var deferred = Q.defer()
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
                        params : {
                            supportThreshold : 0.1
                        }  
                })
                deferred.resolve(analysis.getPatterns(newlogs, ip + " " + test[ip]))
            })
            promises.push(deferred.promise)
        })

        Q.allSettled(promises).then(function(results) {
            let arr = new Array()
            for (var i = 0; i < results.length; i++) {
                arr.push(results[i].value)
            }
            var fs = require('fs');
            var stream = fs.createWriteStream("./profiles.json");
            stream.once('open', function(fd) {
              stream.write(JSON.stringify(arr))
              stream.end();
            });
            
        })
    }
}

//ProcessHost.calculateProfile(new Array('192.168.1.159','192.168.1.224','192.168.1.229','192.168.1.127','192.168.1.61','192.168.1.28'))
ProcessHost.process()

