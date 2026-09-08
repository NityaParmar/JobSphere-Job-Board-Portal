/**
 * Phase 2 Integration Test Script
 * Tests: Register, Login, GetMe, RBAC enforcement
 *
 * Run with: node test_auth.js
 * Requires server running on port 5000
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  const timestamp = Date.now();
  const candidateEmail = `candidate_${timestamp}@test.com`;
  const employerEmail = `employer_${timestamp}@test.com`;
  let candidateToken, employerToken;

  console.log('\n=== PHASE 2: Auth & RBAC Tests ===\n');

  // -----------------------------------------------------------------------
  // Test 1: Register a CANDIDATE
  // -----------------------------------------------------------------------
  console.log('1. Register CANDIDATE');
  let res = await request('POST', '/auth/register', {
    name: 'Test Candidate',
    email: candidateEmail,
    password: 'password123',
    role: 'CANDIDATE',
    skills: ['JavaScript', 'React'],
  });
  assert(res.status === 201, `Status 201 (got ${res.status})`);
  assert(res.data.success === true, 'success: true');
  assert(res.data.data.token, 'Token returned');
  assert(res.data.data.user.role === 'CANDIDATE', 'Role is CANDIDATE');
  assert(!res.data.data.user.password, 'Password not exposed in response');
  candidateToken = res.data.data.token;

  // -----------------------------------------------------------------------
  // Test 2: Register an EMPLOYER
  // -----------------------------------------------------------------------
  console.log('2. Register EMPLOYER');
  res = await request('POST', '/auth/register', {
    name: 'Test Employer',
    email: employerEmail,
    password: 'password456',
    role: 'EMPLOYER',
  });
  assert(res.status === 201, `Status 201 (got ${res.status})`);
  assert(res.data.data.user.role === 'EMPLOYER', 'Role is EMPLOYER');
  employerToken = res.data.data.token;

  // -----------------------------------------------------------------------
  // Test 3: Duplicate email registration
  // -----------------------------------------------------------------------
  console.log('3. Duplicate email rejection');
  res = await request('POST', '/auth/register', {
    name: 'Duplicate',
    email: candidateEmail,
    password: 'password123',
    role: 'CANDIDATE',
  });
  assert(res.status === 409, `Status 409 (got ${res.status})`);
  assert(res.data.message.includes('already exists'), 'Conflict message');

  // -----------------------------------------------------------------------
  // Test 4: Register with invalid role
  // -----------------------------------------------------------------------
  console.log('4. Invalid role rejection');
  res = await request('POST', '/auth/register', {
    name: 'Invalid',
    email: `invalid_${timestamp}@test.com`,
    password: 'password123',
    role: 'ADMIN',
  });
  assert(res.status === 400, `Status 400 (got ${res.status})`);

  // -----------------------------------------------------------------------
  // Test 5: Register with missing fields
  // -----------------------------------------------------------------------
  console.log('5. Missing fields rejection');
  res = await request('POST', '/auth/register', {
    name: 'No Email',
    password: 'password123',
    role: 'CANDIDATE',
  });
  assert(res.status === 400, `Status 400 (got ${res.status})`);

  // -----------------------------------------------------------------------
  // Test 6: Login with valid credentials
  // -----------------------------------------------------------------------
  console.log('6. Login with valid credentials');
  res = await request('POST', '/auth/login', {
    email: candidateEmail,
    password: 'password123',
  });
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.token, 'Token returned on login');
  assert(res.data.data.user.email === candidateEmail, 'Correct user returned');

  // -----------------------------------------------------------------------
  // Test 7: Login with wrong password
  // -----------------------------------------------------------------------
  console.log('7. Login with wrong password');
  res = await request('POST', '/auth/login', {
    email: candidateEmail,
    password: 'wrongpassword',
  });
  assert(res.status === 401, `Status 401 (got ${res.status})`);
  assert(res.data.message === 'Invalid email or password', 'Generic error message (no enumeration)');

  // -----------------------------------------------------------------------
  // Test 8: Login with non-existent email
  // -----------------------------------------------------------------------
  console.log('8. Login with non-existent email');
  res = await request('POST', '/auth/login', {
    email: 'nonexistent@test.com',
    password: 'password123',
  });
  assert(res.status === 401, `Status 401 (got ${res.status})`);

  // -----------------------------------------------------------------------
  // Test 9: GET /me with valid token
  // -----------------------------------------------------------------------
  console.log('9. GET /me with valid token');
  res = await request('GET', '/auth/me', null, candidateToken);
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.user.name === 'Test Candidate', 'Correct user profile');

  // -----------------------------------------------------------------------
  // Test 10: GET /me without token (401)
  // -----------------------------------------------------------------------
  console.log('10. GET /me without token');
  res = await request('GET', '/auth/me');
  assert(res.status === 401, `Status 401 (got ${res.status})`);

  // -----------------------------------------------------------------------
  // Test 11: GET /me with invalid token (401)
  // -----------------------------------------------------------------------
  console.log('11. GET /me with invalid token');
  res = await request('GET', '/auth/me', null, 'invalid.token.here');
  assert(res.status === 401, `Status 401 (got ${res.status})`);

  // -----------------------------------------------------------------------
  // Test 12: Update profile
  // -----------------------------------------------------------------------
  console.log('12. PUT /me - Update profile');
  res = await request('PUT', '/auth/me', {
    name: 'Updated Candidate',
    bio: 'Full stack developer',
    skills: ['TypeScript', 'Node.js', 'React'],
  }, candidateToken);
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.user.name === 'Updated Candidate', 'Name updated');
  assert(res.data.data.user.bio === 'Full stack developer', 'Bio updated');
  assert(res.data.data.user.skills.length === 3, 'Skills updated');

  // -----------------------------------------------------------------------
  // Test 13: 404 for unknown route
  // -----------------------------------------------------------------------
  console.log('13. Unknown route returns 404');
  res = await request('GET', '/nonexistent');
  assert(res.status === 404, `Status 404 (got ${res.status})`);

  // -----------------------------------------------------------------------
  // Test 14: Health check
  // -----------------------------------------------------------------------
  console.log('14. Health check');
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  assert(healthRes.status === 200, `Status 200 (got ${healthRes.status})`);
  assert(healthData.status === 'ok', 'Health OK');

  console.log('\n=== All Phase 2 tests completed ===\n');
}

runTests().catch((err) => {
  console.error('Test runner failed:', err.message);
  process.exit(1);
});
