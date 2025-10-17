import { NextRequest } from 'next/server'
import { itemService } from '@/lib/services/item.service'
import { createItemSchema } from '@/lib/validations'
import { handleApiError, successResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shelfId = searchParams.get('shelfId')
    
    const items = await itemService.getAll(shelfId || undefined)
    return successResponse({ data: items })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createItemSchema.parse(body)
    const item = await itemService.create(validatedData)
    return successResponse({ data: item }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
