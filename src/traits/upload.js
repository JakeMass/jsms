import axios from "axios";

export class Upload {
    static uploadPath = '/api/upload'

    static init(model, type) {
        model.file = null
    }

    static async upload(file, uploadPath = Upload.uploadPath) {
        let remotePath = '';

        for (const chunk of Upload.slice(file)) {
            let request = new FormData;

            request.append('file', chunk)

            remotePath.length && request.append('path', remotePath)

            remotePath = Upload.sendChunk(request, uploadPath)
        }

        return remotePath
    }

    static async sendChunk(request, uploadPath = Upload.uploadPath) {
        const { data: { path }} = await axios.post(uploadPath, request, { headers: {
            "Content-Type": "multipart/form-data",
        }})

        return path
    }

    static async *uploadProgess(file, uploadPath = Upload.uploadPath) {
        let remotePath = ''
        let progress = 0

        for (const chunk of Upload.slice(file)) {
            let request = new FormData;

            request.append('file', chunk)

            remotePath.length && request.append('path', remotePath)

            remotePath = await Upload.sendChunk(request, uploadPath)

            progress += Number((chunk.size / file.size).toFixed(2))

            yield { remotePath, progress }
        }

        yield { remotePath, progress: 1.0 }
    }

    static *slice(file, chunkSize = 512 * 1024) {
        let start = 0;

        while(start <= file.size) {
            let end = Math.min(start + chunkSize, file.size)

            yield file.slice(start, end)

            start += chunkSize
        }
    }
}
