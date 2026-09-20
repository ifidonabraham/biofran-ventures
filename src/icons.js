'use strict';

/**
 * Biofran Ventures - generated artwork engine.
 *
 * Instead of shipping hundreds of binary photos, every product / property /
 * category image is generated as a real SVG file served from /img/...
 *
 * Each item therefore gets:
 *   image   -> /img/p/<slug>.svg?v=1
 *   preview -> /img/p/<slug>.svg?v=1&size=1400   (high-res lightbox preview)
 *
 * All artwork is drawn inside a 200x200 coordinate box and scaled up.
 */

const ICONS = {};

/* ================================================================ CLOTHING */

ICONS.shirt = (c) => `
  <path d="M78 34h44l32 18-16 30-16-9v95H78V73l-16 9-16-30z" fill="${c.main}"/>
  <path d="M86 34l14 16 14-16" fill="none" stroke="${c.accent}" stroke-width="7" stroke-linecap="round"/>
  <path d="M100 55v118" stroke="${c.light}" stroke-width="4" opacity=".45"/>
  <circle cx="100" cy="86" r="3.4" fill="${c.accent}"/>
  <circle cx="100" cy="112" r="3.4" fill="${c.accent}"/>
  <circle cx="100" cy="138" r="3.4" fill="${c.accent}"/>`;

ICONS.polo = (c) => `
  <path d="M78 40h44l30 16-14 28-16-8v92H78V76l-16 8-14-28z" fill="${c.main}"/>
  <path d="M86 40l14 18 14-18-4-6H90z" fill="${c.light}"/>
  <path d="M100 58v10" stroke="${c.accent}" stroke-width="6" stroke-linecap="round"/>
  <rect x="76" y="118" width="48" height="34" rx="4" fill="${c.light}" opacity=".35"/>`;

ICONS.dress = (c) => `
  <path d="M84 30h32l10 22-18 12 34 106H68l34-106-18-12z" fill="${c.main}"/>
  <path d="M82 30h36" stroke="${c.accent}" stroke-width="7" stroke-linecap="round"/>
  <path d="M100 66v104" stroke="${c.light}" stroke-width="3" opacity=".45"/>
  <path d="M78 118h44" stroke="${c.accent}" stroke-width="5" opacity=".8"/>`;

ICONS.gown = (c) => `
  <path d="M80 28h40l14 26-20 12 42 106H44l42-106-20-12z" fill="${c.main}"/>
  <path d="M78 28h44" stroke="${c.accent}" stroke-width="8" stroke-linecap="round"/>
  <path d="M72 132h56M66 152h68" stroke="${c.light}" stroke-width="4" opacity=".5"/>
  <circle cx="100" cy="72" r="5" fill="${c.accent}"/>`;

ICONS.suit = (c) => `
  <path d="M74 36h52l24 20-12 28-14-8v100H76V76l-14 8-12-28z" fill="${c.main}"/>
  <path d="M100 36l-20 16 20 26 20-26z" fill="${c.light}"/>
  <path d="M100 62v114" stroke="${c.accent}" stroke-width="4"/>
  <circle cx="100" cy="96" r="4" fill="${c.accent}"/>
  <circle cx="100" cy="120" r="4" fill="${c.accent}"/>
  <rect x="66" y="126" width="22" height="16" rx="3" fill="${c.light}" opacity=".55"/>`;

ICONS.blouse = (c) => `
  <path d="M76 44h48l26 20-16 26-14-8v84H80V82l-14 8-16-26z" fill="${c.main}"/>
  <path d="M86 44c4 12 10 18 14 18s10-6 14-18" fill="${c.light}"/>
  <path d="M92 88h16l-8 14z" fill="${c.accent}"/>
  <path d="M100 102v50" stroke="${c.light}" stroke-width="3" opacity=".5"/>`;
/* ========================================================== SHOES & BAGS */

