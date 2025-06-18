import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client on server side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Create the prompt for Pokemon trainer transformation
    const prompt = `Transform this person into a Pokemon trainer character in the style of Studio Ghibli animation. The character should have:
    - Ghibli-esque art style with soft, warm colors and gentle shading
    - Pokemon trainer outfit with vest, backpack, and pokeball accessories  
    - Anime-style features while maintaining the person's basic likeness
    - Friendly, adventurous expression
    - Age-appropriate Pokemon trainer appearance
    - Clean, vibrant colors typical of Ghibli films
    - Professional anime character design quality
    - Standing pose ready for adventure`;

    // Use image edit to transform the uploaded photo
    const response = await openai.images.edit({
      image: imageFile,
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url"
    });

    // Return the generated image URL
    if (response.data && response.data[0] && response.data[0].url) {
      return NextResponse.json({ 
        success: true, 
        imageUrl: response.data[0].url,
        prompt: prompt
      });
    } else {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating trainer avatar:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('billing') || error.message.includes('quota')) {
        return NextResponse.json({ 
          error: 'OpenAI API quota exceeded. Please check your billing settings.' 
        }, { status: 402 });
      }
      if (error.message.includes('content_policy')) {
        return NextResponse.json({ 
          error: 'Image rejected by content policy. Please try a different photo.' 
        }, { status: 400 });
      }
      if (error.message.includes('invalid_image')) {
        return NextResponse.json({ 
          error: 'Invalid image format. Please upload a PNG, JPEG, or WebP image.' 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to generate trainer avatar. Please try again.' 
    }, { status: 500 });
  }
}

// Enable CORS for the API route
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 