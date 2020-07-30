const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

// Add a new task to tasks
router.post('/tasks', auth, async (req, res) => {
    const task = new Task(({
        ...req.body, // ES6 operation that copies all properties from req.body to the new Task object. Called the spread operator.
        owner: req.user._id // ID of user that was just authenticated
    }))

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Search for all tasks
router.get('/tasks/', auth, async (req, res) => {
    const match = {}
    const sort = {}

    // Converts match.completed to true if req.query.completed === 'true'. Notice the difference between string and boolean.
    // match.completed will be false if req.query.completed === anything else.
    if (req.query.completed) { match.completed = req.query.completed === 'true' }

    // sortBy looks like GET /tasks/sortBy=createdAt:desc
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':') // We know that sortBy is provided because of the if statement.
        // parts[0] === 'createdAt', sort[parts[0]] = parts[1] ==> { createdAt: desc}
        sort[parts[0]] = parts[1] === 'desc' ? -1: 1 // if parts[1] === desc, sort === { createdAt: -1 }. else, sort === { createdAt: -1 }
        // /\ Will sort by ascending if any value that is not desc is provided. May be an issue.
    }

    try {
        await req.user.populate({
            path: 'tasks',
             // When passing object, expects path argument. We want the tasks, hence path: 'tasks'
            match,
            options: {
                // options used for pagination
                limit: parseInt(req.query.limit), // Allows for the user to set the number of tasks per page.
                skip: parseInt(req.query.skip), // Allows for pagination
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }
})

// Search for a single task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        // owner: req.user._id makes sure that the task that is found was created by the authenticated user.

        if (!task) { return res.status(404).send() }

        res.status(201).send(task)
    } catch (error) {
        res.status(500).send()
    }
})

// Update an existing task
router.patch('/tasks/:id', auth, async (req, res) => {
    // See the users patch for details regarding lines of code that are note seemingly obvious.
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) { res.status(400).send({ error: 'Invalid updates.' }) }

    try {
        // These changes allow for middleware to run.
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        
        if (!task) { return res.status(404).send() }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task =  await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) { return res.status(404).send() }
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router