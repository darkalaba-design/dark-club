/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Отключаем оптимизацию для SVG (они уже оптимизированы)
    unoptimized: false,
    // Форматы изображений
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
