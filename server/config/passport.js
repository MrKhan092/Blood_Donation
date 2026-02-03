// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/User');

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: '/api/auth/google/callback',
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if user already exists
//         let user = await User.findOne({ email: profile.emails[0].value });

//         if (user) {
//           // User exists, return user
//           return done(null, user);
//         }

//         // User doesn't exist, create new user with incomplete profile
//         // They'll need to complete registration
//         const newUser = await User.create({
//           name: profile.displayName,
//           email: profile.emails[0].value,
//           password: 'google-oauth-' + Math.random().toString(36).slice(-8), // Random password
//           phone: '0000000000', // Placeholder - needs completion
//           role: 'patient', // Default role - can be changed
//           location: {
//             address: '',
//             city: '',
//             state: '',
//             pincode: ''
//           },
//           googleId: profile.id,
//           isActive: true
//         });

//         done(null, newUser);
//       } catch (error) {
//         done(error, null);
//       }
//     }
//   )
// );

// module.exports = passport;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Only configure Google Strategy if credentials are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google OAuth - User:', profile.emails[0].value);

          // Check if user exists
          let user = await User.findOne({ 
            $or: [
              { email: profile.emails[0].value },
              { googleId: profile.id }
            ]
          });

          if (user) {
            // Update googleId if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              user.authProvider = 'google';
              await user.save();
            }
            console.log('Existing user logged in:', user._id);
            return done(null, user);
          }

          // Create new user
          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            authProvider: 'google',
            phone: '0000000000',
            role: 'patient',
            location: {
              address: 'Not provided',
              city: 'Not provided',
              state: 'Not provided',
              pincode: '000000'
            },
            profilePicture: profile.photos?.[0]?.value || null,
            isActive: true,
            profileComplete: false
          });

          console.log('New user created:', newUser._id);
          done(null, newUser);

        } catch (error) {
          console.error('Google OAuth Error:', error);
          done(error, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth Strategy configured');
} else {
  console.warn('⚠️  Google OAuth credentials not found. Google sign-in will not work.');
  console.warn('   Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env file');
}

