import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    subject: {
        type: String
    },
    pinned: {
        type: Boolean,
        default: false
    },
    attachments: [{
        name: String,
        url: String,
        type: String
    }]
}, {
    timestamps: true
});

const Note = mongoose.model('Note', noteSchema);

export default Note;
