import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Shared server-side GoogleGenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for cartoon / video-game fantasy portrait generation
app.post('/api/generate-portrait', async (req, res) => {
  const { name, characterClass, seed } = req.body;

  if (!name || !characterClass) {
    return res.status(400).json({ error: 'Character name and class are required.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured in the server environment.',
      details: 'Please ensure your Gemini API key is configured in the AI Studio Settings > Secrets panel.'
    });
  }

  try {
    const classVisualTraits: Record<string, string> = {
      Mage: 'arcane scholar robes, glowing magical runes, floating mystic orbs, staff or hovering grimoire',
      Rogue: 'dark leather cowl, agile posture, stealthy expression, twin enchanted daggers, emerald shadows',
      Warrior: 'ornate steel armor plate, valiant expression, broad shoulders, heroic greatsword or battleaxe',
      Paladin: 'radiant blessed gold armor, glowing holy shield, majestic aura, warm divine solar halos',
      Ranger: 'forest green leather cloak, longbow, feathered quiver, keen marksman gaze, autumn woodland motifs'
    };

    const visualTraits = classVisualTraits[characterClass] || 'heroic fantasy adventurer armor and equipment';
    const variation = seed ? `Variation index ${seed}: ` : '';

    const prompt = `A colorful cartoon and video-game style fantasy character bust portrait of ${name}, a legendary ${characterClass}. ${visualTraits}. ${variation}Expressive cartoon character design, vibrant digital game art, bold outlines, cel-shaded fantasy illustration, clean neutral dark background, highly polished, centered composition, no text labels, no interface borders.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    let imageUrl: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const base64EncodeString: string = part.inlineData.data;
        const mime = part.inlineData.mimeType ?? 'image/png';
        imageUrl = `data:${mime};base64,${base64EncodeString}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ 
        error: 'The AI model completed the request but did not return image data.',
        details: 'The model may have produced a text-only response.'
      });
    }

    return res.json({ imageUrl });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error generating portrait:', errorMsg);
    return res.status(500).json({
      error: 'Failed to generate fantasy portrait.',
      details: errorMsg
    });
  }
});

