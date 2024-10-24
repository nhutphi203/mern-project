class ErrorHandler extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode =statusCode;
    }
}

export const errorMiddleware = (err,req ,res,next) => {
    err.message = err.message || "internal server error"
    err.statusCode= err.statusCode || 500;

    if(err.code === 11000){
        const message = `Duplicate ${object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message,400);
    }
    if(err.name === "JsonWebTokenError"){
        const message = " Json web token is invalid,try again";
        err = new ErrorHandler(message,400);
    }
    if(err.name === "TokenExpiredError"){
        const message = " Json web token is expired,try again";
        err = new ErrorHandler(message,400);
    }
    if(err.name === "CastError"){
        const message = `invalid ${err.path}`;
        err = new ErrorHandler(message,400);
    }
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });

}