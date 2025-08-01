import { Project } from "@/types/project";
import { atom } from "jotai";

export const projectsAtom = atom<Project[]>([]);

export const addProjectAtom = atom(null, (get, set, name: string) => {
  const projects = get(projectsAtom);
  const newProjectId = `${Date.now()}`;

  const newProject: Project = {
    id: newProjectId,
    name,
    owner_id: "user-1",
    description: "",
    updated_at: new Date().toISOString(),
  };

  const updatedProjects = [newProject, ...projects];
  set(projectsAtom, updatedProjects);
});

export const updateProjectAtom = atom(
  null,
  (get, set, { projectId, name }: { projectId: string; name: string }) => {
    const projects = get(projectsAtom);
    const updatedProjects = projects.map((project) =>
      project.id === projectId
        ? { ...project, name, updatedAt: new Date() }
        : project
    );
    set(projectsAtom, updatedProjects);
  }
);

export const deleteProjectAtom = atom(null, (get, set, projectId: string) => {
  const projects = get(projectsAtom);
  const updatedProjects = projects.filter(
    (project) => project.id !== projectId
  );
  set(projectsAtom, updatedProjects);
});
