// Core Temperament Dimensions
// Questions that map position on masculine-feminine spectrum across various life dimensions
// Reframed as situational prompts to avoid triggering keyword associations

export const TEMPERAMENT_DIMENSIONS = {
  // Core Behavioral Patterns
  direction_and_structure: {
    name: 'Direction and Structure',
    spectrumLabel: 'Flow and adaptation vs Direction and structure',
    description: 'Preference for establishing direction, order, and structure vs. flowing with what emerges',
    masculinePoleLabel: 'oriented to establishing direction, order, and structure',
    femininePoleLabel: 'oriented to flowing with what emerges',
    questions: [
      {
        id: 'dir_1',
        question: 'Imagine planning a significant project or journey. What feels more natural: creating a detailed roadmap with specific steps and deadlines, or keeping plans flexible and adapting as circumstances unfold?',
        masculineWeight: 1.0,
        feminineWeight: -0.8,
        poleLabels: { low: 'Flexible plans, adapting as unfolds', high: 'Detailed roadmap with steps and deadlines' }
      },
      {
        id: 'dir_2',
        question: 'When unexpected opportunities arise, how do you typically respond: by evaluating them against your existing plans, or by allowing yourself to explore where they might lead?',
        masculineWeight: -0.9,
        feminineWeight: 1.0,
        poleLabels: { low: 'Evaluating against existing plans', high: 'Exploring where they might lead' }
      },
      {
        id: 'dir_3',
        question: 'In a collaborative setting where roles are unclear, what feels more comfortable: stepping in to define who does what, or waiting to see how things naturally organize themselves?',
        masculineWeight: 1.0,
        feminineWeight: -0.7,
        poleLabels: { low: 'Waiting to see how things organize', high: 'Stepping in to define who does what' }
      },
      {
        id: 'dir_4',
        question: 'When making a decision, what feels more authentic: having clear criteria and boundaries to guide you, or staying open to possibilities and letting the situation reveal what\'s needed?',
        masculineWeight: -0.8,
        feminineWeight: 1.0,
        poleLabels: { low: 'Clear criteria and boundaries', high: 'Open to possibilities, let situation reveal' }
      }
    ]
  },
  
  provision_and_nurture: {
    name: 'Provision and Nurture',
    spectrumLabel: 'Attuned care and warmth vs Practical support and resources',
    description: 'Tendency toward practical support and securing what is needed vs. attuned care, warmth, and receptive understanding',
    masculinePoleLabel: 'oriented to practical support and securing resources',
    femininePoleLabel: 'oriented to attuned care, warmth, and understanding',
    questions: [
      {
        id: 'prov_1',
        question: 'When someone close to you faces difficulty, what feels more natural: taking practical action to solve their problems and secure resources, or offering attuned listening, warmth, and understanding?',
        masculineWeight: 1.0,
        feminineWeight: -0.6,
        poleLabels: { low: 'Attunement, warmth & understanding', high: 'Practical action & securing resources' }
      },
      {
        id: 'prov_2',
        question: 'In a moment when someone you care about seems distressed, what feels more authentic: addressing the emotional tone and creating a sense of warmth and safety, or focusing on the practical aspects of what needs to happen next?',
        masculineWeight: -0.7,
        feminineWeight: 1.0,
        poleLabels: { low: 'Focus on practical next steps', high: 'Emotional tone, warmth & safety' }
      },
      {
        id: 'prov_3',
        question: 'When you\'re going through a difficult time yourself, how comfortable are you with others taking care of practical matters for you, versus handling things independently even when help is offered?',
        masculineWeight: -0.8,
        feminineWeight: 1.0,
        poleLabels: { low: 'Handling independently', high: 'Others taking care of practical matters' }
      },
      {
        id: 'prov_4',
        question: 'Imagine a scenario where people depend on you. What feels more natural: feeling responsible for their security and well-being, or staying attuned and supportive while they find their own way?',
        masculineWeight: 1.0,
        feminineWeight: 0.3,
        poleLabels: { low: 'Attuned support while they find their way', high: 'Responsible for their security & well-being' }
      }
    ]
  },
  
  focus_and_expression: {
    name: 'Focus and Expression',
    spectrumLabel: 'Feeling-led processing vs Goal-led execution',
    description: 'Whether you lead with affect and process first, or with objectives, structure, and completing the task',
    masculinePoleLabel: 'oriented to goal-led execution and clear objectives',
    femininePoleLabel: 'oriented to feeling-led processing and emotional response',
    questions: [
      {
        id: 'foc_1',
        question: 'When working on something important, what feels more natural: maintaining clear objectives and working steadily toward a defined outcome, or allowing the process to unfold and evolve organically?',
        masculineWeight: 1.0,
        feminineWeight: -0.8,
        poleLabels: { low: 'Process unfolds organically', high: 'Clear objectives, defined outcome' }
      },
      {
        id: 'foc_2',
        question: 'When you recount a meaningful experience to someone, what feels more authentic: leading with what you felt and how it landed emotionally, or leading with the facts and sequence of what happened?',
        masculineWeight: -0.7,
        feminineWeight: 1.0,
        poleLabels: { low: 'Facts and sequence first', high: 'Feelings and emotional impact first' }
      },
      {
        id: 'foc_3',
        question: 'When strong emotions arise during a task that requires completion, what feels more natural: setting the feelings aside to maintain focus on the goal, or allowing the emotions to inform how you approach the task?',
        masculineWeight: 1.0,
        feminineWeight: -0.6,
        poleLabels: { low: 'Emotions inform approach', high: 'Set feelings aside, focus on goal' }
      },
      {
        id: 'foc_4',
        question: 'Imagine receiving difficult feedback. What feels more authentic: processing your emotional response first, or analyzing the information logically before allowing feelings to surface?',
        masculineWeight: -0.8,
        feminineWeight: 1.0,
        poleLabels: { low: 'Analyze logically first', high: 'Process emotional response first' }
      }
    ]
  },
  
  certainty_and_clarity: {
    name: 'Certainty and Clarity',
    spectrumLabel: 'Ambiguity and flow vs Certainty and direction',
    description: 'Need for certainty/direction vs. need for clarity/richness',
    masculinePoleLabel: 'oriented to certainty and clear direction',
    femininePoleLabel: 'comfortable with ambiguity and situational richness',
    questions: [
      {
        id: 'cert_1',
        question: 'When entering an unfamiliar situation, what helps you feel more secure: knowing exactly what to expect and having a clear plan, or trusting that you\'ll navigate it as it unfolds?',
        masculineWeight: 0.8,
        feminineWeight: -0.5,
        poleLabels: { low: 'Trust, navigate as unfolds', high: 'Clear plan, know what to expect' }
      },
      {
        id: 'cert_2',
        question: 'In a relationship or connection, what helps you feel more at ease: understanding where things stand, what\'s expected, and how the other person feels, or being comfortable with some ambiguity?',
        masculineWeight: -0.3,
        feminineWeight: 1.0,
        poleLabels: { low: 'Comfortable with ambiguity', high: 'Understanding where things stand' }
      },
      {
        id: 'cert_3',
        question: 'When outcomes are uncertain, what feels more natural: feeling anxious until you can gain more information, or remaining relatively calm and trusting the process?',
        masculineWeight: -0.6,
        feminineWeight: 0.4,
        poleLabels: { low: 'Anxious until more info', high: 'Calm, trusting the process' }
      },
      {
        id: 'cert_4',
        question: 'When others seem uncertain or unclear, what feels more natural: offering structure and clear direction to help them find their footing, or providing space for them to discover clarity on their own?',
        masculineWeight: 1.0,
        feminineWeight: -0.4,
        poleLabels: { low: 'Space to discover clarity', high: 'Structure and clear direction' }
      }
    ]
  },
  
  shame_and_fear: {
    name: 'Shame and Fear Sensitivity',
    spectrumLabel: 'Fear and abandonment vs Shame and status',
    description: 'Primary vulnerability: shame (masculine) vs. fear/isolation (feminine)',
    masculinePoleLabel: 'sensitive to shame and loss of respect or status',
    femininePoleLabel: 'sensitive to fear, isolation, and abandonment',
    questions: [
      {
        id: 'vuln_1',
        question: 'Imagine failing publicly or being perceived as incompetent. What feels more difficult: the sense of having lost respect or status, or the feeling of being exposed and vulnerable?',
        masculineWeight: 1.0,
        feminineWeight: -0.3,
        poleLabels: { low: 'Exposed and vulnerable', high: 'Lost respect or status' }
      },
      {
        id: 'vuln_2',
        question: 'In moments when connection feels threatened, what feels more difficult: the fear of being alone or abandoned, or the sense of having lost your footing or place in the relationship?',
        masculineWeight: -0.4,
        feminineWeight: 1.0,
        poleLabels: { low: 'Lost footing in relationship', high: 'Fear of alone or abandoned' }
      },
      {
        id: 'vuln_3',
        question: 'When you make a mistake that affects others, what feels worse: the sense that you\'ve let people down or shown weakness, or the uncertainty about whether others will still accept you?',
        masculineWeight: 1.0,
        feminineWeight: 0.2,
        poleLabels: { low: 'Uncertainty about acceptance', high: 'Let people down or showed weakness' }
      },
      {
        id: 'vuln_4',
        question: 'Imagine being in a situation where someone\'s intentions toward you are unclear. What creates more anxiety: not knowing where you stand with them, or not understanding what they might do next?',
        masculineWeight: -0.3,
        feminineWeight: 1.0,
        poleLabels: { low: 'Not knowing what they might do', high: 'Not knowing where I stand' }
      }
    ]
  },
  
  achievement_and_connection: {
    name: 'Achievement and Connection',
    spectrumLabel: 'Connection and belonging vs Achievement and mastery',
    description: 'Drive for achievement/mastery vs. drive for connection/belonging',
    masculinePoleLabel: 'oriented to achievement and mastery',
    femininePoleLabel: 'oriented to connection and belonging',
    questions: [
      {
        id: 'ach_1',
        question: 'When you accomplish something significant, what feels more satisfying: the recognition and validation from others, or the sense of personal mastery and competence?',
        masculineWeight: 1.0,
        feminineWeight: -0.5,
        poleLabels: { low: 'Recognition from others', high: 'Personal mastery and competence' }
      },
      {
        id: 'ach_2',
        question: 'In your relationships, what feels more important: creating harmony and feeling deeply connected, or achieving mutual goals and building something together?',
        masculineWeight: -0.6,
        feminineWeight: 1.0,
        poleLabels: { low: 'Mutual goals, building together', high: 'Harmony and deep connection' }
      },
      {
        id: 'ach_3',
        question: 'Imagine being in a competitive environment. What feels more natural: engaging fully in the competition and striving to excel, or finding ways to collaborate and minimize hierarchy?',
        masculineWeight: 1.0,
        feminineWeight: -0.7,
        poleLabels: { low: 'Collaborate, minimize hierarchy', high: 'Compete and strive to excel' }
      },
      {
        id: 'ach_4',
        question: 'When spending time with someone you care about, what feels more fulfilling: having deep, emotionally intimate conversations, or working together on shared projects or activities?',
        masculineWeight: -0.7,
        feminineWeight: 1.0,
        poleLabels: { low: 'Shared projects and activities', high: 'Deep emotionally intimate conversations' }
      }
    ]
  },
  
  control_and_flow: {
    name: 'Control and Flow',
    spectrumLabel: 'Flow and receptivity vs Control and mastery',
    description: 'Preference for control/mastery vs. flow/receptivity',
    masculinePoleLabel: 'oriented to control and mastery of outcomes',
    femininePoleLabel: 'oriented to flow and receptivity',
    questions: [
      {
        id: 'ctrl_1',
        question: 'When outcomes matter, what feels more natural: taking steps to ensure things go according to plan, or staying present and responding to what emerges?',
        masculineWeight: 1.0,
        feminineWeight: -0.8,
        poleLabels: { low: 'Present, respond to what emerges', high: 'Ensure things go according to plan' }
      },
      {
        id: 'ctrl_2',
        question: 'Imagine being in a situation where someone else is making decisions. What feels more comfortable: trusting their judgment and going with the flow, or needing to understand and potentially influence the direction?',
        masculineWeight: -0.9,
        feminineWeight: 1.0,
        poleLabels: { low: 'Trust, go with the flow', high: 'Understand and influence direction' }
      },
      {
        id: 'ctrl_3',
        question: 'When facing challenges, what feels more authentic: analyzing the situation and developing strategies to master it, or staying open to what the situation might teach you?',
        masculineWeight: 1.0,
        feminineWeight: -0.6,
        poleLabels: { low: 'Open to what it might teach', high: 'Analyze and develop strategies' }
      },
      {
        id: 'ctrl_4',
        question: 'In moments of uncertainty, what feels more natural: having faith that things will work out as they should, or taking action to influence the outcome?',
        masculineWeight: -0.7,
        feminineWeight: 1.0,
        poleLabels: { low: 'Faith things will work out', high: 'Take action to influence outcome' }
      }
    ]
  },
  
  independence_and_interdependence: {
    name: 'Independence and Interdependence',
    spectrumLabel: 'Interdependence vs Independence',
    description: 'Preference for independence/autonomy vs. interdependence/connection',
    masculinePoleLabel: 'oriented to independence and autonomy',
    femininePoleLabel: 'oriented to interdependence and shared reliance',
    questions: [
      {
        id: 'ind_1',
        question: 'When facing a challenge, what feels more natural: handling it yourself first and asking for help only if needed, or naturally involving others in problem-solving?',
        masculineWeight: 1.0,
        feminineWeight: -0.5,
        poleLabels: { low: 'Involving others in problem-solving', high: 'Handling it yourself first' }
      },
      {
        id: 'ind_2',
        question: 'In relationships, what feels more authentic: maintaining your own space and autonomy while being connected, or naturally blending lives and creating interdependence?',
        masculineWeight: -0.5,
        feminineWeight: 1.0,
        poleLabels: { low: 'Own space and autonomy', high: 'Blending lives, interdependence' }
      },
      {
        id: 'ind_3',
        question: 'When you need support, how comfortable are you with: relying on others to help carry the load, versus managing independently even when support is available?',
        masculineWeight: -0.8,
        feminineWeight: 0.7,
        poleLabels: { low: 'Managing independently', high: 'Relying on others to carry load' }
      },
      {
        id: 'ind_4',
        question: 'Imagine others depending on you for important matters. What feels more natural: being the one others rely on for stability and direction, or sharing responsibility more equally?',
        masculineWeight: 0.8,
        feminineWeight: 0.3,
        poleLabels: { low: 'Sharing responsibility equally', high: 'The one others rely on' }
      }
    ]
  },
  
  logic_and_intuition: {
    name: 'Logic and Intuition',
    spectrumLabel: 'Intuition and feeling vs Logic and analysis',
    description: 'Preference for logic/reason vs. intuition/feeling',
    masculinePoleLabel: 'oriented to logic and systematic analysis',
    femininePoleLabel: 'oriented to intuition and feeling',
    questions: [
      {
        id: 'log_1',
        question: 'When making an important decision, what feels more natural: gathering information, analyzing options, and using systematic thinking, or tuning into your feelings and inner sense of what\'s right?',
        masculineWeight: 1.0,
        feminineWeight: -0.6,
        poleLabels: { low: 'Feelings and inner sense', high: 'Information, analysis, systematic' }
      },
      {
        id: 'log_2',
        question: 'Imagine getting a "gut feeling" about something. How much do you typically: trust and act on that feeling, versus analyzing it logically before proceeding?',
        masculineWeight: -0.7,
        feminineWeight: 1.0,
        poleLabels: { low: 'Analyze logically first', high: 'Trust and act on feeling' }
      },
      {
        id: 'log_3',
        question: 'When presented with a new idea, what feels more authentic: understanding how it works and examining it systematically, or sensing whether it feels right before diving into the details?',
        masculineWeight: 1.0,
        feminineWeight: -0.5,
        poleLabels: { low: 'Sense if it feels right', high: 'Understand and examine systematically' }
      },
      {
        id: 'log_4',
        question: 'In moments when logic and feeling conflict, what feels more trustworthy: your analytical assessment of the situation, or your intuitive sense of what\'s true?',
        masculineWeight: -0.8,
        feminineWeight: 1.0,
        poleLabels: { low: 'Analytical assessment', high: 'Intuitive sense of what\'s true' }
      }
    ]
  },
  
  stability_and_movement: {
    name: 'Stability and Movement',
    spectrumLabel: 'Movement and responsiveness vs Stability and direction',
    description: 'Preference for stability/steadiness vs. movement/change',
    masculinePoleLabel: 'oriented to stability and steady direction',
    femininePoleLabel: 'oriented to movement and attuned responsiveness',
    questions: [
      {
        id: 'stab_1',
        question: 'When life feels chaotic, what helps you feel more grounded: having routines and predictable structures, or allowing yourself to move with the energy and find your balance dynamically?',
        masculineWeight: 1.0,
        feminineWeight: -0.4,
        poleLabels: { low: 'Move with energy, dynamic balance', high: 'Routines and predictable structures' }
      },
      {
        id: 'stab_2',
        question: 'Imagine your environment or circumstances changing frequently. What feels more natural: finding it energizing and dynamic, or preferring more consistency and predictability?',
        masculineWeight: -0.6,
        feminineWeight: 1.0,
        poleLabels: { low: 'Consistency and predictability', high: 'Energizing and dynamic' }
      },
      {
        id: 'stab_3',
        question: 'When others around you feel unsteady, what feels more natural: offering stabilizing steadiness and clear direction, or staying attuned to their experience and responding to their needs?',
        masculineWeight: 1.0,
        feminineWeight: 0.2,
        poleLabels: { low: 'Attuned to their experience', high: 'Stabilizing steadiness and direction' }
      },
      {
        id: 'stab_4',
        question: 'In a group setting, what feels more authentic: maintaining your own steady composure regardless of the energy around you, or naturally picking up and responding to the emotional tone of the group?',
        masculineWeight: -0.7,
        feminineWeight: 1.0,
        poleLabels: { low: 'Own steady composure', high: 'Pick up and respond to group tone' }
      }
    ]
  },

  aesthetic_orientation: {
    name: 'Aesthetic Orientation',
    spectrumLabel:
      'Intuitive, mood-led grooming and style vs Deliberate, consistent, or purely functional grooming and style',
    description:
      'How you compose grooming and dress: one pole is mood-led self-expression through look; the other is not mood-orchestrated—either a deliberate, repeatable standard, manufacturing an outcome (including polished or “power” looks), or a deprioritised / purely functional baseline with little day-to-day variation driven by feeling.',
    masculinePoleLabel:
      'deliberate, consistent, functional, or deprioritised grooming—not mood-orchestrated',
    femininePoleLabel: 'intuitive, mood-led grooming and style as expression',
    questions: [
      {
        id: 'aes_1',
        question:
          'When it comes to how you dress, groom, and carry yourself, which feels more like you: your look often expresses mood and inner state and shifts with how you feel (0), or you keep a steady approach that is not driven by day-to-day feeling—either a clear personal standard you maintain, or a simple functional baseline with minimal investment beyond what situations require (10)?',
        masculineWeight: 1.0,
        feminineWeight: -0.8,
        poleLabels: {
          low: 'Mood-led—look expresses how I feel',
          high: 'Deliberate standard or minimal/functional—not mood-orchestrated'
        }
      },
      {
        id: 'aes_2',
        question:
          'If you decided to improve or maintain your fitness or physical appearance, which would feel more like you: caring for yourself in ways that feel enjoyable, intuitive, and in-the-moment (0), or a structured programme with targets—or, if you rarely prioritise this, doing only what is pragmatic or obligatory with little “how I feel today” in the mix (10)?',
        masculineWeight: 1.0,
        feminineWeight: -0.7,
        poleLabels: {
          low: 'Intuitive and enjoyable in the moment',
          high: 'Structured plan, or pragmatic / minimal engagement'
        }
      },
      {
        id: 'aes_3',
        question:
          'When your aesthetic changes—new style, fitness phase, or look—is that usually from a deliberate decision, plan, or practical trigger (e.g. new role, need to meet a bar) (0), or does it tend to emerge as mood, interests, or inner state shift (10)?',
        masculineWeight: -0.8,
        feminineWeight: 1.0,
        poleLabels: {
          low: 'Deliberate, planned, or practically triggered',
          high: 'Emerges with mood, interests, or inner state'
        }
      },
      {
        id: 'aes_4',
        question:
          'Which is closer to how you actually operate: your grooming and clothes track your inner state and change with mood (0), or you hold a stable approach regardless of mood—either a consistent standard you enforce or a fixed functional “good enough” you barely vary (10)?',
        masculineWeight: 0.9,
        feminineWeight: -0.9,
        poleLabels: {
          low: 'Look tracks inner state and mood',
          high: 'Stable standard or functional baseline regardless of mood'
        }
      },
      {
        id: 'aes_5',
        question:
          'Day to day, is how you groom and dress mainly a channel for self-expression tied to how you feel (0), or mainly practical, fixed, or low priority—not something you use to express shifting inner state (10)?',
        masculineWeight: 1.0,
        feminineWeight: -0.75,
        poleLabels: {
          low: 'Expression tied to mood and inner state',
          high: 'Practical, fixed, or deprioritised—not a mood channel'
        }
      }
    ]
  }
};
