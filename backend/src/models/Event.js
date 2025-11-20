import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Hackathon', 'Seminar', 'Sports', 'Cultural', 'Workshop', 'Other'],
        default: 'Other'
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String
    },
    location: {
        type: String
    },
    description: {
        type: String
    },
    registrationLink: {
        type: String
    },
    reminder: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
