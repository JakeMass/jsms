import { Collection } from "../traits/collection"
import { Role } from "../models/role"

export class RoleCollection {
    static collects = Role

    static config = {
        basePath: '/api/roles',
        key: Role.config.key
    }

    constructor(entries = [], keys = []) {
        Collection.init(this, RoleCollection, entries, keys)
    }
}