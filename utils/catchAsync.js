// Executes any function which will catch any errors and send it to the next 
// defined middleware
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}