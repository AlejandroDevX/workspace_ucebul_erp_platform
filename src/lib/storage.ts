const ACCESS_TOKEN_KEY = 'ucebul.erp.access-token'

export const authStorage = {
  getToken() {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  setToken(token: string) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
  },
  clearToken() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  },
}
