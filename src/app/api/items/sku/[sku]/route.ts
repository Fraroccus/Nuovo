import { NextRequest } from 'next/server'
import { itemService } from '@/lib/services/item.service'
import { handleApiError, successResponse } from '@/lib/api-utils'

type Params = {
  params: {
    sku: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const item = await itemService.getBySku(params.sku)
    return successResponse({ data: item })
  } catch (error) {
    return handleApiError(error)
  }
}
