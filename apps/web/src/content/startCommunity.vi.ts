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
import type { StartCommunityGuide } from "./startCommunity";

// Vietnamese mirror of content/startCommunity.ts. Same step ids, same
// paragraph counts, and BYTE-IDENTICAL code blocks (commands don't
// translate) — startCommunity.parity.test.ts enforces all three.
export const START_COMMUNITY_VI: StartCommunityGuide = {
  "intro": [
    "Cộng đồng của bạn đang chạy Understoria. Bạn có thể mở một cộng đồng mới cho khu xóm của mình, cho chỗ làm, cho họ hàng ở bên kia thành phố — chỉ cần dùng đúng máy chủ của cộng đồng bạn. Không cần tài khoản GitHub, không cần cửa hàng ứng dụng, không bắt buộc phải có Docker, không phải xin phép ai.",
    "Chuyện này làm được vì Understoria là phần mềm tự do (giấy phép AGPL) và mọi máy chủ đều tự cung cấp mã nguồn của mình — đúng đoạn mã nó đang chạy. Đó không phải là một sự tử tế: giấy phép bắt buộc như vậy, và ứng dụng dựng sẵn điều đó vào bên trong, để không một công ty, một nơi đặt máy chủ hay một kho mã nào có thể mãi mãi là chỗ duy nhất phần mềm này tồn tại. Mỗi cộng đồng là một hạt giống.",
    "Hướng dẫn này dành cho ai: người chịu khó làm theo từng dòng lệnh thật cẩn thận, nhưng chưa bao giờ dựng một máy chủ. Nếu hai chữ “terminal” và “câu lệnh” còn lạ với bạn, hãy làm việc này bên cạnh một thành viên đã từng làm — dù sao thì hiểu biết kiểu này vốn được truyền đi theo cách đó."
  ],
  "steps": [
    {
      "id": "what-you-need",
      "title": "1. Bạn cần những gì",
      "paragraphs": [
        "Một chiếc máy tính có cửa sổ dòng lệnh (terminal) — các lệnh bên dưới viết cho Linux hoặc Mac; một chiếc Raspberry Pi cũng chạy được. Khoảng 15 phút để thử ứng dụng ngay trên máy của bạn. Dựng một máy chủ thật cho thành viên thì mất cả buổi chiều và cần một tên miền cùng một máy chủ nhỏ — mọi thứ đó đều có trong các cẩm nang nằm sẵn trong bản tải về."
      ]
    },
    {
      "id": "get-the-software",
      "title": "2. Lấy phần mềm về",
      "paragraphs": [
        "Cách dễ nhất: ngay tại cộng đồng của trang này — hoặc bất kỳ cộng đồng Understoria nào bạn vào được — mở Menu (góc trên bên phải) → Hạ tầng của cộng đồng → thẻ có tên “Chính phần mềm này”. Tải về CẢ HAI tệp: tệp nén mã nguồn và mã kiểm tra (checksum). Để chúng trong cùng một thư mục.",
        "Cách làm bằng dòng lệnh (thay địa chỉ bằng địa chỉ cộng đồng của bạn):",
        "Một số máy chủ còn cung cấp “gói trọn lịch sử”. Gói này nặng hơn, và nếu máy bạn đã có git thì đây là bản đáng tải hơn: bạn có trọn lịch sử phát triển và về sau kéo bản cập nhật như bình thường. Nếu lấy gói này, hãy mở nó bằng git thay vì tar:"
      ],
      "code": [
        "mkdir understoria-download && cd understoria-download\ncurl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\ncurl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\ngit clone understoria.bundle understoria"
      ]
    },
    {
      "id": "verify",
      "title": "3. Kiểm lại thứ bạn vừa tải về",
      "paragraphs": [
        "Mã kiểm tra (checksum) là một dấu vân tay tính ra từ đúng từng byte của tệp. Chỉ cần một byte đổi khác trên đường tới bạn — mạng chập chờn, bản tải đứt giữa chừng — là dấu vân tay đổi hẳn. Hãy kiểm trước khi dựng bất cứ thứ gì. Cái bạn muốn thấy là chữ “OK”. Thấy bất cứ thứ gì khác: xóa đi và tải lại.",
        "Hãy thành thật với chính mình về điều này chứng minh được gì: mã kiểm tra đến từ cùng một máy chủ với tệp, nên nó chứng minh bản tải về còn nguyên vẹn — chứ không chứng minh được là không ai sửa mã nguồn ngay trên máy chủ đó. Sự tin cậy ấy thì ngày nào bạn cũng đang trao cho người vận hành của mình rồi (chính họ đang chạy ứng dụng này cho bạn dùng). Muốn có một xác nhận độc lập, hãy lấy mã kiểm tra của một cộng đồng thứ hai cho cùng phiên bản rồi so — phải hai người vận hành bắt tay nhau mới qua mặt được phép so đó.",
        "Rồi giải nén. Tệp nén sẽ bung ra ngay trong thư mục hiện tại, nên hãy tạo một thư mục trước:"
      ],
      "code": [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "try-it",
      "title": "4. Thử trước khi quyết làm thật",
      "paragraphs": [
        "Bạn có thể chạy trọn ứng dụng ngay trên máy mình và đi hết một lượt trao đổi thật từ đầu đến cuối. Thư mục bạn vừa giải nén chứa mọi cẩm nang của dự án, nằm trong thư mục docs — mở docs/quickstart.md bằng bất kỳ trình soạn thảo văn bản nào rồi làm theo từ bước đầu tiên. Chỗ nào bảo clone kho mã về thì bỏ qua: bạn đang ngồi sẵn trong thư mục mã nguồn rồi.",
        "Việc này đáng làm ngay cả khi bạn đã chắc bụng. Bạn sẽ tự đi qua vòng chào mừng, đăng một việc cần giúp lên bảng tin, rồi xác nhận một trao đổi — để đến khi người thành viên thật đầu tiên của bạn mắc ở đâu đó, bạn đã từng nhìn thấy đúng màn hình ấy rồi."
      ]
    },
    {
      "id": "deploy",
      "title": "5. Dựng nó lên cho cộng đồng của bạn",
      "paragraphs": [
        "Các cẩm nang đầy đủ về máy chủ nằm trong chính thư mục docs đó, viết ra đúng cho lúc này. Chọn theo cách bạn muốn chạy: docs/deploy-linode.md (Docker trên một máy chủ nhỏ cỡ năm đô la — con đường nhiều người đi nhất, gần như tự động hết nhờ một script cài đặt) hoặc docs/deploy-alternatives.md (Podman, hoặc Linux trần không container gì cả — dáng hợp với máy móc được cho tặng).",
        "Có một chỗ bạn phải tự đổi khi đọc, vì cả hai cẩm nang đều mở đầu bằng việc clone từ kho mã công khai: chỗ nào cẩm nang bảo clone vào một thư mục trên máy chủ, thì thay vào đó hãy chép tệp nén đã kiểm của bạn lên đó rồi giải nén. Mọi phần còn lại — khóa hệ thống, tệp cấu hình, các khóa sáng lập, bản sao lưu, danh sách kiểm “trước khi mở ra cho mọi người” — đều dùng nguyên như vậy.",
        "Về sau muốn cập nhật mà không có git: tải tệp nén mới hơn từ bất kỳ máy chủ nào đang chạy phiên bản mới hơn, kiểm lại y như vậy, giải nén vào một thư mục mới tinh, mang tệp cấu hình của bạn sang, rồi triển khai lại. Dữ liệu của cộng đồng bạn vẫn nguyên vẹn suốt quá trình này — nó không bao giờ nằm trong thư mục mã nguồn."
      ],
      "code": [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\nssh root@YOUR-SERVER\ncd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n  && tar -xzf understoria-source.tar.gz -C understoria\ncd understoria"
      ]
    },
    {
      "id": "seed",
      "title": "6. Giờ bạn cũng là một hạt giống",
      "paragraphs": [
        "Ngay khi máy chủ của bạn chạy lên, nó cũng tự cung cấp mã nguồn CỦA CHÍNH NÓ y như vậy — tự động, từ đúng bản dựng đó. Thành viên của bạn kiểm được thứ họ đang dùng, và khu xóm kế tiếp có thể khởi đi từ bạn, đúng như bạn vừa khởi đi từ cộng đồng của mình. Không một điểm đơn lẻ nào — không phải GitHub, không phải những người viết ra dự án, cũng không phải bất kỳ người vận hành nào — có thể lấy phần mềm này khỏi tay tất cả mọi người cùng một lúc.",
        "Hai thói quen giữ cho sợi dây này bền: thỉnh thoảng triển khai lại (máy chủ của bạn cung cấp mã nguồn của đúng thứ nó đang chạy, nên chạy bản mới nghĩa là gieo đi bản mới), và biết máy chủ của một cộng đồng thứ hai — phép so hai máy chủ ở trên chỉ chạy được khi các cộng đồng gọi được tên nhau."
      ]
    }
  ],
  "closing": [
    "Những câu hỏi trang này chưa trả lời thì nằm trong thư mục docs của bản tải về — docs/bootstrap-from-a-node.md chính là hướng dẫn này nhưng kỹ hơn, còn docs/operator-guide.md là cẩm nang hằng ngày cho người giữ cho máy chủ luôn chạy."
  ]
};
