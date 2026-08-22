-- ====================================================================
-- APEX REALTY CALLCRM: ENTERPRISE SEED DATA
-- Multi-Tenant sample data with Indian luxury real estate inventory
-- ====================================================================

-- 1. Create Organization (Tenant)
INSERT INTO public.organizations (id, name, slug, plan, max_seats, reactivation_days_threshold, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Apex Luxury Realty Partners', 'apex-realty', 'enterprise', 50, 30, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Regional Hubs
INSERT INTO public.regions (id, org_id, name, state, code)
VALUES
  ('11111111-1111-1111-1111-111111110001', '00000000-0000-0000-0000-000000000001', 'Gurgaon Luxury Belt', 'Haryana', 'GUR'),
  ('11111111-1111-1111-1111-111111110002', '00000000-0000-0000-0000-000000000001', 'South Delhi Estates', 'Delhi', 'DEL'),
  ('11111111-1111-1111-1111-111111110003', '00000000-0000-0000-0000-000000000001', 'Mumbai Coastal & Bandra', 'Maharashtra', 'MUM'),
  ('11111111-1111-1111-1111-111111110004', '00000000-0000-0000-0000-000000000001', 'Noida Expressway Hub', 'Uttar Pradesh', 'NOI')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Pipeline Stages
INSERT INTO public.pipeline_stages (id, org_id, name, slug, sort_order, is_system, color_hex)
VALUES
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'New Inbound', 'new', 1, true, '#6366f1'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Contacted', 'contacted', 2, true, '#0ea5e9'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Qualified & Budget Fit', 'qualified', 3, true, '#8b5cf6'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Site Visit Done', 'site_visit', 4, true, '#f59e0b'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Price Negotiation', 'negotiation', 5, true, '#ec4899'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Booking Won', 'won', 6, true, '#10b981'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Lost Opportunity', 'lost', 7, true, '#64748b')
ON CONFLICT DO NOTHING;

-- 4. Create Luxury Real Estate Projects
INSERT INTO public.projects (id, org_id, region_id, name, developer_name, location, price_min, price_max, price_range_label, total_units, status, description)
VALUES
  ('33333333-3333-3333-3333-333333330001', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111110001', 'DLF The Camellias', 'DLF Luxury', 'Golf Course Road, Sector 42, Gurgaon', 180000000, 450000000, '₹18.0 Cr – ₹45.0 Cr', 429, 'active', 'Ultra-luxury condominiums overlooking the DLF Golf and Country Club.'),
  ('33333333-3333-3333-3333-333333330002', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111110001', 'Godrej Aristocrat', 'Godrej Properties', 'Sector 49, Golf Course Ext Road, Gurgaon', 42000000, 85000000, '₹4.20 Cr – ₹8.50 Cr', 580, 'active', 'Forest themed luxury residences with Olympic-length swimming pool.'),
  ('33333333-3333-3333-3333-333333330003', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111110003', 'Lodha World Towers', 'Lodha Luxury', 'Lower Parel, South Mumbai', 125000000, 320000000, '₹12.5 Cr – ₹32.0 Cr', 290, 'active', 'Iconic curved skyscraper sculpture with private elevators and sea-link views.'),
  ('33333333-3333-3333-3333-333333330004', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111110002', 'The Amaryllis', 'Unity Group', 'Karol Bagh / Central Delhi', 35000000, 95000000, '₹3.50 Cr – ₹9.50 Cr', 650, 'active', 'Central Delhi high-rise development with 1 km skywalk on 20th floor.')
ON CONFLICT (id) DO NOTHING;

-- 5. Create Inventory Units (Matrix)
INSERT INTO public.project_units (id, org_id, project_id, tower, unit_number, floor, configuration, super_area_sqft, price, status, facing)
VALUES
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330001', 'Tower 3', '302', 12, '4 BHK Penthouse', 7400, 245000000, 'available', 'Golf Course Facing (North-East)'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330001', 'Tower 1', '104', 18, '5 BHK Grand Presidential', 9500, 380000000, 'available', 'Clubhouse & Skyline (East)'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330002', 'Tower Forest B', 'B-1402', 14, '3 BHK + Servant', 2650, 48500000, 'available', 'Central Forest Greens (North)'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330002', 'Tower Forest A', 'A-0801', 8, '4 BHK Luxury Deck', 3800, 72000000, 'available', 'Park & Water Body (East)'),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333330003', 'Tower One', 'T1-4201', 42, '4 BHK Sea View', 4200, 165000000, 'available', 'Arabian Sea Panoramic (West)')
ON CONFLICT DO NOTHING;

-- 6. Create Deduped Master Contacts (People)
INSERT INTO public.people (id, org_id, name, phone, phone_normalized, email, city, source)
VALUES
  ('44444444-4444-4444-4444-444444440001', '00000000-0000-0000-0000-000000000001', 'Vikramaditya Singhania', '+91 98101 23456', '+919810123456', 'vikram.singhania@singhaniagroup.com', 'Gurgaon', 'Private Wealth Advisory'),
  ('44444444-4444-4444-4444-444444440002', '00000000-0000-0000-0000-000000000001', 'Dr. Meenakshi Sundaram', '+91 98200 87654', '+919820087654', 'dr.meenakshi@apollohospitals.org', 'South Delhi', 'Website Inbound'),
  ('44444444-4444-4444-4444-444444440003', '00000000-0000-0000-0000-000000000001', 'Harshvardhan Goenka', '+91 99300 11223', '+919930011223', 'h.goenka@goenkaenterprises.in', 'Mumbai', 'WhatsApp Inbound Bot')
ON CONFLICT (org_id, phone_normalized) DO NOTHING;

-- 7. Create Active Leads
INSERT INTO public.leads (id, org_id, person_id, project_id, stage, budget, property_type, configuration_preference, timeline, source, status, lead_score, lead_score_label, deal_health, deal_health_reason, suggested_next_move)
VALUES
  (
    '55555555-5555-5555-5555-555555550001',
    '00000000-0000-0000-0000-000000000001',
    '44444444-4444-4444-4444-444444440001',
    '33333333-3333-3333-3333-333333330001',
    'negotiation',
    250000000,
    'Luxury Condominium',
    '4 BHK Penthouse',
    'Immediate (Within 30 Days)',
    'Private Wealth Advisory',
    'open',
    96,
    'Hot',
    'strong',
    'Second site visit completed with spouse. High buy intent.',
    'Present final payment milestone breakdown and lock unit.'
  ),
  (
    '55555555-5555-5555-5555-555555550002',
    '00000000-0000-0000-0000-000000000001',
    '44444444-4444-4444-4444-444444440002',
    '33333333-3333-3333-3333-333333330002',
    'qualified',
    55000000,
    'Forest Residences',
    '3 BHK + Servant',
    'Within 60 Days',
    'Website Inbound',
    'open',
    88,
    'Hot',
    'strong',
    'Aria Bot qualified budget and configuration match.',
    'Schedule physical site walk on Saturday at 11:30 AM.'
  )
ON CONFLICT (id) DO NOTHING;
