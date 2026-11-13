import '../../styles/freshstart.css';
import { SpreadFrame } from './SpreadFrame';
import { Spread01Cover } from './spreads/Spread01Cover';
import { Spread03BrandStory } from './spreads/Spread03BrandStory';
import { Spread04Process } from './spreads/Spread04Process';
import { Spread05LogoSystem } from './spreads/Spread05LogoSystem';
import { Spread06Construction } from './spreads/Spread06Construction';
import { Spread07ClearSpace } from './spreads/Spread07ClearSpace';
import { Spread08Backgrounds } from './spreads/Spread08Backgrounds';
import { Spread09Misuse } from './spreads/Spread09Misuse';
import { Spread10Colour } from './spreads/Spread10Colour';
import { Spread11Gradient } from './spreads/Spread11Gradient';
import { Spread12Accessibility } from './spreads/Spread12Accessibility';
import { Spread13Typography } from './spreads/Spread13Typography';
import { Spread14Iconography } from './spreads/Spread14Iconography';
import { Spread15LaunchLines } from './spreads/Spread15LaunchLines';
import { Spread16Photography } from './spreads/Spread16Photography';

/**
 * The brand book, from spread 03 on.
 *
 * The first two spreads are rendered by the modal above this, in the order
 * the reference sets: the cover takes the banner's place at the top of the
 * case study, and spread 02 is the Problem/Solution pair the modal already
 * builds from `project.problem` and `project.solution`. Drawing either here
 * would put them below the brief rather than above it.
 */
const SECTIONS = [
  { label: '03 · Brand story', summary: 'The platform the identity is built on.', Spread: Spread03BrandStory },
  { label: '04 · Process', summary: 'How two ideas resolved into one shape.', Spread: Spread04Process },
  { label: '05 · Logo system', summary: 'Four lockups, each shown on light and dark.', Spread: Spread05LogoSystem },
  { label: '06 · Construction', summary: 'The geometry behind the drop and its launch trails.', Spread: Spread06Construction },
  { label: '07 · Clear space', summary: 'How much room the mark needs, and how small it goes.', Spread: Spread07ClearSpace },
  { label: '08 · Backgrounds', summary: 'Which lockup belongs on which ground.', Spread: Spread08Backgrounds },
  { label: '09 · Misuse', summary: 'Eight things the files are not for.', Spread: Spread09Misuse },
  { label: '10 · Colour', summary: 'Five values, with print conversions.', Spread: Spread10Colour },
  { label: '11 · Gradient rules', summary: 'Two stops, one direction.', Spread: Spread11Gradient },
  { label: '12 · Accessible pairs', summary: 'Every pairing, with its measured contrast.', Spread: Spread12Accessibility },
  { label: '13 · Typography', summary: 'One family, five steps.', Spread: Spread13Typography },
  { label: '14 · Iconography', summary: 'Twelve icons on a shared 24px grid.', Spread: Spread14Iconography },
  { label: '15 · Launch lines', summary: 'The pattern, and where it belongs.', Spread: Spread15LaunchLines },
  { label: '16 · Photography', summary: 'What to shoot, and what to avoid.', Spread: Spread16Photography },
];

/**
 * Freshstart's brand book, rendered inside the site's case-study modal.
 *
 * Unlike every other case study, this one is not a series of process rows:
 * it is a set of fixed-format artboards drawn in Freshstart's own system.
 * The frame around them stays the site's — header, tabs and footer are the
 * shared modal's, and only the spreads carry `.fs-brand`.
 */
export function FreshstartCaseStudy() {
  return (
    <div className="flex flex-col gap-9">
      {SECTIONS.map(({ label, summary, Spread: S }) => (
        <section key={label} className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
            <h2 className="m-0 font-heading text-xs font-semibold tracking-[0.14em] text-teal">
              {label}
            </h2>
            <p className="m-0 font-body text-sm text-grey">{summary}</p>
          </div>
          <SpreadFrame>
            <S />
          </SpreadFrame>
        </section>
      ))}
    </div>
  );
}

/**
 * The cover spread, with its section label — rendered by the case-study
 * modal where a project's banner would otherwise sit.
 *
 * Kept here rather than inlined in `ProjectPage` so the stylesheet import
 * and the `SpreadFrame` wrapper stay with the rest of the book.
 */
export function FreshstartCover() {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
        <h2 className="m-0 font-heading text-xs font-semibold tracking-[0.14em] text-teal">
          01 · Cover
        </h2>
        <p className="m-0 font-body text-sm text-grey">The book, on both grounds.</p>
      </div>
      <SpreadFrame>
        <Spread01Cover banner />
      </SpreadFrame>
    </section>
  );
}
