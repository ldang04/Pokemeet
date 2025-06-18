import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper function to build gender-aware Pokemon trainer prompts
function buildTrainerPrompt(gender?: string): string {
  const baseStyle = `
Style requirements:
- Studio Ghibli-inspired anime art style with soft, warm colors and gentle shading
- High-quality professional character design
- Clean, vibrant colors typical of Pokemon anime
- Full body character illustration
- Simple background (outdoor Pokemon world setting)
- Friendly, approachable appearance perfect for a dating app profile
- Authentic Pokemon trainer aesthetic with proper gear and accessories
- Expressive face with warm, inviting smile

The character should embody the spirit of Pokemon adventure while being appealing and authentic for meeting other trainers in a dating context.`;

  switch (gender?.toLowerCase()) {
    case "female":
      return `Create a female Pokemon trainer character inspired by the classic female trainer design from the Pokemon games: a young woman with long brown hair, wearing a sleeveless red top, denim shorts, red and white sneakers, and a yellow backpack. She should have large expressive anime eyes, a friendly confident smile, and be in an adventurous pose. Include pokeballs either in her hands or attached to her belt.${baseStyle}`;
    
    case "male":
      return `Create a male Pokemon trainer character inspired by the classic male trainer design from the Pokemon games: a young man with dark hair, wearing a blue and white jacket, dark pants, sneakers, and carrying a backpack. He should have anime-style features, an energetic and determined expression, and be in an action-ready pose. Include pokeballs visible on his belt or in his hands.${baseStyle}`;
    
    default:
      return `Create a Pokemon trainer character with anime-style features, wearing typical trainer gear like a colorful jacket or vest, comfortable pants or shorts, sneakers, and a backpack. The character should have an adventurous, friendly expression and include pokeballs as accessories. Choose an appealing gender presentation suitable for a dating app.${baseStyle}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse multipart/form-data
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const gender = formData.get("gender") as string;

    // Validate required file
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image file." },
        { status: 400 }
      );
    }

    // Validate file size (20MB limit)
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Please upload an image under 20MB." },
        { status: 400 }
      );
    }

    // Convert file to base64 for vision API
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Step 1: Analyze the person's appearance using chat completions with vision
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please provide a detailed description of this person's facial features, hair, and overall appearance. Focus on physical characteristics that would help an artist recreate their likeness in an anime Pokemon trainer style. Include details about hair color, hair style, eye color, facial structure, skin tone, and any distinctive features. Be specific but concise."
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const personDescription = visionResponse.choices[0]?.message?.content;
    
    if (!personDescription) {
      return NextResponse.json(
        { error: "Failed to analyze the uploaded image" },
        { status: 500 }
      );
    }

    // Step 2: Build combined prompt with person's features and Pokemon trainer style
    const trainerPrompt = buildTrainerPrompt(gender);
    const combinedPrompt = `${trainerPrompt}

Character appearance based on this person: ${personDescription}

Important: Incorporate the described facial features, hair, and physical characteristics into the Pokemon trainer character while maintaining the anime art style and trainer aesthetic.`;

    // Step 3: Generate Pokemon trainer avatar using the combined description
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: combinedPrompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });

    // Return success response
    if (response.data && response.data[0] && response.data[0].url) {
      return NextResponse.json({
        success: true,
        imageUrl: response.data[0].url,
        style: gender ?? "neutral",
        description: personDescription, // Include the description for debugging
      });
    } else {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Error generating trainer avatar:", error);

    // Handle specific OpenAI error codes
    if (error?.code) {
      switch (error.code) {
        case "unsupported_media_type":
          return NextResponse.json(
            { error: "Unsupported image format. Please upload a PNG, JPEG, or WebP image." },
            { status: 400 }
          );
        
        case "invalid_request_error":
          return NextResponse.json(
            { error: "Invalid request. Please check your image format and try again." },
            { status: 400 }
          );
        
        case "content_policy_violation":
          return NextResponse.json(
            { error: "Image rejected by content policy. Please try a different photo." },
            { status: 400 }
          );
        
        case "insufficient_quota":
          return NextResponse.json(
            { error: "OpenAI API quota exceeded. Please check your billing settings." },
            { status: 402 }
          );
        
        case "rate_limit_exceeded":
          return NextResponse.json(
            { error: "Rate limit exceeded. Please try again in a moment." },
            { status: 429 }
          );
      }
    }

    // Handle generic error messages
    if (error?.message) {
      if (error.message.includes("billing") || error.message.includes("quota")) {
        return NextResponse.json(
          { error: "OpenAI API quota exceeded. Please check your billing settings." },
          { status: 402 }
        );
      }
      if (error.message.includes("content_policy")) {
        return NextResponse.json(
          { error: "Image rejected by content policy. Please try a different photo." },
          { status: 400 }
        );
      }
    }

    // Fallback error
    return NextResponse.json(
      { error: "Failed to generate trainer avatar. Please try again." },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
} 