const express = require('express');
const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const r = require('rethinkdb');
require('./../../env');




//-------------------------- report module Begins (Still woorking on it)--------------------------------
//adding basic report details
router.post("/campus/:campusId/report/basic", function (req, res, next) {
    class ReportDetails {
        constructor(id, obj) {
            this.id = id
            this.language = obj.language; 
            this.date = obj.date;
            this.filedby = obj.filedby;
            this.prayer = new Object();
            this.prayer.begining = obj.prayer.begining;
            this.prayer.ending = obj.prayer.ending;
        }
    }
    r.uuid().run(req._dbconn, (err, id) => {
        if (err) {
            console.log("error : " + err);
            res.status(500).json(err);
        }
        else {
            var report_details = new ReportDetails(id, req.body);
            r.db('grace_fellowship').table("campus").get(req.params.campusId).update(
                { reports: r.row("reports").default([]).append(report_details) }
            ).run(req._dbconn, (err, success) => {
                if (err) {
                    console.log("error : " + err);
                    res.status(500).json(err);
                }
                else {
                    res.status(200).json(success.replaced);
                }
            });
        }
    });
});


// updating report with sermon // not yet done
router.patch("/campus/:campusId/report/:reportId/sermon", (req, res, next) => {

    class Sermon {
        constructor(obj) {
            this.preacher = obj.preacher;
            this.title = obj.title;
            this.start_time = obj.start_time;
            this.end_time = obj.end_time;
        }
    }
    var sermon = new Sermon(req.body);

    r.db('grace_fellowship').table('campus').get(req.params.campusId)
        .update(function (row) {
            return {
                reports: row('reports').filter(function (reports) {
                    return reports('id').ne(req.params.memberId)
                })
                    .append(sermon)
            };
        }).run(req._dbconn, (err, success) => {
            if (err) {
                res.status(500).json(err);
            }
            else {
                res.status(200).json(success.replaced);
            }
        });
});



//-------------------------- report module Ends --------------------------------





module.exports = router;