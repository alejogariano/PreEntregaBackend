import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

import User from '../models/userModel.js'
import Cart from '../models/cartModel.js'

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return done(null, false, { message: 'No user found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return done(null, false, { message: 'Password incorrect' })
        }
        return done(null, user)
    } catch (err) {
        return done(err)
    }
}))

const isProduction = process.env.NODE_ENV === 'production'

passport.use(new GitHubStrategy({
    clientID: isProduction 
        ? process.env.GITHUB_CLIENT_ID_PRODUCTION 
        : process.env.GITHUB_CLIENT_ID_DEVELOPMENT,
    clientSecret: isProduction 
        ? process.env.GITHUB_CLIENT_SECRET_PRODUCTION 
        : process.env.GITHUB_CLIENT_SECRET_DEVELOPMENT,
    callbackURL: isProduction 
        ? process.env.GITHUB_CALLBACK_URL_PRODUCTION 
        : process.env.GITHUB_CALLBACK_URL_DEVELOPMENT
}, async (accessToken, refreshToken, profile, done) => {
    try {
        if (!profile.emails || !profile.emails[0].value) {
            return done(new Error('No se pudo obtener el email del usuario de GitHub.'))
        }
        
        const email = profile.emails[0].value;
        const profilePhoto = Array.isArray(profile.photos) ? profile.photos[0].value : '../public/uploads/default.jpg';
        
        let displayName = profile.displayName || email.split('@')[0];
        let user = await User.findOne({ email });
        
        if (!user) {
            user = new User({
                first_name: displayName,
                last_name: '',
                email: email,
                age: null,
                password: '',
                profile_image: profilePhoto
            });
            
            const newCart = new Cart();
            await newCart.save();
            user.cart = newCart._id;
            
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}))

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: isProduction 
        ? "http://localhost:8080/auth/google/callback" 
        : "https://2dapreentregabackend-production.up.railway.app/auth/google/callback"
}, async (token, tokenSecret, profile, done) => {
    try {
        if (!profile.emails || !profile.emails[0].value) {
            return done(new Error('No se pudo obtener el email del usuario de Google. Por favor revisa la privacidad de tu cuenta de google y vuelve a intentarlo'))
        }

        const email = profile.emails[0].value
        const profilePhoto = Array.isArray(profile.photos) ? profile.photos[0].value : '../public/uploads/default.jpg'

        let displayName = profile.displayName
        if (!displayName) {
            displayName = email.split('@')[0]
        }

        let user = await User.findOne({ email: email })

        if (!user) {
            user = new User({
                first_name: displayName,
                last_name: '',
                email: email,
                password: '',
                age: null,
                role: 'user',
                profile_image: profilePhoto
            })

            const newCart = new Cart()
            await newCart.save()
            user.cart = newCart._id

            await user.save()
        }

        return done(null, user)
    } catch (err) {
        return done(err)
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).populate('cart')
        done(null, user)
    } catch (err) {
        done(err)
    }
})

export default passport