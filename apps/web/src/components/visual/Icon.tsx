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
import type { SVGProps } from "react";

// Base wrapper for the project's inline-SVG icon set. Every icon
// renders as currentColor, single-weight stroke, no fills — keeps
// the line-art look consistent across the app. Decorative by
// default; pass `title` to make it labelled.

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number;
  title?: string;
}

export function Icon({
  size = 24,
  title,
  strokeWidth = 1.5,
  className,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  const a11y = title
    ? { role: "img", "aria-label": title }
    : { "aria-hidden": true, focusable: false };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...a11y}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
