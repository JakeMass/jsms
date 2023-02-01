import { Model } from "./model"

export class Relation {
    static init(model, type, relations) {
        model.initRelations = {}
        model.related = {}

        Object.keys(type.relations).forEach(key => {
            model.initRelations[key] = relations[key]

            model.related[key] = type.relations[key].type === 'collection'
                ? new type.relations[key].value([], relations[key])
                : { [type.config.key]: relations[key] }
        })

        // Fetch a relation
        model.fetchRelation = async (name) => {
            if (type.relations[name].type === 'collection') {
                await model.related[name].fetch()
            } else {
                const key = model.related[name][type.config.key]

                model.related[name] = await Model.get(key, type.relations[name].value)
            }
        }

        // Fetch all relations
        model.fetchRelations = async (names = Object.keys(model.related)) => {
            names.forEach(async name => await model.fetchRelation(name))
        }

        // Update relation
        model.updateRelation = async (name, value, fetch = false) => {
            if (type.relations[name].type === 'collection') {
                model.related[name].keys = value
                model.related[name].keysToInit()
            } else {
                model.related[name][type.config.key] = value
            }

            fetch && await model.fetchRelation(name)
        }

        // Update relations
        model.updateQueue.push('updateRelations')
        model.updateRelations = async (data) => {
            Object.keys(type.relations).forEach(async name => {
                await model.updateRelation(name, data.relations[name], true)
            })
        }

        // Reset relations
        model.resetQueue.push('resetRelations')
        model.resetRelations = () => {
            Object.keys(type.relations).forEach(key => {
                model.related[key].reset()
            })
        }

        // Operations on collection keys
        model.hasRelation = (name, key) => {
            return model.related[name].keys.includes(key)
        }

        model.addRelation = (name, key) => {
            !model.hasRelation(name, key) && model.related[name].keys.push(key)
        }

        model.removeRelation = (name, key) => {
            model.related[name].keys = model.related[name].keys.filter(k => k !== key)
        }

        model.relationKeys = (name) => {
            return model.related[name].keys        
        }

        // Serialize relations.
        model.requestQueue.push('relationsToRequest')
        model.relationsToRequest = () => {
            let relations = {}

            Object.keys(model.related).forEach(key => {
                const related = model.related[key]
                const relation = type.relations[key]
  
                relations[key] = relation.type === 'collection' 
                    ? [...related.keys]
                    : related[relation.value.config.key]
            })

            return {
                name: 'relations',
                value: relations
            }
        }
    }
}