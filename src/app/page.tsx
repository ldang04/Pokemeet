'use client';

import { useState } from 'react';
import { generateTrainerAvatar } from '../utils/openai';

interface UserData {
  name: string;
  phoneNumber: string;
  phoneConfirmation: string;
  instagramUsername: string;
  profileImage: File | null;
  generatedAvatar?: string; // URL of the generated avatar
}

interface DialogueStep {
  id: string;
  text: string;
  inputType?: 'text' | 'tel' | 'file';
  placeholder?: string;
  field?: keyof UserData;
}

const dialogueSteps: DialogueStep[] = [
  {
    id: 'welcome',
    text: "Hi there! Welcome to the Pokemon Center! We're so excited to help you meet amazing Pokemon trainers who share your love for adventure and friendship!"
  },
  {
    id: 'intro',
    text: "Let's get to know you a little better so we can help you connect with the perfect trainer friends!"
  },
  {
    id: 'name',
    text: "What should we call you, fellow Pokemon trainer?",
    inputType: 'text',
    placeholder: 'Enter your name...',
    field: 'name'
  },
  {
    id: 'image',
    text: "Time to transform into a Pokemon trainer! Upload your photo and we'll create your personalized Ghibli-style trainer avatar!",
    inputType: 'file',
    field: 'profileImage'
  },
  {
    id: 'avatar_complete',
    text: "Looking fantastic! Your Pokemon trainer transformation is complete. Now let's get your contact details so other trainers can connect with you!"
  },
  {
    id: 'phone',
    text: "We'll need your phone number so we can let you know when other trainers want to connect with you!",
    inputType: 'tel',
    placeholder: 'Enter your phone number...',
    field: 'phoneNumber'
  },
  {
    id: 'phone_confirm',
    text: "Just to double-check, could you confirm your phone number for us?",
    inputType: 'tel',
    placeholder: 'Confirm your phone number...',
    field: 'phoneConfirmation'
  },
  {
    id: 'instagram',
    text: "Last step! What's your Instagram username? This is how you'll connect with your new trainer friends!",
    inputType: 'text',
    placeholder: 'Enter your Instagram username...',
    field: 'instagramUsername'
  },
  {
    id: 'complete',
    text: "Amazing! Your trainer profile is all set up. Now let's register your Pokemon for the Pokedex and start meeting other trainers!"
  }
];

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    phoneNumber: '',
    phoneConfirmation: '',
    instagramUsername: '',
    profileImage: null
  });
  const [currentInput, setCurrentInput] = useState('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Function to get personalized dialogue text
  const getDialogueText = (step: DialogueStep): string => {
    if (step.id === 'image' && userData.name) {
      return `Nice to meet you, ${userData.name}! Time to transform into a Pokemon trainer! Upload your photo and we'll create your personalized Ghibli-style trainer avatar!`;
    }
    if (step.id === 'avatar_complete' && userData.name) {
      return `Looking fantastic, ${userData.name}! Your Pokemon trainer transformation is complete. Now let's get your contact details so other trainers can connect with you!`;
    }
    if (step.id === 'phone' && userData.name) {
      return `Great! Now ${userData.name}, we'll need your phone number so we can let you know when other trainers want to connect with you!`;
    }
    if (step.id === 'instagram' && userData.name) {
      return `Almost done, ${userData.name}! What's your Instagram username? This is how you'll connect with your new trainer friends!`;
    }
    if (step.id === 'complete' && userData.name) {
      return `Amazing, ${userData.name}! Your trainer profile is all set up. Now let's register your Pokemon for the Pokedex and start meeting other trainers!`;
    }
    return step.text;
  };

  const handleStart = () => {
    setGameStarted(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUserData(prev => ({
        ...prev,
        profileImage: file
      }));
      
      // Start generating the avatar
      setIsGeneratingAvatar(true);
      setAvatarError(null);
      
      try {
        const avatarUrl = await generateTrainerAvatar(file);
        setUserData(prev => ({
          ...prev,
          generatedAvatar: avatarUrl
        }));
        
        // Automatically proceed to the next step after avatar generation
        setTimeout(() => {
          if (currentStep < dialogueSteps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
        }, 2000); // Wait 2 seconds to show the generated avatar
        
      } catch (error) {
        console.error('Avatar generation failed:', error);
        setAvatarError('Failed to generate trainer avatar. Please try again.');
      } finally {
        setIsGeneratingAvatar(false);
      }
    }
  };

  const handleProceed = () => {
    const step = dialogueSteps[currentStep];
    
    if (step.field && step.inputType !== 'file') {
      setUserData(prev => ({
        ...prev,
        [step.field!]: currentInput
      }));
      setCurrentInput('');
    }
    
    if (currentStep < dialogueSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const currentDialogue = dialogueSteps[currentStep];
  const canProceed = () => {
    if (!currentDialogue.inputType) return true;
    if (currentDialogue.inputType === 'file') {
      return userData.profileImage !== null && !isGeneratingAvatar;
    }
    return currentInput.trim() !== '';
  };

  if (!gameStarted) {
    return (
      <>
        {/* Method 1: CSS Background */}
        <div 
          className="min-h-screen absolute inset-0"
          style={{
            backgroundImage: "url('/images/pokemeet-bg.png')",
             backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 2
          }}
        />
        
        
        {/* Content */}
        <div className="flex flex-col items-center justify-center min-h-screen absolute inset-0" style={{ zIndex:  10}}>
          {/* Overlay for better text readability - temporarily reduced opacity */}
          <div className="absolute inset-0" style={{ zIndex: 5 }}></div>
          
          {/* Start Button */}
          <div className="relative text-center" style={{ zIndex: 20 }}>
            <img 
              src="/images/pokemeet-logo.png"
              alt="POKÉMEET"
              className="mb-0 drop-shadow-2xl h-60 w-auto mx-auto" 
            />
            <p className="text-xl text-white mb-8 font-semibold drop-shadow-lg font-[family-name:var(--font-pixelify-sans)] text-center">
              Meet Your Perfect Pokemon Trainer Partner!
            </p>
            <button
              onClick={handleStart}
              className="pokemon-button text-2xl px-12 py-6"
            >
              START ADVENTURE
            </button>
          </div>
          
          
        </div>
      </>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/images/pokemeet-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0"></div>
      
      {/* Dialogue System */}
      <div className="relative z-10 min-h-screen flex items-end justify-center p-4">
        {/* Generated Avatar - positioned behind and to the left */}
        {userData.generatedAvatar && currentStep >= 4 && (
          <div className="absolute bottom-20 left-8 z-0">
            <img 
              src={userData.generatedAvatar} 
              alt="Your Pokemon Trainer Avatar"
              className="w-64 h-64 object-cover opacity-80 rounded-lg shadow-2xl border-4 border-white/20"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
              }}
            />
          </div>
        )}
        
        <div className="dialogue-box relative z-20">
          <p className="text-xl leading-relaxed mb-6 text-slate-800 font-[family-name:var(--font-pixelify-sans)] text-center">
            {getDialogueText(currentDialogue)}
          </p>
          
          {/* Input Field */}
          {currentDialogue.inputType && (
            <div className="mb-6">
              {currentDialogue.inputType === 'file' ? (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="file-upload"
                      disabled={isGeneratingAvatar}
                    />
                    <label 
                      htmlFor="file-upload" 
                      className={`block p-4 border-2 border-slate-300 rounded-lg w-full bg-white font-[family-name:var(--font-pixelify-sans)] text-center cursor-pointer hover:bg-gray-50 transition-colors ${isGeneratingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isGeneratingAvatar 
                        ? 'Generating Pokemon Trainer Avatar...' 
                        : userData.profileImage 
                          ? userData.profileImage.name 
                          : 'Choose Profile Photo'
                      }
                    </label>
                  </div>
                  
                  {/* Loading indicator */}
                  {isGeneratingAvatar && (
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="text-blue-600 font-semibold font-[family-name:var(--font-pixelify-sans)] mt-2">
                        Creating your Pokemon trainer avatar...
                      </p>
                    </div>
                  )}
                  
                  {/* Error message */}
                  {avatarError && (
                    <p className="text-red-600 font-semibold font-[family-name:var(--font-pixelify-sans)] text-center">
                      ⚠️ {avatarError}
                    </p>
                  )}
                  
                  {/* Success with avatar preview */}
                  {userData.generatedAvatar && !isGeneratingAvatar && !avatarError && (
                    <div className="text-center space-y-3">
                      <p className="text-green-600 font-semibold font-[family-name:var(--font-pixelify-sans)]">
                        ✓ Pokemon trainer avatar generated!
                      </p>
                      <div className="flex justify-center">
                        <img 
                          src={userData.generatedAvatar} 
                          alt="Generated Pokemon Trainer Avatar"
                          className="w-32 h-32 rounded-lg border-4 border-blue-500 object-cover shadow-lg"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Simple success message for file upload only */}
                  {userData.profileImage && !userData.generatedAvatar && !isGeneratingAvatar && !avatarError && (
                    <p className="text-blue-600 font-semibold font-[family-name:var(--font-pixelify-sans)] text-center">
                      📸 Photo uploaded! Generating trainer avatar...
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type={currentDialogue.inputType}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder={currentDialogue.placeholder}
                  className="p-4 border-2 border-slate-300 rounded-lg w-full text-lg font-semibold bg-white font-[family-name:var(--font-pixelify-sans)] text-center"
                  autoFocus
                />
              )}
            </div>
          )}
          
          {/* Proceed Button */}
          <div className="flex justify-center">
            <button
              onClick={handleProceed}
              disabled={!canProceed()}
              className={`pokemon-button ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {currentStep === dialogueSteps.length - 1 ? 'COMPLETE' : 'PROCEED →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
