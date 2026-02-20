/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    env: {
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:50051',
        NEXT_PUBLIC_AI_URL: process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:3001',
    },
}

module.exports = nextConfig
