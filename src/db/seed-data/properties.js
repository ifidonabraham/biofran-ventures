'use strict';

/**
 * Biofran Properties - property listings seed data.
 *
 * Biofran Properties is the housing-agency arm of Biofran Ventures: sales,
 * rentals, short-lets and land. Enquiries route to the property desk
 * (07045723013 / francisifidon3@gmail.com).
 *
 *   n  title       t  type (property type shown to buyers)
 *   c  city        a  area / neighbourhood
 *   pu purpose     p  price (NGN)          u  /year | /month | one-off
 *   b  bedrooms    ba bathrooms            sz size
 *   ic icon        st status              ft featured
 *   d  description f  features[]
 */

const RAW = [
  {
    n: '4-Bedroom Duplex with BQ', t: 'Duplex', c: 'Benin City', a: 'GRA',
    pu: 'For Sale', p: 78000000, u: 'one-off', b: 4, ba: 4, sz: '320 sqm',
    ic: 'house', st: 'Available', ft: 1,
    d: 'A fully finished 4-bedroom duplex in the heart of GRA with a boys quarters, fitted kitchen and a paved compound large enough for four cars.',
    f: ['All rooms en-suite', 'Boys quarters (BQ)', 'Fitted kitchen with cabinets', 'Paved compound for 4 cars', 'Borehole and overhead tank', 'C of O available']
  },
  {
    n: '3-Bedroom Flat in Lekki Phase 1', t: 'Flat / Apartment', c: 'Lagos', a: 'Lekki Phase 1',
    pu: 'For Rent', p: 6500000, u: 'per year', b: 3, ba: 3, sz: '150 sqm',
    ic: 'building', st: 'Available', ft: 1,
    d: 'A serviced 3-bedroom flat on the third floor with 24-hour power, treated water and a dedicated parking slot in a gated estate.',
    f: ['24-hour power supply', 'Treated water', 'Gated estate with security', 'Fitted kitchen', 'Air conditioning installed', 'Agency and legal fees apply']
  },
  {
    n: '5-Bedroom Detached Mansion', t: 'Detached House', c: 'Abuja', a: 'Maitama',
    pu: 'For Sale', p: 250000000, u: 'one-off', b: 5, ba: 6, sz: '600 sqm',
    ic: 'house', st: 'Available', ft: 1,
    d: 'An expansive detached mansion in Maitama with a swimming pool, two-room BQ and a landscaped garden — a statement property in a prime diplomatic district.',
    f: ['Swimming pool', 'Two-room boys quarters', 'Landscaped garden', 'Double garage', 'Fitted kitchen with pantry', 'Certificate of Occupancy']
  },
  {
    n: '2-Bedroom Block of Flats', t: 'Block of Flats', c: 'Benin City', a: 'Ugbowo',
    pu: 'For Sale', p: 42000000, u: 'one-off', b: 4, ba: 4, sz: '260 sqm',
    ic: 'building', st: 'Available',
    d: 'A two-tenanted block of flats near the university — ideal for investors who want steady rental income from day one. Each flat has its own meter and entrance.',
    f: ['Two flats, two tenants', 'Separate prepaid meters', 'Separate entrances', 'Close to the university', 'Good rental yield', 'Survey plan available']
  },
  {
    n: '3-Bedroom Bungalow', t: 'Bungalow', c: 'Auchi', a: 'Igbira Road',
    pu: 'For Sale', p: 28000000, u: 'one-off', b: 3, ba: 3, sz: '200 sqm',
    ic: 'house', st: 'Available',
    d: 'A neat fully detached bungalow in a quiet residential area with a large backyard suitable for a kitchen garden or future extension.',
    f: ['Fully detached', 'Large backyard', 'Water borehole', 'Tarred access road', 'Fenced with gate', 'Title documents complete']
  },
  {
    n: 'Mini Flat for Rent', t: 'Mini Flat', c: 'Benin City', a: 'Sapele Road',
    pu: 'For Rent', p: 1200000, u: 'per year', b: 1, ba: 1, sz: '65 sqm',
    ic: 'building', st: 'Available',
    d: 'A self-contained mini flat with a private kitchen and toilet — perfect for a single professional or student who wants privacy and low running costs.',
    f: ['Private kitchen', 'Private toilet and bath', 'Prepaid meter', 'Secure compound', 'Close to bus stop', 'Water available']
  },
  {
    n: 'Furnished 2-Bedroom Short-Let Apartment', t: 'Short-Let Apartment', c: 'Abuja', a: 'Wuse 2',
    pu: 'Short Let', p: 85000, u: 'per night', b: 2, ba: 2, sz: '120 sqm',
    ic: 'building', st: 'Available', ft: 1,
    d: 'A fully furnished short-let apartment with unlimited internet, Netflix, a backup inverter and daily housekeeping — book by the night or the week.',
    f: ['Fully furnished', 'Unlimited internet and Netflix', 'Inverter backup power', 'Daily housekeeping', 'Secure parking', 'Minimum 2 nights']
  },
  {
    n: 'Commercial Shop Space for Rent', t: 'Shop / Commercial', c: 'Benin City', a: 'Ring Road',
    pu: 'For Rent', p: 2500000, u: 'per year', b: 0, ba: 1, sz: '45 sqm',
    ic: 'store', st: 'Available', ft: 1,
    d: 'A street-facing shop space on a busy road with high foot traffic — suitable for retail, a mini mart, a pharmacy or a gas accessories outlet.',
    f: ['Street-facing frontage', 'High foot traffic', 'Prepaid meter', 'Toilet included', 'Roller shutter door', 'Signage space included']
  },
  {
    n: '600sqm Residential Land with C of O', t: 'Land', c: 'Benin City', a: 'Ologbo',
    pu: 'For Sale', p: 15000000, u: 'one-off', b: 0, ba: 0, sz: '600 sqm',
    ic: 'land', st: 'Available',
    d: 'A dry, well-drained 600sqm residential plot in a fast-developing layout with a Certificate of Occupancy — ready for immediate development.',
    f: ['Dry and well drained', 'Certificate of Occupancy', 'Survey plan included', 'Tarred access road', 'Fast-developing layout', 'No government acquisition']
  },
  {
    n: 'Furnished 4-Bedroom Serviced Duplex', t: 'Serviced Duplex', c: 'Lagos', a: 'Ikoyi',
    pu: 'For Rent', p: 25000000, u: 'per year', b: 4, ba: 5, sz: '400 sqm',
    ic: 'house', st: 'Available',
    d: 'A serviced duplex in Ikoyi with 24-hour power, a lift, a gym and full facility management — corporate tenants welcome.',
    f: ['Serviced with facility manager', 'Passenger lift', 'Residents gym', '24-hour power and security', 'Two parking slots', 'Corporate lease available']
  }
];

