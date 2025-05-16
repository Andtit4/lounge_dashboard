module.exports = {
    apps: [{
            name: 'lounge-api',
            cwd: './backend',
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
                API_BASE_URL: 'https://185-97-146-99.nip.io',
            },
        },
        {
            name: 'lounge-frontend',
            script: 'serve',
            args: '-s dist -l 6611',
            cwd: './',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PM2_SERVE_SPA: 'true',
                PM2_SERVE_HOMEPAGE: '/index.html'
            },
        },
    ],

    deploy: {
        production: {
            user: 'root',
            host: '185.97.146.99',
            ref: 'origin/main',
            repo: 'git@github.com:votre-username/lounge_dashboard.git',
            path: '/var/www/lounge-dashboard',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && ' +
                'npm run build && ' +
                'cd backend && ' +
                'npm install && ' +
                'npm run build && ' +
                'cd .. && ' +
                'pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
            ssh_options: ['ForwardAgent=yes'],
        },
    },
}