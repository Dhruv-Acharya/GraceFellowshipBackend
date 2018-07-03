const express = require('express');
const router = express.Router();
const r = require('rethinkdb');
require('./../../env');

//const campusRoutes = require('./campus');

//combined effort for inserting geeneral tithe and cheque
router.post('/:campusId/report/:reportId/offerings/:type',(req,res)=>{

    if(req.params.type === 'tithe')type ='tithe';
    else if(req.params.type === 'general')type = 'general';
    else if(req.params.type === 'cheque')type = 'cheque';
    else type = 'error';
    
    r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
        r.row("id").match(req.params.reportId)
    )
    .run(req._dbconn,function (err,result){
        if(err)res.status(500).json(err);
        else{
            x = result[0];
            try {

                r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
                    reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({
                        type:req.body
                    }))
                }).run(req._dbconn, function (err, success) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).json(success.replaced);
                    }
                });
            } catch (error) {
                res.status(500).json("Problem with nth Number" + err);
            }
        }
    })
});




// //replacing general array
// router.post('/:campusId/report/:reportId/offerings/general',(req,res)=>{

//     // class General{
//     //     constructor(obj){
//     //         this.denom = obj.denom;
//     //         this.quantity = this.quantity;
//     //     }
//     // }
//     // var general = new General(req.body);
    
//     r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
//         r.row("id").match(req.params.reportId)
//     )
//     .run(req._dbconn,function (err,result){
//         if(err)res.status(500).json(err);
//         else{
//             x = result[0];
//             try {

//                 r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
//                     reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({
//                         "general":req.body
//                     }))
//                 }).run(req._dbconn, function (err, success) {
//                     if (err) {
//                         res.status(500).json(err);
//                     } else {
//                         res.status(200).json(success.replaced);
//                     }
//                 });
//             } catch (error) {
//                 res.status(500).json("Problem with nth Number" + err);
//             }
//             // res.status(200).json(result);/\
//         }
//     })
// });

// //replacaing cheque array
// router.post('/:campusId/report/:reportId/offerings/cheque',(req,res)=>{

//     // class General{
//     //     constructor(obj){
//     //         this.name = obj.name;
//     //         this.bank = obj.bank;
//     //         this.cheque_no = obj.cheque_no;
//     //         this.cheque_date = obj.cheque_date;
//     //         this.amount = obj.amount;
//     //     }
//     // }
//     // var general = new General(req.body);
    
//     r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
//         r.row("id").match(req.params.reportId)
//     )
//     .run(req._dbconn,function (err,result){
//         if(err)res.status(500).json(err);
//         else{
//             x = result[0];
//             try {
//                 r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
//                     reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({
//                         "cheque":req.body
//                     }))
//                 }).run(req._dbconn, function (err, success) {
//                     if (err) {
//                         res.status(500).json(err);
//                     } else {
//                         res.status(200).json(success.replaced);
//                     }
//                 });
//             } catch (error) {
//                 res.status(500).json("Problem with nth Number" + err);
//             }
//         }
//     })
// });

// //replaceing tithe array
// router.post('/:campusId/report/:reportId/offerings/tithe',(req,res)=>{

//     r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').offsetsOf(
//         r.row("id").match(req.params.reportId)
//     )
//     .run(req._dbconn,function (err,result){
//         if(err)res.status(500).json(err);
//         else{
//             x = result[0];
//             try {
//                 r.db('grace_fellowship').table('campus').get(req.params.campusId).update({
//                     reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge({
//                         "tithe":req.body
//                     }))
//                 }).run(req._dbconn, function (err, success) {
//                     if (err) {
//                         res.status(500).json(err);
//                     } else {
//                         res.status(200).json(success.replaced);
//                     }
//                 });
//             } catch (error) {
//                 res.status(500).json("Problem with nth Number" + err);
//             }
//         }
        
//     })
// });
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
                            }).without('campus_id')
                            .run(req._dbconn,function (err, instruments){
                                if(err){
                                    res.status(500).json(err);
                                }else{
                                    instruments.toArray((err, result)=>{
                                        if(err)res.status(500),json(err);
                                        else{
                                            response.instruments = result;
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

    //fetch tithe / cheque / general of a report
    router.use('/:campusId/report/:reportId/offerings/:type',function (req,res){
        
        if(req.params.type === 'tithe')type ='tithe';
        else if(req.params.type === 'general')type = 'general';
        else if(req.params.type === 'cheque')type = 'cheque';
        else type = 'error';

        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').filter({
            "id":req.params.reportId
        }).pluck(type)
        .run(req._dbconn,(err,result)=>{
            res.status(200).json(result[0][req.params.type]);
            
        })
    });

// router.use('/',campusRoutes);
module.exports = router;
