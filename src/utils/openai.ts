

// Function to generate Pokemon trainer avatar using our API route
export const generateTrainerAvatar = async (userPhoto: File): Promise<string> => {
  try {
    // Create form data to send the file
    const formData = new FormData();
    formData.append('image', userPhoto);

    // Call our API route
    const response = await fetch('/api/generate-avatar', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate avatar');
    }

    const data = await response.json();
    
    if (data.success && data.imageUrl) {
      return data.imageUrl;
    } else {
      throw new Error('No image URL returned');
    }
  } catch (error) {
    console.error('Error generating trainer avatar:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate trainer avatar');
  }
};

 