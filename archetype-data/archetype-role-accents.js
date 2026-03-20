/**
 * Precomposed secondary / tertiary behavioral relevance paragraphs for archetype reports.
 * Merged male + female taxonomies (keys match archetype `id` and BRUTAL-TRUTH entries).
 */

import { ARCHETYPE_ROLE_ACCENTS_MALE } from './archetype-role-accents-male.js';
import { ARCHETYPE_ROLE_ACCENTS_FEMALE } from './archetype-role-accents-female.js';

const ARCHETYPE_ROLE_ACCENTS = {
  ...ARCHETYPE_ROLE_ACCENTS_MALE,
  ...ARCHETYPE_ROLE_ACCENTS_FEMALE,
};

export default ARCHETYPE_ROLE_ACCENTS;
