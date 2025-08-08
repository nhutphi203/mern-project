import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/userScheme.js';
console.log("Reading JWT_SECRET_KEY in passport.config.js:", process.env.JWT_SECRET_KEY);
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        // Tên cookie có thể là patientToken, adminToken, hoặc doctorToken
        token = req.cookies["patientToken"] || req.cookies["adminToken"] || req.cookies["doctorToken"];
    }
    return token;
};
passport.use(
    new JwtStrategy(
        {
            // Thay vì tìm trong Header, ta dùng hàm vừa tạo để tìm trong Cookie
            jwtFromRequest: cookieExtractor,
            secretOrKey: process.env.JWT_SECRET_KEY,
        },
        async (payload, done) => {
            try {
                const user = await User.findById(payload.id);
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/users/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ providerId: profile.id, authType: 'google' });
        if (user) {
            return done(null, user);
        }

        const email = profile.emails && profile.emails[0].value;
        const existingEmailUser = await User.findOne({ email: email });
        if (existingEmailUser) {
            return done(new Error("An account with this email already exists."), false);
        }

        user = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: email,
            authType: 'google',
            providerId: profile.id,
            role: 'Patient',
            isVerified: true,
        });
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/v1/users/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name', 'picture']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({
            providerId: profile.id,
            authType: 'facebook'
        });

        if (user) {
            return done(null, user);
        }

        // Check for existing email
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        if (existingUser && existingUser.authType === 'traditional') {
            return done(null, false, {
                message: 'Email already exists with traditional account.'
            });
        }

        user = await User.create({
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            authType: 'facebook',
            providerId: profile.id,
            avatar: profile.photos[0]?.value,
            role: 'Patient',
            isVerified: true,
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/v1/users/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({
            providerId: profile.id,
            authType: 'github'
        });

        if (user) {
            return done(null, user);
        }

        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.local`;

        // Check for existing email
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.authType === 'traditional') {
            return done(null, false, {
                message: 'Email already exists with traditional account.'
            });
        }

        // Parse display name
        const nameParts = profile.displayName ? profile.displayName.split(' ') : [profile.username, ''];

        user = await User.create({
            firstName: nameParts[0] || profile.username,
            lastName: nameParts.slice(1).join(' ') || 'User',
            email,
            authType: 'github',
            providerId: profile.id,
            avatar: profile.photos[0]?.value,
            role: 'Patient',
            isVerified: true,
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Serialize/Deserialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;