/* Тур обучающих подсказок */
export default class TourModel {
    constructor (name, index = 1, done = false, id = null) {
        this.name = name // название тура
        this.index = index // индекс последней просмотренной подсказки
        this.done = done // завершен ли просмотр всех подсказок тура
        this.id = id // уникальный ИД, равный ключу, под которым объект был сохранен в удаленном хранилище
    }
}