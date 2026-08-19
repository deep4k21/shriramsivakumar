export interface CategoryStat {
  value: string;
  label: string;
}

export interface ProcessRow {
  label: string;
  text: string;
  slot: string;
}

export interface Category {
  id: string;
  title: string;
  short: string;
  tags: string;
  body: string;
  lead: string;
  leadBold: string;
  stats: CategoryStat[];
  projects: string[];
  software: string[];
  problem: string;
  solution: string;
  chips: string[];
  typeface: string;
  endNote: string;
}

export const PROCESS_ROWS: ProcessRow[] = [
  {
    label: 'DISCOVERY',
    text: 'Mapped the existing flow with the teams who use it daily, and wrote down where it broke.',
    slot: 'AUDIT / FLOW MAP',
  },
  {
    label: 'EXPLORATION',
    text: 'Explored layout and hierarchy options before committing to a direction.',
    slot: 'EXPLORATIONS',
  },
  {
    label: 'SYSTEM',
    text: 'Turned the chosen direction into components, tokens and documented rules.',
    slot: 'COMPONENTS',
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    short: 'UI/UX',
    tags: 'Enterprise · SaaS · Product',
    body: 'Designing intuitive digital experiences that transform complex workflows into scalable products and seamless user journeys.',
    lead: 'Complex enterprise workflows turned into',
    leadBold: 'scalable products.',
    stats: [
      { value: '20+', label: 'PRODUCTS' },
      { value: '6', label: 'YEARS' },
      { value: '5', label: 'INDUSTRIES' },
    ],
    projects: [
      'Enterprise dashboard suite',
      'Field operations mobile app',
      'Analytics console',
      'Design system v3',
      'Client onboarding flow',
    ],
    software: ['Figma', 'Framer', 'After Effects'],
    problem:
      'A dense operational workflow spread across disconnected tools, with no shared language between the teams using it.',
    solution:
      'A single console built on a component library, so every new screen inherits the same behaviour and hierarchy.',
    chips: ['#00B8C9', '#FF9A5C', '#47C89A', '#16181D'],
    typeface: 'Sora / Roboto',
    endNote: 'The system outlived the project — later teams shipped screens without design review.',
  },
  {
    id: 'brand-identity',
    title: 'Brand Identity',
    short: 'Brand Identity',
    tags: 'Identity · Strategy · Guidelines',
    body: 'Building memorable brands through thoughtful identities and scalable visual systems.',
    lead: 'Identities and visual systems built to',
    leadBold: 'hold together at scale.',
    stats: [
      { value: '10+', label: 'IDENTITIES' },
      { value: '4', label: 'REBRANDS' },
      { value: '10+', label: 'MARKETS' },
    ],
    projects: [
      'A SaaS rebrand',
      'Sub-brand architecture',
      'Identity guidelines',
      'A sub logo system',
      'Event identity',
    ],
    software: ['Illustrator', 'Figma', 'InDesign'],
    problem: 'A parent brand and its products had drifted apart visually, so nothing read as one company.',
    solution:
      'A shape and colour vocabulary shared across the parent and its sub-brands, documented as usable rules.',
    chips: ['#FF9A5C', '#101010', '#47C89A', '#FFFFFF'],
    typeface: 'Sora',
    endNote: 'Guidelines written for the people applying them, not for the deck.',
  },
  {
    id: 'marketing-campaigns',
    title: 'Marketing Campaigns',
    short: 'Campaigns',
    tags: 'Creative · Growth · Performance',
    body: 'Campaigns that combine storytelling, strategy, events, illustrations and measurable business impact.',
    lead: 'Storytelling and strategy measured on',
    leadBold: 'business impact.',
    stats: [
      { value: '50+', label: 'CAMPAIGNS' },
      { value: '12', label: 'EVENTS' },
      { value: '10+', label: 'MARKETS' },
    ],
    projects: [
      'A global launch campaign',
      'Exhibition booth',
      'E-magazine series',
      'Performance creatives',
      'Regional launch kit',
    ],
    software: ['Photoshop', 'Illustrator', 'Premiere Pro'],
    problem: 'A regional launch needed one story that worked on a booth wall, a landing page and a paid feed.',
    solution: 'A modular creative kit — one idea, three formats, built to be re-cut by local teams.',
    chips: ['#47C89A', '#FF9A5C', '#101010', '#00B8C9'],
    typeface: 'Sora / Roboto',
    endNote: 'Measured on pipeline, not impressions.',
  },
  {
    id: 'what-if',
    title: 'What If — Brand Reimagined',
    short: 'What If',
    tags: 'Conceptual · Explorations',
    body: 'Speculative redesigns exploring how iconic brands could evolve through new visual systems.',
    lead: 'Speculative redesigns of icons, done to',
    leadBold: 'think out loud.',
    stats: [
      { value: '5', label: 'STUDIES' },
      { value: '3', label: 'SECTORS' },
      { value: '∞', label: 'CURIOSITY' },
    ],
    projects: [
      'An airline rebrand study',
      'A transit identity study',
      'A retail concept',
      'A sports mark study',
      'A broadcast package',
    ],
    software: ['Figma', 'Illustrator', 'Rive'],
    problem: 'A category convention nobody had questioned in twenty years.',
    solution: 'A speculative system that keeps the recognition and rebuilds everything behind it.',
    chips: ['#00B8C9', '#FFFFFF', '#101010', '#FF9A5C'],
    typeface: 'Sora',
    endNote: 'Speculative work, done to think — not a claim of ownership.',
  },
];

