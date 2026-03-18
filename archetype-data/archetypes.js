// Archetype Taxonomy - Extracted from redpill-spread.html
// Gender-neutral behavioral patterns mapped to social roles and psychological functions

export const ARCHETYPES = {
  // ALPHA GROUP - Dominant, Leadership-Oriented
  alpha: {
    id: 'alpha',
    name: 'Alpha',
    socialRole: 'Dominant, Charismatic Leader',
    description: 'Naturally takes leadership roles, commands respect through presence and competence. Comfortable with authority and responsibility.',
    behavioralTraits: ['leadership', 'charisma', 'confidence', 'decisiveness', 'authority'],
    motivations: ['recognition', 'achievement', 'influence', 'control'],
    stressResponse: 'Takes charge, pushes harder, may become controlling',
    growthEdge: 'Learning to delegate, developing emotional intelligence',
    subtypes: ['alpha_xi', 'alpha_rho', 'dark_alpha'],
    // Metadata for report explanations
    jungianEquivalent: 'King (Mature), Warrior (Assertive)',
    vedicEquivalent: 'Raja Dharma (Ruler/Protector), Artha (Power)',
    greekPantheon: 'Zeus (King, Authority), Ares (Aggressive Leader)',
    tarotCard: 'The Emperor',
    socialProportion: 2.0,
    // Reproductive/Mating Success Metadata
    reproductiveSuccess: 'medium_high', // High seed spread, but not loyal long-term; reproduction happens but relationships don't last
    reproductiveDescription: 'Achieves reproduction through high mate access and seed spread, but typically lacks long-term relationship loyalty. High initial attraction but poor retention.',
    // Archetypal Narrative - The brutal truth of this archetype's typical life pattern
    archetypalNarrative: 'You command attention and respect naturally. People look to you for leadership, and you deliver. You achieve reproduction through multiple partners and high mate access, but struggle with long-term loyalty. Relationships start strong with your charisma and authority, then fail when your need for control or variety creates conflict. You may have multiple children from different partners, but lack deep family bonds. Your status keeps you in the game, but your inability to maintain commitment means you age alone despite early success. You trade depth for breadth, intimacy for influence. The truth: you lead but rarely connect, conquer but seldom build.',
    explanation: 'The Alpha archetype represents natural leadership and authority. In psychological terms, this aligns with mature masculine energy that takes responsibility and commands respect through competence rather than force. The term "Alpha" in this context refers to social positioning and behavioral patterns, not biological dominance.'
  },
  alpha_xi: {
    id: 'alpha_xi',
    name: 'Alpha-Xi',
    socialRole: 'Resilient, Courageous, Protector',
    description: 'Warrior archetype focused on protection and defense. Values honor, loyalty, and courage. Stands up for others.',
    behavioralTraits: ['courage', 'loyalty', 'protection', 'resilience', 'honor'],
    motivations: ['protection', 'justice', 'honor', 'service'],
    stressResponse: 'Fights harder, defends positions, may become rigid',
    growthEdge: 'Developing flexibility, learning when to yield',
    archetypalNarrative: 'You earn respect by protecting people, but you become defined by crisis. You build your identity around strength and service, and quietly resent anyone who does not appreciate the cost. You win battles, but the constant posture of defense keeps intimacy at a distance. The truth: you are admired when danger is present and overlooked when peace arrives.',
    parentType: 'alpha'
  },
  alpha_rho: {
    id: 'alpha_rho',
    name: 'Alpha-Rho',
    socialRole: 'Just, Fair, Lawmaker',
    description: 'Focused on justice, fairness, and creating order. Values rules and structure. Natural judge and mediator.',
    behavioralTraits: ['justice', 'fairness', 'order', 'judgment', 'structure'],
    motivations: ['justice', 'order', 'fairness', 'righteousness'],
    stressResponse: 'Becomes more rigid, enforces rules strictly',
    growthEdge: 'Developing compassion, understanding context',
    archetypalNarrative: 'You keep things fair, but you become the cold hand of order. People rely on your structure until it threatens their freedom, then they resent you. You trade warmth for principle and end up respected more than loved. The truth: you win the argument and lose the relationship.',
    parentType: 'alpha'
  },
  dark_alpha: {
    id: 'dark_alpha',
    name: 'Dark Alpha',
    socialRole: 'Abusive, Tyrannical, Dominant',
    description: 'Shadow expression of Alpha - uses power destructively. Controlling, abusive, seeks dominance through fear.',
    behavioralTraits: ['tyranny', 'abuse', 'control', 'dominance', 'intimidation'],
    motivations: ['power', 'control', 'fear', 'dominance'],
    stressResponse: 'Becomes more abusive, increases control',
    growthEdge: 'Healing power wounds, developing healthy authority',
    archetypalNarrative: 'You use power as a weapon and call it leadership. You get compliance, not loyalty, and every bond you build is wired with fear. You may gain status quickly, but you leave scorched ground and enemies behind you. The truth: you rule by force and end up isolated, surrounded but never trusted.',
    parentType: 'alpha',
    isShadow: true
  },

  // BETA GROUP - Supportive, Reliable
  beta: {
    id: 'beta',
    name: 'Beta',
    socialRole: 'Reliable, Supportive but Submissive',
    description: 'Supportive team player who values harmony and cooperation. Reliable, dutiful, but may lack assertiveness.',
    behavioralTraits: ['supportive', 'reliable', 'cooperative', 'dutiful', 'harmony'],
    motivations: ['belonging', 'approval', 'stability', 'service'],
    stressResponse: 'Seeks support, becomes more passive, avoids conflict',
    growthEdge: 'Developing assertiveness, setting boundaries',
    subtypes: ['beta_iota', 'beta_nu', 'beta_kappa', 'beta_rho'],
    // Reproductive/Mating Success Metadata
    reproductiveSuccess: 'medium', // Lower status and submissive, often resentful, gets used as second choice to "Alpha-widows" but still achieves reproduction
    reproductiveDescription: 'Typically achieves reproduction but as second choice or "backup" after Alpha relationships fail. Lower status and submissive positioning leads to resentful dynamics. Still manages reproduction despite being the fallback option.',
    // Archetypal Narrative - The brutal truth of this archetype's typical life pattern
    archetypalNarrative: 'You are the reliable second choice. Your partner chose you after their Alpha relationship failed - they wanted the security and devotion you provide, but you know you were not their first choice. You achieve reproduction, but in a resentful dynamic where you give more than you receive. You suppress your needs to maintain harmony, accumulating resentment over years. Your children see your submission and internalize that pattern. You may succeed in reproduction, but you fail in self-respect. The truth: you serve those who don\'t fully desire you, loyal to people who settled for you, building a life on the foundation of being "good enough" rather than truly wanted.',
    explanation: 'The Beta archetype represents supportive, reliable behavioral patterns focused on harmony and cooperation. The term "Beta" refers to social positioning and behavioral tendencies toward support and service, not a ranking of value or worth.'
  },
  beta_iota: {
    id: 'beta_iota',
    name: 'Beta-Iota',
    socialRole: 'Gentle, Supportive Nurturer, Pure, Innocent',
    description: 'Innocent, gentle, nurturing presence. Values purity and simplicity. May be naive but genuinely caring.',
    behavioralTraits: ['gentleness', 'innocence', 'nurturing', 'purity', 'simplicity'],
    motivations: ['harmony', 'care', 'purity', 'connection'],
    stressResponse: 'Withdraws, becomes more passive, seeks safety',
    growthEdge: 'Developing wisdom, learning healthy boundaries',
    archetypalNarrative: 'You are emotionally available in a way most men are not, and women find that useful without finding it attractive. They come to you to be heard, supported, and restored — then return to the men they actually desire. Your gentleness is real, but it signals low threat and low status, and desire requires neither of those things. You give your emotional labour freely and receive gratitude, not attraction. The truth: you are the man women appreciate and do not choose, needed for what you offer and overlooked for who you are.',
    parentType: 'beta'
  },
  beta_nu: {
    id: 'beta_nu',
    name: 'Beta-Nu',
    socialRole: 'Traditionalist, Dutiful, Settler',
    description: 'Values tradition, duty, and stability. Committed to long-term relationships and established structures.',
    behavioralTraits: ['tradition', 'duty', 'loyalty', 'stability', 'commitment'],
    motivations: ['stability', 'tradition', 'security', 'belonging'],
    stressResponse: 'Clings to tradition, becomes more rigid',
    growthEdge: 'Embracing change, developing flexibility',
    archetypalNarrative: 'You accepted the traditional deal: provide, commit, stay loyal, and a woman will choose you. She did. But the deal was about security, not desire, and you have always sensed the difference. You are respected for your reliability and maintained for your provision. Whether you are genuinely wanted is a question you have learned not to ask. Your children have a stable father and your partner has a dependable man — but the fire that should be there is managed down to a warmth that feels safer than honest. The truth: you built the structure she needed and quietly wonder if she would have chosen differently given another option.',
    parentType: 'beta'
  },
  beta_kappa: {
    id: 'beta_kappa',
    name: 'Beta-Kappa',
    socialRole: 'Ideological Ally, Approval-Seeking, Coalition Adaptor',
    description: 'Aligns with dominant social narratives to gain access, protection, and relational approval. Seeks security through alliance rather than confrontation.',
    behavioralTraits: ['alignment', 'appeasement', 'social signaling', 'conflict avoidance', 'approval-seeking'],
    motivations: ['acceptance', 'access', 'security', 'status by association'],
    stressResponse: 'Becomes more performative and cautious, doubles down on alignment, avoids dissent',
    growthEdge: 'Developing internal conviction, building value independent of approval',
    archetypalNarrative: 'You trade conviction for access, and access for the illusion of belonging. You gain entry but lose respect, offering agreement where courage was required. People reward your compliance but rarely trust your backbone. The truth: you are welcomed as an ally but seldom chosen as a leader, and the approval you chase keeps you small.',
    parentType: 'beta'
  },
  beta_rho: {
    id: 'beta_rho',
    name: 'Beta-Rho',
    socialRole: 'Creator, Motherly, Controlling',
    description: 'Nurturing and creative, but may use care as a form of control. Motherly presence with controlling tendencies.',
    behavioralTraits: ['nurturing', 'creativity', 'control', 'mothering', 'care'],
    motivations: ['care', 'control', 'creation', 'nurturing'],
    stressResponse: 'Increases control, becomes more smothering',
    growthEdge: 'Releasing control, allowing autonomy',
    archetypalNarrative: 'You nurture by taking over, then call it love. Your care becomes a cage, and the people you protect start to resist you. You become indispensable and resented at the same time. The truth: you keep people close by limiting their freedom.',
    parentType: 'beta'
  },

  // GAMMA GROUP - Intellectual, Rebellious
  gamma: {
    id: 'gamma',
    name: 'Gamma',
    socialRole: 'Intellectual, Rebellious Outsider',
    description: 'Intellectual, independent thinker who questions norms. Values knowledge, freedom, and authenticity over social acceptance.',
    behavioralTraits: ['intellectual', 'rebellious', 'independent', 'questioning', 'authentic'],
    motivations: ['knowledge', 'freedom', 'authenticity', 'truth'],
    stressResponse: 'Withdraws, becomes more isolated, questions everything',
    growthEdge: 'Developing social skills, learning to connect',
    subtypes: ['gamma_nu', 'gamma_theta', 'gamma_pi', 'dark_gamma'],
    // Reproductive/Mating Success Metadata
    reproductiveSuccess: 'low', // Usually misses out on reproduction due to outsider positioning and intellectual focus over social connection
    reproductiveDescription: 'Typically misses out on reproduction. Intellectual focus, outsider positioning, and rebellion against social norms limit mate access. Values knowledge and authenticity over reproductive opportunities.',
    // Archetypal Narrative - The brutal truth of this archetype's typical life pattern
    archetypalNarrative: 'You see through the bullshit, and that\'s your curse. Your intellectual depth and authentic questioning of norms make you fascinating but inaccessible. You watch as less insightful men achieve reproduction while you remain alone, misunderstood, or stuck in situationships that never progress. Your depth intimidates potential partners, and your refusal to play social games means you miss opportunities. You may rationalize this as "choosing authenticity," but the truth is you chose knowledge over connection, and now you face the consequences: few or no children, aging alone, your intellectual insights dying with you. The truth: you understood the game but refused to play it, and now you\'ve lost without ever really competing.',
    explanation: 'The Gamma archetype represents intellectual independence and questioning of social norms. The term "Gamma" refers to behavioral patterns of intellectual rebellion and outsider positioning, not a social hierarchy ranking. This archetype values knowledge, freedom, and authenticity over social acceptance.'
  },
  gamma_nu: {
    id: 'gamma_nu',
    name: 'Gamma-Nu',
    socialRole: 'Romantic, Devoted, Idealist',
    description: 'Romantic idealist who values deep connection and beauty. Devoted to ideals and relationships.',
    behavioralTraits: ['romantic', 'idealistic', 'devoted', 'beauty', 'passion'],
    motivations: ['love', 'beauty', 'ideals', 'connection'],
    stressResponse: 'Becomes more idealistic, may become disillusioned',
    growthEdge: 'Balancing ideals with reality, developing pragmatism',
    archetypalNarrative: 'You chase the perfect love and end up disappointed by real people. You mistake intensity for depth, and when reality arrives you withdraw. You keep waiting for the ideal partner and miss the ones who could have grown with you. The truth: your standards protect your heart by starving it.',
    parentType: 'gamma'
  },
  gamma_theta: {
    id: 'gamma_theta',
    name: 'Gamma-Theta',
    socialRole: 'Mystic, Prophet, Divine Connection',
    description: 'Spiritually oriented, seeks mystical experiences and divine connection. May have prophetic or visionary qualities.',
    behavioralTraits: ['mystical', 'spiritual', 'visionary', 'prophetic', 'transcendent'],
    motivations: ['transcendence', 'wisdom', 'divine', 'enlightenment'],
    stressResponse: 'Withdraws into spiritual practice, becomes detached',
    growthEdge: 'Grounding spirituality, integrating with daily life',
    archetypalNarrative: 'You speak in visions, but most people cannot follow. Your spiritual depth becomes a social distance, and you confuse solitude for transcendence. You feel called but rarely understood, and connection fades as you drift upward. The truth: you trade intimacy for revelation and end up alone with your insights.',
    parentType: 'gamma'
  },
  gamma_pi: {
    id: 'gamma_pi',
    name: 'Gamma-Pi',
    socialRole: 'Fortunate, Opportunistic, Gambler',
    description: 'Opportunistic, takes calculated risks. Values luck, fortune, and seizing opportunities.',
    behavioralTraits: ['opportunistic', 'risky', 'fortunate', 'gambling', 'adventurous'],
    motivations: ['opportunity', 'fortune', 'risk', 'adventure'],
    stressResponse: 'Takes bigger risks, becomes more reckless',
    growthEdge: 'Developing stability, learning to plan',
    archetypalNarrative: 'You live on the edge of chance and call it destiny. Your wins are loud, your losses are brutal, and stability always stays just out of reach. People enjoy your spark but do not trust your consistency. The truth: you gamble with your future and often lose the long game.',
    parentType: 'gamma'
  },
  dark_gamma: {
    id: 'dark_gamma',
    name: 'Dark Gamma',
    socialRole: 'Isolated, Detached, Nihilistic, Seer',
    description: 'Shadow expression of Gamma - isolated, nihilistic, sees truth but becomes consumed by it. May be prophetic but destructive.',
    behavioralTraits: ['isolation', 'nihilism', 'detachment', 'prophetic', 'destructive'],
    motivations: ['truth', 'isolation', 'nihilism', 'transcendence'],
    stressResponse: 'Becomes more isolated, deeper into nihilism',
    growthEdge: 'Finding meaning, reconnecting with life',
    archetypalNarrative: 'You see the void and start worshiping it. Your insight becomes contempt, and your detachment becomes a prison. You push people away before they can disappoint you, then call it clarity. The truth: you are not above life, you are hiding from it.',
    parentType: 'gamma',
    isShadow: true
  },

  // DELTA GROUP - Hardworking, Practical
  delta: {
    id: 'delta',
    name: 'Delta',
    socialRole: 'Hardworking but Lacks Leadership',
    description: 'Hardworking, practical, reliable worker. Values duty, service, and practical accomplishment. May lack leadership drive.',
    behavioralTraits: ['hardworking', 'practical', 'reliable', 'dutiful', 'service'],
    motivations: ['duty', 'service', 'accomplishment', 'stability'],
    stressResponse: 'Works harder, becomes more dutiful, may burn out',
    growthEdge: 'Developing leadership, learning to delegate',
    subtypes: ['delta_mu', 'dark_delta'],
    // Reproductive/Mating Success Metadata
    reproductiveSuccess: 'high', // Super practical and highly suitable for provisioning as a mate choice; achieves reproduction through practical value and reliability
    reproductiveDescription: 'Achieves reproduction through high practical value and provisioning capacity. Highly suitable as a mate choice due to reliability, practical competence, and provider qualities. Best long-term relationship potential.',
    // Archetypal Narrative - The brutal truth of this archetype's typical life pattern
    archetypalNarrative: 'You are the practical choice - reliable, stable, and good at provisioning. You achieve reproduction because you represent security and competence. Your partner chose you for your practical value, not your charisma or status. You work hard, provide well, and build stable families. But you may always wonder if your partner would have preferred an Alpha if one had been available. Your children respect you for your reliability but may not be inspired by your lack of dominance. You succeed where others fail: long-term relationships, stable families, consistent provision. The truth: you won through competence and reliability, trading excitement for stability, charisma for dependability. You are valued but perhaps not desired, respected but rarely envied.',
    explanation: 'The Delta archetype represents hardworking, practical behavioral patterns focused on duty and service. The term "Delta" refers to social positioning and behavioral tendencies toward practical work and reliability, not a ranking of value.'
  },
  delta_mu: {
    id: 'delta_mu',
    name: 'Delta-Mu',
    socialRole: 'Nurturing, Protective, Fatherly',
    description: 'Nurturing, protective presence. Fatherly qualities with focus on care and protection of others.',
    behavioralTraits: ['nurturing', 'protective', 'fatherly', 'caring', 'supportive'],
    motivations: ['care', 'protection', 'nurturing', 'family'],
    stressResponse: 'Becomes more protective, may become overbearing',
    growthEdge: 'Allowing independence, developing boundaries',
    archetypalNarrative: 'You protect everyone, then resent how little they protect you. Your worth becomes tied to being needed, and you panic when people grow independent. You keep the family running but lose yourself in the role. The truth: you become a caretaker before you become a man.',
    parentType: 'delta'
  },
  dark_delta: {
    id: 'dark_delta',
    name: 'Dark Delta',
    socialRole: 'Sacrificing, Martyr, Passive',
    description: 'Shadow expression of Delta - sacrifices self excessively, becomes martyr. Passive, may resent service.',
    behavioralTraits: ['sacrifice', 'martyrdom', 'passivity', 'resentment', 'self-neglect'],
    motivations: ['service', 'sacrifice', 'approval', 'duty'],
    stressResponse: 'Increases sacrifice, becomes more resentful',
    growthEdge: 'Learning self-care, developing healthy boundaries',
    archetypalNarrative: 'You sacrifice until you are hollow, then call it virtue. You keep giving in hopes of being chosen, but your quiet resentment leaks into everything. People rely on you, then forget you. The truth: you are a martyr to a life no one asked you to live.',
    parentType: 'delta',
    isShadow: true
  },

  // SIGMA GROUP - Independent, Self-Sufficient
  sigma: {
    id: 'sigma',
    name: 'Sigma',
    socialRole: 'Lone Wolf, Self-Sufficient, Adaptable by own authority',
    description: 'Independent, self-sufficient, operates outside social hierarchies. Values autonomy and personal authority.',
    behavioralTraits: ['independent', 'self-sufficient', 'autonomous', 'adaptable', 'lone'],
    motivations: ['autonomy', 'freedom', 'independence', 'self-reliance'],
    stressResponse: 'Becomes more isolated, increases independence',
    growthEdge: 'Learning to connect, developing interdependence',
    subtypes: ['sigma_kappa', 'sigma_lambda', 'dark_sigma_zeta'],
    // Reproductive/Mating Success Metadata
    reproductiveSuccess: 'low', // Usually misses out on reproduction due to independence and isolation; values autonomy over social connection
    reproductiveDescription: 'Typically misses out on reproduction. Independence, isolation, and operating outside social hierarchies limit mate access. Values autonomy and self-reliance over reproductive opportunities.',
    // Archetypal Narrative - The brutal truth of this archetype's typical life pattern
    archetypalNarrative: 'You operate outside the hierarchy, and women use hierarchy to read male value. Without rank they cannot place you, so most don\'t try. Your independence is real, but it makes you illegible in the market where it matters. You tell yourself you refuse to perform for approval, and that is true - but the cost is that the women who would have chosen you never got enough signal to do so. You age with your autonomy intact and your potential largely unclaimed. The truth: you stayed outside the game because you found it beneath you, and the game distributed its rewards to men who played.',
    explanation: 'The Sigma archetype represents independent, self-sufficient behavioral patterns that operate outside traditional social hierarchies. The term "Sigma" refers to autonomous positioning and behavioral tendencies toward self-reliance, not a ranking system.'
  },
  sigma_kappa: {
    id: 'sigma_kappa',
    name: 'Sigma-Kappa',
    socialRole: 'Eccentric, Unpredictable Innovator, Political Schemer, Strategist',
    description: 'Strategic, innovative, operates through indirect influence. May be eccentric or unpredictable.',
    behavioralTraits: ['strategic', 'innovative', 'eccentric', 'unpredictable', 'scheming'],
    motivations: ['influence', 'innovation', 'strategy', 'autonomy'],
    stressResponse: 'Becomes more strategic, increases manipulation',
    growthEdge: 'Developing direct communication, authentic connection',
    parentType: 'sigma',
    // Reproductive/Mating Success Metadata
    reproductiveSuccess: 'low', // Usually misses out on reproduction (Kappa category)
    reproductiveDescription: 'Typically misses out on reproduction. Eccentricity, unpredictability, and strategic indirect influence limit mate access. Values strategy and autonomy over reproductive opportunities.',
    archetypalNarrative: 'You influence from the shadows and call it freedom. Your indirect style keeps you safe but makes you forgettable. People see the schemes, not the soul, and keep you at a distance. The truth: you are clever enough to control outcomes and too distant to be loved.'
  },
  sigma_lambda: {
    id: 'sigma_lambda',
    name: 'Sigma-Lambda',
    socialRole: 'Creative, Artistic but detached, Solitary',
    description: 'Creative, artistic, but emotionally detached. Values beauty, expression, but maintains distance.',
    behavioralTraits: ['creative', 'artistic', 'detached', 'solitary', 'expressive'],
    motivations: ['beauty', 'expression', 'creativity', 'autonomy'],
    stressResponse: 'Withdraws into creativity, becomes more detached',
    growthEdge: 'Developing emotional connection, engaging with others',
    archetypalNarrative: 'You turn inward and make art instead of relationships. Your inner world becomes richer while your outer life gets thinner. People admire your talent but rarely access your heart. The truth: you are productive in creation and absent in connection.',
    parentType: 'sigma'
  },
  dark_sigma_zeta: {
    id: 'dark_sigma_zeta',
    name: 'Dark Sigma-Zeta',
    socialRole: 'Anti-Establishment, Autonomous',
    description: 'Shadow expression of Sigma - anti-establishment, revolutionary. May be destructive in pursuit of autonomy.',
    behavioralTraits: ['anti-establishment', 'revolutionary', 'destructive', 'autonomous', 'rebellious'],
    motivations: ['revolution', 'destruction', 'autonomy', 'freedom'],
    stressResponse: 'Becomes more destructive, increases rebellion',
    growthEdge: 'Finding constructive expression, developing purpose',
    archetypalNarrative: 'You burn systems down without building a place to stand. Your identity becomes opposition, and peace feels like weakness. People fear your intensity but do not follow your chaos for long. The truth: you become a rebel without a home and a destroyer without a legacy.',
    parentType: 'sigma',
    isShadow: true
  },

  // OMEGA GROUP - Social Reject, Passive
  omega: {
    id: 'omega',
    name: 'Omega',
    socialRole: 'Social Reject, Loner, Passive',
    description: 'Socially disconnected, passive, lacks social power. May be isolated or rejected by social groups.',
    behavioralTraits: ['passive', 'isolated', 'disconnected', 'loner', 'rejected'],
    motivations: ['acceptance', 'belonging', 'safety', 'avoidance'],
    stressResponse: 'Withdraws further, becomes more passive',
    growthEdge: 'Developing social skills, building confidence',
    subtypes: ['dark_omega'],
    // Reproductive/Mating Success Metadata
    reproductiveSuccess: 'low', // Usually misses out on reproduction due to social disconnection and passivity
    reproductiveDescription: 'Typically misses out on reproduction. Social disconnection, passivity, and low social power prevent mate access. Lack of assertiveness and social skills limit reproductive opportunities.',
    // Archetypal Narrative - The brutal truth of this archetype's typical life pattern
    archetypalNarrative: 'You have withdrawn from the social competition and told yourself it was a choice. It wasn\'t. Your passivity, social disconnection, and difficulty with assertiveness mean that you don\'t register as a viable option to the people you want. You watch others achieve connection and status that feel inaccessible to you, and over time the watching becomes your identity. Bitterness and retreat reinforce each other. The pattern is not fixed - but it does not change without confrontation. The truth: you are not losing because the game is rigged, you are losing because you are not playing, and every year outside the arena makes re-entry harder.',
    explanation: 'The Omega archetype represents passive, socially disconnected behavioral patterns. The term "Omega" refers to social positioning and behavioral tendencies toward isolation or withdrawal, not a judgment of worth. This pattern may reflect current circumstances rather than fixed identity.'
  },
  dark_omega: {
    id: 'dark_omega',
    name: 'Dark Omega',
    socialRole: 'Destructive, Entropic, Consumptive',
    description: 'Shadow expression of Omega - destructive, entropic, consumes without creating. May be nihilistic or self-destructive.',
    behavioralTraits: ['destructive', 'entropic', 'consumptive', 'nihilistic', 'self-destructive'],
    motivations: ['destruction', 'consumption', 'chaos', 'nihilism'],
    stressResponse: 'Becomes more destructive, increases consumption',
    growthEdge: 'Finding purpose, developing creation over consumption',
    archetypalNarrative: 'You take without building and call it survival. Your pain becomes your excuse, and your bitterness becomes your identity. You drain the few who try to help and confirm your belief that nothing changes. The truth: you are not only ignored, you become a warning to others.',
    parentType: 'omega',
    isShadow: true
  },

  // PHI GROUP - Transcendent
  phi: {
    id: 'phi',
    name: 'Phi',
    socialRole: 'Fully Ascended, Beyond Society, Transcendent',
    description: 'Transcendent, operates beyond social hierarchies. Fully integrated, beyond typical archetypal patterns.',
    behavioralTraits: ['transcendent', 'integrated', 'beyond', 'ascended', 'enlightened'],
    motivations: ['transcendence', 'integration', 'enlightenment', 'service'],
    stressResponse: 'Maintains equanimity, responds with wisdom',
    growthEdge: 'Continuing integration, serving others',
    isRare: true,
    archetypalNarrative: 'You have moved beyond the status hierarchy, and that costs you more than you expected. Women calibrate male worth through rank, dominance signals, and social proof — you offer none of these, and most cannot read what you are instead. Men respect you but do not follow you, because you are not competing. You have peace, but peace does not distribute the rewards the hierarchy distributes. Other men accumulate while you transcend, and transcendence does not build a family or a legacy by itself. The truth: you won the inner game and opted out of the outer one, and the outer one kept going without you.',
    explanation: 'The Phi archetype represents transcendent, fully integrated behavioral patterns that operate beyond typical social hierarchies. The term "Phi" refers to a state of integration and transcendence, representing someone who has moved beyond typical archetypal patterns into a more integrated expression.'
  },

  // FEMALE ARCHETYPES - Distinct characteristics from male archetypes
  alpha_female: {
    id: 'alpha_female',
    name: 'Alpha Female',
    socialRole: 'High-Value, Beautiful, Desired',
    description: 'Naturally attractive and socially sought-after. Commands attention through presence, beauty, and social value. Comfortable with being desired and setting standards.',
    behavioralTraits: ['attractiveness', 'social_value', 'selectivity', 'presence', 'standards'],
    motivations: ['recognition', 'desirability', 'status', 'quality'],
    stressResponse: 'Becomes more selective, may become controlling or chaotic',
    growthEdge: 'Developing inner value beyond external validation, emotional intelligence',
    subtypes: ['alpha_xi_female', 'alpha_unicorn_female', 'alpha_iota_female', 'dark_alpha_female'],
    jungianEquivalent: 'Queen',
    vedicEquivalent: 'Shakti (Cosmic Power)',
    greekPantheon: 'Hera (Queen, Power)',
    tarotCard: 'The Empress',
    socialProportion: 3.0,
    archetypalNarrative: 'You are pursued constantly, but your power has an expiry window that most women in your position do not acknowledge until it is closing. Right now you can select — but selection is not the same as genuine bond, and the men circling you want access, not depth. Your standards protect you and your time is finite. The women who convert peak mate value into a lasting partnership do so deliberately and early. The ones who wait for perfect while managing options tend to find the field has changed by the time they are ready to commit. The truth: you are desired by many, truly known by few, and the window to exchange that desire for something real is shorter than it feels.',
    explanation: 'The Alpha Female archetype represents high social value and desirability. This archetype naturally attracts attention and sets standards in social contexts. The term refers to social positioning and behavioral patterns related to attractiveness and social value, not a ranking of worth.'
  },
  alpha_xi_female: {
    id: 'alpha_xi_female',
    name: 'Alpha-Xi Female',
    socialRole: 'Awakened, Selective, Elite Judge',
    description: 'Highly selective and discerning. Values quality over quantity. Judges potential partners and situations with high standards.',
    behavioralTraits: ['selectivity', 'discernment', 'standards', 'awakening', 'judgment'],
    motivations: ['quality', 'excellence', 'selectivity', 'awakening'],
    stressResponse: 'Becomes more selective, may become judgmental',
    growthEdge: 'Balancing standards with openness, developing compassion',
    parentType: 'alpha_female',
    jungianEquivalent: 'Seer (Magician)',
    vedicEquivalent: 'Gayatri (Enlightenment)',
    greekPantheon: 'Nemesis (Retribution)',
    tarotCard: 'King of Swords',
    archetypalNarrative: 'You rarely choose, so you rarely lose. Your standards keep you safe but also keep you alone. Men are tested and dismissed, and you quietly wonder why so few feel worthy. The truth: your discernment protects you from bad partners and blocks good ones.'
  },
  alpha_unicorn_female: {
    id: 'alpha_unicorn_female',
    name: 'Alpha-Unicorn Female',
    socialRole: 'Ideal, Submissive, Loyal',
    description: 'Represents the ideal partner - beautiful, loyal, and submissive to the right partner. Values devotion and fidelity.',
    behavioralTraits: ['loyalty', 'devotion', 'fidelity', 'idealism', 'submission'],
    motivations: ['devotion', 'fidelity', 'partnership', 'idealism'],
    stressResponse: 'Becomes more dependent, may lose sense of self',
    growthEdge: 'Developing independence while maintaining loyalty',
    parentType: 'alpha_female',
    jungianEquivalent: 'Maiden (Lover)',
    vedicEquivalent: 'Sita (Virtue, Devotion)',
    greekPantheon: 'Penelope (Fidelity)',
    tarotCard: 'Two of Cups',
    archetypalNarrative: 'Your loyalty and devotion are rare, and the wrong men know it. You give commitment before it has been earned because bonding feels more important than vetting, and men who want a deeply loyal woman without deserving one find you first. You maintain the bond long past the point where it should have ended because leaving feels like failure to you. The men who would actually honour your devotion rarely get through to you because you are already given. The truth: your greatest quality is your greatest vulnerability — you give loyalty freely, and not everyone who receives it deserves it.'
  },
  alpha_iota_female: {
    id: 'alpha_iota_female',
    name: 'Alpha-Iota Female',
    socialRole: 'Balanced, Harmonious, Pure',
    description: 'Balanced and harmonious presence. Values purity, grace, and maintaining equilibrium in relationships and life.',
    behavioralTraits: ['balance', 'harmony', 'purity', 'grace', 'equilibrium'],
    motivations: ['harmony', 'balance', 'purity', 'grace'],
    stressResponse: 'Seeks to restore balance, may become passive',
    growthEdge: 'Embracing necessary conflict, developing assertiveness',
    parentType: 'alpha_female',
    jungianEquivalent: 'Healer (Lover-Magician)',
    vedicEquivalent: 'Gauri (Harmony, Grace)',
    greekPantheon: 'Harmonia (Concord)',
    tarotCard: 'Four of Wands',
    archetypalNarrative: 'You keep the peace, but peace becomes your prison. You smooth conflict until your own needs vanish. Others enjoy your stability while you quietly absorb the cost. The truth: harmony without assertion turns you into the one who always yields.'
  },
  dark_alpha_female: {
    id: 'dark_alpha_female',
    name: 'Dark Alpha Female',
    socialRole: 'Over-controlling, Chaotic',
    description: 'Shadow expression of Alpha Female - uses attractiveness and social power destructively. Controlling, chaotic, manipulative.',
    behavioralTraits: ['control', 'chaos', 'manipulation', 'tyranny', 'destruction'],
    motivations: ['power', 'control', 'chaos', 'destruction'],
    stressResponse: 'Becomes more controlling and chaotic',
    growthEdge: 'Healing power wounds, developing healthy authority',
    parentType: 'alpha_female',
    isShadow: true,
    jungianEquivalent: 'Tyrant Queen (Shadow King)',
    vedicEquivalent: 'Kali (Chaos, Power)',
    greekPantheon: 'Eris (Discord)',
    tarotCard: 'The Tower',
    archetypalNarrative: 'You use attraction as leverage and call it empowerment. You win through control and chaos, leaving a trail of broken bonds. Men fear you or chase you for the wrong reasons, and trust never survives. The truth: you are powerful but toxic, and your dominance leaves you alone.'
  },
  beta_female: {
    id: 'beta_female',
    name: 'Beta Female',
    socialRole: 'Low-Value, Resource-Seeking',
    description: 'Seeks resources and security through relationships. May lack high social value but compensates through other means. Focused on survival and security.',
    behavioralTraits: ['resource-seeking', 'survival', 'security', 'dependency', 'adaptation'],
    motivations: ['security', 'resources', 'survival', 'stability'],
    stressResponse: 'Becomes more resource-seeking, may become manipulative',
    growthEdge: 'Developing self-sufficiency, building intrinsic value',
    subtypes: ['beta_nu_female', 'beta_kappa_female', 'beta_rho_female'],
    jungianEquivalent: 'Distorted Lover',
    vedicEquivalent: 'Rati (Love, Attachment)',
    greekPantheon: 'Echo (Unreciprocated Love)',
    tarotCard: 'Five of Pentacles',
    socialProportion: 20.0,
    archetypalNarrative: 'Security felt urgent, and you moved toward it faster than you moved toward what you actually wanted. You accepted a bond that was adequate before confirming it was chosen — by him, and by you. The relationship functions, but you sometimes notice that it was built on availability and need rather than genuine selection. You are dependable in it, and so is he, and neither of you is fully lit up by the other. The resentment that accumulates is not about what he does wrong — it is about what you quietly know you traded away. The truth: you chose safety over desire and are now loyal to a life that does not quite fit.',
    explanation: 'The Beta Female archetype represents resource-seeking and security-focused behavioral patterns. This archetype prioritizes survival and stability, often through relationships. The term refers to social positioning and behavioral tendencies, not a ranking of value.'
  },
  beta_nu_female: {
    id: 'beta_nu_female',
    name: 'Beta-Nu Female',
    socialRole: 'Traditionalist, Dutiful, Settler',
    description: 'Values tradition, duty, and long-term commitment. Dutiful partner who prioritizes stability and family.',
    behavioralTraits: ['tradition', 'duty', 'loyalty', 'stability', 'commitment'],
    motivations: ['stability', 'tradition', 'security', 'family'],
    stressResponse: 'Clings to tradition, becomes more rigid',
    growthEdge: 'Embracing change, developing flexibility',
    parentType: 'beta_female',
    jungianEquivalent: 'Dutiful Queen (Queen-Lover)',
    vedicEquivalent: 'Savitri (Loyalty, Sacrifice)',
    greekPantheon: 'Hestia (Home, Duty)',
    tarotCard: 'The Hierophant',
    archetypalNarrative: 'You committed to the traditional role and gave it everything. The home is well kept, the family is stable, and your loyalty is beyond question. But somewhere along the way your role consumed your identity, and the woman your partner first found desirable has been entirely replaced by the woman who manages the household. He is grateful; he is not lit up. You feel it but do not know how to reclaim what slowly disappeared. The truth: you became so completely the dutiful partner that the part of you he was once drawn to has gone invisible inside the role.'
  },
  beta_kappa_female: {
    id: 'beta_kappa_female',
    name: 'Beta-Kappa Female',
    socialRole: 'Hypergamous, Deceptive, Chaotic',
    description: 'Uses manipulation and deception to gain resources or move up socially. Hypergamous - seeks partners of higher status.',
    behavioralTraits: ['manipulation', 'deception', 'hypergamy', 'chaos', 'resource-seeking'],
    motivations: ['resources', 'status', 'advantage', 'security'],
    stressResponse: 'Becomes more manipulative and deceptive',
    growthEdge: 'Developing authentic value, honest communication',
    parentType: 'beta_female',
    isShadow: true,
    jungianEquivalent: 'Devourer (Shadow Lover)',
    vedicEquivalent: 'Mohini (Illusion, Seduction)',
    greekPantheon: 'Circe (Enchantment)',
    tarotCard: 'Seven of Swords',
    archetypalNarrative: 'You climb through seduction and strategy, then wonder why trust never lasts. You extract value and call it survival, but people feel the extraction. Your relationships are transactions, not bonds. The truth: you can win the game and still lose intimacy.'
  },
  beta_rho_female: {
    id: 'beta_rho_female',
    name: 'Beta-Rho Female',
    socialRole: 'Creator, Motherly, Controlling',
    description: 'Nurturing and motherly, but may use this role to control. Values creation, fertility, and family.',
    behavioralTraits: ['nurturing', 'motherly', 'creation', 'control', 'fertility'],
    motivations: ['creation', 'nurturing', 'family', 'control'],
    stressResponse: 'Becomes more controlling, may become martyr',
    growthEdge: 'Developing healthy boundaries, releasing control',
    parentType: 'beta_female',
    jungianEquivalent: 'Weaver (Queen-Lover)',
    vedicEquivalent: 'Parvati (Motherhood, Fertility)',
    greekPantheon: 'Gaia (Earth Mother)',
    tarotCard: 'Queen of Pentacles',
    archetypalNarrative: 'You nurture, create, and control the environment, but your care becomes a management system. You hold the family together and quietly feel trapped by the role. People rely on your competence and forget your desires. The truth: your love becomes labor.'
  },
  gamma_female: {
    id: 'gamma_female',
    name: 'Gamma Female',
    socialRole: 'Intellectual, Quirky, Resentful',
    description: 'Intellectual and independent, but may carry resentment. Values knowledge and authenticity over social conformity.',
    behavioralTraits: ['intellectual', 'quirky', 'resentful', 'independent', 'authentic'],
    motivations: ['knowledge', 'authenticity', 'independence', 'truth'],
    stressResponse: 'Becomes more resentful, may isolate',
    growthEdge: 'Releasing resentment, developing emotional intelligence',
    subtypes: ['gamma_theta_female', 'gamma_feminist_female', 'dark_gamma_female'],
    jungianEquivalent: 'Magician (Rebellious)',
    vedicEquivalent: 'Saraswati (Knowledge, Art)',
    greekPantheon: 'Hecate (Mysticism)',
    tarotCard: 'The Magician',
    socialProportion: 8.0,
    archetypalNarrative: 'You are intelligent and perceptive, and your standards for partnership are high and specific. Most men who approach you cannot meet them, and the ones who could are often put off by your critical edge before they get close enough to try. You end up surrounded by men who admire you from a distance and partners who feel assessed rather than wanted. You analyse the patterns in your relationships accurately and change almost nothing as a result. The truth: you can see exactly what is wrong with every man you meet and cannot see what you are doing that keeps the right ones from staying.',
    explanation: 'The Gamma Female archetype represents intellectual independence and non-conformity. This archetype values authenticity and knowledge over social acceptance. The term refers to behavioral patterns of intellectual rebellion and independence.'
  },
  gamma_theta_female: {
    id: 'gamma_theta_female',
    name: 'Gamma-Theta Female',
    socialRole: 'Visionary, Argumentative, Oracle',
    description: 'Visionary and prophetic, but may be argumentative. Values truth and wisdom, serves as an oracle or seer.',
    behavioralTraits: ['visionary', 'argumentative', 'oracle', 'wisdom', 'truth'],
    motivations: ['wisdom', 'truth', 'vision', 'enlightenment'],
    stressResponse: 'Becomes more argumentative, may become isolated',
    growthEdge: 'Developing compassion, learning to communicate gently',
    parentType: 'gamma_female',
    jungianEquivalent: 'Wise Woman (High Priestess)',
    vedicEquivalent: 'Durga (Protection, Defiance)',
    greekPantheon: 'Bellona (War, Ruthlessness)',
    tarotCard: 'Queen of Wands',
    archetypalNarrative: 'You see patterns others miss, but you speak like a blade. Your honesty cuts through illusion and also through intimacy. People admire your fire and fear your confrontation. The truth: your wisdom wins debates and loses softness.'
  },
  gamma_feminist_female: {
    id: 'gamma_feminist_female',
    name: 'Gamma-Feminist Female',
    socialRole: 'Career-Focused, Post-Wall, Bitter',
    description: 'Career-focused and independent, but may carry bitterness about relationships or missed opportunities. Values professional achievement.',
    behavioralTraits: ['career-focused', 'independent', 'bitter', 'professional', 'achievement'],
    motivations: ['achievement', 'independence', 'professional', 'autonomy'],
    stressResponse: 'Becomes more bitter, may become isolated',
    growthEdge: 'Releasing bitterness, developing emotional connection',
    parentType: 'gamma_female',
    jungianEquivalent: 'Rebel Scholar (Magician)',
    vedicEquivalent: 'Tara (Compassion, Wisdom)',
    greekPantheon: 'Athena (Wisdom, Strategy)',
    tarotCard: 'Nine of Swords',
    archetypalNarrative: 'You optimised for achievement during the years when your options in partnership were at their widest, and you told yourself that the relationship piece could wait. It could — but not indefinitely. The men who would have been most compatible with you were forming bonds with women who were available when you were not. Your competence and independence are real, but they signal low need, and men who want to be genuinely needed move elsewhere. You wake up accomplished, self-sufficient, and quietly aware that the window you assumed was always open has been narrowing for years. The truth: you chose the right strategy for your career and the wrong timing for everything else.'
  },
  dark_gamma_female: {
    id: 'dark_gamma_female',
    name: 'Dark Gamma Female',
    socialRole: 'Isolated, Nihilistic, Detached',
    description: 'Shadow expression of Gamma Female - isolated, nihilistic, and detached. May reject all connection and meaning.',
    behavioralTraits: ['isolation', 'nihilism', 'detachment', 'rejection', 'despair'],
    motivations: ['isolation', 'rejection', 'nihilism', 'despair'],
    stressResponse: 'Becomes more isolated and nihilistic',
    growthEdge: 'Finding meaning, developing connection',
    parentType: 'gamma_female',
    isShadow: true,
    jungianEquivalent: 'Crone (Shadow Magician)',
    vedicEquivalent: 'Dhumavati (Misfortune, Isolation)',
    greekPantheon: 'Nyx (Darkness)',
    tarotCard: 'Five of Cups',
    archetypalNarrative: 'You reject connection before it rejects you. Your intellect turns into contempt, and your isolation feels justified. You wear despair as armor and call it realism. The truth: you are not too deep for love, you are too closed to it.'
  },
  delta_female: {
    id: 'delta_female',
    name: 'Delta Female',
    socialRole: 'Nurturing, Supportive, Homemaker',
    description: 'Nurturing and supportive, values home and family. Creates warmth and stability for others.',
    behavioralTraits: ['nurturing', 'supportive', 'homemaker', 'warmth', 'stability'],
    motivations: ['nurturing', 'family', 'home', 'stability'],
    stressResponse: 'Becomes more sacrificing, may become martyr',
    growthEdge: 'Developing self-care, setting boundaries',
    subtypes: ['delta_mu_female', 'dark_delta_female'],
    jungianEquivalent: 'Weaver (Queen-Lover)',
    vedicEquivalent: 'Aditi (Light, Nurturing)',
    greekPantheon: 'Demeter (Harvest)',
    tarotCard: 'Ten of Pentacles',
    socialProportion: 10.0,
    archetypalNarrative: 'You are warm, competent, and deeply reliable — and that reliability has become your entire relational identity. Your partner is grateful for what you create, but gratitude and desire are not the same thing, and you sense the gap. You have made yourself so functionally indispensable that there is no space left to be a woman he pursues. You became the home instead of the person he comes home to. The truth: you gave your care so completely that your desirability disappeared into it, and now you are a fixture in a life that runs on what you do rather than who you are.',
    explanation: 'The Delta Female archetype represents nurturing and supportive behavioral patterns focused on home and family. This archetype creates warmth and stability for others, often prioritizing the needs of others over self.'
  },
  delta_mu_female: {
    id: 'delta_mu_female',
    name: 'Delta-Mu Female',
    socialRole: 'Radiant, Joyful, Life-Giver',
    description: 'Radiant and joyful presence. Brings life and light to others. Values joy, celebration, and renewal.',
    behavioralTraits: ['radiant', 'joyful', 'life-giving', 'celebration', 'renewal'],
    motivations: ['joy', 'life', 'celebration', 'renewal'],
    stressResponse: 'May lose joy, becomes more serious',
    growthEdge: 'Maintaining joy through challenges, developing resilience',
    parentType: 'delta_female',
    jungianEquivalent: 'Light Maiden (Lover)',
    vedicEquivalent: 'Lakshmi (Prosperity, Nurturing)',
    greekPantheon: 'Eos (Dawn, Renewal)',
    tarotCard: 'The Sun',
    archetypalNarrative: 'You bring light to people, but they start to expect it. Your joy becomes a service, and you hide your darkness to keep others comfortable. When you finally need support, few know how to give it. The truth: you carry the mood of the room and pay for it alone.'
  },
  dark_delta_female: {
    id: 'dark_delta_female',
    name: 'Dark Delta Female',
    socialRole: 'Sacrificing, Martyr, Passive',
    description: 'Shadow expression of Delta Female - sacrifices self completely, becomes martyr. May lose sense of self in service to others.',
    behavioralTraits: ['sacrifice', 'martyr', 'passive', 'self-neglect', 'codependency'],
    motivations: ['sacrifice', 'service', 'martyrdom', 'approval'],
    stressResponse: 'Becomes more sacrificing, may become resentful',
    growthEdge: 'Developing self-care, healthy boundaries',
    parentType: 'delta_female',
    isShadow: true,
    jungianEquivalent: 'Distorted Weaver',
    vedicEquivalent: 'Annapurna (Self-Sustaining)',
    greekPantheon: 'Hestia (Martyrdom)',
    tarotCard: 'Four of Cups',
    archetypalNarrative: 'You give until there is nothing left, then resent everyone for taking. You stay because you fear being unwanted, and you become bitter inside the role you chose. People accept your sacrifice and do not notice your pain. The truth: you disappear in the name of love and call it loyalty.'
  },
  sigma_female: {
    id: 'sigma_female',
    name: 'Sigma Female',
    socialRole: 'Independent, Elusive, High-Value',
    description: 'Independent and elusive, maintains high value through autonomy. Values freedom and self-sufficiency.',
    behavioralTraits: ['independence', 'elusive', 'autonomy', 'self-sufficiency', 'freedom'],
    motivations: ['freedom', 'autonomy', 'independence', 'self-sufficiency'],
    stressResponse: 'Becomes more independent, may become isolated',
    growthEdge: 'Developing connection while maintaining autonomy',
    subtypes: ['sigma_feminist_female', 'dark_sigma_zeta_female'],
    jungianEquivalent: 'Maiden (Lover-Magician)',
    vedicEquivalent: 'Chamunda (Autonomy)',
    greekPantheon: 'Artemis (Huntress)',
    tarotCard: 'The Fool',
    socialProportion: 3.0,
    archetypalNarrative: 'Your independence is genuine and it works — right up until the level where real partnership requires something you have not practised giving. The men you attract most easily want you as an experience. The men capable of genuine depth read your self-sufficiency as a closed door and do not push through it. You win the early game with ease and find the later game strange and unfamiliar. The truth: your autonomy is your greatest asset and the reason the deepest bonds stay just out of reach.',
    explanation: 'The Sigma Female archetype represents independence and autonomy. This archetype maintains high value through self-sufficiency and freedom from dependency. The term refers to behavioral patterns of independence and elusiveness.'
  },
  sigma_feminist_female: {
    id: 'sigma_feminist_female',
    name: 'Sigma-Feminist Female',
    socialRole: 'Self-Sustaining, Unyielding',
    description: 'Completely self-sustaining and unyielding. Values independence above all, may reject traditional roles.',
    behavioralTraits: ['self-sustaining', 'unyielding', 'independence', 'rejection', 'autonomy'],
    motivations: ['independence', 'autonomy', 'self-sufficiency', 'rejection'],
    stressResponse: 'Becomes more unyielding, may become rigid',
    growthEdge: 'Developing flexibility, allowing interdependence',
    parentType: 'sigma_female',
    jungianEquivalent: 'Distorted Maiden',
    vedicEquivalent: 'Tara (Self-Sustaining Wisdom)',
    greekPantheon: 'Athena (Independent Strategy)',
    tarotCard: 'Queen of Swords',
    archetypalNarrative: 'You reject dependence so strongly that partnership feels like a threat. You win respect but struggle to receive affection. Your stance protects you from loss and also blocks intimacy. The truth: you are unyielding and therefore alone by design.'
  },
  dark_sigma_zeta_female: {
    id: 'dark_sigma_zeta_female',
    name: 'Dark Sigma-Zeta Female',
    socialRole: 'Anti-Establishment, Fierce Autonomy',
    description: 'Shadow expression of Sigma Female - fiercely anti-establishment, may reject all connection and structure.',
    behavioralTraits: ['anti-establishment', 'fierce', 'autonomy', 'rejection', 'rebellion'],
    motivations: ['rebellion', 'rejection', 'autonomy', 'defiance'],
    stressResponse: 'Becomes more rebellious and isolated',
    growthEdge: 'Finding healthy structure, developing connection',
    parentType: 'sigma_female',
    isShadow: true,
    jungianEquivalent: 'Revolutionary Outcast',
    vedicEquivalent: 'Kali (Fierce Autonomy)',
    greekPantheon: 'Nemesis (Defiance)',
    tarotCard: 'Eight of Wands',
    archetypalNarrative: 'You burn bridges before anyone can cross them. Your defiance feels like strength, but it isolates you. You challenge every structure, then wonder why you have no shelter. The truth: you trade belonging for rebellion and call it freedom.'
  },
  omega_female: {
    id: 'omega_female',
    name: 'Omega Female',
    socialRole: 'Undesirable, Isolated, Nihilistic',
    description: 'Socially undesirable and isolated. May carry nihilism and despair. Struggles with connection and value.',
    behavioralTraits: ['isolation', 'nihilism', 'despair', 'undesirability', 'rejection'],
    motivations: ['isolation', 'rejection', 'despair', 'nihilism'],
    stressResponse: 'Becomes more isolated and despairing',
    growthEdge: 'Finding value, developing connection, healing',
    subtypes: ['dark_omega_female'],
    jungianEquivalent: 'Crone (Shadow Priestess)',
    vedicEquivalent: 'Dhumavati (Misfortune, Isolation)',
    greekPantheon: 'Nyx (Darkness)',
    tarotCard: 'Four of Swords',
    socialProportion: 4.0,
    archetypalNarrative: 'You feel unseen, and the feeling becomes your identity. You withdraw, then blame the world for not reaching you. You may want love but believe you are unlovable. The truth: your isolation keeps you safe and keeps you stuck.',
    explanation: 'The Omega Female archetype represents social isolation and despair. This archetype struggles with connection and may carry nihilism. The term refers to behavioral patterns of isolation and social difficulty, not a ranking of worth.'
  },
  dark_omega_female: {
    id: 'dark_omega_female',
    name: 'Dark Omega Female',
    socialRole: 'Destructive, Entropic, Consumptive',
    description: 'Shadow expression of Omega Female - destructive, entropic, and consumptive. May actively destroy or consume.',
    behavioralTraits: ['destruction', 'entropy', 'consumption', 'chaos', 'despair'],
    motivations: ['destruction', 'chaos', 'consumption', 'despair'],
    stressResponse: 'Becomes more destructive and chaotic',
    growthEdge: 'Finding meaning, developing creation over destruction',
    parentType: 'omega_female',
    isShadow: true,
    jungianEquivalent: 'Devourer (Shadow Lover)',
    vedicEquivalent: 'Chamunda (Destruction)',
    greekPantheon: 'Eris (Chaos)',
    tarotCard: 'Ten of Swords',
    archetypalNarrative: 'You consume what you cannot build and call it justice. Your pain becomes a weapon, and your relationships become collateral damage. You burn down what might have healed you. The truth: you stay broken because breaking feels like power.'
  },
  phi_female: {
    id: 'phi_female',
    name: 'Phi Female',
    socialRole: 'Transcendent, Beyond Society',
    description: 'Fully ascended, beyond social games and structures. Transcendent and at peace.',
    behavioralTraits: ['transcendence', 'peace', 'ascension', 'wisdom', 'liberation'],
    motivations: ['transcendence', 'liberation', 'wisdom', 'peace'],
    stressResponse: 'Maintains peace, remains centered',
    growthEdge: 'Continuing evolution, serving others from transcendence',
    jungianEquivalent: 'Saint (Transcended Lover)',
    vedicEquivalent: 'Sita in Exile (Purity, Grace)',
    greekPantheon: 'Eirene (Peace)',
    tarotCard: 'The World',
    socialProportion: 0.01,
    archetypalNarrative: 'You live beyond the game, and most people cannot meet you there. Your peace is real, but it makes ordinary life feel distant. You are respected, sometimes idealized, and often lonely. The truth: transcendence grants freedom and removes the comfort of the crowd.',
    explanation: 'The Phi Female archetype represents full transcendence beyond social structures and games. This archetype has ascended beyond the need for external validation and operates from a place of inner peace and wisdom.'
  }
};

