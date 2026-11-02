import { supabase } from '../lib/supabase';
import type { ThemeDefinition, ThemeId } from '../types/data';
import 'react-native-url-polyfill/auto';

export async function fetchCategories(): Promise<{ id: string; name: string }[]> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, order_index')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data || [])
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    .map(cat => ({
      id: cat.slug,
      name: cat.name,
    }));
}


async function getCategoryId(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

function normalizeWallpaper(input: any): { url: string; preview?: string } {
  if (typeof input === 'string') return { url: input };
  const preview = (input?.preview || '').replace(',e_blur:300', '');
  return { url: input?.url, preview: preview || undefined };
}

export async function fetchHomeThemes(filters?: {
  colors?: string[];
  tags?: string[];
}) {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return { categories: [], themesMap: {} };
  }

  
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug, order_index')
    .order('order_index', { ascending: true });

  if (catError) {
    console.error('Error fetching categories:', catError);
    return { categories: [], themesMap: {} };
  }

  
  const sortedCategories = (categories || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  
  let query = supabase
    .from('themes')
    .select('*, categories(slug)')
    .eq('is_public', true);

  if (filters?.colors && filters.colors.length > 0) {
    query = query.overlaps('color_tags', filters.colors);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('theme_tags', filters.tags);
  }

  const { data: themes, error: themeError } = await query;
  if (themeError) {
    console.error('Error fetching themes:', themeError);
    return { categories: sortedCategories || [], themesMap: {} };
  }

  
  const themesMap: Record<string, ThemeDefinition[]> = {};
  themes.forEach(row => {
    
    const categoryData = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    const categorySlug = categoryData?.slug;

    if (categorySlug) {
      if (!themesMap[categorySlug]) themesMap[categorySlug] = [];
      const config = row.config as any;
      themesMap[categorySlug].push({
        id: row.id,
        name: row.name,
        description: config.description || 'Community Theme',
        category: categorySlug,
        featuredApps: config.featuredApps || [],
        icon: config.icon,
        background: config.background,
        isPremium: row.is_premium || false,
        previewUrl: row.preview_url,
        preview: config.preview || { featuredApps: [], subtitle: '' },
        wallpapers: (config.wallpapers || []).map(normalizeWallpaper),
      });
    }
  });

  return { categories: sortedCategories, themesMap };
}

export async function fetchTheme(themeId: ThemeId): Promise<ThemeDefinition> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    throw new Error('Supabase client not found');
  }

  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(themeId);
  const searchColumn = isUuid ? 'id' : 'slug';

  
  const { data, error } = await supabase
    .from('themes')
    .select('*, categories(name)')
    .eq(searchColumn, themeId)
    .single();

  if (error || !data) {
    throw new Error(`Theme not found: ${themeId}`);
  }

  
  const config = data.config as any;
  const categoryName = data.categories?.name || config.category || 'popular';

  return {
    id: data.id,
    name: data.name,
    description: config.description || 'Community Theme',
    category: categoryName,
    featuredApps: config.featuredApps || [],
    icon: config.icon,
    background: config.background,
    isPremium: data.is_premium || false,
    previewUrl: data.preview_url,
    preview: config.preview || {
      featuredApps: [],
      subtitle: '',
    },
    wallpapers: (config.wallpapers || []).map(normalizeWallpaper),
  };
}

export async function fetchPublicThemes(
  page: number = 1,
  limit: number = 20,
  filters?: {
    colors?: string[];
    tags?: string[];
  }
): Promise<{ data: ThemeDefinition[]; hasMore: boolean }> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return { data: [], hasMore: false };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('themes')
    .select('*, categories(name)')
    .eq('is_public', true);

  if (filters?.colors && filters.colors.length > 0) {
    query = query.overlaps('color_tags', filters.colors);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('theme_tags', filters.tags);
  }

  const { data, error } = await query.range(from, to);

  if (error || !data) return { data: [], hasMore: false };

  const themes = data.map(row => {
    const config = row.config as any;
    const categoryName = row.categories?.name || config.category || 'popular';
    return {
      id: row.id,
      name: row.name,
      description: config.description || 'Community Theme',
      category: categoryName,
      featuredApps: config.featuredApps || [],
      icon: config.icon,
      background: config.background,
      isPremium: row.is_premium || false,
      color_tags: row.color_tags || [],
      theme_tags: row.theme_tags || [],
      previewUrl: row.preview_url,
      preview: config.preview || {
        featuredApps: [],
        subtitle: '',
      },
      wallpapers: (config.wallpapers || []).map(normalizeWallpaper),
    };
  });

  return {
    data: themes,
    hasMore: data.length === limit,
  };
}

export async function fetchThemesByCategory(category: string): Promise<ThemeDefinition[]> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return [];
  }


  
  const categoryRow = await getCategoryId(category);
  const categoryId = categoryRow?.id;

  const { data, error } = await supabase
    .from('themes')
    .select('*, categories(name)')
    .eq('is_public', true)
    .or(`category_id.eq.${categoryId || '00000000-0000-0000-0000-000000000000'},config->>category.eq.${category}`);

  if (error) {
    return [];
  }


  return (data || []).map(row => {
    const config = row.config as any;
    const categoryName = row.categories?.name || config.category || 'popular';
    return {
      id: row.id,
      name: row.name,
      description: config.description || 'Community Theme',
      category: categoryName,
      featuredApps: config.featuredApps || [],
      icon: config.icon,
      background: config.background,
      isPremium: row.is_premium || false,
      previewUrl: row.preview_url,
      preview: config.preview || {
        featuredApps: [],
        subtitle: '',
      },
      wallpapers: (config.wallpapers || []).map(normalizeWallpaper),
    };
  });
}
