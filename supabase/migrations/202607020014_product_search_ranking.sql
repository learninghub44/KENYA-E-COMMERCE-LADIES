-- Ranked full-text search for the marketplace catalog.
-- Complements the plain product_search_documents table queries used for non-text-search
-- listing/sorting (featured, newest, price, seller, etc). This function is only invoked when a
-- free-text query is present and sort = 'relevance', since ts_rank_cd has no meaning without a
-- query and PostgREST/supabase-js can't order by a computed rank expression directly.

create or replace function public.search_products_ranked(
  p_query text default null,
  p_category_id uuid default null,
  p_category_ids uuid[] default null,
  p_brand_id uuid default null,
  p_brand_ids uuid[] default null,
  p_seller_id uuid default null,
  p_collection_id uuid default null,
  p_min_price integer default null,
  p_max_price integer default null,
  p_color text default null,
  p_colors text[] default null,
  p_size text default null,
  p_material text default null,
  p_in_stock_only boolean default false,
  p_min_rating numeric default null,
  p_tags text[] default null,
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  product_id uuid,
  seller_id uuid,
  category_id uuid,
  brand_id uuid,
  brand_name text,
  seller_store_name text,
  name text,
  currency text,
  base_price_minor integer,
  compare_at_price_minor integer,
  in_stock boolean,
  is_featured boolean,
  published_at timestamptz,
  created_at timestamptz,
  rating numeric,
  review_count integer,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with parsed_query as (
    select case when p_query is not null and length(trim(p_query)) > 0
      then websearch_to_tsquery('simple', p_query)
      else null
    end as tsq
  ),
  filtered as (
    select psd.*
    from public.product_search_documents psd, parsed_query
    where psd.published_at is not null
      and (parsed_query.tsq is null or psd.search_vector @@ parsed_query.tsq)
      and (p_category_id is null or psd.category_id = p_category_id)
      and (p_category_ids is null or psd.category_id = any(p_category_ids))
      and (p_brand_id is null or psd.brand_id = p_brand_id)
      and (p_brand_ids is null or psd.brand_id = any(p_brand_ids))
      and (p_seller_id is null or psd.seller_id = p_seller_id)
      and (
        p_collection_id is null
        or psd.product_id in (
          select cp.product_id from public.collection_products cp where cp.collection_id = p_collection_id
        )
      )
      and (p_min_price is null or psd.base_price_minor >= p_min_price)
      and (p_max_price is null or psd.base_price_minor <= p_max_price)
      and (p_color is null or p_color = any(psd.colors))
      and (p_colors is null or psd.colors && p_colors)
      and (p_size is null or p_size = any(psd.sizes))
      and (p_material is null or p_material = any(psd.materials))
      and (not p_in_stock_only or psd.in_stock)
      and (p_min_rating is null or psd.rating >= p_min_rating)
      and (p_tags is null or psd.tags && p_tags)
  )
  select
    f.product_id, f.seller_id, f.category_id, f.brand_id, f.brand_name, f.seller_store_name,
    f.name, f.currency, f.base_price_minor, f.compare_at_price_minor, f.in_stock, f.is_featured,
    f.published_at, f.created_at, f.rating, f.review_count,
    count(*) over() as total_count
  from filtered f, parsed_query
  order by
    case when parsed_query.tsq is not null then ts_rank_cd(f.search_vector, parsed_query.tsq) end desc nulls last,
    f.published_at desc nulls last,
    f.product_id asc
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;

grant execute on function public.search_products_ranked(
  text, uuid, uuid[], uuid, uuid[], uuid, uuid, integer, integer, text, text[], text, text,
  boolean, numeric, text[], integer, integer
) to anon, authenticated;

comment on function public.search_products_ranked is
  'Ranked, filtered, paginated product search over product_search_documents. Used for the relevance sort when a free-text query is present; ts_rank_cd requires a real query to be meaningful, so other sorts continue to be served by plain table queries via PostgREST.';
