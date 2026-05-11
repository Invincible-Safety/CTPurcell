/**
 * Invincible Safety – Regulation Link Helper
 * Converts OSHA/VOSH regulation references into clickable links
 * Include this file in all app pages: <script src="reg-links.js"></script>
 */

// ============================================================
// REGULATION URL BUILDER
// ============================================================
function getRegURL(ref) {
  if (!ref || !ref.trim()) return null;

  // Virginia OSHA — map to closest federal OSHA equivalent
  // 16VAC25-145 = VA Confined Space → 29 CFR 1926.1200 (Construction Confined Spaces)
  if (ref.includes('16VAC25-145'))
    return 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1203';

  // 16VAC25-175 = VA Construction → 29 CFR 1926 (Construction Standards)
  if (ref.includes('16VAC25-175'))
    return 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926';

  // 16VAC25-60 = VA General Industry → 29 CFR 1910
  if (ref.includes('16VAC25-60'))
    return 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910';

  // Any other 16VAC → general OSHA construction standards
  if (ref.includes('16VAC'))
    return 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926';

  // Code of Virginia power line safety → OSHA 1926.1408
  if (ref.includes('59.1-406') || ref.includes('59.1-414'))
    return 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1408';

  // VDOT Work Area Protection → OSHA 1926.200 (Signs/Signals/Barricades)
  if (ref.includes('VDOT') || ref.includes('MUTCD'))
    return 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.200';

  // Federal 29 CFR 1926 (Construction) — deep link to subsection if provided
  const m1926full = ref.match(/1926\.(\d+[a-zA-Z]?)(\([a-zA-Z0-9]+\)(\([a-zA-Z0-9]+\)(\([a-zA-Z0-9]+\))?)?)?/);
  if (m1926full) {
    const base = `https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.${m1926full[1]}`;
    // Build anchor from subsection like (a)(1)(ii) -> #1926_502_a_1_ii
    const sub = ref.match(/1926\.\d+[a-zA-Z]?((\([a-zA-Z0-9]+\))+)/);
    if (sub) {
      const anchor = sub[0].replace(/[\.\(\)]/g, '_').replace(/^_|_$/g,'').replace(/__+/g,'_');
      return base + '#' + anchor;
    }
    return base;
  }

  // Federal 29 CFR 1910 (General Industry) — deep link to subsection if provided
  const m1910full = ref.match(/1910\.(\d+[a-zA-Z]?)(\([a-zA-Z0-9]+\)(\([a-zA-Z0-9]+\)(\([a-zA-Z0-9]+\))?)?)?/);
  if (m1910full) {
    const base = `https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.${m1910full[1]}`;
    const sub = ref.match(/1910\.\d+[a-zA-Z]?((\([a-zA-Z0-9]+\))+)/);
    if (sub) {
      const anchor = sub[0].replace(/[\.\(\)]/g, '_').replace(/^_|_$/g,'').replace(/__+/g,'_');
      return base + '#' + anchor;
    }
    return base;
  }

  // 29 CFR 1904 (Recordkeeping)
  if (ref.includes('1904'))
    return 'https://www.osha.gov/laws-regs/regulations/standardnumber/1904';

  // ANSI standards
  if (ref.includes('ANSI'))
    return 'https://www.ansi.org/standards';

  // Code of Virginia Workers Comp
  if (ref.includes('65.2'))
    return 'https://law.lis.virginia.gov/vacode/title65.2/';

  // General OSHA fallback
  if (ref.includes('CFR') || ref.includes('OSHA'))
    return 'https://www.osha.gov/laws-regs/oshact/completeoshact';

  return null;
}

