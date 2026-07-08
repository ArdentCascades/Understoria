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

// Calendar — a soft-cornered grid with two binder rings at the top and
// a single highlighted day. Matches the 1.5px stroke / fill-none style
// of the rest of the icon set; the highlighted day reads as a sprout
// rather than a hard dot so the icon stays consistent with the
// botanical motifs on IconBoard / IconDashboard.
export function IconCalendar(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <circle cx="12" cy="14.5" r="1.5" />
    </Icon>
  );
}

// iOS Share glyph — a box open at the top with an up-arrow rising
// through it. This is the icon the iPhone Share button shows, so the
// install guide places it next to "tap the Share button" to make the
// instruction unmistakable. Matches the 1.5px stroke / fill-none style
// of the rest of the icon set.
export function IconShare(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 15V4" />
      <path d="M8.5 7.5 12 4l3.5 3.5" />
      <path d="M7 11H6a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-1" />
    </Icon>
  );
}

// Browser install icon — a monitor with a downward arrow, the shape
// Chromium draws at the right end of the address bar. Shown next to
// the desktop install hint so members know what they're looking for
// (pilot report: "worth showing them what the icon looks like").
// Same 1.5px stroke / fill-none style as the rest of the set.
export function IconInstall(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 4h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M12 7v6" />
      <path d="M9.5 10.5 12 13l2.5-2.5" />
      <path d="M9 20h6" />
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
