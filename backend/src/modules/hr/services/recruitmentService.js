import * as repo from "../repositories/recruitmentRepository.js";

export function listJobPostings(query) {
  return repo.findJobPostings(query);
}

export function createJobPosting(data) {
  return repo.createJobPosting(data);
}

export function getJobPostingById(id) {
  return repo.findJobPostingById(id);
}

export function updateJobPostingById(id, data) {
  return repo.updateJobPostingById(id, data);
}

export function archiveJobPostingById(id) {
  return repo.archiveJobPostingById(id);
}

export function listCandidatesForJob(jobId) {
  return repo.findCandidatesForJob(jobId);
}

export function listAllCandidates(query) {
  return repo.findAllCandidates(query);
}

export function createCandidateForJob(jobId, data) {
  return repo.createCandidateForJob(jobId, data);
}

export function updateCandidateStage(candidateId, stage) {
  return repo.updateCandidateStage(candidateId, stage);
}

// Shortlist and scoring
export function shortlistCandidates(jobId, criteria) {
  return repo.shortlistCandidates(jobId, criteria);
}

export function setCandidateScore(candidateId, score) {
  return repo.setCandidateScore(candidateId, score);
}

// Communications
export function notifyCandidate(candidateId, { subject, message, channel = "email" }) {
  return repo.notifyCandidate(candidateId, { subject, message, channel });
}

export function updateCandidateStatusWithReason(candidateId, stage, reason) {
  return repo.updateCandidateStatusWithReason(candidateId, stage, reason);
}

// Interviews
export function scheduleInterview(payload) {
  return repo.scheduleInterview(payload);
}

export function updateInterview(id, payload) {
  return repo.updateInterview(id, payload);
}

export function listInterviewsForCandidate(candidateId) {
  return repo.listInterviewsForCandidate(candidateId);
}

export function listAllInterviews(query) {
  return repo.findAllInterviews(query);
}

// KPIs
export function getRecruitmentKpis(query) {
  return repo.getRecruitmentKpis(query);
}

// Offers and contracts
export function generateOfferLetter(candidateId, data) {
  return repo.generateOfferLetter(candidateId, data);
}

export function createEmploymentContract(candidateId, data) {
  return repo.createEmploymentContract(candidateId, data);
}

// Onboarding linkage
export function createOnboardingChecklist(candidateId, data) {
  return repo.createOnboardingChecklist(candidateId, data);
}

// Guards and domain rules mirroring employee patterns
export async function createJobPostingWithGuards(data) {
  const department = await repo.findDepartmentById(data.departmentId);
  if (!department) {
    const error = new Error(`Department with ID ${data.departmentId} does not exist`);
    error.statusCode = 400;
    error.code = 'DEPARTMENT_NOT_FOUND';
    throw error;
  }
  return repo.createJobPosting(data);
}

export async function createCandidateForJobWithGuards(jobId, data) {
  const job = await repo.findJobPostingByIdWithDept(jobId);
  if (!job) {
    const error = new Error(`Job posting with ID ${jobId} not found`);
    error.statusCode = 404;
    error.code = 'JOB_NOT_FOUND';
    throw error;
  }
  if (!job.isActive) {
    const error = new Error(`Job posting ${jobId} is not active`);
    error.statusCode = 400;
    error.code = 'JOB_INACTIVE';
    throw error;
  }
  const duplicate = await repo.findCandidateByEmailForJob(jobId, data.email);
  if (duplicate) {
    const error = new Error(`Candidate with email ${data.email} already applied to this job`);
    error.statusCode = 400;
    error.code = 'CANDIDATE_DUPLICATE';
    throw error;
  }
  return repo.createCandidateForJob(jobId, data);
}

const VALID_STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];
const ALLOWED_TRANSITIONS = {
  APPLIED: ["SCREENING", "REJECTED"],
  SCREENING: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
  OFFER: ["HIRED", "REJECTED"],
  REJECTED: [],
  HIRED: [],
};

export async function updateCandidateStageWithGuards(candidateId, nextStage) {
  if (!VALID_STAGES.includes(nextStage)) {
    const error = new Error(`Invalid stage: ${nextStage}`);
    error.statusCode = 400;
    error.code = 'INVALID_STAGE';
    throw error;
  }
  const candidate = await repo.findCandidateById(candidateId);
  if (!candidate) {
    const error = new Error(`Candidate with ID ${candidateId} not found`);
    error.statusCode = 404;
    error.code = 'CANDIDATE_NOT_FOUND';
    throw error;
  }
  if (!candidate.jobPosting?.isActive && nextStage !== 'REJECTED') {
    const error = new Error('Cannot progress candidate: job is inactive');
    error.statusCode = 400;
    error.code = 'JOB_INACTIVE';
    throw error;
  }
  const currentStage = candidate.stage;
  const allowed = ALLOWED_TRANSITIONS[currentStage] || [];
  if (!allowed.includes(nextStage)) {
    const error = new Error(`Invalid transition from ${currentStage} to ${nextStage}`);
    error.statusCode = 400;
    error.code = 'INVALID_STAGE_TRANSITION';
    throw error;
  }
  return repo.updateCandidateStage(candidateId, nextStage);
}

export function hireCandidate(candidateId, data) {
  return repo.hireCandidate(candidateId, data);
}


