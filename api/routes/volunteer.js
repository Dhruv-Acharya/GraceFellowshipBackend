const express = require('express');
const router = express.Router();
const r = require('rethinkdb');
require('./../../env');

//const campusRoutes = require('./campus');

//combined effort for inserting geeneral tithe and cheque
router.post('/:campusId/report/:reportId/offerings/:type',(req,res)=>{

    var type = Object();

    if(req.params.type === 'tithe') type['tithe'] = req.body;
    else if(req.params.type === 'general') type['general'] = req.body;
    else if(req.params.type === 'cheque') type['cheque'] = req.body;
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
                    reports: r.row('reports').changeAt(x, r.row('reports').nth(x).merge(type))
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


    //fetch report by volunteer ID
    router.get('/:volunteerId/reports',(req,res)=>{
        console.log('in');
        
        r.db('grace_fellowship').table('volunteer').get(req.params.volunteerId)
        .run(req._dbconn,function (err,result) {
            if(err) res.status(500).json(err);
            else{
                r.db('grace_fellowship').table('campus').get(result.campus_id)('reports')
                .orderBy(r.desc('epoch'))
                .without('epoch')
                .slice(0,15)
                .run(req._dbconn,function (err,result) {
                    if(err) res.status(500).json(err);
                    else{
                        res.status(200).json(result);
                    }
                })
            }
        })
    });

    //fetch tithe & cheque & general & category of a report
    router.use('/:campusId/report/:reportId/offerings',function (req,res){
        
        r.db('grace_fellowship').table('campus').get(req.params.campusId)('reports').filter({
            "id":req.params.reportId
        }).pluck('tithe','general','cheque')
        .run(req._dbconn,(err,result)=>{
            if(err) res.status(500).json(err);
            else{
                r.db('grace_fellowship').table('donation_category').pluck('category')
                .run(req._dbconn,(err,category)=>{
                    if(err) res.status(500).json(err);
                    else{
                        category.toArray((err,array)=>{
                            if(err) res.status(500).json(err);
                            else{
                                result[0]['donation_category'] = [];
                                
                                array.forEach(element => {
                                    result[0]['donation_category'].push(element['category'])
                                });
                                res.status(200).json(result[0]);    
                            }
                        })
                        
                    }
                })
            }
        })
    });

// router.use('/',campusRoutes);
module.exports = router;
