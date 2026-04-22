import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SceneData {
  imagePrompt: string;
  videoPrompt: string;
  voiceOver: string;
}

export async function generateCinematicSequence(params: {
  creatureType: string;
  armorStyle: string;
  action: string;
  environment: string;
  weapons: string;
  lighting: string;
  mood: string;
  camera: string;
  sceneCount: number;
}): Promise<SceneData[]> {
  const prompt = `Create a cinematic 3D animated sequence with exactly ${params.sceneCount} scenes.

Main subject:
anthropomorphic ${params.creatureType} wearing ${params.armorStyle}

CHARACTER CONSISTENCY (CRITICAL):
- The character's physical features, proportions, and armor design MUST remain identical across all scenes.
- If the character is realistic, it must stay realistic. If it is stylized, it must stay stylized.
- Do not change the character's species, color palette, or armor materials between scenes.
- Treat this as a single continuous take or a single movie production where the actor and costume do not change.

Context:
${params.action} in ${params.environment}, using ${params.weapons}, with ${params.lighting} lighting and ${params.mood} atmosphere.

STORY STRUCTURE (AUTO-SCALING):
- Scene 1: introduce the world with a wide establishing shot
- Scene progression: gradually increase tension, movement, and action intensity
- Final Scene (Scene ${params.sceneCount}): deliver a strong climax or emotional ending

For ALL scenes:
- Each scene MUST have a unique action (no repetition)
- Actions must evolve logically (calm → tension → action → climax → resolution)
- Each scene must include a different body pose, motion, and camera angle
- Camera style: ${params.camera}
- Maintain consistent character design, armor, and environment continuity

ACTION VARIATION:
Each scene should naturally include different actions such as:
walking, observing, turning, preparing, gripping weapon, signaling, running, charging, jumping, attacking, blocking, striking, falling, recovering, or standing victorious.

OUTPUT REQUIREMENTS:
For EACH scene, generate:
1. Image prompt → one continuous cinematic sentence. It MUST start by describing the same ${params.creatureType} in ${params.armorStyle} to ensure visual consistency.
2. Video prompt → describe motion, camera movement, and environment effects
3. Voice-over → one short, powerful cinematic line (1–2 sentences)

QUALITY:
- cinematic storytelling
- smooth transitions between scenes
- increasing pacing toward climax
- no repeated phrases or actions
- Unreal Engine 5 style, ultra detailed, 8k
- no text, no watermark

Format the output as a JSON array of objects with keys: "imagePrompt", "videoPrompt", "voiceOver". 
Return ONLY the JSON array. Do not include markdown formatting like \`\`\`json.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as SceneData[];
  } catch (error) {
    console.error("Error generating cinematic sequence:", error);
    throw error;
  }
}