export interface Role {
  name: string;
  font: 'sora' | 'roboto';
  logo: string;
  title: string;
  period: string;
  progression?: string;
  bullets: string[];
}

export const ROLES: Role[] = [
  {
    name: 'Protiviti',
    font: 'sora',
    logo: '/images/career/logo-protiviti.svg',
    title: 'Deputy Manager – Marketing Design',
    period: '(June 2023 – April 2025)',
    bullets: [
      'Led the UI/UX function within the Marketing Design team.',
      'Designed enterprise dashboards, mobile apps and web experiences for clients across India and the Middle East.',
      'Created marketing collaterals including exhibition booths, brochures, e-magazines and campaign assets.',
      'Simplified complex business challenges into strategic presentations and user-centered digital solutions.',
      'Built and maintained scalable design systems to ensure consistency across projects.',
      'Transformed ideas into interactive dashboard prototypes, helping stakeholders visualise solutions before development.',
    ],
  },
  {
    name: 'Freshworks',
    font: 'sora',
    logo: '/images/career/logo-freshworks.svg',
    title: 'Senior Visual Designer',
    period: '(add dates)',
    progression: 'Graphic Designer → Visual Designer → Senior Visual Designer',
    bullets: [
      'Placeholder — send the bullets and I will drop them in verbatim.',
      'Suggested coverage: product marketing design, campaign systems, brand application at scale.',
    ],
  },
  {
    name: 'RR Donnelley',
    font: 'sora',
    logo: '/images/career/logo-rd.png',
    title: 'Visual Designer',
    period: '(add dates)',
    bullets: ['Placeholder — awaiting copy.'],
  },
  {
    name: '2adpro',
    font: 'sora',
    logo: '/images/career/logo-2adpro.svg',
    title: 'Graphic Designer',
    period: '(add dates)',
    bullets: ['Placeholder — awaiting copy.'],
  },
];

export interface NavItem {
  id: string;
  href: string;
  label: string;
  index: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', href: '#home', label: 'Home', index: '01', icon: '/images/menuicons/house.svg' },
  { id: 'portfolio', href: '#portfolio', label: 'Portfolio', index: '02', icon: '/images/menuicons/stylus_note.svg' },
  { id: 'career', href: '#career', label: 'Career journey', index: '03', icon: '/images/menuicons/card_travel.svg' },
];

export interface ConnectLink {
  label: string;
  value: string;
  href: string;
}

