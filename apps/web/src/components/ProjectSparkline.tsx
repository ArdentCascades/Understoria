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
import { useTranslation } from "react-i18next";
import type { DailyContribution } from "@/lib/projectMomentum";

// Inline SVG sparkline. No external charting library — same reasoning
// as the breadth bar: keeps the bundle small and works offline.
//
// Accessibility: the SVG gets an aria-label summary, but the curve
// itself is not navigable by screen readers. A visually-hidden
// <table> sibling carries the per-day breakdown for screen reader
// users who want the detail behind the curve.

interface ProjectSparklineProps {
  daily: readonly DailyContribution[];
  /** Width in pixels. Default 240 — fits the project detail card. */
  width?: number;
  /** Height in pixels. Default 48. */
  height?: number;
}

function formatDay(dayStart: number, locale: string): string {
  return new Date(dayStart).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
  });
}

export function ProjectSparkline({
  daily,
  width = 240,
  height = 48,
}: ProjectSparklineProps) {
  const { t, i18n } = useTranslation();
  if (daily.length === 0) return null;

  const max = Math.max(1, ...daily.map((d) => d.hours));
  const stepX = daily.length > 1 ? width / (daily.length - 1) : 0;

  const pointsArr = daily.map((d, i) => {
    const x = i * stepX;
    const y = height - (d.hours / max) * height;
    return { x, y, hours: d.hours };
  });
  const linePath = pointsArr
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L${pointsArr[pointsArr.length - 1].x.toFixed(2)},${height} L0,${height} Z`;
  const totalInWindow =
    Math.round(daily.reduce((s, d) => s + d.hours, 0) * 10) / 10;

  return (
    <div className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={t("projects.sparkline.label", {
          days: daily.length,
          hours: totalInWindow,
        })}
        className="block"
      >
        <path
          d={areaPath}
          fill="currentColor"
          className="text-canopy-200 dark:text-canopy-900"
          opacity={0.7}
        />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-canopy-600 dark:text-canopy-300"
        />
        {pointsArr.map((p, i) =>
          p.hours > 0 ? (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={1.8}
              className="fill-canopy-700 dark:fill-canopy-200"
            />
          ) : null,
        )}
      </svg>
      <p className="text-xs text-moss-500 dark:text-moss-300">
        {t("projects.sparkline.caption", {
          days: daily.length,
          hours: totalInWindow,
        })}
      </p>
      <table className="sr-only">
        <caption>
          {t("projects.sparkline.tableCaption", { days: daily.length })}
        </caption>
        <thead>
          <tr>
            <th scope="col">{t("projects.sparkline.tableHeaderDay")}</th>
            <th scope="col">{t("projects.sparkline.tableHeaderHours")}</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((d) => (
            <tr key={d.dayStart}>
              <th scope="row">{formatDay(d.dayStart, i18n.language)}</th>
              <td>{Math.round(d.hours * 10) / 10}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
