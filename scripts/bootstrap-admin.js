#!/usr/bin/env node

/**
 * One-time admin bootstrap.
 *
 * The only way to grant isAdmin through the app is an ADMIN-type invite,
 * which itself requires an existing admin to create (see
 * /api/invites/create). On a fresh database nobody is an admin yet, so
 * there's no way in through the UI at all. This script breaks that
 * deadlock exactly once: it refuses to run if any admin already exists,
 * so it can't be reused later as a backdoor - promote further admins
 * through the app's invite flow instead.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/bootstrap-admin.js you@example.com
 *
 * The account must already exist (sign up first, then run this).
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node scripts/bootstrap-admin.js <email>')
    process.exitCode = 1
    return
  }

  const adminCount = await prisma.user.count({ where: { isAdmin: true } })
  if (adminCount > 0) {
    console.error(
      `Refusing to run: ${adminCount} admin account(s) already exist. ` +
      `Ask an existing admin to send you an ADMIN-type invite instead.`
    )
    process.exitCode = 1
    return
  }

  const normalizedEmail = email.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (!user) {
    console.error(`No account found for ${normalizedEmail}. Sign up first, then run this script.`)
    process.exitCode = 1
    return
  }

  await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } })
  console.log(`${normalizedEmail} is now an admin.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
