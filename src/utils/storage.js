/* ═══════════════════════════════════════════════════
   MaaCheck — Local Storage Manager
   Persists child profiles and screening history
   ═══════════════════════════════════════════════════ */

const STORAGE_KEY = 'maacheck_history';
const PROFILES_KEY = 'maacheck_profiles';

export function saveScreening(result) {
  try {
    const history = getHistory();
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      ...result,
    };
    history.unshift(entry); // newest first
    // Keep only last 50 screenings
    if (history.length > 50) history.length = 50;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return entry;
  } catch (e) {
    console.warn('MaaCheck: Failed to save screening', e);
    return null;
  }
}

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveProfile(profile) {
  try {
    const profiles = getProfiles();
    const existing = profiles.findIndex(p => p.name === profile.name);
    if (existing >= 0) {
      profiles[existing] = { ...profiles[existing], ...profile };
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn('MaaCheck: Failed to save profile', e);
  }
}

export function getProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
