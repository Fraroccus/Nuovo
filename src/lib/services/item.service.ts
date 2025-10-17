import { prisma } from '../prisma'
import type { CreateItem, UpdateItem } from '../validations'

export class ItemService {
  async getAll(shelfId?: string) {
    return prisma.item.findMany({
      where: shelfId ? { shelfId } : undefined,
      include: {
        shelf: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getById(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        shelf: {
          include: {
            warehouse: true,
          },
        },
      },
    })

    if (!item) {
      throw new Error('Item not found')
    }

    return item
  }

  async getBySku(sku: string) {
    const item = await prisma.item.findUnique({
      where: { sku },
      include: {
        shelf: {
          include: {
            warehouse: true,
          },
        },
      },
    })

    if (!item) {
      throw new Error('Item not found')
    }

    return item
  }

  async create(data: CreateItem) {
    const shelf = await prisma.shelf.findUnique({
      where: { id: data.shelfId },
      include: { items: true },
    })

    if (!shelf) {
      throw new Error('Shelf not found')
    }

    const currentQuantity = shelf.items.reduce((sum, item) => sum + item.quantity, 0)
    
    if (currentQuantity + data.quantity > shelf.capacity) {
      throw new Error('Shelf capacity exceeded')
    }

    try {
      return await prisma.item.create({
        data,
        include: {
          shelf: {
            include: {
              warehouse: true,
            },
          },
        },
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Item with this SKU already exists')
      }
      throw error
    }
  }

  async update(id: string, data: UpdateItem) {
    if (data.shelfId) {
      const shelf = await prisma.shelf.findUnique({
        where: { id: data.shelfId },
      })

      if (!shelf) {
        throw new Error('Shelf not found')
      }
    }

    try {
      return await prisma.item.update({
        where: { id },
        data,
        include: {
          shelf: {
            include: {
              warehouse: true,
            },
          },
        },
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Item not found')
      }
      if (error.code === 'P2002') {
        throw new Error('Item with this SKU already exists')
      }
      throw error
    }
  }

  async delete(id: string) {
    try {
      return await prisma.item.delete({
        where: { id },
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new Error('Item not found')
      }
      throw error
    }
  }

  async adjustQuantity(id: string, adjustment: number) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
        where: { id },
        include: {
          shelf: {
            include: {
              items: true,
            },
          },
        },
      })

      if (!item) {
        throw new Error('Item not found')
      }

      const newQuantity = item.quantity + adjustment

      if (newQuantity < 0) {
        throw new Error('Quantity cannot be negative')
      }

      const otherItemsQuantity = item.shelf.items
        .filter((i) => i.id !== id)
        .reduce((sum, i) => sum + i.quantity, 0)
      
      if (otherItemsQuantity + newQuantity > item.shelf.capacity) {
        throw new Error('Shelf capacity exceeded')
      }

      return tx.item.update({
        where: { id },
        data: {
          quantity: newQuantity,
        },
        include: {
          shelf: {
            include: {
              warehouse: true,
            },
          },
        },
      })
    })
  }

  async moveItem(id: string, targetShelfId: string, quantity?: number) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({
        where: { id },
        include: {
          shelf: true,
        },
      })

      if (!item) {
        throw new Error('Item not found')
      }

      const targetShelf = await tx.shelf.findUnique({
        where: { id: targetShelfId },
        include: { items: true },
      })

      if (!targetShelf) {
        throw new Error('Target shelf not found')
      }

      const moveQuantity = quantity ?? item.quantity

      if (moveQuantity > item.quantity) {
        throw new Error('Cannot move more than available quantity')
      }

      if (moveQuantity <= 0) {
        throw new Error('Move quantity must be positive')
      }

      const targetShelfCurrentQuantity = targetShelf.items.reduce(
        (sum, i) => sum + i.quantity,
        0
      )

      if (targetShelfCurrentQuantity + moveQuantity > targetShelf.capacity) {
        throw new Error('Target shelf capacity exceeded')
      }

      if (moveQuantity === item.quantity) {
        return tx.item.update({
          where: { id },
          data: {
            shelfId: targetShelfId,
          },
          include: {
            shelf: {
              include: {
                warehouse: true,
              },
            },
          },
        })
      } else {
        await tx.item.update({
          where: { id },
          data: {
            quantity: item.quantity - moveQuantity,
          },
        })

        const existingItemOnTarget = await tx.item.findFirst({
          where: {
            shelfId: targetShelfId,
            sku: item.sku,
          },
        })

        if (existingItemOnTarget) {
          return tx.item.update({
            where: { id: existingItemOnTarget.id },
            data: {
              quantity: existingItemOnTarget.quantity + moveQuantity,
            },
            include: {
              shelf: {
                include: {
                  warehouse: true,
                },
              },
            },
          })
        } else {
          return tx.item.create({
            data: {
              name: item.name,
              sku: `${item.sku}-split-${Date.now()}`,
              quantity: moveQuantity,
              description: item.description,
              shelfId: targetShelfId,
            },
            include: {
              shelf: {
                include: {
                  warehouse: true,
                },
              },
            },
          })
        }
      }
    })
  }
}

export const itemService = new ItemService()
