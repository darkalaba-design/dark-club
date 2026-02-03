/**
 * Генерирует splash.png: портретное изображение с чёрным фоном и логотипом 512x512 по центру.
 * Используется как apple-touch-startup-image для iOS (большой логотип на весь экран с чёрным сверху/снизу).
 *
 * Запуск: node scripts/generate-splash.js
 * Требуется: npm install sharp (devDependency)
 */

const path = require('path')
const fs = require('fs')

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
  const outPath = path.join(root, 'public', 'splash.png')

  if (!fs.existsSync(iconPath)) {
    console.error('Не найден public/icon-512.png')
    process.exit(1)
  }

  // Портретное соотношение для телефона (например 9:19.5)
  const width = 1080
  const height = 1920
  const bgColor = '#0a0a0a'

  const icon = await sharp(iconPath).resize(512, 512).toBuffer()

  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: bgColor,
    },
  })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toFile(outPath)

  console.log('Создан public/splash.png (1080x1920, чёрный фон, логотип по центру)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