ICONS.shoe = (c) => `
  <path d="M34 142c0-26 10-38 24-50l24-30 16 20 34 6c24 4 36 16 36 32v22z" fill="${c.main}"/>
  <path d="M34 142h134v14a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8z" fill="${c.light}"/>
  <path d="M62 128l22-24M78 132l20-22" stroke="${c.accent}" stroke-width="6" stroke-linecap="round"/>
  <path d="M112 104h18M118 118h20" stroke="${c.light}" stroke-width="5" stroke-linecap="round"/>`;

ICONS.heel = (c) => `
  <path d="M88 52c22 0 36 14 36 34 0 26-4 40-10 58H92l8-28-34 6-48 22 6-26 44-28c4-20 8-38 20-38z" fill="${c.main}"/>
  <path d="M114 144h14l-10 46h-12z" fill="${c.dark}"/>
  <path d="M88 66c14 4 22 12 22 24" fill="none" stroke="${c.accent}" stroke-width="6" stroke-linecap="round"/>`;

ICONS.sandal = (c) => `
  <path d="M44 88h44c10 0 16 8 14 18l-4 20" fill="none" stroke="${c.main}" stroke-width="16" stroke-linecap="round"/>
  <path d="M92 148h66a8 8 0 0 0 8-9l-2-5H92z" fill="${c.dark}"/>
  <path d="M58 150h90v14H58z" fill="${c.light}"/>
  <path d="M60 88l24 44M104 88l10 44" stroke="${c.accent}" stroke-width="7" stroke-linecap="round"/>`;

ICONS.bag = (c) => `
  <path d="M58 78h84l14 88H44z" fill="${c.main}"/>
  <path d="M78 78c0-20 8-32 22-32s22 12 22 32" fill="none" stroke="${c.accent}" stroke-width="8" stroke-linecap="round"/>
  <path d="M56 108h88" stroke="${c.light}" stroke-width="5" opacity=".5"/>
  <circle cx="100" cy="108" r="9" fill="${c.accent}"/>`;

ICONS.backpack = (c) => `
  <rect x="56" y="66" width="88" height="102" rx="20" fill="${c.main}"/>
  <path d="M78 68c0-18 8-28 22-28s22 10 22 28" fill="none" stroke="${c.accent}" stroke-width="8" stroke-linecap="round"/>
  <rect x="74" y="116" width="52" height="26" rx="10" fill="${c.light}" opacity=".8"/>
  <path d="M56 96h88" stroke="${c.dark}" stroke-width="4" opacity=".5"/>`;

ICONS.briefcase = (c) => `
  <rect x="40" y="74" width="120" height="80" rx="12" fill="${c.main}"/>
  <path d="M82 74V62a12 12 0 0 1 12-12h12a12 12 0 0 1 12 12v12" fill="none" stroke="${c.accent}" stroke-width="8"/>
  <path d="M40 106h120" stroke="${c.light}" stroke-width="5" opacity=".6"/>
  <rect x="90" y="98" width="20" height="16" rx="4" fill="${c.accent}"/>`;

ICONS.duffel = (c) => `
  <rect x="34" y="78" width="132" height="72" rx="34" fill="${c.main}"/>
  <path d="M66 78c0-20 14-36 34-36s34 16 34 36" fill="none" stroke="${c.accent}" stroke-width="8" stroke-linecap="round"/>
  <path d="M34 112h132" stroke="${c.light}" stroke-width="4" opacity=".45"/>
  <rect x="86" y="96" width="28" height="34" rx="8" fill="${c.light}" opacity=".7"/>`;

/* =============================================================== WATCHES */

ICONS.watch = (c) => `
  <rect x="86" y="24" width="28" height="46" rx="10" fill="${c.dark}"/>
  <rect x="86" y="130" width="28" height="46" rx="10" fill="${c.dark}"/>
  <circle cx="100" cy="100" r="50" fill="${c.main}"/>
  <circle cx="100" cy="100" r="38" fill="none" stroke="${c.accent}" stroke-width="6"/>
  <path d="M100 76v26l18 12" fill="none" stroke="${c.light}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="5" fill="${c.accent}"/>`;

