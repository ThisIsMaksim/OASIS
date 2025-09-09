import {AvatarCreatorConfig} from "@readyplayerme/react-avatar-creator";

/**
 * Ready Player Me embed configuration.
 * Values supplied by user:
 *  - Subdomain: oasis-ao4rh4.readyplayer.me
 *  - App ID:    68b374cd047d1f98cfe9f3b5
 *
 * Usage:
 *  import { RPM_URL } from "./rpm";
 *  <iframe src={RPM_URL} ... />
 */
export const RPM_SUBDOMAIN = "oasis-ao4rh4";
export const RPM_APP_ID = "68b374cd047d1f98cfe9f3b5";

export const RPM_CONFIG: AvatarCreatorConfig = {
  clearCache: true,
  bodyType: 'fullbody',
  quickStart: false,
  language: 'en',
  // Оптимизация для мобильных устройств - используем только доступные настройки
};