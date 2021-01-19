export default class LanguageModel {
    constructor (name, localeKey, flagKey, priority, id = null) {
        this.name = name
        this.localeKey = localeKey
        this.flagKey = flagKey
        this.priority = priority
        this.id = id
    }
}