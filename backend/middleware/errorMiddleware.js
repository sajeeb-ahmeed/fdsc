const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
    }

    // Mongoose cast error (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
    }

    res.status(statusCode);
    res.json({
        message: err.message,
        errors: err.errors || null,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };
