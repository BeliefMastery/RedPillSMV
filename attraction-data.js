/**
 * STATUS, SELECTION, ATTRACTION — Quick Reference Map
 * Male and female evolutionary clusters from Belief Mastery.
 * Coalition/repro: 3 questions per subcategory (unweighted cluster mean). Axis uses subcategory weighted means then blend; weakest identified.
 *
 * @author Warwick Marshall
 */

const OPTS = [1, 3, 5, 7, 10];
/** 6-point scale for rad activity type (anti-rad → low-rad → rad → high-rad spectrum) */
const OPTS_6 = [1, 2, 4, 6, 8, 10];

/**
 * Male cluster weights (Hoe_math: Axis = 40% for males).
 * Effective share of overall SMV for any subcategory = axisWeight * subBlend * (1/nItems in bucket) approximately.
 * See docs/SMV_WEIGHTING_NOTE.md for worked examples and audit trail.
 */
export const MALE_CLUSTER_WEIGHTS = {
  coalitionRank: 0.25,
  reproductiveConfidence: 0.35,
  axisOfAttraction: 0.40
};

/**
 * Female cluster weights (Axis = 50% for females).
 * Female axis gets a larger cluster share than male; fertility sub-blend slot ≈ 0.50 * 0.30 = 15% of overall SMV.
 */
export const FEMALE_CLUSTER_WEIGHTS = {
  coalitionRank: 0.20,
  reproductiveConfidence: 0.30,
  axisOfAttraction: 0.50
};

/**
 * Axis of Attraction subcategory blend weights (percentiles blended with fixed weights; missing subs renormalized).
 * Prevents raw question-count dominance from silently overweighting longer subcategories.
 *
 * Approx. contribution to overall SMV (all subs present, male): axis 40% × sub weight
 *   e.g. physicalGenetic 0.25 → 40% × 25% = 10% of overall composite from that pillar alone.
 * Female: multiply by 50% cluster weight (e.g. fertility 0.30 → 15% overall slot).
 *
 * Item→construct map: see docs/SMV_WEIGHTING_NOTE.md. physicalGenetic / fertility use per-question `weight` in weighted subcategory means (see shared/attraction-smv-core.mjs).
 */
export const AXIS_SUBCATEGORY_WEIGHTS = {
  male: {
    radActivity: 0.30,
    performanceStatus: 0.30,
    physicalGenetic: 0.25,
    humour: 0.15
  },
  female: {
    fertility: 0.30,
    riskCost: 0.30,
    personality: 0.20,
    factorsHidden: 0.20
  }
};

/** Market Preference Configuration — Male */
export const MALE_PREFERENCE_QUESTIONS = [
  { id: 'age', text: 'What is your current age?', type: 'number', min: 18, max: 80, required: true },
  { id: 'target_age_min', text: 'Minimum age of desired partner?', type: 'number', min: 18, max: 80, required: true },
  { id: 'target_age_max', text: 'Maximum age of desired partner?', type: 'number', min: 18, max: 80, required: true },
  { id: 'physical_standards', text: 'How important are physical attractiveness standards?', type: 'scale', options: [{ value: 1, label: 'Not important' }, { value: 3, label: 'Somewhat' }, { value: 5, label: 'Very important' }, { value: 7, label: 'Extremely important' }], required: true },
  { id: 'fertility_priority', text: 'How important is fertility/ability to have children?', type: 'scale', options: [{ value: 1, label: 'Not seeking' }, { value: 3, label: 'Open to possibility' }, { value: 5, label: 'Definitely want' }, { value: 7, label: 'Critical' }], required: true },
  { id: 'career_expectations', text: 'Expectations for her career/productivity?', type: 'scale', options: [{ value: 1, label: 'Prefer homemaker' }, { value: 3, label: 'Flexible' }, { value: 5, label: 'Career but family first' }, { value: 7, label: 'Ambitious career woman' }], required: true },
  { id: 'relationship_goal', text: 'Primary relationship goal?', type: 'select', options: [{ value: 'casual', label: 'Casual / Short-term' }, { value: 'ltr', label: 'Long-term' }, { value: 'marriage', label: 'Marriage' }, { value: 'family', label: 'Marriage + Children' }], required: true }
];

/** Market Preference Configuration — Female */
export const FEMALE_PREFERENCE_QUESTIONS = [
  { id: 'age', text: 'What is your current age?', type: 'number', min: 18, max: 80, required: true },
  { id: 'target_age_min', text: 'Minimum age of desired partner?', type: 'number', min: 18, max: 80, required: true },
  { id: 'target_age_max', text: 'Maximum age of desired partner?', type: 'number', min: 18, max: 80, required: true },
  { id: 'height_requirement', text: 'Minimum height requirement for partner?', type: 'scale', options: [{ value: 1, label: 'No requirement' }, { value: 3, label: 'Prefer taller' }, { value: 5, label: '5\'10"+' }, { value: 7, label: '6\'0"+' }, { value: 10, label: '6\'2"+ only' }], required: true },
  { id: 'income_requirement', text: 'Minimum income/wealth requirement?', type: 'scale', options: [{ value: 1, label: 'Not important' }, { value: 3, label: 'Self-sufficient' }, { value: 5, label: '$75k+' }, { value: 7, label: '$150k+' }, { value: 10, label: '$250k+' }], required: true },
  { id: 'status_requirement', text: 'How important is social status/prestige?', type: 'scale', options: [{ value: 1, label: 'Character over status' }, { value: 3, label: 'Some standing' }, { value: 5, label: 'Respected professional' }, { value: 7, label: 'High status/influential' }], required: true },
  { id: 'relationship_goal', text: 'Primary relationship goal?', type: 'select', options: [{ value: 'casual', label: 'Casual / Short-term' }, { value: 'ltr', label: 'Long-term' }, { value: 'marriage', label: 'Marriage' }, { value: 'family', label: 'Marriage + Children' }], required: true }
];

