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

// Urdu translation of study-prompts.ts. Same ids, same themes, same
// order — only the prose changes (guides.parity.test.ts enforces
// it). Register follows docs/i18n-glossary/ur.md. Names stay in
// their source forms (Dean Spade, McAlevey, Freeman, Mauss, Hyde,
// Haudenosaunee, Zapatistas, «mandar obedeciendo»).
import type { StudyPrompt } from "./study-prompts";

export const STUDY_PROMPTS_UR: readonly StudyPrompt[] = [
  {
    id: "platform-1",
    theme: "platform",
    body:
      "جب اس کام کا کوئی سافٹ ویئر نہیں تھا، تب ٹائم بینک اور " +
      "باہمی امداد کے جال کیا کرتے تھے؟ سافٹ ویئر آیا تو انہوں نے " +
      "کیا کھویا، اور کیا پایا؟ اس کھونے پانے کے سودے میں " +
      "Understoria کو کہاں کھڑا ہونا چاہیے؟",
  },
  {
    id: "platform-2",
    theme: "platform",
    body:
      "Understoria کا بنیادی اصول ہے: ایک گھنٹہ ایک گھنٹے کے " +
      "برابر۔ یہ اصول کس کام کو بچا رہا ہے؟ اس پر کیا اعتراض اٹھ " +
      "سکتے ہیں؟ کیا آپ کی برادری میں ایسے موقعے ہیں جہاں یہ راہ " +
      "میں آ جاتا ہے؟",
  },
  {
    id: "platform-3",
    theme: "platform",
    body:
      "کل ایپ ہٹا دی جائے تو ہمارے پاس پھر بھی کیا رہے گا؟ وہی " +
      "جواب اصل بنیاد ہے؛ ایپ تو بس پاڑ ہے۔",
  },
  {
    id: "mutual-aid-1",
    theme: "mutual_aid",
    body:
      "Dean Spade باہمی امداد اور خیرات کا فرق اس بات سے کرتے ہیں " +
      "کہ فیصلہ کس کے ہاتھ میں ہے۔ ابھی آپ کی برادری میں فیصلے کون " +
      "کرتا ہے؟ کون نہیں کرتا؟",
  },
  {
    id: "mutual-aid-2",
    theme: "mutual_aid",
    body:
      "باہمی امداد کے منصوبوں کو اکثر NGO نگل جاتی ہیں، یا وہ " +
      "خدمت بانٹنے کے پروگرام بن کر رہ جاتے ہیں۔ آپ کی برادری کو " +
      "اس کھنچاؤ سے کیا بچاتا ہے؟",
  },
  {
    id: "mutual-aid-3",
    theme: "mutual_aid",
    body:
      "آپ کی برادری میں کون ہے جو ضرورت کے باوجود مدد نہیں مانگ " +
      "رہا؟ کیوں؟",
  },
  {
    id: "organizing-1",
    theme: "organizing",
    body:
      "McAlevey جمع کرنے (پہلے سے ساتھ کھڑے لوگوں کو بلا لینا) اور " +
      "منظم کرنے (جو ابھی ساتھ نہیں انہیں جیت لینا) میں فرق کرتی " +
      "ہیں۔ آپ کا باہمی امداد کا جال جمع کرنے کا منصوبہ ہے، منظم " +
      "کرنے کا، یا دونوں؟",
  },
  {
    id: "organizing-2",
    theme: "organizing",
    body:
      "باہمی امداد کا کام اور مزدور یونین کا کام تاریخ بھر ایک " +
      "دوسرے کو سینچتے آئے ہیں۔ آپ کے ہاں یہ جوڑ کہاں ہیں؟ کیا " +
      "ممکن ہے جو ابھی آزمایا نہیں جا رہا؟",
  },
  {
    id: "power-1",
    theme: "power",
    body:
      "Freeman کہتی ہیں کہ خود کو بے ڈھانچہ کہہ لینے سے کوئی بے " +
      "ڈھانچہ نہیں ہو جاتا؛ بس ڈھانچہ غیر رسمی ہو جاتا ہے اور اسے " +
      "للکارنا مشکل۔ آپ کی برادری میں کون سے غیر رسمی ڈھانچے موجود " +
      "ہیں؟ کیا وہ کام دے رہے ہیں؟",
  },
  {
    id: "power-2",
    theme: "power",
    body:
      "اگر Understoria کے سافٹ ویئر کے فیصلے سانجھ کے بجائے کوئی " +
      "کارپوریشن کر رہی ہوتی تو اس کے خد و خال میں کیا فرق ہوتا؟ " +
      "تین باتیں لکھیں۔",
  },
  {
    id: "traditions-1",
    theme: "traditions",
    body:
      "Mauss اور Hyde تحفے کو ایک ذمے کا اٹھانے والا بتاتے ہیں — " +
      "لینے کا، اور آگے دینے کا — جسے بازار جان بوجھ کر مٹا دیتا " +
      "ہے۔ آپ کی برادری میں تحفے کی یہ ریت کہاں اب بھی سلامت ہے، " +
      "اور کہاں اس کی جگہ سودے بازی والی سوچ لے چکی ہے؟ کیا اس سے " +
      "فرق پڑتا ہے؟",
  },
  {
    id: "traditions-2",
    theme: "traditions",
    body:
      "Haudenosaunee کا اصول — فیصلوں کو کئی نسلوں کے پیمانے پر " +
      "تولنا — اس منصوبے کے لیے ڈھانچے ہی سے مشکل ہے جو ہفتہ وار " +
      "گنتیوں پر کسا گیا ہو۔ اپنی برادری کا کوئی حالیہ فیصلہ چنیں۔ " +
      "پانچ یا سات نسلوں کی نظر سے دوبارہ دیکھیں تو وہ کیسا لگے " +
      "گا؟",
  },
  {
    id: "traditions-3",
    theme: "traditions",
    body:
      "Zapatistas کا mandar obedeciendo — مان کر آگے چلنا — کوئی " +
      "استعارہ نہیں؛ یہ ڈھانچے کا عہد ہے، جس کے اثر اس بات پر پڑتے " +
      "ہیں کہ جوڑنے والے کردار کس کے پاس ہوں اور کتنی دیر رہیں۔ آپ " +
      "کی برادری میں غیر رسمی جوڑنے والا اختیار کس کے پاس ہے؟ اسے " +
      "mandar obedeciendo کے تلے باقاعدہ بنانے کی کیا قیمت پڑے گی؟",
  },
] as const;
