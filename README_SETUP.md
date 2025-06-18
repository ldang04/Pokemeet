# Pokémeet Setup Instructions

## Environment Variables

To enable Pokemon trainer avatar generation, you'll need to set up your OpenAI API key:

1. Create a `.env.local` file in the root directory
2. Add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Getting an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env.local` file

## Important Notes

- Make sure you have credits/billing set up in your OpenAI account
- DALL-E 3 image generation costs approximately $0.040 per image
- The `.env.local` file is already gitignored for security

## Features

- Generates Pokemon trainer avatars in Ghibli animation style
- Uses DALL-E 3 for high-quality image generation
- Secure server-side API calls
- Error handling for API quotas and content policy violations 