-- Supabase Storage bucket model and least-privilege object policies.
-- Object naming convention:
--   seller-owned buckets: {seller_id}/{resource_id-or-purpose}/{filename}
--   user avatars: {user_id}/{filename}
--   staff-managed buckets: {placement-or-page}/{filename}

create or replace function public.storage_folder_uuid(object_name text, folder_index integer default 1)
returns uuid
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  folders text[];
begin
  folders := storage.foldername(object_name);
  if array_length(folders, 1) < folder_index then
    return null;
  end if;

  return folders[folder_index]::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values
      ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
      ('seller-documents', 'seller-documents', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png']),
      ('kyc-documents', 'kyc-documents', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png']),
      ('store-logos', 'store-logos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
      ('store-banners', 'store-banners', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
      ('user-avatars', 'user-avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
      ('promotional-banners', 'promotional-banners', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
      ('cms-assets', 'cms-assets', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'])
    on conflict (id) do update
      set public = excluded.public,
          file_size_limit = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types;

    update storage.buckets
      set public = false
      where id in ('seller-documents', 'kyc-documents', 'private-documents');

    drop policy if exists "public product images readable" on storage.objects;
    drop policy if exists "public seller assets readable" on storage.objects;
    drop policy if exists "authenticated users upload product images" on storage.objects;
    drop policy if exists "authenticated users upload seller assets" on storage.objects;
    drop policy if exists "private documents staff readable" on storage.objects;
    drop policy if exists "private documents authenticated upload" on storage.objects;

    drop policy if exists "public marketplace assets readable" on storage.objects;
    drop policy if exists "seller managers upload product images" on storage.objects;
    drop policy if exists "seller managers update product images" on storage.objects;
    drop policy if exists "seller managers delete product images" on storage.objects;
    drop policy if exists "seller managers upload store branding" on storage.objects;
    drop policy if exists "seller managers update store branding" on storage.objects;
    drop policy if exists "seller managers delete store branding" on storage.objects;
    drop policy if exists "users manage own avatars" on storage.objects;
    drop policy if exists "seller private documents readable" on storage.objects;
    drop policy if exists "seller private documents writable" on storage.objects;
    drop policy if exists "kyc documents staff and seller readable" on storage.objects;
    drop policy if exists "kyc documents writable by seller or staff" on storage.objects;
    drop policy if exists "staff manage public content assets" on storage.objects;

    create policy "public marketplace assets readable"
      on storage.objects for select
      using (bucket_id in ('product-images', 'store-logos', 'store-banners', 'user-avatars', 'promotional-banners', 'cms-assets'));

    create policy "seller managers upload product images"
      on storage.objects for insert
      with check (
        bucket_id = 'product-images'
        and public.current_user_can_manage_seller(public.storage_folder_uuid(name))
      );

    create policy "seller managers update product images"
      on storage.objects for update
      using (
        bucket_id = 'product-images'
        and public.current_user_can_manage_seller(public.storage_folder_uuid(name))
      )
      with check (
        bucket_id = 'product-images'
        and public.current_user_can_manage_seller(public.storage_folder_uuid(name))
      );

    create policy "seller managers delete product images"
      on storage.objects for delete
      using (
        bucket_id = 'product-images'
        and public.current_user_can_manage_seller(public.storage_folder_uuid(name))
      );

    create policy "seller managers upload store branding"
      on storage.objects for insert
      with check (
        bucket_id in ('store-logos', 'store-banners')
        and public.current_user_can_manage_seller(public.storage_folder_uuid(name))
      );

    create policy "seller managers update store branding"
      on storage.objects for update
      using (
        bucket_id in ('store-logos', 'store-banners')
        and public.current_user_can_manage_seller(public.storage_folder_uuid(name))
      )
      with check (
        bucket_id in ('store-logos', 'store-banners')
        and public.current_user_can_manage_seller(public.storage_folder_uuid(name))
      );

    create policy "seller managers delete store branding"
      on storage.objects for delete
      using (
        bucket_id in ('store-logos', 'store-banners')
        and public.current_user_can_manage_seller(public.storage_folder_uuid(name))
      );

    create policy "users manage own avatars"
      on storage.objects for all
      using (
        bucket_id = 'user-avatars'
        and public.storage_folder_uuid(name) = auth.uid()
      )
      with check (
        bucket_id = 'user-avatars'
        and public.storage_folder_uuid(name) = auth.uid()
      );

    create policy "seller private documents readable"
      on storage.objects for select
      using (
        bucket_id = 'seller-documents'
        and (
          public.current_user_is_staff()
          or public.current_user_can_manage_seller(public.storage_folder_uuid(name))
        )
      );

    create policy "seller private documents writable"
      on storage.objects for all
      using (
        bucket_id = 'seller-documents'
        and (
          public.current_user_is_staff()
          or public.current_user_can_manage_seller(public.storage_folder_uuid(name))
        )
      )
      with check (
        bucket_id = 'seller-documents'
        and (
          public.current_user_is_staff()
          or public.current_user_can_manage_seller(public.storage_folder_uuid(name))
        )
      );

    create policy "kyc documents staff and seller readable"
      on storage.objects for select
      using (
        bucket_id = 'kyc-documents'
        and (
          public.current_user_is_staff()
          or public.current_user_can_manage_seller(public.storage_folder_uuid(name))
        )
      );

    create policy "kyc documents writable by seller or staff"
      on storage.objects for all
      using (
        bucket_id = 'kyc-documents'
        and (
          public.current_user_is_staff()
          or public.current_user_can_manage_seller(public.storage_folder_uuid(name))
        )
      )
      with check (
        bucket_id = 'kyc-documents'
        and (
          public.current_user_is_staff()
          or public.current_user_can_manage_seller(public.storage_folder_uuid(name))
        )
      );

    create policy "staff manage public content assets"
      on storage.objects for all
      using (
        bucket_id in ('promotional-banners', 'cms-assets')
        and public.current_user_is_staff()
      )
      with check (
        bucket_id in ('promotional-banners', 'cms-assets')
        and public.current_user_is_staff()
      );
  end if;
end $$;
