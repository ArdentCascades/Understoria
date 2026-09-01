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

// Vietnamese study prompts (i18n Phase 2). Loaded lazily via
// content/bundles/vi.ts — never import this statically from app
// code. Prompt ids and themes mirror study-prompts.ts;
// guides.parity.test.ts enforces the structure.

import type { StudyPrompt } from "./study-prompts";

export const STUDY_PROMPTS_VI: readonly StudyPrompt[] = [
  {
    id: "platform-1",
    theme: "platform",
    body:
      "Trước khi có phần mềm, các ngân hàng thời gian và mạng lưới " +
      "tương trợ đã xoay xở thế nào? Khi phần mềm xuất hiện, họ mất " +
      "gì và được gì? Understoria nên đứng ở đâu trong sự đánh đổi " +
      "ấy?",
  },
  {
    id: "platform-2",
    theme: "platform",
    body:
      "Nguyên tắc thiết kế của Understoria là một-giờ-bằng-một-giờ. " +
      "Nguyên tắc ấy đang che chở cho công việc nào? Nó mời gọi " +
      "những lời phê bình nào? Trong cộng đồng bạn có trường hợp nào " +
      "mà nó lại thành vướng víu không?",
  },
  {
    id: "platform-3",
    theme: "platform",
    body:
      "Nếu ngày mai gỡ bỏ ứng dụng, chúng ta còn lại gì? Câu trả lời " +
      "đó mới là nền móng thật; ứng dụng chỉ là giàn giáo.",
  },
  {
    id: "mutual-aid-1",
    theme: "mutual_aid",
    body:
      "Dean Spade phân biệt tương trợ với từ thiện ở chỗ ai được " +
      "quyền quyết định. Ngay lúc này, ai đang quyết trong cộng đồng " +
      "bạn? Ai thì không?",
  },
  {
    id: "mutual-aid-2",
    theme: "mutual_aid",
    body:
      "Các dự án tương trợ thường bị các tổ chức phi chính phủ nuốt " +
      "dần, hoặc bị biến thành chương trình cung cấp dịch vụ. Điều " +
      "gì che chở cộng đồng bạn khỏi lực kéo đó?",
  },
  {
    id: "mutual-aid-3",
    theme: "mutual_aid",
    body:
      "Trong cộng đồng bạn, ai đang cần giúp mà vẫn chưa mở lời? Vì " +
      "sao?",
  },
  {
    id: "organizing-1",
    theme: "organizing",
    body:
      "McAlevey phân biệt huy động (kêu gọi những người vốn đã ủng " +
      "hộ đến góp mặt) với tổ chức (thuyết phục cả những người chưa " +
      "ủng hộ). Mạng lưới tương trợ của bạn là một dự án huy động, " +
      "một dự án tổ chức, hay cả hai?",
  },
  {
    id: "organizing-2",
    theme: "organizing",
    body:
      "Công việc tương trợ và công việc công đoàn xưa nay vẫn nuôi " +
      "lẫn nhau. Trong hoàn cảnh của bạn, những mối nối ấy nằm ở " +
      "đâu? Điều gì là có thể mà chưa ai thử?",
  },
  {
    id: "power-1",
    theme: "power",
    body:
      "Freeman lập luận rằng vờ như không có cơ cấu không làm ta hết " +
      "cơ cấu; nó chỉ khiến cơ cấu thành ngầm và khó chất vấn hơn. " +
      "Trong cộng đồng bạn đang tồn tại những cơ cấu ngầm nào? Chúng " +
      "có đang vận hành ổn không?",
  },
  {
    id: "power-2",
    theme: "power",
    body:
      "Nếu các quyết định phần mềm của Understoria do một công ty " +
      "đưa ra thay vì một hợp tác xã, các tính năng của nó sẽ khác " +
      "đi thế nào? Hãy viết ra ba điều.",
  },
  {
    id: "traditions-1",
    theme: "traditions",
    body:
      "Mauss và Hyde nhìn món quà như một thứ mang theo bổn phận — " +
      "phải đón nhận, rồi đến lượt mình trao đi — điều mà thị trường " +
      "cố tình xóa sạch. Trong cộng đồng bạn, lối nghĩ quà tặng ấy " +
      "còn nguyên ở đâu, và ở đâu đã bị thay bằng lối nhìn giao dịch " +
      "sòng phẳng? Điều đó có hệ trọng không?",
  },
  {
    id: "traditions-2",
    theme: "traditions",
    body:
      "Nguyên tắc của người Haudenosaunee — cân nhắc mỗi quyết định " +
      "qua nhiều thế hệ — là điều khó về mặt cấu trúc với một dự án " +
      "được tối ưu quanh các con số hằng tuần. Hãy chọn một quyết " +
      "định gần đây của cộng đồng bạn. Nhìn lại nó với tầm mắt năm " +
      "hay bảy thế hệ, nó sẽ hiện ra thế nào?",
  },
  {
    id: "traditions-3",
    theme: "traditions",
    body:
      "Mandar obedeciendo của người Zapatistas — lãnh đạo bằng cách " +
      "vâng nghe — không phải một phép ẩn dụ; đó là một cam kết về " +
      "cấu trúc, kéo theo hệ quả cho việc ai giữ vai trò điều phối " +
      "và giữ trong bao lâu. Trong cộng đồng bạn, ai đang nắm quyền " +
      "điều phối không chính thức? Đưa nó vào khuôn mandar " +
      "obedeciendo một cách chính thức sẽ tốn những gì?",
  },
] as const;
