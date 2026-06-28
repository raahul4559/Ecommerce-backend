import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";

passport.serializeUser((user, next) => {
    next(null, user._id);
});

passport.deserializeUser(async (id, next) => {
    try {
        const user = await User.findById(id);
        if (user) next(null, user);
        else next(new ApiError(404, "User does not exist"), null);
    } catch (error) {
        next(new ApiError(500, "Something went wrong while deserializing the user. Error: " + error), null);
    }
});

console.log("Checking Env:", process.env.GOOGLE_CLIENT_ID);


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
        async (_, __, profile, next) => {
            try {
                let user = await User.findOne({ email: profile._json.email });

                if (user) {
                    return next(null, user); // existing user, just log them in
                }

                const newUser = await User.create({
                    email: profile._json.email,
                    password: profile.id,      
                    username: profile._json.email?.split("@")[0],
                    isEmailVerified: true,
                });

                return next(null, newUser);
            } catch (error) {
                return next(new ApiError(500, "Error while registering the user: " + error), null);
            }
        }
    )
);