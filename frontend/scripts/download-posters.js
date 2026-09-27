import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTERS_DIR = path.resolve(__dirname, '../public/assets/posters');
const BANNERS_DIR = path.resolve(__dirname, '../public/assets/banners');

if (!fs.existsSync(POSTERS_DIR)) fs.mkdirSync(POSTERS_DIR, { recursive: true });
if (!fs.existsSync(BANNERS_DIR)) fs.mkdirSync(BANNERS_DIR, { recursive: true });

const downloads = [
  // 16:9 Hero Backdrop
  {
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&h=1080&q=85',
    dest: path.join(BANNERS_DIR, 'blade_runner_2049_hero.jpg'),
    name: 'Hero Backdrop (Blade Runner 2049)'
  },
  // 2:3 Movie Posters
  {
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&h=1200&q=85',
    dest: path.join(POSTERS_DIR, 'blade_runner_2049.jpg'),
    name: 'Blade Runner 2049 Poster'
  },
  {
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&h=1200&q=85',
    dest: path.join(POSTERS_DIR, 'dune_part_two.jpg'),
    name: 'Dune: Part Two Poster'
  },
  {
    url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&h=1200&q=85',
    dest: path.join(POSTERS_DIR, 'the_batman.jpg'),
    name: 'The Batman Poster'
  },
  {
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&h=1200&q=85',
    dest: path.join(POSTERS_DIR, 'interstellar.jpg'),
    name: 'Interstellar Poster'
  },
  {
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&h=1200&q=85',
    dest: path.join(POSTERS_DIR, 'oppenheimer.jpg'),
    name: 'Oppenheimer Poster'
  },
  {
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&h=1200&q=85',
    dest: path.join(POSTERS_DIR, 'drive.jpg'),
    name: 'Drive Poster'
  },
  {
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=1200&q=85',
    dest: path.join(POSTERS_DIR, 'inception.jpg'),
    name: 'Inception Poster'
  },
  {
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&h=1200&q=85',
    dest: path.join(POSTERS_DIR, 'cyberpunk_edgerunners.jpg'),
    name: 'Cyberpunk Edgerunners Poster'
  }
];

function downloadFile(item) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(item.dest);
    https.get(item.url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Handle redirect
        https.get(response.headers.location, (redirectResp) => {
          redirectResp.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ Downloaded: ${item.name}`);
            resolve();
          });
        }).on('error', reject);
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${item.name}`);
          resolve();
        });
      } else {
        reject(new Error(`Failed ${item.name} with HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(item.dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading high-res curated cinema photography...');
  for (const item of downloads) {
    try {
      await downloadFile(item);
    } catch (err) {
      console.error(`✗ Error downloading ${item.name}:`, err.message);
    }
  }
  console.log('Done!');
}

run();
