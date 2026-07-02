-- Agent 09 (Reviews, Ratings & Trust): verified purchase reviews, seller feedback,
-- helpful votes, review reports, media records, moderation hooks, and cached rating summaries.

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid,
  seller_id uuid,
  buyer_id uuid,
  order_id uuid,
  order_item_id uuid,
  rating integer,
  title text,
  body text,
  status text default 'published',
  is_verified_purchase boolean default true,
  helpful_count integer default 0,
  report_count integer default 0,
  published_at timestamptz,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.product_reviews add column if not exists product_id uuid;
alter table public.product_reviews add column if not exists seller_id uuid;
alter table public.product_reviews add column if not exists buyer_id uuid;
alter table public.product_reviews add column if not exists order_id uuid;
alter table public.product_reviews add column if not exists order_item_id uuid;
alter table public.product_reviews add column if not exists rating integer;
alter table public.product_reviews add column if not exists title text;
alter table public.product_reviews add column if not exists body text;
alter table public.product_reviews add column if not exists status text default 'published';
alter table public.product_reviews add column if not exists is_verified_purchase boolean default true;
alter table public.product_reviews add column if not exists helpful_count integer default 0;
alter table public.product_reviews add column if not exists report_count integer default 0;
alter table public.product_reviews add column if not exists published_at timestamptz;
alter table public.product_reviews add column if not exists edited_at timestamptz;
alter table public.product_reviews add column if not exists deleted_at timestamptz;
alter table public.product_reviews add column if not exists created_at timestamptz default now();
alter table public.product_reviews add column if not exists updated_at timestamptz default now();

