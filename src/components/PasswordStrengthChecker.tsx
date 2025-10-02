'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect } from 'react'
import { setupZxcvbn, checkPasswordStrength, getStrengthLabel } from '@/lib/password-strength'
import type { ZxcvbnResult } from '@zxcvbn-ts/core'

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState<string>("")
  const [result, setResult] = useState<ZxcvbnResult | null>(null)
  
  const t = useTranslations('passChecker')
  const locale = useLocale() // 'en' or 'fr'

  useEffect(() => {
    const lang = locale.startsWith('fr') ? 'fr' : 'en'
    setupZxcvbn(lang)
  }, [locale])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setPassword(val)
    setResult(val ? checkPasswordStrength(val) : null)
  }

  const getScoreColor = (score: number): string => {
    const colors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-lime-600', 'text-green-600']
    return colors[score] || 'text-gray-600'
  }

  const getProgressWidth = (score: number): string => {
    return `${(score + 1) * 20}%`
  }

  const getProgressColor = (score: number): string => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
    return colors[score] || 'bg-gray-500'
  }

  const lang = locale.startsWith('fr') ? 'fr' : 'en'

  return (
    <div className="p-4 max-w-md border rounded-lg">
      <label className="block mb-2 font-semibold">{t('password')} :</label>
      <input
        type="password"
        value={password}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder={t('typePassword')}
      />

      {result && (
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(result.score)}`}
              style={{ width: getProgressWidth(result.score) }}
            />
          </div>

          <div className={`font-semibold ${getScoreColor(result.score)}`}>
            {t('score')} : {result.score} / 4 - {getStrengthLabel(result.score, lang)}
          </div>

          {result.feedback.warning && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ⚠️ {result.feedback.warning}
            </div>
          )}

          {result.feedback.suggestions.length > 0 && (
            <div className="mt-2">
              <strong className="text-sm text-gray-700">{t('suggestions') || 'Suggestions'} :</strong>
              <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                {result.feedback.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {result.crackTimesDisplay && (
            <div className="mt-2 text-xs text-gray-500">
              {t('crackTime') || 'Temps de cassage'} : {result.crackTimesDisplay.offlineSlowHashing1e4PerSecond}
            </div>
          )}
        </div>
      )}
    </div>
  )
}