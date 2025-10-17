import { prisma } from '../prisma'
import type { CreateShelf, UpdateShelf } from '../validations'

export class ShelfService {
  async getAll(warehouseId?: string) {
    return prisma.shelf.findMany({
      where: warehouseId ? { warehouseId } : undefined,
      include: {
        warehouse: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getById(id: string) {
    const shelf = await prisma.shelf.findUnique({
      where: { id },
      include: {
        warehouse: true,
        items: true,
      },
    })

    if (!shelf) {
      throw new Error('Shelf not found')
    }

    return shelf
  }

  async create(data: CreateShelf) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: data.warehouseId },
    })

    if (!warehouse) {
      throw new Error('Warehouse not found')
    }

    return prisma.shelf.create({
      data,
      include: {
        warehouse: true,
        items: true,
      },
    })
  }

  async update(id: string, data: UpdateShelf) {
    if (data.warehouseId) {
      const warehouse = await prisma.warehouse.findUnique({
        where: { id: data.warehouseId },
      })

      if (!warehouse) {
        throw new Error('Warehouse not found')
      }
    }

    try {
      return await prisma.shelf.update({
        where: { id },
        data,
        include: {
          warehouse: true,
          items: true,
        },
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Shelf not found')
      }
      throw error
    }
  }

  async delete(id: string) {
    try {
      return await prisma.shelf.delete({
        where: { id },
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Shelf not found')
      }
      throw error
    }
  }

  async clearShelf(id: string) {
    return prisma.$transaction(async (tx) => {
      const shelf = await tx.shelf.findUnique({
        where: { id },
        include: { items: true },
      })

      if (!shelf) {
        throw new Error('Shelf not found')
      }

      await tx.item.deleteMany({
        where: { shelfId: id },
      })

      return {
        shelfId: id,
        deletedItemsCount: shelf.items.length,
      }
    })
  }

  async getStatistics(id: string) {
    const shelf = await this.getById(id)

    const totalItems = shelf.items.length
    const totalQuantity = shelf.items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      id: shelf.id,
      name: shelf.name,
      warehouseId: shelf.warehouseId,
      totalItems,
      totalQuantity,
      capacity: shelf.capacity,
      utilizationPercentage: shelf.capacity > 0 
        ? (totalQuantity / shelf.capacity) * 100 
        : 0,
    }
  }
}

export const shelfService = new ShelfService()
