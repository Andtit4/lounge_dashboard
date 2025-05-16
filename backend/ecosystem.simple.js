module.exports = {
    apps: [{
            name: 'lounge-api',
            script: 'dist/main.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 6610,
                DB_HOST: '193.203.166.156',
                DB_PORT: 3306,
                DB_USERNAME: 'u527740812_lounge_db_user',
                DB_PASSWORD: 'Motdep@sse/2022',
                DB_DATABASE: 'u527740812_lounge_db',
                JWT_SECRET: 'changeThis-WithSecureSecret',
                UPLOADS_DIR: './uploads',
                API_BASE_URL: 'https://185-97-146-99.nip.io'
            }
        },
        {
            name: 'lounge-api-dev',
            script: 'npm',
            args: 'run start:dev',
            instances: 1,
            autorestart: true,
            watch: true,
            ignore_watch: ["node_modules", "uploads", "dist", ".git"],
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'development',
                PORT: 6610,
                DB_HOST: '193.203.166.156',
                DB_PORT: 3306,
                DB_USERNAME: 'u527740812_lounge_db_user',
                DB_PASSWORD: 'Motdep@sse/2022',
                DB_DATABASE: 'u527740812_lounge_db',
                JWT_SECRET: 'changeThis-WithSecureSecret',
                UPLOADS_DIR: './uploads',
                API_BASE_URL: 'http://localhost:6610'
            }
        }
    ]
}