import { shuffle } from './utils';

export type GeometryQuestionType =
  | 'identify'
  | 'property'
  | 'count'
  | 'compare'
  | 'area'
  | '3d'
  | 'odd';

export interface GeometryQuestion {
  type: GeometryQuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  hint?: string;
  imageHint?: string; // optional path to shape image (e.g., '/images/shapes/square.png')
}

type Locale = 'en' | 'tr' | (string & {});

type LocalizedLabel = {
  en: string;
  tr: string;
};

type Shape2D = {
  id: string;
  label: LocalizedLabel;
  sides: number;
  regular: boolean;
  rightAngles: boolean;
  isRound?: boolean;
  imageHint: string;
};

type Shape3D = {
  id: string;
  label: LocalizedLabel;
  faces: number;
  edges: number;
  isPrism: boolean;
  imageHint: string;
};

const SHAPES_2D: Shape2D[] = [
  {
    id: 'triangle',
    label: { en: 'Triangle', tr: 'Üçgen' },
    sides: 3,
    regular: false,
    rightAngles: false,
    imageHint: '/images/shapes/triangle.png',
  },
  {
    id: 'square',
    label: { en: 'Square', tr: 'Kare' },
    sides: 4,
    regular: true,
    rightAngles: true,
    imageHint: '/images/shapes/square.png',
  },
  {
    id: 'rectangle',
    label: { en: 'Rectangle', tr: 'Dikdörtgen' },
    sides: 4,
    regular: false,
    rightAngles: true,
    imageHint: '/images/shapes/rectangle.png',
  },
  {
    id: 'pentagon',
    label: { en: 'Pentagon', tr: 'Beşgen' },
    sides: 5,
    regular: true,
    rightAngles: false,
    imageHint: '/images/shapes/pentagon.png',
  },
  {
    id: 'hexagon',
    label: { en: 'Hexagon', tr: 'Altıgen' },
    sides: 6,
    regular: true,
    rightAngles: false,
    imageHint: '/images/shapes/hexagon.png',
  },
  {
    id: 'octagon',
    label: { en: 'Octagon', tr: 'Sekizgen' },
    sides: 8,
    regular: true,
    rightAngles: false,
    imageHint: '/images/shapes/octagon.png',
  },
  {
    id: 'circle',
    label: { en: 'Circle', tr: 'Daire' },
    sides: 0,
    regular: true,
    rightAngles: false,
    isRound: true,
    imageHint: '/images/shapes/circle.png',
  },
];

const SHAPES_3D: Shape3D[] = [
  {
    id: 'cube',
    label: { en: 'Cube', tr: 'Küp' },
    faces: 6,
    edges: 12,
    isPrism: true,
    imageHint: '/images/shapes/cube.png',
  },
  {
    id: 'rectangular_prism',
    label: { en: 'Rectangular prism', tr: 'Dikdörtgen prizma' },
    faces: 6,
    edges: 12,
    isPrism: true,
    imageHint: '/images/shapes/rectangular-prism.png',
  },
  {
    id: 'sphere',
    label: { en: 'Sphere', tr: 'Küre' },
    faces: 0,
    edges: 0,
    isPrism: false,
    imageHint: '/images/shapes/sphere.png',
  },
  {
    id: 'cylinder',
    label: { en: 'Cylinder', tr: 'Silindir' },
    faces: 3,
    edges: 2,
    isPrism: false,
    imageHint: '/images/shapes/cylinder.png',
  },
  {
    id: 'cone',
    label: { en: 'Cone', tr: 'Koni' },
    faces: 2,
    edges: 1,
    isPrism: false,
    imageHint: '/images/shapes/cone.png',
  },
  {
    id: 'square_pyramid',
    label: { en: 'Square pyramid', tr: 'Kare piramit' },
    faces: 5,
    edges: 8,
    isPrism: false,
    imageHint: '/images/shapes/square-pyramid.png',
  },
];

