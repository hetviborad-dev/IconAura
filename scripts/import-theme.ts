import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';

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
  const { name, slug, category, description, iconType, iconValue, bgType, bgValue, folder } = options;

  const themeFolder = path.join(folder, slug);
  const needsImages = iconType === 'pattern' || bgType === 'pattern';

  if (needsImages && !fs.existsSync(themeFolder)) {
    console.error(`❌ Folder required for pattern theme ${slug} at ${themeFolder}. Skipping...`);
    return;
  }

  try {
    console.log(`\n🚀 Processing theme: ${name}...`);

    const files = fs.existsSync(themeFolder) ? fs.readdirSync(themeFolder) : [];

    // 1. Handle Pattern Image
    const patternFile = files.find(f =>
      f.toLowerCase().startsWith('pattern') &&
      ['.jpg', '.jpeg', '.png', '.webp'].some(ext => f.toLowerCase().endsWith(ext))
    );

    let uploadedPatternUrl: string | undefined;
    if (patternFile) {
      console.log(`  Processing pattern: ${patternFile}...`);
      const inputPath = path.join(themeFolder, patternFile);
      const outputPath = path.join(themeFolder, `pattern_processed.png`);

      await sharp(inputPath)
        .resize(580, 580, { fit: 'cover' })
        .png()
        .toFile(outputPath);

      const res = await cloudinary.uploader.upload(outputPath, {
        folder: `iconaura/themes/${slug}`,
        public_id: 'pattern',
      });
      uploadedPatternUrl = res.secure_url;
      fs.unlinkSync(outputPath);
      console.log(`  ✅ Uploaded pattern: ${res.secure_url}`);
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

    if (uploadedWallpapers.length === 0 && !uploadedPatternUrl) {
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

    const finalIconValue = (iconType === 'pattern' && uploadedPatternUrl) ? uploadedPatternUrl : iconValue;
    const finalBgValue = (bgType === 'pattern' && uploadedPatternUrl) ? uploadedPatternUrl : bgValue;

    const config = {
      description,
      category,
      featuredApps: existingTheme?.config?.featuredApps || ['instagram', 'whatsapp', 'youtube', 'spotify'],
      icon: { type: iconType, value: finalIconValue },
      background: { type: bgType, value: finalBgValue },
      preview: {
        featuredApps: existingTheme?.config?.preview?.featuredApps || ['instagram', 'whatsapp', 'youtube', 'spotify'],
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
        preview_url: uploadedPatternUrl || uploadedWallpapers[0],
        is_public: true,
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
