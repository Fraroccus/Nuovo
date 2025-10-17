import { ShelfService } from '../shelf.service'
import { prisma } from '../../prisma'

jest.mock('../../prisma', () => ({
  prisma: {
    shelf: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    warehouse: {
      findUnique: jest.fn(),
    },
    item: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

describe('ShelfService', () => {
  let shelfService: ShelfService

  beforeEach(() => {
    shelfService = new ShelfService()
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return all shelves with warehouse and items', async () => {
      const mockShelves = [
        { id: '1', name: 'Shelf 1', warehouse: {}, items: [] },
        { id: '2', name: 'Shelf 2', warehouse: {}, items: [] },
      ]

      ;(prisma.shelf.findMany as jest.Mock).mockResolvedValue(mockShelves)

      const result = await shelfService.getAll()

      expect(result).toEqual(mockShelves)
      expect(prisma.shelf.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { warehouse: true, items: true },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('should filter by warehouseId if provided', async () => {
      const mockShelves = [{ id: '1', name: 'Shelf 1', warehouseId: 'w1' }]

      ;(prisma.shelf.findMany as jest.Mock).mockResolvedValue(mockShelves)

      await shelfService.getAll('w1')

      expect(prisma.shelf.findMany).toHaveBeenCalledWith({
        where: { warehouseId: 'w1' },
        include: { warehouse: true, items: true },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('getById', () => {
    it('should return a shelf with warehouse and items', async () => {
      const mockShelf = {
        id: '1',
        name: 'Shelf 1',
        warehouse: { id: 'w1', name: 'Warehouse 1' },
        items: [],
      }

      ;(prisma.shelf.findUnique as jest.Mock).mockResolvedValue(mockShelf)

      const result = await shelfService.getById('1')

      expect(result).toEqual(mockShelf)
    })

    it('should throw error if shelf not found', async () => {
      ;(prisma.shelf.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(shelfService.getById('999')).rejects.toThrow('Shelf not found')
    })
  })

  describe('create', () => {
    it('should create a new shelf', async () => {
      const createData = {
        name: 'New Shelf',
        location: 'A1',
        capacity: 100,
        warehouseId: 'w1',
      }

      const mockWarehouse = { id: 'w1', name: 'Warehouse 1' }
      const mockCreated = { id: '1', ...createData, warehouse: mockWarehouse, items: [] }

      ;(prisma.warehouse.findUnique as jest.Mock).mockResolvedValue(mockWarehouse)
      ;(prisma.shelf.create as jest.Mock).mockResolvedValue(mockCreated)

      const result = await shelfService.create(createData)

      expect(result).toEqual(mockCreated)
      expect(prisma.warehouse.findUnique).toHaveBeenCalledWith({ where: { id: 'w1' } })
    })

    it('should throw error if warehouse not found', async () => {
      const createData = {
        name: 'New Shelf',
        location: 'A1',
        capacity: 100,
        warehouseId: 'w999',
      }

      ;(prisma.warehouse.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(shelfService.create(createData)).rejects.toThrow('Warehouse not found')
    })
  })

  describe('update', () => {
    it('should update an existing shelf', async () => {
      const updateData = { name: 'Updated Shelf' }
      const mockUpdated = {
        id: '1',
        name: 'Updated Shelf',
        location: 'A1',
        capacity: 100,
        warehouseId: 'w1',
      }

      ;(prisma.shelf.update as jest.Mock).mockResolvedValue(mockUpdated)

      const result = await shelfService.update('1', updateData)

      expect(result).toEqual(mockUpdated)
    })

    it('should validate warehouse exists when updating warehouseId', async () => {
      const updateData = { warehouseId: 'w2' }
      const mockWarehouse = { id: 'w2' }

      ;(prisma.warehouse.findUnique as jest.Mock).mockResolvedValue(mockWarehouse)
      ;(prisma.shelf.update as jest.Mock).mockResolvedValue({})

      await shelfService.update('1', updateData)

      expect(prisma.warehouse.findUnique).toHaveBeenCalledWith({ where: { id: 'w2' } })
    })

    it('should throw error if shelf not found', async () => {
      ;(prisma.shelf.update as jest.Mock).mockRejectedValue({ code: 'P2025' })

      await expect(shelfService.update('999', { name: 'Test' })).rejects.toThrow('Shelf not found')
    })
  })

  describe('delete', () => {
    it('should delete a shelf', async () => {
      const mockDeleted = { id: '1', name: 'Shelf 1' }

      ;(prisma.shelf.delete as jest.Mock).mockResolvedValue(mockDeleted)

      const result = await shelfService.delete('1')

      expect(result).toEqual(mockDeleted)
    })
  })

  describe('clearShelf', () => {
    it('should delete all items from a shelf in a transaction', async () => {
      const mockShelf = {
        id: '1',
        items: [{ id: 'i1' }, { id: 'i2' }, { id: 'i3' }],
      }

      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          shelf: {
            findUnique: jest.fn().mockResolvedValue(mockShelf),
          },
          item: {
            deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
          },
        }
        return callback(tx)
      })

      const result = await shelfService.clearShelf('1')

      expect(result).toEqual({
        shelfId: '1',
        deletedItemsCount: 3,
      })
    })

    it('should throw error if shelf not found', async () => {
      ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          shelf: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        }
        return callback(tx)
      })

      await expect(shelfService.clearShelf('999')).rejects.toThrow('Shelf not found')
    })
  })

  describe('getStatistics', () => {
    it('should calculate shelf statistics correctly', async () => {
      const mockShelf = {
        id: '1',
        name: 'Shelf 1',
        warehouseId: 'w1',
        capacity: 100,
        items: [
          { id: 'i1', quantity: 10 },
          { id: 'i2', quantity: 20 },
          { id: 'i3', quantity: 15 },
        ],
      }

      ;(prisma.shelf.findUnique as jest.Mock).mockResolvedValue(mockShelf)

      const result = await shelfService.getStatistics('1')

      expect(result).toEqual({
        id: '1',
        name: 'Shelf 1',
        warehouseId: 'w1',
        totalItems: 3,
        totalQuantity: 45,
        capacity: 100,
        utilizationPercentage: 45,
      })
    })
  })
})
