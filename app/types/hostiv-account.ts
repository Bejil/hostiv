export type HostivAccountProfile = {
  email: string
  first_name: string
  last_name: string
  full_name: string
}

export type HostivAccountUpdateBody = {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
}

export type HostivAccountDeleteBody = {
  confirm_slug: string
}
