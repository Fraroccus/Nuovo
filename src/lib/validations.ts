import { z } from 'zod'

export const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().int().positive('Capacity must be positive'),
})

export const updateWarehouseSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
})

export const createShelfSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().int().positive('Capacity must be positive'),
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
})

export const updateShelfSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  capacity: z.number().int().positive('Capacity must be positive').optional(),
  warehouseId: z.string().min(1, 'Warehouse ID is required').optional(),
})

export const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  description: z.string().optional(),
  shelfId: z.string().min(1, 'Shelf ID is required'),
})

export const updateItemSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
  quantity: z.number().int().min(0, 'Quantity cannot be negative').optional(),
  description: z.string().optional().nullable(),
  shelfId: z.string().min(1, 'Shelf ID is required').optional(),
})

export const adjustItemQuantitySchema = z.object({
  adjustment: z.number().int(),
})

export const moveItemSchema = z.object({
  targetShelfId: z.string().min(1, 'Target shelf ID is required'),
  quantity: z.number().int().positive('Quantity must be positive').optional(),
})

export type CreateWarehouse = z.infer<typeof createWarehouseSchema>
export type UpdateWarehouse = z.infer<typeof updateWarehouseSchema>
export type CreateShelf = z.infer<typeof createShelfSchema>
export type UpdateShelf = z.infer<typeof updateShelfSchema>
export type CreateItem = z.infer<typeof createItemSchema>
export type UpdateItem = z.infer<typeof updateItemSchema>
export type AdjustItemQuantity = z.infer<typeof adjustItemQuantitySchema>
export type MoveItem = z.infer<typeof moveItemSchema>
