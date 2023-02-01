import axios from "axios"

/**
 * The Model-class holds a lot of utilities 
 * to manage and update a model representing
 * a single resource from the backend.
 * 
 * @namespace
 */
export class Model {

    /**
     * Implement and initialize the Model trait.
     * 
     * @param {Model} model 
     * @param {Model} type 
     * @param {object} param2 
     * 
     * @memberof Model
     */
    static init(model, type, { attributes = {} }) {
        /**
         * @namespace Model.Trait
         */

        /**
         * The init object holds the initial values 
         * of the model.
         * These are used to reset the attributes and
         * should only change when the database
         * was updated.
         * 
         * @prop {object} init
         * @memberof Model.Trait
         */
        model.init = {}

        type.attributes.forEach(key => {
            model.init[key] = attributes[key]

            Object.defineProperty(model, key, {
                get: () => attributes[key],
                set: (value) => attributes[key] = value
            })
        })

        /**
         * The request queue contains the names of the funtions
         * that will serialize the model.
         * 
         * @memberof Model.trait
         * @prop {Array} requestQueue
         */
        model.requestQueue = [ 'attributesToRequest' ]

        /**
         * Serialize attributes to request.
         * 
         * @memberof Model.Trait
         * @function attributesToRequest
         * @returns {object}
         */
        model.attributesToRequest = () => {
            let attributes = {}

            Object.keys(model.init).forEach(key => {
                attributes[key] = model[key]
            })

            return {
                name: 'attributes',
                value: attributes,
            }
        }

        /**
         * Serializes current model to a request.
         * 
         * @memberof Model.Trait
         * @function toRequest
         * @param {array} queue 
         * @returns {object}
         */
        model.toRequest = (queue = model.requestQueue) => {
            let request = {}

            queue.forEach(key => {
                const data = model[key]()

                request[data.name] = data.value
            })

            return request
        }

        /**
         * The update queue contains the names of functions
         * that will update certain parts of the model.
         * 
         * @memberof Model.Trait
         * @prop {Array} updateQueue
         */
        model.updateQueue = [ 'updateAttributes' ]

        /**
         * Updates the attributes of the model.
         * 
         * @memberof Model.Trait
         * @function updateAttributes
         * @param {object} data 
         */
        model.updateAttributes = (data) => {
            type.attributes.forEach(key => model.init[key] = data.attributes[key])
        }

        /**
         * The reset queue contains the names of functions
         * that will reset certain parts of the model.
         */
        model.resetQueue = [ 'resetAttributes' ]

        /**
         * Resets the attributes to the init values.
         */
        model.resetAttributes = () => {
            type.attributes.forEach(key => {
                model[key] = model.init[key]
            })
        }

        /**
         * Resets all properties wich handlers are 
         * registered in the reset queue
         */
        model.reset = () => {
            model.resetQueue.forEach(key => {
                model[key]()
            })
        }

        /**
         * The path for the GET request.
         */
        model.getPath = Model.parsePath(
            `${type.config.basePath}${type.config.paths.get}`, 
            type.config.key,
            model
        )

        /**
         * The path for the PATCH request.
         */
        model.updatePath = Model.parsePath(
            `${type.config.basePath}${type.config.paths.update}`, 
            type.config.key,
            model
        )

        /**
         * Update send PATCH request with model data
         * 
         * @returns {Promise}
         */
        model.update = async () => await Model.update(model.updatePath, model)

        model.deletePath = Model.parsePath(
            `${type.config.basePath}${type.config.paths.delete}`,
            type.config.key,
            model
        )

        /**
         * Send delete request to backend.
         * 
         * @returns {Promise}
         */
        model.delete = async () => await Model.delete(model.deletePath)

        model.forceDeletePath = Model.parsePath(
            `${type.config.basePath}${type.config.paths.forceDelete}`,
            type.config.key,
            model
        )

        /**
         * Send delete request to backend to
         * remove soft deleted resources from the database.
         * 
         * @returns {Promise}
         */
        model.forceDelete = async () => await Model.delete(model.forceDeletePath)

        model.restorePath = Model.parsePath(
            `${type.config.basePath}${type.config.paths.restore}`,
            type.config.key,
            model
        )

        /**
         * Send a request to restore a resource on the backend.
         * 
         * @returns {Promise}
         */
        model.restore = async () => await Model.restore(model.restorePath)
    }

    /**
     * Parse a path string.
     * Parts that are ':key' will be replaced
     * with the sprecified key of the model.
     * 
     * @param {string} template 
     * @param {string} key 
     * @param {Model} model 
     * @returns {string}
     */
    static parsePath(template, key, model) {
        const keyValue = model[key]

        return template.replace(':key', keyValue)
    }

    /**
     * Send PATCH request at path with
     * serialized model request.
     * Sync the model if needed. The default is true.
     * 
     * @param {string} path 
     * @param {object} model 
     * @param {boolean|true} sync 
     */
    static async update(path, model, sync = true) {
        const {data: { data }} = await axios.patch(path, model.toRequest())

        if (sync) {
            model.updateQueue.forEach(key => model[key](data))
            model.reset()
        }
    }

    /**
     * Create a new model of type 'type' on the database.
     * 
     * @param {object} request 
     * @param {object} type 
     * @returns {Promise}
     */
    static async create(request, type) {
        const { data: { data }} = await axios.post(
            `${type.config.basePath}${type.config.paths.create}`,
            request   
        )

        return new type(data)
    }

    /**
     * Get a model with key 'key' from
     * type 'type' from the database.
     * 
     * @param {string|number} key 
     * @param {object} type 
     * @returns {Promise}
     */
    static async get(key, type) {
        const path = Model.parsePath(
            `${type.config.basePath}${type.config.paths.get}`, 
            type.config.key,
            { [type.config.key]: key }
        )

        const { data: { data }} = await axios.get(path)

        return new type(data)
    }

    /**
     * Send a delete request to path.
     * 
     * @param {string} path 
     */
    static async delete(path) {
        await axios.delete(path)
    }

    /**
     * Request to restore a resource at path.
     * 
     * @param {string} path 
     */
    static async restore(path) {
        await axios.post(path)
    }
}