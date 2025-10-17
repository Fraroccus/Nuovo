import { NextRequest } from 'next/server'
import { shelfService } from '@/lib/services/shelf.service'
import { updateShelfSchema } from '@/lib/validations'
import { handleApiError, successResponse } from '@/lib/api-utils'

type Params = {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const shelf = await shelfService.getById(params.id)
    return successResponse({ data: shelf })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const validatedData = updateShelfSchema.parse(body)
    const shelf = await shelfService.update(params.id, validatedData)
    return successResponse({ data: shelf })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await shelfService.delete(params.id)
    return successResponse({ message: 'Shelf deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
