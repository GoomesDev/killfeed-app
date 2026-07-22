export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    ME: '/me',
  },

  FEED: {
    INDEX: '/feed',
  },

  POSTS: {
    INDEX: '/posts',
    STORE: '/posts',
    SHOW: (id: number) => `/posts/${id}`,
    UPDATE: (id: number) => `/posts/${id}`,
    DELETE: (id: number) => `/posts/${id}`,
  },

  COMMENTS: {
    STORE: '/comments',
    DELETE: (id: number) => `/comments/${id}`,
  },

  PROFILES: {
    SHOW: (username: string) => `/profiles/${username}`,
  },

  NOTIFICATIONS: {
    INDEX: '/notifications',
  },
} as const;