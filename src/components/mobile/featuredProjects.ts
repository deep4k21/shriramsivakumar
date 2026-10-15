import { CATEGORIES, type Category, type Project } from '../../data/content';

/**
 * The four projects the mobile site leads with, by `name`.
 *
 * Mobile shows a selection rather than the whole catalogue: the desktop site
 * reaches every project through a category stage and a tab strip, which is a
 * lot of navigation for a phone. These four cover the range — a brand
 * identity, a product design, the site itself, and a campaign — so the
 * selection reads as a portfolio rather than a sample of one kind of work.
 *
 * Matched by name against the real data rather than copied: the case-study
 * content stays in `content.ts` as the single source, so an edit there
 * reaches both layouts.
 */
const FEATURED_NAMES = ['Freshstart', 'Chamaco', 'This website', 'Social campaign systems'] as const;

export interface FeaturedProject {
  project: Project;
  /** The category it belongs to — supplies the header eyebrow where the project has none. */
  category: Category;
}

/**
 * The featured four, in the order `FEATURED_NAMES` lists them.
 *
 * Built by walking the categories rather than indexing into them, so moving a
 * project between categories or reordering one does not silently change which
 * projects appear here — only renaming one would, and that would show up as a
 * missing card rather than the wrong project.
 */
export const FEATURED_PROJECTS: FeaturedProject[] = FEATURED_NAMES.flatMap((name) => {
  for (const category of CATEGORIES) {
    const project = category.projects.find((p) => p.name === name);
    if (project) return [{ project, category }];
  }
  // A name that no longer matches is dropped rather than rendered as a blank
  // card. Nothing enforces this list against the data at build time, so this
  // is the one place a typo or a rename would surface.
  return [];
});
