const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

// afterEach(() => {
//     // Similar to beforeEach()
//     console.log('After each')
// })

test('Should sign up a new user', async () => {
    // Post because we are adding new information to database.
    // /users/ is the url path for the database
    const response = await request(app).post('/users/').send({
        name: 'Eric',
        email: 'eric@example.com',
        password: 'MyPass777!'
    }).expect(201)

    // Ideas for testing using the response variable created above.
    // 1. Assert that the database was changed correctly.
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // 2. Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Eric',
            email: 'eric@example.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('MyPass777!') // Makes sure that the password is not stored as plain text in database.
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token) // Checks to see if the second token matches.
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'dne@example.com',
        password: 'badpass24!'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`) // Sets the authorization header for authentication, and gets the token from the user.
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete user account', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg') // Attach is provided by supertest, and allows us to attach files
        .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer)) // toEqual does not use the equality operator. This allows us to compare properties on objects instead of checking object equality in memory, which will fail.
    // This checks to make sure that the avatar is successfully stored as a Buffer (binary).
})

test('Should update valid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send( {name: 'Updated', email: 'newemail@example.com'} )
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Updated')
})

test('Should not update invalid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send( {invalidUpdate: true} )
        .expect(400)
})

