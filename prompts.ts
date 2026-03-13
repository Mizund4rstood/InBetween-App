import { Template, TemplateKey } from '@/types';

export const templates: Template[] = [
  { key: '3-good-things', name: '3 Good Things', description: 'Name three things that went well today', icon: '✨', promptCount: 3 },
  { key: 'senses-54321', name: 'Senses 5-4-3-2-1', description: 'Ground yourself through your senses', icon: '🌿', promptCount: 5 },
  { key: 'reframe', name: 'Reframe', description: 'Find silver linings in challenges', icon: '🔄', promptCount: 3 },
  { key: 'micro-wins', name: 'Micro-Wins', description: 'Celebrate small victories', icon: '🏆', promptCount: 5 },
  { key: 'people-support', name: 'People & Support', description: 'Appreciate your support network', icon: '💛', promptCount: 4 },
  { key: 'values', name: 'Values', description: 'Connect with what matters most', icon: '🧭', promptCount: 3 },
  { key: 'acts-of-kindness', name: 'Acts of Kindness', description: 'Recall kind moments given or received', icon: '🤲', promptCount: 4 },
  { key: 'body-gratitude', name: 'Body Gratitude', description: 'Thank your body for what it does', icon: '💪', promptCount: 4 },
  { key: 'nature', name: 'Nature', description: 'Appreciate the natural world', icon: '🌸', promptCount: 4 },
  { key: 'tomorrow', name: 'Tomorrow I\'m Grateful For…', description: 'Look forward with gratitude', icon: '🌅', promptCount: 3 },
];

export const promptLibrary: Record<TemplateKey, string[]> = {
  '3-good-things': [
    'Something that made you smile today',
    'A moment of peace you experienced',
    'Something you accomplished, no matter how small',
    'A kind word someone said to you',
    'Something beautiful you noticed',
    'A problem that resolved itself',
    'A meal or drink you enjoyed',
    'A conversation that lifted you',
    'Something that went better than expected',
    'A moment you felt truly present',
  ],
  'senses-54321': [
    '5 things you can see right now',
    '4 things you can touch or feel',
    '3 things you can hear',
    '2 things you can smell',
    '1 thing you can taste',
    'The color of the sky right now',
    'The texture of what you\'re sitting on',
    'A distant sound you can identify',
    'The scent of the room around you',
    'The last thing you ate and how it tasted',
  ],
  'reframe': [
    'A challenge that taught you something',
    'A setback that redirected you somewhere better',
    'A mistake that led to unexpected growth',
    'Something difficult that made you stronger',
    'A "no" that eventually became a gift',
    'A loss that helped you appreciate what remains',
    'An uncomfortable situation that expanded your comfort zone',
    'A criticism that helped you improve',
  ],
  'micro-wins': [
    'Something you finished today',
    'A healthy choice you made',
    'A moment you showed up for yourself',
    'A small habit you maintained',
    'A decision you made that felt right',
    'Something you did that your past self would be proud of',
    'A boundary you respected',
    'A fear you faced, even slightly',
    'Something you learned today',
    'A moment you chose patience',
  ],
  'people-support': [
    'Someone who always listens',
    'A friend who makes you laugh',
    'A family member who supports you',
    'A colleague who helped you',
    'Someone who believed in you',
    'A mentor or teacher who shaped you',
    'A stranger who showed you kindness',
    'Someone who forgave you',
    'A person who inspires you',
    'Someone you can be yourself around',
  ],
  'values': [
    'A value you honored today',
    'Something you stand for that gives you strength',
    'A principle that guides your decisions',
    'A belief that brings you comfort',
    'Something about your character you\'re proud of',
    'A tradition or practice that grounds you',
  ],
  'acts-of-kindness': [
    'Something kind you did for someone',
    'A kindness someone showed you recently',
    'A random act of kindness you witnessed',
    'Someone who goes out of their way for others',
    'A time you helped without being asked',
    'A compliment you gave or received',
    'A moment of generosity',
    'A time you chose compassion over judgment',
  ],
  'body-gratitude': [
    'Your lungs for breathing without effort',
    'Your legs for carrying you today',
    'Your hands for everything they create',
    'Your eyes for the beauty they show you',
    'Your heart for beating steadily',
    'Your body for healing when it\'s hurt',
    'Your senses for connecting you to the world',
    'Your ability to feel warmth, comfort, or pleasure',
  ],
  'nature': [
    'The sunrise or sunset today',
    'Fresh air you breathed',
    'Trees, plants, or flowers you noticed',
    'An animal that brought you joy',
    'The sound of rain, wind, or birds',
    'Clean water you had access to',
    'The warmth of sunlight on your skin',
    'The beauty of the sky, clouds, or stars',
    'A season you enjoy and why',
    'A natural place that brings you peace',
  ],
  'tomorrow': [
    'Something you\'re looking forward to tomorrow',
    'A person you\'ll get to see or talk to',
    'An opportunity tomorrow holds',
    'The rest tonight that will restore you',
    'A fresh start tomorrow morning',
    'A routine you enjoy and can repeat',
    'The potential for unexpected joy',
    'A goal you\'re one day closer to',
  ],
};

export function generatePrompts(templateKey: TemplateKey, count?: number): string[] {
  const pool = promptLibrary[templateKey];
  const template = templates.find(t => t.key === templateKey);
  const n = count ?? template?.promptCount ?? 5;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, pool.length));
}

export function generateMixedPrompts(count: number = 10): string[] {
  const allPrompts: string[] = [];
  const keys = Object.keys(promptLibrary) as TemplateKey[];
  keys.forEach(key => {
    promptLibrary[key].forEach(p => allPrompts.push(p));
  });
  const shuffled = allPrompts.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
