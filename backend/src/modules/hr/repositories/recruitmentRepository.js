import { prisma } from "../../../config/db.js";

export function findJobPostings({ q, isActive } = {}) {
  const where = {
    AND: [q ? { title: { contains: q, mode: "insensitive" } } : {}, typeof isActive === "boolean" ? { isActive } : {}],
  };
  return prisma.jobPosting.findMany({ 
    where, 
    orderBy: { createdAt: "desc" },
    include: {
      department: true,
      candidates: true,
      skills: {
        include: {
          skill: true
        }
      }
    }
  });
}

export function createJobPosting(data) {
  return prisma.jobPosting.create({ data });
}

export function findJobPostingById(id) {
  return prisma.jobPosting.findUnique({ where: { id } });
}

export function updateJobPostingById(id, data) {
  return prisma.jobPosting.update({ where: { id }, data });
}

export function archiveJobPostingById(id) {
  return prisma.jobPosting.update({ where: { id }, data: { isActive: false } });
}

export function findCandidatesForJob(jobId) {
  return prisma.candidate.findMany({ where: { jobPostingId: jobId }, orderBy: { createdAt: "desc" } });
}

export function createCandidateForJob(jobId, data) {
  return prisma.candidate.create({ data: { ...data, jobPostingId: jobId } });
}

export function updateCandidateStage(candidateId, stage) {
  return prisma.candidate.update({ where: { id: candidateId }, data: { stage } });
}

// Shortlist based on simple criteria (score threshold, skills, source)
export async function shortlistCandidates(jobId, { minScore = 0 } = {}) {
  const candidates = await prisma.candidate.findMany({ where: { jobPostingId: jobId }, orderBy: { createdAt: "desc" } });
  const shortlisted = candidates.filter((c) => (c.score || 0) >= minScore);
  return { total: candidates.length, shortlisted: shortlisted.length, candidates: shortlisted };
}

export function setCandidateScore(candidateId, score) {
  return prisma.candidate.update({ where: { id: candidateId }, data: { score } });
}

// Communications (stub records for audit)
export async function notifyCandidate(candidateId, { subject, message, channel }) {
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) throw new Error("Candidate not found");
  // In real implementation, integrate email/SMS provider
  return { candidateId, channel, subject, message, sentAt: new Date().toISOString() };
}

export function updateCandidateStatusWithReason(candidateId, stage, reason) {
  return prisma.candidate.update({ where: { id: candidateId }, data: { stage, feedback: reason || null } });
}

// Interviews
export function scheduleInterview({ candidateId, interviewerId, date, feedback, rating }) {
  return prisma.interview.create({ data: { candidateId, interviewerId, date: new Date(date), feedback: feedback || null, rating: rating || null } });
}

export function updateInterview(id, { date, feedback, rating }) {
  return prisma.interview.update({ where: { id }, data: { date: date ? new Date(date) : undefined, feedback, rating } });
}

export function listInterviewsForCandidate(candidateId) {
  return prisma.interview.findMany({ where: { candidateId }, orderBy: { date: "desc" } });
}

// KPIs
export async function getRecruitmentKpis({ from, to } = {}) {
  const dateFilter = {
    gte: from ? new Date(from) : undefined,
    lte: to ? new Date(to) : undefined,
  };
  const jobs = await prisma.jobPosting.findMany({ where: { createdAt: dateFilter } });
  const candidates = await prisma.candidate.findMany({ where: { createdAt: dateFilter } });
  const hired = candidates.filter((c) => c.stage === "HIRED");
  // Naive KPIs
  const timeToHire = hired.length
    ? hired.reduce((acc, c) => acc + 0, 0) / hired.length // placeholder until we track applied->hired timestamps
    : 0;
  const costPerHire = 0; // requires spend tracking
  const sourceEffectiveness = []; // requires source field
  return { totals: { jobs: jobs.length, candidates: candidates.length, hired: hired.length }, metrics: { timeToHire, costPerHire, sourceEffectiveness } };
}

// Offers and contracts
export async function generateOfferLetter(candidateId, { salary, startDate, position, template = "standard" }) {
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId }, include: { jobPosting: true } });
  if (!candidate) throw new Error("Candidate not found");
  const offer = {
    candidateId,
    title: `Offer for ${candidate.firstName} ${candidate.lastName}`,
    position: position || candidate.jobPosting?.title || "",
    salary,
    startDate,
    template,
    generatedAt: new Date().toISOString(),
  };
  return offer;
}

export async function createEmploymentContract(candidateId, { employeeId, startDate, endDate, document }) {
  // Link contract to created employee if exists
  if (!employeeId) throw new Error("employeeId is required to create contract");
  return prisma.contract.create({ data: { employeeId, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, document: document || null } });
}

// Onboarding linkage
export async function createOnboardingChecklist(candidateId, { tasks = [] } = {}) {
  // Store as an employee document for now for traceability
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) throw new Error("Candidate not found");
  const checklist = { title: `Onboarding for ${candidate.firstName} ${candidate.lastName}`, tasks };
  return checklist;
}

// Helpers used by service guards
export function findDepartmentById(id) {
  return prisma.department.findUnique({ where: { id } });
}

export function findJobPostingByIdWithDept(id) {
  return prisma.jobPosting.findUnique({ 
    where: { id }, 
    include: { 
      department: true,
      candidates: true,
      skills: {
        include: {
          skill: true
        }
      }
    } 
  });
}

export function findCandidateById(id) {
  return prisma.candidate.findUnique({ where: { id }, include: { jobPosting: true } });
}

export function findCandidateByEmailForJob(jobPostingId, email) {
  return prisma.candidate.findFirst({ where: { jobPostingId, email } });
}

export function findEmployeeById(id) {
  return prisma.employee.findUnique({ where: { id } });
}

// Hire transaction: create employee, update candidate to HIRED, optional contract
export async function hireCandidate(candidateId, { jobType, salary, managerId, startDate }) {
  return prisma.$transaction(async (tx) => {
    const candidate = await tx.candidate.findUnique({ where: { id: candidateId }, include: { jobPosting: true } });
    if (!candidate) {
      const error = new Error("Candidate not found");
      error.statusCode = 404;
      error.code = 'CANDIDATE_NOT_FOUND';
      throw error;
    }
    if (candidate.stage === 'HIRED') {
      const error = new Error("Candidate already hired");
      error.statusCode = 400;
      error.code = 'CANDIDATE_ALREADY_HIRED';
      throw error;
    }

    const job = candidate.jobPosting;
    if (!job) {
      const error = new Error("Candidate is not linked to a job posting");
      error.statusCode = 400;
      error.code = 'JOB_NOT_FOUND_FOR_CANDIDATE';
      throw error;
    }

    const department = await tx.department.findUnique({ where: { id: job.departmentId } });
    if (!department) {
      const error = new Error("Department not found for job posting");
      error.statusCode = 400;
      error.code = 'DEPARTMENT_NOT_FOUND';
      throw error;
    }

    if (managerId) {
      const manager = await tx.employee.findUnique({ where: { id: managerId } });
      if (!manager) {
        const error = new Error(`Manager with ID ${managerId} not found`);
        error.statusCode = 400;
        error.code = 'MANAGER_NOT_FOUND';
        throw error;
      }
    }

    const employee = await tx.employee.create({
      data: {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone || null,
        jobType,
        jobTitle: job.title,
        departmentId: department.id,
        managerId: managerId || null,
        salary: salary || null,
        hireDate: new Date(startDate),
      },
    });

    await tx.candidate.update({ where: { id: candidate.id }, data: { stage: 'HIRED', feedback: 'Converted to employee' } });

    return { employee };
  });
}