/** MALE 3C's — 9 questions (3 per C). Male-male hierarchy; weakest identified. */
const MALE_COALITION_QUESTIONS = [
  // Courage (3)
  { id: 'courage_1', subcategory: 'courage', text: 'When faced with physical confrontation or danger, how do you typically respond?', weight: 1.0, options: OPTS, optionLabels: ['Freeze, avoid, or seek escape', 'Retreat and de-escalate; minimize conflict', 'Stand ground; respond only if necessary', 'Confront directly; protect self/others', 'Seek to dominate; high risk tolerance'] },
  { id: 'courage_2', subcategory: 'courage', text: 'How often do you take calculated risks in your career or business ventures?', weight: 1.0, options: OPTS, optionLabels: ['Almost never — avoid risk', 'Rarely — only when forced', 'Sometimes — selective risks', 'Often — regularly take calculated risks', 'Constantly — risk-seeking in career/business'] },
  { id: 'courage_3', subcategory: 'courage', text: 'In group settings when conflict arises, do you step into it or step back?', weight: 1.0, options: OPTS, optionLabels: ['Always step back; avoid entirely', 'Usually avoid; intervene only if forced', 'Depends on stakes; selective engagement', 'Usually step in; take ownership', 'Always lead; handle conflict directly'] },
  // Control (3)
  { id: 'control_1', subcategory: 'control', text: 'How well do you maintain composure during high-stress situations?', weight: 1.0, options: OPTS, optionLabels: ['Often lose composure; overwhelmed', 'Struggle to stay calm; visible stress', 'Usually maintain composure; some wobble', 'Consistently calm under pressure', 'Thrive under stress; perform better'] },
  { id: 'control_2', subcategory: 'control', text: 'How consistent are you with personal discipline (fitness, diet, sleep, work routine)?', weight: 1.0, options: OPTS, optionLabels: ['Inconsistent — no routine', 'Sporadic — occasional effort', 'Moderate — partial consistency', 'Consistent — solid routine', 'Highly disciplined — unwavering routine'] },
  { id: 'control_3', subcategory: 'control', text: 'When you feel anger or impulse, how quickly do you regulate before acting?', weight: 1.0, options: OPTS, optionLabels: ['Rarely; act on impulse', 'Slow; often act before thinking', 'Moderate; sometimes regret', 'Quick; usually pause first', 'Instant; mastery over impulses'] },
  // Competence (3)
  { id: 'competence_1', subcategory: 'competence', text: 'How effectively can you solve complex problems in unfamiliar domains?', weight: 1.0, options: OPTS, optionLabels: ['Struggle significantly; avoid', 'Difficult; need heavy support', 'Manage with effort; mixed results', 'Handle well; adapt quickly', 'Excel; thrive in unfamiliar territory'] },
  { id: 'competence_2', subcategory: 'competence', text: 'How would you rate your ability to generate and secure resources (income, assets, opportunities)?', weight: 1.0, options: OPTS, optionLabels: ['Very limited; unstable', 'Below average; inconsistent', 'Average; adequate', 'Above average; reliable', 'Strong; secure and growing'] },
  { id: 'competence_3', subcategory: 'competence', text: 'When others need help with something technical or logistical, how often do they come to you?', weight: 1.0, options: OPTS, optionLabels: ['Almost never — not seen as capable', 'Rarely — others prefer alternatives', 'Sometimes — occasional go-to', 'Often — trusted problem-solver', 'Constantly — first port of call'] }
];

/** MALE 4P's — 12 questions (3 per P). Willingness to procreate/nest vs abort; weakest identified. */
const MALE_REPRODUCTIVE_QUESTIONS = [
  // Perspicacity (3)
  { id: 'perspicacity_1', subcategory: 'perspicacity', text: 'How quickly do you identify potential threats or dangers in your environment?', weight: 1.0, options: OPTS, optionLabels: ['Rarely notice until too late', 'Sometimes miss; slow to recognize', 'Usually notice; average awareness', 'Quick to identify; good instincts', 'Instantly perceive; hypervigilant'] },
  { id: 'perspicacity_2', subcategory: 'perspicacity', text: 'How well do you read people\'s intentions before they act?', weight: 1.0, options: OPTS, optionLabels: ['Poorly; often surprised', 'Below average; miss cues', 'Average; catch some', 'Good; usually accurate', 'Excellent; rarely wrong'] },
  { id: 'perspicacity_3', subcategory: 'perspicacity', text: 'When opportunities arise (career, investment, relationship), how fast do you recognize and act?', weight: 1.0, options: OPTS, optionLabels: ['Very slow; often miss them', 'Slow; hesitate too long', 'Moderate; sometimes seize', 'Quick; usually capitalize', 'Very fast; rarely miss'] },
  // Protector (3)
  { id: 'protector_1', subcategory: 'protector', text: 'How capable are you of physically protecting someone from harm?', weight: 1.0, options: OPTS, optionLabels: ['Cannot / would avoid confrontation', 'Limited; would try but uncertain', 'Moderate; can hold my own', 'Capable; confident in defense', 'Highly capable; trained / strong'] },
  { id: 'protector_2', subcategory: 'protector', text: 'If someone you care about were threatened, what would you do?', weight: 1.0, options: OPTS, optionLabels: ['Avoid; call for help', 'Uncertain; might intervene', 'Would try to de-escalate or protect', 'Would step in and protect', 'Would intervene decisively without hesitation'] },
  { id: 'protector_3', subcategory: 'protector', text: 'How do you rate your physical presence and ability to deter aggression?', weight: 1.0, options: OPTS, optionLabels: ['Low; easily overlooked or targeted', 'Below average', 'Average', 'Above average; command respect', 'High; rarely challenged'] },
  // Provider (3)
  { id: 'provider_1', subcategory: 'provider', text: 'How stable and consistent is your income/resource generation?', weight: 1.0, options: OPTS, optionLabels: ['Unstable; irregular or none', 'Somewhat stable; variable', 'Moderately stable; predictable', 'Stable; consistent income', 'Very stable; secure and growing'] },
  { id: 'provider_2', subcategory: 'provider', text: 'If you had to support a family tomorrow, how prepared are you?', weight: 1.0, options: OPTS, optionLabels: ['Not prepared; could not support', 'Barely prepared; major gaps', 'Partially prepared; would strain', 'Well prepared; could support', 'Fully prepared; comfortable margin'] },
  { id: 'provider_3', subcategory: 'provider', text: 'How easily could you increase your earning capacity if needed?', weight: 1.0, options: OPTS, optionLabels: ['Very difficult; limited options', 'Difficult; would take years', 'Moderate; some paths exist', 'Relatively easy; skills and network', 'Easy; multiple options available'] },
  // Parental Investor (3)
  { id: 'parental_1', subcategory: 'parentalInvestor', text: 'How committed are you to the idea of being an active, involved father?', weight: 1.0, options: OPTS, optionLabels: ['Not committed; not seeking', 'Somewhat open; uncertain', 'Committed in principle', 'Committed; want to be involved', 'Deeply committed; priority'] },
  { id: 'parental_2', subcategory: 'parentalInvestor', text: 'If your partner became pregnant, how would you respond?', weight: 1.0, options: OPTS, optionLabels: ['Panic; would want to avoid', 'Stress; uncertain about commitment', 'Mixed; would work through it', 'Accept; would step up', 'Embrace; ready to parent'] },
  { id: 'parental_3', subcategory: 'parentalInvestor', text: 'How much time and energy would you realistically invest in child-rearing?', weight: 1.0, options: OPTS, optionLabels: ['Minimal; prefer to outsource', 'Limited; career comes first', 'Moderate; balanced approach', 'Significant; hands-on father', 'Primary; central to my life'] }
];

