export const STORAGE_KEYS = {
  token: 'family_tree.token',
  user: 'family_tree.user',
};

export const ROUTES = {
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  familyTree: '/family-tree',
  members: '/members',
  person: (id) => `/family-member/${id}`,
  editPerson: (id) => `/admin/family-members/${id}/edit`,
  ancestors: '/ancestors',
  descendants: '/descendants',
  profile: '/profile',
  adminDashboard: '/admin/dashboard',
  adminMembers: '/admin/family-members',
  addMember: '/admin/family-members/add',
  adminRelationships: '/admin/relationships',
  adminUsers: '/admin/users',
  adminAuditLogs: '/admin/audit-logs',
  forbidden: '/forbidden',
};

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

/** Input-level relationship types. CHILD is normalized to PARENT server-side. */
export const RELATIONSHIP_TYPES = [
  { value: 'PARENT', label: 'Parent → Child', hint: 'Person A is a parent of Person B.' },
  { value: 'CHILD', label: 'Child → Parent', hint: 'Person A is a child of Person B (stored as B parent of A).' },
  { value: 'SPOUSE', label: 'Spouses', hint: 'Person A and Person B are married/partners.' },
];

export const DEFAULT_PAGE_SIZE = 20;
export const DEBOUNCE_MS = 300;
export const MAX_TREE_DEPTH = 10;
export const INITIAL_TREE_DEPTH = 3;

export const PERSON_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Deactivated' },
];

export const USER_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
];
