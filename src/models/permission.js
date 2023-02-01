import { Model } from '../traits/model'
import { defineConfig } from './defaults'

export class Permission {
    static attributes = ['id', 'key']

    static config = defineConfig({
        basePath: '/api/permission'
    })

    constructor(data) {
        Model.init(this, Permission, data)
    }
}