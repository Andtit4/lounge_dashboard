module.exports = {
  apps: [
    {
      name: 'lounge-api',
      cwd: './backend',
      script: 'npm',
      args: 'run start:dev',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 6610,
        NODE_OPTIONS: '--experimental-global-webcrypto',
      },
    },
  ],
}
