const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJwt = require('passport-jwt');
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const nconf = require('nconf');

// Set up nconf
nconf.argv().env().file({ file: './config.json' });

const localOptions = {
    usernameField: 'email', // Use email as username
    passReqToCallback: true
};

// Local Strategy used for initial log in
// NOTE: "done" is an internal passport method, taking in the parameters (err, user, info)
// NOTE: Must include { passReqToCallback: true } and pass req as 1st parameter to read request object
passport.use(new LocalStrategy(localOptions, (req, email, password, done) => {
    // Check if email & password matches in database
    User.findOne({ email }, (err, user) => {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Incorrect email.' }); }

        // Check if logging in from admin client (Only allow admins to log in)
        if (req.body.admin && user.admin == false) { return done(null, false, { message: 'You are not an admin.' }); }

        bcrypt.compare(password, user.password, (err, res) => {
            if (err) { return done(err); }
            if (res) { return done(null, {
                _id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                contact: user.contact,
                pic: user.pic,
                bio: user.bio,
                friends: user.friends,
                requests: user.requests,
                likedPosts: user.likedPosts,
                likedComments: user.likedComments,
                public: user.public,
                admin: user.admin
            }, { message: 'Logged in successfully.' }); }
            else { return done(null, false, { message: 'Incorrect password.' }); }
        });
    });
}));

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extracts token from authorization header with the scheme "bearer"
    secretOrKey: nconf.get('JWT_SECRET') // The secret (symmetric) or PEM-encoded public key (asymmetric) for verifying the token's signature
};

// Jwt Strategy used for validating token on specific routes
passport.use(new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    return done(null, jwt_payload);
    /*
    // (Optional) Find the user in database if needed
    return User.findById(jwt_payload.user._id)
    .then(user => { return done(null, user); })
    .catch(err => { return done(err); });
    */
}));