ICONS.smartwatch = (c) => `
  <rect x="88" y="20" width="24" height="52" rx="8" fill="${c.dark}"/>
  <rect x="88" y="128" width="24" height="52" rx="8" fill="${c.dark}"/>
  <rect x="52" y="60" width="96" height="80" rx="22" fill="${c.main}"/>
  <rect x="64" y="72" width="72" height="56" rx="14" fill="${c.accent}" opacity=".85"/>
  <path d="M82 100h14l8-14 10 28 8-14h12" fill="none" stroke="${c.light}" stroke-width="5" stroke-linecap="round"/>`;

ICONS.glasses = (c) => `
  <circle cx="64" cy="104" r="26" fill="none" stroke="${c.main}" stroke-width="10"/>
  <circle cx="136" cy="104" r="26" fill="none" stroke="${c.main}" stroke-width="10"/>
  <path d="M90 100h20M38 96l-14-8M162 96l14-8" stroke="${c.accent}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="64" cy="104" r="14" fill="${c.accent}" opacity=".45"/>
  <circle cx="136" cy="104" r="14" fill="${c.accent}" opacity=".45"/>`;

/* ========================================================== APPLIANCES */

ICONS.fridge = (c) => `
  <rect x="60" y="22" width="80" height="156" rx="14" fill="${c.main}"/>
  <path d="M60 82h80" stroke="${c.light}" stroke-width="6" opacity=".8"/>
  <rect x="122" y="38" width="9" height="30" rx="4" fill="${c.accent}"/>
  <rect x="122" y="96" width="9" height="30" rx="4" fill="${c.accent}"/>
  <rect x="70" y="150" width="60" height="14" rx="4" fill="${c.light}" opacity=".25"/>`;

ICONS.freezer = (c) => `
  <rect x="34" y="74" width="132" height="82" rx="12" fill="${c.main}"/>
  <rect x="32" y="56" width="136" height="24" rx="12" fill="${c.light}"/>
  <path d="M34 100h132" stroke="${c.light}" stroke-width="4" opacity=".5"/>
  <rect x="78" y="44" width="44" height="10" rx="5" fill="${c.accent}"/>`;

ICONS.ac = (c) => `
  <rect x="24" y="62" width="152" height="60" rx="16" fill="${c.main}"/>
  <path d="M42 84h116M42 100h84" stroke="${c.light}" stroke-width="7" stroke-linecap="round" opacity=".85"/>
  <circle cx="152" cy="134" r="7" fill="${c.accent}"/>
  <path d="M24 62h152" stroke="${c.accent}" stroke-width="6"/>`;

ICONS.fan = (c) => `
  <g fill="${c.main}">
    <ellipse cx="100" cy="58" rx="15" ry="30"/>
    <ellipse cx="100" cy="118" rx="15" ry="30"/>
    <ellipse cx="72" cy="88" rx="30" ry="15"/>
    <ellipse cx="128" cy="88" rx="30" ry="15"/>
  </g>
  <circle cx="100" cy="88" r="58" fill="none" stroke="${c.accent}" stroke-width="6"/>
  <circle cx="100" cy="88" r="15" fill="${c.accent}"/>
  <rect x="92" y="140" width="16" height="34" fill="${c.dark}"/>
  <rect x="62" y="168" width="76" height="14" rx="7" fill="${c.accent}"/>`;

ICONS.kettle = (c) => `
  <path d="M68 76h64l-9 82a14 14 0 0 1-14 13H91a14 14 0 0 1-14-13z" fill="${c.main}"/>
  <path d="M62 76h76" stroke="${c.accent}" stroke-width="9" stroke-linecap="round"/>
  <path d="M72 96c-18 5-25 16-22 30" fill="none" stroke="${c.accent}" stroke-width="9" stroke-linecap="round"/>
  <rect x="90" y="46" width="20" height="30" rx="9" fill="${c.accent}"/>
  <path d="M114 92c18 6 22 18 18 32" fill="none" stroke="${c.dark}" stroke-width="7" stroke-linecap="round"/>`;

ICONS.blender = (c) => `
  <path d="M74 34h52l-9 66H83z" fill="${c.light}" opacity=".9"/>
  <path d="M74 34h52l-9 66H83z" fill="none" stroke="${c.main}" stroke-width="5"/>
  <rect x="68" y="104" width="64" height="56" rx="12" fill="${c.main}"/>
  <circle cx="100" cy="132" r="14" fill="${c.accent}"/>
  <rect x="80" y="22" width="40" height="12" rx="6" fill="${c.accent}"/>`;

