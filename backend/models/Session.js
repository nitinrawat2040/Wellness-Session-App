const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [20, 'Each tag cannot exceed 20 characters']
    }],
    json_file_url: {
        type: String,
        required: false,
        trim: true
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for better query performance
sessionSchema.index({ user_id: 1, status: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ tags: 1 });

// Method to get sessions without sensitive data
sessionSchema.methods.toJSON = function () {
    const session = this.toObject();
    return session;
};

module.exports = mongoose.model('Session', sessionSchema); 