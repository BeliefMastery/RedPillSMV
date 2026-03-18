// Phase 1: Temperament Orientation Questions
// Quick screening to identify likely temperament range before deep assessment
// Uses binary/3-point questions for rapid orientation

export const PHASE_1_ORIENTATION_QUESTIONS = [
  {
    id: 'p1_orientation_1',
    question: 'When facing a significant decision, what feels more natural: analyzing options systematically and creating a plan, or tuning into your feelings and inner sense of what\'s right?',
    type: 'three_point',
    options: [
      {
        text: 'Analyzing and planning feels more natural',
        mapsTo: { masculine: 2, feminine: -1, weight: 1.2 }
      },
      {
        text: 'Both feel natural depending on context',
        mapsTo: { masculine: 0, feminine: 0, weight: 0.5 }
      },
      {
        text: 'Tuning into feelings and inner sense feels more natural',
        mapsTo: { masculine: -1, feminine: 2, weight: 1.2 }
      }
    ]
  },
  {
    id: 'p1_orientation_2',
    question: 'In relationships, what feels more important: creating harmony and deep emotional connection, or achieving mutual goals and building something together?',
    type: 'three_point',
    options: [
      {
        text: 'Achieving goals and building together feels more important',
        mapsTo: { masculine: 2, feminine: -1, weight: 1.1 }
      },
      {
        text: 'Both are important, depending on the situation',
        mapsTo: { masculine: 0, feminine: 0, weight: 0.5 }
      },
      {
        text: 'Harmony and emotional connection feel more important',
        mapsTo: { masculine: -1, feminine: 2, weight: 1.1 }
      }
    ]
  },
  {
    id: 'p1_orientation_3',
    question: 'When someone close to you faces difficulty, what feels more natural: taking practical action to solve problems, or offering emotional presence and understanding?',
    type: 'three_point',
    options: [
      {
        text: 'Taking practical action feels more natural',
        mapsTo: { masculine: 2, feminine: -0.8, weight: 1.0 }
      },
      {
        text: 'Both, depending on what they need',
        mapsTo: { masculine: 0, feminine: 0, weight: 0.5 }
      },
      {
        text: 'Offering emotional presence feels more natural',
        mapsTo: { masculine: -0.8, feminine: 2, weight: 1.0 }
      }
    ]
  },
  {
    id: 'p1_orientation_4',
    question: 'When outcomes matter, what feels more natural: taking steps to ensure things go according to plan, or staying present and responding to what emerges?',
    type: 'three_point',
    options: [
      {
        text: 'Ensuring things go according to plan feels more natural',
        mapsTo: { masculine: 2, feminine: -1, weight: 1.1 }
      },
      {
        text: 'Both, depending on the situation',
        mapsTo: { masculine: 0, feminine: 0, weight: 0.5 }
      },
      {
        text: 'Staying present and responding feels more natural',
        mapsTo: { masculine: -1, feminine: 2, weight: 1.1 }
      }
    ]
  },
  {
    id: 'p1_orientation_5',
    question: 'When facing challenges, what feels more authentic: analyzing the situation and developing strategies to master it, or staying open to what the situation might teach you?',
    type: 'three_point',
    options: [
      {
        text: 'Analyzing and developing strategies feels more authentic',
        mapsTo: { masculine: 2, feminine: -0.8, weight: 1.0 }
      },
      {
        text: 'Both approaches feel authentic',
        mapsTo: { masculine: 0, feminine: 0, weight: 0.5 }
      },
      {
        text: 'Staying open to what it might teach feels more authentic',
        mapsTo: { masculine: -0.8, feminine: 2, weight: 1.0 }
      }
    ]
  },
  {
    id: 'p1_orientation_6',
    question: 'In moments of uncertainty, what feels more natural: taking action to influence the outcome, or having faith that things will work out as they should?',
    type: 'three_point',
    options: [
      {
        text: 'Taking action to influence feels more natural',
        mapsTo: { masculine: 1.8, feminine: -0.9, weight: 1.1 }
      },
      {
        text: 'Both feel natural depending on context',
        mapsTo: { masculine: 0, feminine: 0, weight: 0.5 }
      },
      {
        text: 'Having faith things will work out feels more natural',
        mapsTo: { masculine: -0.9, feminine: 1.8, weight: 1.1 }
      }
    ]
  },
  {
    id: 'p1_orientation_7',
    question: 'When planning something significant, what feels more natural: creating a detailed roadmap with specific steps, or keeping plans flexible and adapting as circumstances unfold?',
    type: 'three_point',
    options: [
      {
        text: 'Creating a detailed roadmap feels more natural',
        mapsTo: { masculine: 2, feminine: -1, weight: 1.0 }
      },
      {
        text: 'Both approaches feel natural',
        mapsTo: { masculine: 0, feminine: 0, weight: 0.5 }
      },
      {
        text: 'Keeping plans flexible feels more natural',
        mapsTo: { masculine: -1, feminine: 2, weight: 1.0 }
      }
    ]
  }
];

