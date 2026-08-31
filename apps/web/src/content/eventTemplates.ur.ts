/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// Urdu event templates, translated from eventTemplates.en.ts
// following docs/i18n-glossary/ur.md. Loaded lazily via
// content/bundles/ur.ts.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_UR: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "سانجھا دستر خوان",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "سانجھا دستر خوان — ",
    "descriptionScaffold": "بانٹنے کو ایک ہانڈی لائیں اور بھوکے آئیں — سب ہاتھ بٹائیں تو ہمیشہ وافر ہوتا ہے۔ کھانے کے سوا کچھ لانا ہو تو لوگوں کو بتا دیں۔",
    "suggestedDurationMinutes": 120,
    "blurb": "سانجھا کھانا جس میں ہر کوئی ایک ہانڈی لاتا ہے۔"
  },
  {
    "id": "shared-meal",
    "name": "مل کر کھانا",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "مل کر کھانا — ",
    "descriptionScaffold": "پکا ہوا کھانا، مل بیٹھ کر۔ بتائیں کیا پکے گا اور پکانے یا سمیٹنے میں کوئی ہاتھ بٹا سکتا ہے یا نہیں۔",
    "suggestedDurationMinutes": 90,
    "blurb": "پکا ہوا کھانا، مل بیٹھ کر۔"
  },
  {
    "id": "game-night",
    "name": "کھیلوں کی شام",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "کھیلوں کی شام — ",
    "descriptionScaffold": "بورڈ کھیل، تاش، جو بھی آپ کے پاس ہے۔ نئے آنے والوں کو خوش آمدید — قاعدے کوئی نہ کوئی سکھا دے گا۔",
    "suggestedDurationMinutes": 150,
    "blurb": "بورڈ کھیل، تاش اور اچھی سنگت۔"
  },
  {
    "id": "movie-night",
    "name": "فلم کی شام",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "فلم کی شام — ",
    "descriptionScaffold": "مل کر دیکھنے کو کچھ چنیں۔ بتائیں کیا چل رہا ہے اور گدی یا بانٹنے کو کوئی چیز لانی ہے یا نہیں۔",
    "suggestedDurationMinutes": 150,
    "blurb": "مل کر کچھ دیکھیں۔"
  },
  {
    "id": "skill-share",
    "name": "ہنر کی بانٹ",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "ہنر کی بانٹ — ",
    "descriptionScaffold": "کوئی سکھاتا ہے، سب سیکھتے ہیں — ماہر ہونا ضروری نہیں۔ بتائیں کیا بانٹا جا رہا ہے اور کچھ لانا ہو تو کیا۔",
    "suggestedDurationMinutes": 90,
    "blurb": "کوئی سکھاتا ہے، سب سیکھتے ہیں۔"
  },
  {
    "id": "craft-circle",
    "name": "دستکاری کا حلقہ",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "دستکاری کا حلقہ — ",
    "descriptionScaffold": "جو بھی بنا رہے ہیں لے آئیں اور دوسروں کے پہلو میں کام کریں۔ نئے سیکھنے والے اور ادھورے کام دونوں یہیں کے ہیں۔",
    "suggestedDurationMinutes": 120,
    "blurb": "دوسروں کے پہلو میں چیزیں بنائیں۔"
  },
  {
    "id": "walk-hike",
    "name": "چہل قدمی / پیدل سیر",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "چہل قدمی — ",
    "descriptionScaffold": "ہلکی چال سے مل کر چہل قدمی۔ راستے کی لمبائی اور مشکل لکھ دیں تاکہ لوگ جان لیں کیا سامنے ہے، اور پانی اور اچھے جوتوں کی یاد دہانی کرا دیں۔",
    "suggestedDurationMinutes": 90,
    "blurb": "مل کر چہل قدمی، ہلکی چال سے۔"
  },
  {
    "id": "welcome-gathering",
    "name": "خوش آمدید محفل",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "خوش آمدید محفل — ",
    "descriptionScaffold": "نئے پڑوسیوں سے ملنے اور جانے پہچانے چہروں سے پھر جڑنے کا ہلکا پھلکا بہانہ۔ کوئی ایجنڈا نہیں — بس تعارف اور اچھی سنگت۔",
    "suggestedDurationMinutes": 90,
    "blurb": "نئے پڑوسیوں سے ملیں، کوئی ایجنڈا نہیں۔"
  },
  {
    "id": "music-jam",
    "name": "موسیقی کی سنگت",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "موسیقی کی سنگت — ",
    "descriptionScaffold": "کوئی ساز لائیں یا بس اپنی آواز۔ ہر سطح کو خوش آمدید — بات مل کر بجانے کی ہے، فن دکھانے کی نہیں۔",
    "suggestedDurationMinutes": 120,
    "blurb": "مل کر موسیقی بجائیں — ہر سطح۔"
  },
  {
    "id": "celebration",
    "name": "جشن",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "جشن — ",
    "descriptionScaffold": "کوئی بات مل کر منائیں۔ بتائیں کیا منایا جا رہا ہے اور بانٹنے کو کچھ لانا ہے یا نہیں۔",
    "suggestedDurationMinutes": 120,
    "blurb": "کوئی بات مل کر منائیں۔"
  },
  {
    "id": "work-day",
    "name": "مل کر کام کا دن",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "مل کر کام کا دن — ",
    "descriptionScaffold": "کوئی کام مل کر نمٹانے کا ہاتھوں والا وقت۔ کام اور لانے کی چیزیں لکھیں، اور یہ بھی کہ بہت ہاتھ اسے ہلکا کر دیتے ہیں۔",
    "suggestedDurationMinutes": 240,
    "blurb": "ہاتھوں والا وقت، مل کر۔"
  },
  {
    "id": "repair-cafe",
    "name": "مرمت خانہ",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "مرمت خانہ — ",
    "descriptionScaffold": "کوئی ٹوٹی چیز لائیں اور اوزار جاننے والے پڑوسیوں کی مدد سے ٹھیک کریں۔ بتائیں کن مرمتوں میں لوگ ہاتھ بٹا سکتے ہیں۔",
    "suggestedDurationMinutes": 180,
    "blurb": "ٹوٹی چیزیں ٹھیک کریں، مل کر۔"
  },
  {
    "id": "care-circle",
    "name": "خیال کا حلقہ",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "خیال کا حلقہ — ",
    "descriptionScaffold": "حال پوچھنے اور ایک دوسرے کو سہارا دینے کی نرم جگہ۔ جو یہاں بٹتا ہے یہیں رہتا ہے۔",
    "suggestedDurationMinutes": 90,
    "blurb": "حال پوچھیں اور ایک دوسرے کو سہارا دیں۔"
  },
  {
    "id": "meeting",
    "name": "ملاقات",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "ملاقات — ",
    "descriptionScaffold": "باتیں کھول کر مل کر فیصلہ کرنے کا وقت۔ ایجنڈا بانٹ دیں تاکہ لوگ تیار ہو کر آئیں۔",
    "suggestedDurationMinutes": 60,
    "blurb": "باتیں کھولیں، مل کر فیصلہ کریں۔"
  }
];
