const express = require('express');
const router = express.Router();
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');  
const r = require('rethinkdb');
require('./../../env');

//attendece module



//-------------------------- report module Begins (Still woorking on it)--------------------------------
//adding basic report details

router.get('/',function(req,res){
    res.send("qweasd");
});

router.post("/:campusId/report/basic", function (req, res, next) {
    class ReportDetails {
        constructor(id, obj) {
            this.id = id
            this.language = obj.language; 
            this.date = obj.date;
            this.filedby = obj.filedby;
            this.begining = new Object();
            this.begining = obj.begining;
        }
    }
    r.uuid().run(req._dbconn, (err, id) => {
        if (err) {
            // console.log("error : " + err);
            res.status(500).json(err);
        }
        else {
            var report_details = new ReportDetails(id, req.body);
            r.db('grace_fellowship').table("campus").get(req.params.campusId).update(
                { reports: r.row("reports").default([]).append(report_details) }
            ).run(req._dbconn, (err, success) => {
                if (err) {
                    // console.log("error : " + err);
                    res.status(500).json(err);
                }
                else {
                    res.status(200).json(id);
                }
            });
        }
    });
});
//update report basic details
router.patch("/:campusId/report/:reportId/basic", (req, res, next) => {

    class ReportDetails {
        constructor(obj) {
            this.language = obj.language; 
            this.date = obj.date;
            this.filedby = obj.filedby;
            this.begining = new Object();
            this.begining = obj.begining;
        }
    }

    var report_details = new ReportDetails(req.body);

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
            r.row("id").match(req.params.reportId)
        ).run(req._dbconn, function (err, succ) {
            if (err) {
                res.status(500).json(err);
            } else {

                x = succ[0];
                
                try{
                    r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                        reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge(report_details))
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
                this.lords_table = obj.lords_table;
                this.announcement = obj.announcement;               
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
    
//--------------------------insert report module Ends --------------------------------

// ------------------------- getting stuff form reports starts-------------------------

    //fetch single report

    //response:
    // {
    //     "report": actual report,
    //     "batch_members": batch_members_array,
    //     "instuments": instruments_array
    // }

    router.get('/:campusId/report/:reportId',function (req,res,next){

        var response = new Object();
        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').filter({
            "id":req.params.reportId
        })
        .run(req._dbconn,function (err, report){
            if(err){
                res.status(500).json(err);
            }
            else{
                if(report)
                {   
                    response.report = report[0];
                    r.db('grace_fellowship').table('campus').get(req.params.campusId)('batch_members').filter({
                        active: true
                    })
                    .run(req._dbconn,function (err, batch_members){
                        if(err){
                            res.status(500).json(err);
                        }
                        else{
                            response.batch_members = batch_members;
                            r.db('grace_fellowship').table('instruments').filter({
                                campus_id: req.params.campusId
                            })
                            .run(req._dbconn,function (err, instruments){
                                if(err){
                                    res.status(500).json(err);
                                }else{
                                    instruments.toArray((err, result)=>{
                                        if(err)res.status(500),json(err);
                                        else{
                                            response.instruments = result;
                                            console.log(response);
                                            
                                            res.status(200).json(response);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else    
                    res.status(403).json("No report by that Id found");
            }
        });  
    })
    
    //getting a report list of a campus
    router.get('/:campusId/report/',function (req,res,next){

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').pluck('id', 'date', 'language', 'filedby',{'begining':['start']})
        .run(req._dbconn,function (err, report){
            if (err) {
                res.status(500).json(err);
            } else {
                
                if (report) {
                    
                    res.status(200).json(report);
                } else
                    res.status(403).json("No reports found");
            }
        });
    })



// ------------------------- getting stuff form reports ends-------------------------

//deleting a report
router.delete("/:campusId/report/:reportId", (req, res, next) => {
    r.db('grace_fellowship').table('campus').get(req.params.campusId).update((item) => {
        return {
            reports: item('reports')
            .filter(function (report) {
                return report("id").ne(req.params.reportId)
            })
        }
    })
    .run(req._dbconn, function (err, result) {
        if (err)
            res.status(500).json(err);
        else {
            if (result.replaced > 1) {
                res.status(200).json(result.replaced);
            } else {
                res.status(403).json(result);
            }
        }
    })
});

module.exports = router;