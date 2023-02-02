export default {
    init: (models, collections) => {
        models.forEach(model => model.init())
        collections.forEach(collection => collection.init())
    }
}
