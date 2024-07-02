export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    } else {
        res.redirect('/login?error=Necesitas iniciar sesión para acceder a esta página.')
    }
}