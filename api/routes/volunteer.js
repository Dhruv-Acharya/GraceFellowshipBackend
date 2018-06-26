const express = require('express');
const router = express.Router();
const r = require('rethinkdb');
require('./../../env');

const campusRoutes = require('./campus');
router.use('/',campusRoutes);



module.exports = router;