function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function getShapeName(shape: Shape2D | Shape3D, locale: Locale): string {
  return (shape.label[locale as 'en' | 'tr'] ?? shape.label.en) as string;
}

function generateIdentifyQuestion(locale: Locale): GeometryQuestion {
  const shape = getRandomItem(SHAPES_2D);

  const propertyVariants: Array<{
    question: string;
    match: (s: Shape2D) => boolean;
    hint: string;
  }> = [
    {
      question:
        locale === 'tr'
          ? 'Hangi şeklin 3 kenarı vardır?'
          : 'Which shape has 3 sides?',
      match: (s) => s.sides === 3,
      hint:
        locale === 'tr'
          ? 'Her şeklin kenarlarını tek tek say.'
          : 'Count the sides of each shape.',
    },
    {
      question:
        locale === 'tr'
          ? 'Hangi şeklin 4 eşit kenarı vardır?'
          : 'Which shape has 4 equal sides?',
      match: (s) => s.sides === 4 && s.regular,
      hint:
        locale === 'tr'
          ? 'Mükemmel kareye benzeyen şekle bak.'
          : 'Look for a perfect square.',
    },
    {
      question:
        locale === 'tr'
          ? 'Hangi şekil yuvarlaktır?'
          : 'Which shape is round?',
      match: (s) => !!s.isRound,
      hint:
        locale === 'tr'
          ? 'Hiç köşesi olmayan şekli bul.'
          : 'It has no corners at all.',
    },
    {
      question:
        locale === 'tr'
          ? 'Hangi şeklin 6 kenarı vardır?'
          : 'Which shape has 6 sides?',
      match: (s) => s.sides === 6,
      hint:
        locale === 'tr'
          ? 'Petek gözlerinin şekline benziyor.'
          : 'Think of a honeycomb cell.',
    },
  ];

  const variant = getRandomItem(propertyVariants);
  const candidates = SHAPES_2D.filter(variant.match);
  const correctShape = candidates.length ? getRandomItem(candidates) : shape;

  const wrongShapes = shuffle(
    SHAPES_2D.filter((s) => s.id !== correctShape.id),
  ).slice(0, 3);

  const options = [correctShape, ...wrongShapes].map((s) =>
    getShapeName(s, locale),
  );

  return {
    type: 'identify',
    question: variant.question,
    options,
    correctAnswer: getShapeName(correctShape, locale),
    hint: variant.hint,
    imageHint: correctShape.imageHint,
  };
}

function generatePropertyQuestion(locale: Locale): GeometryQuestion {
  const shape = getRandomItem(SHAPES_2D.filter((s) => s.sides > 0));

  const trueStatements: string[] = [];
  const falseStatements: string[] = [];

  if (shape.regular) {
    trueStatements.push(
      locale === 'tr'
        ? 'Tüm kenarlarının uzunluğu aynıdır.'
        : 'All sides are the same length.',
    );
  } else {
    falseStatements.push(
      locale === 'tr'
        ? 'Tüm kenarlarının uzunluğu aynıdır.'
        : 'All sides are the same length.',
    );
  }

  if (shape.rightAngles) {
    trueStatements.push(
      locale === 'tr'
        ? 'Dik açıları (kare köşeleri) vardır.'
        : 'It has right angles (square corners).',
    );
  } else {
    falseStatements.push(
      locale === 'tr'
        ? 'Dik açıları (kare köşeleri) vardır.'
        : 'It has right angles (square corners).',
    );
  }

  if (shape.sides === 3) {
    trueStatements.push(
      locale === 'tr'
        ? 'Üç düz kenardan oluşur.'
        : 'It is made of three straight sides.',
    );
  } else {
    falseStatements.push(
      locale === 'tr'
        ? 'Üç düz kenardan oluşur.'
        : 'It is made of three straight sides.',
    );
  }

  if (shape.id === 'circle') {
    trueStatements.push(
      locale === 'tr'
        ? 'Düz kenarı ve köşesi yoktur.'
        : 'It has no straight sides or corners.',
    );
  } else {
    falseStatements.push(
      locale === 'tr'
        ? 'Düz kenarı ve köşesi yoktur.'
        : 'It has no straight sides or corners.',
    );
  }

  const correctStatement = getRandomItem(trueStatements);
  const wrongOptions = shuffle(falseStatements).slice(0, 3);

  return {
    type: 'property',
    question:
      locale === 'tr'
        ? `${getShapeName(shape, locale)} hakkında hangi bilgi doğrudur?`
        : `Which fact is true about a ${getShapeName(
            shape,
            locale,
          ).toLowerCase()}?`,
    options: [correctStatement, ...wrongOptions],
    correctAnswer: correctStatement,
    hint:
      locale === 'tr'
        ? 'Kenarlarını ve köşelerini düşün.'
        : 'Think about its sides and corners.',
    imageHint: shape.imageHint,
  };
}