/**
 * MALE Rad Activity — External interest that signals direction; she competes with it.
 * Uses behavioral descriptors (not exhaustive category lists) to reduce gaming.
 * shuffleOptions: true hides significance; options displayed in random order per respondent.
 * Gym/vanity: fitness-for-aesthetics sits in low-rad (committed but no larger purpose).
 * Weighting: activity type (40%), consumption vs creation (30%), competition (20%), visibility (10%).
 */
const MALE_RAD_ACTIVITY_QUESTIONS = [
  { id: 'rad_1', subcategory: 'radActivity', weight: 0.40, shuffleOptions: true, text: 'What best describes your primary focus outside romantic relationships?', options: OPTS_6, optionLabels: [
    'I spend significant time on escape, substances, or content consumption with nothing to show for it',
    'Most of my free time is passive—watching, playing, scrolling—with little external output',
    'I have no compelling external focus; my free time has no real direction',
    'I have regular activities or hobbies—fitness, light pastimes—but they\'re not part of a larger purpose',
    'I pursue physical or skill-based activities that require real commitment, risk, or mastery',
    'I\'m building something—career, project, craft, or mission—that extends beyond me'
  ] },
  { id: 'rad_2', subcategory: 'radActivity', weight: 0.30, shuffleOptions: true, text: 'How do you spend your non-work time?', options: OPTS, optionLabels: [
    'Mostly consumption—watching, playing, scrolling—with little building or output',
    'Heavy consumption with some light activity',
    'Mix of consumption and skill-building',
    'Significant skill-building or physical mastery',
    'Primarily building, creating, or mastering—output-focused'
  ] },
  { id: 'rad_3', subcategory: 'radActivity', weight: 0.20, shuffleOptions: true, text: 'How much does your partner (or potential partner) have to compete with for your time and attention from external pursuits?', options: OPTS, optionLabels: [
    'Nothing; I have no compelling external focus',
    'Little; she gets most of my attention',
    'Moderate; I have interests but she\'s central',
    'Significant; I have a mission she respects',
    'High; she competes with something I\'m building'
  ] },
  { id: 'rad_4', subcategory: 'radActivity', weight: 0.10, shuffleOptions: true, text: 'Would others describe your life as having a compelling ambition or mission beyond the relationship?', options: OPTS, optionLabels: [
    'No; seen as having no real direction',
    'Unclear; mixed or low-ambition impression',
    'Somewhat; I have goals but they\'re private',
    'Yes; people see I\'m building something',
    'Strongly; known for a visible mission or output'
  ] }
];

/** Rad activity type modifier: anti-rad (1–2) gets floor; ensures consumption/escape tanks the score. */
export const RAD_ACTIVITY_TYPE_MODIFIER = {
  ANTI_RAD_FLOOR: 25,   // Max percentile if activity type is 1 or 2 (porn/drugs or gaming/TV)
  ANTI_RAD_THRESHOLD: 2 // rad_1 raw ≤ 2 = anti-rad penalty (OPTS_6: 1=porn/drugs, 2=gaming/TV)
};