// Curated origin templates for procedural fallback when API key is unavailable or fails
const FALLBACK_BACKSTORIES: Record<string, string[]> = {
  Mage: [
    "{name} discovered their arcane aptitude amidst the burning ruins of an ancient Solarium library, unlocking the dormant constellation runes etched into their very bloodline. Now, they wander the realm weaving forgotten incantations to hold the impending void at bay.",
    "Born beneath the convergence of three eclipsing moons, {name} was apprenticed to the reclusive Stargazers of Aethelgard. Their quietest whisper now commands the primal elements, transmuting fleeting thoughts into searing astral flame.",
    "After transmuting a shard of crystallized starlight in a master alchemist's crucible, {name} unlocked the forbidden language of the cosmos. Few can comprehend the mysteries they bear, but all revere the raw celestial power dancing at their fingertips.",
    "Raised within the ivory spire of the Whispering Spires, {name} spent decades decoding the ancient scrolls of the Primordial Weave. Their staff crackles with living arcane lightning, bound by a solemn vow to restore balance to the shattered kingdoms."
  ],
  Rogue: [
    "{name} honed their lethal dexterity in the shadowed catacombs beneath the merchant citadels, slipping past royal sentries like an evening mist. Behind every locked vault and whispered secret lies an ambition only their twin daggers can fulfill.",
    "Once an elusive courier through the treacherous alleys of the Sunken Quarter, {name} learned that silence was deadlier than any drawn blade. They now operate between the flickering lanterns of the underworld, answering only to the code of the unseen.",
    "Trained by the secretive Gilded Mask Syndicate, {name} vanished from official court scrolls before their tenth winter. Whispers say they can pick a vault lock with a stray feather and melt into the shadows without disturbing a single cobweb.",
    "{name} survived the deadly labyrinth of the Blackwater Smugglers by outwitting rival cutpurses and outrunning the city watch. Today, they strike with calculating precision, leaving only emerald-edged rumors in their wake."
  ],
  Warrior: [
    "{name} forged their unbreakable resolve on the frozen slopes of the Iron Spire, standing as the lone bulwark against a rampaging frost titan. Their battle-scarred greatblade has turned the tide of countless sieges, heralded by the thunder of resolute steel.",
    "Heir to the broken banner of the Lionheart Vanguard, {name} survived a disastrous royal campaign through sheer grit and ferocious discipline. Wherever tyranny rises, their heavy blade falls with the righteous fury of an unyielding champion.",
    "Raised in the thunderous forge-halls of the mountain clans, {name} wields weaponcraft as both an art of survival and an oath of honor. Each notch upon their weathered armor commemorates a warlord bested in honorable combat.",
    "{name} was tempered in the brutal gladiatorial pits of the Crimson Sands, earning freedom not with words, but through peerless mastery of the blade. They fight now as a champion of the downtrodden, unbending before any mortal host."
  ],
  Paladin: [
    "{name} took the solemn Oath of the Dawnbringer atop the sacred summit of Mount Solaris, bathing their armor in consecrated light. Empowered by divine radiance, they march fearlessly into the darkest catacombs to shield the innocent from creeping blight.",
    "Chosen by the celestial order after an angelic vision spared their burning home, {name} wields the brilliant aurum shield of the dawn. Their unwavering conviction channels holy light capable of mending mortal wounds and banishing demonic legions.",
    "Bearing the sacred relic of the First Sun, {name} wanders the fractured kingdoms to enforce divine justice and rekindle dying hopes. Even in the deepest subterranean gloom, their radiant beacon shatters malice with blinding grace.",
    "{name} was anointed by the High Arbiters of the Golden Spire following an act of supreme self-sacrifice during the plague wars. Guided by unwavering duty, their presence alone rallies weary allies and dispels ancient curses."
  ],
  Ranger: [
    "{name} was raised by the elder wardens of the Whisperwood, learning to read the language of the wind and the rustle of predator footsteps. With an enchanted yew longbow in hand, no beast or marauder crosses their sanctuary unseen.",
    "Navigating the perilous bogs of the Mistveiled Wilds, {name} mastered the ancient craft of the woodland trackers. Their arrows strike with phantom speed from the treetops before the quarry ever senses danger.",
    "{name} spent seasons tracking the great storm gryphons across the jagged crags of the Wyrmtooth Range. Bound in pact with the wild spirits of the forest, their vigil keeps the untamed borders secure from encroaching darkness.",
    "Orphaned in the deep timber of the Elderwood, {name} grew alongside the direwolves and learned to strike like a sudden squall. Their keen eye can trace a footprint over solid stone and find the heart of any foe from hundreds of paces."
  ]
};

// API endpoint for generating 1-to-2-sentence fantasy backstory
app.post('/api/generate-backstory', async (req, res) => {
  const { name, characterClass } = req.body;

  if (!name || !characterClass) {
    return res.status(400).json({ error: 'Character name and class are required.' });
  }

  // Attempt AI generation if GEMINI_API_KEY is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Write a unique, atmospheric 1-to-2-sentence fantasy origin story for a ${characterClass} named ${name}. Evocative, elegant, matching an ancient alchemical fantasy world. Must explicitly include the name "${name}" and highlight their role as a ${characterClass}. Return ONLY the 1-2 sentence story. Do not include markdown formatting, quotes, or any prefix.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const storyText = response.text?.trim();
      if (storyText) {
        // Strip any residual quotes if returned
        const cleanedStory = storyText.replace(/^["']|["']$/g, '');
        return res.json({ backstory: cleanedStory });
      }
    } catch (err: unknown) {
      console.warn('AI backstory generation fell back to procedural library:', err instanceof Error ? err.message : err);
      // Fall through to procedural fallback
    }
  }

  // Procedural fallback using character's actual name and class
  const classPool = FALLBACK_BACKSTORIES[characterClass] || FALLBACK_BACKSTORIES.Warrior;
  const template = classPool[Math.floor(Math.random() * classPool.length)];
  const backstory = template.replace(/\{name\}/g, name);

  return res.json({ backstory });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
