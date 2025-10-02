import { zxcvbn, zxcvbnOptions, ZxcvbnResult } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import * as zxcvbnFrPackage from '@zxcvbn-ts/language-fr'

type SupportedLanguage = 'en' | 'fr'

const languages = {
  en: zxcvbnEnPackage,
  fr: zxcvbnFrPackage,
}

let currentLanguage: SupportedLanguage | null = null

export function setupZxcvbn(language: SupportedLanguage = 'en') {
    
  if (currentLanguage === language) return

  const options = {
    translations: languages[language].translations,
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...languages[language].dictionary,
    },
  }
  
  zxcvbnOptions.setOptions(options)
  currentLanguage = language
}

export function checkPasswordStrength(password: string): ZxcvbnResult {
  return zxcvbn(password)
}

export function getStrengthLabel(score: number, language: SupportedLanguage = 'en'): string {
  const labels = {
    en: ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'],
    fr: ['Très Faible', 'Faible', 'Moyen', 'Fort', 'Très Fort'],
  }
  
  return labels[language][score]
}