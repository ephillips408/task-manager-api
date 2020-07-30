const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Creates a reference to the User model. Allows us to fetch entire user profile when we have access to an individual task.
    }
}, {
    timestamps: true
})

taskSchema.pre('save', async function (next) {
    next()
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task