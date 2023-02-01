import { Collection } from "./collection"

export class Pagination {
    static init(collection, type) {
        collection.pagination = {
            page: 1,
            size: 12,
            lastPage: 2
        }

        collection.onLastPage = () => {
            return collection.pagination.page === collection.pagination.lastPage
        }

        collection.lastPage = () => {
            return collection.pagination.lastPage
        }

        collection.currentPage = () => {
            return collection.pagination.page
        }

        collection.onFirstPage = () => {
            return collection.pagination.page === 1
        }

        collection.fetchFirstPage = async () => {
            collection.pagination.page = 1

            const data = await Collection.fetch(type, {
                page: collection.pagination.page,
                size: collection.pagination.size
            }, true)

            collection.pagination.lastPage = data.meta.last_page

            collection.models = Collection.fromData(type.collects, data.data)
        }

        collection.fetchNextPage = async (offset = 1) => {
            collection.pagination.page += offset

            if (collection.pagination.page <= 0) {
                collection.pagination.page = 1
            }

            if (collection.pagination.page > collection.pagination.lastPage) {
                collection.pagination.page = collection.pagination.lastPage
            }

            const data = await Collection.fetch(type, {
                page: collection.pagination.page,
                size: collection.pagination.size
            }, true)

            collection.pagination.lastPage = data.meta.last_page

            collection.models = Collection.fromData(type.collects, data.data)
        }
    }
}