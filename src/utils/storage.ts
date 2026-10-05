import { Project, EngineerRequest } from '../types';
import { INITIAL_PROJECTS, INITIAL_REQUESTS } from '../data/initialData';

// Central Master Keys shared across all users and roles
const MASTER_PROJECTS_KEY = 'lumencraft_master_projects_db_v2';
const MASTER_REQUESTS_KEY = 'lumencraft_master_requests_db_v2';
const BACKUP_PROJECTS_KEY = 'lumencraft_backup_projects_db_v2';
const BACKUP_REQUESTS_KEY = 'lumencraft_backup_requests_db_v2';

// Legacy keys for backward-compatibility migration
const LEGACY_PROJECTS_KEY = 'lumencraft_projects_v1';
const LEGACY_REQUESTS_KEY = 'lumencraft_requests_v1';

/**
 * Load Projects from Unified Master Storage with safe backup fallback
 */
export function loadProjects(): Project[] {
  try {
    // 1. Try master storage
    const raw = localStorage.getItem(MASTER_PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // 2. Try legacy storage
    const legacyRaw = localStorage.getItem(LEGACY_PROJECTS_KEY);
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        saveProjects(parsedLegacy);
        return parsedLegacy;
      }
    }

    // 3. Try backup storage
    const backupRaw = localStorage.getItem(BACKUP_PROJECTS_KEY);
    if (backupRaw) {
      const parsedBackup = JSON.parse(backupRaw);
      if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
        saveProjects(parsedBackup);
        return parsedBackup;
      }
    }

    // 4. Fallback to Initial Seed Data and immediately persist
    saveProjects(INITIAL_PROJECTS);
    return INITIAL_PROJECTS;
  } catch (err) {
    console.error('Error loading shared master projects:', err);
    return INITIAL_PROJECTS;
  }
}

/**
 * Save Projects to Unified Master Storage and maintain automated backup
 */
export function saveProjects(projects: Project[]): void {
  try {
    if (!Array.isArray(projects)) return;
    const serialized = JSON.stringify(projects);
    localStorage.setItem(MASTER_PROJECTS_KEY, serialized);
    if (projects.length > 0) {
      localStorage.setItem(BACKUP_PROJECTS_KEY, serialized);
    }
  } catch (err) {
    console.error('Failed to save master projects:', err);
  }
}

/**
 * Load Requests from Unified Master Storage with safe backup fallback
 */
export function loadRequests(): EngineerRequest[] {
  try {
    // 1. Try master storage
    const raw = localStorage.getItem(MASTER_REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // 2. Try legacy storage
    const legacyRaw = localStorage.getItem(LEGACY_REQUESTS_KEY);
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        saveRequests(parsedLegacy);
        return parsedLegacy;
      }
    }

    // 3. Try backup storage
    const backupRaw = localStorage.getItem(BACKUP_REQUESTS_KEY);
    if (backupRaw) {
      const parsedBackup = JSON.parse(backupRaw);
      if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
        saveRequests(parsedBackup);
        return parsedBackup;
      }
    }

    // 4. Fallback to Initial Seed Data and immediately persist
    saveRequests(INITIAL_REQUESTS);
    return INITIAL_REQUESTS;
  } catch (err) {
    console.error('Error loading shared master requests:', err);
    return INITIAL_REQUESTS;
  }
}

/**
 * Save Requests to Unified Master Storage and maintain automated backup
 */
export function saveRequests(requests: EngineerRequest[]): void {
  try {
    if (!Array.isArray(requests)) return;
    const serialized = JSON.stringify(requests);
    localStorage.setItem(MASTER_REQUESTS_KEY, serialized);
    if (requests.length > 0) {
      localStorage.setItem(BACKUP_REQUESTS_KEY, serialized);
    }
  } catch (err) {
    console.error('Failed to save master requests:', err);
  }
}

/**
 * Non-destructive merge helper to update request while retaining all unchanged fields
 */
export function mergeRequestData(existingReq: EngineerRequest, updatedReq: Partial<EngineerRequest>): EngineerRequest {
  return {
    ...existingReq,
    ...updatedReq,
    jobTypes: {
      ...existingReq.jobTypes,
      ...(updatedReq.jobTypes || {})
    },
    supportingDocs: {
      ...existingReq.supportingDocs,
      ...(updatedReq.supportingDocs || {})
    },
    signOff: {
      ...existingReq.signOff,
      ...(updatedReq.signOff || {})
    },
    photos: updatedReq.photos || existingReq.photos || [],
    parts: updatedReq.parts || existingReq.parts || [],
    measurements: updatedReq.measurements || existingReq.measurements || []
  };
}

/**
 * Reset All Data to Standard Clean Master Dataset
 */
export function resetAllData(): { projects: Project[]; requests: EngineerRequest[] } {
  saveProjects(INITIAL_PROJECTS);
  saveRequests(INITIAL_REQUESTS);
  return { projects: INITIAL_PROJECTS, requests: INITIAL_REQUESTS };
}
