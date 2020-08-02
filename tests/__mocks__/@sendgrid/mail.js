module.exports = {
    setApiKey() {

    },
    send() {

    }
    // Because we do not do anything with the return value of these functions, we do not need to do anything with the functions.
}

// This makes sure that we do not actually send emails when running tests.
// This means that we do not waste our allocated number of emails from SendGrid. This would waste money if on a paid plan.
// Mocks directory must have format __mocks__ (2 underscores)
// Need the filepath as created because of NPM Scope (i.e. __mocks__ -> @sendgrid -> mail.js)
// - Notice how it matches the require statement in the account.js file.

