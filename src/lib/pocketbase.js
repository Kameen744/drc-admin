import PocketBase from 'pocketbase'

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL)

export function initPocketBase() {
  const stored = localStorage.getItem('pb_auth')
  if (stored) {
    const authData = JSON.parse(stored)
    pb.authStore.save(authData.token, authData.user)
  }
}

export default pb
