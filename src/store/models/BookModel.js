export default class BookModel {
    // TODO
    // добавить свойства "язык" и "год издания"
    constructor (title, author, genre, description, country, city, type, image, active, userId, userEmail, updatedAt, id = null) {
        this.title = title
        this.author = author
        this.genre = genre
        this.description = description
        this.country = country
        this.city = city
        this.type = type
        this.image = image
        this.active = active
        this.userId = userId
        this.userEmail = userEmail
        this.updatedAt = updatedAt
        this.id = id
    }
}