module.exports = {
    apps: [{
        name: 'lounge-frontend',
        script: './run-frontend.sh',
        cwd: './',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 6611,
            API_URL: 'https://185-97-146-99.nip.io'
        },
    }],

    deploy: {
        production: {
            user: 'root',
            host: '185.97.146.99',
            ref: 'origin/main',
            repo: 'git@github.com:votre-username/lounge_dashboard.git',
            path: '/var/www/lounge-frontend',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && ' +
                'npm run build && ' +
                'chmod +x run-frontend.sh && ' +
                'pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
            ssh_options: ['ForwardAgent=yes'],
        },
    },
}