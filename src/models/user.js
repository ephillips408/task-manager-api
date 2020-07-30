const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

// Using userSchema allows us to use middleware.
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) { throw new Error('Email is invalid') }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) { throw new Error(`Password must not contain 'password'.`) }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate (value) {
            if (value < 0) { throw new Error('Age must be a positive number') }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer // Allows us to store the binary image data with the user profile.
    },
}, {
    timestamps: true // Set to false by defualt
})

userSchema.virtual('tasks', {
    // Does not change what is stored in user document.
    // 'tasks' could be any name. It's just a value that is passed to the function.
    ref: 'Task', // See task.js model for similar description of this line. Allows mongoose to see how users and tasks are related.
    localField: '_id', // 'owner' property of task is associated with _id field of user. 
    foreignField: 'owner' // Name of field that is set up on other 'thing,' AKA task, that creates the relationship between the two models (users and tasks).
})

userSchema.methods.toJSON = function () {
    // Removes irrelevant and sensitive data that is shown to the user.
    const user = this
    const userObject = user.toObject() // toObject() provided by mongoose

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    // Uses 'this' binding, hence the regular function syntax
    // Methods are available on the instances, sometimes called instance methods
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET) //.toString() necessary because user._id is an Object ID.
    
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Statics are available on the model
    const user = await User.findOne({ email })
    if (!user) { throw new Error('Unable to login.') }

    const isMatch = await bcrypt.compare(password, user.password) // password is the argument of the function, user.password is the hash in the database
    if (!isMatch) { throw new Error('Unable to login') }

    return user
} 

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    // Arrow functions do not bind 'this' keyword. Must be standard function.
    // 'this' is equal to the document being saved, AKA the individual user
    const user = this

    if (user.isModified('password')) { user.password = await bcrypt.hash(user.password, 8) }
    
    next() // Will wait forever if next() is not called
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User