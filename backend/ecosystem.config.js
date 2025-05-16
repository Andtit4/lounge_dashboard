module.exports = {
    apps: [{
        name: 'lounge-api',
        script: 'dist/main.js',
        node_args: "-r ./polyfill.js",
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
    }],

    deploy: {
        production: {
            user: 'root',
            host: '185.97.146.99',
            ref: 'origin/main',
            repo: 'git@github.com:votre-username/lounge_dashboard.git',
            path: '/var/www/lounge-api',
            'pre-deploy-local': '',
            'post-deploy': 'cd backend && ' +
                'npm install && ' +
                'chmod +x start-backend.sh && ' +
                'pm2 reload ecosystem.config.js',
            'pre-setup': '',
            ssh_options: ['ForwardAgent=yes'],
        },
    },
}