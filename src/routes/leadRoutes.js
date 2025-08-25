const express = require('express');
const router = express.Router();
const { 
    createLead,
    getLeads,
    getLead,
    updateLead,
    deleteLead,
    searchCompanyLeads
} = require('../controllers/leadController');

// CRUD Routes
router.route('/')
    .get(getLeads)
    .post(createLead);

router.route('/:id')
    .get(getLead)
    .put(updateLead)
    .delete(deleteLead);

// Hunter API Integration
router.post('/search-company', searchCompanyLeads);

module.exports = router;