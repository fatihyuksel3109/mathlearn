import { shuffle } from './utils';

export interface RaceQuestion {
  a: number;
  b: number;
  op: string;
  result: number;
  options: number[];
}

export function generateRaceQuestion(level: number): RaceQuestion {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];

  const maxValue = 20 + level * 5;
  const a = Math.floor(Math.random() * maxValue) + 1;
  let b: number;
  let result: number;

  if (op === '+') {
    b = Math.floor(Math.random() * maxValue) + 1;
    result = a + b;
  } else if (op === '-') {
    b = Math.floor(Math.random() * a) + 1;
    result = a - b;
  } else {
    // ×
    b = Math.floor(Math.random() * 10) + 1;
    result = a * b;
  }

  const wrongOptions = [
    result + Math.floor(Math.random() * 10) + 1,
    result - Math.floor(Math.random() * 10) - 1,
    result + Math.floor(Math.random() * 20) + 5,
  ].filter((opt) => opt !== result && opt > 0);

  const options = shuffle([result, ...wrongOptions.slice(0, 3)]);

  return { a, b, op, result, options };
}

export function calculateXP(correct: number): number {
  return correct * 10;
}

export function generateBalloonQuestion(level: number): RaceQuestion {
  return generateRaceQuestion(level);
}

export function generateFractionQuestion() {
  const denominator = Math.floor(Math.random() * 4) + 2; // 2-5
  const numerator = Math.floor(Math.random() * denominator) + 1; // 1 to denominator-1
  return { numerator, denominator };
}

