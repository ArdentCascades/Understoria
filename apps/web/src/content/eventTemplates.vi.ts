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
// Vietnamese event templates (i18n Phase 2). Loaded lazily via
// content/bundles/vi.ts — never import this statically from app
// code.
import type { EventTemplate } from "./eventTemplates";

export const EVENT_TEMPLATES_VI: readonly EventTemplate[] = [
  {
    "id": "potluck",
    "name": "Bữa ăn góp món",
    "category": "social",
    "emoji": "🍲",
    "titleScaffold": "Bữa ăn góp món — ",
    "descriptionScaffold": "Mang một món tới góp và nhớ để bụng đói — hễ ai cũng góp một tay thì bao giờ cũng dư dả. Cho mọi người biết ngoài đồ ăn còn cần mang gì nữa không.",
    "suggestedDurationMinutes": 120,
    "blurb": "Một bữa ăn chung, ai cũng mang tới một món."
  },
  {
    "id": "shared-meal",
    "name": "Bữa ăn chung",
    "category": "social",
    "emoji": "🍝",
    "titleScaffold": "Bữa ăn chung — ",
    "descriptionScaffold": "Một bữa nấu chín, cùng nhau ngồi ăn. Nói rõ hôm ấy có món gì và mọi người có thể góp một tay nấu nướng hay dọn dẹp không.",
    "suggestedDurationMinutes": 90,
    "blurb": "Một bữa nấu chín, cùng nhau ngồi ăn."
  },
  {
    "id": "game-night",
    "name": "Tối chơi trò chơi",
    "category": "social",
    "emoji": "🎲",
    "titleScaffold": "Tối chơi trò chơi — ",
    "descriptionScaffold": "Cờ, bài, trò chơi trên bàn — nhà có gì mang nấy. Người mới đến rất được chào đón — sẽ có người chỉ luật cho bạn.",
    "suggestedDurationMinutes": 150,
    "blurb": "Cờ, bài, và bầu bạn vui vẻ."
  },
  {
    "id": "movie-night",
    "name": "Tối xem phim",
    "category": "social",
    "emoji": "🎬",
    "titleScaffold": "Tối xem phim — ",
    "descriptionScaffold": "Chọn một phim để cùng xem. Nói rõ chiếu phim gì và có nên mang theo cái gối ngồi hay ít đồ ăn vặt chuyền tay nhau không.",
    "suggestedDurationMinutes": 150,
    "blurb": "Cùng nhau xem một bộ phim."
  },
  {
    "id": "skill-share",
    "name": "Chia sẻ sở trường",
    "category": "learning",
    "emoji": "🎓",
    "titleScaffold": "Chia sẻ sở trường — ",
    "descriptionScaffold": "Một người chỉ, ai cũng học thêm được — không cần ai là chuyên gia. Nói rõ hôm ấy chia sẻ điều gì và cần mang theo gì, nếu có.",
    "suggestedDurationMinutes": 90,
    "blurb": "Một người chỉ, ai cũng học thêm được."
  },
  {
    "id": "craft-circle",
    "name": "Buổi làm đồ thủ công",
    "category": "learning",
    "emoji": "🧶",
    "titleScaffold": "Buổi làm đồ thủ công — ",
    "descriptionScaffold": "Mang theo thứ bạn đang làm dở và ngồi làm bên cạnh mọi người. Người mới bắt đầu và những món còn dang dở đều có chỗ ở đây.",
    "suggestedDurationMinutes": 120,
    "blurb": "Cùng ngồi làm đồ bên cạnh nhau."
  },
  {
    "id": "walk-hike",
    "name": "Đi bộ / leo núi",
    "category": "social",
    "emoji": "🥾",
    "titleScaffold": "Đi bộ — ",
    "descriptionScaffold": "Cùng nhau đi bộ, bước chân thong thả. Ghi rõ quãng đường dài bao nhiêu và dễ hay khó để mọi người biết trước, và nhắc nhau mang nước với đôi giày tốt.",
    "suggestedDurationMinutes": 90,
    "blurb": "Cùng nhau đi bộ, bước chân thong thả."
  },
  {
    "id": "welcome-gathering",
    "name": "Gặp mặt chào đón",
    "category": "social",
    "emoji": "👋",
    "titleScaffold": "Gặp mặt chào đón — ",
    "descriptionScaffold": "Một dịp thong thả để làm quen hàng xóm mới và gặp lại những gương mặt thân quen. Không chương trình gì cả — chỉ là giới thiệu nhau và bầu bạn vui vẻ.",
    "suggestedDurationMinutes": 90,
    "blurb": "Làm quen hàng xóm mới, không cần chương trình."
  },
  {
    "id": "music-jam",
    "name": "Đàn hát cùng nhau",
    "category": "social",
    "emoji": "🎵",
    "titleScaffold": "Đàn hát cùng nhau — ",
    "descriptionScaffold": "Mang theo một nhạc cụ, hoặc chỉ giọng hát của bạn thôi cũng được. Chơi tới đâu cũng được chào đón — ở đây là cùng nhau chơi nhạc, không phải biểu diễn.",
    "suggestedDurationMinutes": 120,
    "blurb": "Cùng nhau chơi nhạc — chơi tới đâu cũng được."
  },
  {
    "id": "celebration",
    "name": "Ăn mừng",
    "category": "celebration",
    "emoji": "🎉",
    "titleScaffold": "Ăn mừng — ",
    "descriptionScaffold": "Cùng nhau mừng một dịp. Nói rõ mừng chuyện gì và có nên mang gì tới góp chung không.",
    "suggestedDurationMinutes": 120,
    "blurb": "Cùng nhau mừng một dịp."
  },
  {
    "id": "work-day",
    "name": "Ngày chung tay",
    "category": "skilled_labor",
    "emoji": "🌱",
    "titleScaffold": "Ngày chung tay — ",
    "descriptionScaffold": "Một buổi cùng xắn tay vào làm cho xong một việc. Tả rõ việc gì và cần mang theo gì, và nhắc rằng đông tay thì việc nhẹ đi nhiều.",
    "suggestedDurationMinutes": 240,
    "blurb": "Một buổi cùng xắn tay vào làm."
  },
  {
    "id": "repair-cafe",
    "name": "Quán sửa đồ",
    "category": "skilled_labor",
    "emoji": "🔧",
    "titleScaffold": "Quán sửa đồ — ",
    "descriptionScaffold": "Mang tới món đồ đang hỏng và sửa nó cùng những người hàng xóm quen tay với đồ nghề. Nói rõ ở đây giúp sửa được những thứ gì.",
    "suggestedDurationMinutes": 180,
    "blurb": "Cùng nhau sửa lại những món đồ hỏng."
  },
  {
    "id": "care-circle",
    "name": "Vòng tròn sẻ chia",
    "category": "emotional_support",
    "emoji": "🫂",
    "titleScaffold": "Vòng tròn sẻ chia — ",
    "descriptionScaffold": "Một chỗ nhẹ nhàng để hỏi thăm nhau và làm chỗ dựa cho nhau. Điều gì nói ra ở đây thì ở lại đây.",
    "suggestedDurationMinutes": 90,
    "blurb": "Hỏi thăm nhau và làm chỗ dựa cho nhau."
  },
  {
    "id": "meeting",
    "name": "Buổi họp",
    "category": "organizing",
    "emoji": "📋",
    "titleScaffold": "Buổi họp — ",
    "descriptionScaffold": "Dịp để bàn cho rõ mọi chuyện và cùng nhau quyết định. Nói trước những việc sẽ bàn để ai tới cũng đã chuẩn bị sẵn.",
    "suggestedDurationMinutes": 60,
    "blurb": "Bàn cho rõ, rồi cùng nhau quyết định."
  }
];
