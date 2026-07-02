import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const signUpSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const SALT_ROUNDS = 10

async function generateUniqueUsername(email: string) {
  const base = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() || 'user'

  let username = base
  let suffix = 0

  // Bounded retry loop: falls back to a random suffix if the sequential
  // attempts are exhausted, so this can never loop forever.
  while (suffix < 25) {
    const existing = await prisma.user.findUnique({ where: { username } })
    if (!existing) return username
    suffix += 1
    username = `${base}${suffix}`
  }

  return `${base}${Date.now().toString(36)}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = signUpSchema.parse(body)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const username = await generateUniqueUsername(email)
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        name: name || email.split('@')[0],
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        isCreator: true,
        isVerified: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, user }, { status: 201 })

  } catch (error) {
    console.error('Signup failed:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
