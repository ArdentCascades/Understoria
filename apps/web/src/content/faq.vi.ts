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
// Vietnamese FAQ (i18n Phase 2). Loaded lazily via
// content/bundles/vi.ts — never import this statically from app
// code. When adding or renaming an entry in faq.ts, mirror the
// change here so the parity test (faq.parity.test.ts) stays
// green.
import type { FaqSection } from "./faq";

export const FAQ_SECTIONS_VI: readonly FaqSection[] = [
  {
    "id": "posts",
    "title": "Mẩu tin và trao đổi",
    "entries": [
      {
        "id": "post-something",
        "question": "Đăng việc cần giúp hay lời ngỏ giúp đỡ thế nào?",
        "answer": [
          "Trên Bảng tin, chạm nút màu xanh lá + Đăng việc cần giúp hoặc + Đăng lời ngỏ giúp ở cạnh dưới màn hình. Đặt một tiêu đề ngắn, kể rõ bạn cần gì hoặc có thể cho đi điều gì, rồi đăng lên. Sau này bạn có thể hủy nó từ trang chi tiết của mẩu tin, hoặc chọn “Đăng lại với chỉnh sửa” trong menu mẩu tin."
        ]
      },
      {
        "id": "claim-post",
        "question": "Nhận mẩu tin của người khác thế nào?",
        "answer": [
          "Chạm vào bất kỳ mẩu tin nào trên Bảng tin để mở trang chi tiết của nó. Với một việc cần giúp, chạm Ngỏ lời giúp; với một lời ngỏ, chạm Nhận lời ngỏ này. Mẩu tin chuyển sang trạng thái “đang chờ xác nhận” và người đăng có dịp xác nhận trước khi bất kỳ giờ nào được ghi sang.",
          "Nếu bạn đổi ý, chạm Trả lại việc đã nhận ngay trên trang đó — mẩu tin lại mở ra cho người khác."
        ]
      },
      {
        "id": "confirm-exchange",
        "question": "Xác nhận một trao đổi diễn ra thế nào?",
        "answer": [
          "Sau khi phần giúp đỡ đã thật sự diễn ra, cả hai bên chạm Xác nhận đã xong trên trang chi tiết mẩu tin. Giờ chỉ được ghi sang khi cả hai bên đã xác nhận.",
          "Thứ tự không quan trọng — một người xác nhận trước, người kia thấy mẩu tin đang chờ mình, rồi xác nhận khi rảnh tay."
        ]
      },
      {
        "id": "other-not-confirmed",
        "question": "Người kia vẫn chưa xác nhận. Tôi nên làm gì?",
        "answer": [
          "Trước hết, nhắn hỏi người này ở ngoài ứng dụng. Phần lớn chỉ là quên chạm một cái, chứ không phải từ chối.",
          "Nếu thật sự có bất đồng về chuyện trao đổi có diễn ra hay không, hoặc có tính là giúp trọn vẹn hay không, hãy dùng Có gì đó chưa ổn — gắn cờ để cùng xem trên trang chi tiết mẩu tin. Việc đó đưa trao đổi lên trang Bất đồng, nơi cả cộng đồng có thể cùng tháo gỡ — ở đây không có quản trị viên. Giờ chưa được ghi sang cho đến khi mọi chuyện được tháo gỡ.",
          "Bạn cũng không phải chờ mãi mãi. Nếu cộng đồng bạn đã bật tự động xác nhận, node của cộng đồng sẽ vào cuộc sau khoảng thời gian chờ mà mọi người đã thống nhất và hoàn tất một lời xác nhận rõ ràng chỉ là bị quên, để giờ của không ai bị treo lơ lửng mãi."
        ]
      },
      {
        "id": "cancel-post",
        "question": "Hủy một mẩu tin tôi không cần nữa thế nào?",
        "answer": [
          "Mở mẩu tin từ Bảng tin rồi chạm Hủy mẩu tin. Mẩu tin rời bảng tin ngay, nên không ai nhận được nữa. Nó không bị xóa — trang riêng của nó vẫn còn, được đánh dấu là đã hủy, và ai có liên kết vẫn xem được điều đã nhờ hay đã ngỏ."
        ]
      }
    ]
  },
  {
    "id": "balance",
    "title": "Số giờ và giờ được ghi",
    "entries": [
      {
        "id": "what-is-balance",
        "question": "Số giờ của tôi có nghĩa là gì?",
        "answer": [
          "Số giờ của bạn là tổng cộng dồn số giờ bạn đã giúp trừ đi số giờ bạn đã nhận. Ai cũng bắt đầu ở mức 5 (giờ hạt giống), nên một thành viên vừa mới vào đang ở mức 5, chứ không phải 0.",
          "Số giờ xuống dưới không cũng chẳng sao — nhờ giúp đỡ không phải là mắc nợ ai. Cộng đồng thấy được số giờ của bạn, nhưng đó không phải điểm số, và ở đây không có bảng xếp hạng."
        ]
      },
      {
        "id": "negative-balance",
        "question": "Số giờ của tôi có xuống dưới không được không?",
        "answer": [
          "Được. Nhận nhiều hơn phần mình đã giúp là một phần của cách tương trợ vận hành — mạng lưới sinh ra là để chảy. Cộng đồng chỉ thấy một dấu gắn cờ nếu bạn chạm gần giới hạn trao đổi trong ngày hoặc nếu có gì đó trông khác thường; ngoài ra thì không ai đi canh con số của bạn."
        ]
      }
    ]
  },
  {
    "id": "identity",
    "title": "Danh tính và thiết bị của bạn",
    "entries": [
      {
        "id": "getting-around",
        "question": "Thẻ Hồ sơ đi đâu mất rồi? Đi lại trong ứng dụng thế nào?",
        "answer": [
          "Năm thẻ nằm ở cạnh dưới màn hình (thành một dải bên trái nếu màn hình rộng): Bảng tin, Toàn cảnh, Lịch, Tin nhắn và Do tôi chăm nom — mọi việc bạn đã nhận và mọi dự án bạn đứng ra tổ chức, gom về một chỗ.",
          "Mọi thứ về CHÍNH BẠN đã dời vào sau nút Menu ở góc trên bên phải: Hồ sơ của bạn (hiện dưới chính tên bạn), Cài đặt, Mời một người, trang Trợ giúp này, Tìm kiếm, và Hạ tầng của cộng đồng.",
          "Tìm kiếm tìm ra mẩu tin, dự án, sự kiện, con người và cả những câu trả lời trợ giúp này — tất cả từ những gì đã có sẵn trên thiết bị của bạn. Nếu có bàn phím, Ctrl+K (⌘K trên máy Mac) mở nó từ bất cứ đâu."
        ]
      },
      {
        "id": "change-name",
        "question": "Đổi tên hiển thị hay khu vực của tôi thế nào?",
        "answer": [
          "Hồ sơ → Về bạn. Tên chỉ là cái nhãn, không phải giấy tờ chứng thực, nên bạn muốn đổi lúc nào cũng được. Danh tính mã hóa của bạn vẫn y nguyên."
        ]
      },
      {
        "id": "lost-passphrase",
        "question": "Nếu tôi quên mất cụm mật khẩu thì sao?",
        "answer": [
          "Không ai đặt lại giúp bạn được, và đó là chủ ý. Cái giá đổi lại là: không một quyền lực trung tâm nào đọc được dữ liệu của bạn, nên cũng không một quyền lực trung tâm nào cứu lại được nó.",
          "Nhưng quên cụm mật khẩu giờ không còn đồng nghĩa với mất luôn chính mình. Nếu bạn có một thiết bị thứ hai đã liên kết, danh tính của bạn vẫn nằm ở đó. Nếu bạn đã tạo bộ khôi phục (Cài đặt → Bộ khôi phục), nó đưa tài khoản của bạn trở lại bằng cụm mật khẩu riêng, tách biệt, của chính nó. Nếu bạn đã chọn người gìn giữ, một nhóm đủ đông trong số họ có thể đưa bạn trở lại mà chẳng cần cụm mật khẩu nào. Xem “Nếu tôi mất điện thoại thì sao?” bên dưới để biết thứ tự đầy đủ nên thử.",
          "Chỉ khi không có thứ nào trong số đó thì câu trả lời mới là Hồ sơ → Khẩn cấp → Xóa sạch toàn bộ: xóa sạch thiết bị và bắt đầu lại với một danh tính mới, không mang theo lịch sử giờ cũ của bạn."
        ]
      },
      {
        "id": "lost-phone",
        "question": "Nếu tôi mất điện thoại thì sao?",
        "answer": [
          "Tài khoản của bạn có thể trở lại — đây là thứ tự thành thật nên thử, tốt nhất trước.",
          "1. Một thiết bị thứ hai đã liên kết. Nếu bạn từng thêm một cái (Hồ sơ → Thêm thiết bị khác), danh tính của bạn đã sống sẵn ở đó; cứ dùng tiếp, và liên kết chiếc điện thoại thay thế từ chính nó.",
          "2. Một bộ khôi phục. Nếu bạn đã tạo một bộ (Cài đặt → Bộ khôi phục), mở ứng dụng trên bất kỳ thiết bị mới nào, chọn “Mất thiết bị nhưng còn bộ khôi phục”, rồi nhập cụm mật khẩu của bộ đó. Số giờ, các lời bảo đảm, vai trò và tư cách thành viên đều trở lại; lịch sử của cộng đồng đồng bộ về từ máy chủ của cộng đồng.",
          "3. Những người gìn giữ của bạn. Nếu bạn đã chia nhỏ chiếc khóa của mình cho những người gìn giữ (Cài đặt → Người gìn giữ), hãy gặp đủ số người: thiết bị mới hiện một mã yêu cầu, mỗi người gìn giữ đáp lại bằng một mã mở, và khi đủ ngưỡng thì tài khoản của bạn bước trở vào — không cần bộ khôi phục, không cần cụm mật khẩu.",
          "4. Một lời mời mới. Nếu không có thứ nào ở trên, hãy nhờ ai đó mời bạn lần nữa. Bạn sẽ là một thành viên mới: lịch sử cũ vẫn hiện ra với cộng đồng dưới cái tên cũ của bạn, nhưng chiếc khóa mới bắt đầu từ con số không. Đây đúng là lý do ứng dụng cứ nhắc mọi người lo sẵn một thiết bị thứ hai, một bộ khôi phục, hoặc những người gìn giữ TRƯỚC cái tuần xui xẻo đó.",
          "Thứ không bao giờ trở lại trên một thiết bị mới: tin nhắn riêng và những bản nháp chưa gửi — chúng chỉ từng sống trên chiếc điện thoại đã mất, và đó là chủ ý."
        ]
      },
      {
        "id": "install-app",
        "question": "Tôi cài Understoria như một ứng dụng được không?",
        "answer": [
          "Được. Understoria là một ứng dụng web mà bạn có thể đặt lên màn hình chính như mọi ứng dụng khác: bạn có một biểu tượng, nó mở toàn màn hình không còn các thanh của trình duyệt, khởi động nhanh hơn, và vẫn chạy được khi không có mạng.",
          "Trên iPhone hay iPad, mở Understoria trong Safari, nhấn nút Chia sẻ, rồi chọn “Thêm vào màn hình chính”.",
          "Trên Android, mở nó trong Chrome, nhấn menu (⋮) ở góc trên, rồi chọn “Thêm vào màn hình chính” hoặc “Cài đặt ứng dụng”.",
          "Trên trình duyệt máy tính, tìm biểu tượng cài đặt ở cuối bên phải thanh địa chỉ.",
          "Trên máy tính chạy Linux còn có một ứng dụng cho máy tính — chỉ một tệp duy nhất (một AppImage) mà cộng đồng bạn có thể chia sẻ cho nhau, chạy được mà chẳng cần trình duyệt nào. Cho tệp đó quyền chạy (bấm chuột phải → Thuộc tính → cho phép thực thi, hoặc chmod +x), mở nó lên, rồi ghép nối từ điện thoại của bạn: trên điện thoại vào Cài đặt → “Thêm thiết bị khác”, sau đó chọn cách dán mã trên máy tính. Nó tính là một thiết bị riêng, y như trường hợp iPhone bên dưới, và chỉ cập nhật khi bạn thay tệp ấy bằng một tệp mới hơn.",
          "Một điều nên biết trước khi cài: trên iPhone và iPad, ứng dụng đã cài có kho lưu trữ RIÊNG tách biệt của nó, nên nó mở ra ở trạng thái chưa đăng nhập dù bản trên trình duyệt vẫn đang đăng nhập — không mất gì cả, chỉ là bạn có hai “thiết bị” tách biệt trên cùng một điện thoại. Ứng dụng đã cài hỏi chuyện này ngay ở màn hình đầu tiên: chọn “Tôi đã dùng Understoria trong trình duyệt của điện thoại này” và nó sẽ dắt bạn từng bước mang danh tính sang. (Trên Android và máy tính, ứng dụng đã cài dùng chung kho lưu trữ với trình duyệt, nên bạn vẫn đăng nhập nguyên.)"
        ]
      },
      {
        "id": "new-device",
        "question": "Chuyển sang một thiết bị mới thế nào?",
        "answer": [
          "Không phải gõ gì cả. Trên thiết bị mới, mở Understoria và chọn “Mang danh tính của tôi sang” — nó hiện hai emoji rồi chờ. Trên thiết bị đã có danh tính của bạn, vào Hồ sơ → Thêm thiết bị khác: lời xin liên kết tự hiện ra ở đó. Xem hai emoji có khớp nhau không, chạm “Liên kết thiết bị này”, và thiết bị mới tự đăng nhập. Cả hai thiết bị cần ở cùng một mạng (trên cùng một điện thoại thì luôn cùng mạng). Ở xa nhau, hoặc không có máy chủ của cộng đồng? “Cách liên kết khác” có một mã 6 từ để đọc lên và một mã QR bỏ qua hẳn mọi máy chủ.",
          "Hai thứ không đi theo: lịch sử tin nhắn của bạn (tin nhắn được mã hóa bằng khóa riêng của từng thiết bị, nên chúng ở lại đúng nơi đã nhận) và những cài đặt riêng của từng thiết bị như giao diện và cỡ chữ. Mọi thứ còn lại — mẩu tin, dự án, sự kiện, thành viên, trao đổi — sang cùng với chính lần liên kết đó, nên thiết bị mới trông y như thiết bị cũ ngay lập tức và tiếp tục đồng bộ về sau."
        ]
      },
      {
        "id": "link-safety",
        "question": "Khi liên kết thiết bị, tôi nên để ý điều gì?",
        "answer": [
          "Ba thói quen đơn giản giữ cho việc liên kết được an toàn. Thứ nhất: chỉ chạm “Liên kết thiết bị này” khi CHÍNH BẠN đang cầm thiết bị đang xin, và hai emoji trên màn hình của bạn khớp với hai emoji trên màn hình của nó. Nếu có lời xin hiện ra trong lúc bạn không liên kết gì cả, cứ bỏ qua — có thể ai đó trong mạng của bạn đang thử vận may, và chẳng có chuyện gì xảy ra trừ khi bạn chạm.",
          "Thứ hai: sau khi thiết bị mới đăng nhập, nhìn qua cái tên nó chào bạn. Nếu đó không phải bạn, có ai đó đã luồn danh tính của họ vào lần chuyển này — không có gì của bạn bị lấy đi, và nút “Đây không phải tôi” sẽ xóa sạch thiết bị để bạn làm lại từ đầu.",
          "Thứ ba, phần chữ nhỏ nói thật: cách liên kết bằng một chạm đi qua chính máy chủ của cộng đồng bạn, và máy chủ đó chỉ chuyển tiếp dữ liệu đã niêm phong mà nó không đọc được — nhưng nếu bạn không tin người vận hành máy chủ ấy, hãy dùng cách quét mã QR trong “Cách liên kết khác”. Mã QR đi thẳng từ màn hình sang camera, không có máy chủ nào dính vào.",
          "Một lưu ý thực tế: liên kết bằng một chạm cần hai thiết bị trông như đang ở cùng một mạng. VPN hoặc iCloud Private Relay có thể lặng lẽ cản đường — nếu lời xin không bao giờ hiện ra, tạm tắt nó một phút rồi cho xin lại, hoặc dùng “Cách liên kết khác”."
        ]
      }
    ]
  },
  {
    "id": "community",
    "title": "Cộng đồng và lời mời",
    "entries": [
      {
        "id": "internet-outage",
        "question": "Khi mất internet — chẳng hạn giữa một cơn bão — chúng ta vẫn làm được những gì?",
        "answer": [
          "Nhiều hơn bạn tưởng, vì cả ứng dụng này được dựng lên đúng cho tình huống ấy. Thiết bị của bạn đã mang sẵn mọi thứ: bảng tin, sổ chung của cộng đồng, danh sách thành viên, danh tính của bạn. Bạn vẫn đọc, vẫn đăng, vẫn xác nhận được — mọi thay đổi xếp hàng chờ an toàn và tự gửi đi ngay khi bạn có mạng trở lại. Không có gì mất đi trong lúc internet đứt.",
          "Nếu có người gần bạn cần giúp NGAY: cứ giúp, rồi cùng nhau xác nhận khi gặp mặt. Trên trang của mẩu tin, chọn “Xác nhận khi gặp trực tiếp” — một điện thoại hiện mã, điện thoại kia quét và ký. Cả hai máy đều giữ bản ghi và mang nó về khi internet trở lại.",
          "Nếu cộng đồng bạn có một điểm trú bão — một máy chủ dự phòng nhỏ do ai đó giữ sẵn cho những lúc mất mạng — hãy vào Wi-Fi của nó khi internet đứt, và ứng dụng lại chạy bình thường cho tất cả mọi người ở nơi trú: mẩu tin vẫn lưu thông, giúp đỡ vẫn được xác nhận, không phải cài đặt gì. Hỏi người vận hành máy chủ của cộng đồng xem đã có điểm trú bão chưa; nếu chưa, docs/offline-resilience.md là công thức để dựng một cái trong lúc trời còn yên.",
          "Bạn thậm chí còn mời được người mới. Mã mời của bạn chạy được mà không cần internet — nó do chính bạn ký và còn giá trị trong hai tuần — nên cứ đưa họ xem mã QR hoặc trao liên kết in trên giấy và để họ giữ một tấm ảnh chụp lại. Ở một điểm trú bão, người này cài được ứng dụng và tham gia ngay tại chỗ; nếu không, họ sẽ hoàn tất việc tham gia ngay khi có bất kỳ kết nối nào. Điều duy nhất không thể làm khi chẳng còn mạng nào là tải chính ứng dụng về — lời mời sẽ kiên nhẫn chờ đến khi họ tải được.",
          "Lúc trời yên chính là lúc nên đưa những điều này lên giấy: trang Hạ tầng của cộng đồng in được bộ phòng khi mất mạng — một áp phích dán tường và những tấm thẻ bỏ ví ghi các bước vào điểm trú bão — để hướng dẫn vẫn còn đó cả khi pin đã cạn."
        ]
      },
      {
        "id": "add-a-node",
        "question": "Điều gì giữ an toàn cho cộng đồng này nếu ai đó lấy mất máy chủ?",
        "answer": [
          "Hai điều, và chúng chính là cốt lõi khiến Understoria được dựng khác hẳn những nền tảng của các công ty. Thứ nhất: thiết bị của mỗi thành viên đã mang sẵn một bản sao đầy đủ, có chữ ký, của cả cộng đồng — bảng tin, sổ chung của cộng đồng, các dự án, tất cả. Tịch thu máy chủ chẳng lấy đi được thứ gì mà điện thoại của mọi người chưa có, và một máy chủ thay thế có thể được đổ đầy trở lại từ chính những bản sao ấy.",
          "Thứ hai: máy chủ không nhất thiết phải là một cỗ máy duy nhất, hay cỗ máy của một người duy nhất. Thành viên nào cũng chạy được một node của cộng đồng — một chiếc laptop cũ gập nắp nằm trong tủ là đủ thật. Mỗi node thêm vào nghĩa là không còn một người duy nhất nào để một nhóm chống công đoàn hay chống tương trợ có thể gây sức ép nhằm phá vỡ cộng đồng. Thẻ Sức bền của cộng đồng trên Toàn cảnh cho thấy cộng đồng bạn đã mọc được bao nhiêu rễ.",
          "Sẵn sàng thêm một cái chưa? Hướng dẫn từng bước nằm trong tài liệu của dự án — docs/add-a-node.md trong kho mã nguồn Understoria chỉ cách tận dụng lại một máy tính cũ, còn hướng dẫn dành cho người vận hành đi vào chi tiết. Việc này mất chừng một buổi chiều, và thành viên đang chạy máy chủ hiện tại có thể giúp bạn đổi cho nhau hai thiết lập nối các node lại với nhau."
        ]
      },
      {
        "id": "start-a-community",
        "question": "Tôi có thể lập một cộng đồng như thế này cho khu phố mình không?",
        "answer": [
          "Được — và bạn không cần xin phép ai, không cần tài khoản GitHub, cũng không cần cửa hàng ứng dụng nào. Understoria là phần mềm tự do, và chính máy chủ của cộng đồng này cho tải về trọn bộ mã nguồn của nó.",
          "Cả con đường được viết sẵn ngay trong ứng dụng: mở Menu (góc trên bên phải) → Hạ tầng của cộng đồng → thẻ tên là “Chính phần mềm này” → “Bắt đầu một cộng đồng mới từ bản tải này”. Nó dắt bạn đi từ chỗ tải và kiểm chứng mã nguồn cho đến chỗ chạy máy chủ của riêng mình, bằng lời lẽ dễ hiểu."
        ]
      },
      {
        "id": "invite-someone",
        "question": "Mời một người thế nào?",
        "answer": [
          "Trước hết: mời người là việc của những thành viên được tin cậy. Cho đến khi có hai thành viên được tin cậy đứng ra bảo đảm cho bạn (lời mời bạn dùng để tham gia được tính là lời đầu tiên), nút mời sẽ hiện tiến độ của bạn thay vì mở ra. Điều này che chở cộng đồng — một chuỗi người lạ không thể mời thêm người lạ. Muốn đến đó, hãy làm đúng điều ứng dụng sinh ra để làm: giúp mọi người. Khi hàng xóm đã quen bạn, bất kỳ thành viên được tin cậy nào cũng có thể đứng ra bảo đảm cho bạn từ trang hồ sơ của bạn.",
          "Cách nhanh nhất: mở Menu (góc trên bên phải) và chọn Mời một người — nó đưa bạn thẳng đến thẻ lời mời. Đường vòng dài hơn là Hồ sơ → Lời mời bạn đã gửi.",
          "Chạm Tạo liên kết mời là bạn có ngay một liên kết chỉ dùng được một lần. Chia sẻ nó khi gặp mặt, qua Signal, hoặc qua bất kỳ kênh nào mà bạn chắc chắn được là nó đã đến đúng người bạn định gửi. Đừng đăng liên kết mời ở nơi công khai.",
          "Bạn cũng có thể hiện một lời mời dưới dạng mã QR để trao khi gặp mặt. Mỗi lời mời chỉ dùng được một lần, tự hết hạn, và có thể thu hồi từ Hồ sơ → Lời mời bạn đã gửi cho đến khi có ai đó dùng đến nó. Khi ai đó tham gia bằng lời mời của bạn, điều đó được tính là bạn đứng ra bảo đảm cho họ — tên bạn đứng sau việc họ gia nhập, nên hãy mời những người bạn thật sự quen biết."
        ]
      },
      {
        "id": "how-vouching-works",
        "question": "Việc đứng ra bảo đảm hoạt động ra sao?",
        "answer": [
          "Lời bảo đảm là một lời cam kết công khai có chữ ký, rằng bạn quen biết người này và đứng sau chỗ đứng của người này trong cộng đồng. Một người trở thành “được tin cậy” khi đã có hai thành viên khác nhau đứng ra bảo đảm cho họ — và việc mời một người tự động được tính là lời bảo đảm của bạn, nên bảo đảm bằng tay là cách bạn đứng sau một người do người khác đưa vào.",
          "Bạn đứng ra bảo đảm từ trang của một thành viên: chạm vào tên người này ở bất cứ đâu trong ứng dụng rồi tìm mục Bảo đảm. Nút chỉ hiện ra khi lời bảo đảm của bạn thật sự thêm được sự tin cậy — bạn đã được tin cậy, người này vẫn đang gom cho đủ lời bảo đảm, và bạn chưa từng bảo đảm cho họ. Nếu không, mục đó sẽ giải thích vì sao chưa, để bạn không bao giờ phải đoán.",
          "Đáng để nghĩ một lát: tên bạn đứng sau tên người ấy, ai cũng thấy và còn mãi — trong ứng dụng, một lời bảo đảm không rút lại được. Nếu sau này bạn tiếc, con đường là một cuộc trò chuyện với cộng đồng, chứ không phải một cái nút. Hãy bảo đảm cho những người bạn thật sự quen biết.",
          "Được người khác bảo đảm cũng mở ra những quyền đi cùng sự tin cậy trong cộng đồng: mời người mới, bảo đảm cho người khác, ký vào việc đưa một thành viên ra khỏi cộng đồng — và những liên kết bạn chia sẻ trở nên chạm được với mọi người (trước đó ai cũng thấy đầy đủ địa chỉ nhưng không chạm vào được, đó là lớp chắn với liên kết xấu, chứ không phải một dấu trừ dành cho bạn). Cùng lúc ấy, giới hạn rộng rãi về số mẩu tin mỗi ngày dành cho người mới cũng biến mất."
        ]
      },
      {
        "id": "disagree-with-member",
        "question": "Nếu tôi bất đồng với một thành viên khác thì sao?",
        "answer": [
          "Hãy nói chuyện với người này trước. Phần lớn bất đồng chẳng liên quan gì đến ứng dụng và cũng không cần ứng dụng xen vào.",
          "Nếu chuyện nằm ở một trao đổi cụ thể, hãy dùng Có gì đó chưa ổn — gắn cờ để cùng xem trên trang chi tiết mẩu tin. Nếu chuyện là cách cư xử vượt ra ngoài một trao đổi đơn lẻ, bạn có thể mở một bất đồng từ Hồ sơ → Bất đồng — bất đồng đi qua quy trình đề xuất mở của cộng đồng, vì ở đây không có quản trị viên nào quyết thay bạn.",
          "Còn nếu điều bạn cần chỉ là khoảng cách với một người, chặn thì lúc nào cũng có sẵn — xem “Nếu có người làm phiền tôi thì sao?” trong mục Tin nhắn."
        ]
      },
      {
        "id": "member-removal",
        "question": "Việc đưa một người ra khỏi cộng đồng diễn ra thế nào?",
        "answer": [
          "Đưa một người ra khỏi cộng đồng là điều nặng nề nhất cộng đồng này có thể làm, và ứng dụng đối xử với nó đúng như vậy. Đây là đường cuối cùng: chặn riêng đã đủ để nội dung của một người không đến được với bạn, một bất đồng có thể nêu lại một trao đổi cụ thể, và một cuộc trò chuyện còn tháo gỡ được nhiều hơn cả hai cách kia.",
          "Không một người nào tự mình đưa được ai ra khỏi cộng đồng — người đứng ra tổ chức cũng không, người vận hành máy chủ cũng không. Việc này cần nhiều thành viên (con số do cộng đồng bạn đặt ra và ai cũng thấy được), mỗi người tự ký tên mình vào một bản ghi công khai. Việc đề xuất bắt đầu từ trang hồ sơ của thành viên đó; việc cùng ký diễn ra khi gặp mặt, từ trang Đề xuất.",
          "Một lần đưa người ra khỏi cộng đồng là chuyện công khai trong nội bộ cộng đồng — ai bị đưa ra, khi nào, vì sao, và chính xác những ai đã ký, tất cả đều hiện trên trang Đề xuất. Đưa người ra trong bí mật chính là cách các cộng đồng mục ruỗng dần.",
          "Đây không phải là xóa sạch dấu vết. Những trao đổi trước đây của thành viên bị đưa ra vẫn còn — chúng giữ cho sổ chung của những thành viên khác được cân — và mọi thứ trên thiết bị của chính người này vẫn là của họ. Thứ chấm dứt là lối vào: không đọc được nữa, và những gì viết mới sẽ bị từ chối. Những người họ đã mời trước đó vẫn là thành viên; những lời mời chưa dùng của họ mất hiệu lực cùng lúc.",
          "Và cánh cửa có thể mở lại: đón trở lại cần đúng chừng ấy chữ ký, khởi đầu ngay từ chính bản ghi đưa ra khỏi cộng đồng trên trang Đề xuất."
        ]
      },
      {
        "id": "lurking-ok",
        "question": "Tôi chỉ xem thôi mà không đăng gì có được không?",
        "answer": [
          "Được chứ. Đọc xem người khác đang sẵn lòng giúp gì và đang cần gì cũng là một cách góp một tay đàng hoàng. Có thành viên lặng lẽ xem hàng tuần liền trước khi đăng việc cần giúp đầu tiên; có người không bao giờ đăng mà chỉ đáp lời người khác. Cả hai đều được đón nhận."
        ]
      },
      {
        "id": "who-sees-what",
        "question": "Ai thấy được những gì tôi đăng?",
        "answer": [
          "Mọi người trong node của cộng đồng bạn đều thấy được mẩu tin của bạn, tên hiển thị của bạn, khu vực của bạn (nếu bạn có ghi), và lịch sử trao đổi của bạn. Các cộng đồng kết nghĩa nhận những bản ghi có chữ ký mà bạn công bố — mẩu tin, trao đổi đã xác nhận, sự kiện — dưới khóa công khai của bạn, chứ không phải dưới tên hiển thị. Vì các trao đổi được chia sẻ giữa các cộng đồng kết nghĩa, một node kết nghĩa có thể thấy hoạt động trao đổi của chiếc khóa ấy và tính ra được số giờ của nó; những thứ không bao giờ rời khỏi cộng đồng bạn là xác nhận tham dự, việc ghi tên vào ca, các việc trong dự án, danh sách chặn, bản nháp, và tin nhắn.",
          "Tin nhắn riêng thì khác: chúng được mã hóa đầu cuối giữa thiết bị của bạn và thiết bị của người kia, nên chỉ hai bạn đọc được — node không đọc được, các thành viên khác cũng không. Xem “Nhắn tin cho một thành viên khác thế nào?” trong mục Tin nhắn để biết chi tiết."
        ]
      },
      {
        "id": "beta-status",
        "question": "Ứng dụng này đã hoàn thiện đến đâu? Tôi không nên đưa gì vào đây?",
        "answer": [
          "Understoria là phần mềm đang ở giai đoạn beta. Phần lớn mã của nó được viết bằng công cụ AI và được người thật xem lại, và nó chưa qua một cuộc kiểm định an ninh độc lập nào.",
          "Những lớp bảo vệ bạn thấy là thật và đã được thử — tin nhắn mã hóa đầu cuối, bản ghi có chữ ký, phương án nguy cấp xóa sạch chạy đúng. Nhưng beta nghĩa là vẫn có thể có lỗi, kể cả những lỗi chưa ai tìm ra.",
          "Nó được dựng lên để lo liệu việc hàng xóm giúp nhau hằng ngày. Đừng đưa vào đây bất cứ thứ gì có thể làm hại bạn hay người khác nếu lộ ra — giấy tờ tùy thân do nhà nước cấp, chi tiết bệnh án hay chuyện giấy tờ cư trú, hay bất cứ điều gì bạn chỉ nói khi không ai ghi lại. Không chắc thì cứ nói trực tiếp khi gặp mặt."
        ]
      }
    ]
  },
  {
    "id": "messages",
    "title": "Tin nhắn",
    "entries": [
      {
        "id": "message-someone",
        "question": "Nhắn tin cho một thành viên khác thế nào?",
        "answer": [
          "Mở bất kỳ mẩu tin nào rồi chạm nút Nhắn tin để bắt chuyện — tin nhắn đến người đăng, hoặc nếu đó là mẩu tin của chính bạn thì đến người đang giúp bạn. Trò chuyện cố ý bắt đầu từ một mẩu tin — như vậy việc nhắn tin luôn gắn với chuyện giúp đỡ có thật, chứ không phải bắt chuyện với người dưng. Mở Tin nhắn trên thanh điều hướng để xem tất cả các cuộc trò chuyện và tìm trong đó.",
          "Tin nhắn được mã hóa đầu cuối và đi thẳng từ thiết bị này sang thiết bị kia. Chỉ bạn và người bạn đang viết cho mới đọc được — node của cộng đồng chuyển chúng đi nhưng không nhìn được vào bên trong.",
          "Ở đây cố ý không có báo đã xem và cũng không có báo đang gõ. Không ai thấy được bạn đã đọc một tin nhắn lúc nào (hay có đọc hay chưa), và không ai ngồi nhìn bạn soạn câu trả lời. Đọc lúc nào bạn đọc, trả lời khi bạn còn sức — kiểu nào thì ứng dụng cũng không mách lại."
        ]
      },
      {
        "id": "voice-notes",
        "question": "Đoạn ghi âm hoạt động thế nào? Micro của tôi không chạy.",
        "answer": [
          "Trong một cuộc trò chuyện, nút micro nằm ngay trong khung soạn tin khi khung còn trống — bắt đầu gõ thì nó đổi thành Gửi; xóa hết chữ thì micro quay lại. Chạm vào nó để thu một đoạn ghi âm dài tối đa 45 giây, nghe lại trước khi có gì gửi đi, và chỉ gửi khi bạn thấy ưng. Đoạn ghi âm được niêm phong đầu cuối y như tin nhắn gõ tay — chỉ bạn và người bạn đang trò chuyện mới nghe được.",
          "Ghi âm gắn vào mẩu tin trên Bảng tin thì khác. Mẩu tin trên bảng tin là nội dung chung của cộng đồng, nên đoạn ghi âm bạn đính vào một mẩu tin thì cả cộng đồng đều nghe được — đúng những người sẽ đọc phần chữ bạn viết ở đó.",
          "Nếu micro không chịu chạy: trình duyệt hoặc điện thoại của bạn sẽ xin quyền trong lần thu đầu tiên. Nếu lần đó bị từ chối — kể cả lỡ tay — thì việc thu âm vẫn bị chặn cho đến khi bạn cho phép trang này dùng micro trong cài đặt trình duyệt hoặc điện thoại. Khi đã cho phép rồi, quay lại và thử lại nhé."
        ]
      },
      {
        "id": "someone-bothering-me",
        "question": "Nếu có người làm phiền tôi thì sao?",
        "answer": [
          "Bạn có thể chặn người này. Mở cuộc trò chuyện với họ và chọn Chặn liên hệ trong menu ở phía trên, hoặc dùng lựa chọn chặn trên trang thành viên của họ.",
          "Chặn có hiệu lực ngay và là chuyện riêng của bạn. Bạn thôi thấy mẩu tin, sự kiện, bình luận và tin nhắn của người này, và từ đó hai bên không còn nhắn tin, bảo đảm, nhận việc của nhau hay mời nhau được nữa. Người kia không được báo — không có thông báo nào, không có dấu gì trên hồ sơ của họ, không có gì để ai khác nhìn thấy.",
          "Chặn KHÔNG phải là gửi một lời phàn nàn. Không người kiểm duyệt nào được báo, không bất đồng nào được mở, và những trao đổi đã qua vẫn nguyên như cũ. Nếu bạn muốn cộng đồng góp tiếng, hãy mở một bất đồng từ Hồ sơ → Bất đồng — chặn và bất đồng đi cùng nhau vẫn ổn. Chặn cho bạn sự yên tĩnh ngay lúc này; bất đồng đi theo quy trình của cộng đồng với nhịp riêng của nó.",
          "Bạn có thể xem lại, sửa hoặc bỏ chặn bất cứ lúc nào trong Cài đặt → Liên hệ đã chặn."
        ]
      }
    ]
  },
  {
    "id": "events",
    "title": "Sự kiện và lịch",
    "entries": [
      {
        "id": "community-events",
        "question": "Sự kiện của cộng đồng hoạt động thế nào?",
        "answer": [
          "Ai cũng tạo được sự kiện: mở Lịch và chạm nút +. Cho nó một giờ, một địa điểm và một phần mô tả, rồi nó hiện lên lịch chung của cộng đồng cho mọi người thấy.",
          "Chạm vào một sự kiện để xác nhận tham dự — Sẽ đến, Có thể, hoặc Không đến. Xác nhận tham dự của bạn ở lại trên node của cộng đồng này: người tổ chức và những người đã xác nhận tham dự thấy được tên bạn, thành viên chưa xác nhận thì chỉ thấy con số, còn các cộng đồng kết nghĩa thì không bao giờ thấy xác nhận tham dự của bạn. Nếu bạn đổi câu trả lời thành “Không đến”, tên bạn rời khỏi danh sách ngay.",
          "Có sự kiện còn chia thành ca — những khoảng giờ mà người tổ chức cần đủ một số người nhất định, như tổ dựng dọn hay nhóm thay phiên phục vụ. Ghi tên vào một ca cũng đồng thời đặt xác nhận tham dự của bạn thành “Sẽ đến”. Danh sách ca hoạt động giống danh sách xác nhận tham dự: nó ở lại trên node của cộng đồng này, và đổi câu trả lời thành “Không đến” cũng gỡ tên bạn khỏi mọi ca.",
          "Sự kiện không sửa được sau khi đã tạo — một sự kiện đã ký vẫn đúng là điều mọi người đã gật đầu. Nếu chi tiết thay đổi, người tổ chức hủy nó và đăng một sự kiện mới. Khi một sự kiện bạn đã xác nhận tham dự bị hủy, lần tới mở ứng dụng bạn sẽ thấy một dòng báo về chuyện đó (kèm lý do của người tổ chức, nếu họ có ghi)."
        ]
      }
    ]
  },
  {
    "id": "projects",
    "title": "Dự án và việc",
    "entries": [
      {
        "id": "task-follows",
        "question": "Vì sao một việc lại ghi “Làm sau: …”?",
        "answer": [
          "Các việc trong một dự án có thể xếp theo thứ tự trước sau. “Làm sau” nghĩa là việc này tự nhiên đến sau một việc khác — đổ móng xong rồi mới dựng khung tường. Không có gì bị kẹt và cũng không ai chắn đường ai; đó chỉ là một thứ tự thôi.",
          "Bạn vẫn nhận được một việc làm sau bất cứ lúc nào bạn muốn. Khác biệt duy nhất là ứng dụng cố ý chưa hỏi han bạn về việc đó cho đến khi việc đứng trước hoàn tất — hỏi xem việc tới đâu rồi cũng chẳng để làm gì khi phần nền nó dựa vào còn chưa có. Ứng dụng chờ cùng bạn, chứ không phải chờ ở bạn."
        ]
      }
    ]
  }
];
