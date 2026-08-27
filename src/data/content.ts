export interface CategoryStat {
  value: string;
  label: string;
}

export interface ProcessRow {
  label: string;
  text: string;
  slot: string;
  /** Caps the image slot's height (e.g. "380px") instead of the template default. */
  slotMaxHeight?: string;
  /** Locks the image slot to a 16:9 aspect ratio (width-driven) instead of the template default. */
  slotAspectVideo?: boolean;
  /**
   * Stacks the row as text-on-top, full-width slot below, instead of the
   * standard two-column (text-left, slot-right) layout.
   */
  stacked?: boolean;
  /**
   * Renders the slot as an embedded live prototype instead of a static
   * placeholder. Never opens in a new tab. Omit for a standard slot.
   */
  prototype?: ProjectPrototype;
}

export interface ProjectPrototype {
  /** Embed URL for the live prototype (never opened in a new tab). */
  embedUrl: string;
}

/** A colour chip carries its own border so darker swatches stay visible on the dark surface. */
export interface ColorChip {
  color: string;
  /** Defaults to a faint white border in the UI; only set this for a chip that needs a different one. */
  border?: string;
}

/**
 * Everything the project overlay needs is per-project, not per-category:
 * different projects in the same category can have unrelated problems and
 * solutions. Categories that haven't been given individual project detail yet
 * have every project share the same values, matching how the site looked
 * before this existed.
 */
export interface ProjectMetric {
  /** e.g. "47+", "2" — a leading number is counted up on scroll-in; any trailing suffix is preserved. */
  value: string;
  label: string;
}

export interface Project {
  /** Shown on the category tile and the tab strip — kept short/generic ("A podcast identity"). */
  name: string;
  /**
   * The project's actual title, shown in the overlay's sticky header and hero
   * banner. Falls back to `name` for every project that hasn't been given a
   * distinct one — only projects with a proper-noun title (like "Orbitshift
   * Podcast") need to set this.
   */
  title?: string;
  software: string[];
  problem: string;
  solution: string;
  chips: ColorChip[];
  typeface: string;
  processRows: ProcessRow[];
  endNote: string;
  /**
   * The optional outcome-metrics row, sitting between the process rows and the
   * end note. Omitted entirely for a project without metrics — the section
   * renders nothing and reserves no space.
   */
  metrics?: { label: string; stats: ProjectMetric[] };
}

export interface Category {
  id: string;
  title: string;
  short: string;
  tags: string;
  body: string;
  lead: string;
  leadBold: string;
  /** The category's icon in the sidebar's nested list. */
  icon?: string;
  /** Artwork shown inside the portfolio tile, between the copy and the link. */
  art?: string;
  /** The same artwork with its accent darkened, shown on the tile's filled side. */
  artDark?: string;
  stats: CategoryStat[];
  projects: Project[];
}

