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

// Arabic translation of study-prompts.ts. Same ids, same themes, same
// order — only the prose changes (guides.parity.test.ts enforces it).
// Proper names keep their established Arabic forms where one exists
// (مارسيل موس، الزاباتيون) and stay Latin otherwise.
import type { StudyPrompt } from "./study-prompts";

export const STUDY_PROMPTS_AR: readonly StudyPrompt[] = [
  {
    id: "platform-1",
    theme: "platform",
    body:
      "ماذا كانت تفعل بنوك الوقت وشبكات التعاضد قبل أن يوجد برنامج " +
      "لها؟ ماذا خسرت حين جاء البرنامج، وماذا كسبت؟ وأين ينبغي أن " +
      "تقف Understoria في تلك المقايضة؟",
  },
  {
    id: "platform-2",
    theme: "platform",
    body:
      "مبدأ التصميم في Understoria هو أن الساعة تساوي الساعة. أي عمل " +
      "يحميه هذا المبدأ؟ وأي انتقادات يستدعيها؟ وهل في مجتمعك حالات " +
      "يقف فيها المبدأ عائقاً؟",
  },
  {
    id: "platform-3",
    theme: "platform",
    body:
      "لو أزلنا التطبيق غداً، ماذا يبقى لنا؟ ذلك الجواب هو الأساس " +
      "الحقيقي؛ والتطبيق سقالة.",
  },
  {
    id: "mutual-aid-1",
    theme: "mutual_aid",
    body:
      "يميّز Dean Spade التعاضد عن الإحسان بسؤال واحد: من يملك " +
      "القرار؟ من يتخذ القرارات في مجتمعك الآن؟ ومن لا يتخذها؟",
  },
  {
    id: "mutual-aid-2",
    theme: "mutual_aid",
    body:
      "كثيراً ما تبتلع المنظمات غير الحكومية مشاريع التعاضد أو " +
      "تحوّلها برامج لتقديم الخدمات. ما الذي يحمي مجتمعك من ذلك " +
      "الجذب؟",
  },
  {
    id: "mutual-aid-3",
    theme: "mutual_aid",
    body: "من في مجتمعك لا يطلب المساعدة مع أنه يحتاجها؟ ولماذا؟",
  },
  {
    id: "organizing-1",
    theme: "organizing",
    body:
      "تفرّق McAlevey بين الحشد — دفع المؤيدين الموجودين إلى الحضور " +
      "— وبين الكسب الصبور للناس، أي ضم من ليسوا مؤيدين بعد إلى " +
      "الصف. فهل شبكة التعاضد عندكم مشروع حشد، أم مشروع كسب، أم " +
      "الاثنان معاً؟",
  },
  {
    id: "organizing-2",
    theme: "organizing",
    body:
      "عمل التعاضد والعمل النقابي غذّى كل منهما الآخر عبر التاريخ. " +
      "أين نقاط الوصل في سياقكم؟ وما الممكن الذي لم يجرّبه أحد بعد؟",
  },
  {
    id: "power-1",
    theme: "power",
    body:
      "ترى Freeman أن ادعاء غياب البنية لا يجعلكم بلا بنية؛ بل يجعل " +
      "البنية غير معلنة وأصعب على المساءلة. ما البنى غير المعلنة في " +
      "مجتمعك؟ وهل تؤدي عملها؟",
  },
  {
    id: "power-2",
    theme: "power",
    body:
      "لو كانت قرارات برمجيات Understoria بيد شركة لا بيد تعاونية، " +
      "ما الذي كان سيختلف في ميزاتها؟ اكتب ثلاثة أشياء.",
  },
  {
    id: "traditions-1",
    theme: "traditions",
    body:
      "يقدّم مارسيل موس (Mauss) وHyde الهدية حاملة التزاماً — أن " +
      "تقبل، وأن تعطي بدورك — وهو بالضبط ما يمحوه منطق السوق. أين في " +
      "مجتمعك ما يزال منطق الهدية حياً، وأين حلّ محله إطار المعاملة " +
      "التجارية؟ وهل لذلك أهمية؟",
  },
  {
    id: "traditions-2",
    theme: "traditions",
    body:
      "مبدأ شعوب Haudenosaunee في تقييم القرارات عبر أجيال متعددة " +
      "عصيّ بنيوياً على مشروع مضبوط على مقاييس أسبوعية. اختر قراراً " +
      "حديثاً اتخذه مجتمعك. كيف يبدو لو أُعيد النظر فيه بأفق خمسة " +
      "أجيال أو سبعة؟",
  },
  {
    id: "traditions-3",
    theme: "traditions",
    body:
      "مبدأ الزاباتيين mandar obedeciendo — أن تقود وأنت تطيع — ليس " +
      "استعارة؛ بل هو التزام بنيوي له تبعات في من يحمل أدوار التنسيق " +
      "وإلى متى. من في مجتمعك يحمل سلطة تنسيق غير معلنة؟ وما ثمن " +
      "جعلها معلنة تحت mandar obedeciendo؟",
  },
] as const;
