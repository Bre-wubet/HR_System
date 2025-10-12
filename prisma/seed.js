import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create permissions
  console.log('Creating permissions...');
  const permissions = [
    // Employee permissions
    { name: 'employee:create', description: 'Create employees', resource: 'employee', action: 'create' },
    { name: 'employee:read', description: 'View employees', resource: 'employee', action: 'read' },
    { name: 'employee:update', description: 'Update employees', resource: 'employee', action: 'update' },
    { name: 'employee:delete', description: 'Delete employees', resource: 'employee', action: 'delete' },
    
    // Recruitment permissions
    { name: 'recruitment:create', description: 'Create job postings', resource: 'recruitment', action: 'create' },
    { name: 'recruitment:read', description: 'View recruitment data', resource: 'recruitment', action: 'read' },
    { name: 'recruitment:update', description: 'Update recruitment data', resource: 'recruitment', action: 'update' },
    { name: 'recruitment:delete', description: 'Delete recruitment data', resource: 'recruitment', action: 'delete' },
    
    // Attendance permissions
    { name: 'attendance:create', description: 'Create attendance records', resource: 'attendance', action: 'create' },
    { name: 'attendance:read', description: 'View attendance data', resource: 'attendance', action: 'read' },
    { name: 'attendance:update', description: 'Update attendance data', resource: 'attendance', action: 'update' },
    { name: 'attendance:delete', description: 'Delete attendance data', resource: 'attendance', action: 'delete' },
    
    // Admin permissions
    { name: 'admin:manage_users', description: 'Manage users and roles', resource: 'admin', action: 'manage_users' },
    { name: 'admin:manage_system', description: 'System administration', resource: 'admin', action: 'manage_system' },
  ];

  const createdPermissions = {};
  for (const permissionData of permissions) {
    try {
      const permission = await prisma.permission.upsert({
        where: { name: permissionData.name },
        update: {},
        create: permissionData,
      });
      createdPermissions[permission.name] = permission;
      console.log(`✅ Created permission: ${permission.name}`);
    } catch (error) {
      console.log(`⚠️  Permission ${permissionData.name} might already exist`);
    }
  }

  // Create roles
  console.log('Creating roles...');
  const roles = [
    {
      name: 'super_admin',
      description: 'Super Administrator with all permissions',
    },
    {
      name: 'hr_admin',
      description: 'HR Administrator with full HR access',
    },
    {
      name: 'hr_manager',
      description: 'HR Manager with management permissions',
    },
    {
      name: 'hr_employee',
      description: 'HR Employee with basic HR access',
    },
    {
      name: 'employee',
      description: 'Regular employee with limited access',
    },
  ];

  const createdRoles = {};
  for (const roleData of roles) {
    try {
      const role = await prisma.role.upsert({
        where: { name: roleData.name },
        update: {},
        create: roleData,
      });
      createdRoles[role.name] = role;
      console.log(`✅ Created role: ${role.name}`);
    } catch (error) {
      console.log(`⚠️  Role ${roleData.name} might already exist`);
    }
  }

  // Assign permissions to roles
  console.log('Assigning permissions to roles...');
  const rolePermissions = {
    super_admin: [
      'employee:create', 'employee:read', 'employee:update', 'employee:delete',
      'recruitment:create', 'recruitment:read', 'recruitment:update', 'recruitment:delete',
      'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete',
      'admin:manage_users', 'admin:manage_system',
    ],
    hr_admin: [
      'employee:create', 'employee:read', 'employee:update', 'employee:delete',
      'recruitment:create', 'recruitment:read', 'recruitment:update', 'recruitment:delete',
      'attendance:create', 'attendance:read', 'attendance:update', 'attendance:delete',
    ],
    hr_manager: [
      'employee:read', 'employee:update',
      'recruitment:create', 'recruitment:read', 'recruitment:update',
      'attendance:read', 'attendance:update',
    ],
    hr_employee: [
      'employee:read',
      'recruitment:read',
      'attendance:read',
    ],
    employee: [
      'employee:read', // Can view own profile
      'attendance:read', // Can view own attendance
    ],
  };

  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    const role = createdRoles[roleName];
    if (role) {
      for (const permissionName of permissionNames) {
        const permission = createdPermissions[permissionName];
        if (permission) {
          try {
            await prisma.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: role.id,
                  permissionId: permission.id,
                },
              },
              update: {},
              create: {
                roleId: role.id,
                permissionId: permission.id,
              },
            });
            console.log(`✅ Assigned permission ${permissionName} to role ${roleName}`);
          } catch (error) {
            console.log(`⚠️  Permission ${permissionName} might already be assigned to role ${roleName}`);
          }
        }
      }
    }
  }

  // Create departments
  console.log('Creating departments...');
  const departments = [
    { name: 'Human Resources' },
    { name: 'Engineering' },
    { name: 'Marketing' },
    { name: 'Sales' },
    { name: 'Finance' },
    { name: 'Operations' },
  ];

  const createdDepartments = {};
  for (const deptData of departments) {
    try {
      const department = await prisma.department.upsert({
        where: { name: deptData.name },
        update: {},
        create: deptData,
      });
      createdDepartments[department.name] = department;
      console.log(`✅ Created department: ${department.name}`);
    } catch (error) {
      console.log(`⚠️  Department ${deptData.name} might already exist`);
    }
  }

  // Create a super admin user
  console.log('Creating super admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  try {
    const superAdminUser = await prisma.user.upsert({
      where: { email: 'admin@company.com' },
      update: {},
      create: {
        email: 'admin@company.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        emailVerified: true,
      },
    });

    // Assign super_admin role to the user
    const superAdminRole = createdRoles['super_admin'];
    if (superAdminRole) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: superAdminUser.id,
            roleId: superAdminRole.id,
          },
        },
        update: {},
        create: {
          userId: superAdminUser.id,
          roleId: superAdminRole.id,
        },
      });
      console.log('✅ Created super admin user and assigned role');
    }
  } catch (error) {
    console.log('⚠️  Super admin user might already exist');
  }

  // Create sample HR admin user
  console.log('Creating HR admin user...');
  try {
    const hrAdminUser = await prisma.user.upsert({
      where: { email: 'hr@company.com' },
      update: {},
      create: {
        email: 'hr@company.com',
        password: hashedPassword,
        firstName: 'HR',
        lastName: 'Administrator',
        isActive: true,
        emailVerified: true,
      },
    });

    // Assign hr_admin role to the user
    const hrAdminRole = createdRoles['hr_admin'];
    if (hrAdminRole) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: hrAdminUser.id,
            roleId: hrAdminRole.id,
          },
        },
        update: {},
        create: {
          userId: hrAdminUser.id,
          roleId: hrAdminRole.id,
        },
      });
      console.log('✅ Created HR admin user and assigned role');
    }
  } catch (error) {
    console.log('⚠️  HR admin user might already exist');
  }

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Default Users Created:');
  console.log('Super Admin: admin@company.com / admin123');
  console.log('HR Admin: hr@company.com / admin123');
  console.log('\n🔐 All users have the password: admin123');
  console.log('⚠️  Please change these passwords after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
