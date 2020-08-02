const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId() // Need to create a mongoose ID so that we can test functions that require authentications
const userOne = {
    _id: userOneId,
    name: 'Test User',
    email: 'testuser@example.com',
    password: '56what!!',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET) // Needed to test authentication functions.
    }]
}

const userTwoId = new mongoose.Types.ObjectId() // Need to create a mongoose ID so that we can test functions that require authentications
const userTwo = {
    _id: userTwoId,
    name: 'Second User',
    email: 'seconduser@example.com',
    password: '123who?!',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET) // Needed to test authentication functions.
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(), // Defining ID so that we can use it. Do not need to define ID before taskOne because not JWT needed.
    description: 'First test task',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second test task',
    completed: true,
    owner: userOne._id

}

const taskThree = {
    _id: new mongoose.Types.ObjectId(), // Defining ID so that we can use it. Do not need to define ID before taskOne because not JWT needed.
    description: 'Third test task',
    completed: false,
    owner: userTwo._id

}

const setupDatabase = async () => {
    // This function will run before each test case is run.
    await User.deleteMany()
    // This deletes all users before each test case is run.
    // Makes sure that there is no attempt to add duplicate information to the database, which would result in a test failure.
    await Task.deleteMany()
    // Does the same thing as the above function, but for tasks.
    await new User(userOne).save()
    // This makes sure that we always have one user in the database. This will be helpful for testing logins.
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}