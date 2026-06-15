import { ref } from 'vue'
import frDict from './fr.json'
import enDict from './en.json'

const STORAGE_KEY = 'prmt-lang'
const SUPPORTED = ['fr', 'en']
const DEFAULT = 'fr'
const FALLBACK = 'en'
const DICTS = { fr: frDict, en: enDict }

const currentLang = ref(DEFAULT)

function getLang() {
  return currentLang.value
}

function getDict(lang) {
  return DICTS[lang] || DICTS[FALLBACK]
}

function resolve(path, dict) {
  const parts = path.split('.')
  let value = dict
  for (let i = 0; i < parts.length; i++) {
    if (value == null) return undefined
    value = value[parts[i]]
  }
  return value
}

function resolveDictPath(path) {
  return resolve(path, getDict(currentLang.value))
}

function t(path) {
  let value = resolve(path, getDict(currentLang.value))
  if (value === undefined) {
    value = resolve(path, getDict(FALLBACK))
  }
  if (value === undefined) {
    console.warn('Missing i18n key: ' + path)
    return path
  }
  return value
}

function setLang(lang) {
  if (!SUPPORTED.includes(lang)) lang = DEFAULT
  if (lang === currentLang.value) return
  currentLang.value = lang
  try { localStorage.setItem(STORAGE_KEY, lang) } catch (_) {}
  document.documentElement.lang = lang
}

function initI18n() {
  let lang = DEFAULT
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED.includes(stored)) lang = stored
  } catch (_) {}
  setLang(lang)
}

export { t, setLang, getLang, initI18n, resolveDictPath, currentLang }
