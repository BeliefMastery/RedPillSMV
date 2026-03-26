// Intimate Dynamics Questions
// Covers sexually intimate dynamics, positions, emotional responses, and attraction
// Reframed as situational prompts to avoid triggering keyword associations

export const INTIMATE_DYNAMICS = {
  preferred_dynamics: {
    name: 'Preferred Intimate Dynamics',
    spectrumLabel: 'Responding and receiving vs Leading and initiating',
    description: 'How you prefer to engage in intimate/sexual dynamics',
    masculinePoleLabel: 'oriented to taking initiative and leading',
    femininePoleLabel: 'oriented to responding and receiving',
    questions: [
      {
        id: 'int_dyn_1',
        question: 'In moments of mutual attraction, what feels more natural: making the first move and taking initiative, or allowing the other person to initiate while you respond?',
        masculineWeight: 1.0,
        feminineWeight: -0.8,
        poleLabels: { low: 'They initiate, I respond', high: 'I make first move and initiate' }
      },
      {
        id: 'int_dyn_2',
        question: 'When intimate connection begins, what feels more authentic: being the one who responds and receives, or being the one who leads and initiates?',
        masculineWeight: -0.9,
        feminineWeight: 1.0,
        poleLabels: { low: 'I lead and initiate', high: 'I respond and receive' }
      },
      {
        id: 'int_dyn_3',
        question: 'During intimate moments, what feels more natural: directing the pace and flow, or following and responding to your partner\'s lead?',
        masculineWeight: 1.0,
        feminineWeight: -0.7,
        poleLabels: { low: 'Following partner\'s lead', high: 'Directing pace and flow' }
      },
      {
        id: 'int_dyn_4',
        question: 'Imagine being in an intimate situation. What feels more comfortable: having your partner take the lead and guide the experience, or naturally taking charge yourself?',
        masculineWeight: -0.9,
        feminineWeight: 1.0,
        poleLabels: { low: 'I take charge', high: 'Partner takes lead and guides' }
      },
      {
        id: 'int_dyn_5',
        question: 'What brings you more satisfaction during intimate connection: focusing on your partner\'s pleasure and experience, or receiving focused attention on your own pleasure?',
        masculineWeight: 0.8,
        feminineWeight: 0.6,
        poleLabels: { low: 'Receiving focus on my pleasure', high: 'Focusing on partner\'s pleasure' }
      },
      {
        id: 'int_dyn_6',
        question: 'When your partner is fully focused on your experience, how does that feel: more comfortable and satisfying, or do you prefer when attention is more balanced or directed toward them?',
        masculineWeight: -0.6,
        feminineWeight: 0.9,
        poleLabels: { low: 'Prefer balanced or toward them', high: 'Comfortable, partner focused on me' }
      }
    ]
  },
  
  emotional_responses: {
    name: 'Emotional Responses to Intimacy',
    spectrumLabel: 'Openness and emotional presence vs Contained focus',
    description: 'How you emotionally respond to intimate connection',
    masculinePoleLabel: 'oriented to confidence and contained focus',
    femininePoleLabel: 'oriented to openness and emotional presence',
    questions: [
      {
        id: 'int_emo_1',
        question: 'After a deeply satisfying intimate connection, what do you typically feel more of: a sense of confidence and personal power, or a sense of openness and vulnerability?',
        masculineWeight: 1.0,
        feminineWeight: -0.3,
        poleLabels: { low: 'Openness and vulnerability', high: 'Confidence and personal power' }
      },
      {
        id: 'int_emo_2',
        question: 'During intimate moments, what feels more authentic: feeling open and emotionally present, or feeling more contained and focused?',
        masculineWeight: -0.5,
        feminineWeight: 1.0,
        poleLabels: { low: 'Contained and focused', high: 'Open and emotionally present' }
      },
      {
        id: 'int_emo_3',
        question: 'When physical intimacy occurs, what feels more important: the emotional connection and presence between you, or the physical sensation itself?',
        masculineWeight: -0.4,
        feminineWeight: 1.0,
        poleLabels: { low: 'Physical sensation itself', high: 'Emotional connection and presence' }
      },
      {
        id: 'int_emo_4',
        question: 'Imagine a situation where physical pleasure and emotional connection feel separate. What feels more natural: being able to enjoy the physical aspect independently, or needing emotional connection to fully experience pleasure?',
        masculineWeight: 0.7,
        feminineWeight: -0.8,
        poleLabels: { low: 'Need emotional connection', high: 'Enjoy physical independently' }
      },
      {
        id: 'int_emo_5',
        question: 'When your partner\'s emotional state is significantly different from yours during intimacy, how does that affect you: does it impact your experience, or can you remain focused on your own?',
        masculineWeight: -0.6,
        feminineWeight: 1.0,
        poleLabels: { low: 'Remain focused on my own', high: 'Partner\'s state impacts my experience' }
      },
      {
        id: 'int_emo_6',
        question: 'What helps you feel more fully present during intimate connection: knowing your partner specifically wants and chooses you, or feeling confident in your own appeal and capability?',
        masculineWeight: -0.5,
        feminineWeight: 1.0,
        poleLabels: { low: 'Confident in my appeal', high: 'Partner wants and chooses me' }
      }
    ]
  },
  
  satisfaction_and_preference: {
    name: 'Satisfaction and Preference',
    spectrumLabel: 'Receiving pleasure vs Giving pleasure',
    description: 'What brings you the most satisfaction in intimate connection',
    masculinePoleLabel: 'oriented to providing pleasure and guiding the experience',
    femininePoleLabel: 'oriented to receiving and being present to sensation',
    questions: [
      {
        id: 'int_sat_1',
        question: 'What feels more satisfying during intimate connection: being the one who provides pleasure and guides the experience, or being fully present and receptive to sensation?',
        masculineWeight: 1.0,
        feminineWeight: -0.5,
        poleLabels: { low: 'Present and receptive to sensation', high: 'Provide pleasure and guide' }
      },
      {
        id: 'int_sat_2',
        question: 'When you\'re fully focused on sensation and receiving, how satisfying is that compared to being more active and giving?',
        masculineWeight: -0.7,
        feminineWeight: 1.0,
        poleLabels: { low: 'More active and giving', high: 'Focused on sensation and receiving' }
      },
      {
        id: 'int_sat_3',
        question: 'What enhances your experience more: feeling your partner\'s responsiveness and openness to you, or feeling your partner\'s strength and presence?',
        masculineWeight: 1.0,
        feminineWeight: -0.6,
        poleLabels: { low: 'Responsiveness and openness', high: 'Strength and presence' }
      },
      {
        id: 'int_sat_4',
        question: 'During intimate connection, what feels more arousing: when your partner shows strength and takes clear direction, or when your partner is more receptive and open?',
        masculineWeight: -0.8,
        feminineWeight: 1.0,
        poleLabels: { low: 'Strength and clear direction', high: 'Receptive and open' }
      },
      {
        id: 'int_sat_5',
        question: 'When there\'s a noticeable difference in energy or approach between you and your partner, does that enhance the connection, or do you prefer when energies are more similar?',
        masculineWeight: 0.9,
        feminineWeight: 0.9,
        poleLabels: { low: 'Energies more similar', high: 'Difference enhances connection' }
      },
      {
        id: 'int_sat_6',
        question: 'What feels more engaging during intimate connection: when there\'s intensity and challenge in the dynamic, or when it\'s more gentle and flowing?',
        masculineWeight: 0.8,
        feminineWeight: -0.4,
        poleLabels: { low: 'Gentle and flowing', high: 'Intensity and challenge' }
      }
    ]
  },
  
  positions_and_preferences: {
    name: 'Positions and Physical Preferences',
    spectrumLabel: 'Receptive positions vs Active positions',
    description: 'Physical preferences and positions that feel most satisfying',
    masculinePoleLabel: 'oriented to active, leading positions',
    femininePoleLabel: 'oriented to receptive, responsive positions',
    questions: [
      {
        id: 'int_pos_1',
        question: 'When it comes to physical positioning during intimacy, what tends to feel more natural: positions where you\'re more active and on top, or positions where you\'re more receptive and underneath?',
        masculineWeight: 1.0,
        feminineWeight: -0.7,
        poleLabels: { low: 'Receptive and underneath', high: 'Active and on top' }
      },
      {
        id: 'int_pos_2',
        question: 'Imagine intimate positions where you\'re underneath or receiving. How satisfying does that feel compared to positions where you\'re more on top or active?',
        masculineWeight: -0.8,
        feminineWeight: 1.0,
        poleLabels: { low: 'On top or active more satisfying', high: 'Underneath or receiving more satisfying' }
      },
      {
        id: 'int_pos_3',
        question: 'During intimate connection, how important is being able to see your partner\'s face and maintain eye contact?',
        masculineWeight: 0.6,
        feminineWeight: 0.8,
        poleLabels: { low: 'Not important', high: 'Very important' }
      },
      {
        id: 'int_pos_4',
        question: 'What feels more satisfying: positions that allow for deep eye contact and emotional connection, or positions that focus more on physical sensation?',
        masculineWeight: -0.4,
        feminineWeight: 1.0,
        poleLabels: { low: 'Focus on physical sensation', high: 'Eye contact and emotional connection' }
      },
      {
        id: 'int_pos_5',
        question: 'When physical positioning emphasizes your strength or activity, how does that feel: more satisfying and natural, or less important than other aspects?',
        masculineWeight: 1.0,
        feminineWeight: -0.6,
        poleLabels: { low: 'Less important than other aspects', high: 'More satisfying and natural' }
      },
      {
        id: 'int_pos_6',
        question: 'When physical positioning emphasizes your receptivity and openness, how does that feel: more satisfying and natural, or less important than other aspects?',
        masculineWeight: -0.9,
        feminineWeight: 1.0,
        poleLabels: { low: 'Less important than other aspects', high: 'More satisfying and natural' }
      }
    ]
  },
  
  // spectrumLabel pairs with name in reports as "Name: spectrumLabel"; avoid repeating the category word in the spectrum line (see responsiveness_patterns in attraction-responsiveness.js).
  arousal_and_responsiveness: {
    name: 'Arousal and Responsiveness',
    spectrumLabel: 'Being pursued vs pursuing',
    description: 'What arouses you and how you respond to attraction',
    masculinePoleLabel: 'oriented to pursuing and taking action',
    femininePoleLabel: 'oriented to being pursued and responding',
    questions: [
      {
        id: 'int_ar_1',
        question: 'When you feel attraction, what feels more natural: taking action to pursue and connect, or allowing yourself to be pursued and responding?',
        masculineWeight: 1.0,
        feminineWeight: -0.7,
        poleLabels: { low: 'Be pursued and respond', high: 'Pursue and connect' }
      },
      {
        id: 'int_ar_2',
        question: 'When someone pursues you or makes it clear they want you, how does that affect your arousal: does it increase your interest, or do you prefer being the one who pursues?',
        masculineWeight: -0.8,
        feminineWeight: 1.0,
        poleLabels: { low: 'Prefer being the one who pursues', high: 'Being pursued increases my interest' }
      },
      {
        id: 'int_ar_3',
        question: 'What feels more arousing: when your partner is open, responsive, and receptive to you, or when your partner is more active and takes charge?',
        masculineWeight: 1.0,
        feminineWeight: -0.5,
        poleLabels: { low: 'Partner open and receptive', high: 'Partner active and takes charge' }
      },
      {
        id: 'int_ar_4',
        question: 'When your partner shows strength, presence, and takes clear direction, how does that affect your arousal: does it increase your interest, or do you prefer when roles are more balanced?',
        masculineWeight: -0.9,
        feminineWeight: 1.0,
        poleLabels: { low: 'Prefer roles more balanced', high: 'Partner\'s strength increases my interest' }
      },
      {
        id: 'int_ar_5',
        question: 'When your partner is emotionally open and vulnerable with you, how does that affect your arousal and connection?',
        masculineWeight: 0.3,
        feminineWeight: 0.8,
        poleLabels: { low: 'Little to no effect', high: 'Strongly enhances arousal and connection' }
      },
      {
        id: 'int_ar_6',
        question: 'What helps you feel more fully responsive during intimate connection: knowing your partner specifically chooses and prioritizes you, or feeling confident in your own appeal?',
        masculineWeight: -0.6,
        feminineWeight: 1.0,
        poleLabels: { low: 'Confident in my appeal', high: 'Partner chooses and prioritizes me' }
      }
    ]
  }
};
