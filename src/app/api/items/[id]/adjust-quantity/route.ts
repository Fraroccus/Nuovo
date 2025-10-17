import { NextRequest } from 'next/server'
import { itemService } from '@/lib/services/item.service'
import { adjustItemQuantitySchema } from '@/lib/validations'
import { handleApiError, successResponse } from '@/lib/api-utils'

type Params = {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { adjustment } = adjustItemQuantitySchema.parse(body)
    const item = await itemService.adjustQuantity(params.id, adjustment)
    return successResponse({ data: item })
  } catch (error) {
    return handleApiError(error)
  }
}
