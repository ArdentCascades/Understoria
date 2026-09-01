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

// Vietnamese opsec guide (i18n Phase 2). Loaded lazily via
// content/bundles/vi.ts — never import this statically from app
// code. Section ids and paragraph counts mirror opsec-guide.ts;
// guides.parity.test.ts enforces the structure.

import type { GuideSection } from "./member-guide";

export const OPSEC_GUIDE_VI: readonly GuideSection[] = [
  {
    id: "device",
    title: "Trên thiết bị của bạn",
    body: [
      "Khóa điện thoại bằng mã PIN sáu số hoặc một cụm mật khẩu " +
        "mạnh. Bật mã hóa toàn bộ ổ đĩa (điện thoại đời mới nào cũng " +
        "bật sẵn; trên laptop hãy dùng FileVault, BitLocker hoặc " +
        "LUKS). Giữ hệ điều hành luôn được cập nhật — phần lớn các " +
        "vụ tấn công ngoài đời khai thác những lỗi đã có bản vá từ " +
        "lâu.",
    ],
  },
  {
    id: "accounts",
    title: "Về danh tính của bạn",
    body: [
      "Understoria không bao giờ hỏi email hay số điện thoại. Nếu ai " +
        "đó tự xưng là người của Understoria mà hỏi những thứ này, " +
        "đó là một trò lừa đảo (phishing).",
      "Danh tính của bạn là một chiếc khóa mã hóa nằm trên thiết bị " +
        "này. Bạn có thể xuất một bản sao lưu — cất nó ở nơi an toàn " +
        "và không nối mạng. Một tờ giấy in cất trong ngăn kéo thường " +
        "còn chắc hơn một dịch vụ đám mây.",
      "Nếu điện thoại bị mất hay bị lấy cắp, cái khóa bạn đã cài lên " +
        "chiếc khóa của mình (khóa truy cập — passkey — bằng vân " +
        "tay/khuôn mặt/mã PIN, hoặc một cụm mật khẩu) chính là thứ " +
        "che chở nó — vì vậy mà những bước làm quen đầu tiên đã mời " +
        "bạn cài một cái. Không có thu hồi trung tâm và không ai gạt " +
        "được công tắc thay bạn: hãy cho cộng đồng biết chuyện gì đã " +
        "xảy ra để mọi người thôi tin danh tính đó, rồi bắt đầu lại " +
        "với một chiếc khóa mới (Hồ sơ → Khẩn cấp → Xóa sạch toàn bộ " +
        "trên bất kỳ thiết bị nào còn giữ khóa cũ).",
    ],
  },
  {
    id: "communication",
    title: "Về liên lạc của bạn",
    body: [
      "Đừng bàn chuyện tổ chức trên thiết bị hay mạng của chủ lao " +
        "động. Laptop công ty và Wi-Fi công ty có ghi lại, và đôi " +
        "khi theo dõi, mọi hoạt động.",
      "Đừng chụp màn hình nội dung trên nền tảng rồi chia sẻ ra " +
        "ngoài nhóm. Một khi đã rời Understoria, nó không còn được " +
        "che chở nữa.",
      "Chuyện nhạy cảm thì gặp mặt mà nói. Mười phút đi bộ ăn đứt " +
        "một chuỗi tin nhắn dài hai tiếng đồng hồ.",
    ],
  },
  {
    id: "social",
    title: "Về dấu vết của bạn trên mạng xã hội",
    body: [
      "Giữ tên hiển thị trên Understoria tách khỏi danh tính nơi làm " +
        "việc của bạn. Một bút danh là một tính năng, không phải dấu " +
        "hiệu thiếu thành thật.",
      "Đừng đăng về công việc tổ chức lên mạng xã hội công khai kèm " +
        "tên thật trên giấy tờ của bạn. Ngay cả những bài “truyền " +
        "cảm hứng chung chung” cũng dệt nên một khuôn hình mà một kẻ " +
        "quan sát kiên nhẫn có thể ráp lại được.",
    ],
  },
  {
    id: "wrong",
    title: "Nếu thấy có gì đó không ổn",
    body: [
      "Nếu một người bạn không quen muốn được thêm vào, hãy đi chậm " +
        "lại. Hãy hỏi xin một lời bảo đảm.",
      "Nếu một thành viên lâu nay bắt đầu hỏi những câu lạ về danh " +
        "sách thành viên hay ai đã giúp ai — hãy để tâm. Nói chuyện " +
        "với một thành viên khác. Chuyện cài người vào là có thật.",
      "Nếu một nhà cung cấp, chủ lao động hay một viên chức yêu cầu " +
        "bạn chia sẻ thông tin về thành viên hay hoạt động: bạn " +
        "không buộc phải làm vậy. Đừng gánh một mình — hãy bàn với " +
        "những thành viên bạn tin cậy trước khi trả lời bất cứ điều " +
        "gì.",
    ],
  },
  {
    id: "rights",
    title: "Biết quyền của mình",
    body: [
      "Bạn không buộc phải trả lời câu hỏi của cảnh sát khi chưa có " +
        "luật sư bên cạnh. Bạn không buộc phải đồng ý cho khám thiết " +
        "bị — thường thì họ cần lệnh khám. Bạn không buộc phải chỉ " +
        "ra các thành viên khác. Bạn có quyền giữ im lặng.",
      "Vân tay và khuôn mặt không phải là lời nói. Ở nhiều nơi, tòa " +
        "án coi mở khóa sinh trắc như một chiếc chìa khóa vật lý — " +
        "cảnh sát có thể ấn ngón tay bạn lên điện thoại hoặc giơ máy " +
        "trước mặt bạn — trong khi thứ bạn biết trong đầu, như một " +
        "cụm mật khẩu, được coi là lời khai mà bạn có quyền từ chối " +
        "đưa ra. Điều này khác nhau theo từng nước và từng tòa, nên " +
        "hãy hỏi một tổ chức pháp lý tại chỗ; nhưng nếu bạn có thể " +
        "bị tạm giữ, hãy mặc định rằng sinh trắc có thể bị ép còn " +
        "cụm mật khẩu thì không.",
      "Học thuộc thao tác khóa cứng của điện thoại trước khi cần đến " +
        "nó. Trên iPhone, giữ nút sườn cùng một trong hai nút âm " +
        "lượng trong hai giây (đến khi màn hình tắt nguồn hiện ra) — " +
        "Face ID và Touch ID lập tức tắt cho đến khi mã mở khóa được " +
        "nhập. Trên Android, giữ nút nguồn rồi chạm Lockdown (nếu " +
        "chưa thấy, bật trước trong Cài đặt → Hiển thị → Màn hình " +
        "khóa). Tập cho đến khi tay tự nhớ.",
      "Ngay trong Understoria: nếu chuyện bị ép mở khóa nằm trong " +
        "hình dung rủi ro của bạn, hãy che chở chiếc khóa bằng một " +
        "cụm mật khẩu thay vì vân tay — hoặc gỡ mở khóa bằng vân tay " +
        "(Hồ sơ → Cài đặt → Bảo mật) trước một cuộc biểu tình, một " +
        "lần qua biên giới, hay bất kỳ thời điểm nào có thể bị tạm " +
        "giữ; sau đó bạn thêm lại được. Chỉ một cụm mật khẩu bạn tự " +
        "gõ mới mang trọn quyền-được-từ-chối từ đầu đến cuối. Và " +
        "nhớ rằng nút nguy cấp (Hồ sơ → Khẩn cấp → Xóa sạch toàn bộ) " +
        "sinh ra cho những lúc khóa thôi là chưa đủ.",
      "Các tổ chức pháp lý nơi bạn sống (NLG ở Mỹ, LDAN ở Anh) có " +
        "những tấm thẻ “Biết quyền của mình” theo đúng pháp luật " +
        "từng nơi. Giữ một tấm trong ví.",
    ],
  },
];
