-- Agent 10 (Search, Discovery & Recommendation hooks): denormalized search documents,
-- user search state, recently viewed products, popular query terms, and discovery indexes.

create extension if not exists pg_trgm;

create table if not exists public.product_search_documents (
  product_id uuid primary key,
  seller_id uuid,
  category_id uuid,
  brand_id uuid,
  name text,
  description text,
  brand_name text,
  category_name text,
  seller_store_name text,
  sku_values text[],
  tags text[],
  colors text[],
  sizes text[],
  materials text[],
  condition text default 'new',
  currency text default 'KES',
  base_price_minor integer default 0,
  compare_at_price_minor integer,
  rating numeric(3,2) default 0,
  review_count integer default 0,
  sold_count integer default 0,
  view_count integer default 0,
  seller_verified boolean default false,
  in_stock boolean default false,
  is_featured boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  search_vector tsvector
);

alter table public.product_search_documents add column if not exists product_id uuid;
alter table public.product_search_documents add column if not exists seller_id uuid;
alter table public.product_search_documents add column if not exists category_id uuid;
alter table public.product_search_documents add column if not exists brand_id uuid;
alter table public.product_search_documents add column if not exists name text;
alter table public.product_search_documents add column if not exists description text;
alter table public.product_search_documents add column if not exists brand_name text;
alter table public.product_search_documents add column if not exists category_name text;
alter table public.product_search_documents add column if not exists seller_store_name text;
alter table public.product_search_documents add column if not exists sku_values text[];
alter table public.product_search_documents add column if not exists tags text[];
alter table public.product_search_documents add column if not exists colors text[];
alter table public.product_search_documents add column if not exists sizes text[];
alter table public.product_search_documents add column if not exists materials text[];
alter table public.product_search_documents add column if not exists condition text default 'new';
alter table public.product_search_documents add column if not exists currency text default 'KES';
alter table public.product_search_documents add column if not exists base_price_minor integer default 0;
alter table public.product_search_documents add column if not exists compare_at_price_minor integer;
alter table public.product_search_documents add column if not exists rating numeric(3,2) default 0;
alter table public.product_search_documents add column if not exists review_count integer default 0;
alter table public.product_search_documents add column if not exists sold_count integer default 0;
alter table public.product_search_documents add column if not exists view_count integer default 0;
alter table public.product_search_documents add column if not exists seller_verified boolean default false;
alter table public.product_search_documents add column if not exists in_stock boolean default false;
alter table public.product_search_documents add column if not exists is_featured boolean default false;
alter table public.product_search_documents add column if not exists published_at timestamptz;
alter table public.product_search_documents add column if not exists created_at timestamptz default now();
alter table public.product_search_documents add column if not exists updated_at timestamptz default now();
alter table public.product_search_documents add column if not exists search_vector tsvector;

create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  query text,
  filters jsonb default '{}'::jsonb,
  result_count integer default 0,
  created_at timestamptz default now()
);

alter table public.search_history add column if not exists user_id uuid;
alter table public.search_history add column if not exists query text;
alter table public.search_history add column if not exists filters jsonb default '{}'::jsonb;
alter table public.search_history add column if not exists result_count integer default 0;
alter table public.search_history add column if not exists created_at timestamptz default now();

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  query text default '',
  filters jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.saved_searches add column if not exists user_id uuid;
alter table public.saved_searches add column if not exists name text;
alter table public.saved_searches add column if not exists query text default '';
alter table public.saved_searches add column if not exists filters jsonb default '{}'::jsonb;
alter table public.saved_searches add column if not exists created_at timestamptz default now();
alter table public.saved_searches add column if not exists updated_at timestamptz default now();

create table if not exists public.recently_viewed_products (
  user_id uuid,
  product_id uuid,
  viewed_at timestamptz default now(),
  primary key (user_id, product_id)
);

alter table public.recently_viewed_products add column if not exists user_id uuid;
alter table public.recently_viewed_products add column if not exists product_id uuid;
alter table public.recently_viewed_products add column if not exists viewed_at timestamptz default now();

