// Attraction and Responsiveness Questions
// Based on STATUS, SELECTION, ATTRACTION reference map
// Reframed as situational prompts to avoid triggering keyword associations

export const ATTRACTION_RESPONSIVENESS = {
  status_and_rank: {
    name: 'Status and Rank Orientation',
    spectrumLabel: 'Harmony and connection vs Place and respect',
    description: 'How you relate to status, rank, and hierarchy (masculine: Coalition Rank; feminine: social positioning)',
    masculinePoleLabel: 'oriented to establishing place and earning respect',
    femininePoleLabel: 'oriented to harmony and connection regardless of hierarchy',
    questions: [
      {
        id: 'attr_stat_1',
        question: 'In group settings with peers, what feels more important: establishing your place and earning respect, or maintaining harmony and connection regardless of hierarchy?',
        masculineWeight: 1.0,
        feminineWeight: -0.5,
        poleLabels: { low: 'Harmony and connection', high: 'Establishing place and respect' }
      },
      {
        id: 'attr_stat_2',
        question: 'When it comes to social positioning and alliances, how much does this matter: having strong connections and social standing, versus focusing more on individual relationships?',
        masculineWeight: 0.8,
        feminineWeight: 0.6,
        poleLabels: { low: 'Individual relationships', high: 'Strong connections and standing' }
      },
      {
        id: 'attr_stat_3',
        question: 'Imagine being attracted to someone. How much does their social standing, reputation, or position in their community affect your interest: does it influence your attraction, or matter less than other qualities?',
        masculineWeight: -0.4,
        feminineWeight: 0.8,
        poleLabels: { low: 'Matters less than other qualities', high: 'Significantly influences attraction' }
      },
      {
        id: 'attr_stat_4',
        question: 'In social contexts, what feels more important: feeling respected and valued by others, or feeling connected and accepted regardless of status?',
        masculineWeight: 1.0,
        feminineWeight: 0.4,
        poleLabels: { low: 'Connected and accepted', high: 'Respected and valued' }
      }
    ]
  },
  
  selection_criteria: {
    name: 'Selection Criteria',
    spectrumLabel: 'Loyalty and nurture vs Protection and provision',
    description: 'What you look for in a partner (masculine: Reproductive Confidence; feminine: 4P\'s - Perspicacity, Protector, Provider, Parental)',
    masculinePoleLabel: 'oriented to loyalty, nurture, and collaborative partnership',
    femininePoleLabel: 'oriented to protection, provision, and parental investment',
    questions: [
      {
        id: 'attr_sel_1',
        question: 'When evaluating a potential partner, how important is it that they demonstrate: the ability to solve problems, handle challenges, and be resourceful?',
        selectionStandard: 'female',
        masculineWeight: 0.3,
        feminineWeight: 1.0,
        poleLabels: { low: 'Not important', high: 'Very important' }
      },
      {
        id: 'attr_sel_2',
        question: 'In what you look for in a partner, how much does this matter: their capacity to protect and provide, versus other qualities like emotional connection or compatibility?',
        selectionStandard: 'female',
        masculineWeight: 0.2,
        feminineWeight: 1.0,
        poleLabels: { low: 'Emotional connection matters more', high: 'Protect and provide matters more' }
      },
      {
        id: 'attr_sel_3',
        question: 'When considering someone as a potential partner, how important is: their loyalty, their capacity for nurture, and whether you can trust them to work collaboratively?',
        selectionStandard: 'male',
        masculineWeight: 1.0,
        feminineWeight: 0.3,
        poleLabels: { low: 'Not important', high: 'Very important' }
      },
      {
        id: 'attr_sel_4',
        question: 'How much does this matter when choosing a partner: their willingness and capacity to invest in long-term partnership, including parental investment if relevant?',
        selectionStandard: 'female',
        masculineWeight: -0.3,
        feminineWeight: 1.0,
        poleLabels: { low: 'Matters less', high: 'Very important' }
      },
      {
        id: 'attr_sel_5',
        question: 'When looking for a long-term partner, how important is it that they: show clear willingness to invest in and commit to the relationship over time?',
        selectionStandard: 'female',
        masculineWeight: 0.4,
        feminineWeight: 0.9,
        poleLabels: { low: 'Not important', high: 'Very important' }
      }
    ]
  },
  
  attraction_signals: {
    name: 'Attraction Signals',
    spectrumLabel: 'Personality and connection vs Competence and vitality',
    description: 'What signals attract you and how you display attraction (Axis of Attraction)',
    masculinePoleLabel: 'oriented to competence, achievement, and vitality signals',
    femininePoleLabel: 'oriented to personality, connection, and expressive warmth',
    questions: [
      {
        id: 'attr_sig_1',
        question: 'When you notice someone, what tends to catch your attention more: displays of competence, achievement, or capability, or other qualities like personality or connection?',
        masculineWeight: -0.3,
        feminineWeight: 1.0,
        poleLabels: { low: 'Competence and achievement', high: 'Personality and connection' }
      },
      {
        id: 'attr_sig_2',
        question: 'In what you find physically attractive, what tends to matter more: youth, health, and vitality signals, or other aspects of their character, manner, and overall bearing?',
        masculineWeight: 1.0,
        feminineWeight: -0.2,
        poleLabels: { low: 'Character, manner, bearing', high: 'Youth, health, vitality' }
      },
      {
        id: 'attr_sig_3',
        question: 'When you want to attract someone\'s interest, what feels more natural: showing what you\'ve achieved, your resources, or your status, versus letting how you show up speak for itself?',
        masculineWeight: 0.8,
        feminineWeight: -0.5,
        poleLabels: { low: 'How I show up speaks for itself', high: 'Show achievement and status' }
      },
      {
        id: 'attr_sig_4',
        question: 'When you want someone to notice you, what feels more authentic: letting your beauty, grace, and receptivity be visible, or focusing more on your achievements and capabilities?',
        masculineWeight: -0.7,
        feminineWeight: 1.0,
        poleLabels: { low: 'Achievements and capabilities', high: 'Beauty, grace, receptivity' }
      },
      {
        id: 'attr_sig_5',
        question: 'How much does this affect your attraction to someone: their visible health, youth, and physical vitality, versus other qualities like character or connection?',
        masculineWeight: 1.0,
        feminineWeight: 0.2,
        poleLabels: { low: 'Character and connection matter more', high: 'Health, youth, vitality matter more' }
      },
      {
        id: 'attr_sig_6',
        question: 'When someone displays their capability, resourcefulness, and capacity to provide, how does that affect your attraction: does it increase your interest, or matter less than other factors?',
        masculineWeight: -0.2,
        feminineWeight: 1.0,
        poleLabels: { low: 'Matters less', high: 'Increases my interest' }
      }
    ]
  },
  
  hypergamy_and_choice: {
    name: 'Hypergamy and Mate Choice',
    spectrumLabel: 'Compatibility and connection vs Provision and standing',
    description: 'How you approach mate selection and relationship choice',
    masculinePoleLabel: 'oriented to compatibility and connection in choice',
    femininePoleLabel: 'oriented to protection, provision, and standing in choice',
    questions: [
      {
        id: 'attr_hyp_1',
        question: 'When considering a potential partner, how much does this factor in: whether they can protect and provide, versus focusing more on emotional connection or compatibility?',
        masculineWeight: -0.3,
        feminineWeight: 1.0,
        poleLabels: { low: 'Emotional connection matters more', high: 'Protect and provide matters more' }
      },
      {
        id: 'attr_hyp_2',
        question: 'What matters more when evaluating a potential partner: their loyalty, capacity for nurture, and ability to work collaboratively, or other factors like status or achievement?',
        masculineWeight: 1.0,
        feminineWeight: 0.2,
        poleLabels: { low: 'Status or achievement', high: 'Loyalty, nurture, collaboration' }
      },
      {
        id: 'attr_hyp_3',
        question: 'When choosing a partner, how important is it that they: be at least your equal in value, capability, or standing, versus focusing more on compatibility and connection?',
        masculineWeight: -0.4,
        feminineWeight: 0.9,
        poleLabels: { low: 'Compatibility and connection matter more', high: 'Equal in value/capability matters more' }
      },
      {
        id: 'attr_hyp_4',
        question: 'What feels more important in a relationship: knowing your partner considers you their best option, or feeling confident in the connection regardless of comparison?',
        masculineWeight: 0.6,
        feminineWeight: 0.7,
        poleLabels: { low: 'Confident regardless', high: 'Partner considers me their best' }
      },
      {
        id: 'attr_hyp_5',
        question: 'How much does this matter when choosing a partner: their social standing, their network of connections, or their position in their community?',
        masculineWeight: 0.2,
        feminineWeight: 0.8,
        poleLabels: { low: 'Matters less', high: 'Very important' }
      },
      {
        id: 'attr_hyp_6',
        question: 'When evaluating partners, how often do you prioritize being their clear "best option" over deep compatibility regardless of comparison?',
        masculineWeight: 0.5,
        feminineWeight: 0.85,
        poleLabels: { low: 'Compatibility regardless', high: 'Being their best option' }
      }
    ]
  },

  consequence_insulation: {
    name: 'Consequence Insulation',
    spectrumLabel: 'Partner-anchored security vs Institutional / risk-decoupled security',
    description: 'How much long-term security is tied to a householder partner versus insulated by institutions or decoupled reproductive risk',
    masculinePoleLabel: 'oriented to self-reliance and partner-anchored commitment planning',
    femininePoleLabel: 'oriented to institutional or risk-decoupled security',
    questions: [
      {
        id: 'ci_1',
        question: 'Long-term economic security feels more secure when anchored in a committed partner who provides and protects, rather than programs or collective safety nets.',
        masculineWeight: 1.0,
        feminineWeight: -0.7,
        poleLabels: { low: 'Programs / collective nets', high: 'Committed partner anchor' }
      },
      {
        id: 'ci_2',
        question: 'Reproductive or commitment consequences feel manageable without requiring a dedicated householder contract first.',
        masculineWeight: -0.6,
        feminineWeight: 0.8,
        poleLabels: { low: 'Need householder first', high: 'Manageable without householder' }
      },
      {
        id: 'ci_3',
        question: 'I plan major life decisions assuming external support (state, family, community) can absorb personal risk if a relationship fails.',
        masculineWeight: -0.5,
        feminineWeight: 0.7,
        poleLabels: { low: 'Plan around partner contract', high: 'External support absorbs risk' }
      }
    ]
  },

  polarity_collapse_context: {
    name: 'Polarity Collapse Context',
    spectrumLabel: 'Authentic preference vs Compensatory direction',
    description: 'Whether initiation and direction reflect authentic pole preference or structural compensation under abdicated lead',
    masculinePoleLabel: 'oriented to approach, proposal, and direction under own initiative',
    femininePoleLabel: 'oriented to compensatory direction when lead is absent',
    questions: [
      {
        id: 'pcs_mpa_1',
        question: 'Even when attracted, I avoid approach or stating where a connection is going.',
        masculineWeight: -1.0,
        feminineWeight: 0.2,
        poleLabels: { low: 'I approach and propose', high: 'I avoid approach / direction' }
      },
      {
        id: 'pcs_mpa_2',
        question: 'I invest heavily in how I look or present myself but rarely take social risk to initiate with people I want.',
        masculineWeight: -0.9,
        feminineWeight: 0.1,
        poleLabels: { low: 'Presentation plus approach', high: 'Presentation without approach' }
      },
      {
        id: 'pcs_dir_1',
        question: 'I initiate or direct dating primarily because waiting for masculine lead feels like stagnation—not because I prefer leading.',
        masculineWeight: 0.2,
        feminineWeight: 0.9,
        poleLabels: { low: 'Prefer to be led', high: 'Initiate from stagnation fear' }
      },
      {
        id: 'pcs_dir_2',
        question: 'Future relationship direction feels secure when my partner leads; when they will not, I must set direction to feel safe.',
        masculineWeight: -0.4,
        feminineWeight: 0.85,
        poleLabels: { low: 'Secure when partner leads', high: 'I must set direction' }
      },
      {
        id: 'pcs_dir_3',
        question: 'I make the first move mainly to escape uncertainty about whether anything will happen—not from preference to lead.',
        masculineWeight: 0.1,
        feminineWeight: 0.8,
        poleLabels: { low: 'First move by preference', high: 'First move from uncertainty' }
      },
      {
        id: 'pcs_bo_1',
        question: 'Optimizing appearance or personal brand feels more rewarding than taking leadership or coalition risks in social hierarchies.',
        masculineWeight: -0.8,
        feminineWeight: 0.2,
        poleLabels: { low: 'Leadership / coalition risk', high: 'Self-optimization focus' }
      }
    ]
  },
  
  responsiveness_patterns: {
    name: 'Responsiveness Patterns',
    spectrumLabel: 'Being pursued vs Pursuing',
    description: 'How you respond to attraction and pursue or receive connection',
    masculinePoleLabel: 'oriented to pursuing and initiating connection',
    femininePoleLabel: 'oriented to being pursued and responding',
    questions: [
      {
        id: 'attr_resp_1',
        question: 'When you feel attraction, what feels more natural: taking action to pursue and initiate connection, or allowing yourself to be pursued and responding to their interest?',
        masculineWeight: 1.0,
        feminineWeight: -0.8,
        poleLabels: { low: 'Be pursued and respond', high: 'Pursue and initiate' }
      },
      {
        id: 'attr_resp_2',
        question: 'When someone pursues you or makes their interest clear, how does that feel: more comfortable and natural, or do you prefer being the one who initiates?',
        masculineWeight: -0.9,
        feminineWeight: 1.0,
        poleLabels: { low: 'Prefer I initiate', high: 'Being pursued feels natural' }
      },
      {
        id: 'attr_resp_3',
        question: 'Before committing to someone, what feels more natural: testing and challenging them to see how they respond, or building trust more organically?',
        masculineWeight: -0.5,
        feminineWeight: 0.8,
        poleLabels: { low: 'Testing and challenging', high: 'Building trust organically' }
      },
      {
        id: 'attr_resp_4',
        question: 'What helps you open more fully in a relationship: feeling specifically chosen and prioritized by your partner, or feeling confident in the connection regardless?',
        masculineWeight: -0.7,
        feminineWeight: 1.0,
        poleLabels: { low: 'Confident regardless', high: 'Partner chooses and prioritizes me' }
      },
      {
        id: 'attr_resp_5',
        question: 'When pursuing someone you\'re interested in, what feels more engaging: the challenge of winning them over, or the natural flow of mutual interest?',
        masculineWeight: 1.0,
        feminineWeight: -0.6,
        poleLabels: { low: 'Natural flow of mutual interest', high: 'Challenge of winning them over' }
      },
      {
        id: 'attr_resp_6',
        question: 'When someone shows strength, grounded bearing, and clear direction, how do you typically respond: does it increase your interest and responsiveness, or do you prefer when roles are more balanced?',
        masculineWeight: -0.9,
        feminineWeight: 1.0,
        poleLabels: { low: 'Prefer roles more balanced', high: 'Increases my interest' }
      }
    ]
  }
};
