path: #? For Node
import { execSync } from 'node:child_process';

execSync(`
set -e
echo "Generating PWA screenshots..."

mkdir -p public/screenshots

# Convert SVG to high-quality PNG files using ImageMagick
convert -background transparent -size 1920x1080 private/logo.svg public/screenshots/desktop.png
cp public/screenshots/desktop.png public/screenshots/desktop.avif
cp public/screenshots/desktop.png public/screenshots/desktop.webp

echo "Screenshots generated:" && ls -la public/screenshots/
`);