import { useEffect, useRef, useCallback, useState } from 'react';
import { IntentProvider } from '@noves/intent-ethers-provider';

interface AnimatedPrice {
  price: number;
  direction: 'up' | 'down';
  id: number;
}

interface PriceWhispererProps {
  onPriceChange: (price: number | null, direction: 'up' | 'down' | 'neutral', isLoading: boolean, shouldPulse?: boolean) => void;
}

export const PriceWhisperer = ({ onPriceChange }: PriceWhispererProps) => {
  const lastPriceRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSpokenTimeRef = useRef<number>(0);
  const isVoiceEnabledRef = useRef(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [animatedPrices, setAnimatedPrices] = useState<AnimatedPrice[]>([]);
  const animationIdRef = useRef(0);
  const MIN_SPEECH_INTERVAL = 2000; // Minimum time between speech in milliseconds
  const MAX_RETRIES = 3; // Maximum number of retry attempts
  const RETRY_DELAY = 1000; // Delay between retries in milliseconds

  // Update ref when state changes
  useEffect(() => {
    isVoiceEnabledRef.current = isVoiceEnabled;
  }, [isVoiceEnabled]);

  const speakWithRetry = useCallback((utterance: SpeechSynthesisUtterance, retryCount = 0) => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis is not supported in this browser');
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      utterance.onend = () => {
        console.log('Speech ended successfully');
        lastSpokenTimeRef.current = Date.now();
      };

      utterance.onerror = (event) => {
        const errorDetails = {
          error: event.error || 'unknown',
          elapsedTime: event.elapsedTime || 0,
          name: event.name || 'unknown',
          utterance: {
            text: utterance.text,
            voice: utterance.voice?.name || 'default',
            lang: utterance.lang,
            pitch: utterance.pitch,
            rate: utterance.rate,
            volume: utterance.volume
          },
          synthesisState: {
            pending: window.speechSynthesis.pending,
            speaking: window.speechSynthesis.speaking,
            paused: window.speechSynthesis.paused
          },
          browserInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        };

        console.error('Speech synthesis error:', errorDetails);

        // Handle specific error cases
        if (event.error === 'not-allowed') {
          console.warn('Speech synthesis not allowed. This might require user interaction first.');
        } else if (event.error === 'interrupted') {
          console.warn('Speech synthesis was interrupted.');
        } else if (event.error === 'canceled') {
          console.warn('Speech synthesis was canceled.');
        } else if (event.error === 'network') {
          console.warn('Network error occurred during speech synthesis.');
        } else {
          console.warn('Unknown speech synthesis error occurred.');
        }

        // Retry logic
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying speech synthesis (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          setTimeout(() => {
            speakWithRetry(utterance, retryCount + 1);
          }, RETRY_DELAY);
        } else {
          console.error('Max retry attempts reached for speech synthesis');
        }
      };

      // Check if speech synthesis is supported and working
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        window.speechSynthesis.speak(utterance);
      } else {
        console.warn('Speech synthesis is busy, will retry...');
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            speakWithRetry(utterance, retryCount + 1);
          }, RETRY_DELAY);
        }
      }
    } catch (error) {
      console.error('Error in speech synthesis setup:', error);
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          speakWithRetry(utterance, retryCount + 1);
        }, RETRY_DELAY);
      }
    }
  }, []);

  const speakPrice = useCallback((price: number, direction: 'up' | 'down' | 'neutral') => {
    if (!window.speechSynthesis) {
      console.log('Speech synthesis not supported');
      return;
    }

    const now = Date.now();
    if (now - lastSpokenTimeRef.current < MIN_SPEECH_INTERVAL) {
      console.log('Skipping speech - too soon since last announcement');
      return;
    }

    // Round to 2 decimal places for speech
    const roundedPrice = Math.round(price * 100) / 100;
    const text = direction === 'neutral' 
      ? `${roundedPrice} dollars`
      : `${direction === 'up' ? 'going up' : 'going down'}. ${roundedPrice} dollars`;

    console.log('Speaking:', text, {
      isVoiceEnabled: isVoiceEnabledRef.current,
      timeSinceLastSpeech: now - lastSpokenTimeRef.current,
      MIN_SPEECH_INTERVAL
    });

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // If voices aren't loaded yet, wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices();
        const voice = updatedVoices[192];
        const utterance = createUtterance(text, voice);
        speakWithRetry(utterance);
      };
      return;
    }

    const voice = voices[192];
    const utterance = createUtterance(text, voice);
    speakWithRetry(utterance);
  }, []);

  const createUtterance = (text: string, voice: SpeechSynthesisVoice | undefined) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 0.5; // Maximum volume
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 0.8; // Normal pitch
    utterance.lang = 'en-US'; // Explicitly set language
    if (voice) {
      utterance.voice = voice;
    }
    return utterance;
  };

  const handlePriceUpdate = useCallback((currentPrice: number) => {
    if (lastPriceRef.current === null) {
      lastPriceRef.current = currentPrice;
      // Pass full precision price to display
      onPriceChange(currentPrice, 'neutral', false, true);
      speakPrice(currentPrice, 'neutral');
      return;
    }

    if (currentPrice !== lastPriceRef.current) {
      const direction = currentPrice > lastPriceRef.current ? 'up' : 'down';
      
      console.log('Price change detected:', {
        oldPrice: lastPriceRef.current,
        newPrice: currentPrice,
        direction,
        isVoiceEnabled: isVoiceEnabledRef.current
      });
      
      // Add the old price to animated prices
      setAnimatedPrices(prev => [...prev, {
        price: lastPriceRef.current as number,
        direction,
        id: animationIdRef.current++
      }]);

      lastPriceRef.current = currentPrice;
      // Pass full precision price to display
      onPriceChange(currentPrice, direction, false, true);
      speakPrice(currentPrice, direction);
    } else {
      // Pass full precision price to display with animation
      onPriceChange(currentPrice, 'neutral', false, true);
    }
  }, [onPriceChange, speakPrice]);

  // Clean up finished animations
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setAnimatedPrices(prev => prev.filter(price => {
        const element = document.getElementById(`animated-price-${price.id}`);
        if (!element) return false;
        const computedStyle = window.getComputedStyle(element);
        return computedStyle.opacity !== '0';
      }));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    onPriceChange(null, 'neutral', true);

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Chrome requires voices to be loaded
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          console.log('Voices loaded');
        };
      }
    }

    const streamPrices = async () => {
      try {
        const provider = new IntentProvider();
        abortControllerRef.current = new AbortController();
        
        const stream = await provider.getTokenPriceTicks({
          chain: 'ethereum',
          token_address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' // ETH
        });

        for await (const tick of stream) {
          if (!isMounted) break;
          const currentPrice = parseFloat(tick.price.amount);
          handlePriceUpdate(currentPrice);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error in price stream:', error);
          onPriceChange(null, 'neutral', false);
        }
      }
    };

    streamPrices();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []); // Empty dependency array since we don't want to re-run this effect

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      <button
        onClick={() => {
          console.log('Voice button clicked, current state:', isVoiceEnabled);
          setIsVoiceEnabled(prev => {
            const newState = !prev;
            console.log('Setting voice state to:', newState);
            return newState;
          });
        }}
        className="fixed top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full pointer-events-auto flex items-center gap-2 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${isVoiceEnabled ? 'text-green-500' : 'text-gray-400'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 12l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        {isVoiceEnabled ? 'Voice On' : 'Voice Off'}
      </button>
      {animatedPrices.map(({ price, direction, id }) => (
        <div
          key={id}
          id={`animated-price-${id}`}
          className={`absolute text-[min(15rem,20vw)] font-mono ${
            direction === 'up' ? 'text-green-500/80 animate-slide-down' : 'text-red-500/80 animate-slide-up'
          }`}
        >
          ${price.toFixed(2)}
        </div>
      ))}
    </div>
  );
}; 