export const CONNECT_LINKS: ConnectLink[] = [
  { label: 'Email', value: 'hello@shriram.design', href: 'mailto:hello@shriram.design' },
  { label: 'LinkedIn', value: '/in/shriramsivakumar', href: '#' },
  { label: 'Behance', value: '/shriram', href: '#' },
  { label: 'Resume', value: 'PDF', href: '#' },
];

export interface ToolIcon {
  name: string;
  icon: string;
}

export const TOOLKIT: ToolIcon[] = [
  { name: 'Figma', icon: '/images/mytoolkit/Group 366.png' },
  { name: 'Illustrator', icon: '/images/mytoolkit/Group 369.png' },
  { name: 'Photoshop', icon: '/images/mytoolkit/Group 368.png' },
  { name: 'Framer', icon: '/images/mytoolkit/image 17.png' },
  { name: 'InDesign', icon: '/images/mytoolkit/Group 367.png' },
  { name: 'After Effects', icon: '/images/mytoolkit/Clip path frame.png' },
  { name: 'XD', icon: '/images/mytoolkit/Rectangle.png' },
  { name: 'Premiere Pro', icon: '/images/mytoolkit/Rectangle (1).png' },
  { name: 'Rive', icon: '/images/mytoolkit/image 27.png' },
  { name: 'PowerPoint', icon: '/images/mytoolkit/image 19.png' },
  { name: 'Procreate', icon: '/images/mytoolkit/Rectangle (2).png' },
];

export const AI_TOOLS: ToolIcon[] = [
  { name: 'ChatGPT', icon: '/images/aiworkflow/image 20.png' },
  { name: 'Midjourney', icon: '/images/aiworkflow/image 21.png' },
  { name: 'Claude', icon: '/images/aiworkflow/image 22.png' },
  { name: 'Magnific', icon: '/images/aiworkflow/image 24.png' },
  { name: 'Figma AI', icon: '/images/aiworkflow/image 25.png' },
  { name: 'Stitch', icon: '/images/aiworkflow/image 26.png' },
];

export const HERO_STATS = [
  { value: '500+', label: 'Projects delivered' },
  { value: '9', label: 'Years experience' },
  { value: 'Worldwide', label: 'Clients served' },
];

export interface IntroWordSpec {
  text: string;
  variant: 'teal' | 'strong';
}

export const INTRO_WORDS: IntroWordSpec[] = [
  { text: 'Layovers', variant: 'teal' },
  { text: 'to', variant: 'teal' },
  { text: 'layouts,', variant: 'teal' },
  { text: 'I’m', variant: 'strong' },
  { text: 'Shriram.', variant: 'strong' },
];

export const INTRO_QUOTE_WORDS = ['see', 'design'];

export interface IntroTile {
  label: string;
  icon: 'sparkle' | 'compass';
  body: string;
  bold: string;
  boldPosition: 'start' | 'end';
}

export const INTRO_TILES: IntroTile[] = [
  {
    label: 'EXPLORING',
    icon: 'sparkle',
    bold: 'Motion systems',
    boldPosition: 'start',
    body: 'and speculative rebrands.',
  },
  {
    label: 'AFTER HOURS',
    icon: 'compass',
    body: 'Window seats, street signage, and',
    bold: '14 countries',
    boldPosition: 'end',
  },
];

export const INTRO_SLIDES = ['At the desk', 'On the road', 'Studio setup', 'Speaking', 'Sketchbook', 'Window seat'];

export interface AboutChunkSpec {
  text: string;
  variant: 'body' | 'strong' | 'orange' | 'green';
}

export const ABOUT_CHUNKS: AboutChunkSpec[] = [
  { text: 'Nine years', variant: 'strong' },
  { text: 'across', variant: 'body' },
  { text: 'SaaS and enterprise', variant: 'orange' },
  { text: 'product design —', variant: 'body' },
  { text: 'leading UI/UX inside marketing and product teams, and contributing to', variant: 'body' },
  { text: 'rebrands, dashboards and design systems', variant: 'green' },
  { text: 'on multiple projects.', variant: 'body' },
];
