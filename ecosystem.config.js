module.exports = {
  apps: [{
    name: 'bibitku-be',
    script: 'index.js',
    cwd: '/var/www/bibitku-be',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/pm2/bibitku-be-error.log',
    out_file: '/var/log/pm2/bibitku-be-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
