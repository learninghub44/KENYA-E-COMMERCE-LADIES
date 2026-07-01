-- Minimal development seed data. This file is safe to run repeatedly.
-- It intentionally avoids auth.users-owned rows; Agent 2 will own auth user setup.

insert into public.countries (code, name, default_currency, is_active)
values
  ('KE', 'Kenya', 'KES', true),
  ('UG', 'Uganda', 'UGX', true),
  ('TZ', 'Tanzania', 'TZS', true),
  ('RW', 'Rwanda', 'RWF', true)
on conflict (code) do update
  set name = excluded.name,
      default_currency = excluded.default_currency,
      is_active = excluded.is_active;

insert into public.categories (id, parent_id, name, slug, description, sort_order, is_active)
values
  ('10000000-0000-4000-8000-000000000001', null, 'Fashion', 'fashion', 'Clothing, shoes, and accessories.', 10, true),
  ('10000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Dresses', 'dresses', 'Casual, formal, and occasion dresses.', 20, true),
  ('10000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'Shoes', 'shoes', 'Footwear for everyday and occasion wear.', 30, true),
  ('10000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'Accessories', 'accessories', 'Bags, jewelry, scarves, and styling pieces.', 40, true),
  ('10000000-0000-4000-8000-000000000005', null, 'Beauty', 'beauty', 'Beauty, wellness, and personal care.', 50, true)
on conflict (id) do update
  set parent_id = excluded.parent_id,
      name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active;

insert into public.brands (id, name, slug, description, is_verified)
values
  ('20000000-0000-4000-8000-000000000001', 'Local Label', 'local-label', 'Placeholder verified local brand for development.', true),
  ('20000000-0000-4000-8000-000000000002', 'Marketplace Basics', 'marketplace-basics', 'Internal sample brand for catalog testing.', false)
on conflict (id) do update
  set name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      is_verified = excluded.is_verified;

insert into public.feature_flags (key, description, is_enabled, audience)
values
  ('seller_onboarding', 'Enable seller onboarding entry points.', true, '{"countries":["KE"]}'::jsonb),
  ('catalog_search', 'Enable product catalog search surfaces.', true, '{}'::jsonb),
  ('buyer_seller_messaging', 'Enable buyer-seller conversation entry points.', false, '{}'::jsonb)
on conflict (key) do update
  set description = excluded.description,
      is_enabled = excluded.is_enabled,
      audience = excluded.audience;

insert into public.cms_pages (id, title, slug, body, status, published_at)
values
  ('30000000-0000-4000-8000-000000000001', 'About', 'about', 'Development placeholder for the About page.', 'published', now()),
  ('30000000-0000-4000-8000-000000000002', 'Privacy Policy', 'privacy-policy', 'Development placeholder for the Privacy Policy.', 'draft', null),
  ('30000000-0000-4000-8000-000000000003', 'Terms of Service', 'terms-of-service', 'Development placeholder for the Terms of Service.', 'draft', null)
on conflict (id) do update
  set title = excluded.title,
      slug = excluded.slug,
      body = excluded.body,
      status = excluded.status,
      published_at = excluded.published_at;

insert into public.faqs (id, question, answer, status, sort_order)
values
  ('40000000-0000-4000-8000-000000000001', 'How do I become a seller?', 'Create an account and complete seller onboarding once authentication is available.', 'published', 10),
  ('40000000-0000-4000-8000-000000000002', 'How are sellers verified?', 'Sellers complete a KYC workflow before full marketplace access.', 'published', 20)
on conflict (id) do update
  set question = excluded.question,
      answer = excluded.answer,
      status = excluded.status,
      sort_order = excluded.sort_order;

insert into public.banners (id, title, image_url, link_url, placement, status, sort_order)
values
  ('50000000-0000-4000-8000-000000000001', 'Welcome Promotion', 'https://example.invalid/assets/welcome-promotion.webp', null, 'home.hero', 'draft', 10)
on conflict (id) do update
  set title = excluded.title,
      image_url = excluded.image_url,
      link_url = excluded.link_url,
      placement = excluded.placement,
      status = excluded.status,
      sort_order = excluded.sort_order;
