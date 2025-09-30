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


