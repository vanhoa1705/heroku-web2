module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        result: false,
        message: err.message,
        data: null,
        error: err.error,
    });
};
