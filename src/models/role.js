import { PermissionCollection } from '../collections/permissions'
import { Model } from '../traits/model'
import { Relation } from '../traits/relations'
import { defineConfig } from './defaults'

export class Role {
    static attributes = ['id', 'name', 'key']

    static config = defineConfig({
        basePath: '/api/role'
    })

    static relations = {
        permissions: {
            type: 'collection',
            value: PermissionCollection
        }
    }

    constructor(data) {
        Model.init(this, Role, data)
        Relation.init(this, Role, data.relations)
    }

    static async create(data) {
        return await Model.create(data, Role)
    }
}