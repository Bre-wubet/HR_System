/**
 * Simple test script to verify authentication system
 * Run with: node test-auth.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  email: 'test@company.com',
  password: 'testPassword123',
  firstName: 'Test',
  lastName: 'User'
};

const adminUser = {
  email: 'admin@company.com',
  password: 'admin123'
};

async function testAuth() {
  console.log('Testing Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('Testing user registration...');
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ User registered successfully');
      console.log(`   User ID: ${registerData.data.user.id}`);
    } else {
      const errorData = await registerResponse.json();
      console.log('⚠️  Registration failed (user might already exist):', errorData.error);
    }

    // Test 2: Login with test user
    console.log('\n2️⃣ Testing user login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const accessToken = loginData.data.accessToken;
    console.log('✅ Login successful');
    console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);

    // Test 3: Access protected resource
    console.log('\n3️⃣ Testing protected resource access...');
    const protectedResponse = await fetch(`${BASE_URL}/api/hr/employees`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (protectedResponse.ok) {
      console.log('✅ Protected resource accessed successfully');
    } else {
      const errorData = await protectedResponse.json();
      console.log('❌ Protected resource access failed:', errorData.error);
    }

    // Test 4: Get user profile
    console.log('\n4️⃣ Testing user profile access...');
    const profileResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ User profile accessed successfully');
      console.log(`   User: ${profileData.data.firstName} ${profileData.data.lastName}`);
      console.log(`   Email: ${profileData.data.email}`);
    } else {
      const errorData = await profileResponse.json();
      console.log('❌ Profile access failed:', errorData.error);
    }

    // Test 5: Get user roles and permissions
    console.log('\n5️⃣ Testing roles and permissions...');
    const rolesResponse = await fetch(`${BASE_URL}/api/auth/roles-permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (rolesResponse.ok) {
      const rolesData = await rolesResponse.json();
      console.log('✅ Roles and permissions accessed successfully');
      console.log(`   Roles: ${rolesData.data.roles.map(r => r.name).join(', ')}`);
      console.log(`   Permissions: ${rolesData.data.permissions.length} permissions`);
    } else {
      const errorData = await rolesResponse.json();
      console.log('❌ Roles and permissions access failed:', errorData.error);
    }

    // Test 6: Login with admin user
    console.log('\n6️⃣ Testing admin login...');
    const adminLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminUser),
    });

    if (adminLoginResponse.ok) {
      const adminLoginData = await adminLoginResponse.json();
      const adminAccessToken = adminLoginData.data.accessToken;
      console.log('✅ Admin login successful');
      console.log(`   Admin Access Token: ${adminAccessToken.substring(0, 20)}...`);

      // Test admin permissions
      const adminRolesResponse = await fetch(`${BASE_URL}/api/auth/roles-permissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminAccessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (adminRolesResponse.ok) {
        const adminRolesData = await adminRolesResponse.json();
        console.log('✅ Admin roles and permissions accessed');
        console.log(`   Admin Roles: ${adminRolesData.data.roles.map(r => r.name).join(', ')}`);
        console.log(`   Admin Permissions: ${adminRolesData.data.permissions.length} permissions`);
      }
    } else {
      const errorData = await adminLoginResponse.json();
      console.log('❌ Admin login failed:', errorData.error);
    }

    // Test 7: Test unauthorized access
    console.log('\n7️⃣ Testing unauthorized access...');
    const unauthorizedResponse = await fetch(`${BASE_URL}/api/hr/employees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (unauthorizedResponse.status === 401) {
      console.log('✅ Unauthorized access properly blocked');
    } else {
      console.log('❌ Unauthorized access was not blocked');
    }

    console.log('\n🎉 Authentication system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3000');
    console.log('   Run: npm run dev');
  }
}

// Run the test
testAuth();
