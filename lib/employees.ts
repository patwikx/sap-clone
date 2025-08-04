'use server'

import { prisma } from '@/lib/prisma'
import { employeeSchema } from '@/lib/validations'
import { EmployeeFormData, EmployeeWithRelations } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function createEmployee(data: EmployeeFormData) {
  try {
    const validatedData = employeeSchema.parse(data)
    
    const employee = await prisma.employee.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        jobTitle: validatedData.jobTitle,
        department: validatedData.department,
        managerId: validatedData.managerId,
        officePhone: validatedData.officePhone,
        mobilePhone: validatedData.mobilePhone,
        email: validatedData.email,
        userId: validatedData.userId
      },
      include: {
        user: true,
        manager: true,
        subordinates: true
      }
    })

    revalidatePath('/employees')
    return { success: true, data: employee }
  } catch (error) {
    console.error('Error creating employee:', error)
    return { success: false, error: 'Failed to create employee' }
  }
}

export async function getEmployees(): Promise<EmployeeWithRelations[]> {
  try {
    return await prisma.employee.findMany({
      include: {
        user: true,
        manager: true,
        subordinates: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return []
  }
}

export async function getEmployeeById(id: string): Promise<EmployeeWithRelations | null> {
  try {
    return await prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        manager: true,
        subordinates: true
      }
    })
  } catch (error) {
    console.error('Error fetching employee:', error)
    return null
  }
}

export async function updateEmployee(id: string, data: EmployeeFormData) {
  try {
    const validatedData = employeeSchema.parse(data)
    
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        jobTitle: validatedData.jobTitle,
        department: validatedData.department,
        managerId: validatedData.managerId,
        officePhone: validatedData.officePhone,
        mobilePhone: validatedData.mobilePhone,
        email: validatedData.email,
        userId: validatedData.userId
      },
      include: {
        user: true,
        manager: true,
        subordinates: true
      }
    })

    revalidatePath('/employees')
    revalidatePath(`/employees/${id}`)
    return { success: true, data: employee }
  } catch (error) {
    console.error('Error updating employee:', error)
    return { success: false, error: 'Failed to update employee' }
  }
}

export async function deleteEmployee(id: string) {
  try {
    await prisma.employee.delete({
      where: { id }
    })

    revalidatePath('/employees')
    return { success: true }
  } catch (error) {
    console.error('Error deleting employee:', error)
    return { success: false, error: 'Failed to delete employee' }
  }
}