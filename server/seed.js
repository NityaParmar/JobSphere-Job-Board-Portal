require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Job = require('./src/models/Job');
const Application = require('./src/models/Application');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/job_board';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Clear existing collections
    console.log('Cleaning up existing collections...');
    await Application.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});

    // 1. Create Users
    console.log('Creating demo users...');
    const employer = await User.create({
      name: 'Acme Cloud Technologies',
      email: 'employer.demo@jobsphere.dev',
      password: 'DemoPass123!',
      role: 'EMPLOYER',
      phone: '+1 (555) 012-3456',
      bio: 'Leading developer of high-throughput distributed cloud infrastructure platforms.',
    });

    const candidate = await User.create({
      name: 'Alex Mercer',
      email: 'candidate.demo@jobsphere.dev',
      password: 'DemoPass123!',
      role: 'CANDIDATE',
      phone: '+1 (555) 234-5678',
      bio: 'Senior Full Stack Engineer with 6+ years experience in React, Node.js, and cloud architectures.',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker'],
    });

    const candidate2 = await User.create({
      name: 'Sarah Connor',
      email: 'sarah.connor@jobsphere.dev',
      password: 'DemoPass123!',
      role: 'CANDIDATE',
      phone: '+1 (555) 876-5432',
      bio: 'Backend & Platform Specialist focused on fault-tolerant systems and microservices.',
      skills: ['Go', 'Python', 'Kubernetes', 'AWS', 'PostgreSQL'],
    });

    // 2. Create Jobs
    console.log('Creating sample job listings...');
    const jobs = await Job.create([
      {
        title: 'Senior Full-Stack Engineer (React & Node)',
        company: 'Stripe',
        location: 'San Francisco, CA (Hybrid)',
        salaryMin: 150000,
        salaryMax: 195000,
        employmentType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        techStack: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
        description: `Join our Payments Core Engineering team to design, build, and maintain mission-critical APIs and developer dashboards.

Key Responsibilities:
• Architect resilient frontend interfaces using React, TypeScript, and modern state management.
• Build scalable backend microservices in Node.js processing millions of daily transactions.
• Collaborate with cross-functional teams of product managers, designers, and security engineers.
• Optimize queries, caching, and distributed database performance.

Requirements:
• 5+ years of software engineering experience with Node.js and modern JavaScript frameworks.
• Strong foundation in asynchronous programming, RESTful APIs, and database modeling.
• Excellent communication skills and passion for code quality, testing, and documentation.`,
        postedBy: employer._id,
        isActive: true,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Staff Distributed Systems Engineer',
        company: 'Cloudflare',
        location: 'Austin, TX (Remote)',
        salaryMin: 185000,
        salaryMax: 245000,
        employmentType: 'FULL_TIME',
        experienceLevel: 'LEAD',
        techStack: ['Go', 'Rust', 'Kubernetes', 'Docker'],
        description: `We are looking for an exceptional Staff Distributed Systems Engineer to scale our global edge network and DNS routing infrastructure.

Responsibilities:
• Design low-latency network protocols and distributed consensus mechanisms.
• Improve reliability, observability, and automated failure recovery across 300+ edge data centers.
• Mentor senior engineers and drive architectural roadmaps across platform squads.`,
        postedBy: employer._id,
        isActive: true,
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Frontend Architect (React & Design Systems)',
        company: 'Vercel',
        location: 'Remote',
        salaryMin: 160000,
        salaryMax: 215000,
        employmentType: 'FULL_TIME',
        experienceLevel: 'LEAD',
        techStack: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
        description: `Drive the next evolution of developer tool interfaces. You will champion accessibility, core web vitals, dynamic animations, and reusable design components across our cloud management console.`,
        postedBy: employer._id,
        isActive: true,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Cloud Platform & DevOps Lead',
        company: 'Datadog',
        location: 'New York, NY',
        salaryMin: 170000,
        salaryMax: 220000,
        employmentType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        techStack: ['AWS', 'Kubernetes', 'Terraform', 'Python'],
        description: `Scale infrastructure automation, multi-region failover, and zero-trust security postures for telemetry data ingestion.`,
        postedBy: employer._id,
        isActive: true,
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Backend Engineer (Node.js & MongoDB)',
        company: 'MongoDB',
        location: 'Remote',
        salaryMin: 130000,
        salaryMax: 175000,
        employmentType: 'FULL_TIME',
        experienceLevel: 'MID',
        techStack: ['Node.js', 'MongoDB', 'Express', 'TypeScript'],
        description: `Build high-performance internal developer tooling, aggregation pipeline query optimizers, and automated test environments.`,
        postedBy: employer._id,
        isActive: true,
        applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Machine Learning Infrastructure Engineer',
        company: 'Anthropic',
        location: 'San Francisco, CA',
        salaryMin: 195000,
        salaryMax: 260000,
        employmentType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        techStack: ['Python', 'PyTorch', 'AWS', 'Docker'],
        description: `Support large-scale model training clusters and low-latency inference pipelines with robust GPU orchestration.`,
        postedBy: employer._id,
        isActive: true,
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Junior Frontend Developer',
        company: 'Shopify',
        location: 'Remote',
        salaryMin: 80000,
        salaryMax: 110000,
        employmentType: 'FULL_TIME',
        experienceLevel: 'JUNIOR',
        techStack: ['React', 'JavaScript', 'HTML/CSS'],
        description: `Collaborate with seasoned engineers to build accessible storefront components and merchant tools. Great mentorship program!`,
        postedBy: employer._id,
        isActive: true,
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Security & Auth Specialist',
        company: 'Okta',
        location: 'Seattle, WA',
        salaryMin: 165000,
        salaryMax: 210000,
        employmentType: 'CONTRACT',
        experienceLevel: 'SENIOR',
        techStack: ['Node.js', 'AWS', 'Python'],
        description: `Audit token lifecycles, OAuth 2.1 implementations, RBAC systems, and cryptographic hashing security standards.`,
        postedBy: employer._id,
        isActive: true,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ]);

    // 3. Create Applications
    console.log('Creating sample applications...');
    await Application.create([
      {
        job: jobs[0]._id, // Stripe Senior Full Stack
        candidate: candidate._id,
        resumeS3Key: 'resumes/demo-alex-mercer-resume.pdf',
        coverLetter:
          'I have spent 5+ years building fintech APIs and reactive UIs. Stripe has always been my benchmark for developer experience and engineering excellence.',
        status: 'INTERVIEW',
        employerNotes: 'Excellent technical portfolio. Scheduled technical screening for Friday 2pm EST.',
      },
      {
        job: jobs[2]._id, // Vercel
        candidate: candidate._id,
        resumeS3Key: 'resumes/demo-alex-mercer-resume.pdf',
        coverLetter: 'Passionate about frontend performance, design tokens, and Next.js ecosystem innovations.',
        status: 'PENDING',
      },
      {
        job: jobs[0]._id, // Stripe Senior Full Stack
        candidate: candidate2._id,
        resumeS3Key: 'resumes/demo-sarah-connor-resume.pdf',
        coverLetter:
          'Experienced with high-concurrency microservices, distributed transaction rollback mechanisms, and containerized architectures.',
        status: 'PENDING',
      },
    ]);

    // 4. Update Candidate Saved Jobs
    console.log('Setting candidate saved jobs...');
    candidate.savedJobs = [jobs[1]._id, jobs[3]._id]; // Cloudflare and Datadog
    await candidate.save();

    console.log('----------------------------------------------------');
    console.log('Database seeded successfully!');
    console.log('');
    console.log('Demo Accounts:');
    console.log('  Employer:  employer.demo@jobsphere.dev  /  DemoPass123!');
    console.log('  Candidate: candidate.demo@jobsphere.dev /  DemoPass123!');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
