import { WarehouseService } from '../warehouse.service'
import { prisma } from '../../prisma'

jest.mock('../../prisma', () => ({
  prisma: {
    warehouse: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

describe('WarehouseService', () => {
  let warehouseService: WarehouseService

  beforeEach(() => {
    warehouseService = new WarehouseService()
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should return all warehouses with shelves', async () => {
      const mockWarehouses = [
        { id: '1', name: 'Warehouse 1', location: 'Location 1', capacity: 1000, shelves: [] },
        { id: '2', name: 'Warehouse 2', location: 'Location 2', capacity: 2000, shelves: [] },
      ]

      ;(prisma.warehouse.findMany as jest.Mock).mockResolvedValue(mockWarehouses)

      const result = await warehouseService.getAll()

      expect(result).toEqual(mockWarehouses)
      expect(prisma.warehouse.findMany).toHaveBeenCalledWith({
        include: { shelves: true },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('getById', () => {
    it('should return a warehouse with shelves and items', async () => {
      const mockWarehouse = {
        id: '1',
        name: 'Warehouse 1',
        location: 'Location 1',
        capacity: 1000,
        shelves: [
          { id: 's1', name: 'Shelf 1', items: [] },
        ],
      }

      ;(prisma.warehouse.findUnique as jest.Mock).mockResolvedValue(mockWarehouse)

      const result = await warehouseService.getById('1')

      expect(result).toEqual(mockWarehouse)
      expect(prisma.warehouse.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          shelves: {
            include: { items: true },
          },
        },
      })
    })

    it('should throw error if warehouse not found', async () => {
      ;(prisma.warehouse.findUnique as jest.Mock).mockResolvedValue(null)

      await expect(warehouseService.getById('999')).rejects.toThrow('Warehouse not found')
    })
  })

  describe('create', () => {
    it('should create a new warehouse', async () => {
      const createData = {
        name: 'New Warehouse',
        location: 'New Location',
        capacity: 1500,
      }

      const mockCreated = {
        id: '1',
        ...createData,
        shelves: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.warehouse.create as jest.Mock).mockResolvedValue(mockCreated)

      const result = await warehouseService.create(createData)

      expect(result).toEqual(mockCreated)
      expect(prisma.warehouse.create).toHaveBeenCalledWith({
        data: createData,
        include: { shelves: true },
      })
    })
  })

  describe('update', () => {
    it('should update an existing warehouse', async () => {
      const updateData = { name: 'Updated Name' }
      const mockUpdated = {
        id: '1',
        name: 'Updated Name',
        location: 'Location 1',
        capacity: 1000,
        shelves: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(prisma.warehouse.update as jest.Mock).mockResolvedValue(mockUpdated)

      const result = await warehouseService.update('1', updateData)

      expect(result).toEqual(mockUpdated)
      expect(prisma.warehouse.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
        include: { shelves: true },
      })
    })

    it('should throw error if warehouse not found', async () => {
      ;(prisma.warehouse.update as jest.Mock).mockRejectedValue({ code: 'P2025' })

      await expect(warehouseService.update('999', { name: 'Test' })).rejects.toThrow('Warehouse not found')
    })
  })

  describe('delete', () => {
    it('should delete a warehouse', async () => {
      const mockDeleted = { id: '1', name: 'Warehouse 1' }

      ;(prisma.warehouse.delete as jest.Mock).mockResolvedValue(mockDeleted)

      const result = await warehouseService.delete('1')

      expect(result).toEqual(mockDeleted)
      expect(prisma.warehouse.delete).toHaveBeenCalledWith({ where: { id: '1' } })
    })

    it('should throw error if warehouse not found', async () => {
      ;(prisma.warehouse.delete as jest.Mock).mockRejectedValue({ code: 'P2025' })

      await expect(warehouseService.delete('999')).rejects.toThrow('Warehouse not found')
    })
  })

  describe('getStatistics', () => {
    it('should calculate warehouse statistics correctly', async () => {
      const mockWarehouse = {
        id: '1',
        name: 'Warehouse 1',
        location: 'Location 1',
        capacity: 1000,
        shelves: [
          {
            id: 's1',
            items: [
              { id: 'i1', quantity: 10 },
              { id: 'i2', quantity: 20 },
            ],
          },
          {
            id: 's2',
            items: [
              { id: 'i3', quantity: 15 },
            ],
          },
        ],
      }

      ;(prisma.warehouse.findUnique as jest.Mock).mockResolvedValue(mockWarehouse)

      const result = await warehouseService.getStatistics('1')

      expect(result).toEqual({
        id: '1',
        name: 'Warehouse 1',
        totalShelves: 2,
        totalItems: 3,
        totalQuantity: 45,
        capacity: 1000,
        utilizationPercentage: 4.5,
      })
    })
  })
})