ICONS.microwave = (c) => `
  <rect x="26" y="62" width="148" height="84" rx="14" fill="${c.main}"/>
  <rect x="38" y="74" width="90" height="60" rx="9" fill="${c.accent}" opacity=".55"/>
  <rect x="138" y="74" width="26" height="18" rx="5" fill="${c.light}"/>
  <circle cx="151" cy="118" r="9" fill="${c.light}"/>
  <path d="M26 62h148" stroke="${c.accent}" stroke-width="5"/>`;

ICONS.washer = (c) => `
  <rect x="46" y="28" width="108" height="150" rx="16" fill="${c.main}"/>
  <circle cx="100" cy="114" r="40" fill="${c.light}" opacity=".9"/>
  <circle cx="100" cy="114" r="26" fill="${c.accent}" opacity=".7"/>
  <circle cx="70" cy="50" r="8" fill="${c.accent}"/>
  <circle cx="94" cy="50" r="8" fill="${c.light}"/>`;

ICONS.dispenser = (c) => `
  <rect x="56" y="44" width="88" height="134" rx="14" fill="${c.main}"/>
  <rect x="84" y="14" width="32" height="32" rx="8" fill="${c.accent}"/>
  <rect x="68" y="88" width="22" height="14" rx="5" fill="${c.accent}"/>
  <rect x="112" y="88" width="22" height="14" rx="5" fill="${c.accent}"/>
  <path d="M56 120h88" stroke="${c.light}" stroke-width="4" opacity=".4"/>`;

ICONS.iron = (c) => `
  <path d="M40 116h124v20a10 10 0 0 1-10 10H50a10 10 0 0 1-10-10z" fill="${c.dark}"/>
  <path d="M64 116c0-28 16-48 42-48h42a18 18 0 0 1 18 18v30z" fill="${c.main}"/>
  <path d="M148 68c14 0 22 6 22 16" fill="none" stroke="${c.accent}" stroke-width="8" stroke-linecap="round"/>
  <circle cx="90" cy="96" r="7" fill="${c.accent}"/>`;

ICONS.ricecooker = (c) => `
  <path d="M48 92h104v48a20 20 0 0 1-20 20H68a20 20 0 0 1-20-20z" fill="${c.main}"/>
  <path d="M44 84h112a10 10 0 0 1 0 20H44a10 10 0 0 1 0-20z" fill="${c.accent}"/>
  <path d="M60 66c0-12 18-22 40-22s40 10 40 22" fill="none" stroke="${c.light}" stroke-width="7" stroke-linecap="round"/>
  <circle cx="100" cy="130" r="12" fill="${c.accent}" opacity=".8"/>`;

/* ================================================================ GAS */

ICONS.cylinder = (c) => `
  <path d="M62 62h76v100a16 16 0 0 1-16 16H78a16 16 0 0 1-16-16z" fill="${c.main}"/>
  <path d="M100 24c16 0 24 8 24 20v18H76V44c0-12 8-20 24-20z" fill="${c.dark}"/>
  <rect x="80" y="16" width="40" height="12" rx="6" fill="${c.accent}"/>
  <circle cx="100" cy="16" r="9" fill="${c.accent}"/>
  <path d="M62 92h76M62 130h76" stroke="${c.light}" stroke-width="4" opacity=".35"/>
  <rect x="72" y="150" width="56" height="24" rx="6" fill="${c.light}" opacity=".25"/>`;

ICONS.flame = (c) => `
  <path d="M100 22c30 34 52 52 52 82a52 52 0 0 1-104 0c0-26 20-38 34-62 4 16 12 22 18 24-6-16-2-30 0-44z" fill="${c.main}"/>
  <path d="M100 96c12 14 22 24 22 38a22 22 0 0 1-44 0c0-14 10-24 22-38z" fill="${c.accent}"/>
  <path d="M100 128c5 6 9 10 9 16a9 9 0 0 1-18 0c0-6 4-10 9-16z" fill="${c.light}" opacity=".9"/>`;

