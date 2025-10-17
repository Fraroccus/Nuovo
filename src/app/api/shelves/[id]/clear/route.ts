import { NextRequest } from 'next/server'
import { shelfService } from '@/lib/services/shelf.service'
import { handleApiError, successResponse } from '@/lib/api-utils'

type Params = {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const result = await shelfService.clearShelf(params.id)
    return successResponse({ data: result })
  } catch (error) {
    return handleApiError(error)
  }
}
