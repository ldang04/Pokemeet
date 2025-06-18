# Pokemeet - Pokemon Resume Generator

A Next.js application that generates unique Pokemon cards based on uploaded resume files using OpenAI's DALL-E 3 image generation.

## Features

- Upload PDF resume files
- Generate 3 unique Pokemon cards representing different aspects of your professional profile:
  - Cute and friendly Pokemon
  - Aggressive and powerful Pokemon  
  - Mysterious and wise Pokemon
- Each card includes custom abilities based on resume content
- Modern, responsive UI built with React and Tailwind CSS

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoint

### POST `/api/generate-pokemon`

Generates 3 Pokemon cards based on an uploaded resume file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with a file field named `resume` (PDF format)

**Response:**
```json
{
  "success": true,
  "pokemon_cards": [
    {
      "id": 1,
      "type": "cute and friendly",
      "image_url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "description": "A cute and friendly Pokemon card generated based on your resume"
    },
    {
      "id": 2,
      "type": "aggressive and powerful",
      "image_url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "description": "A aggressive and powerful Pokemon card generated based on your resume"
    },
    {
      "id": 3,
      "type": "mysterious and wise",
      "image_url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "description": "A mysterious and wise Pokemon card generated based on your resume"
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Error message describing what went wrong"
}
```

## Usage Example

### Using curl:
```bash
curl -X POST http://localhost:3000/api/generate-pokemon \
  -F "resume=@path/to/your/resume.pdf"
```

### Using JavaScript fetch:
```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);

const response = await fetch('/api/generate-pokemon', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data.pokemon_cards);
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **OpenAI API** - GPT Image 1 for image generation
- **pdf-parse** - PDF text extraction
- **formidable** - File upload handling

## Notes

- The API uses OpenAI's GPT Image 1 model for image generation
- PDF text extraction is handled automatically
- Generated images are hosted by OpenAI and URLs are temporary
- File size limit: 10MB per upload
- Supported file format: PDF only

## Requirements

- Node.js 18+
- OpenAI API key with GPT Image 1 access
- Internet connection for OpenAI API calls

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