/** MALE Axis of Attraction — Performance/Status (wealth = productivity, sharing, popularity, unique talent) + Physical/Genetic + Humour + Rad Activity. Maps to Bad Boy / Good Guy grid. */
const MALE_AXIS_QUESTIONS = [
  ...MALE_RAD_ACTIVITY_QUESTIONS,
  // Performance/Status (Wealth = productivity, sharing, social network popularity, unique/outstanding talent — capacity to fluff the nest, provide, support status)
  { id: 'perf_1', subcategory: 'performanceStatus', text: 'How would you rate your current social status and influence?', weight: 1.0, options: OPTS, optionLabels: ['Low; little influence', 'Below average', 'Average', 'Above average; notable', 'High; significant influence'] },
  { id: 'perf_2', subcategory: 'performanceStatus', text: 'What is your current annual income bracket?', weight: 1.0, options: OPTS, optionLabels: ['Under $30k', '$30k-$60k', '$60k-$100k', '$100k-$200k', 'Over $200k'] },
  { id: 'perf_3', subcategory: 'performanceStatus', text: 'How generous are you with resources (time, money, connections) toward people you care about?', weight: 1.0, options: OPTS, optionLabels: ['Very guarded; rarely share', 'Selective; only close few', 'Moderate; fair when asked', 'Generous; share readily', 'Very generous; invest heavily'] },
  { id: 'perf_4', subcategory: 'performanceStatus', text: 'How productive and output-oriented are you in your work or projects?', weight: 1.0, options: OPTS, optionLabels: ['Low; struggle to produce', 'Below average', 'Average', 'Above average; reliable output', 'High; consistent high output'] },
  { id: 'perf_5', subcategory: 'performanceStatus', text: 'How popular or well-regarded are you in your social and professional circles?', weight: 1.0, options: OPTS, optionLabels: ['Not popular; overlooked', 'Below average', 'Average', 'Well-liked; respected', 'Very popular; sought after'] },
  { id: 'perf_6', subcategory: 'performanceStatus', text: 'Do you have a unique or outstanding talent (music, sport, craft, invention, expertise) that signals potential windfall or novelty?', weight: 1.0, options: OPTS, optionLabels: ['None; no standout skill', 'One hobby; not notable', 'Moderate; some recognition', 'Strong; admired in niche', 'Outstanding; widely recognised'] },
  // Physical/Genetic — ordered: face → body → strength → detail cues → optional market-read → frame → polish → net
  { id: 'phys_1', subcategory: 'physicalGenetic', text: 'How would you honestly rate your facial attractiveness (face, features—separate from body below)?', weight: 1.2, options: OPTS, optionLabels: ['Below average', 'Slightly below average', 'Average', 'Above average', 'Top tier'] },
  { id: 'phys_6', subcategory: 'physicalGenetic', text: 'How would you rate your body composition and shape as seen by others (muscle, leanness, proportions—not the same as strength alone)?', weight: 1.1, options: OPTS, optionLabels: ['Poor shape for my goals', 'Below average', 'Average', 'Above average; clear shape', 'Standout physique'] },
  { id: 'phys_2', subcategory: 'physicalGenetic', text: 'How would you rate your fitness, strength, and physical capability (training and performance—not only how you look)?', weight: 1.0, options: OPTS, optionLabels: ['Poor; sedentary', 'Below average', 'Average', 'Above average; fit', 'Elite; very strong'] },
  { id: 'phys_7', subcategory: 'physicalGenetic', text: 'How favorable are your facial and body symmetry and proportions in the mirror of typical dating-market taste (honest self-view)?', weight: 0.9, options: OPTS, optionLabels: ['Clearly uneven / awkward proportions', 'Below average', 'Average', 'Above average', 'Very balanced'] },
  { id: 'phys_8', subcategory: 'physicalGenetic', text: 'How strong is your skin, hair, and teeth presentation (health and grooming visible at conversation distance)?', weight: 1.0, options: OPTS, optionLabels: ['Poor; often a distraction', 'Below average', 'Average', 'Above average; well kept', 'Excellent; standout'] },
  { id: 'phys_9', subcategory: 'physicalGenetic', text: 'How would you rate your voice, posture, and first-30-seconds presence (before you have said much)?', weight: 0.85, options: OPTS, optionLabels: ['Weak; easily overlooked', 'Below average', 'Average', 'Above average; solid presence', 'Strong; memorable immediately'] },
  { id: 'phys_10', subcategory: 'physicalGenetic', text: 'Honest read: visible disability, difference, or chronic visible health factor—how much does it typically filter stranger or early dating first impressions? (Not your worth; typical market friction.)', weight: 0.8, optional: true, options: OPTS, optionLabels: ['Major; often a strong early filter', 'Noticeable; frequently shapes first glance', 'Moderate; sometimes matters early', 'Minor; rarely the main signal', 'Not a factor in typical first impressions'] },
  { id: 'phys_3', subcategory: 'physicalGenetic', text: 'What is your height bracket?', weight: 1.0, options: OPTS, optionLabels: ['Under 5\'6"', '5\'6"-5\'8"', '5\'9"-5\'11"', '6\'0"-6\'2"', 'Over 6\'2"'] },
  { id: 'phys_4', subcategory: 'physicalGenetic', text: 'How well do you maintain grooming, hygiene, and physical presentation?', weight: 1.0, options: OPTS, optionLabels: ['Poor; inconsistent', 'Below average', 'Average', 'Above average; polished', 'Excellent; always put-together'] },
  { id: 'phys_5', subcategory: 'physicalGenetic', text: 'How would others describe your energy and vitality?', weight: 1.0, options: OPTS, optionLabels: ['Low; tired or sluggish', 'Below average', 'Average', 'Above average; energetic', 'High; vibrant and vital'] },
  { id: 'phys_11', subcategory: 'physicalGenetic', text: 'Net calibration: how strong is your overall physical first-impression signal in dating-relevant settings (face + body + presence together)?', weight: 0.65, options: OPTS, optionLabels: ['Weak overall signal', 'Below average', 'Average', 'Above average', 'Strong overall signal'] },
  // Humour (intelligence indicator; drives attraction and approachability)
  { id: 'humour_1', subcategory: 'humour', text: 'How easily do you make others laugh in social settings?', weight: 1.0, options: OPTS, optionLabels: ['Rarely; humour doesn\'t come naturally', 'Sometimes; hit and miss', 'Moderately; decent delivery', 'Often; people enjoy my timing', 'Consistently; known for wit'] },
  { id: 'humour_2', subcategory: 'humour', text: 'How quick are you to spot absurdity, irony, or playful angles in conversation?', weight: 1.0, options: OPTS, optionLabels: ['Slow; often miss it', 'Below average', 'Average; catch some', 'Quick; usually first', 'Very quick; sharp and clever'] },
  { id: 'humour_3', subcategory: 'humour', text: 'How well do you use humour to put others at ease or defuse tension?', weight: 1.0, options: OPTS, optionLabels: ['Poorly; often misfires', 'Below average', 'Moderately', 'Well; people relax around me', 'Exceptionally; natural icebreaker'] }
];

