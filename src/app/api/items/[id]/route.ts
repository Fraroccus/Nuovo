import { NextRequest } from 'next/server'
import { itemService } from '@/lib/services/item.service'
import { updateItemSchema } from '@/lib/validations'
import { handleApiError, successResponse } from '@/lib/api-utils'

type Params = {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const item = await itemService.getById(params.id)
    return successResponse({ data: item })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const validatedData = updateItemSchema.parse(body)
    const item = await itemService.update(params.id, validatedData)
    return successResponse({ data: item })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await itemService.delete(params.id)
    return successResponse({ message: 'Item deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