export function generateWordProblem(t: (key: string, values?: any) => string, messages: any, locale: string = 'en') {
  // Get locale-specific data from translations
  const names = (messages?.wordProblems?.names?.[locale] || messages?.wordProblems?.names?.en) as string[] || [];
  const items = (messages?.wordProblems?.items?.[locale] || messages?.wordProblems?.items?.en) as string[] || [];
  const itemsPlural = (messages?.wordProblems?.itemsPlural?.[locale] || messages?.wordProblems?.itemsPlural?.en) as string[] || [];

  // Helper function to get translation from messages object
  const getTranslation = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key; // Return key if not found
    }
    return typeof value === 'string' ? value : key;
  };

  // Helper function to add Turkish accusative case suffix (-i, -ı, -u, -ü)
  const addTurkishAccusative = (word: string): string => {
    if (locale !== 'tr') return word;
    
    const lastChar = word[word.length - 1];
    const vowels = 'aeıioöuü';
    const isVowel = vowels.includes(lastChar.toLowerCase());
    
    // If ends with vowel, add -yi, -yı, -yu, -yü
    if (isVowel) {
      if ('aı'.includes(lastChar.toLowerCase())) return word + 'yı';
      if ('ei'.includes(lastChar.toLowerCase())) return word + 'yi';
      if ('ou'.includes(lastChar.toLowerCase())) return word + 'yu';
      if ('öü'.includes(lastChar.toLowerCase())) return word + 'yü';
    }
    
    // If ends with consonant, add -i, -ı, -u, -ü based on vowel harmony
    const lastVowel = word.split('').reverse().find(c => vowels.includes(c.toLowerCase()));
    if (!lastVowel) return word + 'i'; // fallback
    
    // Hard consonants that soften: p→b, ç→c, t→d, k→ğ
    const hardConsonants: Record<string, string> = { 'p': 'b', 'ç': 'c', 't': 'd', 'k': 'ğ' };
    let base = word;
    if (hardConsonants[lastChar.toLowerCase()]) {
      base = word.slice(0, -1) + hardConsonants[lastChar.toLowerCase()];
    }
    
    // Add suffix based on last vowel
    if ('aı'.includes(lastVowel.toLowerCase())) return base + 'ı';
    if ('ei'.includes(lastVowel.toLowerCase())) return base + 'i';
    if ('ou'.includes(lastVowel.toLowerCase())) return base + 'u';
    if ('öü'.includes(lastVowel.toLowerCase())) return base + 'ü';
    
    return word + 'i'; // fallback
  };

  // Problem templates with placeholders
  const problemTemplates: Array<{
    type: string;
    storyTemplate: (...args: any[]) => string;
    questionTemplate: (...args: any[]) => string;
    generate: () => any;
  }> = [
    {
      type: 'subtraction',
      storyTemplate: (a: number, b: number, name: string, item: string, friend: string) => {
        const template = getTranslation('wordProblems.subtraction.storyTemplate');
        const itemWithAccusative = addTurkishAccusative(item);
        return template
          .replace(/{name}/g, name)
          .replace(/{a}/g, a.toString())
          .replace(/{b}/g, b.toString())
          .replace(/{item}/g, itemWithAccusative)
          .replace(/{friend}/g, friend);
      },
      questionTemplate: (name: string, item: string) => {
        const template = getTranslation('wordProblems.subtraction.questionTemplate');
        const itemWithAccusative = addTurkishAccusative(item);
        return template.replace(/{name}/g, name).replace(/{item}/g, itemWithAccusative);
      },
      generate: () => {
        const friendOptions = (messages?.wordProblems?.subtraction?.friend?.[locale] || messages?.wordProblems?.subtraction?.friend?.en) as string[] || [];
        const name = names[Math.floor(Math.random() * names.length)];
        const item = items[Math.floor(Math.random() * items.length)];
        const a = Math.floor(Math.random() * 15) + 5; // 5-19
        const b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
        const answer = a - b;
        const friend = friendOptions[Math.floor(Math.random() * friendOptions.length)];
        return { name, item, a, b, answer, friend };
      }
    },
    {
      type: 'addition',
      storyTemplate: (a: number, b: number, name: string, item: string, action: string) => {
        const template = getTranslation('wordProblems.addition.storyTemplate');
        const itemWithAccusative = addTurkishAccusative(item);
        return template
          .replace(/{name}/g, name)
          .replace(/{a}/g, a.toString())
          .replace(/{b}/g, b.toString())
          .replace(/{item}/g, itemWithAccusative)
          .replace(/{action}/g, action);
      },
      questionTemplate: (name: string, item: string) => {
        const template = getTranslation('wordProblems.addition.questionTemplate');
        const itemWithAccusative = addTurkishAccusative(item);
        return template.replace(/{name}/g, name).replace(/{item}/g, itemWithAccusative);
      },
      generate: () => {
        const actionOptions = (messages?.wordProblems?.addition?.action?.[locale] || messages?.wordProblems?.addition?.action?.en) as string[] || [];
        const name = names[Math.floor(Math.random() * names.length)];
        const item = items[Math.floor(Math.random() * items.length)];
        const a = Math.floor(Math.random() * 15) + 3; // 3-17
        const b = Math.floor(Math.random() * 12) + 2; // 2-13
        const answer = a + b;
        const action = actionOptions[Math.floor(Math.random() * actionOptions.length)];
        return { name, item, a, b, answer, action };
      }
    },
    {
      type: 'division',
      storyTemplate: (a: number, b: number, name: string, item: string, action: string, people: string) => {
        const template = getTranslation('wordProblems.division.storyTemplate');
        const itemWithAccusative = addTurkishAccusative(item);
        return template
          .replace(/{name}/g, name)
          .replace(/{a}/g, a.toString())
          .replace(/{b}/g, b.toString())
          .replace(/{item}/g, itemWithAccusative)
          .replace(/{action}/g, action)
          .replace(/{people}/g, people);
      },
      questionTemplate: (name: string, item: string) => {
        const template = getTranslation('wordProblems.division.questionTemplate');
        const itemWithAccusative = addTurkishAccusative(item);
        return template.replace(/{item}/g, itemWithAccusative);
      },
      generate: () => {
        const actionOptions = (messages?.wordProblems?.division?.action?.[locale] || messages?.wordProblems?.division?.action?.en) as string[] || [];
        const peopleOptions = (messages?.wordProblems?.division?.people?.[locale] || messages?.wordProblems?.division?.people?.en) as string[] || [];
        const name = names[Math.floor(Math.random() * names.length)];
        const item = items[Math.floor(Math.random() * items.length)];
        const divisor = Math.floor(Math.random() * 4) + 2; // 2-5
        const answer = Math.floor(Math.random() * 5) + 2; // 2-6
        const a = answer * divisor; // Ensure it divides evenly
        const b = divisor;
        const action = actionOptions[Math.floor(Math.random() * actionOptions.length)];
        const people = peopleOptions[Math.floor(Math.random() * peopleOptions.length)];
        return { name, item, a, b, answer, action, people };
      }
    },
    {
      type: 'multiplication',
      storyTemplate: (a: number, b: number, name: string, item: string, container: string, containerSingular: string) => {
        const template = getTranslation('wordProblems.multiplication.storyTemplate');
        const itemWithAccusative = addTurkishAccusative(item);
        const containerWithAccusative = addTurkishAccusative(container);
        return template
          .replace(/{name}/g, name)
          .replace(/{a}/g, a.toString())
          .replace(/{b}/g, b.toString())
          .replace(/{item}/g, itemWithAccusative)
          .replace(/{container}/g, containerWithAccusative)
          .replace(/{containerSingular}/g, containerSingular);
      },
      questionTemplate: (name: string, item: string) => {
        const template = getTranslation('wordProblems.multiplication.questionTemplate');
        const itemWithAccusative = addTurkishAccusative(item);
        return template.replace(/{name}/g, name).replace(/{item}/g, itemWithAccusative);
      },
      generate: () => {
        const containerOptions = (messages?.wordProblems?.multiplication?.container?.[locale] || messages?.wordProblems?.multiplication?.container?.en) as string[] || [];
        const containerSingularOptions = (messages?.wordProblems?.multiplication?.containerSingular?.[locale] || messages?.wordProblems?.multiplication?.containerSingular?.en) as string[] || [];
        const name = names[Math.floor(Math.random() * names.length)];
        const item = items[Math.floor(Math.random() * items.length)];
        const a = Math.floor(Math.random() * 5) + 2; // 2-6
        const b = Math.floor(Math.random() * 6) + 2; // 2-7
        const answer = a * b;
        const containerIndex = Math.floor(Math.random() * containerOptions.length);
        const container = containerOptions[containerIndex];
        const containerSingular = containerSingularOptions[containerIndex];
        return { name, item, a, b, answer, container, containerSingular };
      }
    },
    {
      type: 'subtraction_count',
      storyTemplate: (a: number, b: number, name: string, item: string, location: string, action: string) => {
        const template = getTranslation('wordProblems.subtractionCount.storyTemplate');
        return template
          .replace(/{a}/g, a.toString())
          .replace(/{b}/g, b.toString())
          .replace(/{item}/g, item)
          .replace(/{location}/g, location)
          .replace(/{action}/g, action);
      },
      questionTemplate: (name: string, item: string) => {
        const template = getTranslation('wordProblems.subtractionCount.questionTemplate');
        const itemWithAccusative = addTurkishAccusative(item);
        return template.replace(/{item}/g, itemWithAccusative);
      },
      generate: () => {
        const locationOptions = (messages?.wordProblems?.subtractionCount?.location?.[locale] || messages?.wordProblems?.subtractionCount?.location?.en) as string[] || [];
        const actionOptions = (messages?.wordProblems?.subtractionCount?.action?.[locale] || messages?.wordProblems?.subtractionCount?.action?.en) as string[] || [];
        const item = itemsPlural[Math.floor(Math.random() * itemsPlural.length)];
        const a = Math.floor(Math.random() * 12) + 4; // 4-15
        const b = Math.floor(Math.random() * (a - 1)) + 1; // 1 to a-1
        const answer = a - b;
        const location = locationOptions[Math.floor(Math.random() * locationOptions.length)];
        const action = actionOptions[Math.floor(Math.random() * actionOptions.length)];
        return { name: '', item, a, b, answer, location, action };
      }
    }
  ];

  // Select a random problem type
  const template = problemTemplates[Math.floor(Math.random() * problemTemplates.length)];
  const data = template.generate();
  const { name, item, a, b, answer } = data;
  
  // Generate story and question using the appropriate template
  let story: string;
  let question: string;
  
  if (template.type === 'subtraction') {
    story = template.storyTemplate(a, b, name, item, (data as any).friend);
    question = template.questionTemplate(name, item);
  } else if (template.type === 'addition') {
    story = template.storyTemplate(a, b, name, item, (data as any).action);
    question = template.questionTemplate(name, item);
  } else if (template.type === 'division') {
    story = template.storyTemplate(a, b, name, item, (data as any).action, (data as any).people);
    question = template.questionTemplate(name, item);
  } else if (template.type === 'multiplication') {
    story = template.storyTemplate(a, b, name, item, (data as any).container, (data as any).containerSingular);
    question = template.questionTemplate(name, item);
  } else if (template.type === 'subtraction_count') {
    story = template.storyTemplate(a, b, name, item, (data as any).location, (data as any).action);
    question = template.questionTemplate(name, item);
  } else {
    // Fallback
    story = '';
    question = '';
  }

  // Generate wrong answer options
  const wrongOptions = new Set<number>();
  while (wrongOptions.size < 3) {
    const wrong = answer + Math.floor(Math.random() * 10) - 5; // -5 to +5 from answer
    if (wrong !== answer && wrong > 0) {
      wrongOptions.add(wrong);
    }
  }

  // If we don't have enough wrong options, generate more
  while (wrongOptions.size < 3) {
    const wrong = Math.floor(Math.random() * 30) + 1;
    if (wrong !== answer) {
      wrongOptions.add(wrong);
    }
  }

  const options = shuffle([answer, ...Array.from(wrongOptions).slice(0, 3)]);

  return {
    story,
    question,
    answer,
    options,
  };
}

export function generateGeometryQuestion() {
  const shapes = [
    { name: 'triangle', sides: 3, description: '3 sides' },
    { name: 'square', sides: 4, description: '4 equal sides' },
    { name: 'circle', sides: 0, description: 'Round shape' },
  ];

  return shuffle(shapes);
}

