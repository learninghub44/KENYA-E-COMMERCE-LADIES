import type { ReactNode } from "react";
import { Navbar } from "../../components/layout/navbar";
import { Footer } from "../../components/layout/footer";
import { ChatWidgetWrapper } from "../../components/support/chat-widget-wrapper";
import { createSupabaseCategoryRepository } from "../../lib/marketplace/supabase-catalog-repository";
import { createCatalogService } from "../../lib/marketplace/catalog-service";
import { createSupabaseClient } from "../../lib/supabase/server";
import type { CategoryNode } from "../../lib/marketplace/types";

async function getNavCategories(): Promise<CategoryNode[]> {
  try {
    const supabase = await createSupabaseClient();
    const service = createCatalogService({
      categories: createSupabaseCategoryRepository(supabase as any),
      brands: { list: async () => [], findBySlug: async () => null },
      collections: {
        findBySlug: async () => null,
        listFeatured: async () => [],
        listProducts: async () => ({ items: [], nextCursor: null }),
      },
    });
    const result = await service.getCategoryTree(true);
    return result.ok ? result.data : [];
  } catch {
    // Nav must never break the whole storefront if categories fail to load.
    return [];
  }
}

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const categories = await getNavCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar categories={categories} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer categories={categories} />
      <ChatWidgetWrapper />
    </div>
  );
}
