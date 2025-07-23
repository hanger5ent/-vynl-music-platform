import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().nonnegative('Invalid price'),
  stock: z.number().int().nonnegative('Invalid stock quantity'),
  images: z.array(z.string().url()).optional(),
  category: z.enum(['MERCHANDISE', 'VINYL', 'CD', 'DIGITAL', 'APPAREL', 'ACCESSORIES', 'TICKETS', 'OTHER']),
  tags: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, price, stock, images, category, tags } = createProductSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        images: images || [],
        category,
        tags: tags || [],
        sellerId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      product,
    })

  } catch (error) {
    console.error('Error creating product:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
