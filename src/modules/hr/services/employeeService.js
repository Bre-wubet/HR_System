import * as repo from "../repositories/employeeRepository.js";

export async function listEmployees({ query }) {
  const { q, departmentId, status, take, skip } = query || {};
  return repo.findMany({ q, departmentId, status, take: Number(take) || 20, skip: Number(skip) || 0 });
}

export async function createEmployee(payload) {
  return repo.create(payload);
}

export async function getEmployeeById(id) {
  return repo.findById(id);
}

export async function updateEmployeeById(id, payload) {
  return repo.updateById(id, payload);
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

export function addEmployeeSkill(employeeId, data) {
  return repo.addEmployeeSkill(employeeId, data);
}

export function updateEmployeeSkill(employeeId, assignmentId, data) {
  return repo.updateEmployeeSkill(employeeId, assignmentId, data);
}

export function removeEmployeeSkill(employeeId, assignmentId) {
  return repo.removeEmployeeSkill(employeeId, assignmentId);
}

// Certifications
export function listEmployeeCertifications(employeeId) {
  return repo.listEmployeeCertifications(employeeId);
}

export function addEmployeeCertification(employeeId, data) {
  return repo.addEmployeeCertification(employeeId, data);
}

export function removeEmployeeCertification(employeeId, certId) {
  return repo.removeEmployeeCertification(employeeId, certId);
}

// Documents
export function listEmployeeDocuments(employeeId) {
  return repo.listEmployeeDocuments(employeeId);
}

export function addEmployeeDocument(employeeId, data) {
  return repo.addEmployeeDocument(employeeId, data);
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
export function promoteEmployee(employeeId, data) {
  return repo.promoteEmployee(employeeId, data);
}

export function transferEmployee(employeeId, data) {
  return repo.transferEmployee(employeeId, data);
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


