import { NextRequest } from 'next/server'
import { itemService } from '@/lib/services/item.service'
import { moveItemSchema } from '@/lib/validations'
import { handleApiError, successResponse } from '@/lib/api-utils'

type Params = {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { targetShelfId, quantity } = moveItemSchema.parse(body)
    const item = await itemService.moveItem(params.id, targetShelfId, quantity)
    return successResponse({ data: item })
  } catch (error) {
    return handleApiError(error)
  }
}