// ============================================================
// RENDER A REGULATION BADGE/LINK
// Returns HTML string — either a clickable link or plain text
// ============================================================
// ============================================================
// OPEN REGULATION IN SEPARATE RESIZABLE WINDOW
// Lets inspector toggle between audit and the standard
// ============================================================
function openRegWindow(url, ref) {
  const w = Math.min(900, screen.width * 0.55);
  const h = Math.min(800, screen.height * 0.85);
  const left = screen.width - w - 20;
  const top = 60;
  const win = window.open(
    url,
    'osha_standard_' + ref.replace(/[^a-zA-Z0-9]/g,'_'),
    `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=yes`
  );
  if (win) win.focus();
  return false; // prevent default link behavior
}

function regLink(ref, options = {}) {
  if (!ref || !ref.trim()) return '<span style="color:var(--gray4);font-size:11px">—</span>';

  const url = getRegURL(ref);
  const isVA = false; // All links now route to federal OSHA.gov for consistency
  const fontSize = options.fontSize || '11px';
  const showIcon = options.showIcon !== false;

  const baseStyle = `
    display:inline-flex;align-items:center;gap:4px;
    font-size:${fontSize};font-weight:600;
    padding:2px 7px;border-radius:12px;
    text-decoration:none;cursor:pointer;
    transition:all 0.15s;white-space:nowrap;
  `;

  const vaStyle = `${baseStyle}background:#fff8e1;color:#7b4f00;border:1px solid #ffe082;`;
  const fedStyle = `${baseStyle}background:#e3f2fd;color:#0d47a1;border:1px solid #90caf9;`;
  const plainStyle = `${baseStyle}background:var(--gray2,#e8ecf2);color:var(--gray5,#445566);border:1px solid var(--gray3,#c5cdd9);`;

  const icon = isVA
    ? `<i class="ti ti-map-pin" style="font-size:10px"></i>`
    : `<i class="ti ti-external-link" style="font-size:10px"></i>`;

  if (url) {
    const style = isVA ? vaStyle : fedStyle;
    const label = isVA ? 'Virginia DOLI' : 'OSHA.gov';
    return `<a href="${url}"
      onclick="return openRegWindow('${url}','${ref}')"
      style="${style}"
      title="Open ${ref} on ${label} in a separate window — toggle back and forth freely"
      onmouseover="this.style.opacity='0.8'"
      onmouseout="this.style.opacity='1'">
      ${showIcon ? icon : ''}${ref}
    </a>`;
  }

  // No URL found — render as plain styled badge
  return `<span style="${plainStyle}" title="${ref}">${ref}</span>`;
}

// ============================================================
// AUTO-LINK — finds all elements with data-reg attribute
// and converts them to clickable links
// Call after DOM is ready: autoLinkRegs()
// ============================================================
function autoLinkRegs() {
  document.querySelectorAll('[data-reg]').forEach(el => {
    const ref = el.dataset.reg;
    if (ref) el.innerHTML = regLink(ref);
  });
}