function generateCountQuestion(locale: Locale): GeometryQuestion {
  const shape = getRandomItem(SHAPES_2D.filter((s) => s.sides > 0));
  const correct = shape.sides;

  const wrongSet = new Set<number>();
  while (wrongSet.size < 3) {
    const delta = Math.floor(Math.random() * 3) + 1;
    const candidate =
      Math.random() < 0.5 ? correct + delta : Math.max(1, correct - delta);
    if (candidate !== correct) {
      wrongSet.add(candidate);
    }
  }

  const options = [correct, ...Array.from(wrongSet)].map((n) => n.toString());

  return {
    type: 'count',
    question:
      locale === 'tr'
        ? `${getShapeName(shape, locale)} kaç kenarlıdır?`
        : `How many sides does a ${getShapeName(
            shape,
            locale,
          ).toLowerCase()} have?`,
    options,
    correctAnswer: correct.toString(),
    hint:
      locale === 'tr'
        ? 'Hayal et veya çiz ve her kenarı say.'
        : 'Imagine or draw it and count each side.',
    imageHint: shape.imageHint,
  };
}

function generateCompareQuestion(locale: Locale): GeometryQuestion {
  const [shapeA, shapeB] = shuffle(
    SHAPES_2D.filter((s) => s.sides > 0),
  ).slice(0, 2);

  const moreSidesShape = shapeA.sides > shapeB.sides ? shapeA : shapeB;
  const lessSidesShape = shapeA.sides > shapeB.sides ? shapeB : shapeA;

  const askForMore = Math.random() < 0.5;
  const nameA = getShapeName(shapeA, locale);
  const nameB = getShapeName(shapeB, locale);
  const question = askForMore
    ? locale === 'tr'
      ? `Hangi şeklin daha çok kenarı var: ${nameA} mı yoksa ${nameB} mi?`
      : `Which shape has more sides: ${nameA.toLowerCase()} or ${nameB.toLowerCase()}?`
    : locale === 'tr'
      ? `Hangi şeklin daha az kenarı var: ${nameA} mı yoksa ${nameB} mi?`
      : `Which shape has fewer sides: ${nameA.toLowerCase()} or ${nameB.toLowerCase()}?`;

  const correctShape = askForMore ? moreSidesShape : lessSidesShape;

  const distractor = getRandomItem(
    SHAPES_2D.filter(
      (s) => s.id !== shapeA.id && s.id !== shapeB.id && s.sides > 0,
    ),
  );

  const options = shuffle([
    getShapeName(shapeA, locale),
    getShapeName(shapeB, locale),
    getShapeName(distractor, locale),
  ]);

  return {
    type: 'compare',
    question,
    options,
    correctAnswer: getShapeName(correctShape, locale),
    hint:
      locale === 'tr'
        ? 'Şekillerin kenar sayılarını karşılaştır.'
        : 'Compare the number of sides of each shape.',
    imageHint: correctShape.imageHint,
  };
}