create table if not exists public.seller_reviews (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid,
  buyer_id uuid,
  order_id uuid,
  overall_rating integer,
  communication_rating integer,
  shipping_rating integer,
  packaging_rating integer,
  feedback text,
  status text default 'published',
  helpful_count integer default 0,
  report_count integer default 0,
  published_at timestamptz,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.seller_reviews add column if not exists seller_id uuid;
alter table public.seller_reviews add column if not exists buyer_id uuid;
alter table public.seller_reviews add column if not exists order_id uuid;
alter table public.seller_reviews add column if not exists overall_rating integer;
alter table public.seller_reviews add column if not exists communication_rating integer;
alter table public.seller_reviews add column if not exists shipping_rating integer;
alter table public.seller_reviews add column if not exists packaging_rating integer;
alter table public.seller_reviews add column if not exists feedback text;
alter table public.seller_reviews add column if not exists status text default 'published';
alter table public.seller_reviews add column if not exists helpful_count integer default 0;
alter table public.seller_reviews add column if not exists report_count integer default 0;
alter table public.seller_reviews add column if not exists published_at timestamptz;
alter table public.seller_reviews add column if not exists edited_at timestamptz;
alter table public.seller_reviews add column if not exists deleted_at timestamptz;
alter table public.seller_reviews add column if not exists created_at timestamptz default now();
alter table public.seller_reviews add column if not exists updated_at timestamptz default now();

create table if not exists public.review_media (
  id uuid primary key default gen_random_uuid(),
  review_id uuid,
  public_id text,
  secure_url text,
  mime_type text,
  bytes integer,
  width integer,
  height integer,
  position integer default 0,
  alt_text text,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

alter table public.review_media add column if not exists review_id uuid;
alter table public.review_media add column if not exists public_id text;
alter table public.review_media add column if not exists secure_url text;
alter table public.review_media add column if not exists mime_type text;
alter table public.review_media add column if not exists bytes integer;
alter table public.review_media add column if not exists width integer;
alter table public.review_media add column if not exists height integer;
alter table public.review_media add column if not exists position integer default 0;
alter table public.review_media add column if not exists alt_text text;
alter table public.review_media add column if not exists deleted_at timestamptz;
alter table public.review_media add column if not exists created_at timestamptz default now();

create table if not exists public.review_helpful_votes (
  id uuid primary key default gen_random_uuid(),
  review_type text,
  review_id uuid,
  user_id uuid,
  created_at timestamptz default now()
);

alter table public.review_helpful_votes add column if not exists review_type text;
alter table public.review_helpful_votes add column if not exists review_id uuid;
alter table public.review_helpful_votes add column if not exists user_id uuid;
alter table public.review_helpful_votes add column if not exists created_at timestamptz default now();

create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_type text,
  review_id uuid,
  reporter_id uuid,
  reason text,
  description text,
  status text default 'open',
  created_at timestamptz default now(),
  resolved_at timestamptz
);

alter table public.review_reports add column if not exists review_type text;
alter table public.review_reports add column if not exists review_id uuid;
alter table public.review_reports add column if not exists reporter_id uuid;
alter table public.review_reports add column if not exists reason text;
alter table public.review_reports add column if not exists description text;
alter table public.review_reports add column if not exists status text default 'open';
alter table public.review_reports add column if not exists created_at timestamptz default now();
alter table public.review_reports add column if not exists resolved_at timestamptz;

create table if not exists public.rating_summaries (
  entity_type text,
  entity_id uuid,
  average_rating numeric(3,2) default 0,
  total_reviews integer default 0,
  verified_reviews integer default 0,
  rating_distribution jsonb default '{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb,
  score numeric(6,4) default 0,
  updated_at timestamptz default now(),
  primary key (entity_type, entity_id)
);

alter table public.rating_summaries add column if not exists entity_type text;
alter table public.rating_summaries add column if not exists entity_id uuid;
alter table public.rating_summaries add column if not exists average_rating numeric(3,2) default 0;
alter table public.rating_summaries add column if not exists total_reviews integer default 0;
alter table public.rating_summaries add column if not exists verified_reviews integer default 0;
alter table public.rating_summaries add column if not exists rating_distribution jsonb default '{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb;
alter table public.rating_summaries add column if not exists score numeric(6,4) default 0;
alter table public.rating_summaries add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'product_reviews_rating_range') then
    alter table public.product_reviews add constraint product_reviews_rating_range check (rating between 1 and 5);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_reviews_status_allowed') then
    alter table public.product_reviews add constraint product_reviews_status_allowed check (status in ('pending', 'published', 'hidden', 'removed'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_reviews_counts_nonnegative') then
    alter table public.product_reviews add constraint product_reviews_counts_nonnegative check (helpful_count >= 0 and report_count >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seller_reviews_rating_range') then
    alter table public.seller_reviews add constraint seller_reviews_rating_range check (
      overall_rating between 1 and 5 and communication_rating between 1 and 5 and shipping_rating between 1 and 5 and packaging_rating between 1 and 5
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seller_reviews_status_allowed') then
    alter table public.seller_reviews add constraint seller_reviews_status_allowed check (status in ('pending', 'published', 'hidden', 'removed'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'review_media_image_allowed') then
    alter table public.review_media add constraint review_media_image_allowed check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif') and bytes > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'review_votes_type_allowed') then
    alter table public.review_helpful_votes add constraint review_votes_type_allowed check (review_type in ('product', 'seller'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'review_reports_reason_allowed') then
    alter table public.review_reports add constraint review_reports_reason_allowed check (reason in ('spam', 'offensive_content', 'abuse', 'fake_review', 'copyright', 'other'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'rating_summaries_type_allowed') then
    alter table public.rating_summaries add constraint rating_summaries_type_allowed check (entity_type in ('product', 'seller'));
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'product_reviews_product_fk') then
    alter table public.product_reviews add constraint product_reviews_product_fk foreign key (product_id) references public.products(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_reviews_seller_fk') then
    alter table public.product_reviews add constraint product_reviews_seller_fk foreign key (seller_id) references public.sellers(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_reviews_buyer_fk') then
    alter table public.product_reviews add constraint product_reviews_buyer_fk foreign key (buyer_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_reviews_order_fk') then
    alter table public.product_reviews add constraint product_reviews_order_fk foreign key (order_id) references public.orders(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'product_reviews_order_item_fk') then
    alter table public.product_reviews add constraint product_reviews_order_item_fk foreign key (order_item_id) references public.order_items(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seller_reviews_seller_fk') then
    alter table public.seller_reviews add constraint seller_reviews_seller_fk foreign key (seller_id) references public.sellers(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seller_reviews_buyer_fk') then
    alter table public.seller_reviews add constraint seller_reviews_buyer_fk foreign key (buyer_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'seller_reviews_order_fk') then
    alter table public.seller_reviews add constraint seller_reviews_order_fk foreign key (order_id) references public.orders(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'review_media_product_review_fk') then
    alter table public.review_media add constraint review_media_product_review_fk foreign key (review_id) references public.product_reviews(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'review_votes_user_fk') then
    alter table public.review_helpful_votes add constraint review_votes_user_fk foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'review_reports_reporter_fk') then
    alter table public.review_reports add constraint review_reports_reporter_fk foreign key (reporter_id) references public.profiles(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'product_reviews' and column_name = 'product_id') then
    create index if not exists idx_product_reviews_product_created on public.product_reviews(product_id, created_at desc, id) where deleted_at is null;
    create index if not exists idx_product_reviews_product_rating on public.product_reviews(product_id, rating, created_at desc) where status = 'published' and deleted_at is null;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'product_reviews' and column_name = 'order_item_id') then
    create unique index if not exists idx_product_reviews_order_item_unique on public.product_reviews(order_item_id) where deleted_at is null;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'seller_reviews' and column_name = 'seller_id') then
    create index if not exists idx_seller_reviews_seller_created on public.seller_reviews(seller_id, created_at desc, id) where deleted_at is null;
    create unique index if not exists idx_seller_reviews_order_seller_unique on public.seller_reviews(order_id, seller_id, buyer_id) where deleted_at is null;
  end if;
  create unique index if not exists idx_review_helpful_unique on public.review_helpful_votes(review_type, review_id, user_id);
  create index if not exists idx_review_reports_review on public.review_reports(review_type, review_id, created_at desc);
  create index if not exists idx_rating_summaries_entity_score on public.rating_summaries(entity_type, score desc, total_reviews desc);
  create index if not exists idx_review_media_review_position on public.review_media(review_id, position) where deleted_at is null;
end $$;

create or replace function public.recompute_rating_summary(p_entity_type text, p_entity_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_average numeric(3,2);
  v_total integer;
  v_verified integer;
  v_distribution jsonb;
  v_score numeric(6,4);
begin
  if p_entity_type = 'product' then
    select
      coalesce(round(avg(rating)::numeric, 2), 0),
      count(*)::integer,
      count(*) filter (where is_verified_purchase)::integer,
      jsonb_build_object(
        '1', count(*) filter (where rating = 1),
        '2', count(*) filter (where rating = 2),
        '3', count(*) filter (where rating = 3),
        '4', count(*) filter (where rating = 4),
        '5', count(*) filter (where rating = 5)
      )
    into v_average, v_total, v_verified, v_distribution
    from public.product_reviews
    where product_id = p_entity_id and status = 'published' and deleted_at is null;
  elsif p_entity_type = 'seller' then
    select
      coalesce(round(avg(overall_rating)::numeric, 2), 0),
      count(*)::integer,
      count(*)::integer,
      jsonb_build_object(
        '1', count(*) filter (where overall_rating = 1),
        '2', count(*) filter (where overall_rating = 2),
        '3', count(*) filter (where overall_rating = 3),
        '4', count(*) filter (where overall_rating = 4),
        '5', count(*) filter (where overall_rating = 5)
      )
    into v_average, v_total, v_verified, v_distribution
    from public.seller_reviews
    where seller_id = p_entity_id and status = 'published' and deleted_at is null;
  else
    return;
  end if;

  v_score := case when v_total = 0 then 0 else round(((v_average / 5.0) * (1 - (1.0 / sqrt(v_total + 1))))::numeric, 4) end;

  insert into public.rating_summaries (entity_type, entity_id, average_rating, total_reviews, verified_reviews, rating_distribution, score, updated_at)
  values (p_entity_type, p_entity_id, v_average, v_total, v_verified, v_distribution, v_score, now())
  on conflict (entity_type, entity_id) do update set
    average_rating = excluded.average_rating,
    total_reviews = excluded.total_reviews,
    verified_reviews = excluded.verified_reviews,
    rating_distribution = excluded.rating_distribution,
    score = excluded.score,
    updated_at = now();
end;
$$;

create or replace function public.sync_product_review_rating_summary()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.product_id is not null then
    perform public.recompute_rating_summary('product', old.product_id);
    perform public.recompute_rating_summary('seller', old.seller_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.product_id is not null then
    perform public.recompute_rating_summary('product', new.product_id);
    perform public.recompute_rating_summary('seller', new.seller_id);
  end if;
  return coalesce(new, old);
end;
$$;

create or replace function public.sync_seller_review_rating_summary()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.seller_id is not null then
    perform public.recompute_rating_summary('seller', old.seller_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.seller_id is not null then
    perform public.recompute_rating_summary('seller', new.seller_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists set_product_reviews_updated_at on public.product_reviews;
create trigger set_product_reviews_updated_at before update on public.product_reviews
  for each row execute function public.set_updated_at();

drop trigger if exists set_seller_reviews_updated_at on public.seller_reviews;
create trigger set_seller_reviews_updated_at before update on public.seller_reviews
  for each row execute function public.set_updated_at();

drop trigger if exists sync_product_review_rating_summary on public.product_reviews;
create trigger sync_product_review_rating_summary after insert or update or delete on public.product_reviews
  for each row execute function public.sync_product_review_rating_summary();

drop trigger if exists sync_seller_review_rating_summary on public.seller_reviews;
create trigger sync_seller_review_rating_summary after insert or update or delete on public.seller_reviews
  for each row execute function public.sync_seller_review_rating_summary();

create or replace view public.published_product_reviews as
select pr.*, coalesce(rs.average_rating, 0) as product_average_rating
from public.product_reviews pr
left join public.rating_summaries rs on rs.entity_type = 'product' and rs.entity_id = pr.product_id
where pr.status = 'published' and pr.deleted_at is null;

create or replace view public.published_seller_reviews as
select sr.*, coalesce(rs.average_rating, 0) as seller_average_rating
from public.seller_reviews sr
left join public.rating_summaries rs on rs.entity_type = 'seller' and rs.entity_id = sr.seller_id
where sr.status = 'published' and sr.deleted_at is null;

alter table public.product_reviews enable row level security;
alter table public.seller_reviews enable row level security;
alter table public.review_media enable row level security;
alter table public.review_helpful_votes enable row level security;
alter table public.review_reports enable row level security;
alter table public.rating_summaries enable row level security;

drop policy if exists "published product reviews public read" on public.product_reviews;
create policy "published product reviews public read" on public.product_reviews
  for select using (status = 'published' and deleted_at is null or buyer_id = auth.uid() or public.current_user_is_staff());

drop policy if exists "buyers insert own product reviews" on public.product_reviews;
create policy "buyers insert own product reviews" on public.product_reviews
  for insert with check (buyer_id = auth.uid());

drop policy if exists "buyers update own product reviews" on public.product_reviews;
create policy "buyers update own product reviews" on public.product_reviews
  for update using (buyer_id = auth.uid() or public.current_user_is_staff()) with check (buyer_id = auth.uid() or public.current_user_is_staff());

drop policy if exists "published seller reviews public read" on public.seller_reviews;
create policy "published seller reviews public read" on public.seller_reviews
  for select using (status = 'published' and deleted_at is null or buyer_id = auth.uid() or public.current_user_is_staff());

drop policy if exists "buyers insert own seller reviews" on public.seller_reviews;
create policy "buyers insert own seller reviews" on public.seller_reviews
  for insert with check (buyer_id = auth.uid());

drop policy if exists "buyers update own seller reviews" on public.seller_reviews;
create policy "buyers update own seller reviews" on public.seller_reviews
  for update using (buyer_id = auth.uid() or public.current_user_is_staff()) with check (buyer_id = auth.uid() or public.current_user_is_staff());

drop policy if exists "review media public read" on public.review_media;
create policy "review media public read" on public.review_media
  for select using (deleted_at is null or public.current_user_is_staff());

drop policy if exists "users manage own helpful votes" on public.review_helpful_votes;
create policy "users manage own helpful votes" on public.review_helpful_votes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users create review reports" on public.review_reports;
create policy "users create review reports" on public.review_reports
  for insert with check (reporter_id = auth.uid());

drop policy if exists "reporters and staff read review reports" on public.review_reports;
create policy "reporters and staff read review reports" on public.review_reports
  for select using (reporter_id = auth.uid() or public.current_user_is_staff());

drop policy if exists "staff update review reports" on public.review_reports;
create policy "staff update review reports" on public.review_reports
  for update using (public.current_user_is_staff()) with check (public.current_user_is_staff());

drop policy if exists "everyone reads rating summaries" on public.rating_summaries;
create policy "everyone reads rating summaries" on public.rating_summaries
  for select using (true);

comment on table public.product_reviews is 'Verified purchase product reviews. One active review per completed order item.';
comment on table public.seller_reviews is 'Buyer feedback about seller communication, shipping, packaging, and overall experience.';
comment on table public.review_media is 'Cloudinary image attachments for product reviews. Video is intentionally unsupported.';
comment on table public.review_helpful_votes is 'One helpful vote per user per review.';
comment on table public.review_reports is 'User-submitted review abuse reports routed to moderation workflows.';
comment on table public.rating_summaries is 'Cached product and seller rating aggregates maintained by review triggers.';
