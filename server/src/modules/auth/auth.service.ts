import bcrypt from "bcrypt"
import { prisma } from "../../lib/prisma"
import { signToken } from "../../lib/jwt"

export async function register(email: string, password: string) {
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new Error("User already exists")

  const hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, password: hash },
  })

  const token = signToken({ sub: user.id, email: user.email })

  return { token }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error("Invalid credentials")

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error("Invalid credentials")

  const token = signToken({ sub: user.id, email: user.email })

  return { token }
}
