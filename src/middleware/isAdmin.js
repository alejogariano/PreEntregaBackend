export const isAdmin = (req, res, next) => {
    if (req.isAdmin()) {
        return next()
    } else {
        res.redirect('/login?error=Necesitas iniciar sesión para acceder a esta página.')
    }
}