/**
 * Генерирует splash-изображения для iOS PWA.
 * iOS требует точные размеры в физических пикселях для каждого устройства;
 * один размер на все устройства не подходит.
 *
 * Каждая запись: [deviceWidth, deviceHeight, pixelRatio] → файл splash-{width}x{height}.png
 * где width = deviceWidth * pixelRatio, height = deviceHeight * pixelRatio.
 *
 * Запуск: node scripts/generate-splash.js
 * Требуется: npm install sharp (devDependency)
 */

const path = require('path')
const fs = require('fs')

const SPLASH_SIZES = [
  [320, 568, 2],   // iPhone SE 1st → 640x1136
  [375, 667, 2],   // iPhone 8 → 750x1334
  [375, 812, 3],   // iPhone X, 11 Pro → 1125x2436
  [390, 844, 3],   // iPhone 14, 13, 12 → 1170x2532
  [393, 852, 3],   // iPhone 15 Pro → 1179x2556
  [414, 896, 3],   // iPhone 11, XR → 1242x2688
  [428, 926, 3],   // iPhone 14 Plus, 13 Pro Max → 1284x2778
  [430, 932, 3],   // iPhone 15 Pro Max → 1290x2796
]

async function main() {
  let sharp
  try {
    sharp = require('sharp')
  } catch {
    console.error('Установите sharp: npm install sharp --save-dev')
    process.exit(1)
  }

  const root = path.resolve(__dirname, '..')
  const iconPath = path.join(root, 'public', 'icon-512.png')
  const publicDir = path.join(root, 'public')

  if (!fs.existsSync(iconPath)) {
    console.error('Не найден public/icon-512.png')
    process.exit(1)
  }

  const bgColor = { r: 10, g: 10, b: 10 }
  const iconBuffer = await sharp(iconPath).resize(512, 512).toBuffer()

  for (const [lw, lh, ratio] of SPLASH_SIZES) {
    const width = lw * ratio
    const height = lh * ratio
    const outPath = path.join(publicDir, `splash-${width}x${height}.png`)

    const iconSize = Math.min(512, Math.floor(Math.min(width, height) * 0.5))
    const iconResized = await sharp(iconBuffer).resize(iconSize, iconSize).toBuffer()

    await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: bgColor,
      },
    })
      .composite([{ input: iconResized, gravity: 'center' }])
      .png()
      .toFile(outPath)

    console.log(`  ${outPath} (${lw}x${lh} @${ratio}x)`)
  }

  console.log('Готово. Добавьте в layout.tsx ссылки на splash-{width}x{height}.png с media для каждого размера.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
