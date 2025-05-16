module.exports = {
    apps: [{
        name: 'lounge-frontend',
        script: 'npm',
        args: 'run dev',
        cwd: './',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development',
            PORT: 6611,
            // Forcer Vite à utiliser le port 6611
            VITE_PORT: 6611
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
                'pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
            ssh_options: ['ForwardAgent=yes'],
        },
    },
}