/** The process rows shared by every project that hasn't been given its own. */
const DEFAULT_PROCESS_ROWS: ProcessRow[] = [
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

/** Wraps a flat hex list into chips with the standard border. */
function chipsFrom(colors: string[]): ColorChip[] {
  return colors.map((color) => ({ color }));
}

export const CATEGORIES: Category[] = [
  {
    id: 'ui-ux',
    icon: '/images/menuicons/uiux.svg',
    title: 'UI/UX Design',
    short: 'UI/UX',
    tags: 'Enterprise · SaaS · Product',
    body: 'Designing intuitive digital experiences that transform complex workflows into scalable products and seamless user journeys.',
    lead: 'Complex enterprise workflows turned into',
    leadBold: 'scalable products.',
    art: '/images/portfolio/UIUX.svg',
    artDark: '/images/portfolio/UIUX-dark.svg',
    stats: [
      { value: '20+', label: 'PRODUCTS' },
      { value: '6', label: 'YEARS' },
      { value: '5', label: 'INDUSTRIES' },
    ],
    projects: [
      {
        name: 'A healthcare dashboard',
        software: ['Figma', 'Illustrator'],
        problem:
          'A self-directed exploration: clinicians finish charts after hours because patient data, appointments, labs and messages sit in separate places, and nothing on screen separates urgent from routine.',
        solution: "A dashboard ranked by urgency instead of organised by category — the day's shape readable in one glance.",
        chips: [
          { color: '#16697A', border: 'rgba(255,255,255,0.15)' },
          { color: '#489FB5', border: 'rgba(255,255,255,0.15)' },
          { color: '#8ABCC7', border: 'rgba(255,255,255,0.15)' },
          { color: '#EEF3F3', border: 'rgba(255,255,255,0.15)' },
          { color: '#F6AF4E', border: 'rgba(255,255,255,0.15)' },
        ],
        typeface: 'Roboto',
        processRows: [
          {
            label: 'PREMISE',
            text: 'I set myself a standard healthcare dashboard brief — patient list, scheduling, records, messaging, analytics — and one rule: every feature earns its position or loses it. Five equal panels would have been the obvious answer, and the wrong one.',
            slot: 'PERSONA',
            slotAspectVideo: true,
          },
          {
            label: 'TRIAGE',
            text: "The physician I wrote for doesn't need more capability, she needs less noise. So alerts and messages each split into critical and routine, four counters set the day's shape, and analytics — the flashiest thing in the brief — got demoted below the fold. Accessibility and data-privacy constraints shaped the structure at wireframe stage, across three screen sizes.",
            slot: 'WIREFRAMES — DESKTOP / TABLET / MOBILE',
            slotAspectVideo: true,
          },
          {
            label: 'INTERFACE',
            text: 'Blues carry the calm; a single amber is withheld for what genuinely needs attention. The mark argues the same thing — an H and D whose negative space forms a cross. Simple on the surface, structured underneath.',
            slot: 'MOCKUPS',
            stacked: true,
            prototype: { embedUrl: 'about:blank' },
          },
        ],
        endNote: 'The brief asked for five features. The exercise was deciding which four could be quieter.',
      },
      ...['Field operations mobile app', 'Analytics console', 'Design system v3', 'Client onboarding flow'].map(
        (name) => ({
          name,
          software: ['Figma', 'Framer', 'After Effects'],
          problem:
            'A dense operational workflow spread across disconnected tools, with no shared language between the teams using it.',
          solution:
            'A single console built on a component library, so every new screen inherits the same behaviour and hierarchy.',
          chips: chipsFrom(['#00B8C9', '#FF9A5C', '#47C89A', '#16181D']),
          typeface: 'Sora / Roboto',
          processRows: DEFAULT_PROCESS_ROWS,
          endNote: 'The system outlived the project — later teams shipped screens without design review.',
        }),
      ),
    ],
  },
  {
    id: 'brand-identity',
    icon: '/images/menuicons/brandidentity.svg',
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
      {
        name: 'A SaaS rebrand',
        software: ['Illustrator', 'Figma', 'InDesign'],
        problem: 'A parent brand and its products had drifted apart visually, so nothing read as one company.',
        solution:
          'A shape and colour vocabulary shared across the parent and its sub-brands, documented as usable rules.',
        chips: chipsFrom(['#FF9A5C', '#101010', '#47C89A', '#FFFFFF']),
        typeface: 'Sora',
        processRows: DEFAULT_PROCESS_ROWS,
        endNote: 'Guidelines written for the people applying them, not for the deck.',
      },
      // 2nd project: previously "Sub-brand architecture" — swapped with it so
      // this sits 2nd and that sits 4th, per instruction.
      {
        name: 'Freshstart',
        software: ['Illustrator', 'Figma'],
        problem:
          'A startup partnership programme lived inside a larger SaaS brand with no mark of its own — nothing signalled that it belonged to the family, or that it stood for something distinct within it.',
        solution:
          'One shape that reads two ways: hands joined in partnership, and a rocket for the startups being backed.',
        chips: [
          { color: '#6EE2F5', border: 'rgba(255,255,255,0.15)' },
          { color: '#4D54F0', border: 'rgba(255,255,255,0.15)' },
          { color: '#322A78', border: 'rgba(255,255,255,0.15)' },
        ],
        typeface: 'Neue Haas Unica',
        processRows: [
          {
            label: 'ORIGIN',
            text: 'Started from the parent brand’s existing community icon — three figures holding hands. Already understood internally, so the new mark would inherit meaning rather than introduce it.',
            slot: 'SOURCE ICON',
          },
          {
            label: 'TRANSLATION',
            text: 'Morphed that icon toward the parent brand’s signature drop shape, so the sub-mark would sit inside the existing visual family rather than beside it.',
            slot: 'SHAPE STUDIES',
          },
          {
            label: 'INVERSION',
            text: 'Inverting the colour direction turned the drop’s negative space into a rocket silhouette. Partnership and startup became the same shape.',
            slot: 'FINAL MARK',
          },
        ],
        endNote:
          'The rocket wasn’t the plan. It appeared once the colour inverted — and two ideas resolved into one shape.',
      },
      // 3rd project — previously "Identity guidelines", replaced with the
      // podcast identity per instruction (2026-08-25).
      {
        name: 'A podcast identity',
        title: 'Orbitshift Podcast',
        software: ['Illustrator', 'Figma'],
        problem:
          'A startup programme wanted to reach founders beyond its own product ecosystem. That meant a podcast that could stand as its own media property while still reading as part of the family.',
        solution: "A rocket leaving its orbit. The name's meaning, drawn as one line.",
        chips: [
          { color: '#00B9FF', border: 'rgba(255,255,255,0.15)' },
          { color: '#A33CFF', border: 'rgba(255,255,255,0.15)' },
        ],
        typeface: 'Rubik',
        processRows: [
          {
            label: 'TRAJECTORY',
            text: "An orbit shift is the moment a body stops circling at one altitude and commits to a higher one. That's the same move a company makes going from startup to scale-up — and the same thing an hour with someone further along is meant to trigger.",
            slot: 'CONCEPT',
          },
          {
            label: 'ESCAPE',
            text: 'The rocket sits outside the ring rather than inside it. Containment would have meant a company orbiting comfortably; breaking the circle meant leaving the path it was on. The gradient runs violet to blue along the direction of travel.',
            slot: 'MARK CONSTRUCTION',
          },
          {
            label: 'SURFACE',
            // A full tall screenshot of the site alongside the social work: the
            // dark-to-light scroll transition is the point and is lost if only
            // the hero is shown.
            text: 'The system extended into a site that opens in deep space and resolves into daylight as you scroll, with guest portraits duotoned into the palette, then out again across episode artwork, launch banners and social posts.',
            slot: 'WEBSITE + APPLICATION',
          },
        ],
        metrics: {
          label: 'OUTCOME',
          stats: [
            { value: '2', label: 'SEASONS PRODUCED' },
            { value: '47+', label: 'EPISODES PUBLISHED' },
            { value: '4', label: 'PLATFORMS DISTRIBUTED' },
          ],
        },
        endNote:
          'The rocket sits outside the ring, not inside it. That was the whole argument — the point was never to orbit well.',
      },
      // 4th project — previously "Sub-brand architecture" (itself previously
      // 2nd, swapped with "A sub logo system" above).
      {
        name: 'Uplift',
        software: ['Illustrator', 'Figma'],
        problem:
          "A global marketing technology brand needed an identity for its New York chapter — something with its own energy that still read as family, not a separate company.",
        solution:
          "A wordmark engineered from the parent brand's own arrow, so the event, the city and the company all live inside the same letterforms.",
        chips: [
          { color: '#2146EC', border: 'rgba(255,255,255,0.15)' },
          { color: '#0A1533', border: 'rgba(255,255,255,0.15)' },
          { color: '#4FDCCE', border: 'rgba(255,255,255,0.15)' },
          { color: '#FFFAEF', border: 'rgba(255,255,255,0.15)' },
        ],
        typeface: 'Roboto',
        processRows: [
          {
            label: 'REFERENCES',
            text: "Four starting points, all pointing the same way: the parent brand's arrow, the physical act of being lifted, a torch held above a city, and the rising axis of a growth chart.",
            slot: 'MOODBOARD',
          },
          {
            label: 'CONSTRUCTION',
            text: 'The U becomes an upward arrow. The P grows out of it, so the mark reads bottom-to-top as foundation into elevation. The L lifts the rest of the word off its baseline and doubles as a chart axis.',
            slot: 'LETTERFORM STUDIES',
          },
          {
            label: 'EXTENSION',
            text: "The arrow scales out of the logo and into the environment — repeated as a backdrop pattern over a mapped world, so the mark's single gesture becomes the brand's ambient texture.",
            slot: 'BACKDROP + APPLICATION',
          },
        ],
        endNote:
          'Four ideas share one wordmark — an arrow, a lift, a torch, an axis. None of them announce themselves. You find them one at a time.',
      },
      {
        name: 'Forge',
        software: ['Illustrator', 'Figma'],
        problem:
          'An accelerator programme for early-stage founders needed a mark of its own — one that described what the programme does to a company, not just who runs it.',
        solution: 'An anvil and the letter F share a silhouette. Overlaid, they make one mark: the surface things get made on.',
        chips: [
          { color: '#FF9900', border: 'rgba(255,255,255,0.15)' },
          { color: '#434343', border: 'rgba(255,255,255,0.15)' },
        ],
        typeface: 'Roboto',
        processRows: [
          {
            label: 'PREMISE',
            text: "Forge is a verb before it's a name. Heat and force applied until raw material takes an edge — a fair description of what an accelerator does to an early company.",
            slot: 'NAME + CONCEPT',
          },
          {
            label: 'FUSION',
            text: 'An anvil profile and a capital F share the same structure: flat top, stepped shoulder, vertical base. Overlaying them produced a single mark that holds both readings.',
            slot: 'ANVIL / F STUDIES',
          },
          {
            label: 'HEAT',
            text: 'The wordmark stays graphite; only the leading edge of the F ignites. Orange reads as the moment of striking rather than as decoration.',
            slot: 'FINAL MARK + APPLICATION',
          },
        ],
        endNote:
          "An anvil doesn't make anything by itself. It's the surface something else gets made on — which is the more honest description of what a programme like this actually does.",
      },
    ],
  },
  {
    id: 'marketing-campaigns',
    icon: '/images/menuicons/campaigns.svg',
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
    ].map((name) => ({
      name,
      software: ['Photoshop', 'Illustrator', 'Premiere Pro'],
      problem: 'A regional launch needed one story that worked on a booth wall, a landing page and a paid feed.',
      solution: 'A modular creative kit — one idea, three formats, built to be re-cut by local teams.',
      chips: chipsFrom(['#47C89A', '#FF9A5C', '#101010', '#00B8C9']),
      typeface: 'Sora / Roboto',
      processRows: DEFAULT_PROCESS_ROWS,
      endNote: 'Measured on pipeline, not impressions.',
    })),
  },
  {
    id: 'what-if',
    icon: '/images/menuicons/whatif.svg',
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
    ].map((name) => ({
      name,
      software: ['Figma', 'Illustrator', 'Rive'],
      problem: 'A category convention nobody had questioned in twenty years.',
      solution: 'A speculative system that keeps the recognition and rebuilds everything behind it.',
      chips: chipsFrom(['#00B8C9', '#FFFFFF', '#101010', '#FF9A5C']),
      typeface: 'Sora',
      processRows: DEFAULT_PROCESS_ROWS,
      endNote: 'Speculative work, done to think — not a claim of ownership.',
    })),
  },
];

