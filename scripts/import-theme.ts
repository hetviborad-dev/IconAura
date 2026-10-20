import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

// List of all available AppIds for random selection
const ALL_APP_IDS = [
  'instagram', 'whatsapp', 'youtube', 'spotify', 'telegram', 'facebook', 'chrome', 'gmail',
  'tiktok', 'x', 'discord', 'reddit', 'netflix', 'snapchat', 'uber', 'paypal',
  'google-maps', 'google-drive', 'google-photos', 'google-play', 'google-calendar', 'google-meet',
  'zoom', 'pinterest', 'twitch', 'steam', 'roblox', 'airbnb', 'doordash', 'uber-eats',
  'etsy', 'ebay', 'cash-app', 'venmo', 'coinbase', 'dropbox', 'notion', 'shazam',
  'soundcloud', 'signal', 'line', 'viber', 'wechat', 'threads', 'tinder', 'duolingo',
  'strava', 'fitbit', 'wikipedia', 'messenger',
  'calculator', 'camera', 'settings', 'phone', 'calendar', 'clock', 'contacts',
  'microphone', 'files', 'gallery', 'messages',
  'weather', 'music', 'notes', 'security'
];

function getRandomApps(count = 4): string[] {
  const shuffled = [...ALL_APP_IDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function importSingleTheme(options: any) {
  const { name, slug, category, description, iconType, iconValue, bgType, bgValue, folder, color_tags, theme_tags } = options;

  const themeFolder = path.join(folder, slug);
  const needsImages = iconType === 'pattern' || bgType === 'pattern';

  if (needsImages && !fs.existsSync(themeFolder)) {
    console.error(`❌ Folder required for pattern theme ${slug} at ${themeFolder}. Skipping...`);
    return;
  }

  try {
    console.log(`\n🚀 Processing theme: ${name}...`);

    const files = fs.existsSync(themeFolder) ? fs.readdirSync(themeFolder) : [];

    // 1. Handle Pattern Images
    const findPatternFile = (prefix: string) =>
      files.find(f =>
        f.toLowerCase().startsWith(prefix) &&
        ['.jpg', '.jpeg', '.png', '.webp'].some(ext => f.toLowerCase().endsWith(ext))
      );

    const iconPatternFile = findPatternFile('icon-pattern');
    const bgPatternFile = findPatternFile('bg-pattern');
    const genericPatternFile = findPatternFile('pattern');

    let uploadedIconPatternUrl: string | undefined;
    let uploadedBgPatternUrl: string | undefined;

    async function processAndUpload(file: string, publicId: string) {
      const inputPath = path.join(themeFolder, file);
      const outputPath = path.join(themeFolder, `${publicId}_processed.png`);

      await sharp(inputPath)
        .resize(580, 580, { fit: 'cover' })
        .png()
        .toFile(outputPath);

      const res = await cloudinary.uploader.upload(outputPath, {
        folder: `iconaura/themes/${slug}`,
        public_id: publicId,
      });
      fs.unlinkSync(outputPath);
      return res.secure_url;
    }

    // Resolve which files to use (support separate files or fallback to generic pattern.png)
    const finalIconFile = iconPatternFile || genericPatternFile;
    const finalBgFile = bgPatternFile || genericPatternFile;

    if (finalIconFile) {
      console.log(`  Processing icon pattern: ${finalIconFile}...`);
      uploadedIconPatternUrl = await processAndUpload(finalIconFile, 'icon-pattern');
      console.log(`  ✅ Uploaded icon pattern: ${uploadedIconPatternUrl}`);
    }

    if (finalBgFile && finalBgFile !== finalIconFile) {
      console.log(`  Processing bg pattern: ${finalBgFile}...`);
      uploadedBgPatternUrl = await processAndUpload(finalBgFile, 'bg-pattern');
      console.log(`  ✅ Uploaded bg pattern: ${uploadedBgPatternUrl}`);
    } else if (finalBgFile === finalIconFile) {
      uploadedBgPatternUrl = uploadedIconPatternUrl;
    }

    // 2. Handle All Wallpapers
    const wallpapersSubfolder = path.join(themeFolder, 'Wallpapers');
    const uploadedWallpapers: string[] = [];

    if (fs.existsSync(wallpapersSubfolder)) {
      const wallpaperFiles = fs.readdirSync(wallpapersSubfolder).filter(f =>
        ['.jpg', '.jpeg', '.png', '.webp'].some(ext => f.toLowerCase().endsWith(ext))
      );

      for (const file of wallpaperFiles) {
        console.log(`  Processing wallpaper: ${file}...`);
        const inputPath = path.join(wallpapersSubfolder, file);
        const processedName = `wallpaper_${path.parse(file).name}.png`;
        const outputPath = path.join(wallpapersSubfolder, processedName);

        await sharp(inputPath)
          .resize(675, 1200, { fit: 'cover' })
          .png()
          .toFile(outputPath);

        const res = await cloudinary.uploader.upload(outputPath, {
          folder: `iconaura/themes/${slug}/Wallpapers`,
          public_id: `wallpaper_${path.parse(file).name}`,
        });
        uploadedWallpapers.push(res.secure_url);
        fs.unlinkSync(outputPath);
      }
      console.log(`  ✅ Uploaded ${uploadedWallpapers.length} wallpapers.`);
    }

    if (uploadedWallpapers.length === 0 && !uploadedIconPatternUrl && !uploadedBgPatternUrl) {
      console.warn(`  ⚠️ No images found for ${name}. This theme will be color-only.`);
    }

    // 3. Handle Categories
    console.log(`  Handling category: ${category}...`);
    let categoryId: string;

    const catSlug = category.toLowerCase().replace(/\s+/g, '-');
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', catSlug)
      .single();

    if (catData) {
      categoryId = catData.id;
    } else {
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert({
          name: category,
          slug: catSlug
        })
        .select()
        .single();

      if (catError) throw catError;
      categoryId = newCat.id;
      console.log(`  ✅ Created new category: ${category}`);
    }

    // 4. Handle Database
    const { data: existingTheme } = await supabase
      .from('themes')
      .select('config')
      .eq('slug', slug)
      .single();

    const currentWallpapers = existingTheme?.config?.wallpapers || [];
    const allWallpapers = Array.from(new Set([...currentWallpapers, ...uploadedWallpapers]));

    const finalIconValue = (iconType === 'pattern' && uploadedIconPatternUrl) ? uploadedIconPatternUrl : iconValue;
    const finalBgValue = (bgType === 'pattern' && uploadedBgPatternUrl) ? uploadedBgPatternUrl : bgValue;

    const config = {
      description,
      category,
      featuredApps: existingTheme?.config?.featuredApps || getRandomApps(4),
      icon: { type: iconType, value: finalIconValue },
      background: { type: bgType, value: finalBgValue },
      preview: {
        featuredApps: existingTheme?.config?.preview?.featuredApps || getRandomApps(4),
        subtitle: existingTheme?.config?.preview?.subtitle || `Experience the ${name} aesthetic`,
      },
      wallpapers: allWallpapers,
    };

    const { data, error } = await supabase
      .from('themes')
      .upsert({
        name,
        slug,
        config,
        category_id: categoryId,
        preview_url: uploadedIconPatternUrl || uploadedBgPatternUrl || uploadedWallpapers[0],
        is_public: true,
        color_tags: color_tags || [],
        theme_tags: theme_tags || [],
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (error) throw error;
    console.log(`  🎉 Theme "${name}" successfully processed!`);

  } catch (err) {
    console.error(`  ❌ Import failed for ${name}:`, err);
  }
}

const program = new Command();

program
  .name('import-theme')
  .description('Import themes to Cloudinary and Supabase')
  .option('--all', 'Import all themes listed in themes.json')
  .option('--slug <slug>', 'Import a specific theme slug')
  .option('--folder <folder>', 'Folder containing images', './import_themes')
  .action(async (options) => {
    const { all, slug, folder } = options;

    if (!fs.existsSync('scripts/themes.json')) {
      console.error('Error: scripts/themes.json not found.');
      process.exit(1);
    }

    const themes = JSON.parse(fs.readFileSync('scripts/themes.json', 'utf8'));

    if (all) {
      for (const theme of themes) {
        await importSingleTheme({ ...theme, folder });
      }
      console.log('\n✨ All themes processed successfully!');
    } else if (slug) {
      const theme = themes.find(t => t.slug === slug);
      if (!theme) {
        console.error(`Error: Theme with slug ${slug} not found in themes.json`);
        process.exit(1);
      }
      await importSingleTheme({ ...theme, folder });
      console.log(`\n✨ Theme ${slug} processed successfully!`);
    } else {
      console.log('Please use --all to import all themes or --slug [slug] to import one.');
      program.help();
    }
  });

program.parse();