/** FEMALE 3S's — 9 questions (3 per S). Female-female hierarchy; weakest identified. */
const FEMALE_COALITION_QUESTIONS = [
  // Social Influence (3)
  { id: 'social_1', subcategory: 'socialInfluence', text: 'How much influence do you have over social narratives and group opinions?', weight: 1.0, options: OPTS, optionLabels: ['Little to none; often overlooked', 'Limited; some say in close circle', 'Moderate; respected in my groups', 'Notable; shape opinions', 'High; significant social influence'] },
  { id: 'social_2', subcategory: 'socialInfluence', text: 'When you express a view, how often do others adopt or defer to it?', weight: 1.0, options: OPTS, optionLabels: ['Rarely; often ignored', 'Sometimes; mixed', 'Moderately; some follow', 'Often; people listen', 'Consistently; people align'] },
  { id: 'social_3', subcategory: 'socialInfluence', text: 'How effectively do you navigate alliances and avoid being sidelined?', weight: 1.0, options: OPTS, optionLabels: ['Poorly; often excluded', 'Below average', 'Average', 'Well; stay included', 'Expertly; central to networks'] },
  // Selectivity & Mate Guarding Success (3)
  { id: 'select_1', subcategory: 'selectivity', text: 'How successful are you at attracting high-quality male attention?', weight: 1.0, options: OPTS, optionLabels: ['Rarely; struggle to attract', 'Sometimes; inconsistent', 'Moderately; decent interest', 'Often; strong interest from quality men', 'Consistently; top-tier men pursue'] },
  { id: 'select_2', subcategory: 'selectivity', text: 'When you have a partner, how well do you retain his commitment against rivals?', weight: 1.0, options: OPTS, optionLabels: ['Poorly; often lose to others', 'Below average', 'Average', 'Well; he stays committed', 'Exceptionally; he never wavers'] },
  { id: 'select_3', subcategory: 'selectivity', text: 'How selective are you in who you give attention to, versus who pursues you?', weight: 1.0, options: OPTS, optionLabels: ['Not selective; take what I can get', 'Low; limited options', 'Moderate; some choice', 'Selective; good options', 'Highly selective; only top tier'] },
  // Status Signaling (3)
  { id: 'signal_1', subcategory: 'statusSignaling', text: 'How well do you display your value without triggering jealousy or sabotage?', weight: 1.0, options: OPTS, optionLabels: ['Poorly; often trigger backlash', 'Struggle; sometimes provoke', 'Moderately; mixed results', 'Well; mostly avoid sabotage', 'Expertly; display value without cost'] },
  { id: 'signal_2', subcategory: 'statusSignaling', text: 'How strategically do you present beauty, fertility, and alliance cues?', weight: 1.0, options: OPTS, optionLabels: ['Not strategically; unaware', 'Below average', 'Average', 'Thoughtfully; intentional', 'Expertly; optimized presentation'] },
  { id: 'signal_3', subcategory: 'statusSignaling', text: 'How do other women treat you — as threat, rival, or ally?', weight: 1.0, options: OPTS, optionLabels: ['As threat; often undermined', 'Mixed; some hostility', 'Neutral; mostly indifferent', 'Respectful; some alliance', 'As ally; protected and included'] }
];

/** FEMALE Reproductive Confidence — 9 questions (3 per criterion). Male willingness to ejaculate, co-raise, and live with. */
const FEMALE_REPRODUCTIVE_QUESTIONS = [
  // Paternity Certainty (3) — loyalty, exclusivity, partner count
  { id: 'pat_1', subcategory: 'paternityCertainty', text: 'How loyal and faithful are you in committed relationships?', weight: 1.0, options: OPTS, optionLabels: ['Not loyal; history of infidelity', 'Struggle; tempted often', 'Moderately loyal; some lapses', 'Loyal; committed', 'Deeply loyal; never strayed'] },
  { id: 'pat_2', subcategory: 'paternityCertainty', text: 'How many sexual/romantic partners have you had?', weight: 1.0, reverseScore: true, options: OPTS, optionLabels: ['0-1', '2-4', '5-9', '10-19', '20+'] },
  { id: 'pat_3', subcategory: 'paternityCertainty', text: 'How transparent are you about your past and present?', weight: 1.0, options: OPTS, optionLabels: ['Hide a lot; significant secrets', 'Selective disclosure', 'Moderately transparent', 'Mostly transparent', 'Fully transparent; nothing hidden'] },
  // Nurturing Standard (3) — mother imprint benchmark
  { id: 'nurture_1', subcategory: 'nurturingStandard', text: 'How warm, caring, and nurturing are you toward a partner?', weight: 1.0, options: OPTS, optionLabels: ['Cold; struggle to show care', 'Limited; guarded', 'Moderately warm', 'Warm; naturally nurturing', 'Very warm; deeply caring'] },
  { id: 'nurture_2', subcategory: 'nurturingStandard', text: 'How would you care for someone who was sick or vulnerable?', weight: 1.0, options: OPTS, optionLabels: ['Avoid; not my strength', 'Minimal; feel awkward', 'Moderate; do my best', 'Well; naturally tend', 'Exceptionally; devoted care'] },
  { id: 'nurture_3', subcategory: 'nurturingStandard', text: 'How aligned are you with traditional homemaking or partnership support?', weight: 1.0, options: OPTS, optionLabels: ['Not at all; reject it', 'Low; prefer independence', 'Moderate; flexible', 'High; value creating home', 'Very high; central to identity'] },
  // Collaborative Trust Efficiency (3)
  { id: 'collab_1', subcategory: 'collaborativeTrust', text: 'How well do you cooperate with a partner without creating drama or conflict?', weight: 1.0, options: OPTS, optionLabels: ['Poorly; frequent conflict', 'Struggle; drama often', 'Moderately; some conflict', 'Well; mostly cooperative', 'Exceptionally; easy partnership'] },
  { id: 'collab_2', subcategory: 'collaborativeTrust', text: 'How often do you sabotage, withhold, or create waste in a relationship?', weight: 1.0, reverseScore: true, options: OPTS, optionLabels: ['Very often', 'Often', 'Sometimes', 'Rarely', 'Almost never'] },
  { id: 'collab_3', subcategory: 'collaborativeTrust', text: 'How easy are you to live with day-to-day?', weight: 1.0, options: OPTS, optionLabels: ['Difficult; high maintenance', 'Below average', 'Average', 'Easy; low conflict', 'Very easy; harmonious'] }
];

