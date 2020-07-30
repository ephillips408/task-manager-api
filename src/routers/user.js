const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendDeleteEmail } = require('../emails/account')
const router = new express.Router()

// Add a new user to users
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

// Allows for user login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) //findByCredentials is in ../models/user
        const token = await user.generateAuthToken() // Trying to generate token for specific user, not the User collection
        res.send({ user, token }) // Unnecessary data removed by userSchema.methods.toJSON in user.js model. See video 112 for demonstration
    } catch (error) {
        res.status(400).send()
    }
})

// Logout a user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token )
        // req.user is the user. The user has already been authenticated at this point, so .tokens is their list of tokens.
        // the first token in token.token is an object, and the second token is the 'token' property of the token object.
        // When the tokens are equal, AKA logging out of the current device, the token will be removed.
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

// Get user profile
router.get('/users/me', auth, async (req, res) => {
    // Second argument is middleware function to run.
    // Will run only if middleware calls next().
    // /me in first argument allows someone to get their own profile, and id already provided as auth token has that information embedded.
    res.send(req.user)
})

// Update an existing user
router.patch('/users/me', auth, async (req, res) => {
    // Patch is designed to update an existing resource.
    const updates = Object.keys(req.body) // Returns an array of strings where each entry is the object key. Recall that req is what is passed to the callback, AKA the updates.
    const allowedUpdates = ['name', 'email', 'password', 'age']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    // Checks if updates are in the allowed updates. This returns a boolean for every entry in allowedUpdates.

    if (!isValidOperation) { return res.status(400).send({ error: 'Invalid updates.' }) }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]) // Allows for dynamic updating
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Delete a user
router.delete('/users/me', auth, async (req, res) => {
    // /me means that the user can only delete themselves. Changed from /:id to /me.
    try {
        await req.user.remove() // remove() provided by mongoose
        sendDeleteEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

// User avatar upload
const upload = multer({
    limits: {
        fileSize: 1000000, // 1 megabyte
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) { return cb(new Error('Please upload an image'))}
        cb(undefined, true)

        // fileFilter provided by multer, and cb short for callback
        // cb(new Error('Please upload an image'))
        // cb(undefined, true) No error, so upload expected
    }
})

// User avatar upload continued
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer() // Resizes avatar, then converts uploaded file to a .png, then to buffer.
    req.user.avatar = buffer // Contains the binary data of the image after modifications
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    // Need all four arguments (AKA call signature) so that Express knows that this function is designed to handle errors.
    res.status(400).send({ error: error.message })
})

// Delete user avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    // if (req.user.avatar === undefined) { return res.status(400).send({ error: 'No avatar currently uploaded' }) } Video does not use this.

    req.user.avatar = undefined // Will drop the avatar property from the user profile
    await req.user.save()
    res.send()
})

// Access the user avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) { throw new Error() }

        res.set('Content-Type', 'image/png') // Image converted to .png, so no need to worry about uploading other file formats.
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router