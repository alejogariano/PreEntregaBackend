import { updateProfile as updateProfileService, deleteUser as deleteUserService, logoutUser as logoutUserService } from '../services/userService.js'

export const logoutUser = async (req, res) => {
    try {
        await logoutUserService(req)
        res.redirect('/?success=Cierre de sesión exitoso.')
    } catch (error) {
        console.error('Error al cerrar sesión:', error)
        res.redirect('/?error=Error al cerrar sesión.')
    }
}

export const updateProfile = async (req, res) => {
    const userId = req.params.uid
    const profileData = req.body
    const file = req.file

    try {
        await updateProfileService(userId, profileData, file)
        res.redirect('/profile?success=Perfil actualizado correctamente.')
    } catch (error) {
        console.error('Error al actualizar el perfil:', error)
        res.redirect('/profile?error=' + encodeURIComponent(error.message))
    }
}

export const deleteUser = async (req, res) => {
    const userId = req.params.uid

    try {
        await deleteUserService(userId)
        await logoutUserService(req)
        res.status(200).json({ message: 'Perfil eliminado correctamente.' })
    } catch (error) {
        console.error('Error al eliminar el perfil:', error)
        res.status(500).json({ error: 'Error al eliminar el perfil.' })
    }
}