create table if not exists public.popular_search_terms (
  normalized_query text primary key,
  display_query text,
  search_count integer default 0,
  last_searched_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.popular_search_terms add column if not exists normalized_query text;
alter table public.popular_search_terms add column if not exists display_query text;
alter table public.popular_search_terms add column if not exists search_count integer default 0;
alter table public.popular_search_terms add column if not exists last_searched_at timestamptz default now();
alter table public.popular_search_terms add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'product_search_documents_condition_allowed') then
    alter table public.product_search_documents add constraint product_search_documents_condition_allowed check (condition in ('new', 'like_new', 'pre_owned', 'refurbished'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_search_documents_price_nonnegative') then
    alter table public.product_search_documents add constraint product_search_documents_price_nonnegative check (base_price_minor >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'search_history_result_count_nonnegative') then
    alter table public.search_history add constraint search_history_result_count_nonnegative check (result_count >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'popular_search_terms_count_nonnegative') then
    alter table public.popular_search_terms add constraint popular_search_terms_count_nonnegative check (search_count >= 0);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'product_search_documents_product_fk') then
    alter table public.product_search_documents add constraint product_search_documents_product_fk foreign key (product_id) references public.products(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'search_history_user_fk') then
    alter table public.search_history add constraint search_history_user_fk foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'saved_searches_user_fk') then
    alter table public.saved_searches add constraint saved_searches_user_fk foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'recently_viewed_user_fk') then
    alter table public.recently_viewed_products add constraint recently_viewed_user_fk foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'recently_viewed_product_fk') then
    alter table public.recently_viewed_products add constraint recently_viewed_product_fk foreign key (product_id) references public.products(id) on delete cascade;
  end if;
end $$;

