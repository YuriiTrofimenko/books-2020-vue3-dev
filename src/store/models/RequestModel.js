export default class RequestModel {
    constructor (bookId, userEmail, createdAt = null, id = null) {
        this.bookId = bookId
        this.userEmail = userEmail
        this.createdAt = createdAt
        this.id = id
    }
}