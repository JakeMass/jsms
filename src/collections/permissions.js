import { Collection } from "../traits/collection"
import { Permission } from "../models/permission"

export class PermissionCollection {
    static collects = Permission

    static config = {
        basePath: '/api/permissions',
        key: Permission.config.key
    }

    constructor(entries = [], keys = []) {
        Collection.init(this, PermissionCollection, entries, keys)
    }
}