import { createI18n } from "vue3-i18n"
import en from '../lang/en'
import ru from '../lang/ru'

const messages = { en, ru }

export const i18n = createI18n({
    locale: "en",
    messages: messages,
})