/** FEMALE Axis of Attraction — Fertility & Health, Risk Cost. Personality, promiscuity, factors hidden. Maps to Keeper-Sweeper chart. */
const FEMALE_AXIS_QUESTIONS = [
  // Fertility & Health Cues — ordered: face → WHR → shape → skin/symmetry → optional market-read → age → net
  { id: 'fert_1', subcategory: 'fertility', text: 'How would you honestly rate your facial attractiveness and feminine features (face—separate from waist/hips below)?', weight: 1.2, options: OPTS, optionLabels: ['Below average', 'Slightly below average', 'Average', 'Above average', 'Top tier'] },
  { id: 'fert_2', subcategory: 'fertility', text: 'How favorable is your waist–hip ratio and midsection shape (classic fertility cue)?', weight: 1.15, options: OPTS, optionLabels: ['Unfavorable', 'Below average', 'Average', 'Favorable', 'Highly favorable'] },
  { id: 'fert_6', subcategory: 'fertility', text: 'Aside from waist–hips, how would you rate your overall body leanness and shape as seen by others?', weight: 1.0, options: OPTS, optionLabels: ['Poor for my goals', 'Below average', 'Average', 'Above average', 'Standout shape'] },
  { id: 'fert_4', subcategory: 'fertility', text: 'How strong is your skin, hair, and teeth vitality (visible health at conversation distance)?', weight: 1.0, options: OPTS, optionLabels: ['Poor; often a distraction', 'Below average', 'Average', 'Above average; glowing', 'Excellent; standout'] },
  { id: 'fert_5', subcategory: 'fertility', text: 'How favorable are your symmetry and overall body proportions in the mirror of typical dating-market taste (honest self-view)?', weight: 0.9, options: OPTS, optionLabels: ['Clearly uneven / awkward proportions', 'Below average', 'Average', 'Above average', 'Very balanced'] },
  { id: 'fert_7', subcategory: 'fertility', text: 'Honest read: visible disability, difference, or chronic visible health factor—how much does it typically filter stranger or early dating first impressions? (Not your worth; typical market friction.)', weight: 0.8, optional: true, options: OPTS, optionLabels: ['Major; often a strong early filter', 'Noticeable; frequently shapes first glance', 'Moderate; sometimes matters early', 'Minor; rarely the main signal', 'Not a factor in typical first impressions'] },
  { id: 'fert_3', subcategory: 'fertility', text: 'What is your age bracket?', weight: 1.2, options: OPTS, optionLabels: ['45+', '35-44', '30-34', '25-29', '18-24'] },
  { id: 'fert_8', subcategory: 'fertility', text: 'Net calibration: how strong is your overall physical first-impression signal in dating-relevant settings (face + body + vitality together)?', weight: 0.65, options: OPTS, optionLabels: ['Weak overall signal', 'Below average', 'Average', 'Above average', 'Strong overall signal'] },
  // Risk Cost (Crazy) (3) — volatility, infidelity risk, sabotage
  { id: 'risk_1', subcategory: 'riskCost', text: 'How emotionally stable and predictable are you?', weight: 1.0, reverseScore: true, options: OPTS, optionLabels: ['Very volatile; unpredictable', 'Often unstable', 'Moderately stable', 'Generally stable', 'Very stable; highly predictable'] },
  { id: 'risk_2', subcategory: 'riskCost', text: 'How present are red flags (substance abuse, mental health issues, destructive patterns)?', weight: 1.0, reverseScore: true, options: OPTS, optionLabels: ['Multiple severe', 'Several moderate', 'A few minor', 'Very few', 'None significant'] },
  { id: 'risk_3', subcategory: 'riskCost', text: 'How much drama or chaos do you bring into relationships?', weight: 1.0, reverseScore: true, options: OPTS, optionLabels: ['Very high; constant drama', 'High; frequent', 'Moderate; some', 'Low; minimal', 'Very low; calm presence'] },
  // Personality & factors hidden (expanded to improve reliability of thin subscales)
  { id: 'personality_1', subcategory: 'personality', text: 'How would you describe your personality — easy to get along with or high conflict?', weight: 1.0, options: OPTS, optionLabels: ['High conflict; difficult', 'Below average; some friction', 'Average', 'Easy-going; pleasant', 'Very easy; highly compatible'] },
  { id: 'personality_2', subcategory: 'personality', text: 'How well do you handle disagreement without escalating into contempt, punishment, or silent warfare?', weight: 1.0, options: OPTS, optionLabels: ['Very poorly; escalation is common', 'Poorly; conflict lingers', 'Moderately; mixed outcomes', 'Well; usually de-escalate', 'Exceptionally; calm and constructive'] },
  { id: 'personality_3', subcategory: 'personality', text: 'How consistently do partners describe you as emotionally safe, cooperative, and low-drama over time?', weight: 1.0, options: OPTS, optionLabels: ['Rarely; often unstable', 'Inconsistent', 'Sometimes', 'Usually', 'Consistently'] },
  { id: 'hidden_1', subcategory: 'factorsHidden', text: 'Are there significant things about you (past, habits, beliefs) that you tend to hide from partners?', weight: 1.0, reverseScore: true, options: OPTS, optionLabels: ['Major secrets; would shock', 'Several significant', 'A few minor', 'Very little', 'Nothing significant; transparent'] },
  { id: 'hidden_2', subcategory: 'factorsHidden', text: 'How transparent are you about relationship history, unresolved ties, and current boundaries with ex-partners?', weight: 1.0, options: OPTS, optionLabels: ['Not transparent; frequent ambiguity', 'Limited transparency', 'Moderately transparent', 'Mostly transparent', 'Fully transparent and clear'] },
  { id: 'hidden_3', subcategory: 'factorsHidden', text: 'How likely is a partner to discover major information later that materially changes trust?', weight: 1.0, reverseScore: true, options: OPTS, optionLabels: ['Very likely', 'Likely', 'Possible', 'Unlikely', 'Very unlikely'] }
];

