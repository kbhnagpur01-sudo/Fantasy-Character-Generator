/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Sparkles, 
  Swords, 
  Shield, 
  Crosshair, 
  EyeOff, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  RefreshCw, 
  Image as ImageIcon, 
  AlertCircle, 
  Wand2, 
  FlaskConical, 
  Flame, 
  Feather, 
  ScrollText, 
  Heart, 
  Zap, 
  Droplets, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  Layers
} from 'lucide-react';

type CharacterClass = 'Mage' | 'Rogue' | 'Warrior' | 'Paladin' | 'Ranger';

interface CharacterStats {
  health: number;
  mana: number;
  strength: number;
}

interface Character {
  id: string;
  name: string;
  characterClass: CharacterClass;
  stats: CharacterStats;
}

interface DeckCard {
  id: string;
  name: string;
  characterClass: CharacterClass;
  portraitUrl: string | null;
  usingFallbackPortrait?: boolean;
  backstory: string;
  stats: CharacterStats;
  savedAt: number;
}

const FIRST_NAMES = [
  'Aeloria', 'Thalor', 'Kaelen', 'Vaelen', 'Zephyra', 
  'Baelor', 'Lyra', 'Darian', 'Elowen', 'Gideon', 
  'Morrigan', 'Soren', 'Faelan', 'Caelum', 'Isolde', 
  'Rowan', 'Seraphina', 'Theron', 'Althea', 'Corvin', 
  'Valeria', 'Drakon', 'Astrid', 'Garrick', 'Elysia', 
  'Boran', 'Rhiannon', 'Ignis', 'Sylas', 'Kallista', 
  'Fenris', 'Torin', 'Vespera', 'Ragnor', 'Eldrin', 
  'Nyx', 'Orion', 'Branoc', 'Lyanna', 'Tiberius',
  'Cassian', 'Mirella', 'Valen', 'Cedric', 'Morwenna',
  'Kaelith', 'Dareth', 'Finneas', 'Brann', 'Elira'
];

const SURNAMES = [
  'Nightwhisper', 'Ironbreaker', 'Emberfall', 'Swiftstrider', 'Stormcaller',
  'Shadowmend', 'Goldenshield', 'Frostweaver', 'Dawnseeker', 'Silverbow',
  'Deepdelver', 'Sunstrider', 'Oakenshield', 'Bloodfang', 'Starchaser',
  'Windrunner', 'Drakeblood', 'Hollowglen', 'Voidwalker', 'Moonshadow',
  'Brightblade', 'Ashwood', 'Runebinder', 'Gloomveil', 'Thunderborn',
  'Duskwalker', 'Crestfall', 'Stonegaze', 'Winterhart', 'Blackthorn'
];

const CLASSES: CharacterClass[] = [
  'Mage',
  'Rogue',
  'Warrior',
  'Paladin',
  'Ranger'
];

const CLASS_CONFIG: Record<CharacterClass, {
  color: string;
  badgeBg: string;
  badgeBorder: string;
  accentGlow: string;
  icon: React.ElementType;
  roleLabel: string;
  elementSymbol: string;
  elementName: string;
  fallbackGradient: string;
}> = {
  Mage: {
    color: 'text-indigo-300',
    badgeBg: 'bg-indigo-950/70',
    badgeBorder: 'border-indigo-500/40',
    accentGlow: 'from-indigo-600/25 via-emerald-600/10 to-transparent',
    icon: Sparkles,
    roleLabel: 'Arcane Transmuter',
    elementSymbol: '🜂',
    elementName: 'Aether & Fire',
    fallbackGradient: 'from-[#1e1528] via-[#161220] to-[#0d0a08]'
  },
  Rogue: {
    color: 'text-emerald-300',
    badgeBg: 'bg-emerald-950/70',
    badgeBorder: 'border-emerald-500/40',
    accentGlow: 'from-emerald-600/25 via-teal-600/10 to-transparent',
    icon: EyeOff,
    roleLabel: 'Quicksilver Infiltrator',
    elementSymbol: '☿',
    elementName: 'Mercury & Shadow',
    fallbackGradient: 'from-[#10241b] via-[#0c1813] to-[#0d0a08]'
  },
  Warrior: {
    color: 'text-amber-200',
    badgeBg: 'bg-amber-950/60',
    badgeBorder: 'border-amber-600/40',
    accentGlow: 'from-amber-600/25 via-rose-600/10 to-transparent',
    icon: Swords,
    roleLabel: 'Martial Champion',
    elementSymbol: '♂',
    elementName: 'Iron & Valor',
    fallbackGradient: 'from-[#281710] via-[#1d120d] to-[#0d0a08]'
  },
  Paladin: {
    color: 'text-amber-100',
    badgeBg: 'bg-[#261c10]',
    badgeBorder: 'border-amber-500/50',
    accentGlow: 'from-amber-500/30 via-yellow-600/15 to-transparent',
    icon: Shield,
    roleLabel: 'Solar Aurum Justiciar',
    elementSymbol: '☉',
    elementName: 'Gold & Divine Sol',
    fallbackGradient: 'from-[#2a2012] via-[#1f170c] to-[#0d0a08]'
  },
  Ranger: {
    color: 'text-teal-200',
    badgeBg: 'bg-teal-950/70',
    badgeBorder: 'border-teal-500/40',
    accentGlow: 'from-teal-600/25 via-emerald-600/15 to-transparent',
    icon: Crosshair,
    roleLabel: 'Verdant Scout',
    elementSymbol: '🜃',
    elementName: 'Flora & Earth',
    fallbackGradient: 'from-[#122421] via-[#0d1a18] to-[#0d0a08]'
  }
};

