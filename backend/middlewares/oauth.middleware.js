
export const oauthErrorHandler = (provider) => {
    return (err, req, res, next) => {
        console.error(`${provider} OAuth Error:`, err);

        let redirectUrl = `${process.env.FRONTEND_URL}/login`;
        let errorParam = 'oauth_error';

        // Xử lý các loại lỗi khác nhau
        if (err.message.includes('email already exists')) {
            errorParam = 'email_exists';
        } else if (err.message.includes('No email provided')) {
            errorParam = 'no_email';
        } else if (err.message.includes('access_denied')) {
            errorParam = 'access_denied';
        }

        res.redirect(`${redirectUrl}?error=${errorParam}&provider=${provider}`);
    };
};

export const oauthLogger = (provider) => {
    return (req, res, next) => {
        console.log(`${provider} OAuth attempt:`, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });
        next();
    };
};