function generateAreaQuestion(locale: Locale): GeometryQuestion {
  const shape =
    Math.random() < 0.5
      ? SHAPES_2D.find((s) => s.id === 'square')!
      : SHAPES_2D.find((s) => s.id === 'rectangle')!;

  const sideA = Math.floor(Math.random() * 8) + 2;
  const sideB =
    shape.id === 'square' ? sideA : Math.floor(Math.random() * 8) + 2;

  const askPerimeter = Math.random() < 0.5;

  let correct: number;
  let question: string;
  let hint: string;

  if (askPerimeter) {
    correct = shape.id === 'square' ? 4 * sideA : 2 * (sideA + sideB);
    question =
      shape.id === 'square'
        ? locale === 'tr'
          ? `Karenin her kenarı ${sideA} cm. Karenin çevresi kaç cm'dir?`
          : `Each side of the square is ${sideA} cm. What is the perimeter of the square?`
        : locale === 'tr'
          ? `Bir dikdörtgenin uzun kenarı ${sideA} cm, kısa kenarı ${sideB} cm. Çevresi kaç cm'dir?`
          : `A rectangle is ${sideA} cm long and ${sideB} cm wide. What is its perimeter?`;
    hint =
      locale === 'tr'
        ? 'Çevre, şeklin etrafındaki toplam uzunluktur.'
        : 'Perimeter is the distance all the way around the shape.';
  } else {
    correct = sideA * sideB;
    question =
      shape.id === 'square'
        ? locale === 'tr'
          ? `Karenin her kenarı ${sideA} cm. Karenin alanı kaç cm²'dir?`
          : `Each side of the square is ${sideA} cm. What is the area of the square?`
        : locale === 'tr'
          ? `Bir dikdörtgenin uzun kenarı ${sideA} cm, kısa kenarı ${sideB} cm. Alanı kaç cm²'dir?`
          : `A rectangle is ${sideA} cm long and ${sideB} cm wide. What is its area?`;
    hint =
      locale === 'tr'
        ? 'Alan, şeklin içini kaplayan karelerin sayısı gibidir.'
        : 'Area is how many square units cover the inside.';
  }

  const wrongSet = new Set<number>();
  while (wrongSet.size < 3) {
    const delta =
      (Math.floor(Math.random() * 4) + 1) * (Math.random() < 0.5 ? -1 : 1);
    const candidate = correct + delta;
    if (candidate > 0 && candidate !== correct) {
      wrongSet.add(candidate);
    }
  }

  const options = [correct, ...Array.from(wrongSet)].map((n) => `${n} cm`);

  return {
    type: 'area',
    question,
    options,
    correctAnswer: `${correct} cm`,
    hint,
    imageHint: shape.imageHint,
  };
}

function generate3DQuestion(locale: Locale): GeometryQuestion {
  const correctShape = getRandomItem(SHAPES_3D);
  const wrongShapes2D = shuffle(SHAPES_2D).slice(0, 2);

  const questionVariants =
    locale === 'tr'
      ? [
          'Bu şekillerden hangisi 3 boyutludur?',
          'Hangisi düz bir çizim değil, katı (3 boyutlu) bir cisimdir?',
        ]
      : [
          'Which of these is a 3D shape?',
          'Which shape is a solid object, not flat?',
        ];

  const question = getRandomItem(questionVariants);

  const options = [
    getShapeName(correctShape, locale),
    ...wrongShapes2D.map((s) => getShapeName(s, locale)),
  ];

  return {
    type: '3d',
    question,
    options,
    correctAnswer: getShapeName(correctShape, locale),
    hint:
      locale === 'tr'
        ? '3 boyutlu şekilleri eline alıp çevirebilirsin.'
        : '3D shapes can be picked up and have thickness.',
    imageHint: correctShape.imageHint,
  };
}

