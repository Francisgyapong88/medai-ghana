export function getStoredUser() {
  return JSON.parse(localStorage.getItem('user') || '{}')
}

export function isAdmin(): boolean {
  const user = getStoredUser()
  return user.roleId === 1 || user.roleId === 2
}

export function isClinicalRole(): boolean {
  const user = getStoredUser()
  // Doctor, Nurse, Laboratory Scientist, Health Officer
  return [3, 4, 5, 6].includes(user.roleId)
}

// Anyone who should see clinical/AI features: Admins + clinical staff.
// Excludes Receptionist (7) and Patient (8).
export function canAccessClinicalFeatures(): boolean {
  const user = getStoredUser()
  return [1, 2, 3, 4, 5, 6].includes(user.roleId)
}