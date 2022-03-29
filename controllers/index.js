const passport = require('passport');
const jwt = require('jsonwebtoken');
const nconf = require('nconf');

// Set up nconf
nconf.argv().env().file({ file: '../config.json' });

// Log In
exports.logIn = [
    // Process Log In
    (req, res, next) => {
        // Authenticate with database (NOTE: { session: false } is passed so that the user isn't saved in the session.)
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({ user, error, info });
            }

            // Log the user in
            req.login(user, { session: false }, (error) => {
                if (error) { res.json(error); }
                // Generate a signed JSON web token with the contents of the user object (NOTE: Access user info via req.user.info)
                const token = jwt.sign({ info: user }, nconf.get('JWT_SECRET'), { expiresIn: '5m' });
                return res.json({ user, token });
            });
        })(req, res);
    }
];