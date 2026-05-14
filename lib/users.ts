export interface User {
  id: string
  name: string
  email: string
  password: string
  role: "BUYER" | "APPROVER" | "ADMIN"
}

export const users: User[] = [
  {
    id: "u-001",
    name: "Ana Rodríguez",
    email: "ana.rodriguez@visco.com",
    password: "demo1234",
    role: "BUYER",
  },
  {
    id: "u-002",
    name: "Carlos Rivas",
    email: "carlos.rivas@visco.com",
    password: "demo1234",
    role: "APPROVER",
  },
  {
    id: "u-003",
    name: "María González",
    email: "maria.gonzalez@visco.com",
    password: "demo1234",
    role: "BUYER",
  },
  {
    id: "u-004",
    name: "Luis Pérez",
    email: "luis.perez@visco.com",
    password: "demo1234",
    role: "BUYER",
  },
  {
    id: "u-005",
    name: "Administrador",
    email: "admin@visco.com",
    password: "admin1234",
    role: "ADMIN",
  },
]