ICONS.regulator = (c) => `
  <rect x="66" y="72" width="68" height="54" rx="12" fill="${c.main}"/>
  <circle cx="100" cy="99" r="18" fill="${c.accent}"/>
  <circle cx="100" cy="99" r="8" fill="${c.light}"/>
  <rect x="94" y="28" width="12" height="46" fill="${c.dark}"/>
  <rect x="84" y="18" width="32" height="14" rx="6" fill="${c.accent}"/>
  <rect x="56" y="126" width="88" height="16" rx="8" fill="${c.accent}"/>`;

ICONS.hose = (c) => `
  <path d="M32 66c34 0 34 68 68 68s34-68 68-68" fill="none" stroke="${c.main}" stroke-width="18" stroke-linecap="round"/>
  <path d="M32 66c34 0 34 68 68 68s34-68 68-68" fill="none" stroke="${c.light}" stroke-width="6" stroke-linecap="round" opacity=".35"/>
  <rect x="18" y="52" width="28" height="28" rx="9" fill="${c.accent}"/>
  <rect x="154" y="52" width="28" height="28" rx="9" fill="${c.accent}"/>`;

ICONS.burner = (c) => `
  <circle cx="100" cy="104" r="54" fill="${c.main}"/>
  <circle cx="100" cy="104" r="40" fill="${c.accent}" opacity=".6"/>
  <circle cx="100" cy="104" r="16" fill="${c.main}"/>
  <g fill="${c.light}">
    <circle cx="100" cy="62" r="6"/><circle cx="129" cy="73" r="6"/>
    <circle cx="142" cy="102" r="6"/><circle cx="130" cy="132" r="6"/>
    <circle cx="100" cy="145" r="6"/><circle cx="70" cy="132" r="6"/>
    <circle cx="58" cy="102" r="6"/><circle cx="70" cy="73" r="6"/>
  </g>`;

ICONS.canister = (c) => `
  <rect x="74" y="52" width="52" height="112" rx="12" fill="${c.main}"/>
  <rect x="86" y="30" width="28" height="24" rx="8" fill="${c.accent}"/>
  <path d="M74 84h52M74 128h52" stroke="${c.light}" stroke-width="4" opacity=".35"/>
  <circle cx="100" cy="30" r="8" fill="${c.dark}"/>`;

ICONS.detector = (c) => `
  <rect x="62" y="40" width="76" height="126" rx="22" fill="${c.main}"/>
  <circle cx="100" cy="84" r="26" fill="${c.accent}" opacity=".85"/>
  <path d="M100 70v20l12 8" stroke="${c.light}" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="100" cy="140" r="9" fill="${c.accent}"/>
  <rect x="78" y="28" width="44" height="16" rx="8" fill="${c.dark}"/>`;

ICONS.stove = (c) => `
  <rect x="26" y="86" width="148" height="24" rx="10" fill="${c.dark}"/>
  <path d="M32 110h136v50a12 12 0 0 1-12 12H44a12 12 0 0 1-12-12z" fill="${c.main}"/>
  <circle cx="68" cy="82" r="22" fill="none" stroke="${c.accent}" stroke-width="9"/>
  <circle cx="132" cy="82" r="22" fill="none" stroke="${c.accent}" stroke-width="9"/>
  <circle cx="68" cy="82" r="6" fill="${c.accent}"/>
  <circle cx="132" cy="82" r="6" fill="${c.accent}"/>
  <circle cx="100" cy="140" r="12" fill="${c.accent}"/>
  <rect x="52" y="134" width="30" height="12" rx="6" fill="${c.light}" opacity=".5"/>`;

ICONS.campstove = (c) => `
  <rect x="36" y="104" width="128" height="18" rx="9" fill="${c.main}"/>
  <rect x="44" y="122" width="13" height="46" rx="5" fill="${c.dark}"/>
  <rect x="143" y="122" width="13" height="46" rx="5" fill="${c.dark}"/>
  <circle cx="100" cy="96" r="24" fill="none" stroke="${c.accent}" stroke-width="9"/>
  <path d="M100 68c-14-12-6-28 10-34-3 16 12 20 6 34z" fill="${c.accent}"/>
  <rect x="70" y="150" width="60" height="10" rx="5" fill="${c.accent}"/>`;

