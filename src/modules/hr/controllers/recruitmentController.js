import * as service from "../services/recruitmentService.js";
import { response } from "../../../utils/response.js";

export async function listJobPostings(req, res, next) {
  try {
    const jobs = await service.listJobPostings(req.query);
    res.json(response.success(jobs));
  } catch (err) {
    next(err);
  }
}

export async function createJobPosting(req, res, next) {
  try {
    const job = await service.createJobPosting(req.body);
    res.status(201).json(response.success(job));
  } catch (err) {
    next(err);
  }
}

export async function getJobPostingById(req, res, next) {
  try {
    const job = await service.getJobPostingById(req.params.id);
    if (!job) return res.status(404).json(response.error("Job not found", 404));
    res.json(response.success(job));
  } catch (err) {
    next(err);
  }
}

export async function updateJobPostingById(req, res, next) {
  try {
    const job = await service.updateJobPostingById(req.params.id, req.body);
    res.json(response.success(job));
  } catch (err) {
    next(err);
  }
}

export async function archiveJobPostingById(req, res, next) {
  try {
    await service.archiveJobPostingById(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listCandidatesForJob(req, res, next) {
  try {
    const candidates = await service.listCandidatesForJob(req.params.id);
    res.json(response.success(candidates));
  } catch (err) {
    next(err);
  }
}

export async function createCandidateForJob(req, res, next) {
  try {
    const candidate = await service.createCandidateForJob(req.params.id, req.body);
    res.status(201).json(response.success(candidate));
  } catch (err) {
    next(err);
  }
}

export async function updateCandidateStage(req, res, next) {
  try {
    const candidate = await service.updateCandidateStage(req.params.candidateId, req.body.stage);
    res.json(response.success(candidate));
  } catch (err) {
    next(err);
  }
}

// Shortlist and scoring
export async function shortlistCandidates(req, res, next) {
  try {
    const result = await service.shortlistCandidates(req.params.id, req.body.criteria);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

export async function setCandidateScore(req, res, next) {
  try {
    const result = await service.setCandidateScore(req.params.candidateId, req.body.score);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

// Communications
export async function notifyCandidate(req, res, next) {
  try {
    const result = await service.notifyCandidate(req.params.candidateId, req.body);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

export async function updateCandidateStatusWithReason(req, res, next) {
  try {
    const result = await service.updateCandidateStatusWithReason(req.params.candidateId, req.body.stage, req.body.reason);
    res.json(response.success(result));
  } catch (err) {
    next(err);
  }
}

// Interviews
export async function scheduleInterview(req, res, next) {
  try {
    const interview = await service.scheduleInterview(req.body);
    res.status(201).json(response.success(interview));
  } catch (err) {
    next(err);
  }
}

export async function updateInterview(req, res, next) {
  try {
    const interview = await service.updateInterview(req.params.id, req.body);
    res.json(response.success(interview));
  } catch (err) {
    next(err);
  }
}

export async function listInterviewsForCandidate(req, res, next) {
  try {
    const interviews = await service.listInterviewsForCandidate(req.params.candidateId);
    res.json(response.success(interviews));
  } catch (err) {
    next(err);
  }
}

// KPIs
export async function getRecruitmentKpis(req, res, next) {
  try {
    const data = await service.getRecruitmentKpis(req.query);
    res.json(response.success(data));
  } catch (err) {
    next(err);
  }
}

// Offers and contracts
export async function generateOfferLetter(req, res, next) {
  try {
    const payload = await service.generateOfferLetter(req.params.candidateId, req.body);
    res.status(201).json(response.success(payload));
  } catch (err) {
    next(err);
  }
}

export async function createEmploymentContract(req, res, next) {
  try {
    const contract = await service.createEmploymentContract(req.params.candidateId, req.body);
    res.status(201).json(response.success(contract));
  } catch (err) {
    next(err);
  }
}

// Onboarding linkage
export async function createOnboardingChecklist(req, res, next) {
  try {
    const checklist = await service.createOnboardingChecklist(req.params.candidateId, req.body);
    res.status(201).json(response.success(checklist));
  } catch (err) {
    next(err);
  }
}


