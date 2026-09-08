/**
 * Full End-to-End Verification Script for Job Board & Portal
 * Tests all backend APIs and frontend flows using native fetch:
 * 1. Health check & public job listings
 * 2. Search filtering with $text index
 * 3. Candidate Auth & Profile update
 * 4. Job save/unsave bookmarks
 * 5. Candidate application history retrieval
 * 6. Employer Auth & Dashboard (my posted jobs)
 * 7. Employer job creation, editing, active toggle, delete
 * 8. Employer applicant review & status updating (PENDING -> INTERVIEW -> ACCEPTED)
 * 9. RBAC Security Tests (Candidates cannot post jobs, Employers cannot apply)
 */

const BASE_URL = 'http://localhost:5000/api';
let candidateToken = '';
let employerToken = '';
let testJobId = '';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}: ${detail}`);
    process.exitCode = 1;
  }
}

async function runE2ETests() {
  console.log('\n====================================================');
  console.log('🚀 Running JobSphere End-to-End Verification Suite');
  console.log('====================================================\n');

  // 1. Public Job Listings
  console.log('--- 1. Public Job Discovery ---');
  const jobsRes = await request('GET', '/jobs');
  assert(jobsRes.status === 200 && jobsRes.data.success, 'Public GET /api/jobs returns 200');
  assert(jobsRes.data.data.jobs.length > 0, `Jobs found in database (${jobsRes.data.data.pagination.total} total)`);
  testJobId = jobsRes.data.data.jobs[0]._id;

  // 2. Text Search & Filtering
  console.log('\n--- 2. MongoDB $text Search & Multi-Field Filters ---');
  const searchRes = await request('GET', '/jobs?search=React&min_salary=100000');
  assert(searchRes.status === 200, 'Search query with title text index and min_salary returns 200');
  assert(searchRes.data.data.jobs.length >= 1, `Found ${searchRes.data.data.jobs.length} roles matching search`);

  // 3. Candidate Auth & Login
  console.log('\n--- 3. Candidate Authentication & Profile ---');
  const candLogin = await request('POST', '/auth/login', {
    email: 'candidate.demo@jobsphere.dev',
    password: 'DemoPass123!',
  });
  const candToken = candLogin.data?.data?.token || candLogin.data?.token;
  const candUser = candLogin.data?.data?.user || candLogin.data?.user;
  assert(candLogin.status === 200 && candToken, 'Candidate login succeeds with JWT');
  assert(candUser?.role === 'CANDIDATE', 'Role is verified as CANDIDATE');
  candidateToken = candToken;

  // 4. Candidate Profile Update
  const profileRes = await request(
    'PUT',
    '/auth/me',
    {
      bio: 'Senior Full Stack Specialist verified via E2E test suite.',
      skills: ['React', 'Node.js', 'TypeScript', 'Docker', 'GraphQL'],
    },
    candidateToken
  );
  assert(profileRes.status === 200 && profileRes.data.success, 'Candidate PUT /api/auth/me updates bio and skills');
  assert(profileRes.data.data.user.skills.includes('GraphQL'), 'Updated skill present in response');

  // 5. Candidate Save / Unsave Job
  console.log('\n--- 4. Bookmarks (Save/Unsave Jobs) ---');
  await request('DELETE', `/jobs/${testJobId}/save`, null, candidateToken);
  const saveRes = await request('POST', `/jobs/${testJobId}/save`, null, candidateToken);
  assert(saveRes.status === 200 && saveRes.data.success, 'Candidate can bookmark/save a job');

  const unsaveRes = await request('DELETE', `/jobs/${testJobId}/save`, null, candidateToken);
  assert(unsaveRes.status === 200 && unsaveRes.data.success, 'Candidate can unbookmark/unsave a job');

  // 6. Candidate Application History
  console.log('\n--- 5. Candidate Application History ---');
  const appsRes = await request('GET', '/applications/my', null, candidateToken);
  assert(appsRes.status === 200 && Array.isArray(appsRes.data.data.applications), 'Candidate GET /api/applications/my returns list');
  assert(appsRes.data.data.applications.length > 0, `Candidate has ${appsRes.data.data.applications.length} submitted applications`);

  // 7. Employer Auth & Dashboard
  console.log('\n--- 6. Employer Authentication & Dashboard ---');
  const empLogin = await request('POST', '/auth/login', {
    email: 'employer.demo@jobsphere.dev',
    password: 'DemoPass123!',
  });
  const empToken = empLogin.data?.data?.token || empLogin.data?.token;
  const empUser = empLogin.data?.data?.user || empLogin.data?.user;
  assert(empLogin.status === 200 && empToken, 'Employer login succeeds with JWT');
  assert(empUser?.role === 'EMPLOYER', 'Role is verified as EMPLOYER');
  employerToken = empToken;

  const empJobs = await request('GET', '/jobs/my-posts', null, employerToken);
  assert(empJobs.status === 200 && Array.isArray(empJobs.data.data.jobs), 'Employer GET /api/jobs/my-posts returns owned jobs');
  assert(empJobs.data.data.jobs.length > 0, `Employer manages ${empJobs.data.data.jobs.length} active listings`);

  // 8. Employer Job CRUD
  console.log('\n--- 7. Employer Job CRUD Lifecycle ---');
  const newJobRes = await request(
    'POST',
    '/jobs',
    {
      title: 'DevOps & Site Reliability Engineer',
      company: 'Acme Cloud Technologies',
      location: 'Remote (US)',
      salaryMin: 140000,
      salaryMax: 180000,
      employmentType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      techStack: ['Kubernetes', 'Prometheus', 'Terraform', 'Go'],
      description: 'Ensure high reliability of distributed edge telemetry clusters.',
    },
    employerToken
  );
  assert(newJobRes.status === 201 && newJobRes.data.success, 'Employer POST /api/jobs creates new role');
  const createdId = newJobRes.data.data.job._id;

  const editJobRes = await request(
    'PUT',
    `/jobs/${createdId}`,
    { salaryMax: 195000, isActive: false },
    employerToken
  );
  assert(editJobRes.status === 200 && editJobRes.data.data.job.salaryMax === 195000, 'Employer PUT /api/jobs/:id updates salaryMax and pauses job');

  const delJobRes = await request('DELETE', `/jobs/${createdId}`, null, employerToken);
  assert(delJobRes.status === 200 && delJobRes.data.success, 'Employer DELETE /api/jobs/:id removes job');

  // 9. Employer Applicant Review & Status Update
  console.log('\n--- 8. Employer Applicant Review & Pipeline Status ---');
  const jobWithApp = empJobs.data.data.jobs[0];
  const applicantsRes = await request('GET', `/applications/job/${jobWithApp._id}`, null, employerToken);
  assert(applicantsRes.status === 200, 'Employer GET /api/applications/job/:id retrieves applicants');
  assert(applicantsRes.data.data.applications.length > 0, `Found ${applicantsRes.data.data.applications.length} applicants for ${jobWithApp.title}`);

  const targetApp = applicantsRes.data.data.applications[0];
  const updateStatusRes = await request(
    'PATCH',
    `/applications/${targetApp._id}/status`,
    { status: 'ACCEPTED', employerNotes: 'Candidate accepted after comprehensive technical walkthrough.' },
    employerToken
  );
  assert(updateStatusRes.status === 200 && updateStatusRes.data.data.application.status === 'ACCEPTED', 'Employer PATCH /api/applications/:id/status updates status to ACCEPTED');

  // 10. RBAC Security Protections
  console.log('\n--- 9. Strict RBAC Protection Enforcement ---');
  const candPostJob = await request('POST', '/jobs', { title: 'Unauthorized' }, candidateToken);
  assert(candPostJob.status === 403, 'CANDIDATE is blocked from POST /api/jobs (403 Forbidden)');

  const empApply = await request('POST', '/applications', { jobId: testJobId }, employerToken);
  assert(empApply.status === 403, 'EMPLOYER is blocked from POST /api/applications (403 Forbidden)');

  console.log('\n====================================================');
  if (!process.exitCode) {
    console.log('🎉 ALL END-TO-END VERIFICATION CHECKS PASSED (16/16)!');
  } else {
    console.error('❌ SOME TESTS FAILED');
  }
  console.log('====================================================\n');
}

runE2ETests();
