/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Icon, type IconProps } from "./Icon";

// Line-art icon set. Drawn in-house; all currentColor, 1.5px stroke,
// no fills, 24x24 viewBox. The two "Understoria-native" concepts
// (Board, Dashboard) carry botanical motifs; Messages and Profile
// use familiar shapes so the nav stays legible to a first-time user.

// Three leaves on a curved stem — a small cluster of offerings.
export function IconBoard(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21V8" />
      <path d="M12 12c-1.5-2.5-4-3-6-2 .5 2.5 2.5 4 5 4" />
      <path d="M12 9c1.5-2.5 4-3 6-2-.5 2.5-2.5 4-5 4" />
      <path d="M12 15c-1.5-1.8-3.8-2.2-5.5-1.3.5 2 2.4 3.3 4.5 3.3" />
    </Icon>
  );
}

// A single sprout inside an open circle — the community view.
export function IconDashboard(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 12c0-1.5 1-3 3-3.5-.2 1.8-1.4 3.2-3 3.5z" />
      <path d="M12 14c-1-1-2.5-1.2-3.5-1 .2 1.5 1.4 2.5 2.7 2.5" />
    </Icon>
  );
}

// Rounded speech bubble — universal messaging shape.
export function IconMessages(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 11c0-3.3 3.6-6 8-6s8 2.7 8 6-3.6 6-8 6c-.9 0-1.8-.1-2.6-.3L5 19l1.4-3.2C5 14.7 4 13 4 11z" />
    </Icon>
  );
}

// Simple bust silhouette — universal profile shape.
export function IconProfile(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </Icon>
  );
}

// Gear — entry point for the device-settings sub-page. Drawn with
// six teeth around a center hub; matches the 1.5px stroke / fill-none
// style of the rest of the icon set.
export function IconSettings(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M4.93 4.93l2.12 2.12" />
      <path d="M16.95 16.95l2.12 2.12" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="M4.93 19.07l2.12-2.12" />
      <path d="M16.95 7.05l2.12-2.12" />
    </Icon>
  );
}
