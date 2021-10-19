export default class RequestModel {
  constructor (bookId, userEmail, bookName = null, userId = null, createdAt = null, id = null) {
    // параметры отправки запроса на сервер
    this.bookId = bookId
    this.userEmail = userEmail
    // дополнительные параметры получения клиентом данных о запросе
    this.bookName = bookName
    this.userId = userId
    // дополнительные параметры, которые генерирует БД при вставке новой строки
    this.createdAt = createdAt
    this.id = id
  }
}