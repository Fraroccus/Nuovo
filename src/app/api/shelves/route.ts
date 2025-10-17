import { NextRequest } from 'next/server'
import { shelfService } from '@/lib/services/shelf.service'
import { createShelfSchema } from '@/lib/validations'
import { handleApiError, successResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const warehouseId = searchParams.get('warehouseId')
    
    const shelves = await shelfService.getAll(warehouseId || undefined)
    return successResponse({ data: shelves })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createShelfSchema.parse(body)
    const shelf = await shelfService.create(validatedData)
    return successResponse({ data: shelf }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
