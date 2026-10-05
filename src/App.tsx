/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveView, EngineerRequest, Project } from './types';
import { loadProjects, saveProjects, loadRequests, saveRequests, resetAllData, mergeRequestData } from './utils/storage';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { RequestList } from './components/EngineerRequests/RequestList';
import { RequestModalForm } from './components/EngineerRequests/RequestModalForm';
import { ServiceRequestPrintDocument } from './components/EngineerRequests/ServiceRequestPrintDocument';
import { ProjectList } from './components/Projects/ProjectList';
import { ProjectModalForm } from './components/Projects/ProjectModalForm';
import { ProjectDetailModal } from './components/Projects/ProjectDetailModal';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [requests, setRequests] = useState<EngineerRequest[]>(loadRequests);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<EngineerRequest | null>(null);
  const [preselectedProjectId, setPreselectedProjectId] = useState<string | undefined>(undefined);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  const [printingRequest, setPrintingRequest] = useState<EngineerRequest | null>(null);

  // Sync state to Unified Master LocalStorage
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveRequests(requests);
  }, [requests]);

  // Listen for Cross-Tab / Cross-Session storage changes so all users see unified real-time data
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lumencraft_master_projects_db_v2' && e.newValue) {
        try {
          const updatedProjects = JSON.parse(e.newValue);
          if (Array.isArray(updatedProjects)) setProjects(updatedProjects);
        } catch {}
      }
      if (e.key === 'lumencraft_master_requests_db_v2' && e.newValue) {
        try {
          const updatedRequests = JSON.parse(e.newValue);
          if (Array.isArray(updatedRequests)) setRequests(updatedRequests);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Request Handlers - Non-Destructive Safe Update
  const handleOpenNewRequest = (projectId?: string) => {
    setEditingRequest(null);
    setPreselectedProjectId(projectId);
    setIsRequestModalOpen(true);
  };

  const handleEditRequest = (req: EngineerRequest) => {
    setEditingRequest(req);
    setPreselectedProjectId(req.projectId);
    setIsRequestModalOpen(true);
  };

  const handleSaveRequest = (savedReq: EngineerRequest) => {
    setRequests(prev => {
      const existing = prev.find(r => r.id === savedReq.id);
      if (existing) {
        const merged = mergeRequestData(existing, savedReq);
        return prev.map(r => r.id === savedReq.id ? merged : r);
      }
      return [savedReq, ...prev];
    });
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handlePrintRequest = (req: EngineerRequest) => {
    setPrintingRequest(req);
    setActiveView('print-request');
  };

  // Project Handlers
  const handleOpenNewProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (proj: Project) => {
    setEditingProject(proj);
    setIsProjectModalOpen(true);
  };

  const handleViewProject = (proj: Project) => {
    setViewingProject(proj);
  };

  const handleSaveProject = (savedProj: Project) => {
    setProjects(prev => {
      const exists = prev.some(p => p.id === savedProj.id);
      if (exists) {
        return prev.map(p => p.id === savedProj.id ? savedProj : p);
      }
      return [savedProj, ...prev];
    });

    // If currently viewing details of this project, update it too
    if (viewingProject && viewingProject.id === savedProj.id) {
      setViewingProject(savedProj);
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (viewingProject && viewingProject.id === id) {
      setViewingProject(null);
    }
  };

  const handleResetData = () => {
    if (window.confirm('ต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      const { projects: resetProjects, requests: resetRequests } = resetAllData();
      setProjects(resetProjects);
      setRequests(resetRequests);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onNewRequest={() => handleOpenNewRequest()}
        onNewProject={handleOpenNewProject}
        onResetData={handleResetData}
        requestCount={requests.length}
        projectCount={projects.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[99%] mx-auto px-3 sm:px-6 py-5 sm:py-6">
        
        {/* VIEW 1: HOME (Featuring the 2 Main Buttons) */}
        {activeView === 'home' && (
          <HomeHero
            onNavigate={setActiveView}
            requests={requests}
            projects={projects}
            onOpenRequest={handleEditRequest}
            onPrintRequest={handlePrintRequest}
            onNewRequest={() => handleOpenNewRequest()}
            onNewProject={handleOpenNewProject}
          />
        )}

        {/* VIEW 2: ENGINEER REQUESTS (ตารางงาน On Site, Meeting, Mock-Up, Site Survey, Installation, นับแบบ, Claim, QC) */}
        {activeView === 'requests' && (
          <RequestList
            requests={requests}
            onAddNew={() => handleOpenNewRequest()}
            onEdit={handleEditRequest}
            onPrint={handlePrintRequest}
            onDelete={handleDeleteRequest}
            onSaveRequest={handleSaveRequest}
            onSelectProject={(projId) => {
              const p = projects.find(proj => proj.id === projId);
              if (p) {
                setViewingProject(p);
              }
            }}
          />
        )}

        {/* VIEW 3: PROJECTS (Project Code, SO No., Project Name, Customer Name, E-mail, Phone, Engineer Name, Sales, Status) */}
        {activeView === 'projects' && (
          <ProjectList
            projects={projects}
            requests={requests}
            onAddNew={handleOpenNewProject}
            onEdit={handleEditProject}
            onView={handleViewProject}
            onDelete={handleDeleteProject}
            onCreateRequestForProject={(projId) => handleOpenNewRequest(projId)}
          />
        )}

        {/* VIEW 4: PRINT SERVICE REQUEST (Official LUMENCRAFT 3-Page Document) */}
        {activeView === 'print-request' && printingRequest && (
          <ServiceRequestPrintDocument
            request={printingRequest}
            onBack={() => setActiveView('requests')}
          />
        )}

      </main>

      {/* Request Create/Edit Modal */}
      <RequestModalForm
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSave={handleSaveRequest}
        initialData={editingRequest}
        projects={projects}
        preselectedProjectId={preselectedProjectId}
      />

      {/* Project Create/Edit Modal */}
      <ProjectModalForm
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        initialData={editingProject}
      />

      {/* Project Detail Drawer / Modal */}
      <ProjectDetailModal
        project={viewingProject}
        requests={requests}
        isOpen={!!viewingProject}
        onClose={() => setViewingProject(null)}
        onEditProject={(p) => {
          setViewingProject(null);
          handleEditProject(p);
        }}
        onCreateRequestForProject={(pId) => {
          handleOpenNewRequest(pId);
        }}
        onViewRequest={(req) => {
          handleEditRequest(req);
        }}
        onPrintRequest={(req) => {
          handlePrintRequest(req);
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono-data">
          <div>LUMENCRAFT ENGINEERING & SERVICE MANAGEMENT SYSTEM</div>
          <div className="text-[11px] text-slate-400">
            Compliant with LUMENCRAFT Controlled Service Document Form (Rev. 2026)
          </div>
        </div>
      </footer>

    </div>
  );
}
