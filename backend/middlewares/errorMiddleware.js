class ErrorHandler extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode =statusCode;
    }
}

export const errorMiddleware = (err,req ,res,next) => {
    err.message = err.message || "internal server error"
    err.statusCode= err.statusCode || 500;
}