export const CORE_GROUPS = {
  alpha: ['alpha', 'alpha_xi', 'alpha_rho', 'dark_alpha'],
  beta: ['beta', 'beta_iota', 'beta_nu', 'beta_kappa', 'beta_rho'],
  gamma: ['gamma', 'gamma_nu', 'gamma_theta', 'gamma_pi', 'dark_gamma'],
  delta: ['delta', 'delta_mu', 'dark_delta'],
  sigma: ['sigma', 'sigma_kappa', 'sigma_lambda', 'dark_sigma_zeta'],
  omega: ['omega', 'dark_omega'],
  phi: ['phi']
};

// Gender-neutral mapping (archetypes apply regardless of gender)
export const GENDER_NEUTRAL_MAPPING = {
  // Male archetypes map to gender-neutral behavioral patterns
  'Alpha Male': 'alpha',
  'Alpha-Xi Male': 'alpha_xi',
  'Alpha-Rho Male': 'alpha_rho',
  'Dark Alpha Male': 'dark_alpha',
  'Beta Male': 'beta',
  'Beta-Iota Male': 'beta_iota',
  'Beta-Nu Male': 'beta_nu',
  'Beta-Manipulator Male': 'beta_kappa',
  'Beta-Kappa Male': 'beta_kappa',
  'Beta-Rho Male': 'beta_rho',
  'Gamma Male': 'gamma',
  'Gamma-Nu Male': 'gamma_nu',
  'Gamma-Theta Male': 'gamma_theta',
  'Gamma-Pi Male': 'gamma_pi',
  'Dark Gamma Male': 'dark_gamma',
  'Delta Male': 'delta',
  'Delta-Mu Male': 'delta_mu',
  'Sigma Male': 'sigma',
  'Sigma-Kappa Male': 'sigma_kappa',
  'Sigma-Lambda Male': 'sigma_lambda',
  'Dark Sigma-Zeta Male': 'dark_sigma_zeta',
  'Omega Male': 'omega',
  'Dark Omega Male': 'dark_omega',
  'Phi Male': 'phi',
  // Female archetypes map to same behavioral patterns
  'Alpha Female': 'alpha',
  'Alpha-Xi Female': 'alpha_xi',
  'Alpha-Unicorn Female': 'beta_iota', // Maps to Beta-Iota (innocent, ideal)
  'Alpha-Iota Female': 'beta_iota',
  'Dark Alpha Female': 'dark_alpha',
  'Beta Female': 'beta',
  'Beta-Nu Female': 'beta_nu',
  'Beta-Manipulator Female': 'beta_kappa',
  'Beta-Kappa Female': 'beta_kappa',
  'Beta-Rho Female': 'beta_rho',
  'Gamma Female': 'gamma',
  'Gamma-Theta Female': 'gamma_theta',
  'Gamma-Feminist Female': 'gamma',
  'Dark Gamma Female': 'dark_gamma',
  'Delta Female': 'delta',
  'Delta-Mu Female': 'delta_mu',
  'Dark Delta Female': 'dark_delta',
  'Sigma Female': 'sigma',
  'Sigma-Feminist Female': 'sigma',
  'Dark Sigma-Zeta Female': 'dark_sigma_zeta',
  'Omega Female': 'omega',
  'Dark Omega Female': 'dark_omega',
  'Phi Female': 'phi'
};

