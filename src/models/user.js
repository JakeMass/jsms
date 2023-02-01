import axios from 'axios'
import { Model } from '../traits/model'
import { Relation } from '../traits/relations'
import { Permissionable } from '../traits/permissionable'
import { PermissionCollection } from '../collections/permissions'
import { Role } from './role'
import { defineConfig } from './defaults'

export class User {
    static attributes = ['id', 'name', 'email', 'created_at', 'updated_at', 'deleted_at']

    static config = defineConfig({
        basePath: '/api/user',
    })

    static relations = {
        permissions: {
            type: 'collection',
            value: PermissionCollection,
        },
        role: {
            type: 'model',
            value: Role
        }
    }

    constructor(data) {
        Model.init(this, User, data)
        Relation.init(this, User, data.relations) 
        Permissionable.init(this, this.related.permissions, 'key')
    }

    static async create(data) {
        return await Model.create(data, User)
    }

    static async login(email, password) {
        const { data: { data }} = await axios.post('/api/user/login', {email, password} )

        return new User(data)
    }

    static async logout() {
        await axios.post('api/user/logout');
    }

    static async current() {
        const { data: { data }} = await axios.get('/api/user/current')

        return new User(data)
    }
}