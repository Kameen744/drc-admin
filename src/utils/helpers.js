import { format } from 'date-fns'
import { t } from '@/i18n'

export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'dd/MM/yyyy')
}

export function formatArray(arr) {
  if (!arr) return []

  // If it's already an array, return it
  if (Array.isArray(arr)) return arr

  // If it's a string, split by comma and trim whitespace
  if (typeof arr === 'string') {
    return arr.split(',').map(item => item.trim()).filter(Boolean)
  }

  return []
}

// Extract values from an array of objects by key
// e.g. extractFromArray([{territory: "Gwadabawa"}, {territory: "Michika"}], "territory") => ["Gwadabawa", "Michika"]
export function extractFromArray(arr, key) {
  if (!arr || !Array.isArray(arr)) return []
  return arr.map(item => item?.[key]).filter(Boolean)
}

export function getRelationName(relation) {
  if (Array.isArray(relation)) {
    return relation.map(r => r?.name).filter(Boolean).join(', ') || 'N/A'
  }
  return relation?.name || 'N/A'
}

export function getBadgeClass(status) {
  return status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
}

export function getStatusText(status) {
  return status ? t('table.approved') : t('table.pending')
}

export function extractProgramAreaNames(obj) {
  if (!obj || typeof obj !== 'object') return []
  return Object.keys(obj).filter(k => k !== '_funding')
}

export function formatCurrency(amount) {
  if (amount == null || isNaN(Number(amount))) return 'N/A'
  return '$' + Number(amount).toLocaleString()
}

export function calculateFundingProgress(funding) {
  if (!funding || !funding.amount || !funding.disbursed) return 0
  return Math.min(100, Math.round((funding.disbursed / funding.amount) * 100))
}
