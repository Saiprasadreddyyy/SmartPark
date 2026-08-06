export function errorHandler(err, req, res, next) {

    console.error(err);

    return res.status(err.statusCode || 500).json({

        success: false,

        message:
            process.env.NODE_ENV === "production"
                ? err.statusCode
                    ? err.message
                    : "Something went wrong"
                : err.message,

        stack:
            process.env.NODE_ENV === "development"
                ? err.stack
                : undefined

    });

}