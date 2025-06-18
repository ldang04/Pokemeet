'use client';

import { useState } from 'react';

interface PokemonCard {
  id: number;
  type: string;
  image_url: string;
  description: string;
}

interface GenerateResponse {
  success: boolean;
  pokemon_cards: PokemonCard[];
  error?: string;
}

export default function PokemonGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pokemonCards, setPokemonCards] = useState<PokemonCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a resume file to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setPokemonCards([]);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/generate-pokemon', {
        method: 'POST',
        body: formData,
      });

      const data: GenerateResponse = await response.json();

      if (data.success) {
        setPokemonCards(data.pokemon_cards);
      } else {
        setError(data.error || 'Failed to generate Pokemon cards');
      }
    } catch (err) {
      setError('An error occurred while generating Pokemon cards');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Pokemon Resume Generator</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Your Resume (PDF)
          </label>
          <input
            type="file"
            id="resume"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating Pokemon Cards...' : 'Generate Pokemon Cards'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {pokemonCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pokemonCards.map((card) => (
            <div key={card.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={card.image_url}
                alt={`${card.type} Pokemon card`}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 capitalize">{card.type} Pokemon</h3>
                <p className="text-gray-600 text-sm">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 