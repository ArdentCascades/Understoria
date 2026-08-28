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

// Vietnamese translation of design-principles.ts. Same shape, same
// ids — only the prose changes. Register follows
// docs/i18n-glossary/vi.md: bạn uniformly, tương trợ for mutual aid,
// ngân hàng thời gian for timebank, giờ hạt giống for seed credits,
// «làm sau» for the follows framing, no charity or debt vocabulary.
// The asking-never-gated title reuses the glossary's own rendering
// («nhờ giúp đỡ không bao giờ phải qua cửa nào»). Proper nouns stay
// as they are.
import type { DesignPrinciple } from "./design-principles";

export const DESIGN_PRINCIPLES_VI: readonly DesignPrinciple[] = [
  {
    id: "equal-time",
    title: "Giờ ghi nhận ngang nhau",
    statement:
      "Một giờ giúp đỡ luôn bằng một giờ được ghi nhận, việc gì cũng vậy.",
    example:
      "Những ngân hàng thời gian đời đầu thử định giá theo thị trường nhận ra rằng việc lắng nghe, an ủi và trông trẻ — phần việc thường do phụ nữ và thành viên khuyết tật gánh — luôn bị định giá thấp nhất. Giờ ngang nhau chính là cách sửa từ gốc.",
  },
  {
    id: "no-leaderboards",
    title: "Không bảng xếp hạng, không điểm cá nhân",
    statement:
      "Tiến bộ được ghi ở mức cả cộng đồng. Đơn vị đo là chúng ta, không phải tôi.",
    example:
      "Khi Couchsurfing thêm điểm uy tín, chủ nhà bắt đầu chạy điểm, còn những vị khách dễ tổn thương nhất — người không thể đáp lại bằng đánh giá cao — bị gạt hẳn ra khỏi hệ thống.",
  },
  {
    id: "no-notifications",
    title: "Không thông báo đẩy",
    statement:
      "Khi bạn mở ứng dụng, những gì cần bạn để tâm đã nằm ngay đó. Không rung, không con số nào bám theo bạn từ màn hình này sang màn hình khác, không diễn kịch khẩn cấp.",
    example:
      "Những người tổ chức tương trợ thời COVID kể đi kể lại rằng công cụ chạy bằng thông báo vắt kiệt trước hết chính những thành viên tận tâm nhất — những người mà cộng đồng ít có thể để mất nhất. Nguyên tắc này đứng trên trải nghiệm đó, không phải trên một nghiên cứu chính thức.",
  },
  {
    id: "solidarity-not-shame",
    title: "Đoàn kết, không bêu xấu",
    statement:
      "Không bao giờ gọi một việc là giậm chân, trễ hạn hay thất bại. Sức người thay đổi; hệ thống tự điều chỉnh mà không đổ lỗi cho ai.",
    example:
      "Các nền tảng việc vặt dùng lời nhắc «bạn đang tụt lại» để vắt thêm sức lao động. Người chịu nặng nhất là người đang sẵn trong khó khăn — đúng những người mà tương trợ sinh ra để đỡ.",
  },
  {
    id: "community-authority",
    title: "Cộng đồng là người quyết",
    statement:
      "Không có vai quản trị viên. Các quyết định chung đi qua đề xuất của cộng đồng, không qua quyền của một cá nhân.",
    example:
      "Các hợp tác xã Mondragón đã chứng minh qua hơn 60 năm rằng công nhân tự quản làm tốt hơn quản lý điều hành, cả về công bằng lẫn độ bền. Vai «quản trị viên» là một lựa chọn thiết kế, không phải điều bắt buộc.",
  },
  {
    id: "asking-never-gated",
    title: "Nhờ giúp đỡ không bao giờ phải qua cửa nào",
    statement:
      "Thành viên mới nào cũng bắt đầu với giờ hạt giống. Bạn có thể nhận trước, cho sau.",
    example:
      "Những ngân hàng thời gian bắt phải tích đủ mới được dùng đã thấy các thành viên dễ tổn thương nhất — người già, người mới đến, người đang gặp chuyện — không bao giờ mở lời nhờ giúp. Giờ hạt giống chính là cách sửa từ gốc.",
  },
  {
    id: "privacy-precondition",
    title: "Riêng tư là điều kiện tiên quyết",
    statement:
      "Không email, không số điện thoại, nhật ký tối thiểu. Danh tính của bạn là một chìa khóa mã hóa nằm trên thiết bị của bạn.",
    example:
      "Các trung tâm công nhân dùng sổ điểm danh điện tử từng bị tòa trưng thu danh sách thành viên, hoặc bị lộ danh sách cho giới chủ. Muốn tổ chức được, bản thân việc là thành viên phải được bảo vệ, chứ không chỉ nội dung trao đổi.",
  },
  {
    id: "deliberation-over-speed",
    title: "Bàn cho kỹ hơn là vội",
    statement:
      "Đề xuất mở trong một khoảng thời gian chỉnh được. Đồng thuận cần thời gian, không chỉ cần đủ người.",
    example:
      "Những cuộc bỏ phiếu online chớp nhoáng trong các hợp tác xã cứ thế bỏ sót tiếng nói của công nhân ca đêm, người chăm sóc gia đình và thành viên ít có mạng. Cửa sổ bàn bạc mặc định 3 ngày cho mọi người một cơ hội thật sự để lên tiếng (cộng đồng chỉnh được, thấp nhất 1 ngày).",
  },
  {
    id: "no-post-editing",
    title: "Vì sao đăng lại thay vì sửa",
    statement:
      "Bài đã chia sẻ với cộng đồng thì không thể lặng lẽ sửa hay xóa — điều đã nhờ vẫn là bản ghi đáng tin với mọi người từng thấy nó.",
    example:
      "Nền tảng cho phép sửa bài trong im lặng tạo ra chỗ để chối — «tôi có nói thế bao giờ đâu» thành chuyện không phân xử được. Giữ nguyên bản gốc, còn thay đổi thì đi đường đăng lại — vừa giữ được sự linh hoạt, vừa giữ được trách nhiệm.",
  },
  {
    id: "no-read-receipts",
    title: "Tin nhắn không báo đã xem",
    statement:
      "Người gửi không được báo khi tin nhắn của họ được đọc. Ai nói chuyện với ai — tấm bản đồ quan hệ ấy là thứ mô hình rủi ro bảo vệ trước nhất.",
    example:
      "Dấu tích xanh của WhatsApp tạo áp lực phải trả lời ngay và giúp những người bạn đời bạo hành canh được thời gian trả lời. Bỏ báo đã xem là gỡ bỏ hẳn chỗ bám của sự theo dõi ấy.",
  },
  {
    id: "no-activity-search",
    title: "Không tìm thành viên theo mức hoạt động",
    statement:
      "Không thể tìm «ai hoạt động nhiều nhất» hay «ai giúp nhiều nhất». Nếp hoạt động chính là dữ liệu theo dõi.",
    example:
      "Khi Strava công bố bản đồ nhiệt hoạt động gộp, họ vô tình để lộ vị trí các căn cứ quân sự bí mật. Nếp hoạt động của từng người còn lộ nhiều hơn — ai đang tổ chức, lúc nào, cùng với ai.",
  },
  {
    id: "follows-not-blocked",
    title: "Việc «làm sau» — không bao giờ «bị chặn»",
    statement:
      "Việc đang chờ một việc khác là việc được xếp thứ tự, không phải việc mắc kẹt. Cách gọi tên định hình cảm giác của mọi người về công việc.",
    example:
      "Công cụ quản lý dự án dán nhãn «bị chặn» tạo ra thế đổ lỗi — ai đó đang «chặn» ai đó. «Làm sau» kể đúng sự phụ thuộc ấy như một thứ tự tự nhiên, gỡ đi va chạm giữa người với người.",
  },
];
