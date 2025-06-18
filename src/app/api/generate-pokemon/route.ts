import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to parse form data
async function parseFormData(req: NextRequest): Promise<{ files: formidable.File[], fields: formidable.Fields }> {
  // Ensure temp directory exists
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const formData = await req.formData();
  const file = formData.get('resume') as File;
  
  if (!file) {
    throw new Error('No file uploaded');
  }

  // Convert the file to a buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Create a temporary file
  const tempFilePath = path.join(tempDir, `temp_${Date.now()}.pdf`);
  fs.writeFileSync(tempFilePath, buffer);
  
  const files = [{
    filepath: tempFilePath,
    originalFilename: file.name,
    mimetype: file.type,
  }] as formidable.File[];
  
  return { files, fields: {} };
}

// Helper function to extract text from resume
async function extractResumeText(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text || "Unable to extract text from resume";
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return "Error extracting text from resume file";
  }
}

// Helper function to generate a single Pokemon card
async function generatePokemonCard(resumeText: string, pokemonType: string): Promise<string> {
  const basePrompt = `Given this resume, generate 3 random pokemon card images (these should be 3 seperate and unique images that consist of 1) a picture of a fictional pokemon, and 2) text that shows abilities based on things in the persons resume) based off this resume. each pokemon card should represent a different aspect of the person who this resume belongs to and should be different "type" much like choosing your starter pokemon. 1 pokemon could be a "cute" pokemon, another could be more aggressive, and another could be something else you decide.`;
  
  const specificPrompt = `${basePrompt}
  
  Resume content: ${resumeText}
  
  Generate a ${pokemonType} style Pokemon card image. The card should include:
  - A fictional Pokemon illustration
  - Pokemon name related to the person's skills/experience
  - Abilities text based on the resume content
  - Professional yet playful design matching the ${pokemonType} theme`;

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1", // Using GPT Image 1 for better instruction following and photorealistic images
      prompt: specificPrompt,
      size: "1024x1024",
      quality: "high",
    });

    return response.data?.[0]?.url || "";
  } catch (error) {
    console.error(`Error generating ${pokemonType} Pokemon card:`, error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse the uploaded file
    const { files } = await parseFormData(req);
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const uploadedFile = Array.isArray(files) ? files[0] : files;
    
    // Extract text from the resume
    const resumeText = await extractResumeText(uploadedFile.filepath);

    // Generate 3 different Pokemon cards
    const pokemonTypes = [
      "cute and friendly",
      "aggressive and powerful", 
      "mysterious and wise"
    ];

    const pokemonPromises = pokemonTypes.map((type, index) => 
      generatePokemonCard(resumeText, type).then(url => ({
        id: index + 1,
        type: type,
        image_url: url,
        description: `A ${type} Pokemon card generated based on your resume`
      }))
    );

    const pokemonCards = await Promise.all(pokemonPromises);

    // Clean up temporary file
    try {
      if (fs.existsSync(uploadedFile.filepath)) {
        fs.unlinkSync(uploadedFile.filepath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary file:', cleanupError);
    }

    return NextResponse.json({
      success: true,
      pokemon_cards: pokemonCards
    });

  } catch (error) {
    console.error('Error in generate-pokemon API:', error);
    return NextResponse.json(
      { error: 'Failed to generate Pokemon cards', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Configure the API route to handle larger payloads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; 