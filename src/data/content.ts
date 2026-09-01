export interface CategoryStat {
  value: string;
  label: string;
}

export interface ProcessRow {
  label: string;
  text: string;
  /** The image slot's label. Not needed by a `textOnly` row, which has no slot. */
  slot?: string;
  /** Caps the image slot's height (e.g. "380px") instead of the template default. */
  slotMaxHeight?: string;
  /**
   * Sets the image slot's height outright (e.g. "460px"), rather than only
   * capping it. Detail-dense screenshots need a taller slot than the 160px the
   * template gives an empty one, and `slotMaxHeight` alone cannot raise that.
   */
  slotHeight?: string;
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
  /**
   * Drops the image slot entirely, giving the row's full width to the text.
   *
   * A deck's process rows are argument, not artefact — the slides themselves
   * sit in one viewer below. An empty slot beside each row would reserve space
   * for something that is never coming.
   */
  textOnly?: boolean;
  /**
   * Renders the slot as a looping motion piece rather than a static image.
   * Plays muted with no controls, and falls back to the poster frame under
   * `prefers-reduced-motion`. Omit for a standard slot.
   */
  motion?: RowMotion;
  /**
   * Renders the slot as a row of 2–4 related pieces rather than one image —
   * a poster beside a brochure spread, say. Each is clickable, opening
   * full-size in an in-page lightbox. Omit for a standard single slot.
   */
  assetSet?: RowAsset[];
  /**
   * Renders the slot as a paginated viewer for a multi-page document. Unlike
   * the prototype variant there is no static mockup behind it — the viewer
   * fills the slot. Omit for a standard single slot.
   */
  document?: RowDocument;
}

export interface ProjectPrototype {
  /** Embed URL for the live prototype (never opened in a new tab). */
  embedUrl: string;
}

/** A multi-page document shown in a `document` slot. */
export interface RowDocument {
  /** Page images in reading order, cover first. */
  pages: string[];
  /** Named in the page indicator's label and the viewer's accessible name. */
  title: string;
}

/** A looping motion piece in a `motion` slot. */
export interface RowMotion {
  /** The looping clip — an MP4 or an animated GIF. */
  src: string;
  /**
   * The still shown before the clip plays, and in place of it entirely under
   * `prefers-reduced-motion`. Without one, a reduced-motion reader gets the
   * slot label and nothing else.
   */
  poster?: string;
  /** The clip'''s accessible name. */
  title: string;
}

