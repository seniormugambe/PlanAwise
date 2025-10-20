# Deployment Guide - Render

This guide will help you deploy your Web3 Financial Dashboard to Render.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **API Keys**: Gather all required API keys

## Required Environment Variables

Before deploying, you'll need these API keys:

### Essential
- `VITE_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com)

### Optional (for better performance)
- `VITE_GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `VITE_ALCHEMY_API_KEY` - Get from [Alchemy](https://www.alchemy.com)
- `VITE_INFURA_API_KEY` - Get from [Infura](https://infura.io)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push to GitHub**: Ensure your code is in a GitHub repository with the `render.yaml` file

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration

3. **Set Environment Variables**:
   - In the Render dashboard, go to your service
   - Navigate to "Environment" tab
   - Add all required environment variables:
     ```
     VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
     VITE_GEMINI_API_KEY=your_gemini_key_here
     VITE_ALCHEMY_API_KEY=your_alchemy_key_here
     ```

4. **Deploy**: Click "Deploy" and wait for the build to complete

### Option 2: Manual Setup

1. **Create Web Service**:
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - **Name**: `web3-finance-dashboard`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run preview`
   - **Plan**: Free (or paid for better performance)

3. **Set Environment Variables**: Add all required variables in the Environment tab

4. **Deploy**: Click "Create Web Service"

## Post-Deployment Configuration

### Custom Domain (Optional)
1. Go to your service settings
2. Navigate to "Custom Domains"
3. Add your domain and configure DNS

### HTTPS
- Render automatically provides HTTPS for all deployments
- Your app will be available at `https://your-app-name.onrender.com`

### Performance Optimization
- Consider upgrading to a paid plan for better performance
- Enable "Auto-Deploy" for automatic deployments on git push

## Environment Variables Setup

### WalletConnect Project ID
1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy the Project ID
4. Add as `VITE_WALLETCONNECT_PROJECT_ID`

### Alchemy API Key (Optional)
1. Sign up at [Alchemy](https://www.alchemy.com)
2. Create a new app
3. Copy the API key
4. Add as `VITE_ALCHEMY_API_KEY`

### Gemini API Key (Optional)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add as `VITE_GEMINI_API_KEY`

## Troubleshooting

### Build Failures
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Runtime Errors
- Check the service logs
- Ensure all required environment variables are present
- Test locally with `npm run build && npm run preview`

### Web3 Connection Issues
- Verify WalletConnect Project ID is correct
- Check that your domain is added to WalletConnect project settings
- Ensure HTTPS is enabled (required for Web3)

## Security Considerations

### Environment Variables
- Never commit API keys to your repository
- Use Render's environment variable system
- Rotate keys regularly

### HTTPS
- Always use HTTPS in production (Render provides this automatically)
- Web3 wallets require HTTPS to function properly

### Headers
The `render.yaml` includes security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Monitoring

### Render Dashboard
- Monitor build and deployment status
- View application logs
- Check resource usage

### Application Health
- Test wallet connections after deployment
- Verify all networks are accessible
- Check API integrations

## Scaling

### Free Tier Limitations
- Apps sleep after 15 minutes of inactivity
- 750 hours per month
- Shared resources

### Paid Plans
- Always-on applications
- Dedicated resources
- Better performance
- Custom domains included

## Support

If you encounter issues:
1. Check Render's [documentation](https://render.com/docs)
2. Review build and runtime logs
3. Test locally first
4. Contact Render support for platform issues

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] `render.yaml` file in repository root
- [ ] WalletConnect Project ID obtained
- [ ] Render account created
- [ ] Repository connected to Render
- [ ] Environment variables configured
- [ ] Deployment initiated
- [ ] Application tested in production
- [ ] Web3 functionality verified