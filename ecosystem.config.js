module.exports = {
  apps: [
    {
      name: 'WinCOE-prod',
      script: 'npm',
      args: 'run start',
      cwd: '/var/www/html/wincoe',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'WinCOE-dev',
      script: 'npm',
      args: 'run dev',
      cwd: '/var/www/html/wincoe',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
}
