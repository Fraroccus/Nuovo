import { ItemService } from '../item.service'
import { prisma } from '../../prisma'

jest.mock('../../prisma', () => ({
  prisma: {
    item: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    shelf: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

describe('ItemService', () => {
  let itemService: ItemService

  beforeEach(() => {
    itemService = new ItemService()
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return all items with shelf and warehouse', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1', shelf: { warehouse: {} } },
        { id: '2', name: 'Item 2', shelf: { warehouse: {} } },
      ]

      ;(prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems)

      const result = await itemService.getAll()

      expect(result).toEqual(mockItems)
    })

    it('should filter by shelfId if provided', async () => {
      ;(prisma.item.findMany as jest.Mock).mockResolvedValue([])

      await itemService.getAll('s1')

      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: { shelfId: 's1' },
        include: { shelf: { include: { warehouse: true } } },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('getById', () => {
    it('should return an item with shelf and warehouse', async () => {
      const mockItem = {
        id: '1',
        name: 'Item 1',
        shelf: { warehouse: {} },
      }

      ;(prisma.item.findUnique as jest.Mock).mockResolvedValue(mockItem)

      const result = await itemService.getById('1')

      expect(result).toEqual(mockItem)
    })

    it('should throw error if item not found', async () => {
      ;(prisma.item.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(itemService.getById('999')).rejects.toThrow('Item not found')
    })
  })

  describe('getBySku', () => {
    it('should return an item by SKU', async () => {
      const mockItem = {
        id: '1',
        sku: 'SKU-001',
        shelf: { warehouse: {} },
      }

      ;(prisma.item.findUnique as jest.Mock).mockResolvedValue(mockItem)

      const result = await itemService.getBySku('SKU-001')

      expect(result).toEqual(mockItem)
      expect(prisma.item.findUnique).toHaveBeenCalledWith({
        where: { sku: 'SKU-001' },
        include: { shelf: { include: { warehouse: true } } },
      })
    })
  })

  describe('create', () => {
    it('should create a new item', async () => {
      const createData = {
        name: 'New Item',
        sku: 'SKU-001',
        quantity: 10,
        shelfId: 's1',
      }

      const mockShelf = {
        id: 's1',
        capacity: 100,
        items: [{ quantity: 20 }],
      }

      const mockCreated = { id: '1', ...createData, shelf: { warehouse: {} } }

      ;(prisma.shelf.findUnique as jest.Mock).mockResolvedValue(mockShelf)
      ;(prisma.item.create as jest.Mock).mockResolvedValue(mockCreated)

      const result = await itemService.create(createData)

      expect(result).toEqual(mockCreated)
    })

    it('should throw error if shelf not found', async () => {
      const createData = {
        name: 'New Item',
        sku: 'SKU-001',
        quantity: 10,
        shelfId: 's999',
      }

      ;(prisma.shelf.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(itemService.create(createData)).rejects.toThrow('Shelf not found')
    })

    it('should throw error if shelf capacity exceeded', async () => {
      const createData = {
        name: 'New Item',
        sku: 'SKU-001',
        quantity: 50,
        shelfId: 's1',
      }

      const mockShelf = {
        id: 's1',
        capacity: 100,
        items: [{ quantity: 60 }],
      }

      ;(prisma.shelf.findUnique as jest.Mock).mockResolvedValue(mockShelf)

      await expect(itemService.create(createData)).rejects.toThrow('Shelf capacity exceeded')
    })

    it('should throw error if SKU already exists', async () => {
      const createData = {
        name: 'New Item',
        sku: 'SKU-001',
        quantity: 10,
        shelfId: 's1',
      }

      const mockShelf = {
        id: 's1',
        capacity: 100,
        items: [],
      }

      ;(prisma.shelf.findUnique as jest.Mock).mockResolvedValue(mockShelf)
      ;(prisma.item.create as jest.Mock).mockRejectedValue({ code: 'P2002' })

      await expect(itemService.create(createData)).rejects.toThrow('Item with this SKU already exists')
    })
  })

  describe('update', () => {
    it('should update an existing item', async () => {
      const updateData = { name: 'Updated Item' }
      const mockUpdated = {
        id: '1',
        name: 'Updated Item',
        shelf: { warehouse: {} },
      }

      ;(prisma.item.update as jest.Mock).mockResolvedValue(mockUpdated)

      const result = await itemService.update('1', updateData)

      expect(result).toEqual(mockUpdated)
    })

    it('should validate shelf exists when updating shelfId', async () => {
      const updateData = { shelfId: 's2' }
      const mockShelf = { id: 's2' }

      ;(prisma.shelf.findUnique as jest.Mock).mockResolvedValue(mockShelf)
      ;(prisma.item.update as jest.Mock).mockResolvedValue({})

      await itemService.update('1', updateData)

      expect(prisma.shelf.findUnique).toHaveBeenCalledWith({ where: { id: 's2' } })
    })
  })

  describe('adjustQuantity', () => {
    it('should adjust item quantity within a transaction', async () => {
      const mockItem = {
        id: '1',
        quantity: 10,
        shelf: {
          capacity: 100,
          items: [
            { id: '1', quantity: 10 },
            { id: '2', quantity: 20 },
          ],
        },
      }

      const mockUpdated = { ...mockItem, quantity: 15 }

      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          item: {
            findUnique: jest.fn().mockResolvedValue(mockItem),
            update: jest.fn().mockResolvedValue(mockUpdated),
          },
        }
        return callback(tx)
      })

      const result = await itemService.adjustQuantity('1', 5)

      expect(result.quantity).toBe(15)
    })

    it('should throw error if quantity would be negative', async () => {
      const mockItem = {
        id: '1',
        quantity: 10,
        shelf: { capacity: 100, items: [] },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          item: {
            findUnique: jest.fn().mockResolvedValue(mockItem),
          },
        }
        return callback(tx)
      })

      await expect(itemService.adjustQuantity('1', -15)).rejects.toThrow('Quantity cannot be negative')
    })

    it('should throw error if shelf capacity exceeded', async () => {
      const mockItem = {
        id: '1',
        quantity: 10,
        shelf: {
          capacity: 50,
          items: [
            { id: '1', quantity: 10 },
            { id: '2', quantity: 30 },
          ],
        },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          item: {
            findUnique: jest.fn().mockResolvedValue(mockItem),
          },
        }
        return callback(tx)
      })

      await expect(itemService.adjustQuantity('1', 20)).rejects.toThrow('Shelf capacity exceeded')
    })
  })

  describe('moveItem', () => {
    it('should move entire item to another shelf', async () => {
      const mockItem = {
        id: '1',
        name: 'Item 1',
        sku: 'SKU-001',
        quantity: 10,
        shelf: { id: 's1' },
      }

      const mockTargetShelf = {
        id: 's2',
        capacity: 100,
        items: [{ quantity: 20 }],
      }

      const mockUpdated = { ...mockItem, shelfId: 's2' }

      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          item: {
            findUnique: jest.fn().mockResolvedValue(mockItem),
            findFirst: jest.fn().mockResolvedValue(null),
            update: jest.fn().mockResolvedValue(mockUpdated),
            create: jest.fn(),
          },
          shelf: {
            findUnique: jest.fn().mockResolvedValue(mockTargetShelf),
          },
        }
        return callback(tx)
      })

      const result = await itemService.moveItem('1', 's2')

      expect(result.shelfId).toBe('s2')
    })

    it('should throw error if target shelf not found', async () => {
      const mockItem = {
        id: '1',
        quantity: 10,
        shelf: { id: 's1' },
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          item: {
            findUnique: jest.fn().mockResolvedValue(mockItem),
          },
          shelf: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        }
        return callback(tx)
      })

      await expect(itemService.moveItem('1', 's999')).rejects.toThrow('Target shelf not found')
    })

    it('should throw error if target shelf capacity exceeded', async () => {
      const mockItem = {
        id: '1',
        quantity: 50,
        shelf: { id: 's1' },
      }

      const mockTargetShelf = {
        id: 's2',
        capacity: 100,
        items: [{ quantity: 60 }],
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          item: {
            findUnique: jest.fn().mockResolvedValue(mockItem),
          },
          shelf: {
            findUnique: jest.fn().mockResolvedValue(mockTargetShelf),
          },
        }
        return callback(tx)
      })

      await expect(itemService.moveItem('1', 's2')).rejects.toThrow('Target shelf capacity exceeded')
    })
  })
})