/** Male clusters — assembled */
export const MALE_CLUSTERS = {
  coalitionRank: {
    id: 'coalitionRank',
    title: "Coalition Rank (3C's)",
    subtitle: 'Male-Male Hierarchy Determinants',
    description: 'Decides male standing in groups; higher rank → more allies, more resources, better mate access. Results averaged per C; weakest identified for rank increase.',
    subcategories: {
      courage: { label: 'Courage', desc: 'Risk tolerance under threat.' },
      control: { label: 'Control', desc: 'Mastery over impulses and stress.' },
      competence: { label: 'Competence', desc: 'Ability to solve problems and secure resources under pressure.' }
    },
    questions: MALE_COALITION_QUESTIONS
  },
  reproductiveConfidence: {
    id: 'reproductiveConfidence',
    title: "Reproductive Confidence (4P's)",
    subtitle: 'Female Selection Criteria — Willingness to Procreate/Nest',
    description: 'Determines long-term mate selection by women; willingness to procreate vs abort, permanent nesting. Results averaged per P; weakest identified.',
    subcategories: {
      perspicacity: { label: 'Perspicacity', desc: 'Acute perception of threats/opportunities.' },
      protector: { label: 'Protector', desc: 'Physical defense capacity and intent.' },
      provider: { label: 'Provider', desc: 'Consistent resource generation.' },
      parentalInvestor: { label: 'Parental Investor', desc: 'Willingness and competence in offspring rearing.' }
    },
    questions: MALE_REPRODUCTIVE_QUESTIONS
  },
  axisOfAttraction: {
    id: 'axisOfAttraction',
    title: 'Axis of Attraction',
    subtitle: 'Performance/Status + Physical/Genetic + Humour — Bad Boy / Good Guy Grid',
    description: 'Wealth (productivity, sharing, social popularity, unique talent); physical signifiers (face, body, symmetry, skin/hair, voice, height, grooming, vitality—weighted within Physical/Genetic; one optional sensitive item); humour. Drives initiation attraction, time-to-intimacy, investment requirement. Maps to Bad Boy / Good Guy grid.',
    subcategories: {
      radActivity: { label: 'Rad Activity', desc: 'External interest that signals direction; she competes with it. Anti-rad (gaming, TV, porn, drugs) = consumption/escape. Low-rad (badminton, casual hobbies) = weak. Rad (snowboarding, martial arts) = risk, skill. High-rad (business, mission) = "fucking the world with your passion." Weighted: activity type 40%, consumption 30%, competition 20%, visibility 10%.' },
      performanceStatus: { label: 'Performance/Status (Wealth)', desc: 'Productivity, sharing, social network popularity, unique/outstanding talent.' },
      physicalGenetic: { label: 'Physical/Genetic Signals', desc: 'Face, body shape, symmetry, skin/hair/teeth, voice and presence, height, grooming, vitality; one item is an honest market read on visible difference (not a judgment of worth).' },
      humour: { label: 'Humour', desc: 'Intelligence indicator; approachability and attraction.' }
    },
    questions: MALE_AXIS_QUESTIONS
  }
};

/** Female clusters — assembled */
export const FEMALE_CLUSTERS = {
  coalitionRank: {
    id: 'coalitionRank',
    title: "Coalition Rank (3S's)",
    subtitle: "Female-Female Hierarchy Determinants",
    description: 'Controls resource flow, reduces threats, determines protection within the female network. Results averaged per S; weakest identified.',
    subcategories: {
      socialInfluence: { label: 'Social Influence', desc: 'Control over perceptions and alliances.' },
      selectivity: { label: 'Selectivity & Mate Guarding Success', desc: 'Ability to attract and retain top male attention against rivals.' },
      statusSignaling: { label: 'Status Signaling', desc: 'Strategic display of beauty, fertility, and alliance without triggering sabotage.' }
    },
    questions: FEMALE_COALITION_QUESTIONS
  },
  reproductiveConfidence: {
    id: 'reproductiveConfidence',
    title: 'Reproductive Confidence',
    subtitle: 'Male Selection Criteria — Ejaculate, Co-raise, Live With',
    description: 'Determines a man\'s willingness to commit long-term resources and protection; comfort ejaculating and co-raising children with you.',
    subcategories: {
      paternityCertainty: { label: 'Paternity Certainty', desc: 'Signals of loyalty and exclusivity.' },
      nurturingStandard: { label: 'Nurturing Standard', desc: 'Alignment with or exceeding maternal care baseline.' },
      collaborativeTrust: { label: 'Collaborative Trust Efficiency', desc: 'Ability to work with a male partner without waste, sabotage, or chronic conflict.' }
    },
    questions: FEMALE_REPRODUCTIVE_QUESTIONS
  },
  axisOfAttraction: {
    id: 'axisOfAttraction',
    title: 'Axis of Attraction',
    subtitle: 'Male Mate Choice Filters — Keeper-Sweeper Chart',
    description: 'Fertility & Health cues (face, WHR, shape, skin/symmetry, optional visible-difference market read, age, net calibration—weighted within fertility); Risk Cost; personality; factors hidden. Maps to Keeper-Sweeper chart.',
    subcategories: {
      fertility: { label: 'Fertility & Health Cues (Hot)', desc: 'Face, waist–hip ratio, age bracket, skin/hair/teeth, symmetry, overall shape; weighted blend; includes an honest market-read item on visible difference (not a judgment of worth).' },
      riskCost: { label: 'Risk Cost Indicators (Crazy)', desc: 'Volatility, infidelity risk, sabotage potential.' },
      personality: { label: 'Personality', desc: 'Compatibility and ease of partnership.' },
      factorsHidden: { label: 'Factors Hidden', desc: 'Secrets or undisclosed elements that affect trust.' }
    },
    questions: FEMALE_AXIS_QUESTIONS
  }
};