function generateOddOneOutQuestion(locale: Locale): GeometryQuestion {
  const mode = Math.random();

  let options: string[] = [];
  let correctAnswer: string;
  let question: string;
  let hint: string;
  let imageHint: string | undefined;

  if (mode < 0.33) {
    const shape3dA = getRandomItem(SHAPES_3D);
    const shape3dB = getRandomItem(
      SHAPES_3D.filter((s) => s.id !== shape3dA.id),
    );
    const shape2d = getRandomItem(SHAPES_2D);

    const shapes = shuffle([shape3dA, shape3dB, shape2d]);
    options = shapes.map((s) => getShapeName(s, locale));
    correctAnswer = getShapeName(shape2d, locale);
    question =
      locale === 'tr'
        ? 'Hangisi farklı olan şekildir? (İpucu: düz mü, yoksa katı mı?)'
        : 'Which shape is the odd one out? (Hint: flat vs solid)';
    hint =
      locale === 'tr'
        ? 'İki şekil 3 boyutlu, biri düz 2 boyutludur.'
        : 'Two shapes are 3D solids, one is a flat 2D shape.';
    imageHint = shape2d.imageHint;
  } else if (mode < 0.66) {
    const baseShape = getRandomItem(SHAPES_2D.filter((s) => s.sides === 4));
    const sameSideShape = getRandomItem(
      SHAPES_2D.filter(
        (s) => s.id !== baseShape.id && s.sides === baseShape.sides,
      ),
    );
    const differentShape = getRandomItem(
      SHAPES_2D.filter((s) => s.sides !== baseShape.sides),
    );

    const shapes = shuffle([baseShape, sameSideShape, differentShape]);
    options = shapes.map((s) => getShapeName(s, locale));
    correctAnswer = getShapeName(differentShape, locale);
    question =
      locale === 'tr'
        ? 'Kenarlara göre hangisi farklı olan şekildir?'
        : 'Which shape is the odd one out by number of sides?';
    hint =
      locale === 'tr'
        ? 'İki şeklin kenar sayısı aynı, biri farklıdır.'
        : 'Two shapes have the same number of sides, one does not.';
    imageHint = differentShape.imageHint;
  } else {
    const roundShape = SHAPES_2D.find((s) => s.isRound) || SHAPES_2D[0];
    const notRoundShapes = shuffle(
      SHAPES_2D.filter((s) => !s.isRound),
    ).slice(0, 2);

    const shapes = shuffle([roundShape, ...notRoundShapes]);
    options = shapes.map((s) => getShapeName(s, locale));
    correctAnswer = getShapeName(roundShape, locale);
    question =
      locale === 'tr'
        ? 'Hangisi farklı olan şekildir? (İpucu: kenarlara bak.)'
        : 'Which shape is the odd one out? (Hint: look at the edges.)';
    hint =
      locale === 'tr'
        ? 'Sadece bir tanesi tamamen yuvarlaktır.'
        : 'Only one shape is perfectly round.';
    imageHint = roundShape.imageHint;
  }

  return {
    type: 'odd',
    question,
    options,
    correctAnswer,
    hint,
    imageHint,
  };
}

export function generateGeometryQuestion(
  locale: Locale = 'en',
): GeometryQuestion {
  const generators: Array<(locale: Locale) => GeometryQuestion> = [
    generateIdentifyQuestion,
    generatePropertyQuestion,
    generateCountQuestion,
    generateCompareQuestion,
    generateAreaQuestion,
    generate3DQuestion,
    generateOddOneOutQuestion,
  ];

  const generator = getRandomItem(generators);
  const rawQuestion = generator(locale);

  const uniqueOptions = Array.from(new Set(rawQuestion.options));
  if (!uniqueOptions.includes(rawQuestion.correctAnswer)) {
    uniqueOptions.push(rawQuestion.correctAnswer);
  }

  const options = shuffle(uniqueOptions);

  return {
    ...rawQuestion,
    options,
  };
}