const DECK_STORAGE_KEY = 'fantasy_alchemist_deck_v1';

// Random integer stat generator
function generateRandomStats(): CharacterStats {
  return {
    health: Math.floor(Math.random() * (150 - 50 + 1)) + 50,    // 50–150
    mana: Math.floor(Math.random() * (100 - 20 + 1)) + 20,       // 20–100
    strength: Math.floor(Math.random() * (100 - 10 + 1)) + 10    // 10–100
  };
}

// Corner filigree component for ancient manuscript frame
function AntiqueCornerBracket({ className }: { className?: string }) {
  return (
    <svg 
      className={`w-6 h-6 text-amber-500/40 pointer-events-none ${className}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M2 10V2H10" />
      <path d="M2 2L9 9" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Subtle Web Audio sound generator for tactile alchemical clicks & chimes
function playSound(audioContextRef: React.MutableRefObject<AudioContext | null>, soundEnabled: boolean, type: 'roll' | 'magic' | 'save') {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    if (type === 'roll') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'magic') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'save') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // Graceful silent fallback
  }
}

export default function App() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isRollingCharacter, setIsRollingCharacter] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Portrait states
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState<boolean>(false);
  const [portraitError, setPortraitError] = useState<string | null>(null);
  const [portraitSeed, setPortraitSeed] = useState<number>(1);
  const [usingFallbackPortrait, setUsingFallbackPortrait] = useState<boolean>(false);

  // Backstory states
  const [backstory, setBackstory] = useState<string | null>(null);
  const [isGeneratingBackstory, setIsGeneratingBackstory] = useState<boolean>(false);
  const [backstoryCopied, setBackstoryCopied] = useState<boolean>(false);

  // My Deck states (Persistent in-app list)
  const [myDeck, setMyDeck] = useState<DeckCard[]>(() => {
    try {
      const stored = localStorage.getItem(DECK_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [justSavedToDeck, setJustSavedToDeck] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const previousCharacterRef = useRef<Character | null>(null);

  // Sync My Deck to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(myDeck));
    } catch {
      // Storage quota or sandboxing fallback
    }
  }, [myDeck]);

  // Random character generator that rolls unique character and new stats
  const generateNewCharacter = useCallback(() => {
    setIsRollingCharacter(true);

    let nextName = '';
    let nextClass: CharacterClass = 'Mage';
    let attempts = 0;

    do {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
      nextName = `${firstName} ${surname}`;
      nextClass = CLASSES[Math.floor(Math.random() * CLASSES.length)];
      attempts++;
    } while (
      previousCharacterRef.current &&
      previousCharacterRef.current.name === nextName &&
      previousCharacterRef.current.characterClass === nextClass &&
      attempts < 10
    );

    const newChar: Character = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: nextName,
      characterClass: nextClass,
      stats: generateRandomStats()
    };

    previousCharacterRef.current = newChar;
    setCharacter(newChar);
    setGenerationCount(prev => prev + 1);
    setIsCopied(false);
    
    // Reset portrait and backstory states for the new character
    setPortraitUrl(null);
    setPortraitError(null);
    setPortraitSeed(1);
    setUsingFallbackPortrait(false);
    setBackstory(null);
    setBackstoryCopied(false);
    setJustSavedToDeck(false);

    playSound(audioContextRef, soundEnabled, 'roll');

    const timer = setTimeout(() => {
      setIsRollingCharacter(false);
    }, 220);

    return () => clearTimeout(timer);
  }, [soundEnabled]);

  // Initial generation on first mount
  useEffect(() => {
    generateNewCharacter();
  }, []);

  // Keyboard shortcut listener (Spacebar generates new character)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        generateNewCharacter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generateNewCharacter]);

  const handleCopy = () => {
    if (!character) return;
    const text = `${character.name} — ${character.characterClass} (HP: ${character.stats.health}, MP: ${character.stats.mana}, STR: ${character.stats.strength})`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  const handleCopyBackstory = () => {
    if (!backstory) return;
    navigator.clipboard.writeText(backstory);
    setBackstoryCopied(true);
    setTimeout(() => setBackstoryCopied(false), 1800);
  };

  // AI Portrait Generation function
  const fetchPortrait = async (seedValue: number) => {
    if (!character) return;
    setIsGeneratingPortrait(true);
    setPortraitError(null);
    setUsingFallbackPortrait(false);

    try {
      const response = await fetch('/api/generate-portrait', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: character.name,
          characterClass: character.characterClass,
          seed: seedValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText = data.details || data.error || 'Failed to generate portrait.';
        throw new Error(errorText);
      }

      if (data.imageUrl) {
        setPortraitUrl(data.imageUrl);
        playSound(audioContextRef, soundEnabled, 'magic');
      } else {
        throw new Error('No image was returned by the portrait service.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn('Portrait generation warning:', errorMessage);
      setPortraitError(errorMessage);
    } finally {
      setIsGeneratingPortrait(false);
    }
  };

  // First portrait generation
  const handleGeneratePortrait = () => {
    fetchPortrait(1);
  };

  // Regenerate portrait for the current character
  const handleRegeneratePortrait = () => {
    const nextSeed = portraitSeed + 1;
    setPortraitSeed(nextSeed);
    fetchPortrait(nextSeed);
  };

  // Generate a fresh 1-2 sentence origin story for the currently displayed character
  const handleGenerateBackstory = async () => {
    if (!character) return;
    setIsGeneratingBackstory(true);

    try {
      const response = await fetch('/api/generate-backstory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: character.name,
          characterClass: character.characterClass,
        }),
      });

      const data = await response.json();
      if (data.backstory) {
        setBackstory(data.backstory);
        playSound(audioContextRef, soundEnabled, 'magic');
      }
    } catch (err: unknown) {
      console.warn('Backstory generation notice:', err);
    } finally {
      setIsGeneratingBackstory(false);
    }
  };

  // Check if current displayed character is already in My Deck
  const isCurrentlyInDeck = character 
    ? myDeck.some(c => c.name === character.name && c.characterClass === character.characterClass)
    : false;

  // Save to Deck handler (prevents duplicates caused by repeated clicks)
  const handleSaveToDeck = () => {
    if (!character) return;
    if (isCurrentlyInDeck) {
      setJustSavedToDeck(true);
      setTimeout(() => setJustSavedToDeck(false), 2000);
      return;
    }

    const defaultBackstory = `${character.name} is a renowned ${character.characterClass} traversing the alchemical realms in search of legendary relics.`;

    const newDeckCard: DeckCard = {
      id: `deck-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: character.name,
      characterClass: character.characterClass,
      portraitUrl: portraitUrl,
      usingFallbackPortrait: usingFallbackPortrait,
      backstory: backstory || defaultBackstory,
      stats: { ...character.stats },
      savedAt: Date.now(),
    };

    setMyDeck(prev => [newDeckCard, ...prev]);
    setJustSavedToDeck(true);
    playSound(audioContextRef, soundEnabled, 'save');
    setTimeout(() => setJustSavedToDeck(false), 2200);
  };

  // Remove card from deck
  const handleRemoveFromDeck = (id: string) => {
    setMyDeck(prev => prev.filter(card => card.id !== id));
  };

  // Load a saved card back into active view
  const handleInspectDeckCard = (card: DeckCard) => {
    const loadedChar: Character = {
      id: card.id,
      name: card.name,
      characterClass: card.characterClass,
      stats: { ...card.stats }
    };
    setCharacter(loadedChar);
    setPortraitUrl(card.portraitUrl);
    setUsingFallbackPortrait(!!card.usingFallbackPortrait);
    setBackstory(card.backstory);
    setPortraitError(null);
    playSound(audioContextRef, soundEnabled, 'roll');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeConfig = character ? CLASS_CONFIG[character.characterClass] : null;
  const ClassIcon = activeConfig ? activeConfig.icon : Sparkles;

  return (
    <div className="min-h-screen bg-[#0d0a08] text-amber-100 flex flex-col justify-between selection:bg-amber-600/30 selection:text-amber-200 relative overflow-hidden alchemist-grain">
      {/* Ancient Workbench Atmospheric Lighting */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(ellipse_75%_45%_at_50%_0%,rgba(212,175,55,0.18),transparent_75%)]" 
        aria-hidden="true" 
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_60%_50%_at_90%_90%,rgba(16,185,129,0.14),transparent_65%)]" 
        aria-hidden="true" 
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(ellipse_95%_80%_at_50%_50%,transparent_40%,rgba(10,8,6,0.85)_100%)]" 
        aria-hidden="true" 
      />

      {/* Background Alchemical Symbols / Watermark Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.035] select-none text-amber-400" aria-hidden="true">
        <svg width="680" height="680" viewBox="0 0 680 680" fill="none" stroke="currentColor">
          <circle cx="340" cy="340" r="320" strokeWidth="1.5" strokeDasharray="8 6" />
          <circle cx="340" cy="340" r="280" strokeWidth="1" />
          <polygon points="340,60 582,480 98,480" strokeWidth="1" />
          <polygon points="340,620 98,200 582,200" strokeWidth="1" />
          <circle cx="340" cy="340" r="160" strokeWidth="1.5" />
          <circle cx="340" cy="340" r="90" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Top Bar: Ancient Alchemist's Bench Header */}
      <header className="relative z-10 flex items-center justify-between gap-8 px-6 sm:px-10 py-4 border-b border-amber-900/40 bg-[#120e0b]/85 backdrop-blur-md shadow-md">
        {/* Zone 1: Wordmark with alchemical crucible flask */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 flex items-center justify-center text-[#120e0a] shadow-md shadow-amber-950 border border-amber-400/40">
            <FlaskConical className="w-4 h-4 text-[#120e0a]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-wider text-amber-100 whitespace-nowrap shrink-0 font-[family-name:var(--font-cinzel)] drop-shadow-sm">
              Fantasy Character Creator
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation to Workbench & My Deck */}
        <div className="hidden md:flex items-center gap-6 text-xs text-amber-300/80 font-[family-name:var(--font-cinzel)] font-semibold">
          <a href="#workbench-card" className="hover:text-amber-100 transition-colors flex items-center gap-1.5">
            <span>🜂</span>
            <span>Card Crucible</span>
          </a>
          <span aria-hidden="true" className="text-amber-800">·</span>
          <a href="#my-deck" className="hover:text-amber-100 transition-colors flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>My Deck ({myDeck.length})</span>
          </a>
        </div>

        {/* Zone 3: Tactile Alchemical Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            aria-label={soundEnabled ? 'Disable alchemical soundscape' : 'Enable alchemical soundscape'}
            title={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-200/80 hover:text-amber-100 bg-[#1a130e] hover:bg-[#231b14] border border-amber-800/50 hover:border-amber-600/60 rounded-lg transition-colors cursor-pointer shadow-inner"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline font-medium">Chimes On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Muted</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto w-full">
        {/* Section Kicker */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400/90 font-medium mb-1 font-[family-name:var(--font-cinzel)]">
            <span className="text-amber-500">🜂</span>
            <span>Alchemical Crucible</span>
            <span className="text-emerald-400">🜄</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-amber-100/95 tracking-tight font-[family-name:var(--font-cinzel)] drop-shadow-md">
            Interactive Fantasy Player Card
          </h1>
        </div>

        {/* THE VISUALLY ATTRACTIVE, CLEARLY BORDERED FANTASY PLAYER CARD */}
        <div id="workbench-card" className="w-full max-w-xl mx-auto relative group">
          {/* Subtle Emerald & Antique Gold Ambient Aura */}
          <div 
            className={`absolute -inset-1 rounded-2xl bg-gradient-to-b ${activeConfig?.accentGlow || 'from-amber-600/20 via-emerald-600/10 to-transparent'} blur-xl opacity-75 transition-all duration-300 pointer-events-none`} 
            aria-hidden="true" 
          />

          {/* Heavy Inlaid Parchment Player Card Frame */}
          <div className="relative rounded-2xl border-2 border-amber-700/60 bg-gradient-to-b from-[#1c1510] via-[#16110d] to-[#100d0a] shadow-[0_16px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,220,130,0.1)] p-6 sm:p-7 backdrop-blur-xl transition-all duration-200">
            {/* Antique Filigree Brass Corners */}
            <AntiqueCornerBracket className="absolute top-2 left-2 rotate-0" />
            <AntiqueCornerBracket className="absolute top-2 right-2 rotate-90" />
            <AntiqueCornerBracket className="absolute bottom-2 left-2 -rotate-90" />
            <AntiqueCornerBracket className="absolute bottom-2 right-2 rotate-180" />

            {/* Top row inside card: Class emblem badge & Copy button */}
            <div className="flex items-center justify-between gap-4 mb-3.5 relative z-10">
              {character && activeConfig ? (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${activeConfig.badgeBg} ${activeConfig.badgeBorder} ${activeConfig.color} shadow-sm`}>
                  <span className="text-xs text-amber-400 font-serif" title={activeConfig.elementName}>
                    {activeConfig.elementSymbol}
                  </span>
                  <ClassIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-semibold tracking-wider uppercase font-[family-name:var(--font-cinzel)]">
                    {character.characterClass}
                  </span>
                  <span className="text-amber-600 text-xs hidden sm:inline">·</span>
                  <span className="text-xs text-amber-200/80 font-normal hidden sm:inline">
                    {activeConfig.roleLabel}
                  </span>
                </div>
              ) : (
                <div className="h-7 w-28 bg-[#201812] rounded-lg animate-pulse" />
              )}

              {/* Copy character button */}
              {character && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-300/80 hover:text-amber-100 bg-[#211711] hover:bg-[#2b1f17] border border-amber-700/50 hover:border-amber-500/60 rounded-lg transition-colors cursor-pointer shadow-sm"
                  title="Copy Inscribed Name, Class & Stats"
                  aria-label="Copy Inscribed Name, Class & Stats"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Inscribed!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* PROMINENT PORTRAIT DISPLAY AREA */}
            <div className="my-2 flex flex-col items-center relative z-10">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-amber-600/40 bg-[#0e0b08] flex items-center justify-center shadow-[inset_0_4px_16px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.08)] group/portrait">
                {/* Visual state 1: Loading portrait */}
                {isGeneratingPortrait && (
                  <div className="absolute inset-0 bg-[#0f0c09]/95 z-20 flex flex-col items-center justify-center p-4 text-center">
                    <div className="relative mb-3">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-600/30 border-t-amber-400 animate-spin" />
                      <Wand2 className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <p className="text-xs font-semibold text-amber-300 font-[family-name:var(--font-cinzel)] tracking-wide">
                      Transmuting Portrait...
                    </p>
                    <p className="text-[11px] text-amber-200/70 mt-1 max-w-[190px] leading-tight">
                      Brewing video-game caricature for {character?.name}
                    </p>
                  </div>
                )}

                {/* Visual state 2: Display Generated Portrait Image */}
                {portraitUrl && !isGeneratingPortrait ? (
                  <div className="relative w-full h-full">
                    <img
                      src={portraitUrl}
                      alt={`Cartoon video-game portrait of ${character?.name}, a ${character?.characterClass}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl transition-all duration-300"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-amber-500/20 rounded-xl pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b08]/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                ) : usingFallbackPortrait && !isGeneratingPortrait ? (
                  /* Visual state 2b: Stylized Cartoon Class SVG fallback */
                  <div className={`w-full h-full bg-gradient-to-br ${activeConfig?.fallbackGradient} flex flex-col items-center justify-center p-4 text-center relative border border-amber-800/30`}>
                    <div className="w-16 h-16 rounded-full bg-[#1b140e] border border-amber-600/50 flex items-center justify-center mb-2 shadow-lg">
                      <ClassIcon className={`w-8 h-8 ${activeConfig?.color}`} />
                    </div>
                    <span className="text-xs font-semibold text-amber-200 font-[family-name:var(--font-cinzel)]">
                      {character?.characterClass} Archetype
                    </span>
                    <span className="text-[10px] text-amber-300/60 mt-0.5">
                      Stylized Alchemical Seal
                    </span>
                  </div>
                ) : !isGeneratingPortrait && (
                  /* Visual state 3: Idle / No portrait summoned yet */
                  <div className="flex flex-col items-center justify-center text-center p-4 text-amber-600/80">
                    <div className="w-16 h-16 rounded-2xl bg-[#17110d] border border-amber-800/50 flex items-center justify-center mb-3 shadow-inner">
                      <ImageIcon className="w-8 h-8 text-amber-600/70" />
                    </div>
                    <p className="text-xs font-semibold text-amber-300/90 font-[family-name:var(--font-cinzel)] tracking-wide">
                      No portrait distilled yet
                    </p>
                    <p className="text-[11px] text-amber-400/60 mt-1 max-w-[200px] leading-snug">
                      Tap below to distill an AI cartoon video-game illustration
                    </p>
                  </div>
                )}
              </div>

              {/* Graceful Error Notification */}
              {portraitError && (
                <div className="w-full mt-3 p-3 rounded-xl bg-[#24110f] border border-rose-700/50 text-left shadow-lg">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <p className="font-medium text-rose-200 font-[family-name:var(--font-cinzel)]">
                        Alchemical Alembic Notice
                      </p>
                      <p className="text-rose-200/80 text-[11px] mt-0.5 leading-relaxed">
                        {portraitError}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => fetchPortrait(portraitSeed)}
                          className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-[11px] font-medium border border-rose-600/50 transition-colors cursor-pointer"
                        >
                          Retry Distillation
                        </button>
                        <button
                          onClick={() => {
                            setUsingFallbackPortrait(true);
                            setPortraitError(null);
                          }}
                          className="px-2.5 py-1 rounded bg-[#201813] hover:bg-[#2c2018] text-amber-200 text-[11px] font-medium border border-amber-800/60 transition-colors cursor-pointer"
                        >
                          Use Stylized Avatar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PORTRAIT BUTTONS: Generate Portrait & Regenerate Portrait */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3 w-full">
                {/* Generate Portrait button */}
                <button
                  onClick={handleGeneratePortrait}
                  disabled={isGeneratingPortrait}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer font-[family-name:var(--font-cinzel)] ${
                    !portraitUrl && !usingFallbackPortrait
                      ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-[#120e0a] border border-amber-400/60 shadow-md shadow-amber-950/60 hover:brightness-105 active:scale-[0.98]'
                      : 'bg-[#1e1611] hover:bg-[#281e17] text-amber-200 border border-amber-800/60'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Generate Portrait"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                  <span>Generate Portrait</span>
                </button>

                {/* Regenerate Portrait button */}
                <button
                  onClick={handleRegeneratePortrait}
                  disabled={isGeneratingPortrait || (!portraitUrl && !usingFallbackPortrait)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer font-[family-name:var(--font-cinzel)] ${
                    portraitUrl || usingFallbackPortrait
                      ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-[#120e0a] border border-amber-400/60 shadow-md shadow-amber-950/60 hover:brightness-105 active:scale-[0.98]'
                      : 'bg-[#18120e]/60 text-amber-800 border border-amber-950 cursor-not-allowed'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  aria-label="Regenerate Portrait"
                  title={(!portraitUrl && !usingFallbackPortrait) ? 'Generate the first portrait before regenerating' : 'Distill a new portrait for this character'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPortrait ? 'animate-spin' : ''}`} />
                  <span>Regenerate Portrait</span>
                </button>
              </div>
            </div>

            {/* CHARACTER NAME with DISTINCTIVE STYLIZED MEDIEVAL DISPLAY FONT */}
            <div className={`py-1.5 text-center transition-transform duration-150 relative z-10 ${isRollingCharacter ? 'scale-[0.98] opacity-75' : 'scale-100 opacity-100'}`}>
              <div className="flex items-center justify-center gap-2 text-[10px] text-amber-400/80 uppercase tracking-widest font-semibold font-[family-name:var(--font-cinzel)] mb-0.5">
                <span className="text-amber-600">🜁</span>
                <span>Inscribed Persona</span>
                <span className="text-amber-600">🜃</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-100 font-[family-name:var(--font-decorative)] tracking-wide leading-tight drop-shadow-[0_2px_12px_rgba(212,175,55,0.35)] min-h-[2.5rem] flex items-center justify-center px-2">
                {character?.name}
              </h2>

              {/* Class display callout */}
              <div className="mt-1 flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent via-amber-700/60 to-transparent" aria-hidden="true" />
                <span className="text-sm sm:text-base font-medium text-amber-200/90 font-[family-name:var(--font-cinzel)]">
                  Class: <span className={`font-bold ${activeConfig?.color} underline decoration-amber-600/40 underline-offset-4`}>{character?.characterClass}</span>
                </span>
                <span className="h-px w-10 bg-gradient-to-r from-transparent via-amber-700/60 to-transparent" aria-hidden="true" />
              </div>
            </div>

            {/* THREE RANDOMLY GENERATED INTEGER STATS: Health (50–150), Mana (20–100), Strength (10–100) */}
            <div className="mt-3.5 pt-3 border-t border-amber-900/40 relative z-10">
              <div className="text-[10px] text-amber-400/80 uppercase tracking-widest font-semibold font-[family-name:var(--font-cinzel)] mb-2 text-center">
                Alchemical Attributes
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* Health Stat: 50–150 */}
                <div className="rounded-xl border border-rose-900/60 bg-gradient-to-b from-[#221012] to-[#160c0d] p-2.5 sm:p-3 text-center shadow-inner group/stat">
                  <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-semibold font-[family-name:var(--font-cinzel)]">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
                    <span>Health</span>
                  </div>
                  <div className="mt-1 text-lg sm:text-xl font-bold text-rose-100 font-mono tabular-nums">
                    {character?.stats.health ?? 100}
                  </div>
                  <div className="text-[10px] text-rose-300/60 font-medium">
                    Range 50–150
                  </div>
                </div>

                {/* Mana Stat: 20–100 */}
                <div className="rounded-xl border border-indigo-900/60 bg-gradient-to-b from-[#121528] to-[#0c0d18] p-2.5 sm:p-3 text-center shadow-inner group/stat">
                  <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-xs font-semibold font-[family-name:var(--font-cinzel)]">
                    <Droplets className="w-3.5 h-3.5 text-indigo-400 fill-indigo-500/20" />
                    <span>Mana</span>
                  </div>
                  <div className="mt-1 text-lg sm:text-xl font-bold text-indigo-100 font-mono tabular-nums">
                    {character?.stats.mana ?? 60}
                  </div>
                  <div className="text-[10px] text-indigo-300/60 font-medium">
                    Range 20–100
                  </div>
                </div>

                {/* Strength Stat: 10–100 */}
                <div className="rounded-xl border border-amber-800/60 bg-gradient-to-b from-[#251b11] to-[#17110a] p-2.5 sm:p-3 text-center shadow-inner group/stat">
                  <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-semibold font-[family-name:var(--font-cinzel)]">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-500/20" />
                    <span>Strength</span>
                  </div>
                  <div className="mt-1 text-lg sm:text-xl font-bold text-amber-100 font-mono tabular-nums">
                    {character?.stats.strength ?? 50}
                  </div>
                  <div className="text-[10px] text-amber-300/60 font-medium">
                    Range 10–100
                  </div>
                </div>
              </div>
            </div>

            {/* ELEGANT PARCHMENT-STYLE BACKSTORY PANEL */}
            <div className="mt-3.5 pt-3 border-t border-amber-900/40 relative z-10">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400/90 font-[family-name:var(--font-cinzel)] uppercase tracking-wider">
                  <ScrollText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Origin Chronicle</span>
                </div>

                <button
                  onClick={handleGenerateBackstory}
                  disabled={isGeneratingBackstory}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-amber-600/90 hover:from-amber-500 hover:to-amber-500 text-[#120e0a] border border-amber-400/50 shadow-md shadow-amber-950/60 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer font-[family-name:var(--font-cinzel)] disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Generate Backstory"
                >
                  <Feather className={`w-3.5 h-3.5 ${isGeneratingBackstory ? 'animate-pulse' : ''}`} />
                  <span>{isGeneratingBackstory ? 'Inscribing...' : 'Generate Backstory'}</span>
                </button>
              </div>

              {backstory ? (
                <div className="relative rounded-xl border border-amber-700/60 bg-[#16100b]/90 p-3.5 sm:p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] text-left group/backstory">
                  <div className="absolute top-2 right-2.5 text-amber-600/30 text-xl font-serif select-none pointer-events-none" aria-hidden="true">
                    ❦
                  </div>

                  <p className="text-xs sm:text-sm font-serif italic text-amber-100/95 leading-relaxed drop-shadow-sm pr-4">
                    "{backstory}"
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-amber-500/70 border-t border-amber-900/30 pt-1.5 font-[family-name:var(--font-cinzel)]">
                    <span className="flex items-center gap-1">
                      <span className="text-amber-400">✦</span>
                      <span>Chronicle of {character?.name}</span>
                    </span>
                    <button
                      onClick={handleCopyBackstory}
                      className="inline-flex items-center gap-1 text-amber-400/80 hover:text-amber-200 transition-colors cursor-pointer"
                      title="Copy Backstory"
                    >
                      {backstoryCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Story</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-900/40 bg-[#140e0a]/60 px-3.5 py-2.5 text-center text-xs text-amber-500/70 flex items-center justify-center gap-2">
                  <span className="text-amber-500">📜</span>
                  <span>Click <strong className="text-amber-300 font-semibold">"Generate Backstory"</strong> to inscribe a unique fantasy origin story.</span>
                </div>
              )}
            </div>

            {/* SAVE TO DECK ACTION BAR */}
            <div className="mt-4 pt-3.5 border-t border-amber-900/40 flex items-center justify-between gap-3 relative z-10">
              <div className="text-xs text-amber-400/70 font-[family-name:var(--font-cinzel)]">
                {isCurrentlyInDeck ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Card Inscribed in My Deck</span>
                  </span>
                ) : (
                  <span>Ready to preserve in grimoire</span>
                )}
              </div>

              {/* Save to Deck button */}
              <button
                onClick={handleSaveToDeck}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide flex items-center gap-2 transition-all cursor-pointer font-[family-name:var(--font-cinzel)] shadow-md ${
                  isCurrentlyInDeck || justSavedToDeck
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 shadow-emerald-950/50'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-amber-300/80 shadow-amber-950/60'
                }`}
                aria-label="Save to Deck"
              >
                {isCurrentlyInDeck || justSavedToDeck ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                    <span>Saved to Deck</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-slate-950" />
                    <span>Save to Deck</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* PROMINENT BUTTON: Generate Character (Rolls a new hero with unique stats) */}
        <div className="mt-5 sm:mt-6 flex flex-col items-center gap-2 w-full max-w-xl relative z-10">
          <button
            onClick={generateNewCharacter}
            className="w-full sm:w-auto min-w-[260px] px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-[#120e0a] font-black text-base tracking-widest shadow-xl shadow-amber-950/80 hover:shadow-amber-600/30 hover:brightness-110 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer group border border-amber-300/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0a08]"
            aria-label="Generate Character"
          >
            <RotateCw className={`w-5 h-5 text-[#120e0a] transition-transform duration-300 ${isRollingCharacter ? 'rotate-180' : 'group-hover:rotate-45'}`} />
            <span className="font-[family-name:var(--font-cinzel)] font-black tracking-widest text-base sm:text-lg uppercase">
              Generate Character
            </span>
          </button>

          <p className="text-xs text-amber-400/60 text-center flex items-center gap-1.5 font-[family-name:var(--font-cinzel)]">
            <span>🜄</span>
            <span>Generates a new character with randomized attributes</span>
            <span>🜂</span>
          </p>
        </div>

        {/* MY DECK SECTION: Display Saved Characters as Compact Cards */}
        <section id="my-deck" className="mt-12 sm:mt-16 w-full max-w-4xl relative z-10 border-t-2 border-amber-900/40 pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400/90 font-medium font-[family-name:var(--font-cinzel)] mb-0.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Grimoire Collection</span>
              </div>
              <h2 className="text-2xl font-bold text-amber-100 font-[family-name:var(--font-cinzel)] tracking-tight">
                My Deck ({myDeck.length} {myDeck.length === 1 ? 'Card' : 'Cards'})
              </h2>
            </div>

            {myDeck.length > 0 && (
              <p className="text-xs text-amber-400/60">
                Cards persist in your grimoire while exploring the realms.
              </p>
            )}
          </div>

          {/* Saved Cards Grid or Empty State */}
          {myDeck.length === 0 ? (
            <div className="rounded-2xl border border-amber-800/40 bg-[#16110d]/70 p-8 text-center backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-[#201812] border border-amber-700/50 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Bookmark className="w-7 h-7 text-amber-600/70" />
              </div>
              <h3 className="text-base font-semibold text-amber-200 font-[family-name:var(--font-cinzel)]">
                Your Deck is Currently Empty
              </h3>
              <p className="text-xs text-amber-400/70 mt-1.5 max-w-md mx-auto leading-relaxed">
                Generate an adventurer in the crucible above, customize their portrait and backstory, then tap <strong className="text-amber-300">"Save to Deck"</strong> to bind them into your grimoire.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myDeck.map((card) => {
                const config = CLASS_CONFIG[card.characterClass] || CLASS_CONFIG.Warrior;
                const Icon = config.icon;

                return (
                  <div 
                    key={card.id}
                    className="relative rounded-xl border border-amber-700/50 bg-gradient-to-b from-[#1c1510] via-[#16110d] to-[#100d0a] p-4 shadow-lg hover:border-amber-500/60 transition-all flex flex-col justify-between group"
                  >
                    {/* Top Row: Class & Remove Button */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${config.badgeBg} ${config.badgeBorder} ${config.color} font-[family-name:var(--font-cinzel)]`}>
                          <Icon className="w-3 h-3" />
                          <span>{card.characterClass}</span>
                        </div>

                        {/* Remove from Deck button */}
                        <button
                          onClick={() => handleRemoveFromDeck(card.id)}
                          className="p-1 rounded-md text-amber-500/70 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer"
                          title="Remove from Deck"
                          aria-label={`Remove ${card.name} from Deck`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Portrait Thumbnail & Name Lockup */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-600/40 bg-[#0e0b08] shrink-0 flex items-center justify-center shadow-inner">
                          {card.portraitUrl ? (
                            <img 
                              src={card.portraitUrl} 
                              alt={card.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${config.fallbackGradient} flex items-center justify-center`}>
                              <Icon className={`w-6 h-6 ${config.color}`} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-bold text-amber-100 font-[family-name:var(--font-decorative)] tracking-wide truncate">
                            {card.name}
                          </h4>
                          <span className="text-[11px] text-amber-400/70 font-[family-name:var(--font-cinzel)] block truncate">
                            {config.roleLabel}
                          </span>
                        </div>
                      </div>

                      {/* 3 Stats Bar in Compact Card */}
                      <div className="grid grid-cols-3 gap-1.5 bg-[#120d09] border border-amber-900/50 rounded-lg p-1.5 mb-3 text-center">
                        <div>
                          <div className="text-[9px] text-rose-400 font-semibold font-[family-name:var(--font-cinzel)]">HP</div>
                          <div className="text-xs font-bold text-rose-200 font-mono tabular-nums">{card.stats.health}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-indigo-400 font-semibold font-[family-name:var(--font-cinzel)]">MP</div>
                          <div className="text-xs font-bold text-indigo-200 font-mono tabular-nums">{card.stats.mana}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-amber-400 font-semibold font-[family-name:var(--font-cinzel)]">STR</div>
                          <div className="text-xs font-bold text-amber-200 font-mono tabular-nums">{card.stats.strength}</div>
                        </div>
                      </div>

                      {/* Backstory excerpt */}
                      <p className="text-[11px] font-serif italic text-amber-200/80 line-clamp-2 leading-relaxed mb-3">
                        "{card.backstory}"
                      </p>
                    </div>

                    {/* Card Actions: View in Workbench */}
                    <div className="pt-2 border-t border-amber-900/40 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleInspectDeckCard(card)}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#201812] hover:bg-[#2b2018] text-amber-200 text-xs font-medium border border-amber-700/50 hover:border-amber-500/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-[family-name:var(--font-cinzel)]"
                      >
                        <Wand2 className="w-3 h-3 text-amber-400" />
                        <span>Inspect in Crucible</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Alchemist Workbench Footer */}
      <footer className="relative z-10 border-t border-amber-900/40 bg-[#100d0a]/90 py-3.5 px-6 text-center text-xs text-amber-400/60 font-[family-name:var(--font-cinzel)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Ancient Alchemist's Workbench · Interactive Fantasy Player Cards</span>
          </div>
          <div className="flex items-center gap-3 text-amber-400/70 text-[11px]">
            <span>Mage</span>
            <span>·</span>
            <span>Rogue</span>
            <span>·</span>
            <span>Warrior</span>
            <span>·</span>
            <span>Paladin</span>
            <span>·</span>
            <span>Ranger</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
