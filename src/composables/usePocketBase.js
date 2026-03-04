import { ref } from 'vue'
import pb from '@/lib/pocketbase'
import { useToast } from './useToast'

export function usePocketBase() {
  const { showError } = useToast()
  const loading = ref(false)
  const error = ref(null)

  async function fetchRecords(collection, options = {}) {
    loading.value = true
    error.value = null
    try {
      const result = await pb.collection(collection).getList(options.page, options.perPage, {
        expand: options.expand || '',
        filter: options.filter || '',
        sort: options.sort || ''
      })
      return result
    } catch (err) {
      error.value = err.message
      showError('Failed to load data. Please try again')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateRecord(collection, id, data) {
    loading.value = true
    error.value = null
    try {
      const result = await pb.collection(collection).update(id, data)
      return result
    } catch (err) {
      error.value = err.message
      showError('Failed to update record. Please try again')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchOneRecord(collection, id, expand = '') {
    loading.value = true
    error.value = null
    try {
      const result = await pb.collection(collection).getOne(id, {
        expand: expand
      })
      return result
    } catch (err) {
      error.value = err.message
      showError('Failed to load record. Please try again')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchRecords,
    updateRecord,
    fetchOneRecord
  }
}
