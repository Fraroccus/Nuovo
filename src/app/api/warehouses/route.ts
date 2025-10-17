import { NextRequest } from 'next/server'
import { warehouseService } from '@/lib/services/warehouse.service'
import { createWarehouseSchema } from '@/lib/validations'
import { handleApiError, successResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const warehouses = await warehouseService.getAll()
    return successResponse({ data: warehouses })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createWarehouseSchema.parse(body)
    const warehouse = await warehouseService.create(validatedData)
    return successResponse({ data: warehouse }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
