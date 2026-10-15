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

const program = new Command();

program
  .name('import-theme')
  .description('Import a new theme with images to Cloudinary and Supabase')
  .requiredOption('-n, --name <name>', 'Theme name (e.g. "Crimson Bloom")')
  .requiredOption('-s, --slug <slug>', 'Theme slug (e.g. "crimson-bloom")')
  .option('-c, --category <category>', 'Theme category', 'popular')
  .option('-d, --description <description>', 'Theme description', 'A beautiful custom theme')
  .requiredOption('--icon-type <type>', 'Icon layer type: "color" or "pattern"')
  .requiredOption('--icon-value <value>', 'Icon layer value (Hex color or pattern ID)')
  .requiredOption('--bg-type <type>', 'Background layer type: "color" or "pattern"')
  .requiredOption('--bg-value <value>', 'Background layer value (Hex color or pattern ID)')
  .option('--folder <folder>', 'Folder containing images', './import_themes')
  .action(async (options) => {
    const { name, slug, category, description, iconType, iconValue, bgType, bgValue, folder } = options;

    const themeFolder = path.join(folder, slug);
    if (!fs.existsSync(themeFolder)) {
      console.error(`Error: Folder not found at ${themeFolder}`);
      process.exit(1);
    }

    try {
      console.log(`🚀 Starting import for theme: ${name}...`);

      const files = fs.readdirSync(themeFolder);

      // 1. Handle Pattern Image (In the root of the theme folder)
      const patternFile = files.find(f =>
        f.toLowerCase().startsWith('pattern') &&
        ['.jpg', '.jpeg', '.png', '.webp'].some(ext => f.toLowerCase().endsWith(ext))
      );

      let uploadedPatternUrl: string | undefined;
      if (patternFile) {
        console.log(`Processing pattern: ${patternFile}...`);
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
        console.log(`✅ Uploaded pattern: ${res.secure_url}`);
      }

      // 2. Handle All Wallpapers (In the 'Wallpapers' subfolder)
      const wallpapersSubfolder = path.join(themeFolder, 'Wallpapers');
      const uploadedWallpapers: string[] = [];

      if (fs.existsSync(wallpapersSubfolder)) {
        const wallpaperFiles = fs.readdirSync(wallpapersSubfolder).filter(f =>
          ['.jpg', '.jpeg', '.png', '.webp'].some(ext => f.toLowerCase().endsWith(ext))
        );

        for (const file of wallpaperFiles) {
          console.log(`Processing wallpaper: ${file}...`);
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
          console.log(`✅ Uploaded wallpaper ${file}: ${res.secure_url}`);
        }
      } else {
        console.warn(`⚠️ 'Wallpapers' subfolder not found at ${wallpapersSubfolder}`);
      }

      if (uploadedWallpapers.length === 0) {
        throw new Error('At least one wallpaper image is required in the Wallpapers/ folder.');
      }

      // 3. Prepare Supabase Data
      const finalIconValue = (iconType === 'pattern' && uploadedPatternUrl)
        ? uploadedPatternUrl
        : iconValue;

      const finalBgValue = (bgType === 'pattern' && uploadedPatternUrl)
        ? uploadedPatternUrl
        : bgValue;

      const config = {
        description,
        category,
        featuredApps: ['instagram', 'whatsapp', 'youtube', 'spotify'],
        icon: { type: iconType, value: finalIconValue },
        background: { type: bgType, value: finalBgValue },
        preview: {
          featuredApps: ['instagram', 'whatsapp', 'youtube', 'spotify'],
          subtitle: `Experience the ${name} aesthetic`,
        },
        wallpapers: uploadedWallpapers,
      };

      console.log('Inserting into Supabase...');
      const { data, error } = await supabase
        .from('themes')
        .insert({
          name,
          slug,
          config,
          preview_url: uploadedPatternUrl || uploadedWallpapers[0], // Use pattern as preview, fallback to first wallpaper
          is_public: true,
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`🎉 Theme "${name}" successfully imported!`);
      console.log(`ID: ${data.id}`);
      console.log(`Slug: ${data.slug}`);

    } catch (err) {
      console.error('❌ Import failed:', err);
      process.exit(1);
    }
  });

program.parse();
