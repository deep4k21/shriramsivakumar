import type { ComponentType } from 'react';
import { CameraIcon, ChatIcon, DribbbleIcon, FileIcon, LinkedInIcon, MailIcon } from './Icons';

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * One small icon per `CONNECT_LINKS` entry, keyed by its `label` — shared
 * between the Connect modal and the small-screen notice so both channel
 * lists carry the same icon for the same link rather than drifting apart.
 */
export const CONNECT_ICONS: Record<string, ComponentType<IconProps>> = {
  Email: MailIcon,
  LinkedIn: LinkedInIcon,
  WhatsApp: ChatIcon,
  Instagram: CameraIcon,
  Dribbble: DribbbleIcon,
  Resume: FileIcon,
};
