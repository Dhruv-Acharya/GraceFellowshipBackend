const express = require('express');
const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');  
const r = require('rethinkdb');
require('./../../env');

//attendece module



//-------------------------- report module Begins (Still woorking on it)--------------------------------
//adding basic report details


router.post("/:campusId/report/basic", function (req, res, next) {
    class ReportDetails {
        constructor(id, obj) {
            this.id = id
            this.language = obj.language; 
            this.date = obj.date;
            this.filedby = obj.filedby;
            this.prayer = new Object();
            this.prayer = obj.prayer;
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
                    res.status(200).json(id);
                }
            });
        }
    });
});


// updating report with sermon 
router.patch("/:campusId/report/:reportId/sermon", (req, res, next) => {

    class Sermon {
        constructor(obj) {
            this.preacher = obj.preacher;
            this.title = obj.title;
            this.start = obj.start;
            this.end = obj.end;
        }
    }
    var sermon = new Sermon(req.body);

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
            r.row("id").match(req.params.reportId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];
                
                try{
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({"sermon":sermon}))
                    }).run(req._dbconn, function (err, success) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(success.replaced);
                        }
                    });
                }
                catch(err){
                    res.status(500).json("Problem with nth Number"+err);
                }
            }
        });
    });

//updating report with activities and ending

    router.patch("/:campusId/report/:reportId/activities_ending", (req, res, next) => {

        class Activities {
            constructor(obj) {
                this.lords_table = obj.activities.lords_table;
                this.announcement = obj.activities.announcement;
            }
        }
        class Ending {
            constructor(obj) {
                this.time = obj.time;
                this.prayer = obj.prayer;
            }
        }
        var activities = new Activities(req.body.activities);
        var ending = new Ending(req.body.ending);

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
            r.row("id").match(req.params.reportId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];

                try {
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({
                            "activities": activities,
                            "ending": ending
                        }))
                    }).run(req._dbconn, function (err, success) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(success.replaced);
                        }
                    });
                } catch (err) {
                    res.status(500).json("Problem with nth Number" + err);
                }
            }
        });
    });

    router.patch("/:campusId/report/:reportId/worship", (req, res, next) => {

        // class Worship {
        //     constructor(obj) {
        //         this.leader = obj.leader;
        //         this.choir_members = obj.choir_members;
        //         this.incharge = obj.incharge;
        //     }
        // }
        // var worship = new Worship(req.body);

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
            r.row("id").match(req.params.reportId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];

                try {
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({
                            "worship": req.body
                        }))
                    }).run(req._dbconn, function (err, success) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(success.replaced);
                        }
                    });
                } catch (err) {
                    res.status(500).json("Problem with nth Number" + err);
                }
            }
        });
    });

    router.patch("/:campusId/report/:reportId/attendance_attendees", (req, res, next) => {

        class Attendance {
            constructor(obj) {
                this.male = obj.male;
                this.female = obj.female;
                this.total = obj.total;
                this.new = obj.new;
            }
        }
        class Attendees {
            constructor(obj) {
                this.new = obj.new;
                this.members = obj.members;
            }
        }
        var attendance = new Attendance(req.body.attendance);
        var attendees = new Attendees(req.body.attendees);

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
            r.row("id").match(req.params.reportId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];

                try {
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({
                            "attendance": attendance,
                            "attendees": attendees
                        }))
                    }).run(req._dbconn, function (err, success) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(success.replaced);
                        }
                    });
                } catch (err) {
                    res.status(500).json("Problem with nth Number" + err);
                }
            }
        });
    });
    
//-------------------------- report module Ends --------------------------------





module.exports = router;