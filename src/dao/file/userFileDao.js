import fs from 'fs/promises'
import path from 'path'

const filePath = path.resolve('data/users.json')

class UserDaoFile {
    async _readFile() {
        const data = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(data)
    }

    async _writeFile(data) {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    }

    async findById(id) {
        const users = await this._readFile()
        return users.find(user => user.id === id)
    }

    async findByEmail(email) {
        const users = await this._readFile()
        return users.find(user => user.email === email)
    }

    async createUser(user) {
        const users = await this._readFile()
        users.push(user)
        await this._writeFile(users)
        return user
    }

    async updateUser(updatedUser) {
        const users = await this._readFile()
        const index = users.findIndex(user => user.id === updatedUser.id)
        if (index !== -1) {
        users[index] = updatedUser
        await this._writeFile(users)
        }
        return updatedUser
    }

    async deleteUserById(id) {
        const users = await this._readFile()
        const newUsers = users.filter(user => user.id !== id)
        await this._writeFile(newUsers)
    }
}

export default UserDaoFile