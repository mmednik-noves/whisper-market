'use client';

import { PriceWhisperer } from '@/components/PriceWhisperer';
import { Visualizer } from '@/components/Visualizer';
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';

export default function Home() {
  const [price, setPrice] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isLoading, setIsLoading] = useState(true);

  const handlePriceChange = (newPrice: number | null, newDirection: 'up' | 'down' | 'neutral', loading: boolean) => {
    setPrice(newPrice);
    setDirection(newDirection);
    setIsLoading(loading);
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="relative">
        <PriceWhisperer onPriceChange={handlePriceChange} />
        <Visualizer price={price} direction={direction} isLoading={isLoading} />
      </div>
      <div className="absolute bottom-8 left-0 right-0 text-center text-gray-400 text-sm">
        Built by <a href="https://github.com/mmednik-noves/" target="_blank" rel="noopener noreferrer" className="hover:text-white">@mmednik</a> with 💚 and <a href="https://www.npmjs.com/package/@noves/intent-ethers-provider" target="_blank" rel="noopener noreferrer" className="hover:text-white">Noves Intents</a>
      </div>
      <a 
        href="https://github.com/mmednik-noves/whisper-market" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="absolute bottom-8 right-8 text-gray-400 hover:text-white transition-colors"
      >
        <FaGithub size={24} />
      </a>
    </main>
  );
}