module.exports = { RAW };

/* ========================================================================
 * Expands the compact rows above into full property documents.
 * ===================================================================== */

const { slugify } = require('../../utils');

function buildProperties() {
  const used = new Set();

  return RAW.map((row, index) => {
    let slug = slugify(`${row.b ? row.b + ' bedroom ' : ''}${row.n} ${row.a}`);
    let n = 2;
    while (used.has(slug)) slug = `${slug}-${n++}`;
    used.add(slug);

    const image = `/img/pr/${slug}.svg`;
    const preview = `/img/pr/${slug}.svg?size=1400`;

    return {
      id: `prp_${String(index + 1).padStart(4, '0')}`,
      slug,
      reference: `BFP-${String(index + 1).padStart(4, '0')}`,
      title: row.n,
      type: row.t,
      purpose: row.pu,
      price: row.p,
      priceUnit: row.u,
      status: row.st || 'Available',
      featured: Boolean(row.ft),
      active: true,

      bedrooms: row.b || 0,
      bathrooms: row.ba || 0,
      size: row.sz || '',
      city: row.c,
      area: row.a,
      address: `${row.a}, ${row.c}`,

      description: row.d,
      features: row.f || [],
      documents:
        row.pu === 'For Sale'
          ? ['Survey plan', 'Title documents', 'Site inspection report']
          : ['Tenancy agreement template', 'Agency fee breakdown'],

      icon: row.ic || 'house',
      image,
      preview,
      gallery: [
        { label: 'Exterior', url: image, preview },
        { label: 'Interior', url: `/img/pr/${slug}.svg?v=2`, preview: `/img/pr/${slug}.svg?v=2&size=1400` },
        { label: 'Neighbourhood', url: `/img/pr/${slug}.svg?v=3`, preview: `/img/pr/${slug}.svg?v=3&size=1400` }
      ],

      searchText: [row.n, row.t, row.pu, row.c, row.a, row.d].join(' ').toLowerCase(),
      inspectionNote:
        'Inspection is by appointment only — call the Biofran Properties desk on 07045723013 to book a viewing.'
    };
  });
}

module.exports = { RAW, buildProperties };