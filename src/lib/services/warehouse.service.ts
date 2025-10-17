import { prisma } from '../prisma'
import type { CreateWarehouse, UpdateWarehouse } from '../validations'

export class WarehouseService {
  async getAll() {
    return prisma.warehouse.findMany({
      include: {
        shelves: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getById(id: string) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        shelves: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!warehouse) {
      throw new Error('Warehouse not found')
    }

    return warehouse
  }

  async create(data: CreateWarehouse) {
    return prisma.warehouse.create({
      data,
      include: {
        shelves: true,
      },
    })
  }

  async update(id: string, data: UpdateWarehouse) {
    try {
      return await prisma.warehouse.update({
        where: { id },
        data,
        include: {
          shelves: true,
        },
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Warehouse not found')
      }
      throw error
    }
  }

  async delete(id: string) {
    try {
      return await prisma.warehouse.delete({
        where: { id },
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Warehouse not found')
      }
      throw error
    }
  }

  async getStatistics(id: string) {
    const warehouse = await this.getById(id)
    
    const totalShelves = warehouse.shelves.length
    const totalItems = warehouse.shelves.reduce(
      (acc, shelf) => acc + shelf.items.length,
      0
    )
    const totalQuantity = warehouse.shelves.reduce(
      (acc, shelf) =>
        acc + shelf.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    )

    return {
      id: warehouse.id,
      name: warehouse.name,
      totalShelves,
      totalItems,
      totalQuantity,
      capacity: warehouse.capacity,
      utilizationPercentage: warehouse.capacity > 0 
        ? (totalQuantity / warehouse.capacity) * 100 
        : 0,
    }
  }
}

export const warehouseService = new WarehouseService()
