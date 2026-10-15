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

// Helper to get category ID from slug
async function getCategoryId(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function fetchHomeThemes() {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return { categories: [], themesMap: {} };
  }

  // 1. Fetch all categories ordered by rank
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug, order_index')
    .order('order_index', { ascending: true });

  if (catError) {
    console.error('Error fetching categories:', catError);
    return { categories: [], themesMap: {} };
  }

  // Fail-safe: manually sort categories in JS to ensure order_index is respected
  const sortedCategories = (categories || []).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  // 2. Fetch all public themes with their category slug
  const { data: themes, error: themeError } = await supabase
    .from('themes')
    .select('*, categories(slug)')
    .eq('is_public', true);

  if (themeError) {
    console.error('Error fetching themes:', themeError);
    return { categories: sortedCategories || [], themesMap: {} };
  }

  // 3. Map themes to their categories
  const themesMap: Record<string, ThemeDefinition[]> = {};
  themes.forEach(row => {
    // Handle both object and array responses for the joined category
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
        previewUrl: row.preview_url,
        preview: config.preview || { featuredApps: [], subtitle: '' },
        wallpapers: config.wallpapers || [],
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

  // Determine if we are searching by UUID (id) or friendly name (slug)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(themeId);
  const searchColumn = isUuid ? 'id' : 'slug';

  // Fetch from Supabase
  const { data, error } = await supabase
    .from('themes')
    .select('*, categories(name)')
    .eq(searchColumn, themeId)
    .single();

  if (error || !data) {
    throw new Error(`Theme not found: ${themeId}`);
  }

  // Map Supabase row to ThemeDefinition
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
    previewUrl: data.preview_url,
    preview: config.preview || {
      featuredApps: [],
      subtitle: '',
    },
    wallpapers: config.wallpapers || [],
  };
}

export async function fetchPublicThemes(): Promise<ThemeDefinition[]> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('themes')
    .select('*, categories(name)')
    .eq('is_public', true);

  if (error || !data) return [];

  return data.map(row => {
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
      previewUrl: row.preview_url,
      preview: config.preview || {
        featuredApps: [],
        subtitle: '',
      },
      wallpapers: config.wallpapers || [],
    };
  });
}

export async function fetchThemesByCategory(category: string): Promise<ThemeDefinition[]> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return [];
  }

  console.log(`DEBUG: fetchThemesByCategory called for category: ${category}`);

  // We search by both category_id (new) and config->>category (old) for backward compatibility
  const categoryId = await getCategoryId(category);

  const { data, error } = await supabase
    .from('themes')
    .select('*, categories(name)')
    .eq('is_public', true)
    .or(`category_id.eq.${categoryId || '00000000-0000-0000-0000-000000000000'},config->>category.eq.${category}`);

  if (error) {
    console.error(`DEBUG: Error fetching themes for ${category}:`, error);
    return [];
  }

  console.log(`DEBUG: Found ${data?.length || 0} themes for category ${category}`);

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
      previewUrl: row.preview_url,
      preview: config.preview || {
        featuredApps: [],
        subtitle: '',
      },
      wallpapers: config.wallpapers || [],
    };
  });
}
