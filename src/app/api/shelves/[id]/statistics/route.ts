import { NextRequest } from 'next/server'
import { shelfService } from '@/lib/services/shelf.service'
import { handleApiError, successResponse } from '@/lib/api-utils'

type Params = {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const statistics = await shelfService.getStatistics(params.id)
    return successResponse({ data: statistics })
  } catch (error) {
    return handleApiError(error)
  }
}
