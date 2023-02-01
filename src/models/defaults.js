export const defaultConfig = {
    basePath: 'api/',
    key: 'id',
    paths: {
        create: '',
        update: '/:key',
        get: '/:key',
        delete: '/:key',
        forceDelete: '/:key/force',
        restore: '/:key/restore'
    }
}

export function defineConfig(config) {
    return {
        ...defaultConfig,
        ...config,
        paths: {
            ...defaultConfig.paths,
            ...config.paths ?? {}
        }
    }
}