/** One piece in an `assetSet` slot. */
export interface RowAsset {
  src: string;
  /** Optional caption beneath the asset. */
  caption?: string;
  /**
   * The asset's real aspect ratio (width ÷ height), which sets its share of the
   * row — a portrait poster ends up narrower than a landscape spread. Defaults
   * to 1 if unknown, but giving the true value is what keeps a mixed set from
   * looking arbitrarily scaled.
   */
  ratio?: number;
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
  /**
   * Labels for the two-column row. It is a problem/solution pair for a single
   * case study, but a collection of separate pieces has no one pair — those
   * relabel the same row rather than getting a different layout.
   */
  problemLabel?: string;
  solutionLabel?: string;
  /**
   * The brand-system row's palette and typeface. Optional together: a project
   * spanning several clients has no single palette, and one misleading chip row
   * is worse than none — omit both and the row renders nothing.
   */
  chips?: ColorChip[];
  typeface?: string;
  processRows: ProcessRow[];
  /**
   * The closing note. Optional: a deck argues its own ending, so the
   * presentation projects omit the row rather than repeating the last slide.
   */
  endNote?: string;
  /**
   * A single deck shown below the process rows, as one paginated viewer at
   * 16:9. This is the whole artefact for a presentation project, so it sits
   * once at the end rather than being split across the rows.
   */
  deck?: RowDocument;
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
  /**
   * The name in the tile's "Continue to …" link, where it differs from
   * `short`. UI/UX's link spells the category out in full while its tab strip
   * stays abbreviated.
   */
  linkLabel?: string;
  /**
   * What the tile shows in place of `body` while it is hovered — the work the
   * category actually contains, rather than the sentence describing it.
   */
  collection: string;
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

/*
 * Stand-in artwork while the Marketing Campaigns content is being built.
 *
 * The hero grid's tiles are the only real images in the project, so they are
 * borrowed to give the document viewers and asset sets something to lay out —
 * judging a five-viewer modal against empty frames is guesswork. Every one of
 * these is replaced when the actual documents and assets arrive; the two
 * helpers below are the single place that has to change.
 *
 * They are all 820 × 465 landscape, so `PLACEHOLDER_RATIO` is the real ratio
 * for an asset set until mixed portrait/landscape pieces replace them.
 */
const PLACEHOLDER_POOL = [
  'card01_portrait_man', 'card02_experience_nxt', 'card03_forge_logo', 'card04_pale_blue',
  'card05_orbit_shift_podcast', 'card06_phone_screens', 'card07_iprovision', 'card08_ufo_desert',
  'card09_recognizing_needs', 'card10_freshsprint_hackathon', 'card11_food_illustration',
  'card12_phones_travel', 'card13_six_reasons_freshworks', 'card14_city_illustration',
  'card15_project_agresar', 'card16_freshstart_logo', 'card17_lavender_blank', 'card18_icons_grid',
  'card19_mobily_dashboard', 'card20_man_thinking',
].map((name) => `/images/homegrid/${name}.png`);

export const PLACEHOLDER_RATIO = 820 / 465;

/**
 * `count` placeholder pages, offset so neighbouring rows do not open on the
 * same cover — which would read as one document repeated rather than several.
 */
function placeholderPages(count: number, offset = 0): string[] {
  return Array.from(
    { length: count },
    (_, i) => PLACEHOLDER_POOL[(offset + i) % PLACEHOLDER_POOL.length],
  );
}

/**
 * `count` placeholder assets for an `assetSet` slot, with optional captions.
 *
 * `ratios` overrides the landscape default per asset. The stand-in images are
 * all 820 × 465, so a set whose real pieces are portrait or square has to say
 * so here — otherwise the row lays out to the placeholder'''s shape and the real
 * proportions only appear once the artwork does.
 */
export function placeholderAssets(
  count: number,
  offset = 0,
  captions: string[] = [],
  ratios: number[] = [],
): RowAsset[] {
  return placeholderPages(count, offset).map((src, i) => ({
    src,
    caption: captions[i],
    ratio: ratios[i] ?? PLACEHOLDER_RATIO,
  }));
}

/**
 * One slot height across all five rows of the social campaign showcase, so the
 * document viewer, the single-asset sets and the prototype line up rather than
 * each finding its own height from its content.
 */
const SOCIAL_SLOT_HEIGHT = '480px';

/**
 * One slot height across the illustration showcase's four rows, so the asset
 * sets, the document viewer and the motion clip line up rather than each
 * finding its own height.
 */
const ILLO_SLOT_HEIGHT = '480px';

/** Stands in for the motion piece's poster frame until the real clip arrives. */
const PLACEHOLDER_POSTER = PLACEHOLDER_POOL[19];

/**
 * One slot height across the environmental showcase's three rows.
 *
 * These pieces are tall — a roll-up is roughly 1:3 — so the slot is sized by
 * how much height the modal can spare rather than by the artwork, and the
 * pieces letterbox within it. Filling the slot instead would mean cropping a
 * banner's top or bottom off, which is the one thing a roll-up cannot survive.
 */
const ENV_SLOT_HEIGHT = '520px';

/** Real proportions of the standing pieces, used while the artwork is stood in for. */
const ROLLUP_RATIO = 850 / 2000;
const BOOTH_RATIO = 1000 / 2200;
const STANDEE_RATIO = 600 / 1500;

export const CATEGORIES: Category[] = [
  {
    id: 'ui-ux',
    icon: '/images/menuicons/uiux.svg',
    title: 'UI/UX Design',
    short: 'UI/UX',
    linkLabel: 'UI/UX Design',
    tags: 'Enterprise · SaaS · Product',
    collection: 'Enterprise Dashboards · Websites · Design Systems · Product Experiences',
    body: 'Designing intuitive digital experiences that transform complex workflows into scalable products and seamless user journeys.',
    lead: 'Complex enterprise workflows turned into',
    leadBold: 'scalable products.',
    art: '/images/portfolio/UIUX.svg',
    artDark: '/images/portfolio/UIUX-dark.svg',
    stats: [
      { value: '20+', label: 'PRODUCTS' },
      { value: '6', label: 'YEARS' },
      { value: '5', label: 'INDUSTRIES' },
      { value: '10+', label: 'GLOBAL MARKETS' },
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
      {
        name: 'Prudent',
        software: ['Figma'],
        problem:
          "A self-directed redesign exercise. An enterprise lending platform had three distinct products and a page that didn't make clear what any of them did — everything competed for the same level of attention, so nothing held it.",
        solution:
          'A rebuilt hierarchy that explains the products in sequence, and photography of actual people in a category that usually shows none.',
        // TODO: replace with the real palette from Figma.
        chips: [
          { color: '#0B2A4A', border: 'rgba(255,255,255,0.15)' },
          { color: '#1C4E80', border: 'rgba(255,255,255,0.15)' },
          { color: '#4A90D9', border: 'rgba(255,255,255,0.15)' },
          { color: '#E8EEF4', border: 'rgba(255,255,255,0.15)' },
          { color: '#F2A33C', border: 'rgba(255,255,255,0.15)' },
        ],
        // TODO: replace with the real typeface from Figma.
        typeface: 'Inter',
        processRows: [
          {
            label: 'DIAGNOSIS',
            text: "The original page had the components but not the order. Products sat in a flat block with no way to tell them apart, proof and capability were interleaved, and a first-time visitor couldn't answer what the thing does before being asked to book a demo.",
            slot: 'BEFORE / AUDIT',
            slotAspectVideo: true,
          },
          {
            label: 'HIERARCHY',
            text: "I rebuilt it as a sequence: how it works, then what each product does, then who it's for. Three products became a tabbed section so each one gets a real explanation and a live interface screenshot instead of a shared paragraph. Buyer segmentation moved to its own section — wholesale, correspondent, retail — because a feature grid speaks to none of them.",
            slot: 'STRUCTURE / SECTION FLOW',
            slotAspectVideo: true,
          },
          {
            label: 'PRESENCE',
            text: "Enterprise fintech runs on abstraction — gradients, icons, empty dashboards. This uses cut-out photography of people sitting on and standing beside the product, at full scale. The interface screenshots carry the explanation, which frees the imagery to do the thing abstraction can't: make it look like software people actually use.",
            slot: 'MOCKUPS',
            stacked: true,
            prototype: { embedUrl: 'about:blank' },
          },
        ],
        endNote:
          'Nothing on the original page was wrong. It was all there, in the wrong order — and that turns out to be the harder problem to see.',
      },
      {
        name: 'PowerBI Dashboards',
        software: ['Figma', 'Power BI'],
        // A collection rather than a single case study, so the two-column row is
        // relabelled: there is no one problem/solution pair across four builds.
        problemLabel: 'CONTEXT',
        problem:
          'A set of Power BI dashboards built in-house across compliance, client management, commercial performance and multi-market reporting — four different audiences, four different questions.',
        solutionLabel: 'THROUGHLINE',
        solution:
          'Every one had the same underlying job: make a dense data screen answer its main question before anyone starts reading.',
        // `chips`/`typeface` omitted: four separate client palettes, so a single
        // chip row would be misleading. The brand-system row renders nothing.
        processRows: [
          {
            label: 'COMPLIANCE',
            text: 'Five exception counters and three charts kept fighting for the top of the screen. Nothing won until the filters moved out into their own panel — once narrowing a query stopped costing the overview, the counters could stay loud and the charts could stay quiet.',
            slot: 'VENDOR COMPLIANCE',
            slotHeight: '460px',
          },
          {
            label: 'ENGAGEMENT',
            text: 'Account teams open this between calls, so it had about four seconds to work. RAG status and pursuit numbers went up top and everything else went below. The illustration was the argument I had with myself — a screen this commercial reads cold without it.',
            slot: 'CLIENT 360',
            slotHeight: '460px',
          },
          {
            label: 'PERFORMANCE',
            text: "Four KPIs, all genuinely important, none more important than the others. Colour ended up doing the separating that hierarchy couldn't, and everything underneath was sequenced to explain those four in order rather than compete with them.",
            slot: 'REVENUE OVERVIEW',
            slotHeight: '460px',
          },
          {
            label: 'PORTFOLIO',
            text: 'Six markets, each with subsidiaries, each with its own numbers. Collapsing the subsidiaries by default was the only way the parent view stayed readable. On mobile it broke entirely, so the country list became the navigation instead of a sidebar.',
            slot: 'MULTI-MARKET — DESKTOP / MOBILE',
            slotHeight: '460px',
          },
        ],
        endNote:
          "Every one of these had to survive contact with the tool. Power BI decides a lot for you — the design work is in what's left.",
      },
      {
        name: 'GlobeIA',
        software: ['Figma'],
        problem:
          "People arriving here don't know which check they need — the answer depends on which country is asking, not what they want. And the client wanted the booking form locked on screen at all times, since it's the only conversion that matters.",
        solution:
          'A page that answers "which service is mine" before it asks for anything, with the booking panel permanently in view so the answer and the action are never more than a glance apart.',
        // TODO: replace with the real palette from Figma.
        chips: [
          { color: '#0E3B2E', border: 'rgba(255,255,255,0.15)' },
          { color: '#1F7A5C', border: 'rgba(255,255,255,0.15)' },
          { color: '#4FB08A', border: 'rgba(255,255,255,0.15)' },
          { color: '#EEF4F1', border: 'rgba(255,255,255,0.15)' },
          { color: '#E8B04B', border: 'rgba(255,255,255,0.15)' },
        ],
        // TODO: replace with the real typeface from Figma.
        typeface: 'Inter',
        processRows: [
          {
            label: 'ORIENTATION',
            text: "The old page led with what the company does. This one leads with what the visitor needs to figure out. Services became an accordion — RCMP, FBI, apostille, fingerprinting — each stating plainly who it's for and what it's required for, so people self-select instead of reading four dense paragraphs to find their one.",
            slot: 'SERVICE SELECTION',
            slotAspectVideo: true,
          },
          {
            // The prototype sits here rather than on the final row: the locked
            // nav and booking panel are what it demonstrates, so the reader can
            // try the scroll behaviour straight after reading about it.
            label: 'CONSTRAINT',
            text: "The locked booking panel was the client's requirement, and it takes roughly a third of the viewport permanently. Everything else had to work in a narrower column — shorter measure, tighter cards, no full-width sections. The nav locks with it, so the page scrolls underneath a frame that never moves.",
            slot: 'MOCKUPS',
            stacked: true,
            prototype: { embedUrl: 'about:blank' },
          },
          {
            label: 'REASSURANCE',
            text: 'This is a category where people are anxious about getting it wrong. So: a with-and-without comparison making the alternative concrete, country-specific guides for the two audiences actually moving to Spain, trust numbers, and an FAQ that answers the question the accordion already started.',
            slot: 'TRUST + FAQ',
            slotAspectVideo: true,
          },
        ],
        endNote:
          "The locked form was the client's call, not mine. Designing around it turned out to be the more interesting problem.",
      },
      ...['Client onboarding flow'].map(
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
    collection: 'Brand exploration on · Freshstart · Forge · HealthDesk · Project Agresor',
    body: 'Building memorable brands through thoughtful identities and scalable visual systems.',
    lead: 'Identities and visual systems built to',
    leadBold: 'hold together at scale.',
    stats: [
      { value: '10+', label: 'IDENTITIES' },
      { value: '4', label: 'REBRANDS' },
      { value: '10+', label: 'MARKETS' },
      { value: '100+', label: 'GLOBAL COLLABORATIONS' },
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
    collection: 'Product Launches · Event Branding · Social Campaigns · Landing Pages',
    body: 'Campaigns that combine storytelling, strategy, events, illustrations and measurable business impact.',
    lead: 'Storytelling and strategy measured on',
    leadBold: 'business impact.',
    stats: [
      { value: '50+', label: 'CAMPAIGNS' },
      { value: '12', label: 'EVENTS' },
      { value: '10+', label: 'MARKETS' },
      { value: '50+', label: 'MARKETING ASSETS' },
    ],
    projects: [
      /*
        Showcases rather than single case studies, following the same pattern as
        the Business intelligence dashboards project: the two-column row is
        relabelled per project, and `chips`/`typeface` are omitted because these
        span several clients and palettes.

        Content is pending for all four — copy, row labels, asset sets and
        metrics arrive per project. The structure below is what each will fill.
      */
      {
        name: 'Brochures and reports',
        software: ['InDesign', 'Illustrator', 'PowerPoint'],
        problemLabel: 'RANGE',
        problem:
          'Five documents between four and forty-seven pages — a logistics brochure, a beauty industry guide, two consulting pieces and an annual sustainability report.',
        solutionLabel: 'CONSTANT',
        solution:
          'Every one had the same job: decide what the reader sees first, then protect that decision for the rest of the document.',
        // `chips`/`typeface` omitted: five clients, five palettes.
        processRows: [
          {
            label: 'COMPRESSION',
            text: "Four pages to explain an enterprise logistics platform. Everything that didn't survive the cut became a number — shipments per day, carrier network, freight spend — so page two carries all the proof and the other three can stay quiet.",
            slot: '4-PAGE LOGISTICS BROCHURE',
            slotHeight: '480px',
            // TODO: supply the real page images.
            document: { title: '4-page logistics brochure', pages: placeholderPages(4, 0) },
          },
          {
            label: 'EDITORIAL',
            text: 'A thirty-page guide that had to read like a magazine rather than a sales document. Statistics moved into their own sidebar column so the body copy could stay conversational, and every spread was built to work if opened at random.',
            slot: 'BEAUTY INDUSTRY GROWTH GUIDE',
            slotHeight: '480px',
            document: { title: 'Beauty industry growth guide', pages: placeholderPages(30, 4) },
          },
          {
            label: 'DENSITY',
            text: 'Long lists of technical use cases with no natural hierarchy. Splitting them into labelled bands — predictive, LLM, anomaly, clustering — gave the reader four places to stop instead of one continuous run of bullets.',
            slot: 'FINANCIAL SERVICES AI FLYER',
            slotHeight: '480px',
            document: { title: 'Financial services AI flyer', pages: placeholderPages(6, 9) },
          },
          {
            label: 'SCALE',
            text: 'Forty-seven pages across five industrial sectors. At that length consistency does the work: one grid, one chart language, one photographic treatment, repeated until the whole thing reads in a single voice.',
            slot: 'ANNUAL SUSTAINABILITY REPORT',
            slotHeight: '480px',
            document: { title: 'Annual sustainability report', pages: placeholderPages(47, 12) },
          },
          {
            label: 'MODULARITY',
            text: 'Every service offering shared the same three-part shape — issue, solution, benefit. Designing that block once and repeating it meant a reader who understood the first page could navigate the rest without relearning anything.',
            slot: 'RISK ADVISORY SERVICE BROCHURE',
            slotHeight: '480px',
            document: { title: 'Risk advisory service brochure', pages: placeholderPages(8, 16) },
          },
        ],
        endNote:
          "Four pages or forty-seven, the problem doesn't change. Only how long you have to keep solving it.",
      },
      {
        name: 'Social campaign systems',
        software: ['Illustrator', 'Figma', 'Photoshop'],
        problemLabel: 'FORMATS',
        problem:
          'Six vertical banners, two carousels, an interactive display ad and an event campaign — five canvases, five jobs, five audiences.',
        solutionLabel: 'SYSTEM',
        solution:
          'Each one built as a template first and a design second, so it could be extended without me in the room.',
        // `chips`/`typeface` omitted: these span several brands and palettes.
        processRows: [
          {
            label: 'VERTICALS',
            text: 'Six industries, one layout. The template fixes everything structural — logo position, headline pattern, bullet list, phone frame — and lets colour and illustration carry the whole difference. Healthcare pink, e-commerce green, food delivery amber. Someone could add a seventh vertical without asking me anything.',
            slot: 'VERTICAL BANNER SET',
            slotHeight: SOCIAL_SLOT_HEIGHT,
            // TODO: supply the real banner artwork.
            document: { title: 'Vertical banner set', pages: placeholderPages(6, 0) },
          },
          {
            label: 'LIST',
            text: 'A carousel gets read by thumb, one card at a time, so each card had to work alone and in order. Large numeral for position, one line of copy, one line-art icon. The cover does the selling; the six cards only have to keep the swipe going.',
            slot: 'LIST CAROUSEL',
            slotHeight: SOCIAL_SLOT_HEIGHT,
            assetSet: placeholderAssets(1, 6),
          },
          {
            /*
              Deliberately adjacent to LIST: same format, opposite structure.
              One is a list where any card could move; this is a sequence where
              none can.
            */
            label: 'NARRATIVE',
            text: "A five-card carousel that only works in order: agents are overwhelmed, here's the mechanism, here's the speed, here's the result, here's the ask. The isometric illustration runs continuously across all five cards so the swipe feels like panning across one scene rather than turning pages, and only the final card carries a button — everything before it is earning the right to ask.",
            slot: 'NARRATIVE CAROUSEL',
            slotHeight: SOCIAL_SLOT_HEIGHT,
            /*
              The real artwork is roughly 5:1 — all five cards end to end. It is
              fitted to the slot width and letterboxed vertically rather than
              cropped to the slot's shape, so the sequence stays readable as one
              continuous scene; the lightbox is where the card copy becomes
              legible. `AssetSet` contains rather than crops, which is exactly
              that behaviour, so a single-asset set is the right slot here.
            */
            assetSet: placeholderAssets(1, 7),
          },
          {
            label: 'INTERACTION',
            text: 'A display advert for a sportswear collaboration where the ad was the interaction rather than a static frame. Built as a working prototype so the behaviour could be tested before anyone wrote code for it.',
            slot: 'DISPLAY AD',
            slotMaxHeight: SOCIAL_SLOT_HEIGHT,
            // TODO: supply the real display-ad prototype URL.
            prototype: { embedUrl: 'about:blank' },
          },
          {
            label: 'PLACE',
            text: "An event campaign set at a stadium in Barcelona. The headline plays on the club's own motto, and the illustration puts the venue inside its real skyline rather than a generic sports frame — this only lands if it feels local to the people who are actually going.",
            slot: 'EVENT CAMPAIGN',
            slotHeight: SOCIAL_SLOT_HEIGHT,
            assetSet: placeholderAssets(1, 8),
          },
        ],
        endNote:
          'The design is the easy half. The system is what’s left when someone else has to make the seventh one.',
      },
      {
        name: 'Illustration and iconography',
        software: ['Illustrator', 'After Effects', 'Photoshop'],
        problemLabel: 'RANGE',
        problem:
          'A cafeteria wall nearly twelve feet wide, a seven-part illustration series, a motion piece, and three icon sets.',
        solutionLabel: 'PRINCIPLE',
        solution:
          'Scale and context decide the drawing. What works on a wall fails at 24 pixels, and the reverse.',
        // `chips`/`typeface` omitted: several distinct styles rather than one palette.
        processRows: [
          {
            label: 'SCALE',
            text: "Twelve feet wide, read from across the room and from a foot away. Density solves both — the lettering holds the centre at distance, and the doodle field only pays off when you're standing next to it with a plate in your hand. Nothing precious about it, because it's a cafeteria.",
            slot: 'CAFETERIA MURAL',
            slotHeight: ILLO_SLOT_HEIGHT,
            /*
              Mural proportions, roughly 3:2 landscape. `AssetSet` contains
              rather than crops, so the wall keeps its shape inside the slot
              instead of being trimmed to it, and the lightbox is where the
              doodle detail becomes legible.
            */
            // TODO: supply the real mural artwork.
            assetSet: placeholderAssets(1, 9, ['Cafeteria mural']),
          },
          {
            label: 'SERIES',
            text: 'Seven illustrations, one per category, each carrying different meaning while staying recognisably siblings. Fixed line weight, one accent colour, one figure proportion. That constraint is the whole reason the seventh took twenty minutes instead of a day.',
            slot: 'ILLUSTRATION SERIES',
            slotHeight: ILLO_SLOT_HEIGHT,
            // TODO: supply the real series artwork.
            document: { title: 'Illustration series', pages: placeholderPages(7, 10) },
          },
          {
            label: 'MOTION',
            text: 'Drawn for movement rather than for a still. Every element separated onto its own layer from the outset, which changes how you draw — no shared outlines, no overlapping strokes, every object discrete enough to move independently.',
            slot: 'MOTION STUDY',
            slotHeight: ILLO_SLOT_HEIGHT,
            // TODO: supply the real clip; `poster` stands in until it arrives,
            // and is also what a reduced-motion reader sees.
            motion: { src: '', poster: PLACEHOLDER_POSTER, title: 'Motion study' },
          },
          {
            label: 'SYSTEM',
            text: 'At icon scale every decision is subtraction: what can be removed and still read. Consistent stroke, consistent corner radius, consistent optical weight — without those, a set of icons is just a set of drawings.',
            slot: 'ICON SETS',
            slotHeight: ILLO_SLOT_HEIGHT,
            // Stacked for the same reason as the event set: three pieces in the
            // two-column row share ~455px and cap out well short of the slot.
            stacked: true,
            // TODO: supply the real icon sheets.
            assetSet: placeholderAssets(3, 17, ['Product icons', 'Editorial icons', 'Interface icons']),
          },
        ],
        endNote:
          'A wall and a 24-pixel icon share exactly one requirement: both have to read instantly. Everything else about how you draw them is different.',
      },
      {
        name: 'Environmental graphics',
        software: ['Illustrator', 'Photoshop'],
        problemLabel: 'SETTING',
        problem:
          'Three pieces built to stand in rooms — a conference roll-up, an exhibition booth panel, and a three-part set for an internal hackathon.',
        solutionLabel: 'RULE',
        solution:
          'Nobody stops to read. Each one had to work in the two seconds someone spends walking past it.',
        // `chips`/`typeface` omitted: three separate events and palettes.
        processRows: [
          {
            label: 'DISTANCE',
            text: 'A roll-up gets read from across a hall, so it’s built as three bands top to bottom: the promise, the proof, the action. The map isn’t decoration — it says “everywhere” faster than a sentence can, and it still works at ten feet where the client logos have already stopped being legible.',
            slot: 'ROLL-UP BANNER',
            slotHeight: ENV_SLOT_HEIGHT,
            // TODO: supply the real roll-up artwork.
            assetSet: placeholderAssets(1, 0, ['Roll-up banner'], [ROLLUP_RATIO]),
          },
          {
            label: 'VOLUME',
            text: 'Exhibition floors are loud, and everyone on them runs the same playbook: bright, white, big claims. Going dark was the whole decision. A deep green field with one glowing figure holds its own in that room, and the stats orbit it rather than compete — the figure catches the eye, the numbers arrive second.',
            slot: 'BOOTH PANEL',
            slotHeight: ENV_SLOT_HEIGHT,
            // TODO: supply the real booth panel artwork.
            assetSet: placeholderAssets(1, 1, ['Booth panel'], [BOOTH_RATIO]),
          },
          {
            label: 'ARRIVAL',
            text: 'One event, three objects, three jobs. A standee by the lift that answers where and when. A welcome board at the door with an arrow, because an arrow beats a floor plan nobody asked for. And a photo frame — people post the event whether you design for it or not, so you may as well decide what’s in the shot.',
            slot: 'EVENT SET',
            slotHeight: ENV_SLOT_HEIGHT,
            /*
              Stacked so the three pieces get the modal's full width. Side by
              side in the standard two-column row they share about 455px, which
              caps them near 170px tall however tall the slot is — the width is
              the binding constraint, not the height, and a 520px slot would sit
              two-thirds empty.
            */
            stacked: true,
            /*
              Mixed shapes: the standee is portrait and the other two are
              square, so the ratios are given explicitly. `AssetSet` sizes each
              piece by its ratio, which is what keeps the standee narrower than
              the boards rather than all three sharing the row equally.
            */
            // TODO: supply the real event artwork.
            assetSet: placeholderAssets(
              3,
              2,
              ['Standee', 'Welcome board', 'Photo frame'],
              [STANDEE_RATIO, 1, 1],
            ),
          },
        ],
        endNote:
          'Something you hold already has your attention. Something standing in a room has to earn it, and gets about two seconds to try.',
      },
    ],
  },
  {
    id: 'presentations',
    icon: '/images/menuicons/presentation.svg',
    title: 'Presentations',
    short: 'Presentations',
    tags: 'Pitch · Product · Strategy',
    collection: 'Pitch Decks · Product Launches · Sales Enablement · Corporate Profiles',
    body: 'Decks built to be presented, not read — where the argument is the design.',
    lead: 'Decks built to be presented, not read —',
    leadBold: 'the argument is the design.',
    stats: [
      { value: '30+', label: 'DECKS' },
      { value: '5', label: 'FORMATS' },
      { value: '68', label: 'LONGEST DECK' },
      { value: '500+', label: 'SLIDES DESIGNED' },
    ],
    /*
      A reduced variant of the project template, configured per project rather
      than by changing the template: process rows carry text only, the whole
      deck sits in one 16:9 viewer below them, and the brand-system, metrics
      and end-note rows are all omitted.

      `chips`/`typeface` are omitted throughout — each deck carries its
      client's palette rather than one of its own.
    */
    projects: [
      {
        name: 'A self-presentation deck',
        software: ['Figma'],
        problem:
          'A deck about myself, built for a company I wanted to work at. The hardest brief there is — no client to hide behind, and the design gets judged as hard as anything I put inside it.',
        solution:
          "Structured as an argument rather than a portfolio: who I am, what I've shipped, what I'd do there. Built in Figma so the deck itself was a design artefact, not a PowerPoint.",
        processRows: [
          {
            label: 'AUDIENCE',
            text: 'One room, read once, with people deciding about me while I’m talking over the top of it. That rules out density — every slide had to survive eight seconds of being looked at while I said something different.',
            textOnly: true,
          },
          {
            label: 'EVIDENCE',
            text: 'Talk is cheap in a deck about yourself, so the middle section is nothing but work and numbers. Dark cover, light body, dark close — the tonal shift does the sectioning, so I never spent a slide on a divider when I only had ten.',
            textOnly: true,
          },
          {
            label: 'CLOSE',
            text: "The last slide returns to the cover's dark treatment and introduces nothing new. It exists purely to signal that the presenting is over and the conversation starts — which is the moment the whole deck was built to reach.",
            textOnly: true,
          },
        ],
        // TODO: supply the real slides.
        deck: { title: 'A self-presentation deck', pages: placeholderPages(10, 0) },
      },
      {
        name: 'A product pitch deck',
        software: ['PowerPoint', 'Illustrator'],
        problem:
          'Six slides to sell an AI payroll and HR platform to enterprise buyers running payroll across multiple countries — people who sit through pitches for a living and have heard every version of “one platform” before.',
        solution:
          "One claim per slide, ordered the way a sceptic asks for it: what's broken, what this is, how it flows, who already runs on it.",
        processRows: [
          {
            label: 'CLAIM',
            text: 'It opens by naming the problem and the fix in the same breath — payroll is broken, we fixed it — before a single feature appears. A pitch that leads with capability is asking the room to work out why it should care, and enterprise buyers won’t do that work for you.',
            textOnly: true,
          },
          {
            label: 'FLOW',
            text: 'The middle is one continuous journey from hire to paycheck rather than a feature grid. A single path is easier to hold in your head than eight boxes, and it lets a buyer see exactly where their own broken step would sit.',
            textOnly: true,
          },
          {
            label: 'PROOF',
            text: "Credibility lands last and lands as numbers — companies onboarded, countries covered, monthly users — set large enough that they're the only thing on the slide. The line underneath is the actual closer: built by people who've done payroll the hard way.",
            textOnly: true,
          },
        ],
        // TODO: supply the real slides.
        deck: { title: 'A product pitch deck', pages: placeholderPages(6, 3) },
      },
      {
        name: 'A presentation system',
        software: ['PowerPoint', 'Illustrator'],
        problem:
          'A consulting team producing a constant stream of client decks — kickoffs, scoping documents, executive committee updates — built mostly by consultants, not designers. Without a system every deck restarts every decision, and none of them match.',
        solution:
          'A master template where the decisions are already made. Layouts, dividers, scope matrices and chart language, all locked, so a consultant fills a deck in rather than designing one.',
        processRows: [
          {
            label: 'MASTERS',
            text: 'Cover, divider, content, scope matrix, closing. Five layouts covering almost everything a programme kickoff needs. Position, weight and spacing are locked so a slide someone filled at 11pm still sits correctly next to one I built.',
            textOnly: true,
          },
          {
            label: 'DIVIDERS',
            text: 'Dividers ship with visible placeholder copy — a title and a two-line description, with the line limit stated. An unlabelled empty slide gets skipped; a labelled one with a stated constraint gets filled correctly. The placeholder is the instruction.',
            textOnly: true,
          },
          {
            label: 'HANDOVER',
            text: 'The scope matrix was the real test: fourteen domains against their requirements, on one slide, legible in a boardroom. Get that layout right once and the hardest slide in the deck becomes the easiest one to reuse.',
            textOnly: true,
          },
        ],
        // TODO: supply the real slides — the blank template and the
        // placeholder-filled examples.
        deck: { title: 'A presentation system', pages: placeholderPages(9, 6) },
      },
      {
        name: 'An interactive deck',
        software: ['PowerPoint', 'Illustrator'],
        problem:
          'A thirty-three slide people update spanning four HR functions — shared services, talent acquisition, talent management and organisational development — presented to leaders who each mainly care about one of them. Linear slide order serves nobody in that room.',
        solution:
          'A persistent tab bar on every slide, so the deck gets navigated by function rather than sat through in sequence.',
        processRows: [
          {
            label: 'NAVIGATION',
            text: 'Four function tabs hold the same position across all thirty-three slides, with the active one highlighted. It turns a deck into something closer to a product — when someone asks about hiring mid-presentation, the presenter clicks instead of scrubbing backwards through twenty slides.',
            textOnly: true,
          },
          {
            label: 'DATA',
            text: 'Recruitment splits by designation, service line and location. Salary benchmarks against competitors. Ticket volumes and SLA trends. Headcount, org structures, six-month timelines. One chart language across all of it — same palette logic, same label treatment, same weight — so thirty slides of unrelated numbers still read as one document instead of thirty exports.',
            textOnly: true,
          },
          {
            label: 'RHYTHM',
            text: "Numbered full-bleed dividers between the four sections, then a consistent grid within them. In a deck this dense the dividers aren't decoration — they're the only moment the room gets to breathe before the next wall of data.",
            textOnly: true,
          },
        ],
        // TODO: supply the real slides. Figures, names and chart values shown
        // are placeholder.
        deck: { title: 'An interactive deck', pages: placeholderPages(33, 9) },
      },
      {
        name: 'A long-form report',
        software: ['PowerPoint', 'Illustrator'],
        problem:
          'A sixty-eight slide maturity assessment across eleven domains, each with its own findings, rating and recommendations — and roughly 230 scored questions underneath it. Past about slide forty a reader stops knowing where they are.',
        solution:
          'A structural spine: five numbered sections, a persistent position indicator, one repeating findings layout, one rating scale used identically throughout.',
        processRows: [
          {
            label: 'ARCHITECTURE',
            text: "Executive summary, methodology, summarised findings, detailed findings, recommendations. Five sections, a contents page that maps them, and a numbered indicator on every slide showing which one you're in. At this length orientation stops being a nicety and becomes the main design job.",
            textOnly: true,
          },
          {
            label: 'REPETITION',
            text: 'Eleven domains, one layout — gap, recommendation, rating — used identically every single time. By the third domain the reader has stopped reading the format and is only reading the content, which is the entire reason not to vary it. Forty-odd slides of findings, zero new formats to learn.',
            textOnly: true,
          },
          {
            label: 'CALIBRATION',
            text: 'A five-level maturity scale had to be comparable at a glance across every domain, so it’s drawn once and reused unchanged — same positions, same colour steps, no clever variation per section. If the scale shifts even slightly between domains, the comparison it exists to enable quietly stops working.',
            textOnly: true,
          },
        ],
        // TODO: supply the real slides. Findings, ratings and client detail
        // shown are placeholder.
        deck: { title: 'A long-form report', pages: placeholderPages(68, 12) },
      },
    ],
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
  /** Path to the tile's icon, drawn as an image. */
  icon: string;
  body: string;
  bold: string;
  boldPosition: 'start' | 'end';
}

export const INTRO_TILES: IntroTile[] = [
  {
    label: 'After Hours',
    icon: '/images/about/afterhours.svg',
    body: 'Window seats, street signage, and the way a city writes itself down. So far across',
    bold: '14 countries',
    boldPosition: 'end',
  },
  {
    label: 'Currently Exploring',
    icon: '/images/about/currentlyexploring.svg',
    bold: 'Motion systems',
    boldPosition: 'start',
    body: 'and speculative rebrands — how a mark behaves once it stops sitting still.',
  },
  {
    label: 'Open To',
    icon: '/images/about/opento.svg',
    bold: 'Lead Visual design',
    boldPosition: 'start',
    body: 'roles where the system matters as much as the screen it ends up on.',
  },
];

export const INTRO_SLIDES = ['At the desk', 'On the road', 'Studio setup', 'Speaking', 'Sketchbook', 'Window seat'];
