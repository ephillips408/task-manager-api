// This file sets up and exports the app for testing with supertest.
// Notice the differences between this file and index.js

const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app // Export used in index.js for running file, and user.test.js for express testing.