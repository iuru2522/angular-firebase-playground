export enum UserRole {
  ADMIN = 'admin',
  PROJECT_MANAGER = 'project_manager',
  DEVELOPER = 'developer',
  QA_TESTER = 'qa_tester',
  REPORTER = 'reporter'
}

export const USER_ROLE_LABELS = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.PROJECT_MANAGER]: 'Project Manager',
  [UserRole.DEVELOPER]: 'Developer',
  [UserRole.QA_TESTER]: 'QA Tester',
  [UserRole.REPORTER]: 'Reporter'
};

export const USER_ROLE_DESCRIPTIONS = {
  [UserRole.ADMIN]: 'Full system access and user management',
  [UserRole.PROJECT_MANAGER]: 'Manage projects and assign tasks',
  [UserRole.DEVELOPER]: 'Work on assigned bugs and features',
  [UserRole.QA_TESTER]: 'Test and verify bug fixes',
  [UserRole.REPORTER]: 'Report bugs and issues'
};