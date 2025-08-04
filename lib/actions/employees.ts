import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Define the form data interface based on the actual schema
interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  jobTitle?: string
  department?: string
  managerId?: string
  businessUnitId: string
  userId?: string
}

// Define the employee with relations interface
interface EmployeeWithRelations {
  id: string
  firstName: string
  lastName: string
  email: string
  jobTitle?: string
  department?: string
  managerId?: string
  businessUnitId: string
  userId?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  isActive: boolean
  user?: {
    id: string
    email: string
  }
  manager?: {
    id: string
    firstName: string
    lastName: string
  }
  subordinates: Array<{
    id: string
    firstName: string
    lastName: string
  }>
  businessUnit: {
    id: string
    name: string
  }
}

export async function getEmployees(): Promise<EmployeeWithRelations[]> {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: true,
        manager: true,
        subordinates: true,
        businessUnit: true
      },
      orderBy: { firstName: 'asc' }
    })
    return employees as EmployeeWithRelations[]
  } catch (error) {
    console.error('Error fetching employees:', error)
    return []
  }
}

export async function getEmployeeById(id: string): Promise<EmployeeWithRelations | null> {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        manager: true,
        subordinates: true,
        businessUnit: true
      }
    })
    return employee as EmployeeWithRelations | null
  } catch (error) {
    console.error('Error fetching employee:', error)
    return null
  }
}

export async function createEmployee(data: EmployeeFormData) {
  try {
    const employee = await prisma.employee.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        department: data.department,
        managerId: data.managerId,
        email: data.email,
        businessUnitId: data.businessUnitId,
        userId: data.userId
      }
    })

    revalidatePath('/dashboard/employees')
    return { success: true, data: employee }
  } catch (error) {
    console.error('Error creating employee:', error)
    return { success: false, error: 'Failed to create employee' }
  }
}

export async function updateEmployee(id: string, data: EmployeeFormData) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        department: data.department,
        managerId: data.managerId,
        email: data.email,
        businessUnitId: data.businessUnitId,
        userId: data.userId
      }
    })

    revalidatePath('/dashboard/employees')
    revalidatePath(`/dashboard/employees/${id}`)
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

    revalidatePath('/dashboard/employees')
    return { success: true }
  } catch (error) {
    console.error('Error deleting employee:', error)
    return { success: false, error: 'Failed to delete employee' }
  }
}