import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import User from '../src/models/userModel.js';

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, { message: 'No user found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Password incorrect' });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).populate('userCarts');
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;





/* import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from './models/userModel.js';

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async function(email, password, done) {
        try {
            const user = await User.findOne({ email }).populate('cart');
            if (!user) {
                return done(null, false, { message: 'Usuario no encontrado' });
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, { message: 'Contraseña incorrecta' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).populate('cart');
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport; */