import { NextRequest } from 'next/server'
import { warehouseService } from '@/lib/services/warehouse.service'
import { handleApiError, successResponse } from '@/lib/api-utils'

type Params = {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const statistics = await warehouseService.getStatistics(params.id)
    return successResponse({ data: statistics })
  } catch (error) {
    return handleApiError(error)
  }
}
