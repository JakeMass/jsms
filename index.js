import { defineConfig as modelConfig } from './src/models/defaults'

export const JSMS = {
    init: (models, collections) => {
        models.forEach(model => model.init())
        collections.forEach(collection => collection.init())
    }
}

export function defineModelConfig(config) {
    return modelConfig(config)
}
