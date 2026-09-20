'use strict';

/**
 * Biofran Ventures - product catalogue seed data.
 *
 * The array below is intentionally compact; `buildProducts()` at the bottom of
 * this file expands every row into a full product document (slug, SKU,
 * generated image + gallery + high resolution preview link, search text...).
 *
 *   n  name            c   category key      b  brand/line
 *   p  price (NGN)     o   old price         u  unit
 *   ic icon key        r   rating            rc review count
 *   s  stock           bd  badge             ft featured
 *   d  description     f   features[]        sp specs{}
 */

const { categoryByKey, groupByKey } = require('../../catalog');
const { slugify, discountPercent } = require('../../utils');

const RAW = [
  /* ============================================================ MENSWEAR */
  {
    n: 'Premium Oxford Shirt', c: 'men-clothing', b: 'Biofran Select', p: 24500, o: 32000,
    ic: 'shirt', r: 4.8, rc: 214, s: 36, bd: 'Best Seller', ft: 1,
    d: 'A crisp cotton oxford shirt with a clean structured collar — the everyday smart-casual piece that works with chinos, suits or denim.',
    f: ['100% combed cotton oxford', 'Reinforced collar and cuffs', 'Slim-but-comfortable regular fit', 'Machine washable'],
    sp: { Material: 'Cotton Oxford', Fit: 'Regular', Sizes: 'S - 3XL', Colours: 'White / Sky / Navy / Black' }
  },
  {
    n: 'Italian Wool Two-Piece Suit', c: 'men-clothing', b: 'Biofran Signature', p: 185000, o: 240000,
    ic: 'suit', r: 4.9, rc: 68, s: 8, bd: 'Premium', ft: 1,
    d: 'A sharply tailored two-piece suit in a mid-weight wool blend — cut for weddings, boardrooms and every occasion in between.',
    f: ['Half-canvas construction', 'Full satin lining', 'Tapered flat-front trousers', 'Free basic alteration in store'],
    sp: { Material: 'Wool blend 70/30', Fit: 'Slim', Sizes: '38 - 52', Includes: 'Jacket + Trousers' }
  },
  {
    n: 'Slim-Fit Stretch Chinos', c: 'men-clothing', b: 'Biofran Select', p: 21000, o: 27500,
    ic: 'suit', r: 4.6, rc: 143, s: 44,
    d: 'Stretch-twill chinos that hold their shape all day — dress them up with a shirt or down with a tee.',
    f: ['Cotton-elastane stretch twill', 'Five-pocket styling', 'Wrinkle resistant finish'],
    sp: { Material: '98% Cotton, 2% Elastane', Fit: 'Slim', Sizes: '30 - 44' }
  },
  {
    n: 'Vintage Denim Jacket', c: 'men-clothing', b: 'Biofran Select', p: 38500, o: 46000,
    ic: 'shirt', r: 4.7, rc: 96, s: 22, ft: 1,
    d: 'Heavyweight denim jacket with a lived-in wash and brass buttons — layers beautifully over hoodies and tees.',
    f: ['14oz heavyweight denim', 'Button front with chest pockets', 'Adjustable waist tabs'],
    sp: { Material: '100% Cotton Denim', Sizes: 'S - 3XL', Wash: 'Mid blue stonewash' }
  },
  {
    n: 'Royal Agbada Two-Piece Set', c: 'men-clothing', b: 'Biofran Heritage', p: 96000, o: 125000,
    ic: 'gown', r: 4.9, rc: 121, s: 12, bd: 'Native', ft: 1,
    d: 'A regal three-quarter agbada set with hand-finished embroidery — designed for ceremonies, chieftaincy titles and celebrations.',
    f: ['Hand-embroidered neckline', 'Agbada + inner kaftan + trousers', 'Premium senator fabric'],
    sp: { Material: 'Senator wool blend', Sizes: 'M - 4XL', Embroidery: 'Gold or silver thread' }
  },
  {
    n: 'Classic Pique Polo Shirt', c: 'men-clothing', b: 'Biofran Select', p: 14500, o: 18500,
    ic: 'polo', r: 4.5, rc: 187, s: 52,
    d: 'Breathable pique polo with a ribbed collar and a two-button placket — a wardrobe staple in every colour.',
    f: ['Cotton pique knit', 'Ribbed collar and cuffs', 'Side vents for movement'],
    sp: { Material: '100% Cotton Pique', Sizes: 'S - 3XL', Colours: '6 colours available' }
  },

  /* ========================================================== WOMENSWEAR */
  {
    n: 'Ankara Maxi Gown', c: 'women-clothing', b: 'Biofran Heritage', p: 62000, o: 78000,
    ic: 'gown', r: 4.9, rc: 158, s: 18, bd: 'Native', ft: 1,
    d: 'A floor-sweeping Ankara maxi gown with a fitted bodice and a dramatic flare — tailored to turn heads at any event.',
    f: ['100% authentic wax print', 'Lined bodice with hidden zip', 'Adjustable waist tie'],
    sp: { Material: 'Ankara wax print', Sizes: 'UK 8 - 20', Length: 'Floor length' }
  },
  {
    n: 'Silk Wrap Dress', c: 'women-clothing', b: 'Biofran Signature', p: 54000, o: 68000,
    ic: 'dress', r: 4.8, rc: 134, s: 24, ft: 1,
    d: 'A fluid wrap dress in a soft silk-touch fabric that flatters every shape — office ready, dinner approved.',
    f: ['Silk-touch crepe', 'Adjustable wrap tie', 'Flattering V neckline', 'Machine washable at 30 degrees'],
    sp: { Material: 'Silk-touch polyester', Sizes: 'UK 8 - 20', Colours: 'Emerald / Wine / Black' }
  },
  {
    n: 'Chiffon Office Blouse', c: 'women-clothing', b: 'Biofran Select', p: 19500, o: 26000,
    ic: 'blouse', r: 4.6, rc: 176, s: 40,
    d: 'A lightly structured chiffon blouse with a soft bow tie — the reliable piece for Monday meetings and Friday lunches.',
    f: ['Double-layer chiffon front', 'Bow necktie included', 'Non-iron finish'],
    sp: { Material: 'Chiffon', Sizes: 'UK 8 - 18', Colours: 'Ivory / Powder blue / Black' }
  },
  {
    n: 'Tailored Office Blazer', c: 'women-clothing', b: 'Biofran Signature', p: 68000, o: 85000,
    ic: 'suit', r: 4.8, rc: 92, s: 16, ft: 1,
    d: 'A sharply cut blazer with a single-button closure and a clean shoulder line — instant polish over anything.',
    f: ['Fully lined', 'Structured shoulder pads', 'Two flap pockets', 'Dry clean recommended'],
    sp: { Material: 'Poly-viscose suiting', Sizes: 'UK 8 - 20', Fit: 'Tailored' }
  },
  {
    n: 'Lace Aso-Ebi Set', c: 'women-clothing', b: 'Biofran Heritage', p: 88000, o: 110000,
    ic: 'gown', r: 4.9, rc: 77, s: 10, bd: 'Bridal',
    d: 'A coordinated lace aso-ebi set for bridal trains and family celebrations — available in matching group quantities.',
    f: ['Premium French lace', 'Inner slip included', 'Head-tie fabric included', 'Group orders welcome'],
    sp: { Material: 'French lace', Sizes: 'UK 8 - 22', Note: 'Bulk bridal orders available' }
  },
  {
    n: 'Wide-Leg Palazzo Jumpsuit', c: 'women-clothing', b: 'Biofran Select', p: 42500, o: 55000,
    ic: 'dress', r: 4.7, rc: 88, s: 20,
    d: 'A modern wide-leg jumpsuit with a cinched waist — one piece, endless styling options.',
    f: ['Four-way stretch crepe', 'Concealed back zip', 'Removable belt'],
    sp: { Material: 'Stretch crepe', Sizes: 'UK 8 - 20', Length: 'Full length' }
  },

  /* ================================================================ SHOES */
  {
    n: 'Oxford Leather Dress Shoes', c: 'shoes', b: 'Biofran Signature', p: 68000, o: 84000,
    ic: 'shoe', r: 4.8, rc: 132, s: 20, bd: 'Best Seller', ft: 1,
    d: 'Hand-finished genuine leather oxfords with a cushioned insole — the classic formal shoe that finishes every suit.',
    f: ['Genuine full-grain leather upper', 'Memory-foam cushioned insole', 'Stitched leather sole'],
    sp: { Material: 'Full-grain leather', Sizes: '39 - 46', Colour: 'Black / Brown' }
  },
  {
    n: 'Italian Suede Loafers', c: 'shoes', b: 'Biofran Signature', p: 74500, o: 92000,
    ic: 'shoe', r: 4.7, rc: 88, s: 16, ft: 1,
    d: 'Slip-on suede loafers with a soft unlined construction — smart enough for the office, easy enough for weekends.',
    f: ['Soft suede upper', 'Flexible unlined build', 'Antibacterial insole lining'],
    sp: { Material: 'Suede', Sizes: '39 - 46', Colour: 'Tan / Navy / Charcoal' }
  },
  {
    n: 'Air-Cushion Sports Sneakers', c: 'shoes', b: 'Biofran Sport', p: 42000, o: 55000,
    ic: 'shoe', r: 4.6, rc: 265, s: 48, bd: 'Trending',
    d: 'Lightweight knit sneakers with an air-cushion sole — all-day comfort whether you are training or travelling.',
    f: ['Breathable knit upper', 'Air-cushion shock absorbing sole', 'Non-slip rubber outsole'],
    sp: { Material: 'Knit mesh', Sizes: '38 - 46', Use: 'Gym / Casual' }
  },
  {
    n: 'Stiletto Heel Pumps', c: 'shoes', b: 'Biofran Signature', p: 48500, o: 62000,
    ic: 'heel', r: 4.7, rc: 104, s: 22, ft: 1,
    d: 'Classic pointed stilettos with a padded footbed — elegant height that stays comfortable through the reception.',
    f: ['9cm covered stiletto heel', 'Padded footbed', 'Non-slip sole pad'],
    sp: { Heel: '9cm', Sizes: '36 - 42', Colour: 'Black / Nude / Red' }
  },
  {
    n: 'Block Heel Sandals', c: 'shoes', b: 'Biofran Select', p: 34000, o: 44000,
    ic: 'sandal', r: 4.5, rc: 71, s: 26,
    d: 'Stable block-heel sandals with an adjustable ankle strap — dressy but kind to your feet.',
    f: ['7cm block heel', 'Adjustable buckle strap', 'Cushioned footbed'],
    sp: { Heel: '7cm', Sizes: '36 - 42', Colour: 'Gold / Black / Nude' }
  },
  {
    n: 'Kids Leather School Shoes', c: 'shoes', b: 'Biofran Kids', p: 22000, o: 28000,
    ic: 'shoe', r: 4.6, rc: 143, s: 60,
    d: 'Tough, easy-clean leather school shoes built for playgrounds and long school terms.',
    f: ['Scuff-resistant leather', 'Velcro or lace options', 'Durable stitched sole'],
    sp: { Material: 'Leather', Sizes: '26 - 38', Closure: 'Velcro / Lace' }
  },

  /* ================================================================= BAGS */
  {
    n: 'Executive Leather Briefcase', c: 'bags', b: 'Biofran Signature', p: 82000, o: 105000,
    ic: 'briefcase', r: 4.9, rc: 76, s: 14, bd: 'Premium', ft: 1,
    d: 'A structured leather briefcase with a padded 15.6" laptop sleeve — the professional carry that lasts years.',
    f: ['Genuine leather body', 'Fits 15.6 inch laptop', 'Detachable shoulder strap', 'Lockable zip pulls'],
    sp: { Material: 'Genuine leather', Size: '41 x 31 x 11 cm', Colour: 'Dark brown / Black' }
  },
  {
    n: 'Anti-Theft Laptop Backpack', c: 'bags', b: 'Biofran Gear', p: 36500, o: 48000,
    ic: 'backpack', r: 4.7, rc: 218, s: 42, bd: 'Best Seller', ft: 1,
    d: 'A water-resistant backpack with hidden zips, a USB charge port and a padded laptop compartment.',
    f: ['Concealed anti-theft zips', 'USB charging port', 'Water-resistant fabric', 'Fits 15.6 inch laptop'],
    sp: { Material: 'Water-resistant polyester', Capacity: '28 litres', Colour: 'Black / Grey' }
  },
  {
    n: 'Womens Leather Tote Handbag', c: 'bags', b: 'Biofran Signature', p: 58000, o: 74000,
    ic: 'bag', r: 4.8, rc: 112, s: 18, ft: 1,
    d: 'A roomy structured tote in soft leather with a matching inner pouch — carries the laptop and the lipstick.',
    f: ['Soft pebbled leather', 'Detachable inner pouch', 'Magnetic snap closure', 'Reinforced handles'],
    sp: { Material: 'Pebbled leather', Size: '38 x 28 x 12 cm', Colour: 'Tan / Black / Wine' }
  },
  {
    n: 'Crossbody Sling Bag', c: 'bags', b: 'Biofran Gear', p: 18500, o: 24500,
    ic: 'bag', r: 4.5, rc: 164, s: 50,
    d: 'A compact crossbody sling for phone, wallet, keys and power bank — hands free and always close.',
    f: ['Adjustable webbing strap', 'Quick-access front pocket', 'Water-resistant lining'],
    sp: { Material: 'Polyester', Capacity: '4 litres', Colour: 'Black / Olive' }
  },
  {
    n: 'Travel Duffel Weekender', c: 'bags', b: 'Biofran Gear', p: 44000, o: 58000,
    ic: 'duffel', r: 4.6, rc: 93, s: 24,
    d: 'A spacious weekender with a separate shoe compartment that meets cabin requirements — built for road trips.',
    f: ['45 litre capacity', 'Separate shoe compartment', 'Detachable shoulder strap', 'Cabin friendly size'],
    sp: { Capacity: '45 litres', Material: 'Heavy-duty canvas', Colour: 'Black / Khaki' }
  },

  /* ============================================================== WATCHES */
  {
    n: 'Chronograph Dress Watch', c: 'watches', b: 'Biofran Time', p: 89000, o: 118000,
    ic: 'watch', r: 4.9, rc: 147, s: 15, bd: 'Premium', ft: 1,
    d: 'A stainless-steel chronograph with three sub-dials and a sapphire-coated crystal — boardroom presence on the wrist.',
    f: ['Japanese quartz chronograph movement', 'Stainless steel bracelet', 'Sapphire-coated crystal', '50m water resistant'],
    sp: { Movement: 'Japanese Quartz', Case: '42mm stainless steel', Strap: 'Steel bracelet', Warranty: '1 year' }
  },
  {
    n: 'Classic Roman Dial Watch', c: 'watches', b: 'Biofran Time', p: 54000, o: 72000,
    ic: 'watch', r: 4.8, rc: 189, s: 26, bd: 'Best Seller', ft: 1,
    d: 'A slim dress watch with Roman numerals and a genuine leather strap — quietly elegant under any cuff.',
    f: ['Slim 38mm case', 'Genuine leather strap', 'Roman numeral dial', 'Scratch-resistant glass'],
    sp: { Movement: 'Quartz', Case: '38mm', Strap: 'Genuine leather', Warranty: '1 year' }
  },
  {
    n: 'Rose-Gold Bracelet Watch', c: 'watches', b: 'Biofran Time', p: 76500, o: 98000,
    ic: 'watch', r: 4.8, rc: 118, s: 18, ft: 1,
    d: 'A delicate rose-gold bracelet watch with a mother-of-pearl dial — jewellery you can tell the time on.',
    f: ['Mother-of-pearl dial', 'Rose-gold plated bracelet', 'Adjustable links', 'Gift box included'],
    sp: { Movement: 'Quartz', Case: '32mm', Strap: 'Rose-gold plated', Packaging: 'Gift box' }
  },
  {
    n: 'Minimalist Leather Watch', c: 'watches', b: 'Biofran Time', p: 42500, o: 56000,
    ic: 'watch', r: 4.6, rc: 156, s: 30,
    d: 'Clean, uncluttered dial with no numbers and a soft leather strap — the everyday minimal watch.',
    f: ['Ultra-slim 6mm profile', 'Minimalist dial with baton hands', 'Soft genuine leather strap'],
    sp: { Movement: 'Quartz', Case: '40mm', Thickness: '6mm', Strap: 'Leather' }
  },
  {
    n: 'Smart Fitness Watch', c: 'watches', b: 'Biofran Tech', p: 58500, o: 75000,
    ic: 'smartwatch', r: 4.7, rc: 274, s: 34, bd: 'Trending', ft: 1,
    d: 'Track steps, heart rate, sleep and calls from your wrist with a bright touchscreen and 7-day battery.',
    f: ['Heart rate & SpO2 tracking', 'Bluetooth calling', '7-day battery life', 'IP68 water resistant'],
    sp: { Display: '1.85 inch HD touch', Battery: 'Up to 7 days', Compatible: 'Android & iOS', Water: 'IP68' }
  },

  /* ============================================================ EYEWEAR */
  {
    n: 'Polarised Aviator Sunglasses', c: 'glasses', b: 'Biofran Select', p: 26500, o: 35000,
    ic: 'glasses', r: 4.7, rc: 128, s: 38, ft: 1,
    d: 'Polarised aviators with 100% UV400 protection — sharper vision and zero glare while driving.',
    f: ['Polarised UV400 lenses', 'Lightweight metal frame', 'Includes case and cloth'],
    sp: { Lens: 'Polarised UV400', Frame: 'Alloy metal', Gender: 'Unisex' }
  },
  {
    n: 'Blue-Light Computer Glasses', c: 'glasses', b: 'Biofran Select', p: 19500, o: 26000,
    ic: 'glasses', r: 4.5, rc: 96, s: 44,
    d: 'Anti-blue-light lenses that reduce eye strain and glare during long screen sessions.',
    f: ['Filters blue light up to 40%', 'Anti-glare coating', 'Lightweight TR90 frame'],
    sp: { Lens: 'Blue-light filter', Frame: 'TR90', Use: 'Screen / Office' }
  },

  /* ======================================================= HOME APPLIANCES */
  {
    n: '180L Double-Door Refrigerator', c: 'home-appliances', b: 'Biofran Home', p: 385000, o: 445000,
    ic: 'fridge', r: 4.7, rc: 84, s: 7, bd: 'Premium', ft: 1, u: 'per unit',
    d: 'A 180-litre double-door fridge with a separate freezer and an energy-saving compressor — reliable cooling for a family.',
    f: ['180 litre net capacity', 'Separate top freezer', 'Energy class A+ compressor', 'Adjustable glass shelves'],
    sp: { Capacity: '180 litres', Doors: '2 (top freezer)', Power: '220V - 240V', Warranty: '1 year' }
  },
  {
    n: '200L Chest Freezer', c: 'home-appliances', b: 'Biofran Home', p: 425000, o: 495000,
    ic: 'freezer', r: 4.6, rc: 52, s: 6, u: 'per unit',
    d: 'A deep 200-litre chest freezer that holds its temperature during power cuts — ideal for bulk food and drinks.',
    f: ['200 litre capacity', 'Fast-freeze function', 'Lockable lid with key', 'Runs on low voltage'],
    sp: { Capacity: '200 litres', Type: 'Chest', Power: '220V', Warranty: '1 year' }
  },
  {
    n: '1.5HP Split Air Conditioner', c: 'home-appliances', b: 'Biofran Home', p: 545000, o: 620000,
    ic: 'ac', r: 4.8, rc: 63, s: 5, bd: 'Premium', ft: 1, u: 'per unit',
    d: 'A 1.5HP inverter split AC that cools a large room quietly while cutting electricity cost. Installation available.',
    f: ['1.5HP inverter compressor', 'Copper condenser', 'Remote with sleep timer', 'Installation kit included'],
    sp: { Power: '1.5HP', Type: 'Inverter split', Coverage: 'Up to 18 sqm', Warranty: '1 year' }
  },
  {
    n: '18-Inch Standing Fan', c: 'home-appliances', b: 'Biofran Home', p: 58000, o: 72000,
    ic: 'fan', r: 4.5, rc: 231, s: 25, bd: 'Best Seller', ft: 1, u: 'per unit',
    d: 'A powerful 18-inch standing fan with adjustable height and three speed settings — moves air across the whole room.',
    f: ['18 inch blade diameter', '3 speed settings', 'Adjustable height up to 1.3m', 'Thermal cut-off protection'],
    sp: { Size: '18 inches', Speeds: '3', Power: '220V', Warranty: '6 months' }
  },
  {
    n: '7kg Front-Load Washing Machine', c: 'home-appliances', b: 'Biofran Home', p: 595000, o: 680000,
    ic: 'washer', r: 4.7, rc: 41, s: 4, u: 'per unit',
    d: 'A 7kg front-loading washer with 15 programmes and a quick-wash cycle — gentle on fabric, tough on stains.',
    f: ['7kg drum capacity', '15 wash programmes', 'Quick 15-minute wash', 'Child lock and delay start'],
    sp: { Capacity: '7kg', Type: 'Front load', Spin: '1000 RPM', Warranty: '1 year' }
  },
  {
    n: '20L Digital Microwave Oven', c: 'home-appliances', b: 'Biofran Home', p: 145000, o: 175000,
    ic: 'microwave', r: 4.6, rc: 118, s: 14, ft: 1, u: 'per unit',
    d: 'A 20-litre digital microwave with grill and 8 auto-cook menu presets — reheat, defrost and grill in minutes.',
    f: ['20 litre capacity', '700W microwave power', 'Grill function', '8 auto-cook presets'],
    sp: { Capacity: '20 litres', Power: '700W', Control: 'Digital', Warranty: '1 year' }
  },
  {
    n: 'Hot and Cold Water Dispenser', c: 'home-appliances', b: 'Biofran Home', p: 235000, o: 285000,
    ic: 'dispenser', r: 4.5, rc: 76, s: 9, u: 'per unit',
    d: 'A floor-standing dispenser that pours chilled and boiling water on demand — works with bottles or direct plumbing.',
    f: ['Hot and cold taps', 'Stainless steel tanks', 'Child safety hot lock', 'Bottle or plumbing feed'],
    sp: { Tanks: 'Stainless steel', Power: '220V', Type: 'Floor standing', Warranty: '1 year' }
  },
  {
    n: '1.7L Stainless Electric Kettle', c: 'home-appliances', b: 'Biofran Home', p: 34500, o: 44000,
    ic: 'kettle', r: 4.4, rc: 204, s: 40, u: 'per unit',
    d: 'A 1.7-litre cordless electric kettle with a concealed element and auto shut-off — boils in under five minutes.',
    f: ['1.7 litre capacity', '1800W fast boil', 'Auto shut-off and boil dry protection', 'Cordless 360 degree base'],
    sp: { Capacity: '1.7 litres', Power: '1800W', Body: 'Stainless steel', Warranty: '6 months' }
  },

  /* ==================================================== KITCHEN APPLIANCES */
  {
    n: '3-in-1 Blender and Grinder', c: 'kitchen-appliances', b: 'Biofran Home', p: 68000, o: 85000,
    ic: 'blender', r: 4.6, rc: 189, s: 22, bd: 'Best Seller', ft: 1, u: 'per unit',
    d: 'A 3-in-1 blender, grinder and mill with stainless blades — smoothies, pepper and dry spices in one machine.',
    f: ['600W copper motor', '3 jars: blender, mill, grinder', 'Stainless steel blades', '2 speed with pulse'],
    sp: { Power: '600W', Jars: '3', Capacity: '1.5 litres', Warranty: '6 months' }
  },
  {
    n: '1.8L Rice Cooker with Steamer', c: 'kitchen-appliances', b: 'Biofran Home', p: 42000, o: 54000,
    ic: 'ricecooker', r: 4.5, rc: 156, s: 26, u: 'per unit',
    d: 'A 1.8-litre rice cooker that keeps rice warm for hours, with a steamer tray for vegetables and fish.',
    f: ['1.8 litre non-stick pot', 'Keep-warm function', 'Steamer tray included', 'Measuring cup and spatula'],
    sp: { Capacity: '1.8 litres', Power: '700W', Pot: 'Non-stick', Warranty: '6 months' }
  },
  {
    n: 'Steam and Dry Iron', c: 'kitchen-appliances', b: 'Biofran Home', p: 21500, o: 28000,
    ic: 'iron', r: 4.4, rc: 132, s: 38, u: 'per unit',
    d: 'A ceramic-soleplate steam iron with a burst spray function — crisp shirts without the shine.',
    f: ['Ceramic non-stick soleplate', 'Steam and dry settings', 'Burst steam and spray', 'Anti-drip system'],
    sp: { Power: '1800W', Soleplate: 'Ceramic', Tank: '260ml', Warranty: '6 months' }
  },
  {
    n: '4-Slice Bread Toaster', c: 'kitchen-appliances', b: 'Biofran Home', p: 26500, o: 34000,
    ic: 'generic', r: 4.3, rc: 87, s: 30, u: 'per unit',
    d: 'A four-slot toaster with browning control and a high-lift lever — breakfast for four in one round.',
    f: ['4 wide slots', '7 browning levels', 'Cancel, reheat and defrost', 'Removable crumb tray'],
    sp: { Slots: '4', Power: '1400W', Controls: '7 levels', Warranty: '6 months' }
  },

  /* ====================================================== GAS REFILL (LPG) */
  {
    n: '5kg Cooking Gas Refill', c: 'gas-refill', b: 'Biofran Gas', p: 6500, o: 7500,
    ic: 'flame', r: 4.9, rc: 412, s: 999, bd: 'Store Service', ft: 1, u: 'per refill',
    d: 'Refill your 5kg cylinder at our physical store. We weigh every cylinder in front of you, check the valve and seal it before you leave.',
    f: ['Accurate digital weighing', 'Free valve and hose inspection', 'Sealed after filling', 'Same-day home delivery available'],
    sp: { Cylinder: '5kg', Refill: '4.3kg net gas', Unit: 'Per refill', Delivery: 'Same day (within city)' }
  },
  {
    n: '12.5kg Cooking Gas Refill', c: 'gas-refill', b: 'Biofran Gas', p: 15500, o: 17500,
    ic: 'flame', r: 4.9, rc: 986, s: 999, bd: 'Most Popular', ft: 1, u: 'per refill',
    d: 'Our most requested refill — the standard 12.5kg family cylinder. Filled, weighed, sealed and safety-checked at the store.',
    f: ['Accurate digital weighing', 'Leak test on every cylinder', 'Sealed after filling', 'Delivery within the city'],
    sp: { Cylinder: '12.5kg', Refill: '12.5kg net gas', Unit: 'Per refill', Delivery: 'Same day (within city)' }
  },
  {
    n: '25kg Cooking Gas Refill', c: 'gas-refill', b: 'Biofran Gas', p: 29500, o: 33000,
    ic: 'flame', r: 4.8, rc: 264, s: 999, bd: 'Store Service', ft: 1, u: 'per refill',
    d: 'Ideal for large households and small restaurants. Bulk refilling with a full safety inspection included.',
    f: ['Accurate digital weighing', 'Free hose and regulator check', 'Sealed after filling', 'Bulk discounts available'],
    sp: { Cylinder: '25kg', Refill: '25kg net gas', Unit: 'Per refill', Delivery: 'Same day' }
  },
  {
    n: '50kg Commercial Gas Refill', c: 'gas-refill', b: 'Biofran Gas', p: 58000, o: 64000,
    ic: 'flame', r: 4.8, rc: 137, s: 999, u: 'per refill',
    d: 'Commercial-grade refill for restaurants, bakeries and hotels — scheduled refills available on request.',
    f: ['Accurate digital weighing', 'Scheduled recurring refills', 'Free safety inspection', 'Invoice provided'],
    sp: { Cylinder: '50kg', Refill: '50kg net gas', Unit: 'Per refill', Delivery: 'Scheduled' }
  },
  {
    n: '12.5kg Cylinder Exchange (Gas Included)', c: 'gas-refill', b: 'Biofran Gas', p: 78000, o: 92000,
    ic: 'cylinder', r: 4.7, rc: 198, s: 24, bd: 'Bundle', u: 'per set',
    d: 'Hand in your old cylinder and walk away with a brand new 12.5kg cylinder already filled with gas — one simple price.',
    f: ['New certified 12.5kg cylinder', 'Filled and sealed with gas', 'Old cylinder traded in', 'Safety valve certified'],
    sp: { Cylinder: '12.5kg (new)', Includes: 'Full gas refill', TradeIn: 'Accepted at store', Unit: 'Per set' }
  },

  /* ====================================================== GAS ACCESSORIES */
  {
    n: '12.5kg Gas Cylinder (Empty)', c: 'gas-accessories', b: 'Biofran Gas', p: 62000, o: 74000,
    ic: 'cylinder', r: 4.8, rc: 176, s: 20, bd: 'Certified', ft: 1, u: 'per unit',
    d: 'A certified 12.5kg steel cylinder with a safety valve — the standard size for family kitchens in Nigeria.',
    f: ['Certified safety valve', 'Anti-rust powder coating', 'Sturdy carry handle', 'Fills at our store'],
    sp: { Capacity: '12.5kg', Material: 'Steel', Valve: 'Certified safety valve', Unit: 'Per unit' }
  },
  {
    n: 'Gas Regulator and Hose Set', c: 'gas-accessories', b: 'Biofran Gas', p: 12500, o: 16000,
    ic: 'regulator', r: 4.8, rc: 341, s: 45, bd: 'Best Seller', ft: 1, u: 'per set',
    d: 'A complete regulator and hose set with metal clamps — everything you need to connect a cylinder to a cooker safely.',
    f: ['Pressure-tested regulator', '1.5m reinforced hose', '2 metal hose clamps', 'Fits standard 12.5kg / 25kg cylinders'],
    sp: { Included: 'Regulator + 1.5m hose + 2 clamps', Fitting: 'Standard Nigerian cylinder', Unit: 'Per set' }
  },
  {
    n: 'Heavy-Duty Gas Hose 1.5m', c: 'gas-accessories', b: 'Biofran Gas', p: 4500, o: 6000,
    ic: 'hose', r: 4.7, rc: 289, s: 80, u: 'per length',
    d: 'A reinforced rubber gas hose with a braided core that resists cracking — replace yours every two years.',
    f: ['Reinforced braided core', 'Crack and heat resistant', '1.5 metre length', 'Clamps sold separately'],
    sp: { Length: '1.5 metres', Material: 'Reinforced rubber', Standard: 'LPG rated', Unit: 'Per length' }
  },
  {
    n: 'Single Burner Head Replacement', c: 'gas-accessories', b: 'Biofran Gas', p: 8500, o: 11000,
    ic: 'burner', r: 4.6, rc: 154, s: 55, u: 'per unit',
    d: 'A replacement cast-iron burner head that restores a blocked or rusted stove to full flame.',
    f: ['Cast iron body', 'Even flame distribution', 'Fits most table-top stoves', 'Easy drop-in replacement'],
    sp: { Material: 'Cast iron', Fits: 'Universal table-top stoves', Unit: 'Per unit' }
  },
  {
    n: 'Gas Leak Detector Alarm', c: 'gas-accessories', b: 'Biofran Safety', p: 28000, o: 36000,
    ic: 'detector', r: 4.7, rc: 68, s: 18, bd: 'Safety', ft: 1, u: 'per unit',
    d: 'A wall-mounted LPG leak detector that sounds an 85dB alarm the moment it senses gas — essential for every kitchen.',
    f: ['Detects LPG and natural gas', '85dB alarm and LED warning', 'Wall or ceiling mountable', 'Battery or adapter powered'],
    sp: { Alarm: '85dB', Power: 'Battery / DC adapter', Mount: 'Wall or ceiling', Unit: 'Per unit' }
  },
  {
    n: 'Cylinder Valve and Safety Cap', c: 'gas-accessories', b: 'Biofran Gas', p: 9500, o: 12500,
    ic: 'cylinder', r: 4.5, rc: 61, s: 35, u: 'per unit',
    d: 'A replacement cylinder valve with a screw-on safety cap — stop slow leaks before they become dangerous.',
    f: ['Brass valve body', 'Screw-on safety cap', 'Leak-proof seal', 'Fitted free when you refill in store'],
    sp: { Material: 'Brass', Fits: '5kg - 25kg cylinders', Unit: 'Per unit' }
  },

  /* ============================================================= CAMP GAS */
  {
    n: '3kg Camp Gas Cylinder', c: 'camp-gas', b: 'Biofran Camp', p: 28500, o: 36000,
    ic: 'canister', r: 4.7, rc: 142, s: 30, bd: 'Camping', ft: 1, u: 'per unit',
    d: 'A compact 3kg cylinder built for camping, road trips and small kitchens — light enough to carry, strong enough to cook for days.',
    f: ['Lightweight 3kg body', 'Certified safety valve', 'Sturdy carry handle', 'Refillable at our store'],
    sp: { Capacity: '3kg', Material: 'Steel', Use: 'Camping / Small kitchen', Unit: 'Per unit' }
  },
  {
    n: '6kg Camping Gas Set (Cylinder and Burner)', c: 'camp-gas', b: 'Biofran Camp', p: 68000, o: 86000,
    ic: 'campstove', r: 4.8, rc: 96, s: 16, bd: 'Bundle', ft: 1, u: 'per set',
    d: 'Everything for outdoor cooking in one box: a 6kg cylinder, a portable burner, a regulator and a hose, ready to use.',
    f: ['6kg refillable cylinder', 'Portable single burner', 'Regulator and hose included', 'Carry bag included'],
    sp: { Cylinder: '6kg', Burner: 'Single portable', Includes: 'Regulator + hose + bag', Unit: 'Per set' }
  },
  {
    n: 'Butane Canister 220g (Pack of 4)', c: 'camp-gas', b: 'Biofran Camp', p: 12500, o: 16000,
    ic: 'canister', r: 4.5, rc: 208, s: 60, u: 'per pack',
    d: 'A handy four-pack of 220g butane canisters for portable table-top burners and picnic stoves.',
    f: ['4 x 220g canisters', 'Fits standard portable burners', 'Long shelf life', 'Sealed and certified'],
    sp: { Contents: '4 x 220g canisters', Fits: 'Portable butane burners', Unit: 'Per pack' }
  },

  /* ======================================================= COOKING STOVES */
  {
    n: '2-Burner Table-Top Gas Cooker', c: 'cooking-stoves', b: 'Biofran Gas', p: 78000, o: 95000,
    ic: 'stove', r: 4.8, rc: 267, s: 22, bd: 'Best Seller', ft: 1, u: 'per unit',
    d: 'A sturdy two-burner table-top cooker with auto-ignition and cast-iron pan supports — the everyday kitchen workhorse.',
    f: ['Auto-ignition on both burners', 'Cast-iron pan supports', 'Brass burner heads', 'Stainless steel body'],
    sp: { Burners: '2', Ignition: 'Auto', Body: 'Stainless steel', Warranty: '1 year' }
  },
  {
    n: '4-Burner Standing Cooker with Oven', c: 'cooking-stoves', b: 'Biofran Gas', p: 235000, o: 285000,
    ic: 'stove', r: 4.9, rc: 74, s: 8, bd: 'Premium', ft: 1, u: 'per unit',
    d: 'A full standing cooker with four burners, a gas oven and a grill — a complete kitchen in a single unit.',
    f: ['4 gas burners with auto-ignition', 'Gas oven with grill', 'Toughened glass lid', 'Oven lamp and rotisserie'],
    sp: { Burners: '4', Oven: 'Gas with grill', Ignition: 'Auto', Warranty: '1 year' }
  },
  {
    n: 'Single Burner Desktop Stove', c: 'cooking-stoves', b: 'Biofran Gas', p: 32000, o: 42000,
    ic: 'stove', r: 4.6, rc: 312, s: 45, u: 'per unit',
    d: 'A small single-burner stove that fits anywhere — perfect for singles, hostels and quick cooking.',
    f: ['Auto-ignition', 'Cast-iron pan support', 'Compact footprint', 'Low gas consumption'],
    sp: { Burners: '1', Ignition: 'Auto', Body: 'Powder-coated steel', Warranty: '6 months' }
  },
  {
    n: '3-Burner Tempered Glass Cooker', c: 'cooking-stoves', b: 'Biofran Gas', p: 155000, o: 185000,
    ic: 'stove', r: 4.7, rc: 118, s: 12, ft: 1, u: 'per unit',
    d: 'A three-burner cooker with a sleek tempered-glass top — easy to clean and beautiful on any counter.',
    f: ['8mm tempered glass top', 'Auto-ignition', 'Brass burner heads', 'Drip trays included'],
    sp: { Burners: '3', Top: 'Tempered glass', Ignition: 'Auto', Warranty: '1 year' }
  },

  /* ========================================================== CAMP STOVES */
  {
    n: 'Portable Folding Camping Stove', c: 'camp-stoves', b: 'Biofran Camp', p: 24500, o: 32000,
    ic: 'campstove', r: 4.7, rc: 186, s: 40, bd: 'Camping', ft: 1, u: 'per unit',
    d: 'A folding single-burner camping stove that packs down to the size of a small book — cook anywhere, anytime.',
    f: ['Foldable carry design', 'Piezo auto-ignition', 'Wind-resistant burner', 'Carry case included'],
    sp: { Burners: '1', Ignition: 'Piezo', Fuel: 'LPG / Butane', Unit: 'Per unit' }
  },
  {
    n: 'Windproof Backpacking Stove', c: 'camp-stoves', b: 'Biofran Camp', p: 18500, o: 24500,
    ic: 'campstove', r: 4.6, rc: 143, s: 55, u: 'per unit',
    d: 'An ultralight backpacking stove with a built-in windshield — boils water in minutes even in a strong breeze.',
    f: ['Ultralight alloy body', 'Integrated windshield', 'Folds into its own pot', 'Reliable in windy conditions'],
    sp: { Weight: 'under 400g', Ignition: 'Manual', Fuel: 'Butane canister', Unit: 'Per unit' }
  },
  {
    n: 'Double Burner Camping Stove', c: 'camp-stoves', b: 'Biofran Camp', p: 48000, o: 62000,
    ic: 'campstove', r: 4.8, rc: 91, s: 20, ft: 1, u: 'per unit',
    d: 'A two-burner camping stove with a solid carry handle — cook a full outdoor meal for the whole family at once.',
    f: ['Two independent burners', 'Removable drip tray', 'Locking lid with carry handle', 'Runs on standard camp gas'],
    sp: { Burners: '2', Fuel: 'Camp gas cylinder', Body: 'Powder-coated steel', Unit: 'Per unit' }
  }
];

