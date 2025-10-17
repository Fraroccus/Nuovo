import { NextRequest } from 'next/server'
import { warehouseService } from '@/lib/services/warehouse.service'
import { updateWarehouseSchema } from '@/lib/validations'
import { handleApiError, successResponse } from '@/lib/api-utils'

type Params = {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const warehouse = await warehouseService.getById(params.id)
    return successResponse({ data: warehouse })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const validatedData = updateWarehouseSchema.parse(body)
    const warehouse = await warehouseService.update(params.id, validatedData)
    return successResponse({ data: warehouse })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await warehouseService.delete(params.id)
    return successResponse({ message: 'Warehouse deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
