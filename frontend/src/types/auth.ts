export type User = {
  id: string
  username: string
  email: string
}

export type AuthResponse = {
  token: string
  user: User
}

export type LoginPayload = {
  username: string
  password: string
}

export type RegisterPayload = {
  username: string
  email: string
  password: string
}