/* ========================================================================
 * Expands the compact rows above into full product documents.
 * ===================================================================== */

const BRAND_CODES = {
  'Biofran Select': 'SEL',
  'Biofran Signature': 'SIG',
  'Biofran Heritage': 'HER',
  'Biofran Sport': 'SPT',
  'Biofran Kids': 'KID',
  'Biofran Gear': 'GER',
  'Biofran Time': 'TIM',
  'Biofran Tech': 'TEC',
  'Biofran Home': 'HOM',
  'Biofran Gas': 'GAS',
  'Biofran Safety': 'SAF',
  'Biofran Camp': 'CMP'
};

function buildProducts() {
  const used = new Set();

  return RAW.map((row) => {
    const category = categoryByKey(row.c);
    const group = category ? groupByKey(category.group) : null;

    let slug = slugify(row.n);
    let n = 2;
    while (used.has(slug)) slug = `${slugify(row.n)}-${n++}`;
    used.add(slug);

    const image = `/img/p/${slug}.svg`;
    const preview = `/img/p/${slug}.svg?size=1400`;

    const gallery = [
      { label: 'Front view', url: image, preview },
      { label: 'Detail close-up', url: `/img/p/${slug}.svg?v=2`, preview: `/img/p/${slug}.svg?v=2&size=1400` },
      { label: 'Styled view', url: `/img/p/${slug}.svg?v=3`, preview: `/img/p/${slug}.svg?v=3&size=1400` }
    ];

    const brands = Object.keys(BRAND_CODES);
    const brand = row.b && brands.includes(row.b) ? row.b : 'Biofran Select';

    return {
      id: `prd_${String(RAW.indexOf(row) + 1).padStart(4, '0')}`,
      slug,
      sku: `BFV-${BRAND_CODES[brand] || 'GEN'}-${String(RAW.indexOf(row) + 1).padStart(4, '0')}`,
      name: row.n,
      brand,
      category: row.c,
      categoryLabel: category ? category.title : row.c,
      group: category ? category.group : 'fashion',
      groupLabel: group ? group.title : '',

      price: row.p,
      oldPrice: row.o || 0,
      discountPercent: discountPercent(row.p, row.o),
      currency: 'NGN',
      unit: row.u || 'per unit',

      rating: row.r || 4.5,
      reviews: row.rc || 0,
      stock: typeof row.s === 'number' ? row.s : 10,
      badge: row.bd || '',
      featured: Boolean(row.ft),
      active: true,

      shortDescription: row.d,
      description: row.d,
      features: row.f || [],
      specs: row.sp || {},

      icon: row.ic || 'generic',
      image,
      preview,
      gallery,

      tags: [
        category ? category.title : '',
        group ? group.title : '',
        brand,
        ...(row.f || []).slice(0, 2)
      ].filter(Boolean),

      searchText: [row.n, brand, category ? category.title : '', group ? group.title : '', row.d]
        .join(' ')
        .toLowerCase(),

      deliveryNote:
        category && category.group === 'gas'
          ? 'Available for pickup at our physical store or same-day delivery within the city.'
          : 'Nationwide delivery available. Free delivery on orders above ₦150,000.'
    };
  });
}

module.exports = { RAW, buildProducts, BRAND_CODES };