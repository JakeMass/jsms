import axios from "axios"

/**
 * The Collection-class is mostly a wrapper
 * around an array holding objects, that implementet 
 * the Model trait.
 * It holds some usefull funtionality regarding 
 * fetching and updating multiple models.
 * 
 * @namespace
 */
export class Collection {

    /**
     * Implement and initialize the collection trait. 
     * 
     * @param {Collection.Trait} collection 
     * @param {class} type 
     * @param {Array} entries 
     * @param {Array} keys 
     * 
     * @memberof Collection
     */
    static init(collection, type, entries = [], keys = []) {
        /**
         * @namespace Collection.Trait
         */

        /**
         * Define models as array.
         * 
         * @memberof Collection.Trait
         * @prop {Array} models
         */
        collection.models = entries

        /**
         * The initial keys used to reset the model.
         * 
         * @memberof Collection.Trait
         * @prop {Array} initKeys
         */
        collection.initKeys = [ ...keys ]

        /**
         * The keys that can be changed and resettet.
         * 
         * @memberof Collection.Trait
         * @prop {Array} keys
         */
        collection.keys = keys

        /**
         * Reset the collection keys and models.
         * 
         * @memberof Collection.Trait
         * @function reset
         */
        collection.reset = () => {
            collection.keys = [ ...collection.initKeys ]
            collection.models = entries
        }

        /**
         * Generate the query filter.
         * 
         * @memberof Collection.Trait
         * @function query
         * @returns {object}
         */
        collection.query = () => {
            return {
              whereIn: `${type.config.key}:${collection.keys.join(',')}`  
            } 
        }

        /**
         * Iterator.
         * 
         * @memberof Collection.Trait
         * @generator
         */
        collection[Symbol.iterator] = function* () {
            for (let i = 0; i < collection.models.length; i++) {
                yield collection.models[i]
            }
        }

        /**
         * Push a model to models.
         * 
         * @memberof Collection.Trait
         * @function push
         * @param {Model.Trait} value 
         */
        collection.push = (value) => collection.models.push(value)

        /**
         * Wrapper for Array.filter method.
         * 
         * @memberof Collection.Trait
         * @function filter
         * @param {Function} callback 
         * @returns {Collection.Trait}
         */
        collection.filter = (callback) => {
            const entries = collection.models.filter(callback)

            return new type(entries)
        }

        /**
         * Wrapper for Array.map method.
         * 
         * @memberof Collection.Trait
         * @function map
         * @param {Function} callback 
         * @returns {Array}
         */
        collection.map = (callback) => {
            return collection.models.map(callback)
        }

        /**
         * Wrapper for Array.forEach method.
         * 
         * @memberof Collection.Trait
         * @function forEach
         * @param {Funtion} callback 
         */
        collection.forEach = (callback) => {
            collection.models.forEach(callback)
        }

        /**
         * Check wether a model exists which value
         * at key matches the value parameter.
         * 
         * @memberof Collection.Trait
         * @function includes
         * @param {*} value 
         * @param {string} key 
         * @returns {boolean}
         */
        collection.includes = (value, key = type.config.key) => {
            for (let model of collection.models) {
                if (model[key] === value) {
                    return true
                }
            }

            return false
        }

        /**
         * Wrapper for Array.find method.
         * 
         * @memberof Collection.Trait
         * @function find
         * @param {Function} callback 
         * @returns {Model.Trait}
         */
        collection.find = (callback) => {
            return collection.models.find(callback)
        }

        /**
         * Write the temporary keys to initKeys.
         * 
         * @memberof Collection.Trait
         * @function keysToInit
         */
        collection.keysToInit = () => {
            collection.initKeys = [ ...collection.keys ]
        }

        /**
         * Generate the keys from the entries in models.
         * 
         * @memberof Collection.Trait
         * @function keysFromModels
         */
        collection.keysFromModels = () => {
            collection.keys = collection.map(model => model[type.config.key])
        }

        /**
         * Fetch and fill the models.
         * 
         * @memberof Collection.Trait
         * @function fetch
         * @param {object} params 
         */
        collection.fetch = async (params = collection.query()) => {
            const entries = await Collection.fetch(type, params)

            collection.models = entries
        } 
    }

    /**
     * Fetch a collection from type 'type.collects'.
     * Set raw to true if you want to return 
     * the raw data from the response instead 
     * of building a collection with model-entries.
     * 
     * @param {Model.Trait} type 
     * @param {object} params 
     * @param {boolean} raw 
     * @returns {object}
     */
    static async fetch(type, params = {}, raw = false) {
        const { data: { data, meta }} = await axios.get(type.config.basePath, { params })

        return raw ? { data, meta } : Collection.fromData(type.collects, data)
    }

    /**
     * Generate an array of model-entries
     * from raw data from the backend.
     * 
     * @param {Model.Trait} type 
     * @param {object} data 
     * @returns {Array}
     */
    static fromData(type, data) {
        return data.map(entry => new type(entry))
    }
}