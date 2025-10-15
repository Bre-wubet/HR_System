import * as repo from "../repositories/employeeRepository.js";

export async function listEmployees({ query }) {
  const { q, departmentId, status, take, skip } = query || {};
  return repo.findMany({ q, departmentId, status, take: Number(take) || 20, skip: Number(skip) || 0 });
}

export async function createEmployee(payload) {
  // Validate that department exists
  const department = await repo.findDepartmentById(payload.departmentId);
  if (!department) {
    const error = new Error(`Department with ID ${payload.departmentId} does not exist`);
    error.statusCode = 400;
    error.code = 'DEPARTMENT_NOT_FOUND';
    throw error;
  }
  
  // Validate that manager exists if provided
  if (payload.managerId) {
    const manager = await repo.findById(payload.managerId);
    if (!manager) {
      const error = new Error(`Manager with ID ${payload.managerId} does not exist`);
      error.statusCode = 400;
      error.code = 'MANAGER_NOT_FOUND';
      throw error;
    }
  }
  
  // Transform data for Prisma
  const transformedPayload = { ...payload };
  
  // Convert date strings to Date objects
  if (transformedPayload.dob) {
    transformedPayload.dob = new Date(transformedPayload.dob);
  }
  if (transformedPayload.hireDate) {
    transformedPayload.hireDate = new Date(transformedPayload.hireDate);
  }
  
  return repo.create(transformedPayload);
}

export async function getEmployeeById(id) {
  return repo.findById(id);
}

export async function listDepartments() {
  return repo.findAllDepartments();
}

export async function listEmployeesForManagerSelection() {
  return repo.findManyForManagerSelection();
}

export async function updateEmployeeById(id, payload) {
  // Transform data for Prisma
  const transformedPayload = { ...payload };
  
  // Convert date strings to Date objects
  if (transformedPayload.dob) {
    transformedPayload.dob = new Date(transformedPayload.dob);
  }
  if (transformedPayload.hireDate) {
    transformedPayload.hireDate = new Date(transformedPayload.hireDate);
  }
  
  return repo.updateById(id, transformedPayload);
}

export async function deleteEmployeeById(id) {
  return repo.deleteById(id);
}

// Directory search and org chart
export function searchDirectory(query) {
  return repo.searchDirectory(query);
}

export function getOrgChart({ rootId, depth }) {
  return repo.getOrgChart({ rootId, depth });
}

// Skills
export function listEmployeeSkills(employeeId) {
  return repo.listEmployeeSkills(employeeId);
}

export async function addEmployeeSkill(employeeId, data) {
  // Validate that employee exists
  const employee = await repo.findById(employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  
  // Validate that skill exists
  const skill = await repo.findSkillById(data.skillId);
  if (!skill) {
    const error = new Error(`Skill with ID ${data.skillId} not found`);
    error.statusCode = 400;
    error.code = 'SKILL_NOT_FOUND';
    throw error;
  }
  
  // Check if employee already has this skill
  const existingAssignment = await repo.findSkillAssignment(employeeId, data.skillId);
  if (existingAssignment) {
    const error = new Error(`Employee already has skill ${skill.name}`);
    error.statusCode = 400;
    error.code = 'SKILL_ALREADY_ASSIGNED';
    throw error;
  }
  
  return repo.addEmployeeSkill(employeeId, data);
}

export async function listAllSkills() {
  return repo.findAllSkills();
}

export function updateEmployeeSkill(employeeId, assignmentId, data) {
  return repo.updateEmployeeSkill(employeeId, assignmentId, data);
}

export function removeEmployeeSkill(employeeId, assignmentId) {
  return repo.removeEmployeeSkill(employeeId, assignmentId);
}

// Enhanced Skills Functions
export function getAllSkills() {
  return repo.getAllSkills();
}

export function getSkillsByCategory(category) {
  return repo.getSkillsByCategory(category);
}

export function getSkillGapAnalysis(employeeId, jobPostingId) {
  return repo.getSkillGapAnalysis(employeeId, jobPostingId);
}

export function getSkillAnalytics() {
  return repo.getSkillAnalytics();
}

export function getSkillRecommendations(employeeId) {
  return repo.getSkillRecommendations(employeeId);
}

// Certifications
export function listEmployeeCertifications(employeeId) {
  return repo.listEmployeeCertifications(employeeId);
}

export async function addEmployeeCertification(employeeId, data) {
  console.log('Adding certification for employee:', employeeId, 'with data:', data);
  
  // Validate that employee exists
  const employee = await repo.findById(employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  
  // Validate required fields
  if (!data.name || !data.issuedAt) {
    const error = new Error('Certification name and issued date are required');
    error.statusCode = 400;
    error.code = 'MISSING_REQUIRED_FIELDS';
    throw error;
  }
  
  // Convert date strings to Date objects
  const processedData = {
    ...data,
    issuedAt: new Date(data.issuedAt),
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  };
  
  console.log('Processed data:', processedData);
  
  return repo.addEmployeeCertification(employeeId, processedData);
}

export function removeEmployeeCertification(employeeId, certId) {
  return repo.removeEmployeeCertification(employeeId, certId);
}

// Documents
export function listEmployeeDocuments(employeeId) {
  return repo.listEmployeeDocuments(employeeId);
}

export async function addEmployeeDocument(employeeId, data) {
  console.log('Adding document for employee:', employeeId, 'with data:', data);
  
  // Validate that employee exists
  const employee = await repo.findById(employeeId);
  if (!employee) {
    const error = new Error(`Employee with ID ${employeeId} not found`);
    error.statusCode = 404;
    error.code = 'EMPLOYEE_NOT_FOUND';
    throw error;
  }
  
  // Validate required fields
  if (!data.name) {
    const error = new Error('Document name is required');
    error.statusCode = 400;
    error.code = 'MISSING_REQUIRED_FIELDS';
    throw error;
  }
  
  // For now, create a placeholder fileUrl if not provided
  // In a real implementation, you would handle file upload here
  const processedData = {
    name: data.name,
    fileUrl: data.fileUrl || `placeholder-url-for-${data.name}`,
    // Note: The schema only supports name and fileUrl fields
    // Additional fields like type and description would need schema migration
  };
  
  console.log('Processed document data:', processedData);
  
  return repo.addEmployeeDocument(employeeId, processedData);
}

export function removeEmployeeDocument(employeeId, docId) {
  return repo.removeEmployeeDocument(employeeId, docId);
}

// Evaluations
export function listEmployeeEvaluations(employeeId) {
  return repo.listEmployeeEvaluations(employeeId);
}

export function addEmployeeEvaluation(employeeId, data) {
  return repo.addEmployeeEvaluation(employeeId, data);
}

// Career progression
export async function promoteEmployee(employeeId, data) {
  return repo.promoteEmployee(employeeId, data);
}

export async function transferEmployee(employeeId, data) {
  return repo.transferEmployee(employeeId, data);
}

export function getCareerProgressionHistory(employeeId) {
  return repo.getCareerProgressionHistory(employeeId);
}

export function getPendingCareerProgressions() {
  return repo.getPendingCareerProgressions();
}

export async function approveCareerProgression(progressionId, data) {
  return repo.approveCareerProgression(progressionId, data);
}

export function getCareerProgressionAnalytics(query) {
  return repo.getCareerProgressionAnalytics(query);
}

// Probation lifecycle
export function startProbation(employeeId, data) {
  return repo.startProbation(employeeId, data);
}

export function endProbation(employeeId, data) {
  return repo.endProbation(employeeId, data);
}

// Offboarding
export function offboardEmployee(employeeId, data) {
  return repo.offboardEmployee(employeeId, data);
}


