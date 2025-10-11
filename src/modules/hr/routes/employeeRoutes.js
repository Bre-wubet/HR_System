import { Router } from "express";
import * as controller from "../controllers/employeeController.js";

const router = Router();

router.get("/", controller.listEmployees);
router.post("/", controller.createEmployee);
router.get("/departments", controller.listDepartments);
router.get("/managers", controller.listEmployeesForManagerSelection);
router.get("/skills", controller.listAllSkills);

// Directory search and org chart (must be before /:id routes)
router.get("/directory/search", controller.searchDirectory);
router.get("/org-chart", controller.getOrgChart); // ?rootId&depth=

// Parameterized routes (must be after specific routes)
router.get("/:id", controller.getEmployeeById);
router.put("/:id", controller.updateEmployeeById);
router.delete("/:id", controller.deleteEmployeeById);

// Skills
router.get("/:id/skills", controller.listEmployeeSkills);
router.post("/:id/skills", controller.addEmployeeSkill);
router.put("/:id/skills/:assignmentId", controller.updateEmployeeSkill);
router.delete("/:id/skills/:assignmentId", controller.removeEmployeeSkill);

// Certifications
router.get("/:id/certifications", controller.listEmployeeCertifications);
router.post("/:id/certifications", controller.addEmployeeCertification);
router.delete("/:id/certifications/:certId", controller.removeEmployeeCertification);

// Documents
router.get("/:id/documents", controller.listEmployeeDocuments);
router.post("/:id/documents", controller.addEmployeeDocument);
router.delete("/:id/documents/:docId", controller.removeEmployeeDocument);

// Evaluations (incl. probation-related)
router.get("/:id/evaluations", controller.listEmployeeEvaluations);
router.post("/:id/evaluations", controller.addEmployeeEvaluation);

// Career progression
router.post("/:id/promotion", controller.promoteEmployee);
router.post("/:id/transfer", controller.transferEmployee);
router.get("/:id/career-history", controller.getCareerProgressionHistory);
router.get("/career-progressions/pending", controller.getPendingCareerProgressions);
router.post("/career-progressions/:id/approve", controller.approveCareerProgression);
router.get("/career-progressions/analytics", controller.getCareerProgressionAnalytics);

// Probation lifecycle
router.post("/:id/probation/start", controller.startProbation);
router.post("/:id/probation/end", controller.endProbation);

// Offboarding
router.post("/:id/offboard", controller.offboardEmployee);

export default router;


