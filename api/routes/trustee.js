
const express = require('express');
const router = express.Router();
const r = require('rethinkdb');
require('./../../env');

    // r.db('grace_fellowship').table('campus').get('34b06c9e-43d0-45aa-b6bd-930510587d78')('reports').filter(
    //     r.row('epoch').gt(1514745000000).and(r.row('epoch').lt(1517423400000))
// )

// r.db('grace_fellowship').table('campus').coerceTo('array').map(
//     function (campus) {
//         return campus('reports').filter(function (report) {
//             return report('epoch').gt(1514745000000).and(report('epoch').lt(1517423400000))
//         })
//     }
// )


router.get('/:trusteeId/summary/:month/:year',(req,res)=>{
    
    
        var d_low = new Date(req.params.year,req.params.month-1);
        var d_high = new Date(req.params.year,req.params.month);
            


    // r.db('grace_fellowship').table('campus').get()('reports').filter(
    //     r.row('epoch').gt(d_low.getTime()).and(r.row('epoch').lt(d_high.getTime()))
    // )
    
    
    r.db('grace_fellowship').table('campus').coerceTo('array')
    .map(
        function (campus) {
            return {
                "reports": campus('reports').filter(function (report) {
                    return report('epoch').gt(d_low.getTime()).and(report('epoch').lt(d_high.getTime()))
                }).pluck('language', 'date', {
                    'begining': ['start']
                }, {
                    'sermon': ['start']
                }, {
                    'ending': ['time']
                }, 'attendance', 'tithe', 'general', 'cheque','id'),
                "id": campus('id'),
                "name": campus('name')
            }
        }
    )
    .run(req._dbconn,(err,result)=>{
        if(err) res.status(500).json(err);
        else {
            result.toArray((err,array)=>{
                if(err) res.status(500).json(err);
                else{
                    array.forEach(campus => {
                        if(campus.reports.length > 0){
                            campus.reports.forEach(report => {
                                report['general_total'] = 0;
                                report['tithe_total'] = 0;
                                report['cheque_total'] = 0;

                                if(report.hasOwnProperty('general')){
                                    report.general.forEach(element => {
                                        report['general_total'] += element.denom * element.quantity;
                                    });
                                    delete report.general;
                                }

                                if(report.hasOwnProperty('tithe')){
                                    report.tithe.forEach(element => {
                                        report['tithe_total'] += element.amount;
                                    });
                                    delete report.tithe;
                                }

                                if(report.hasOwnProperty('cheque')){
                                    report.cheque.forEach(element => {
                                        report['cheque_total'] += element.amount;
                                    });
                                    delete report.cheque;
                                }
                            });
                        }
                    });
                    res.status(200).json(array);
                }
            }) 
        }
    });
})

module.exports = router;