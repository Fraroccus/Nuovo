import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors,
      },
      { status: 400 }
    )
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    const statusCode = error.message.includes('not found') ? 404 : 500
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: statusCode }
    )
  }

  return NextResponse.json(
    {
      error: 'Internal server error',
    },
    { status: 500 }
  )
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}
