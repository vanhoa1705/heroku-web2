exports.successResponse = (res,message, data = null, status = 200, result = true) => {
    res.status(status).json({
        result: result,
        message,
        data,
        err: null,
    });
};