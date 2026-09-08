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
// Bengali translation (i18n demand-driven wave). Loaded lazily
// via content/bundles/bn.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_BN: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "পাঁচমিশালি ভোজ",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "পাঁচমিশালি ভোজ — ",
    "descriptionScaffold": "ভাগ করে খাওয়ার মতো একটা পদ নিয়ে আসুন, আর আসুন খিদে নিয়ে — সবাই কিছু না কিছু আনলে পাতে টান পড়ে না কখনো। খাবার ছাড়া আর কিছু আনার থাকলে আগেই জানিয়ে রাখুন।",
    "suggestedDurationMinutes": 120,
    "blurb": "সবাই মিলে খাওয়া — যে যার একটা পদ নিয়ে আসেন।"
  },
  {
    "id": "shared-meal",
    "name": "মিলে বসে খাওয়া",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "মিলে বসে খাওয়া — ",
    "descriptionScaffold": "রান্না করা খাবার, সবাই মিলে বসে খাওয়া। মেনুতে কী থাকছে জানিয়ে দিন, আর রান্না বা গোছগাছে কেউ হাত লাগাতে পারবেন কি না, সেটাও।",
    "suggestedDurationMinutes": 90,
    "blurb": "রান্না করা খাবার, মিলে বসে খাওয়া।"
  },
  {
    "id": "game-night",
    "name": "খেলার সন্ধ্যা",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "খেলার সন্ধ্যা — ",
    "descriptionScaffold": "বোর্ড গেম, তাস — যার যা আছে। নতুনরাও চলে আসুন — নিয়মকানুন কেউ না কেউ শিখিয়ে দেবেন।",
    "suggestedDurationMinutes": 150,
    "blurb": "বোর্ড গেম, তাস, আর ভালো সঙ্গ।"
  },
  {
    "id": "movie-night",
    "name": "সিনেমার সন্ধ্যা",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "সিনেমার সন্ধ্যা — ",
    "descriptionScaffold": "সবাই মিলে দেখার মতো কিছু বেছে নিন। কী দেখানো হবে জানিয়ে দিন, আর বসার কুশন বা ঘুরিয়ে খাওয়ার মতো টুকটাক কিছু আনতে হবে কি না, সেটাও।",
    "suggestedDurationMinutes": 150,
    "blurb": "একসাথে বসে কিছু দেখা।"
  },
  {
    "id": "skill-share",
    "name": "দক্ষতা ভাগাভাগি",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "দক্ষতা ভাগাভাগি — ",
    "descriptionScaffold": "একজন শেখান, শেখেন সবাই — বিশেষজ্ঞ লাগে না। কী শেখানো হচ্ছে জানিয়ে দিন, আর কিছু আনার থাকলে সেটাও।",
    "suggestedDurationMinutes": 90,
    "blurb": "একজন শেখান, শেখেন সবাই।"
  },
  {
    "id": "craft-circle",
    "name": "হাতের কাজের আসর",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "হাতের কাজের আসর — ",
    "descriptionScaffold": "যা বানাচ্ছেন, সেটাই সাথে নিয়ে আসুন আর অন্যদের পাশে বসে কাজ করুন। সবে শুরু করা মানুষ আর আধখানা হয়ে থাকা কাজ — দুয়েরই জায়গা এখানে।",
    "suggestedDurationMinutes": 120,
    "blurb": "অন্যদের পাশে বসে জিনিস বানানো।"
  },
  {
    "id": "walk-hike",
    "name": "হাঁটা / লম্বা হাঁটা",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "হাঁটা — ",
    "descriptionScaffold": "সবাই মিলে হাঁটা, ধীরেসুস্থে। পথটা কতটা লম্বা আর কতটা কঠিন, লিখে দিন — সবাই যেন আগে থেকে আঁচ পান; আর মনে করিয়ে দিন, পায়ে ভালো জুতা আর সাথে তেষ্টা মেটানোর কিছু থাকা চাই।",
    "suggestedDurationMinutes": 90,
    "blurb": "একসাথে হাঁটা, ধীরেসুস্থে।"
  },
  {
    "id": "welcome-gathering",
    "name": "পরিচয়ের আড্ডা",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "পরিচয়ের আড্ডা — ",
    "descriptionScaffold": "নতুন প্রতিবেশীদের সাথে পরিচয়ের আর চেনা মুখদের সাথে আবার দেখা হওয়ার সহজ উপায়। বাঁধাধরা কিছু নেই — শুধু আলাপ-পরিচয় আর ভালো সঙ্গ।",
    "suggestedDurationMinutes": 90,
    "blurb": "নতুন প্রতিবেশীদের সাথে পরিচয় — বাঁধাধরা কিছু নেই।"
  },
  {
    "id": "music-jam",
    "name": "গানবাজনার আসর",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "গানবাজনার আসর — ",
    "descriptionScaffold": "একটা বাদ্যযন্ত্র আনুন, বা শুধু নিজের গলাটুকু। নতুন-পুরোনো সবাই চলে আসুন — এখানে কথা সবাই মিলে বাজানোর, কাউকে দেখানোর নয়।",
    "suggestedDurationMinutes": 120,
    "blurb": "সবাই মিলে গানবাজনা — নতুন-পুরোনো সবাই।"
  },
  {
    "id": "celebration",
    "name": "উদযাপন",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "উদযাপন — ",
    "descriptionScaffold": "সবাই মিলে কিছু উদযাপন করি। কীসের উদযাপন জানিয়ে দিন, আর ভাগ করার মতো কিছু আনতে হবে কি না, সেটাও।",
    "suggestedDurationMinutes": 120,
    "blurb": "সবাই মিলে কিছু উদযাপন করা।"
  },
  {
    "id": "work-day",
    "name": "শ্রমদান",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "শ্রমদান — ",
    "descriptionScaffold": "সবাই মিলে হাতে-হাতে কিছু একটা করে ফেলার সময়। কাজটা কী আর কী আনতে হবে, লিখে দিন — আর মনে করিয়ে দিন: দশে মিলে করি কাজ, হারি জিতি নাহি লাজ।",
    "suggestedDurationMinutes": 240,
    "blurb": "হাতে-হাতে কাজ, সবাই মিলে।"
  },
  {
    "id": "repair-cafe",
    "name": "মেরামতের আসর",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "মেরামতের আসর — ",
    "descriptionScaffold": "ভাঙা-নষ্ট কিছু নিয়ে আসুন, আর যন্ত্রপাতিতে হাত পাকা প্রতিবেশীদের সাহায্য নিয়ে সারিয়ে ফেলুন। কোন কোন ধরনের মেরামতে সাহায্য মিলবে, জানিয়ে দিন।",
    "suggestedDurationMinutes": 180,
    "blurb": "ভাঙা জিনিস, একসাথে সারানো।"
  },
  {
    "id": "care-circle",
    "name": "খোঁজখবরের আসর",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "খোঁজখবরের আসর — ",
    "descriptionScaffold": "একে অপরের খোঁজ নেওয়ার আর পাশে থাকার একটা নরম জায়গা। এখানে যা বলা হয়, এখানেই থাকে।",
    "suggestedDurationMinutes": 90,
    "blurb": "একে অপরের খোঁজ নেওয়া, পাশে থাকা।"
  },
  {
    "id": "meeting",
    "name": "বৈঠক",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "বৈঠক — ",
    "descriptionScaffold": "খোলাখুলি কথা বলার আর সবাই মিলে ঠিক করার সময়। কী কী নিয়ে কথা হবে, আগেই জানিয়ে দিন — সবাই যেন তৈরি হয়ে আসতে পারেন।",
    "suggestedDurationMinutes": 60,
    "blurb": "খোলাখুলি কথা, সবাই মিলে সিদ্ধান্ত।"
  }
];
