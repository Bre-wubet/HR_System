import { Router } from "express";
import * as controller from "../controllers/recruitmentController.js";
import { 
  authenticateToken, 
  requirePermission, 
  requireAnyPermission 
} from "../../../middlewares/authMiddleware.js";

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Job postings - require recruitment permissions
router.get("/jobs", requirePermission("recruitment:read"), controller.listJobPostings);
router.post("/jobs", requirePermission("recruitment:create"), controller.createJobPosting);
router.get("/jobs/:id", requirePermission("recruitment:read"), controller.getJobPostingById);
router.put("/jobs/:id", requirePermission("recruitment:update"), controller.updateJobPostingById);
router.patch("/jobs/:id/archive", requirePermission("recruitment:update"), controller.archiveJobPostingById);
router.delete("/jobs/:id", requirePermission("recruitment:delete"), controller.deleteJobPostingById);

// Candidates - require recruitment permissions
router.get("/candidates", requirePermission("recruitment:read"), controller.listAllCandidates);
router.get("/jobs/:id/candidates", requirePermission("recruitment:read"), controller.listCandidatesForJob);
router.post("/jobs/:id/candidates", requirePermission("recruitment:create"), controller.createCandidateForJob);
router.put("/candidates/:candidateId/stage", requirePermission("recruitment:update"), controller.updateCandidateStage);
router.delete("/candidates/:candidateId", requirePermission("recruitment:delete"), controller.deleteCandidate);
router.post("/candidates/:candidateId/hire", requirePermission("recruitment:update"), controller.hireCandidate);

// Shortlist and scoring - require recruitment update permission
router.post("/jobs/:id/shortlist", requirePermission("recruitment:update"), controller.shortlistCandidates);
router.put("/candidates/:candidateId/score", requirePermission("recruitment:update"), controller.setCandidateScore);

// Communications - require recruitment update permission
router.post("/candidates/:candidateId/notify", requirePermission("recruitment:update"), controller.notifyCandidate);
router.post("/candidates/:candidateId/status", requirePermission("recruitment:update"), controller.updateCandidateStatusWithReason);

// Interviews - require recruitment permissions
router.get("/interviews", requirePermission("recruitment:read"), controller.listAllInterviews);
router.post("/interviews", requirePermission("recruitment:create"), controller.scheduleInterview);
router.put("/interviews/:id", requirePermission("recruitment:update"), controller.updateInterview);
router.delete("/interviews/:id", requirePermission("recruitment:delete"), controller.deleteInterview);
router.get("/candidates/:candidateId/interviews", requirePermission("recruitment:read"), controller.listInterviewsForCandidate);

// KPIs - require recruitment read permission
router.get("/kpis", requirePermission("recruitment:read"), controller.getRecruitmentKpis);

// Offers and contracts - require recruitment create permission
router.post("/offers/:candidateId", requirePermission("recruitment:create"), controller.generateOfferLetter);
router.post("/contracts/:candidateId", requirePermission("recruitment:create"), controller.createEmploymentContract);

// Onboarding linkage - require recruitment create permission
router.post("/onboarding/:candidateId", requirePermission("recruitment:create"), controller.createOnboardingChecklist);

// Candidate Document Management - require recruitment permissions
router.get("/candidates/:candidateId", requirePermission("recruitment:read"), controller.getCandidateById);
router.get("/candidates/:candidateId/documents", requirePermission("recruitment:read"), controller.listCandidateDocuments);
router.post("/candidates/:candidateId/documents", requirePermission("recruitment:create"), controller.addCandidateDocument);
router.delete("/candidates/:candidateId/documents/:docId", requirePermission("recruitment:delete"), controller.removeCandidateDocument);

export default router;


