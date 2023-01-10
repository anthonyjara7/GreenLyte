class ExpressError extends Error {
    constructor(message, statusCode) {
        super();    // Calls Error class' constructor
        this.message = message; // Modifies message variable in Error class
        this.statusCode = statusCode;   // Modifies statusCode variable in Error class
    }
}

module.exports = ExpressError;