/* ============================================================ PROPERTY */

ICONS.house = (c) => `
  <path d="M100 34l64 56v86H36V90z" fill="${c.main}"/>
  <path d="M100 34l64 56H36z" fill="${c.dark}"/>
  <rect x="82" y="118" width="36" height="58" rx="5" fill="${c.accent}"/>
  <rect x="52" y="112" width="24" height="24" rx="5" fill="${c.light}" opacity=".8"/>
  <rect x="124" y="112" width="24" height="24" rx="5" fill="${c.light}" opacity=".8"/>
  <circle cx="112" cy="150" r="3" fill="${c.light}"/>`;

ICONS.building = (c) => {
  let windows = '';
  for (let r = 0; r < 5; r++) {
    for (let col = 0; col < 3; col++) {
      windows +=
        `<rect x="${70 + col * 24}" y="${52 + r * 26}" width="16" height="16" ` +
        `rx="3" fill="${c.accent}" opacity=".85"/>`;
    }
  }
  return `
  <rect x="56" y="30" width="88" height="158" rx="10" fill="${c.main}"/>
  <rect x="40" y="66" width="20" height="122" rx="8" fill="${c.dark}"/>
  <rect x="140" y="86" width="20" height="102" rx="8" fill="${c.dark}"/>
  ${windows}
  <rect x="86" y="160" width="28" height="28" rx="4" fill="${c.light}"/>`;
};

ICONS.land = (c) => `
  <rect x="20" y="118" width="160" height="52" rx="10" fill="${c.main}"/>
  <path d="M20 118h160" stroke="${c.accent}" stroke-width="6"/>
  <path d="M40 118V72l30-16 30 16v46" fill="none" stroke="${c.dark}" stroke-width="7"/>
  <path d="M116 118V58h40v60" fill="none" stroke="${c.dark}" stroke-width="7"/>
  <rect x="30" y="140" width="30" height="22" rx="4" fill="${c.accent}" opacity=".7"/>
  <circle cx="136" cy="98" r="16" fill="${c.accent}" opacity=".7"/>`;

ICONS.keys = (c) => `
  <circle cx="70" cy="70" r="30" fill="none" stroke="${c.main}" stroke-width="14"/>
  <circle cx="70" cy="70" r="9" fill="${c.accent}"/>
  <path d="M92 92l62 62" stroke="${c.main}" stroke-width="14" stroke-linecap="round"/>
  <path d="M126 126l14-14M140 140l14-14" stroke="${c.accent}" stroke-width="12" stroke-linecap="round"/>`;

ICONS.store = (c) => `
  <path d="M32 62h136v20H32z" fill="${c.dark}"/>
  <path d="M40 82h120v96H40z" fill="${c.main}"/>
  <rect x="46" y="86" width="22" height="18" rx="3" fill="${c.accent}" opacity=".8"/>
  <rect x="92" y="86" width="22" height="18" rx="3" fill="${c.accent}" opacity=".8"/>
  <rect x="138" y="86" width="18" height="18" rx="3" fill="${c.accent}" opacity=".8"/>
  <rect x="78" y="118" width="44" height="60" rx="5" fill="${c.accent}"/>
  <rect x="52" y="118" width="18" height="26" rx="4" fill="${c.light}" opacity=".8"/>
  <rect x="132" y="118" width="18" height="26" rx="4" fill="${c.light}" opacity=".8"/>`;

ICONS.generic = (c) => `
  <rect x="34" y="34" width="132" height="132" rx="24" fill="${c.main}"/>
  <circle cx="100" cy="100" r="42" fill="none" stroke="${c.accent}" stroke-width="9"/>
  <path d="M100 76v24l20 14" fill="none" stroke="${c.light}" stroke-width="7" stroke-linecap="round"/>`;

module.exports = { ICONS };