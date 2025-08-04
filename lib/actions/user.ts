'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UserStatus } from '@prisma/client'

interface UserFormData {
  name: string
  email: string
  passwordHash: string
  status: UserStatus
  businessUnitId: string
  roleIds: string[]
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        },
        businessUnit: true
      },
      orderBy: { name: 'asc' }
    })
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: true
              }
            }
          }
        },
        businessUnit: true
      }
    })
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function createUser(data: UserFormData) {
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        status: data.status,
        businessUnitId: data.businessUnitId,
        roles: {
          create: data.roleIds.map(roleId => ({
            roleId
          }))
        }
      }
    })

    revalidatePath('/dashboard/users')
    return { success: true, data: user }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUser(id: string, data: Partial<UserFormData>) {
  try {
    const { roleIds, ...updateData } = data

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    // Update roles if provided
    if (roleIds) {
      // Delete existing roles
      await prisma.userRole.deleteMany({
        where: { userId: id }
      })

      // Create new roles
      await prisma.userRole.createMany({
        data: roleIds.map(roleId => ({
          userId: id,
          roleId
        }))
      })
    }

    revalidatePath('/dashboard/users')
    revalidatePath(`/dashboard/users/${id}`)
    return { success: true, data: user }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

export async function getRoles() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    return roles
  } catch (error) {
    console.error('Error fetching roles:', error)
    return []
  }
}

export async function getRoleById(id: string) {
  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
    return role
  } catch (error) {
    console.error('Error fetching role:', error)
    return null
  }
}

export async function createRole(data: { name: string; description?: string; permissionIds: string[] }) {
  try {
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          create: data.permissionIds.map(permissionId => ({
            permissionId
          }))
        }
      }
    })

    revalidatePath('/dashboard/roles')
    return { success: true, data: role }
  } catch (error) {
    console.error('Error creating role:', error)
    return { success: false, error: 'Failed to create role' }
  }
}

export async function updateRole(id: string, data: { name: string; description?: string; permissionIds: string[] }) {
  try {
    const { permissionIds, ...updateData } = data

    const role = await prisma.role.update({
      where: { id },
      data: updateData
    })

    // Update permissions if provided
    if (permissionIds) {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id }
      })

      // Create new permissions
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId: id,
          permissionId
        }))
      })
    }

    revalidatePath('/dashboard/roles')
    revalidatePath(`/dashboard/roles/${id}`)
    return { success: true, data: role }
  } catch (error) {
    console.error('Error updating role:', error)
    return { success: false, error: 'Failed to update role' }
  }
}

export async function deleteRole(id: string) {
  try {
    await prisma.role.delete({
      where: { id }
    })

    revalidatePath('/dashboard/roles')
    return { success: true }
  } catch (error) {
    console.error('Error deleting role:', error)
    return { success: false, error: 'Failed to delete role' }
  }
}

export async function getPermissions() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }]
    })
    return permissions
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return []
  }
} 