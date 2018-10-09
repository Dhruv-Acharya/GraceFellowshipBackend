var obj = new Object();
obj.date = "20-05-2018"
obj.time = "14:50"
var date_epoch = obj.date.split("-");
console.log(date_epochh);
date_epoch = date_epoch.concat(obj.time.split(":"));
date_epoch.push(0,0);
var d = new Date(date_epoch[2],date_epoch[1]-1,date_epoch[0],date_epoch[3],date_epoch[4]);
console.log(date_epoch);
console.log(d.getTime());


var myDate = new Date( d.getTime());
console.log(myDate.toGMTString()+"  "+myDate.toLocaleString());

