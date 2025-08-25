const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxLength: [50, 'First name cannot be more than 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxLength: [50, 'Last name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        trim: true,
        match: [
            /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/,
            'Please add a valid phone number'
        ]
    },
    company: {
        type: String,
        trim: true,
        maxLength: [100, 'Company name cannot be more than 100 characters']
    },
    source: {
        type: String,
        required: [true, 'Lead source is required'],
        enum: {
            values: ['website', 'referral', 'social', 'email', 'other'],
            message: '{VALUE} is not a valid source'
        }
    },
    status: {
        type: String,
        required: [true, 'Lead status is required'],
        enum: {
            values: ['new', 'contacted', 'qualified', 'lost', 'won'],
            message: '{VALUE} is not a valid status'
        },
        default: 'new'
    },
    notes: {
        type: String,
        maxLength: [1000, 'Notes cannot be more than 1000 characters']
    }
}, {
    timestamps: true
});

// Removed duplicate index since unique: true already creates an index

module.exports = mongoose.model('Lead', leadSchema);