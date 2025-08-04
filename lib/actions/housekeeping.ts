'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { HousekeepingStatus } from '@prisma/client'

interface HousekeepingTaskFormData {
  roomId: string
  assignedToId: string
  taskType: string
  priority: string
  estimatedTime: number
  status?: string
}

interface HousekeepingLogFormData {
  roomId: string
  employeeId: string
  statusFrom: string
  statusTo: string
}

export async function getHousekeepingTasks() {
  try {
    const tasks = await prisma.housekeepingTask.findMany({
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        assignedTo: true
      },
      orderBy: { createdAt: 'asc' }
    })
    return tasks
  } catch (error) {
    console.error('Error fetching housekeeping tasks:', error)
    return []
  }
}

export async function getHousekeepingTaskById(id: string) {
  try {
    const task = await prisma.housekeepingTask.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        assignedTo: true
      }
    })
    return task
  } catch (error) {
    console.error('Error fetching housekeeping task:', error)
    return null
  }
}

export async function createHousekeepingTask(data: HousekeepingTaskFormData) {
  try {
    const task = await prisma.housekeepingTask.create({
      data: {
        roomId: data.roomId,
        assignedToId: data.assignedToId,
        taskType: data.taskType,
        priority: data.priority,
        estimatedTime: data.estimatedTime,
        status: data.status || 'PENDING'
      }
    })

    revalidatePath('/dashboard/housekeeping/tasks')
    return { success: true, data: task }
  } catch (error) {
    console.error('Error creating housekeeping task:', error)
    return { success: false, error: 'Failed to create housekeeping task' }
  }
}

export async function updateHousekeepingTask(id: string, data: Partial<HousekeepingTaskFormData>) {
  try {
    const task = await prisma.housekeepingTask.update({
      where: { id },
      data
    })

    revalidatePath('/dashboard/housekeeping/tasks')
    revalidatePath(`/dashboard/housekeeping/tasks/${id}`)
    return { success: true, data: task }
  } catch (error) {
    console.error('Error updating housekeeping task:', error)
    return { success: false, error: 'Failed to update housekeeping task' }
  }
}

export async function deleteHousekeepingTask(id: string) {
  try {
    await prisma.housekeepingTask.delete({
      where: { id }
    })

    revalidatePath('/dashboard/housekeeping/tasks')
    return { success: true }
  } catch (error) {
    console.error('Error deleting housekeeping task:', error)
    return { success: false, error: 'Failed to delete housekeeping task' }
  }
}

export async function getHousekeepingLogs() {
  try {
    const logs = await prisma.housekeepingLog.findMany({
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        employee: true
      },
      orderBy: { timestamp: 'desc' }
    })
    return logs
  } catch (error) {
    console.error('Error fetching housekeeping logs:', error)
    return []
  }
}

export async function createHousekeepingLog(data: HousekeepingLogFormData) {
  try {
    const log = await prisma.housekeepingLog.create({
      data: {
        roomId: data.roomId,
        employeeId: data.employeeId,
        statusFrom: data.statusFrom,
        statusTo: data.statusTo
      }
    })

    // Update room housekeeping status
    await prisma.hotelRoom.update({
      where: { id: data.roomId },
      data: { housekeepingStatus: data.statusTo as HousekeepingStatus }
    })

    revalidatePath('/dashboard/housekeeping/logs')
    return { success: true, data: log }
  } catch (error) {
    console.error('Error creating housekeeping log:', error)
    return { success: false, error: 'Failed to create housekeeping log' }
  }
}

export async function getDirtyRooms() {
  try {
    const rooms = await prisma.hotelRoom.findMany({
      where: { housekeepingStatus: 'DIRTY' },
      include: {
        roomType: true
      },
      orderBy: { number: 'asc' }
    })
    return rooms
  } catch (error) {
    console.error('Error fetching dirty rooms:', error)
    return []
  }
}

export async function getRoomsByHousekeepingStatus(status: HousekeepingStatus) {
  try {
    const rooms = await prisma.hotelRoom.findMany({
      where: { housekeepingStatus: status },
      include: {
        roomType: true
      },
      orderBy: { number: 'asc' }
    })
    return rooms
  } catch (error) {
    console.error('Error fetching rooms by housekeeping status:', error)
    return []
  }
} 