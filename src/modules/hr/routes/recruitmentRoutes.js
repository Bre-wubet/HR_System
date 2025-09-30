import { Router } from "express";
import * as controller from "../controllers/recruitmentController.js";

const router = Router();

router.get("/jobs", controller.listJobPostings);
router.post("/jobs", controller.createJobPosting);
router.get("/jobs/:id", controller.getJobPostingById);
router.put("/jobs/:id", controller.updateJobPostingById);
router.delete("/jobs/:id", controller.archiveJobPostingById);

router.get("/jobs/:id/candidates", controller.listCandidatesForJob);
router.post("/jobs/:id/candidates", controller.createCandidateForJob);
router.put("/candidates/:candidateId/stage", controller.updateCandidateStage);

// Shortlist and scoring
router.post("/jobs/:id/shortlist", controller.shortlistCandidates);
router.put("/candidates/:candidateId/score", controller.setCandidateScore);

// Communications
router.post("/candidates/:candidateId/notify", controller.notifyCandidate);
router.post("/candidates/:candidateId/status", controller.updateCandidateStatusWithReason);

// Interviews
router.post("/interviews", controller.scheduleInterview);
router.put("/interviews/:id", controller.updateInterview);
router.get("/candidates/:candidateId/interviews", controller.listInterviewsForCandidate);

// KPIs
router.get("/kpis", controller.getRecruitmentKpis);

// Offers and contracts
router.post("/offers/:candidateId", controller.generateOfferLetter);
router.post("/contracts/:candidateId", controller.createEmploymentContract);

// Onboarding linkage
router.post("/onboarding/:candidateId", controller.createOnboardingChecklist);

export default router;


