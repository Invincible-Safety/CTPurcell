// ================================================
// Invincible Safety — Authentication System
// auth.js — included on every page
// ================================================

const SUPABASE_URL = 'https://ekeurkmlapouxdtvjrpv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZXVya21sYXBvdXhkdHZqcnB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNzcwOTgsImV4cCI6MjA5Mzk1MzA5OH0.2eR4kCJSrHDuwLjpLbU3Ewn3UcfMAEumvjPWNf1I1BU';

// ---- PERMISSION LEVELS ----
const ROLES = {
  exec_admin:   { label: 'Executive Administration', level: 100 },
  exec_mgr:     { label: 'Executive Management',     level: 80  },
  safety_mgr:   { label: 'Safety Manager',           level: 75  },
  superintendent:{ label: 'Superintendent',          level: 60  },
  foreman:      { label: 'Foreman',                  level: 40  },
  crew:         { label: 'Crew Member',              level: 10  },
};

// Pages/features each minimum role level can access
const ACCESS = {
  dashboard:       10,   // everyone
  manpower_view:   10,   // everyone — read only
  eap_aha:         10,   // everyone — own project only
  own_training:    10,   // everyone — own record only
  notifications:   10,   // everyone
  crew_training:   40,   // foreman+
  audits_view:     40,   // foreman+
  deficiencies:    60,   // superintendent+
  incidents:       60,   // superintendent+
  all_training:    60,   // superintendent+
  ppe:             60,   // superintendent+
  air_monitors:    60,   // superintendent+
  extinguishers:   60,   // superintendent+
  osha300:         75,   // safety manager+
  time_reports:    75,   // safety manager+ (exec unlocked in 1 week)
  user_mgmt:       100,  // exec admin only
};

// 2-hour inactivity timeout (in ms) — permanent roles exempt
const INACTIVITY_MS = 2 * 60 * 60 * 1000;
const PERMANENT_ROLES = ['exec_admin']; // stay logged in forever

// ---- PRE-LOADED USERS ----
// These are seeded into the DB on first run via setup_auth.sql
// Listed here for reference only

// ---- CURRENT SESSION ----
function getSession() {
  const s = localStorage.getItem('inv_session');
  if (!s) return null;
  try {
    const session = JSON.parse(s);
    // Check inactivity timeout
    if (!PERMANENT_ROLES.includes(session.role)) {
      const lastActive = parseInt(localStorage.getItem('inv_last_active') || '0');
      if (Date.now() - lastActive > INACTIVITY_MS) {
        clearSession();
        return null;
      }
    }
    return session;
  } catch { return null; }
}

function setSession(user) {
  localStorage.setItem('inv_session', JSON.stringify(user));
  localStorage.setItem('inv_last_active', Date.now().toString());
}

function clearSession() {
  localStorage.removeItem('inv_session');
  localStorage.removeItem('inv_last_active');
}

function touchSession() {
  const s = getSession();
  if (s && !PERMANENT_ROLES.includes(s.role)) {
    localStorage.setItem('inv_last_active', Date.now().toString());
  }
}

function requireAuth(requiredLevel = 10) {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html?return=' + encodeURIComponent(window.location.href);
    return null;
  }
  const roleLevel = ROLES[session.role]?.level || 0;
  if (roleLevel < requiredLevel) {
    window.location.href = 'login.html?error=access';
    return null;
  }
  touchSession();
  return session;
}

function canAccess(feature) {
  const session = getSession();
  if (!session) return false;
  const roleLevel = ROLES[session.role]?.level || 0;
  const required = ACCESS[feature] || 999;
  // Special case: exec_mgr can access time_reports only if unlocked
  if (feature === 'time_reports' && session.role === 'exec_mgr') {
    return session.time_reports_unlocked === true;
  }
  return roleLevel >= required;
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

// Touch activity on any user interaction
document.addEventListener('click', touchSession);
document.addEventListener('keypress', touchSession);
