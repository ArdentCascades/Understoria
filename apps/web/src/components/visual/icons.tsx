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

// Three lines — the universal menu glyph. Deliberately NOT botanical:
// the me-menu button has to read as "menu" to a first-time user with
// zero context, the same reasoning as Messages/Profile above.
export function IconMenu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Icon>
  );
}

// Magnifier — universal search shape (the me-menu's palette entry).
export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="M15.5 15.5L20 20" />
    </Icon>
  );
}

// Circled question mark — help.
export function IconHelp(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.2a2.4 2.4 0 1 1 3.3 2.2c-.7.3-1.2.9-1.2 1.7v.4" />
      <path d="M11.7 16.6h.01" />
    </Icon>
  );
}

// Bust with a plus — invite someone in.
export function IconInvite(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10" cy="9" r="3.5" />
      <path d="M3.5 20c0-3.3 2.8-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <path d="M18.5 6.5v5" />
      <path d="M16 9h5" />
    </Icon>
  );
}

// Two joined roots under a canopy line — shared infrastructure.
export function IconInfrastructure(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8h16" />
      <path d="M8 8v4c0 2-1.5 3-3 3.5" />
      <path d="M16 8v4c0 2 1.5 3 3 3.5" />
      <path d="M12 8v9" />
      <path d="M12 17c-1 1.5-2.5 2-4 2" />
      <path d="M12 17c1 1.5 2.5 2 4 2" />
    </Icon>
  );
}

// A clipboard with a check and a line of writing — the member's own
// work inventory (tasks carried + projects organized). A familiar
// "work" shape rather than a botanical one so the tab stays legible
// to a first-time user, like Messages and Profile.
export function IconMyWork(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="4.5" width="14" height="16" rx="2.5" />
      <rect x="9" y="2.5" width="6" height="3.5" rx="1.25" />
      <path d="M8.5 12l2.2 2.2 4.8-5" />
      <path d="M8.5 16.5h7" />
    </Icon>
  );
}

// Two arcs cycling around each other — hours given and received
// flowing in a circle. The FAQ's balance section marker.
export function IconBalance(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9.5a6.5 6.5 0 0 1 11.2-2.6" />
      <path d="M17.5 3.5v3.5H14" />
      <path d="M18 14.5a6.5 6.5 0 0 1-11.2 2.6" />
      <path d="M6.5 20.5V17H10" />
    </Icon>
  );
}