create or replace function public.refresh_product_search_document(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.product_search_documents (
    product_id, seller_id, category_id, brand_id, name, description, brand_name, category_name,
    seller_store_name, sku_values, tags, colors, sizes, materials, condition, currency,
    base_price_minor, compare_at_price_minor, rating, review_count, seller_verified, in_stock,
    is_featured, published_at, created_at, updated_at, search_vector
  )
  select
    p.id,
    p.seller_id,
    p.category_id,
    p.brand_id,
    p.name,
    p.description,
    b.name,
    c.name,
    s.store_name,
    coalesce(array_agg(distinct pv.sku) filter (where pv.sku is not null), '{}'::text[]),
    coalesce(array_agg(distinct pa.value) filter (where lower(pa.name) in ('tag', 'tags')), '{}'::text[]),
    coalesce(array_agg(distinct pv.options->>'color') filter (where pv.options ? 'color'), '{}'::text[]),
    coalesce(array_agg(distinct pv.options->>'size') filter (where pv.options ? 'size'), '{}'::text[]),
    coalesce(array_agg(distinct pv.options->>'material') filter (where pv.options ? 'material'), '{}'::text[]),
    coalesce(p.metadata->>'condition', 'new'),
    p.currency,
    p.base_price_minor,
    p.compare_at_price_minor,
    coalesce(rs.average_rating, 0),
    coalesce(rs.total_reviews, 0),
    s.status = 'active' and s.kyc_status = 'approved',
    coalesce(bool_or(ii.track_inventory = false or ii.quantity_available > ii.quantity_reserved), false),
    p.is_featured,
    p.published_at,
    p.created_at,
    now(),
    setweight(to_tsvector('simple', coalesce(p.name, '')), 'A') ||
      setweight(to_tsvector('simple', coalesce(b.name, '')), 'B') ||
      setweight(to_tsvector('simple', coalesce(c.name, '')), 'B') ||
      setweight(to_tsvector('simple', coalesce(s.store_name, '')), 'B') ||
      setweight(to_tsvector('simple', coalesce(p.description, '')), 'C')
  from public.products p
  left join public.sellers s on s.id = p.seller_id
  left join public.brands b on b.id = p.brand_id
  left join public.categories c on c.id = p.category_id
  left join public.product_variants pv on pv.product_id = p.id and pv.is_active = true
  left join public.product_attributes pa on pa.product_id = p.id
  left join public.inventory_items ii on ii.product_id = p.id
  left join public.rating_summaries rs on rs.entity_type = 'product' and rs.entity_id = p.id
  where p.id = p_product_id and p.status = 'active' and p.deleted_at is null
  group by p.id, b.name, c.name, s.store_name, s.status, s.kyc_status, rs.average_rating, rs.total_reviews
  on conflict (product_id) do update set
    seller_id = excluded.seller_id,
    category_id = excluded.category_id,
    brand_id = excluded.brand_id,
    name = excluded.name,
    description = excluded.description,
    brand_name = excluded.brand_name,
    category_name = excluded.category_name,
    seller_store_name = excluded.seller_store_name,
    sku_values = excluded.sku_values,
    tags = excluded.tags,
    colors = excluded.colors,
    sizes = excluded.sizes,
    materials = excluded.materials,
    condition = excluded.condition,
    currency = excluded.currency,
    base_price_minor = excluded.base_price_minor,
    compare_at_price_minor = excluded.compare_at_price_minor,
    rating = excluded.rating,
    review_count = excluded.review_count,
    seller_verified = excluded.seller_verified,
    in_stock = excluded.in_stock,
    is_featured = excluded.is_featured,
    published_at = excluded.published_at,
    updated_at = now(),
    search_vector = excluded.search_vector;

  if not found then
    delete from public.product_search_documents where product_id = p_product_id;
  end if;
end;
$$;

create or replace function public.sync_product_search_document()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_product_search_document(coalesce(new.id, old.id));
  return coalesce(new, old);
end;
$$;

create or replace function public.record_popular_search_term()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.query is not null and length(trim(new.query)) > 0 then
    insert into public.popular_search_terms (normalized_query, display_query, search_count, last_searched_at, updated_at)
    values (lower(trim(new.query)), trim(new.query), 1, now(), now())
    on conflict (normalized_query) do update set
      display_query = excluded.display_query,
      search_count = public.popular_search_terms.search_count + 1,
      last_searched_at = now(),
      updated_at = now();
  end if;
  return new;
end;
$$;

do $$
begin
  create index if not exists idx_product_search_documents_fts on public.product_search_documents using gin(search_vector);
  create index if not exists idx_product_search_documents_name_trgm on public.product_search_documents using gin(name gin_trgm_ops);
  create index if not exists idx_product_search_documents_filters on public.product_search_documents(category_id, brand_id, seller_id, base_price_minor);
  create index if not exists idx_product_search_documents_rating on public.product_search_documents(rating desc, review_count desc);
  create index if not exists idx_product_search_documents_newest on public.product_search_documents(published_at desc, product_id);
  create index if not exists idx_search_history_user_created on public.search_history(user_id, created_at desc, id);
  create index if not exists idx_saved_searches_user_updated on public.saved_searches(user_id, updated_at desc, id);
  create index if not exists idx_recently_viewed_user_viewed on public.recently_viewed_products(user_id, viewed_at desc);
  create index if not exists idx_popular_search_terms_count on public.popular_search_terms(search_count desc, last_searched_at desc);
end $$;

drop trigger if exists set_saved_searches_updated_at on public.saved_searches;
create trigger set_saved_searches_updated_at before update on public.saved_searches
  for each row execute function public.set_updated_at();

drop trigger if exists sync_product_search_document on public.products;
create trigger sync_product_search_document after insert or update or delete on public.products
  for each row execute function public.sync_product_search_document();

drop trigger if exists record_popular_search_term on public.search_history;
create trigger record_popular_search_term after insert on public.search_history
  for each row execute function public.record_popular_search_term();

insert into public.product_search_documents (product_id)
select p.id
from public.products p
where p.status = 'active' and p.deleted_at is null
on conflict (product_id) do nothing;

do $$
declare
  r record;
begin
  for r in select product_id from public.product_search_documents loop
    perform public.refresh_product_search_document(r.product_id);
  end loop;
end $$;

create or replace view public.search_product_catalog as
select
  psd.*,
  (psd.compare_at_price_minor is not null and psd.compare_at_price_minor > psd.base_price_minor) as is_discounted
from public.product_search_documents psd;

alter table public.product_search_documents enable row level security;
alter table public.search_history enable row level security;
alter table public.saved_searches enable row level security;
alter table public.recently_viewed_products enable row level security;
alter table public.popular_search_terms enable row level security;

drop policy if exists "everyone reads product search documents" on public.product_search_documents;
create policy "everyone reads product search documents" on public.product_search_documents
  for select using (true);

drop policy if exists "users manage own search history" on public.search_history;
create policy "users manage own search history" on public.search_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users manage own saved searches" on public.saved_searches;
create policy "users manage own saved searches" on public.saved_searches
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users manage own recently viewed products" on public.recently_viewed_products;
create policy "users manage own recently viewed products" on public.recently_viewed_products
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "everyone reads popular search terms" on public.popular_search_terms;
create policy "everyone reads popular search terms" on public.popular_search_terms
  for select using (true);

comment on table public.product_search_documents is 'Denormalized product search document table for full-text search, filters, sorting, and discovery rails.';
comment on table public.search_history is 'Per-user search history. Users can view, delete one entry, or clear all of their own records.';
comment on table public.saved_searches is 'Per-user saved search definitions that can be renamed, deleted, and rerun.';
comment on table public.recently_viewed_products is 'Per-user recently viewed products used by discovery and recommendation hooks.';
comment on table public.popular_search_terms is 'Aggregated query terms for autocomplete and popular-search discovery.';
