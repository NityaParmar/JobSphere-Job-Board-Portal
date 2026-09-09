/**
 * Phase 4 Integration Test Script
 * Tests: Application CRUD, RBAC, Multer validation, S3 upload flow
 *
 * NOTE: Tests marked [S3] require valid AWS credentials and a configured bucket.
 *       Other tests work without AWS and validate the non-S3 logic.
 *
 * Run with: node test_applications.js
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

/**
 * Send a multipart/form-data request with a file.
 */
async function uploadRequest(path, fields, file, token) {
  const formData = new FormData();

  // Add text fields
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  // Add file
  if (file) {
    const blob = new Blob([file.buffer], { type: file.contentType });
    formData.append('resume', blob, file.name);
  }

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

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

// Create a minimal valid PDF buffer (PDF header + minimal structure)
function createFakePdf(sizeInBytes = 1024) {
  const header = Buffer.from('%PDF-1.4\n');
  const padding = Buffer.alloc(Math.max(0, sizeInBytes - header.length), 0x20);
  return Buffer.concat([header, padding]);
}

// Create a non-PDF file
function createFakeTextFile(sizeInBytes = 1024) {
  return Buffer.alloc(sizeInBytes, 0x41); // All 'A' characters
}

async function runTests() {
  const ts = Date.now();
  const hasS3 = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
  );

  console.log('\n=== PHASE 4: Application & Upload Tests ===\n');
  if (!hasS3) {
    console.log('⚠️  AWS credentials not configured. S3-dependent tests will be skipped.\n');
  }

  // --- Setup: Register users & create a job ---
  console.log('0. Setup: Register users & create job');
  let res = await request('POST', '/auth/register', {
    name: 'App Employer',
    email: `app_emp_${ts}@test.com`,
    password: 'password123',
    role: 'EMPLOYER',
  });
  const employerToken = res.data.data.token;

  res = await request('POST', '/auth/register', {
    name: 'App Candidate',
    email: `app_cand_${ts}@test.com`,
    password: 'password123',
    role: 'CANDIDATE',
  });
  const candidateToken = res.data.data.token;

  res = await request('POST', '/auth/register', {
    name: 'Other Employer',
    email: `app_emp2_${ts}@test.com`,
    password: 'password123',
    role: 'EMPLOYER',
  });
  const otherEmployerToken = res.data.data.token;

  res = await request('POST', '/jobs', {
    title: 'Test Application Job',
    description: 'This job is for testing the application flow end to end with resume uploads.',
    company: 'TestCo',
    location: 'Remote',
    salaryMin: 60000,
    salaryMax: 90000,
    techStack: ['JavaScript'],
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
  }, employerToken);
  const jobId = res.data.data.job._id;
  console.log('  ✅ Setup complete');

  // --- Test 1: RBAC — Employer cannot apply to jobs ---
  console.log('1. RBAC: Employer cannot apply');
  res = await uploadRequest('/applications', { jobId }, {
    buffer: createFakePdf(),
    contentType: 'application/pdf',
    name: 'resume.pdf',
  }, employerToken);
  assert(res.status === 403, `Status 403 (got ${res.status})`);

  // --- Test 2: Reject non-PDF file ---
  console.log('2. Reject non-PDF file');
  res = await uploadRequest('/applications', { jobId }, {
    buffer: createFakeTextFile(),
    contentType: 'text/plain',
    name: 'resume.txt',
  }, candidateToken);
  assert(res.status === 400, `Status 400 (got ${res.status})`);
  assert(
    res.data.message.includes('PDF') || res.data.message.includes('pdf'),
    'Error mentions PDF'
  );

  // --- Test 3: Reject request without file ---
  console.log('3. Reject request without resume file');
  res = await uploadRequest('/applications', { jobId }, null, candidateToken);
  assert(res.status === 400, `Status 400 (got ${res.status})`);

  // --- Test 4: Reject application without jobId ---
  console.log('4. Reject without jobId');
  res = await uploadRequest('/applications', {}, {
    buffer: createFakePdf(),
    contentType: 'application/pdf',
    name: 'resume.pdf',
  }, candidateToken);
  assert(res.status === 400, `Status 400 (got ${res.status})`);

  // --- Test 5: Reject application to non-existent job ---
  console.log('5. Reject application to non-existent job');
  res = await uploadRequest('/applications', { jobId: '000000000000000000000000' }, {
    buffer: createFakePdf(),
    contentType: 'application/pdf',
    name: 'resume.pdf',
  }, candidateToken);
  assert(res.status === 404, `Status 404 (got ${res.status})`);

  // --- Test 6: RBAC — candidate cannot view applicants for a job ---
  console.log('6. RBAC: Candidate cannot view applicants');
  res = await request('GET', `/applications/job/${jobId}`, null, candidateToken);
  assert(res.status === 403, `Status 403 (got ${res.status})`);

  // --- Test 7: RBAC — candidate cannot update application status ---
  console.log('7. RBAC: Candidate cannot update application status');
  res = await request('PATCH', '/applications/000000000000000000000000/status', {
    status: 'INTERVIEW',
  }, candidateToken);
  assert(res.status === 403, `Status 403 (got ${res.status})`);

  // --- Test 8: GET /applications/my without applications ---
  console.log('8. Candidate: My applications (empty)');
  res = await request('GET', '/applications/my', null, candidateToken);
  assert(res.status === 200, `Status 200 (got ${res.status})`);
  assert(res.data.data.count === 0, `No applications yet (got ${res.data.data.count})`);

  // --- Test 9: Employer cannot see other employer's job applicants ---
  console.log('9. Employer ownership: Cannot see other employer\'s applicants');
  res = await request('GET', `/applications/job/${jobId}`, null, otherEmployerToken);
  assert(res.status === 403, `Status 403 (got ${res.status})`);

  // --- S3-dependent tests ---
  if (hasS3) {
    console.log('\n--- S3 Integration Tests ---\n');

    // --- Test 10: Successful application with resume upload ---
    console.log('10. [S3] Apply to job with resume');
    res = await uploadRequest('/applications', {
      jobId,
      coverLetter: 'I am excited to apply for this position.',
    }, {
      buffer: createFakePdf(2048),
      contentType: 'application/pdf',
      name: 'my_resume.pdf',
    }, candidateToken);
    assert(res.status === 201, `Status 201 (got ${res.status})`);
    assert(res.data.data.application.resumeUrl.startsWith('resumes/'), 'Storage path starts with resumes/');
    assert(res.data.data.application.resumeUrl.endsWith('.pdf'), 'Storage path ends with .pdf');
    assert(res.data.data.application.status === 'PENDING', 'Status is PENDING');
    assert(res.data.data.application.coverLetter === 'I am excited to apply for this position.', 'Cover letter saved');
    const applicationId = res.data.data.application._id;

    // --- Test 11: Duplicate application rejected ---
    console.log('11. [S3] Duplicate application rejected');
    res = await uploadRequest('/applications', { jobId }, {
      buffer: createFakePdf(),
      contentType: 'application/pdf',
      name: 'resume2.pdf',
    }, candidateToken);
    assert(res.status === 409, `Status 409 (got ${res.status})`);

    // --- Test 12: Candidate sees application in history ---
    console.log('12. [S3] Candidate: My applications');
    res = await request('GET', '/applications/my', null, candidateToken);
    assert(res.status === 200, `Status 200 (got ${res.status})`);
    assert(res.data.data.count >= 1, `At least 1 application (got ${res.data.data.count})`);

    // --- Test 13: Employer views applicants ---
    console.log('13. [S3] Employer: View applicants for job');
    res = await request('GET', `/applications/job/${jobId}`, null, employerToken);
    assert(res.status === 200, `Status 200 (got ${res.status})`);
    assert(res.data.data.count >= 1, `At least 1 applicant (got ${res.data.data.count})`);
    assert(res.data.data.applications[0].candidate.name === 'App Candidate', 'Candidate populated');

    // --- Test 14: Employer updates status ---
    console.log('14. [S3] Employer: Update status to INTERVIEW');
    res = await request('PATCH', `/applications/${applicationId}/status`, {
      status: 'INTERVIEW',
      employerNotes: 'Strong candidate, schedule interview.',
    }, employerToken);
    assert(res.status === 200, `Status 200 (got ${res.status})`);
    assert(res.data.data.application.status === 'INTERVIEW', 'Status updated to INTERVIEW');
    assert(res.data.data.application.employerNotes === 'Strong candidate, schedule interview.', 'Notes saved');

    // --- Test 15: Get pre-signed resume URL (candidate) ---
    console.log('15. [S3] Candidate: Get pre-signed resume URL');
    res = await request('GET', `/applications/${applicationId}/resume`, null, candidateToken);
    assert(res.status === 200, `Status 200 (got ${res.status})`);
    assert(res.data.data.resumeUrl.includes('X-Amz-Signature'), 'Pre-signed URL contains signature');
    assert(res.data.data.expiresIn === '15 minutes', 'Expiry is 15 minutes');

    // --- Test 16: Get pre-signed resume URL (employer) ---
    console.log('16. [S3] Employer: Get pre-signed resume URL');
    res = await request('GET', `/applications/${applicationId}/resume`, null, employerToken);
    assert(res.status === 200, `Status 200 (got ${res.status})`);
    assert(res.data.data.resumeUrl.includes('X-Amz-Signature'), 'Pre-signed URL for employer');

    // --- Test 17: Other employer cannot see resume ---
    console.log('17. [S3] Other employer: Cannot see resume');
    res = await request('GET', `/applications/${applicationId}/resume`, null, otherEmployerToken);
    assert(res.status === 403, `Status 403 (got ${res.status})`);

    // --- Test 18: Employer: Status filter ---
    console.log('18. [S3] Employer: Filter by status');
    res = await request('GET', `/applications/job/${jobId}?status=INTERVIEW`, null, employerToken);
    assert(res.status === 200, `Status 200 (got ${res.status})`);
    const allInterview = res.data.data.applications.every((a) => a.status === 'INTERVIEW');
    assert(allInterview, 'All filtered applications are INTERVIEW');

    // --- Test 19: Employer: Update to ACCEPTED ---
    console.log('19. [S3] Employer: Update status to ACCEPTED');
    res = await request('PATCH', `/applications/${applicationId}/status`, {
      status: 'ACCEPTED',
    }, employerToken);
    assert(res.status === 200, `Status 200 (got ${res.status})`);
    assert(res.data.data.application.status === 'ACCEPTED', 'Status updated to ACCEPTED');
  } else {
    console.log('\n--- Skipped S3 tests (10-19). Set AWS env vars to run them. ---\n');
  }

  // --- Test 20: Reject file over 5MB ---
  console.log('20. Reject file over 5MB');
  const oversizedPdf = createFakePdf(6 * 1024 * 1024); // 6MB
  res = await uploadRequest('/applications', { jobId }, {
    buffer: oversizedPdf,
    contentType: 'application/pdf',
    name: 'huge_resume.pdf',
  }, candidateToken);
  assert(res.status === 413, `Status 413 (got ${res.status})`);

  console.log(`\n=== Phase 4 Results: ${passed} passed, ${failed} failed ===\n`);
  process.exitCode = failed > 0 ? 1 : 0;
}

runTests().catch((err) => {
  console.error('Test runner failed:', err.message);
  process.exit(1);
});