/** Bad Boy / Good Guy grid cells (male)
 * Good Guy axis = manner and provision (5 levels: hi, upper-mid, mid, lower-mid, lo)
 * Bad Boy axis = attraction (3 levels: hi, mid, lo)
 */
export const BAD_BOY_GOOD_GUY_GRID = [
  { goodGuy: 'hi', badBoy: 'hi', label: 'Prince Charming', sublabel: 'Ideal Long Term', color: 'lightred' },
  { goodGuy: 'hi', badBoy: 'mid', label: 'Husband zone', color: 'lightblue' },
  { goodGuy: 'hi', badBoy: 'lo', label: 'Friend zone', color: 'white' },
  { goodGuy: 'upper-mid', badBoy: 'hi', label: 'Good Situationship', color: 'lightgreen' },
  { goodGuy: 'upper-mid', badBoy: 'mid', label: 'Good Settling', color: 'lightyellow' },
  { goodGuy: 'upper-mid', badBoy: 'lo', label: 'Comfortable Compromise', color: 'lightyellow' },
  { goodGuy: 'mid', badBoy: 'hi', label: 'Situationship', color: 'lightgreen' },
  { goodGuy: 'mid', badBoy: 'mid', label: 'Settling', color: 'lightyellow' },
  { goodGuy: 'mid', badBoy: 'lo', label: 'Resource Compromise', color: 'lightred' },
  { goodGuy: 'lower-mid', badBoy: 'hi', label: 'Bad Situationship', color: 'palegreen' },
  { goodGuy: 'lower-mid', badBoy: 'mid', label: 'Bad Settling', color: 'lightred' },
  { goodGuy: 'lower-mid', badBoy: 'lo', label: 'Last Resort', color: 'darkgrey' },
  { goodGuy: 'lo', badBoy: 'hi', label: 'Bad Boy Fun Time', sublabel: 'Short Term', color: 'reddishbrown' },
  { goodGuy: 'lo', badBoy: 'mid', label: '... Mistake', color: 'palegreen' },
  { goodGuy: 'lo', badBoy: 'lo', label: 'Invisible/Ghost or Creep', color: 'darkgrey' }
];

/**
 * Partner count impact on female Keeper/Sleeper/Sweeper (male lens).
 * pat_2 raw: 1=0-1, 3=2-4, 5=5-9, 7=10-19, 10=20+. Kept moderate so it doesn't override overall SMV.
 * - Keeper→Sleeper: only at higher counts (10-19+ for young, 20+ for older)
 * - Sleeper→Sweeper: only 20+ partners. Keepers never drop to Sweeper from partner count alone (max one step).
 */
export const PARTNER_COUNT_DOWNGRADE = {
  keeperToSleeper: { under30: 7, under40: 10, over40: 10 },  // 10-19+ (under 30) or 20+ (30+)
  sleeperToSweeper: { under30: 10, under40: 10, over40: 10 } // 20+ only
};

/** Keeper-Sweeper chart (female) */
export const KEEPER_SWEEPER_CHART = [
  { segment: 'keepers', label: 'Keepers', desc: 'My one and only', sublabel: 'Best I can get', investment: 'More Investment' },
  { segment: 'sleepers', label: 'Sleepers', desc: 'Babe, I dunno where I\'m gonna be in 3 weeks, ya know?' },
  { segment: 'sweepers', label: 'Sweepers', desc: '(Under the rug)', sublabel: 'Worst I\'ll take', investment: 'LESS Investment' }
];

/** Market segmentation thresholds. Male = tier/percentile; female = Keeper/Sleeper/Sweeper lens. */
export const MARKET_SEGMENTS = [
  { min: 80, maleLabel: 'Top Tier (Top 20%)', femaleLabel: 'Top Tier (High Mate Value)' },
  { min: 60, maleLabel: 'Above Average', femaleLabel: 'Above Average (Strong Options)' },
  { min: 40, maleLabel: 'Average', femaleLabel: 'Average (Decent Options)' },
  { min: 20, maleLabel: 'Below Average', femaleLabel: 'Below Average (Limited Options)' },
  { min: 0, maleLabel: 'Bottom Quintile (Critical Development)', femaleLabel: 'Bottom Quintile (Critical Development)' }
];

/** Developmental levels (Hoe_math) */
export const DEVELOPMENTAL_LEVELS = [
  { min: 80, label: 'Integral/Holistic (High Integration)' },
  { min: 65, label: 'Achievement-Oriented (Rational/Strategic)' },
  { min: 50, label: 'Conformist (Rule-Following)' },
  { min: 35, label: 'Egocentric (Reactive/Impulsive)' },
  { min: 0, label: 'Survival Mode (Basic Needs Focus)' }
];
