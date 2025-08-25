const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// @desc    Create new lead
// @route   POST /api/leads
const createLead = async (req, res) => {
    try {
        const lead = await prisma.lead.create({
            data: req.body
        });
        res.status(201).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error('Create Lead Error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get all leads
// @route   GET /api/leads
const getLeads = async (req, res) => {
    try {
        const leads = await prisma.lead.findMany();
        res.status(200).json({
            success: true,
            data: leads
        });
    } catch (error) {
        console.error('Get Leads Error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
const getLead = async (req, res) => {
    try {
        const lead = await prisma.lead.findUnique({
            where: {
                id: req.params.id
            }
        });
        
        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error('Get Lead Error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
const updateLead = async (req, res) => {
    try {
        const lead = await prisma.lead.update({
            where: {
                id: req.params.id
            },
            data: req.body
        });

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        console.error('Update Lead Error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
const deleteLead = async (req, res) => {
    try {
        await prisma.lead.delete({
            where: {
                id: req.params.id
            }
        });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete Lead Error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Search company and create leads from Hunter API
// @route   POST /api/leads/search-company
const searchCompanyLeads = async (req, res) => {
    try {
        const { company } = req.body;
        
        if (!company) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a company name'
            });
        }

        // Search Hunter API for company emails
        const response = await axios.get('https://api.hunter.io/v2/domain-search', {
            params: {
                company: company,
                limit: 5,
                type: 'personal', // Only get personal email addresses
                api_key: process.env.HUNTER_API
            }
        });

        const { data } = response.data;
        
        if (!data.emails || data.emails.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No leads found for this company'
            });
        }

        // Create leads from the Hunter API results
        const createdLeads = await Promise.all(
            data.emails.map(async (email) => {
                const leadData = {
                    firstName: email.first_name || 'Unknown',
                    lastName: email.last_name || 'Unknown',
                    email: email.value,
                    phone: email.phone_number || null,
                    company: data.organization || company,
                    source: 'Hunter API',
                    status: 'new',
                    notes: `Position: ${email.position || 'Unknown'}\nDepartment: ${email.department || 'Unknown'}\nSeniority: ${email.seniority || 'Unknown'}`
                };

                try {
                    return await prisma.lead.create({
                        data: leadData
                    });
                } catch (error) {
                    console.error(`Failed to create lead for ${email.value}:`, error);
                    return null;
                }
            })
        );

        // Filter out any failed creations
        const successfulLeads = createdLeads.filter(lead => lead !== null);

        res.status(201).json({
            success: true,
            data: {
                created: successfulLeads.length,
                leads: successfulLeads
            }
        });
    } catch (error) {
        console.error('Hunter API Error:', error.response?.data || error.message);
        res.status(400).json({
            success: false,
            error: error.response?.data?.errors?.[0] || error.message
        });
    }
};

module.exports = {
    createLead,
    getLeads,
    getLead,
    updateLead,
    deleteLead,
    searchCompanyLeads
};