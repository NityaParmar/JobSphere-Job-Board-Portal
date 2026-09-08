/**
 * Phase 3 Integration Test Script
 * Tests: Job CRUD, $text search, salary/techStack/type filters, pagination,
 *        ownership enforcement, RBAC, save/unsave
 *
 * Run with: node test_jobs.js
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

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  const ts = Date.now();

  console.log('\n=== PHASE 3: Job Search & Filtering Tests ===\n');

  // --- Setup: Register employer + candidate ---
  console.log('0. Setup: Register users');
  let res = await request('POST', '/auth/register', {
    name: 'Employer Test',
    email: `emp_job_${ts}@test.com`,
    password: 'password123',
    role: 'EMPLOYER',
  });
  const employerToken = res.data.data.token;

  res = await request('POST', '/auth/register', {
    name: 'Candidate Test',
    email: `cand_job_${ts}@test.com`,
    password: 'password123',
    role: 'CANDIDATE',
  });
  const candidateToken = res.data.data.token;

  // Register a second employer for ownership tests
  res = await request('POST', '/auth/register', {
    name: 'Other Employer',
    email: `emp2_job_${ts}@test.com`,
    password: 'password123',
    role: 'EMPLOYER',
  });
  const otherEmployerToken = res.data.data.token;

  console.log('  ✅ Users registered');

  // --- Test 1: Create job (employer) ---
  console.log('1. Create job (employer)');
  res = await request('POST', '/jobs', {
    title: 'Senior React Developer',
    description: 'We are looking for a senior React developer to join our team and build amazing applications.',
    company: 'TechCorp',
    location: 'Remote',
    salaryMin: 80000,
    salaryMax: 120000,
    techStack: ['React', 'Node.js', 'TypeScript'],
    employmentType: 'FULL_TIME',
    experienceLevel: 'SENIOR',
  }, employerToken);
  assert(res.status === 201, `Status 201 (got ${res.status})`);
  assert(res.data.data.job.title === 'Senior React Developer', 'Title correct');
  assert(res.data.data.job.postedBy.name === 'Employer Test', 'Employer populated');
  const job1Id = res.data.data.job._id;

  // --- Test 2: Create more jobs for search tests ---
  console.log('2. Create additional test jobs');
  res = await request('POST', '/jobs', {
    title: 'Junior Python Engineer',
    description: 'Entry level Python position for someone passionate about backend development and data science.',
    company: 'DataInc',
    location: 'New York',
    salaryMin: 50000,
    salaryMax: 70000,
    techStack: ['Python', 'Django', 'PostgreSQL'],
    employmentType: 'FULL_TIME',
    experienceLevel: 'JUNIOR',
  }, employerToken);
  assert(res.status === 201, 'Job 2 created');
  const job2Id = res.data.data.job._id;

  res = await request('POST', '/jobs', {
    title: 'Frontend Intern',
    description: 'A great internship opportunity for students interested in frontend web development with modern frameworks.',
    company: 'StartupXYZ',
    location: 'San Francisco',
    salaryMin: 30000,
    salaryMax: 45000,
    techStack: ['React', 'CSS', 'JavaScript'],
    employmentType: 'INTERNSHIP',
    experienceLevel: 'JUNIOR',
  }, employerToken);
  assert(res.status === 201, 'Job 3 created');

  res = await request('POST', '/jobs', {
    title: 'Node.js Backend Lead',
    description: 'Lead our backend team building scalable microservices and API platforms for enterprise clients.',
    company: 'EnterpriseCo',
    location: 'Remote',
    salaryMin: 100000,
    salaryMax: 150000,
    techStack: ['Node.js', 'MongoDB', 'Docker', 'Kubernetes'],
    employmentType: 'FULL_TIME',
    experienceLevel: 'LEAD',
  }, employerToken);
  assert(res.status === 201, 'Job 4 created');

  // --- Test 3: RBAC — candidate cannot create jobs ---
  console.log('3. RBAC: Candidate cannot create jobs');
  res = await request('POST', '/jobs', {
    title: 'Should Fail',
    description: 'This should not be created because candidate cannot post jobs.',
    company: 'Nope',
    location: 'Nowhere',
    salaryMin: 10000,
    salaryMax: 20000,
    techStack: ['Nothing'],
    employmentType: 'FULL_TIME',
    experienceLevel: 'JUNIOR',
  }, candidateToken);
  assert(res.status === 403, `Status 403 (got ${res.status})`);

  // --- Test 4: Get all jobs (public, no filters) ---
  console.log('4. Get all jobs (no filters)');
  res = await request('GET', '/jobs');
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.jobs.length >= 4, `At least 4 jobs returned (got ${res.data.data.jobs.length})`);
  assert(res.data.data.pagination.total >= 4, 'Pagination total correct');

  // --- Test 5: Text search — "React" matches title ---
  console.log('5. Text search: "React"');
  res = await request('GET', '/jobs?search=React');
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.jobs.length >= 1, `At least 1 React job via text index (got ${res.data.data.jobs.length})`);

  // --- Test 6: Text search — "Remote" matches location ---
  console.log('6. Text search: "Remote"');
  res = await request('GET', '/jobs?search=Remote');
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.jobs.length >= 2, `At least 2 Remote jobs (got ${res.data.data.jobs.length})`);

  // --- Test 7: Salary filter ---
  console.log('7. Salary filter: min_salary=80000');
  res = await request('GET', '/jobs?min_salary=80000');
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  const allAbove80k = res.data.data.jobs.every((j) => j.salaryMin >= 80000);
  assert(allAbove80k, 'All returned jobs have salaryMin >= 80000');
  assert(res.data.data.jobs.length >= 2, `At least 2 jobs (got ${res.data.data.jobs.length})`);

  // --- Test 8: Tech stack filter ---
  console.log('8. Tech stack filter: Node.js');
  res = await request('GET', '/jobs?tech_stack=Node.js');
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  const allHaveNode = res.data.data.jobs.every((j) => j.techStack.includes('Node.js'));
  assert(allHaveNode, 'All returned jobs contain Node.js in techStack');

  // --- Test 9: Combined filters ---
  console.log('9. Combined: search=Remote + min_salary=90000');
  res = await request('GET', '/jobs?search=Remote&min_salary=90000');
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.jobs.length >= 1, `At least 1 result (got ${res.data.data.jobs.length})`);
  assert(res.data.data.jobs[0].salaryMin >= 90000, 'Salary filter applied with text search');

  // --- Test 10: Employment type filter ---
  console.log('10. Employment type filter: INTERNSHIP');
  res = await request('GET', '/jobs?type=INTERNSHIP');
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  const allInternship = res.data.data.jobs.every((j) => j.employmentType === 'INTERNSHIP');
  assert(allInternship, 'All returned jobs are INTERNSHIP');

  // --- Test 11: Pagination ---
  console.log('11. Pagination: page=1, limit=2');
  res = await request('GET', '/jobs?limit=2&page=1');
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.jobs.length <= 2, `At most 2 jobs per page (got ${res.data.data.jobs.length})`);
  assert(res.data.data.pagination.page === 1, 'Page 1');
  assert(res.data.data.pagination.limit === 2, 'Limit 2');
  assert(res.data.data.pagination.pages >= 2, 'Multiple pages exist');

  // --- Test 12: Get single job by ID ---
  console.log('12. Get job by ID');
  res = await request('GET', `/jobs/${job1Id}`);
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.job.title === 'Senior React Developer', 'Correct job returned');

  // --- Test 13: Update job (owner) ---
  console.log('13. Update job (owner)');
  res = await request('PUT', `/jobs/${job1Id}`, {
    salaryMax: 130000,
    title: 'Senior React Engineer',
  }, employerToken);
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.job.salaryMax === 130000, 'Salary updated');
  assert(res.data.data.job.title === 'Senior React Engineer', 'Title updated');

  // --- Test 14: Update job (non-owner blocked) ---
  console.log('14. Update job (non-owner blocked)');
  res = await request('PUT', `/jobs/${job1Id}`, {
    title: 'Hacked Title',
  }, otherEmployerToken);
  assert(res.status === 403, `Status 403 (got ${res.status})`);

  // --- Test 15: Delete job (non-owner blocked) ---
  console.log('15. Delete job (non-owner blocked)');
  res = await request('DELETE', `/jobs/${job2Id}`, null, otherEmployerToken);
  assert(res.status === 403, `Status 403 (got ${res.status})`);

  // --- Test 16: RBAC — candidate cannot delete jobs ---
  console.log('16. RBAC: Candidate cannot delete jobs');
  res = await request('DELETE', `/jobs/${job2Id}`, null, candidateToken);
  assert(res.status === 403, `Status 403 (got ${res.status})`);

  // --- Test 17: Employer dashboard — my-posts ---
  console.log('17. Employer dashboard: my-posts');
  res = await request('GET', '/jobs/my-posts', null, employerToken);
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.jobs.length >= 4, `At least 4 posted jobs (got ${res.data.data.jobs.length})`);

  // --- Test 18: Save job (candidate) ---
  console.log('18. Candidate: Save job');
  res = await request('POST', `/jobs/${job1Id}/save`, null, candidateToken);
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.savedJobs.length >= 1, 'Job saved');

  // --- Test 19: Unsave job (candidate) ---
  console.log('19. Candidate: Unsave job');
  res = await request('DELETE', `/jobs/${job1Id}/save`, null, candidateToken);
  assert(res.status === 200, `Status 200 (got ${res.status})`);

  // --- Test 20: RBAC — employer cannot save jobs ---
  console.log('20. RBAC: Employer cannot save jobs');
  res = await request('POST', `/jobs/${job1Id}/save`, null, employerToken);
  assert(res.status === 403, `Status 403 (got ${res.status})`);

  // --- Test 21: Delete job (owner) ---
  console.log('21. Delete job (owner)');
  res = await request('DELETE', `/jobs/${job2Id}`, null, employerToken);
  assert(res.status === 200, `Status 200 (got ${res.status})`);

  // Verify deleted
  res = await request('GET', `/jobs/${job2Id}`);
  assert(res.status === 404, `Deleted job returns 404 (got ${res.status})`);

  console.log(`\n=== Phase 3 Results: ${passed} passed, ${failed} failed ===\n`);
  process.exitCode = failed > 0 ? 1 : 0;
}

runTests().catch((err) => {
  console.error('Test runner failed:', err.message);
  process.exit(1);
});
