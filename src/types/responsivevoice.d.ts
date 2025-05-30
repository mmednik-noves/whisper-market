declare module 'responsivevoice' {
  interface ResponsiveVoiceOptions {
    pitch?: number;
    rate?: number;
    volume?: number;
    onend?: () => void;
    onerror?: (error: Error | string) => void;
  }

  interface ResponsiveVoice {
    speak(text: string, voice: string, options?: ResponsiveVoiceOptions): void;
    isPlaying(): boolean;
    cancel(): void;
    setDefaultVoice(voice: string): void;
  }

  const ResponsiveVoice: ResponsiveVoice;
  export default ResponsiveVoice;
} 