export default class BookModel {
    constructor (title, author, genre, publisher, volumeOrIssue, description, country, city, type, language, publicationDate, image, active, userId, userEmail, updatedAt, id = null) {
        this.title = title
        this.author = author
        this.genre = genre
        this.publisher = publisher
        this.volumeOrIssue = volumeOrIssue
        this.description = description
        this.country = country
        this.city = city
        this.type = type
        this.language = language
        this.publicationDate = publicationDate
        this.image = image
        this.active = active
        this.userId = userId
        this.userEmail = userEmail
        this.updatedAt = updatedAt
        this.id = id
    }
}