export const ARCHETYPE_OPTIMIZATION = {
  alpha: {
    likelyBlindSpot: 'Dominance focus can dismiss collaboration and emotional nuance.',
    optimizationStrategy: 'Lead by building allies, delegating well, and tying power to service.'
  },
  alpha_xi: {
    likelyBlindSpot: 'Protector identity can turn into rigidity and overextension.',
    optimizationStrategy: 'Choose battles, rest strategically, and pair courage with flexibility.'
  },
  alpha_rho: {
    likelyBlindSpot: 'Justice focus can become cold and unforgiving.',
    optimizationStrategy: 'Balance law with mercy and use authority to build trust.'
  },
  dark_alpha: {
    likelyBlindSpot: 'Control obsession creates fear, enemies, and isolation.',
    optimizationStrategy: 'Discipline power through accountability and channel intensity into protection, not domination.'
  },
  beta: {
    likelyBlindSpot: 'Harmony seeking can erase your needs and build resentment.',
    optimizationStrategy: 'Set boundaries, build competence, and seek reciprocal partnerships.'
  },
  beta_iota: {
    likelyBlindSpot: 'Innocence invites exploitation and dependency.',
    optimizationStrategy: 'Keep kindness while practicing discernment and assertive self-protection.'
  },
  beta_nu: {
    likelyBlindSpot: 'Stability-first mindset can stagnate growth.',
    optimizationStrategy: 'Introduce controlled novelty and personal ambition within loyal structures.'
  },
  beta_kappa: {
    likelyBlindSpot: 'Approval seeking undermines respect and self-trust.',
    optimizationStrategy: 'Hold principles, build value, and earn access through competence.'
  },
  beta_rho: {
    likelyBlindSpot: 'Care becomes control and suffocates others.',
    optimizationStrategy: 'Empower through autonomy and share responsibility in your systems.'
  },
  gamma: {
    likelyBlindSpot: 'Intellectual distance blocks warmth and intimacy.',
    optimizationStrategy: 'Translate insight into empathy and practice social engagement.'
  },
  gamma_nu: {
    likelyBlindSpot: 'Idealism rejects imperfect partners.',
    optimizationStrategy: 'Anchor romance in consistent action and realistic standards.'
  },
  gamma_theta: {
    likelyBlindSpot: 'Visionary focus detaches from everyday reality.',
    optimizationStrategy: 'Ground insight with routine, embodiment, and service.'
  },
  gamma_pi: {
    likelyBlindSpot: 'Risk hunger undermines stability.',
    optimizationStrategy: 'Use calculated gambles backed by a secure base.'
  },
  dark_gamma: {
    likelyBlindSpot: 'Cynicism fuels isolation and meaninglessness.',
    optimizationStrategy: 'Use skepticism to refine goals, then commit to one community.'
  },
  delta: {
    likelyBlindSpot: 'Hard work without agency breeds quiet resentment.',
    optimizationStrategy: 'Own your craft, negotiate value, and seek leadership by competence.'
  },
  delta_mu: {
    likelyBlindSpot: 'Caretaking slides into martyrdom.',
    optimizationStrategy: 'Ask for support, set limits, and protect your energy.'
  },
  dark_delta: {
    likelyBlindSpot: 'Resentment sabotages loyalty and productivity.',
    optimizationStrategy: 'Name needs directly and rebuild agreements from self-respect.'
  },
  sigma: {
    likelyBlindSpot: 'Independence can become detachment.',
    optimizationStrategy: 'Choose selective alliances and communicate boundaries clearly.'
  },
  sigma_kappa: {
    likelyBlindSpot: 'Strategy without loyalty erodes trust.',
    optimizationStrategy: 'Use cunning for mutual benefit and show consistent character.'
  },
  sigma_lambda: {
    likelyBlindSpot: 'Solitude becomes avoidance.',
    optimizationStrategy: 'Pursue mastery projects and share outcomes with a trusted circle.'
  },
  dark_sigma_zeta: {
    likelyBlindSpot: 'Defiance becomes self-destruction.',
    optimizationStrategy: 'Channel rebellion into principled innovation and long-term goals.'
  },
  omega: {
    likelyBlindSpot: 'Self-neglect reinforces marginalization.',
    optimizationStrategy: 'Build micro-wins, routines, and supportive environments.'
  },
  dark_omega: {
    likelyBlindSpot: 'Destruction becomes identity and burns bridges.',
    optimizationStrategy: 'Interrupt cycles with accountability and acts of repair.'
  },
  phi: {
    likelyBlindSpot: 'Transcendence can drift into disconnection.',
    optimizationStrategy: 'Ground wisdom through mentorship and community contribution.'
  },
  alpha_female: {
    likelyBlindSpot: 'High value can isolate and intensify rivalry.',
    optimizationStrategy: 'Lead with social intelligence, build loyal allies, and choose partners who value depth.'
  },
  alpha_xi_female: {
    likelyBlindSpot: 'Hyper-selectivity can narrow options and harden judgment.',
    optimizationStrategy: 'Keep standards while practicing openness and compassion.'
  },
  alpha_unicorn_female: {
    likelyBlindSpot: 'Devotion risks dependence and loss of self.',
    optimizationStrategy: 'Balance loyalty with autonomy and clear boundaries.'
  },
  alpha_iota_female: {
    likelyBlindSpot: 'Harmony seeking turns into passivity.',
    optimizationStrategy: 'Embrace necessary conflict and assert your needs.'
  },
  dark_alpha_female: {
    likelyBlindSpot: 'Control and chaos destroy trust and safety.',
    optimizationStrategy: 'Channel power into disciplined leadership and self-regulation.'
  },
  beta_female: {
    likelyBlindSpot: 'Security seeking accepts uneven deals.',
    optimizationStrategy: 'Build intrinsic value and insist on reciprocity.'
  },
  beta_nu_female: {
    likelyBlindSpot: 'Duty can erase your identity.',
    optimizationStrategy: 'Honor tradition while protecting personal goals and voice.'
  },
  beta_kappa_female: {
    likelyBlindSpot: 'Manipulation secures access but kills intimacy.',
    optimizationStrategy: 'Develop authentic value and practice honest communication.'
  },
  beta_rho_female: {
    likelyBlindSpot: 'Nurture becomes management and martyrdom.',
    optimizationStrategy: 'Share responsibility and allow others to grow.'
  },
  gamma_female: {
    likelyBlindSpot: 'Critical independence blocks tenderness.',
    optimizationStrategy: 'Pair intellect with empathy and vulnerability.'
  },
  gamma_theta_female: {
    likelyBlindSpot: 'Prophetic edge becomes confrontational.',
    optimizationStrategy: 'Soften delivery and build alliances around truth.'
  },
  gamma_feminist_female: {
    likelyBlindSpot: 'Achievement focus breeds bitterness and distance.',
    optimizationStrategy: 'Reopen emotional connection and integrate relational goals.'
  },
  dark_gamma_female: {
    likelyBlindSpot: 'Detachment hardens into despair.',
    optimizationStrategy: 'Choose one meaningful bond and re-engage with purpose.'
  },
  delta_female: {
    likelyBlindSpot: 'Self-sacrifice makes you invisible.',
    optimizationStrategy: 'Prioritize self-care and ask for reciprocity.'
  },
  delta_mu_female: {
    likelyBlindSpot: 'Joy becomes performance under pressure.',
    optimizationStrategy: 'Protect your joy with boundaries and rest.'
  },
  dark_delta_female: {
    likelyBlindSpot: 'Martyrdom creates resentment.',
    optimizationStrategy: 'Set limits, ask directly, and rebuild self-worth.'
  },
  sigma_female: {
    likelyBlindSpot: 'Autonomy keeps intimacy at distance.',
    optimizationStrategy: 'Allow selective vulnerability while keeping clear boundaries.'
  },
  sigma_feminist_female: {
    likelyBlindSpot: 'Unyielding independence blocks partnership.',
    optimizationStrategy: 'Practice flexibility and interdependence without surrender.'
  },
  dark_sigma_zeta_female: {
    likelyBlindSpot: 'Rebellion burns bridges and safety.',
    optimizationStrategy: 'Channel defiance into constructive boundaries and stable support.'
  },
  omega_female: {
    likelyBlindSpot: 'Withdrawal makes you unseen and stuck.',
    optimizationStrategy: 'Build small routines, community touchpoints, and self-care.'
  },
  dark_omega_female: {
    likelyBlindSpot: 'Destruction becomes self-fulfilling.',
    optimizationStrategy: 'Choose creation, accountability, and repair.'
  },
  phi_female: {
    likelyBlindSpot: 'Transcendence can feel detached.',
    optimizationStrategy: 'Serve with grounded compassion and community presence.'
  }
};

