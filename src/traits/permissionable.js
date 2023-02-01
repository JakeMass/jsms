import axios from "axios"

export class Permissionable {
    static init(model, permissions, permissionKey, fetch = false) {
        model.can = (value) => permissions.includes(value, permissionKey)

        if (fetch) {
            permissions.fetch()
        }
    }
}