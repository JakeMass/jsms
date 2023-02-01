import { Collection } from "../traits/collection"
import { User } from '../models/user'
import { Pagination } from "../traits/pagination"

export class UserCollection {
    static collects = User

    static config = {
        basePath: '/api/users'
    }

    constructor(entries = []) {
        Collection.init(this, UserCollection, entries)
        Pagination.init(this, UserCollection)
    }
}