# Logware Deployment Guide

This guide provides instructions for setting up and deploying the Logware platform using Docker for production environments.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop/) installed and running
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Configuration

### Environment Variables

Before deploying, you need to set up your environment variables. Copy the `.env.production` file to `.env`:

```bash
cp .env.production .env
```

Edit the `.env` file to configure your specific environment:

- Database credentials
- API keys for security tools
- SMTP settings for notifications
- JWT secret for authentication

### Security Tool Integration

Logware integrates with various security tools. Configure the API endpoints and keys in the `.env` file:

```
# Integration API Keys
OSSIM_BASE_URL=https://your-ossim-instance/api/v1
OSSIM_API_KEY=your_ossim_api_key
OSSIM_ENABLED=true

WIRESHARK_BASE_URL=http://your-wireshark-api/api
WIRESHARK_API_KEY=your_wireshark_api_key
WIRESHARK_ENABLED=true

SPLUNK_BASE_URL=https://your-splunk-instance:8089/services/rest
SPLUNK_API_KEY=your_splunk_api_key
SPLUNK_ENABLED=true

ELK_NODE=http://your-elasticsearch:9200
ELK_API_KEY=your_elk_api_key
ELK_DEFAULT_INDEX=logware-logs
ELK_ENABLED=true
```

## Deployment

### Using Docker Compose

To deploy the entire Logware platform:

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop all services
docker-compose -f docker-compose.prod.yml down
```

### Using the Deployment Script (Windows)

We've provided a PowerShell script for easy deployment on Windows:

```powershell
# Run the deployment script
.\docker-deploy.ps1
```

## Production Access

After deployment, access the application at:

- Frontend: http://localhost (or the port specified in FRONTEND_PORT)
- Backend API: http://localhost:5000 (or the port specified in BACKEND_PORT)

## Security Features

### Two-Factor Authentication

Logware includes Two-Factor Authentication (2FA) for enhanced security. Users can enable 2FA from their profile page.

When 2FA is enabled:
1. Users log in with their username and password
2. They are prompted to enter a code from their authenticator app
3. Only after verification will they be granted access

### API Security

All API connections use JWT authentication. Ensure the `JWT_SECRET` is set to a strong random value in production.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MongoDB is running: `docker ps | grep mongodb`
   - Check MongoDB connection string in `.env`

2. **Security Tool Integration Issues**
   - Verify API endpoints are accessible from the Docker container
   - Check API keys are correct
   - Look at backend logs: `docker logs logware-backend-prod`

3. **Two-Factor Authentication Problems**
   - Ensure server time is synchronized (TOTP depends on accurate timing)
   - Check logs for verification failures

## Maintenance

### Backups

The MongoDB data is persisted in a Docker volume. To back up the database:

```bash
# Create a backup
docker exec logware-mongodb-prod sh -c 'mongodump --archive' > logware-backup.archive

# Restore from backup
docker exec -i logware-mongodb-prod sh -c 'mongorestore --archive' < logware-backup.archive
```

### Updates

To update to a new version:

1. Pull the latest code changes
2. Rebuild and restart the containers:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
