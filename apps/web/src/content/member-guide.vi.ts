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

// Vietnamese member guide (i18n Phase 2). Loaded lazily via
// content/bundles/vi.ts — never import this statically from app
// code. Section ids and paragraph counts mirror member-guide.ts;
// guides.parity.test.ts enforces the structure.

import type { GuideSection } from "./member-guide";

export const MEMBER_GUIDE_VI: readonly GuideSection[] = [
  {
    id: "what-it-is",
    title: "Understoria là gì",
    body: [
      "Understoria là một ngân hàng thời gian: một cách để cộng đồng " +
        "trao đổi giúp đỡ, với mỗi giờ được ghi ngang nhau. Một giờ " +
        "sửa bồn rửa bằng đúng một giờ ngồi nghe ai đó sau một ngày " +
        "nặng nề.",
      "Đây không phải ứng dụng săn việc làm thêm. Đây là phần mềm " +
        "nâng đỡ một cộng đồng có sẵn — một chỗ làm, một khu xóm, " +
        "một nhóm thân quen — vốn đã tin nhau và muốn một cách nhẹ " +
        "nhàng để sự giúp đỡ lẫn nhau luôn được nhìn thấy.",
    ],
  },
  {
    id: "credits",
    title: "Số giờ vận hành thế nào",
    body: [
      "Thành viên mới nào cũng bắt đầu với 5 giờ hạt giống. Bạn có " +
        "thể nhờ giúp trước cả khi đã giúp ai. Nhờ giúp không phải " +
        "là mắc nợ — đó là cách mạng lưới bắt đầu sống dậy.",
      "Khi bạn giúp một người, cả hai bên cùng xác nhận trao đổi. Số " +
        "giờ của bạn tăng thêm đúng số giờ đã giúp; số giờ của người " +
        "kia giảm đi. Không đồng tiền nào qua tay; không ai ngồi ghi " +
        "sổ hơn thua.",
      "Số giờ của bạn được tính từ một cuốn sổ có chữ ký ghi lại mọi " +
        "trao đổi. Nếu có gì trông chưa ổn, bạn có thể tự dò lại " +
        "từng dòng.",
    ],
  },
  {
    id: "identity",
    title: "Danh tính của bạn",
    body: [
      "Danh tính của bạn là một cặp khóa mã hóa. Không có email, số " +
        "điện thoại hay mật khẩu tài khoản nào cả. Tên hiển thị là " +
        "tên bạn tự chọn — nó chỉ là cái nhãn, không phải giấy tờ " +
        "chứng thực.",
      "Bạn có thể khóa các khóa nằm trên thiết bị bằng vân tay, " +
        "khuôn mặt hoặc mã PIN của máy (một khóa truy cập — passkey " +
        "— được mời cài ngay trong những bước làm quen đầu tiên, và " +
        "chạy được cả khi hoàn toàn không có mạng), hoặc bằng một " +
        "cụm mật khẩu bạn tự gõ; bạn cũng có thể dùng cả hai, với " +
        "cụm mật khẩu làm lối vào dự phòng. Không có gì về chiếc " +
        "khóa này được gửi cho Apple, Google hay bất kỳ máy chủ nào " +
        "— việc kiểm tra diễn ra ngay trên thiết bị của bạn.",
      "Nếu bạn quên cụm mật khẩu — hoặc mất chiếc điện thoại đang " +
        "giữ khóa vân tay — không ai lấy lại giúp bạn được. Đó là " +
        "cái giá của sự đánh đổi: không một quyền lực trung tâm nào " +
        "đọc được dữ liệu của bạn, nên cũng không một quyền lực " +
        "trung tâm nào cứu lại được nó. Thứ đưa bạn trở về là một " +
        "bản dự phòng bạn đã lo từ lúc mọi chuyện còn yên ổn: một " +
        "thiết bị thứ hai đã liên kết, những người gìn giữ bạn đã " +
        "chọn, hoặc một bộ khôi phục — mỗi thứ chỉ mất chừng một " +
        "phút trong Cài đặt.",
      "Nếu có lúc bạn cần xóa sạch mọi thứ thật nhanh — xóa nhẹ (ẩn " +
        "danh hóa) hoặc xóa sạch (bắt đầu lại) — nút nguy cấp nằm " +
        "sẵn trong Hồ sơ, mục Khẩn cấp.",
    ],
  },
  {
    id: "trust",
    title: "Tin cậy và bước vào cộng đồng",
    body: [
      "Thành viên mới cần được hai thành viên hiện có đứng ra bảo " +
        "đảm để trở thành được tin cậy trọn vẹn. Khi ai đó tham gia " +
        "bằng lời mời của bạn, điều đó được tính là lời bảo đảm ngầm " +
        "của bạn.",
      "Thành viên có thể đăng và nhận việc giúp trước khi được tin " +
        "cậy trọn vẹn — nhờ giúp không bao giờ bị chặn cửa — nhưng " +
        "cộng đồng thấy một nhãn nhỏ cho biết mức tin cậy, để ai " +
        "thấy xứng đáng thì đứng ra bảo đảm thêm bằng tay.",
    ],
  },
  {
    id: "governance",
    title: "Quyết định và bất đồng",
    body: [
      "Các quyết định trong cộng đồng được đưa ra cùng nhau, không " +
        "phải bởi quản trị viên — ứng dụng cố ý không có vai trò " +
        "quản trị viên hay người kiểm duyệt nào. Chuyện chung của cả " +
        "cộng đồng đi qua các đề xuất mở: ai cũng nêu được một đề " +
        "xuất từ Hồ sơ → Đề xuất của cộng đồng, ai cũng thấy được, " +
        "và nó mở suốt một khoảng thời gian cùng bàn trước khi khép " +
        "lại.",
      "Bất đồng về một trao đổi cụ thể đi qua đúng bộ máy ấy: mở một " +
        "bất đồng từ Hồ sơ → Bất đồng trong cộng đồng, nó trở thành " +
        "một đề xuất để cộng đồng cùng lên tiếng, và kết quả được áp " +
        "dụng tự động khi đề xuất khép lại.",
      "Những gì ứng dụng không quyết — nề nếp chung, nhịp họp mặt, " +
        "cách mọi người trò chuyện với nhau — diễn ra trên bất kỳ " +
        "kênh nào cộng đồng bạn vẫn đang dùng. Ứng dụng ghi lại " +
        "quyết định; nó không thay thế cuộc trò chuyện.",
    ],
  },
  {
    id: "where-from-here",
    title: "Đi tiếp từ đây",
    body: [
      "Mở Bảng tin để xem hàng xóm đang sẵn lòng giúp gì và đang cần " +
        "gì ngay lúc này.",
      "Mở Toàn cảnh để xem cộng đồng bạn đang sống thế nào — tổng số " +
        "giờ đã trao đổi, giúp đỡ đang chảy về đâu, những gì đã được " +
        "mừng chung.",
      "Mở Hồ sơ để cập nhật sở trường và thời gian rảnh của bạn, mời " +
        "một người mới, hoặc đọc những bản hướng dẫn dài hơn nằm sẵn " +
        "trong thư mục tài liệu (docs) của dự án.",
    ],
  },
] as const;