export interface BulletRun {
  text: string;
  strong?: boolean;
}

export interface Role {
  name: string;
  font: 'sora' | 'roboto';
  logo: string;
  title: string;
  period: string;
  progression?: string[];
  bullets: BulletRun[][];
}

export const ROLES: Role[] = [
  {
    name: 'Protiviti',
    font: 'sora',
    logo: '/images/career/logo-protiviti.svg',
    title: 'Deputy Manager - Marketing Design',
    period: 'June 2023 - April 2025',
    bullets: [
      [{ text: 'Led the ' }, { text: 'UI/UX', strong: true }, { text: ' function within the Marketing Design team.' }],
      [
        { text: 'Designed enterprise ' },
        { text: 'dashboards', strong: true },
        { text: ', ' },
        { text: 'mobile apps,', strong: true },
        { text: ' and ' },
        { text: 'web experiences', strong: true },
        { text: ' for clients across India and the Middle East.' },
      ],
      [
        { text: 'Created ' },
        { text: 'marketing collaterals', strong: true },
        { text: ' including exhibition booths, brochures, e-magazines, and campaign assets.' },
      ],
      [
        { text: 'Simplified complex business challenges into ' },
        { text: 'strategic presentations,', strong: true },
        { text: ' intuitive & user-centered digital solutions.' },
      ],
      [
        { text: 'Built and maintained ' },
        { text: 'scalable design systems', strong: true },
        { text: ' to ensure consistency across projects.' },
      ],
      [
        { text: 'Transformed ideas into ' },
        { text: 'interactive dashboard prototypes,', strong: true },
        { text: ' helping stakeholders visualize solutions before development.' },
      ],
    ],
  },
  {
    name: 'Freshworks',
    font: 'sora',
    logo: '/images/career/logo-freshworks.svg',
    title: 'Senior Visual Designer',
    period: 'January 2019 - December 2022',
    progression: ['Graphic Designer', 'Visual Designer', 'Senior Visual Designer'],
    bullets: [
      [
        { text: 'Progressed through ' },
        { text: 'three', strong: true },
        { text: ' design roles, led marketing design for the ' },
        { text: 'Partnerships, Startups,', strong: true },
        { text: ' and ' },
        { text: 'Marketplace teams.', strong: true },
      ],
      [
        { text: 'Collaborated with ' },
        { text: '100+', strong: true },
        { text: ' global stakeholders across regions and business functions.' },
      ],
      [
        { text: 'Drove branding and creative direction for flagship programs including ' },
        { text: 'Freshstart, Orbitshift Podcast,', strong: true },
        { text: ' and ' },
        { text: 'Forge.', strong: true },
      ],
      [
        { text: 'Played a key role in the ' },
        { text: 'Freshworks global rebranding', strong: true },
        { text: ' initiative, helping scale visual consistency across digital touchpoints.' },
      ],
      [
        { text: 'Designed integrated ' },
        { text: 'marketing campaigns, event branding, landing pages,', strong: true },
        { text: ' and digital experiences for global audiences.' },
      ],
      [
        { text: 'Recognized for creative excellence through awards including ' },
        { text: 'Best Rookie (2019)', strong: true },
        { text: ' and ' },
        { text: 'Certificate of Innovation (2020).', strong: true },
      ],
    ],
  },
  {
    name: 'RR Donnelley',
    font: 'sora',
    logo: '/images/career/logo-rd.png',
    title: 'Graphic Designer',
    period: 'August 2017 - October 2018',
    bullets: [
      [
        { text: 'Designed executive presentations and visual communication materials for ' },
        { text: 'Fortune 500 clients.', strong: true },
      ],
      [
        { text: 'Created custom ' },
        { text: 'illustrations, infographics,', strong: true },
        { text: ' and ' },
        { text: 'layouts', strong: true },
        { text: ' for business-critical communications.' },
      ],
      [
        { text: 'Collaborated with animation teams to develop ' },
        { text: 'storyboards', strong: true },
        { text: ' and ' },
        { text: 'motion design assets.', strong: true },
      ],
      [
        { text: 'Translated complex information into ' },
        { text: 'visually engaging', strong: true },
        { text: ' and ' },
        { text: 'easy-to-understand presentations.', strong: true },
      ],
      [
        { text: 'Maintained brand consistency while managing ' },
        { text: 'high-volume', strong: true },
        { text: ' creative requests.' },
      ],
      [
        { text: 'Delivered creative solutions for global clients including ' },
        { text: 'First Data, Cisco,', strong: true },
        { text: ' and ' },
        { text: 'McKinsey & Company.', strong: true },
      ],
    ],
  },
  {
    name: '2adpro',
    font: 'sora',
    logo: '/images/career/logo-2adpro.svg',
    title: 'Junior Designer',
    period: 'April 2016 - July 2017',
    bullets: [
      [
        { text: 'Created ' },
        { text: 'print', strong: true },
        { text: ' and ' },
        { text: 'digital advertisements', strong: true },
        { text: ' for leading publications across the ' },
        { text: 'ANZ market.', strong: true },
      ],
      [
        { text: 'Adapted creative assets across industries while adhering to ' },
        { text: 'strict brand guidelines.', strong: true },
      ],
      [{ text: 'Produced ' }, { text: 'high-volume advertising creatives', strong: true }, { text: ' with accuracy and attention to detail.' }],
      [
        { text: 'Collaborated with production teams', strong: true },
        { text: ' to ensure timely delivery of campaign assets.' },
      ],
      [
        { text: 'Developed strong foundations in ' },
        { text: 'layout design, typography,', strong: true },
        { text: ' and visual storytelling.' },
      ],
      [
        { text: 'Gained expertise in ' },
        { text: 'production workflows', strong: true },
        { text: ' and ' },
        { text: 'market-specific', strong: true },
        { text: ' creative execution.' },
      ],
    ],
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
  { name: 'Claude', icon: '/images/aiworkflow/image 21.png' },
  { name: 'Perplexity', icon: '/images/aiworkflow/image 22.png' },
  { name: 'Midjourney', icon: '/images/aiworkflow/image 24.png' },
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
  { text: 'Layouts,', variant: 'teal' },
  { text: 'I’m', variant: 'strong' },
  { text: 'Shriram.', variant: 'strong' },
];

export interface QuoteWord {
  text: string;
  /** Tailwind text colour utility for this word. */
  colorClass: string;
  /** Hand-drawn doodle sitting beside the word, swapping with it. */
  doodle: string;
  /**
   * The doodle's width, in `em` against the heading — so it scales with the
   * type. Per-word because the two drawings have different proportions and
   * would not read as the same size at a shared width.
   */
  doodleEm: number;
}

export const INTRO_QUOTE_WORDS: QuoteWord[] = [
  { text: 'see', colorClass: 'text-green', doodle: '/images/doodles/see.svg', doodleEm: 2.9 },
  { text: 'design', colorClass: 'text-orange', doodle: '/images/doodles/design.svg', doodleEm: 2.1 },
];

export interface IntroTile {
  label: string;
  icon: 'sparkle' | 'compass' | 'briefcase';
  body: string;
  bold: string;
  boldPosition: 'start' | 'end';
}

export const INTRO_TILES: IntroTile[] = [
  {
    label: 'Currently Exploring',
    icon: 'sparkle',
    bold: 'Motion systems',
    boldPosition: 'start',
    body: 'and speculative rebrands — how a mark behaves once it stops sitting still.',
  },
  {
    label: 'After Hours',
    icon: 'compass',
    body: 'Window seats, street signage, and the way a city writes itself down. So far across',
    bold: '14 countries',
    boldPosition: 'end',
  },
  {
    label: 'Open To',
    icon: 'briefcase',
    bold: 'Lead Visual design',
    boldPosition: 'start',
    body: 'roles where the system matters as much as the screen it ends up on.',
  },
];

export const INTRO_SLIDES = ['At the desk', 'On the road', 'Studio setup', 'Speaking', 'Sketchbook', 'Window seat'];