// ============================================================
// REGULATION TOOLTIP — shows full standard title on hover
// ============================================================
const REG_TITLES = {
  '1926.20':  'General Safety & Health Provisions',
  '1926.21':  'Safety Training and Education',
  '1926.25':  'Housekeeping',
  '1926.50':  'Medical Services and First Aid',
  '1926.51':  'Sanitation',
  '1926.59':  'Hazard Communication',
  '1926.95':  'Personal Protective Equipment (General)',
  '1926.100': 'Head Protection',
  '1926.102': 'Eye and Face Protection',
  '1926.103': 'Respiratory Protection',
  '1926.150': 'Fire Protection',
  '1926.151': 'Fire Prevention',
  '1926.152': 'Flammable and Combustible Liquids',
  '1926.200': 'Accident Prevention Signs and Tags',
  '1926.202': 'Barricades',
  '1926.251': 'Rigging Equipment for Material Handling',
  '1926.300': 'Hand and Power Tools (General)',
  '1926.302': 'Power-Operated Hand Tools',
  '1926.303': 'Abrasive Wheels and Tools',
  '1926.350': 'Gas Welding and Cutting',
  '1926.400': 'Electrical – General Requirements',
  '1926.403': 'General Electrical Requirements',
  '1926.404': 'Wiring Design and Protection',
  '1926.405': 'Wiring Methods',
  '1926.416': 'General Requirements – Electrical',
  '1926.417': 'Lockout and Tagging of Circuits',
  '1926.450': 'Scaffolding – Definitions',
  '1926.451': 'Scaffolding – General Requirements',
  '1926.452': 'Scaffolding – Additional Requirements',
  '1926.453': 'Aerial Lifts',
  '1926.500': 'Fall Protection – Scope',
  '1926.501': 'Duty to Have Fall Protection',
  '1926.502': 'Fall Protection Systems Criteria',
  '1926.503': 'Fall Protection Training Requirements',
  '1926.550': 'Cranes and Derricks',
  '1926.600': 'Motor Vehicles / Mechanized Equipment',
  '1926.602': 'Material Handling Equipment',
  '1926.651': 'Excavations – Specific Requirements',
  '1926.652': 'Excavations – Requirements for Protective Systems',
  '1926.1053': 'Ladders',
  '1926.1060': 'Ladder Training Requirements',
  '1926.1408': 'Power Line Safety – Cranes',
  '1926.1412': 'Equipment Inspections',
  '1926.1427': 'Equipment Operator Qualification',
  '1910.146': 'Permit-Required Confined Spaces',
  '1910.147': 'Lockout/Tagout',
  '1910.178': 'Powered Industrial Trucks (Forklift)',
  '1904':     'Recording and Reporting Occupational Injuries and Illnesses',
  // Virginia OSHA — labeled with federal equivalent for clarity
  '16VAC25-145': 'VA Confined Space Entry (see 29 CFR 1926.1203)',
  '16VAC25-175': 'VA Construction Standards (see 29 CFR 1926)',
  '16VAC25-60':  'VA General Industry (see 29 CFR 1910)',
  '16VAC':       'Virginia OSHA Construction Standards (see 29 CFR 1926)',
  'VDOT':        'Work Zone Safety (see 29 CFR 1926.200)',
};

function getRegTitle(ref) {
  if (!ref) return '';
  for (const [key, title] of Object.entries(REG_TITLES)) {
    if (ref.includes(key)) return title;
  }
  return '';
}

// Enhanced regLink with title tooltip
function regLinkFull(ref, options = {}) {
  if (!ref || !ref.trim()) return '<span style="color:var(--gray4,#8899aa);font-size:11px">—</span>';
  const url = getRegURL(ref);
  const title = getRegTitle(ref);
  const isVA = false; // All links now route to federal OSHA.gov for consistency
  const fontSize = options.fontSize || '11px';

  const baseStyle = `display:inline-flex;align-items:center;gap:4px;font-size:${fontSize};font-weight:600;padding:2px 8px;border-radius:12px;text-decoration:none;cursor:pointer;transition:all 0.15s;white-space:nowrap;`;
  const vaStyle = baseStyle + 'background:#fff8e1;color:#7b4f00;border:1px solid #ffe082;';
  const fedStyle = baseStyle + 'background:#e3f2fd;color:#0d47a1;border:1px solid #90caf9;';
  const plainStyle = baseStyle + 'background:#e8ecf2;color:#445566;border:1px solid #c5cdd9;';

  const icon = isVA ? '🏛' : '<i class="ti ti-external-link" style="font-size:10px"></i>';
  const tooltip = title ? `title="${ref} — ${title}"` : `title="${ref}"`;

  if (url) {
    const label = isVA ? 'Virginia DOLI' : 'OSHA.gov';
    return `<a href="${url}"
      onclick="return openRegWindow('${url}','${ref}')"
      style="${isVA ? vaStyle : fedStyle}"
      ${tooltip}
      title="${ref}${title ? ' — ' + title : ''} · Opens in separate window">${icon} ${ref}</a>`;
  }
  return `<span style="${plainStyle}" ${tooltip}>${ref}</span>`;
}
