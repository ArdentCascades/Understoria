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
// Vietnamese project templates (i18n Phase 2). Loaded lazily via
// content/bundles/vi.ts — never import this statically from app
// code.
import type { ProjectTemplate } from "./projectTemplates";

export const PROJECT_TEMPLATES_VI: readonly ProjectTemplate[] = [
  {
    "id": "community-fridge",
    "name": "Tủ lạnh cộng đồng & kệ thực phẩm miễn phí",
    "purpose": "Mở suốt ngày đêm để ai cũng lấy được thức ăn và đồ thiết yếu miễn phí, không cần hỏi han gì.",
    "whoItServes": "Bất cứ ai cần thức ăn; đặc biệt hợp với người làm giờ giấc thất thường, hàng xóm chưa có giấy tờ, và những người không tới được ngân hàng thực phẩm trong giờ hành chính.",
    "whatYoullNeed": "Một chiếc tủ lạnh được tặng, một góc ngoài trời có mái che và ổ điện, một nơi cho đặt nhờ, và một lịch thay phiên dọn dẹp nho nhỏ.",
    "setupHours": 18,
    "defaultCategory": "food",
    "firstSteps": "Bắt đầu từ nơi cho đặt nhờ, đừng bắt đầu từ chiếc tủ. Ngồi xuống với chủ tiệm, nhà thờ hay phòng khám bạn đang nhắm tới và nói cho hết những phần không hào nhoáng — tiền điện, chuyện gì xảy ra khi có người bày bừa, gọi ai khi tủ hỏng — trước khi đi kiếm bất kỳ chiếc tủ nào. Nhân tiện, hỏi các điểm phát thực phẩm và nhóm tương trợ đang làm gần đó xem họ thấy còn thiếu chỗ nào, để chiếc tủ lấp vào đúng chỗ trống ấy thay vì làm trùng.",
    "commonPitfalls": "Tủ lạnh cộng đồng gần như không bao giờ chết vì thiếu đồ quyên tặng — chúng chết khi không ai rõ ràng nhận phần dọn dẹp, tủ trở nên nhem nhuốc, rồi chủ chỗ lặng lẽ xin dẹp đi. Hãy ghi tên người vào lịch thay phiên trước ngày mở cửa, và hãy coi mối quan hệ với nơi cho đặt nhờ mới là thứ bạn đang giữ gìn, chứ không chỉ cái tủ.",
    "pairsWith": [
      "gleaning-network",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Tìm một nơi cho đặt nhờ có điện và có người qua lại",
        "description": "Hỏi các cửa tiệm nhỏ, nhà thờ, phòng khám hay nhà văn hóa. Hỏi xem họ có cho đặt một chiếc tủ lạnh dưới mái hiên và cắm điện nhờ không (tiền điện thường chỉ vài đô la một tháng — hãy ngỏ ý trả phần đó). Xin một cái gật đầu bằng giấy trắng mực đen, dù thật đơn giản.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Kiếm một chiếc tủ lạnh và dựng mái che mưa nắng",
        "description": "Đăng lời nhắn tìm một chiếc tủ lạnh còn chạy tốt lên các nhóm ở địa phương. Đóng hoặc mua một cái tủ gỗ hay mái che đơn giản bao quanh để tránh mưa nắng. Neo chắc lại để tủ không đổ. Gồm cả việc tìm, chở về và dựng.",
        "hours": 8,
        "skills": [
          "mộc",
          "lái xe"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Đặt ra vài quy ước chung và dán nhãn mọi thứ",
        "description": "Dán một tấm bảng rõ ràng, nhiều thứ tiếng: lấy thứ bạn cần, để lại thứ bạn có thể, không nhận đồ hết hạn, đồ tự đóng hộp tại nhà hay thịt sống. Thêm nhãn dán và một cây bút để mọi người ghi ngày lên món đồ.",
        "hours": 1.5,
        "skills": [
          "viết lách",
          "dịch thuật"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Lập lịch thay phiên dọn dẹp và bổ sung đồ",
        "description": "Làm một lịch tuần dùng chung. Mỗi ca chừng 15 phút: lau các mặt kệ, bỏ đi thứ đã hỏng hay quá hạn, và ghi lại thứ gì sắp hết. Để sẵn đồ lau dọn ngay tại chỗ.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "tổ chức"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Gây dựng mối lấy đồ đều đặn",
        "description": "Hỏi các tiệm bánh, cửa hàng thực phẩm, quán ăn và chợ nông sản xem cuối ngày có thể tặng lại đều đặn không. Sắp xếp một người đi lấy. Ghi lại mối nào đáng tin.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Lập một đầu mối khi có sự cố",
        "description": "Ghi một số điện thoại hoặc một địa chỉ email lên tủ cho những tin nhắn kiểu “tủ hỏng / mất điện / có câu hỏi”. Quyết định ai trả lời và trả lời nhanh cỡ nào.",
        "hours": 0.5
      }
    ]
  },
  {
    "id": "community-garden",
    "name": "Vườn cộng đồng / mảnh đất trồng chung",
    "purpose": "Cùng nhau trồng rau trái tươi miễn phí và tạo ra một chỗ để mọi người gặp gỡ.",
    "whoItServes": "Hàng xóm không có mảnh sân nào, người đang chật vật với giá thực phẩm, và bất cứ ai muốn có sự gắn bó cùng một lý do để ra ngoài trời.",
    "whatYoullNeed": "Một mảnh đất (kể cả đất trống bỏ không hay sân thượng), đất trồng hoặc luống, chỗ lấy nước, hạt giống, và một nhóm nòng cốt 5–10 người đi đều.",
    "setupHours": 25,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Trước khi động tới đất, hãy nói chuyện với hai nhóm người: ai là chủ mảnh đất, và những hàng xóm sống ngay sát bên — cái gật đầu của họ nặng ngang tờ giấy cho thuê. Rồi tập hợp nhóm nòng cốt và bàn sớm chuyện chia sẻ ra sao; biết đây là luống riêng từng người hay thu hoạch chung sẽ đổi hết mọi thứ bạn sắp dựng lên.",
    "commonPitfalls": "Vườn thường không chết vào mùa xuân — chúng chết vào những tuần nóng nhất, khi lịch thay phiên tưới nước lặng lẽ đổ vỡ và các luống cháy vàng. Kẻ giết chậm còn lại là một người coi đây là vườn của riêng mình với vài người phụ; hãy viết ra cách cả nhóm ra quyết định khi mọi người còn đang quý nhau.",
    "pairsWith": [
      "seed-library",
      "community-composting",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Có được mảnh đất và lời cho phép",
        "description": "Tìm một mảnh đất trống, sân nhà thờ, sân trường hay một góc công viên không ai dùng. Tìm ra ai là chủ (hồ sơ đất đai của thành phố, hoặc cứ hỏi thẳng). Xin một giấy cho phép hay hợp đồng thuê bằng văn bản, dù chỉ là một cái bắt tay viết ra giấy cho một năm, và hỏi cho chắc là có chỗ lấy nước.",
        "hours": 6,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Thử đất và vẽ sơ đồ luống",
        "description": "Gửi một mẫu đất đi thử với chi phí rẻ ở trạm khuyến nông gần nhà để loại trừ chì và các chất độc. Nếu đất xấu, hãy tính làm luống nổi với đất sạch. Vẽ phác chỗ nào là luống, chỗ nào là lối đi, và góc để dụng cụ.",
        "hours": 2,
        "skills": [
          "làm vườn"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Gom vật liệu và bắt tay dựng vườn",
        "description": "Gom gỗ, hoặc dùng luống kiện rơm hay luống lỗ khóa, thêm phân ủ và lớp phủ gốc. Tổ chức một ngày chung tay dựng vườn; đông tay thì luống lên rất nhanh. Lắp một vòi nước hoặc mấy thùng hứng nước mưa.",
        "hours": 10,
        "skills": [
          "mộc"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Thống nhất cách chia sẻ vườn",
        "description": "Cả nhóm cùng thống nhất: luống riêng từng người, thu hoạch chung hoàn toàn, hay pha cả hai. Viết ra cách chia rau trái và cách cả nhóm ra quyết định.",
        "hours": 1,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Trồng theo khí hậu và mùa nơi bạn ở",
        "description": "Chọn những cây dễ trồng, cho nhiều rau trái ở vùng bạn (rau lá, đậu, bí, cà chua, rau thơm). Gieo lệch nhau để không thu hoạch dồn một lúc. Cắm nhãn cho từng luống.",
        "hours": 4,
        "recurringCadence": "cycle",
        "skills": [
          "làm vườn"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Lập lịch thay phiên tưới nước và nhổ cỏ",
        "description": "Cây chết vì bị bỏ bê nhiều hơn vì bất cứ lý do nào khác. Làm một lịch dùng chung thật đơn giản; gắn mỗi việc với một lời nhắc dễ nhớ. Giữ cho nhẹ nhàng để không ai đuối sức.",
        "hours": 1,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Tính trước chuyện thu hoạch và phần dư",
        "description": "Chọn ngày thu hoạch. Đưa rau trái dư sang tủ lạnh cộng đồng, cho hàng xóm, hoặc bày ra một sạp miễn phí ngay cổng. Giữ lại một ít hạt giống cho năm sau.",
        "hours": 1,
        "recurringCadence": "cycle",
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "tool-lending-library",
    "name": "Thư viện cho mượn đồ nghề và thiết bị",
    "purpose": "Để hàng xóm mượn đồ nghề và thiết bị thay vì phải mua, vừa đỡ tốn tiền vừa bớt lãng phí.",
    "whoItServes": "Người đi thuê nhà, người vừa mua nhà, người có thú vui tay chân, và bất cứ ai thỉnh thoảng sửa chữa hay làm một dự án nào đó.",
    "whatYoullNeed": "Chỗ cất đồ, đồ nghề được tặng, một cách ghi mượn trả đơn giản, và vài “người trực thư viện”.",
    "setupHours": 20,
    "defaultCategory": "infrastructure",
    "firstSteps": "Trước khi gom lấy một cái khoan, hãy nói chuyện với người cho mượn chỗ về việc sống chung với một thư viện đồ nghề thật ra là như thế nào — tiếng ồn, đồ đạc cứ dồn thêm, người lạ tới cửa trong giờ mở. Rồi hỏi hàng xóm xem họ thật sự sẽ mượn gì; một danh sách mười món có người hỏi còn hơn cả một nhà kho đầy đồ tặng chẳng ai cần.",
    "commonPitfalls": "Thư viện đồ nghề chết vì sự im lặng sau ngày hẹn trả: không ai nhắc, đồ nghề trôi thành mượn vĩnh viễn, và các kệ trống dần. Một thói quen nhắc nhở nhẹ nhàng quan trọng hơn một quy định phạt trễ nghiêm khắc — và hãy sẵn sàng từ chối đồ tặng, không thì bạn thành bãi đổ đồ hỏng của cả khu.",
    "pairsWith": [
      "library-of-things",
      "repair-cafe",
      "weatherization-brigade"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Tìm chỗ cất đồ và định giờ mở cửa",
        "description": "Một cái kho nhỏ, nhà để xe, một cái tủ ở nhà văn hóa hay một thùng container đều được. Chọn 2–4 giờ mở cố định mỗi tuần để mọi người biết khi nào ghé.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Gom và phân loại kho đồ",
        "description": "Đăng lời kêu gọi tặng đồ (nhà nào cũng có khoan và thang dư ra). Lau sạch, thử chạy và dán nhãn từng món. Bỏ đi hoặc sửa lại bất cứ thứ gì không an toàn.",
        "hours": 6,
        "skills": [
          "lái xe"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Lập sổ kê từng món",
        "description": "Dùng một bảng tính miễn phí hoặc một ứng dụng cho mượn đồ. Ghi lại từng món, tình trạng của nó, kèm một tấm ảnh. Đánh số từng món cho dễ theo dõi.",
        "hours": 4,
        "skills": [
          "nhập liệu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Viết ra quy ước mượn đồ",
        "description": "Định thời hạn mượn (ví dụ một tuần), mượn được mấy món cùng lúc, và cách trả cùng chuyện trễ hẹn. Giữ cho rộng lượng — chuyện này là ở lòng tin. Ghi chú món nào cần dặn dò về an toàn trước khi mượn.",
        "hours": 1,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Dựng cách ghi mượn đồ",
        "description": "Một cái kẹp giấy hay một tờ mẫu đơn giản: tên, cách liên lạc, món, ngày mượn, ngày hẹn trả. Chụp nhanh một tấm ảnh tình trạng món đồ lúc giao để khỏi tranh cãi về sau.",
        "hours": 2,
        "skills": [
          "nhập liệu"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Chỉ việc cho những người trực thư viện",
        "description": "Dẫn những người góp một tay đi qua sổ kê, các bước cho mượn, và an toàn cơ bản (kính bảo hộ, cách dùng thang). Để sẵn một tờ giấy tóm tắt ngay ở bàn.",
        "hours": 2,
        "skills": [
          "dạy học"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Giữ gìn và mở rộng dần",
        "description": "Kiểm tra đồ nghề khi nhận về, mài và tra dầu đều đặn, và ghi lại món nào hay được hỏi nhất để biết nên bổ sung gì tiếp theo.",
        "hours": 2,
        "skills": [
          "sửa đồ nghề"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "neighborhood-care-network",
    "name": "Mạng lưới hàng xóm chăm sóc nhau",
    "purpose": "Giữ cho những hàng xóm sống lẻ loi luôn có người ghé hỏi thăm, có người trò chuyện và có người bên cạnh.",
    "whoItServes": "Người cao tuổi, hàng xóm khuyết tật hay bệnh mạn tính, cha mẹ vừa có con nhỏ, và bất cứ ai đang sống một mình.",
    "whatYoullNeed": "Một danh sách người góp một tay, một cách ghép họ với hàng xóm, và một nếp hỏi thăm đều đặn. Những người góp tay là hàng xóm, không phải người làm nghề chăm sóc — hãy hỏi kỹ về bất cứ ai tới thăm tận nhà, đừng bao giờ để một người tự mình cầm tiền giúp hàng xóm, và thống nhất trước khi nào thì gọi cho gia đình hay gọi cấp cứu.",
    "setupHours": 18,
    "defaultCategory": "emotional_support",
    "firstSteps": "Hãy bắt đầu bằng việc lắng nghe, đừng bắt đầu bằng việc đi tìm người: nói chuyện với chính những hàng xóm bạn mong đỡ đần xem họ thật sự muốn gì — một cuộc gọi mỗi tuần, một chuyến xe, hay chỉ là có người bầu bạn — vì một mạng lưới dựng trên phỏng đoán sẽ giống như bị dò xét. Cùng lúc đó, hãy nói thẳng thắn với những người góp tay đầu tiên về chuyện hỏi kỹ và về ranh giới, để khi cặp ghép đầu tiên diễn ra, các quy ước đọc ra thành sự quan tâm chứ không phải sự nghi ngờ.",
    "commonPitfalls": "Mạng lưới chăm sóc hiếm khi hỏng vì thiếu người — chúng vắt kiệt ba người luôn miệng nhận lời trong khi những người còn lại chờ được nhờ tới. Hãy cố ý rải các cặp ghép ra, vẫn giữ buổi ngồi lại với những người góp tay ngay cả khi mọi thứ có vẻ ổn, và đừng để việc hỏi thăm biến một người hàng xóm thành một hồ sơ.",
    "pairsWith": [
      "rides-transportation",
      "disability-support-network",
      "welcome-wagon"
    ],
    "learnMore": [
      "message-someone"
    ],
    "tasks": [
      {
        "name": "Nắm xem quanh mình có những ai",
        "description": "Lặng lẽ nhận ra những hàng xóm có thể đang sống lẻ loi, qua lời truyền tai, ban quản lý tòa nhà, phòng khám và các nhóm tín ngưỡng. Đừng bao giờ mặc định là người ta cần giúp — hãy mở lời mời, đừng chỉ mặt ai ra.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Tìm người góp một tay và hỏi cho kỹ",
        "description": "Tìm những người có thể giữ liên lạc đều đặn. Với bất cứ ai tới thăm tận nhà hay giúp người lớn tuổi dễ tổn thương, hãy hỏi vài người quen biết về họ, và đừng bao giờ để một người tự mình cầm tiền giúp hàng xóm.",
        "hours": 5,
        "skills": [
          "kết nối",
          "phỏng vấn"
        ]
      },
      {
        "name": "Ghép cặp cho hợp",
        "description": "Ghép theo tiếng nói chung, khoảng cách gần và mức thoải mái. Hỏi cả hai phía xem họ muốn gì — một cuộc gọi mỗi tuần, một chuyến đi chợ, hay ngồi trò chuyện ngoài hiên — và tôn trọng đúng ranh giới đó.",
        "hours": 2,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Đặt một nhịp hỏi thăm",
        "description": "Thống nhất bao lâu một lần và bằng cách nào (gọi điện, nhắn tin, gõ cửa). Đưa cho người góp tay một đoạn lời ngắn cho lần liên lạc đầu, để nghe ấm áp chứ không khô khan.",
        "hours": 1,
        "follows": [
          2
        ]
      },
      {
        "name": "Vạch sẵn cách xử lý khi có chuyện",
        "description": "Quyết định trước phải làm gì nếu ai đó không trả lời hay có vẻ đang gặp khủng hoảng: gọi cho ai, khi nào thì báo gia đình hay gọi cấp cứu, và ghi lại ra sao. Viết ra giấy và giữ cho thật gọn.",
        "hours": 2,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Sắp xếp những giúp đỡ thiết thực",
        "description": "Ghi lại những việc lặp đi lặp lại — chở đi khám, lấy thuốc theo toa, xúc tuyết — rồi nối chúng với những người góp tay khác hoặc các dự án khác trong nhóm của bạn.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Đừng quên đỡ đần chính những người góp tay",
        "description": "Tổ chức một buổi ngồi lại để họ trút bớt. Việc chăm sóc bào mòn con người; hãy đổi việc cho nhau và để ý dấu hiệu đuối sức.",
        "hours": 2,
        "skills": [
          "điều phối"
        ],
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "emergency-preparedness",
    "name": "Mạng lưới phòng bị trước thiên tai và tình huống khẩn cấp",
    "purpose": "Giúp cả khu phố chuẩn bị và ứng phó với thiên tai (nắng nóng, bão, lụt, mất điện) khi cứu trợ chính thức tới chậm.",
    "whoItServes": "Tất cả mọi người, ưu tiên những ai khó rời nhà hoặc phải dựa vào điện cho thiết bị y tế.",
    "whatYoullNeed": "Một danh sách liên lạc, một điểm hẹn, ít đồ dự phòng cơ bản, và một cách liên lạc chạy được khi không có mạng. Mạng lưới này đi cùng với lực lượng cứu hộ chính thức — nó không thay thế họ. Khi có nguy hiểm tới tính mạng, hãy luôn gọi cấp cứu trước.",
    "setupHours": 30,
    "defaultCategory": "organizing",
    "firstSteps": "Hãy dựng kế hoạch quanh chính những người nó dành cho: gõ cửa nhà những hàng xóm phải thở oxy, phải giữ lạnh thuốc men, hay ở tầng cao mà không có thang máy, rồi hỏi họ một tuần tồi tệ sẽ ra sao với họ. Sau đó nói chuyện với người quản chỗ mà bạn định làm điểm an toàn, và với bất kỳ nhóm ứng phó nào đã có sẵn (đội phòng chống thiên tai, lực lượng cứu hỏa) để mạng lưới của bạn lấp vào những chỗ trống quanh ứng phó chính thức, thay vì làm trùng.",
    "commonPitfalls": "Những mạng lưới này không hỏng lúc thiên tai ập tới — chúng hỏng trong những năm yên ả trước đó, khi cây liên lạc cũ đi, số điện thoại đổi, và bản kế hoạch chỉ nằm trên máy tính của một người. Hãy in hết ra, làm mới danh sách theo một nhịp đã ghi lên lịch, và diễn tập ít nhất một lần; lần dùng thật đầu tiên không bao giờ nên là lần dùng đầu tiên.",
    "pairsWith": [
      "cooling-warming-center",
      "community-first-aid-training",
      "community-wifi-mesh"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Vẽ ra những rủi ro của khu phố mình",
        "description": "Liệt kê những thiên tai dễ xảy ra nhất ở chỗ bạn. Ghi lại các điểm dễ tổn thương: người ở tầng cao không có thang máy, người phải thở oxy hay giữ lạnh thuốc men, những tòa nhà chỉ có một lối ra.",
        "hours": 4
      },
      {
        "name": "Dựng một cây liên lạc",
        "description": "Thu thập thông tin liên lạc của những ai đồng ý, theo từng khu phố. Chọn ra vài “người phụ trách khu phố”, mỗi người ngó chừng chừng 10 hộ. Giữ một bản trên giấy — điện thoại và mạng đều hỏng trong thiên tai.",
        "hours": 8,
        "skills": [
          "kết nối",
          "nhập liệu"
        ]
      },
      {
        "name": "Tính cách liên lạc khi mất mạng",
        "description": "Quyết định cách gọi nhau khi không có sóng: gõ cửa, một điểm hẹn, còi, hay bộ đàm. In bản kế hoạch ra và phát cho mọi người.",
        "hours": 3,
        "skills": [
          "viết lách"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Gom sẵn đồ dùng chung",
        "description": "Chuẩn bị một túi đồ chung: nước, đồ sơ cứu, đèn pin, pin, một cái đài chạy pin hoặc quay tay, chăn, và vài dụng cụ cơ bản. Cất ở nơi vài người cùng lấy được.",
        "hours": 5,
        "skills": [
          "lái xe"
        ]
      },
      {
        "name": "Tìm ra những điểm an toàn",
        "description": "Tìm những chỗ có thể làm nơi tránh nóng, tránh rét hay chỗ sạc điện (một hội trường có máy phát, một công viên nhiều bóng mát). Hỏi trước cho chắc là vào được.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Tổ chức một buổi diễn tập hoặc một tối chỉ dẫn",
        "description": "Tổ chức một buổi về túi đồ mang theo khi phải đi gấp, cách khóa điện nước gas, và cây liên lạc. Tập một lần để lúc thật sự có chuyện không phải vừa làm vừa học.",
        "hours": 5,
        "skills": [
          "dạy học",
          "điều phối"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Phân vai sẵn cho “ngày có chuyện”",
        "description": "Giao trước ai đi xem những người yếu về sức khỏe đầu tiên, ai mở điểm an toàn, và ai điều phối. Xem lại và cập nhật kế hoạch hai lần mỗi năm.",
        "hours": 2,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "free-store",
    "name": "Cửa hàng miễn phí / đổi đồ",
    "purpose": "Chuyển quần áo, đồ dùng trong nhà và vật dụng tới tay người cần, hoàn toàn miễn phí.",
    "whoItServes": "Bất cứ ai — người đang lúc túng, người đang dọn bớt đồ trong nhà, và cả môi trường.",
    "whatYoullNeed": "Một chỗ (dù chỉ dựng tạm), bàn hoặc giá treo, vài người góp tay phân loại, và một lịch mở đều đặn.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Hãy nói trước với chủ chỗ về những chuyện thật lòng — đống đồ tặng, người ra vào, căn phòng trông thế nào vào sáng hôm sau — rồi nói với một cửa hàng đồ cũ hay một tổ chức gần đó xem thứ gì vốn đã tràn về, để biết khu mình thật sự đang thiếu gì. Nếu được, hãy dành một giờ ở một cửa hàng miễn phí đang chạy trước buổi đầu tiên của bạn; cách nhận đồ và bày đồ chép lại thì dễ hơn nhiều so với tự nghĩ ra.",
    "commonPitfalls": "Cửa hàng miễn phí chết đuối trước khi chết đói: không có một danh sách nhận / không nhận thật dứt khoát ngay ở cửa, những người góp tay sẽ dành trọn từng giờ để phân loại đồ hỏng và đồ bẩn thay vì đón tiếp mọi người. Và hãy quyết trước khi buổi đầu tiên khép lại: đồ còn thừa sẽ đi đâu — một đống đồ không ai lấy mà chẳng có đường ra chính là cách người ta mất chỗ mượn.",
    "pairsWith": [
      "repair-cafe",
      "library-of-things",
      "mutual-aid-moving-crew"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Chọn hình thức và chỗ làm",
        "description": "Chọn giữa một cửa hàng miễn phí mở thường xuyên, một buổi dựng tạm lặp lại, hay một ngày đổi đồ duy nhất. Mượn một hội trường, một mặt bằng hay một nhà chòi trong công viên. Một ngày cố định lặp lại sẽ tạo thành thói quen.",
        "hours": 2
      },
      {
        "name": "Định rõ nhận đồ thế nào",
        "description": "Chỉ nhận đồ sạch, còn chạy tốt và còn dùng được. Dán một danh sách “nhận” và “không nhận” thật rõ (không nhận đồ điện hỏng, quần áo bẩn, đồ trẻ em đã bị thu hồi). Việc này tiết kiệm cực nhiều thời gian phân loại.",
        "hours": 0.5,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Sắp xếp việc nhận và phân loại",
        "description": "Dựng các trạm: nhận đồ, phân loại theo nhóm, và chuẩn bị để bày ra. Có sẵn hướng ra cho những món không dùng được (chuyển tặng tiếp hay đem tái chế).",
        "hours": 2,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Bày đồ để ai cũng chọn được một cách đàng hoàng",
        "description": "Treo quần áo theo cỡ, gom đồ dùng trong nhà theo nhóm, giữ mọi thứ gọn gàng và dễ chịu. Không đơn từ, không phải chứng minh gì — cứ lấy thứ bạn sẽ dùng.",
        "hours": 1.5,
        "skills": [
          "thiết kế"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Chia người trực buổi mở cửa",
        "description": "Phân người đón tiếp, người phân loại, và một người trả lời thắc mắc. Thái độ thân tình, không phán xét, chính là toàn bộ ý nghĩa của việc này.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Lo phần đồ còn thừa",
        "description": "Thu xếp trước nơi nhận những món không ai lấy sau mỗi buổi (một tổ chức bạn, một nơi tái chế vải) để chỗ mượn được trả lại sạch sẽ.",
        "hours": 1,
        "skills": [
          "lái xe"
        ]
      }
    ]
  },
  {
    "id": "skill-share",
    "name": "Chia sẻ sở trường & lớp học miễn phí",
    "purpose": "Để hàng xóm dạy nhau và học của nhau miễn phí — nấu ăn, sửa chữa, ngoại ngữ, chi tiêu, sơ cứu, việc trên máy tính điện thoại.",
    "whoItServes": "Tất cả mọi người; nhất là những ai không kham nổi học phí và những người có vốn hiểu biết ít khi được coi trọng.",
    "whatYoullNeed": "Một chỗ ngồi, những người sẵn lòng chỉ dạy, và một cách đăng lịch cho mọi người thấy.",
    "setupHours": 9,
    "defaultCategory": "education",
    "firstSteps": "Dự án này bắt đầu từ những cuộc trò chuyện hai câu hỏi, chứ không phải từ căn phòng: hỏi mọi người họ có thể chỉ cho ai đó điều gì, và họ rất muốn học điều gì, rồi để ý đặc biệt tới những hàng xóm mà vốn hiểu biết của họ ít khi được coi là chuyên môn. Việc thật sự đầu tiên của bạn là ngồi cà phê trấn an một người đang ngại, rằng buổi của họ không cần phải là một bài giảng.",
    "commonPitfalls": "Việc chia sẻ sở trường nhạt dần khi vẫn hai người tự tin ấy đứng lớp tất cả, còn lịch thì lặng lẽ uốn theo những buổi tối rảnh của người đứng ra tổ chức chứ không theo người tới học. Hãy tiếp tục mời những người lần đầu đứng lớp, hỏi xem ai còn vắng mặt trong phòng, và coi một buổi năm người là thành công, bởi đúng là như vậy.",
    "pairsWith": [
      "time-bank",
      "digital-literacy",
      "repair-cafe"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Hỏi xem mọi người có sở trường gì và muốn học gì",
        "description": "Hỏi các thành viên hai câu: bạn có thể chỉ cho người khác điều gì, và bạn rất muốn học điều gì? Gom câu trả lời vào một mẫu đơn giản. Chỗ hai câu chồng lên nhau chính là chương trình học của bạn.",
        "hours": 1.5,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Mời và chuẩn bị cho những người đứng lớp",
        "description": "Trấn an mọi người rằng “dạy” có thể rất tự nhiên. Giúp họ phác một buổi một giờ và gom đủ vật liệu. Ghép người lần đầu còn ngại với một người đứng cùng.",
        "hours": 3,
        "skills": [
          "dạy học",
          "điều phối"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tìm chỗ và giờ",
        "description": "Dùng một phòng thư viện, nhà văn hóa, công viên, hay phòng khách nhà ai đó. Chọn những khung giờ lặp lại để việc này thành nếp.",
        "hours": 1.5
      },
      {
        "name": "Dựng một cuốn lịch",
        "description": "Liệt kê các buổi kèm ngày, chủ đề, người đứng lớp, và cần mang theo gì. Đăng ở nơi mọi người vẫn hay xem. Giữ việc ghi tên thật nhẹ, hoặc cứ tới là được.",
        "hours": 1.5,
        "recurringCadence": "month",
        "skills": [
          "tổ chức"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Làm cho ai cũng tới được",
        "description": "Nghĩ tới nhu cầu về tiếng nói, chuyện trông trẻ, lối đi lại cho người khó di chuyển, và giờ giấc của những người đi làm. Hỏi người tới học xem điều gì sẽ giúp họ tới được.",
        "hours": 1.5,
        "skills": [
          "trợ năng",
          "dịch thuật"
        ]
      }
    ]
  },
  {
    "id": "bulk-buying-coop",
    "name": "Nhóm mua chung thực phẩm số lượng lớn",
    "purpose": "Gộp đơn lại để mua thực phẩm và đồ khô số lượng lớn với giá rẻ hơn.",
    "whoItServes": "Những nhà đang chật vật vì giá chợ, những gia đình đông người, và những khu phố khó tìm được chỗ mua thực phẩm.",
    "whatYoullNeed": "Một nhóm hộ gia đình gắn bó, một mối bán sỉ, một chỗ nhận và chia hàng, và một người trông coi việc đặt hàng.",
    "setupHours": 20,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Hãy tập hợp các hộ trước khi gọi cho bất kỳ nhà cung cấp nào, và nói chuyện tiền nong khó nói trước tiên: mỗi nhà kham được tới đâu, việc trả tiền diễn ra thế nào trước khi đơn được gửi đi, và bỏ lỡ một đợt thì nghĩa là gì. Một cuộc gọi với một nhóm mua chung đã chạy sẵn — phần lớn đều vui vẻ chia sẻ bảng tính lẫn những vết sẹo của họ — sẽ giúp bạn đỡ mất cả một mùa mò mẫm.",
    "commonPitfalls": "Nhóm mua chung chết vì cấn cá chuyện tiền và vì người điều phối kiệt sức: có người ứng tiền ra rồi ấm ức, một đơn hàng chưa ai trả, hoặc một người lặng lẽ gánh mọi đợt cho tới khi họ buông và mọi thứ dừng lại. Hãy thu tiền trước khi đặt hàng, không ngoại lệ, và luân phiên vai điều phối ngay từ đợt thứ hai, đừng để tới một ngày nào đó.",
    "pairsWith": [
      "community-market",
      "food-preservation"
    ],
    "tasks": [
      {
        "name": "Tập hợp nhóm mua chung của bạn",
        "description": "Rủ đủ số hộ để đạt mức tối thiểu của nhà cung cấp (thường là 8–15 hộ). Thống nhất một nhịp mua (mỗi tuần, hai tuần một lần, hay mỗi tháng).",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Tìm một mối bán sỉ",
        "description": "Liên hệ các mối bán sỉ thực phẩm, hợp tác xã nhà nông, nơi cung hàng cho quán ăn, hay các nhóm mua chung khác. So mức đặt tối thiểu, cách giao hàng và giá. Hỏi rõ họ có sẵn những món khô nào.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Dựng cách đặt hàng",
        "description": "Dùng một bảng tính hoặc mẫu dùng chung để mỗi nhà tự điền số lượng trước hạn chốt. Cử một người điều phối cộng lại và đặt đơn.",
        "hours": 3,
        "skills": [
          "nhập liệu",
          "tổ chức"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Minh bạch chuyện tiền nong",
        "description": "Thống nhất trả tiền trước (thu đủ trước khi đặt hàng để không ai phải ứng tiền túi). Ghi từng đồng vào một cuốn sổ chung. Cộng thêm một khoản đệm nhỏ tùy tâm cho hao hụt, không phải để lời.",
        "hours": 2,
        "skills": [
          "kế toán"
        ]
      },
      {
        "name": "Thu xếp giao hàng và chỗ chia hàng",
        "description": "Chọn một chỗ để nhận đơn hàng lớn — nhà để xe, hội trường, hay sân trước nhà. Sắp đủ người cho ngày dỡ hàng.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Chia hàng cho công bằng",
        "description": "Dựng các trạm chia hàng có cân cho gạo, đậu và rau trái mua xô. In sẵn danh sách của từng hộ. Kiểm lại hai lần trước khi mọi người tới lấy.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          2,
          4
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Luân phiên việc cho nhau",
        "description": "Việc điều phối, chia hàng và nhận hàng nên luân phiên để không một ai phải gánh hết. Mỗi đợt hãy xem lại giá cả và mức tin cậy của nhà cung cấp.",
        "hours": 1,
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "repair-cafe",
    "name": "Quán cà phê sửa đồ",
    "purpose": "Sửa lại đồ hỏng — quần áo, đồ điện tử, xe đạp, bàn ghế — miễn phí, thay vì vứt đi.",
    "whoItServes": "Bất cứ ai có món đồ hỏng mà không có tiền hay tay nghề để sửa; giữ những món còn dùng được khỏi bãi rác.",
    "whatYoullNeed": "Vài người khéo tay sẵn lòng góp một tay, đồ nghề cơ bản, một chỗ có bàn và có điện, và một ngày lặp lại đều đặn.",
    "setupHours": 14,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Trước hết hãy rủ cho được hai ba người sửa đồ đầu tiên — người hàng xóm biết may vá, người hay mày mò xe đạp — vì có ngày có chỗ mà thiếu họ thì cũng bằng không. Sau đó cùng họ đi một vòng chỗ định làm, bàn xem kê bàn ở đâu, lấy điện chỗ nào, đủ sáng chưa; và nếu vùng lân cận có quán sửa đồ nào đang chạy, hãy ghé xem một buổi — cách họ tiếp nhận đồ là thứ đáng học nhất.",
    "commonPitfalls": "Quán sửa đồ rất dễ lặng lẽ biến thành tiệm sửa miễn phí: người ta bỏ đồ lại rồi đi, người sửa thành thợ không công, và người rành đồ điện tử kiệt sức trước tiên. Hãy giữ đúng nếp: ai mang đồ tới thì ngồi lại cùng sửa món của mình; và ghi rõ ngay từ đầu rằng có những món không cứu được — nói trước để mọi người hụt hẫng còn dễ chịu hơn bị trách sau.",
    "pairsWith": [
      "tool-lending-library",
      "community-bike-workshop",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Rủ người sửa đồ theo từng mảng",
        "description": "Tìm những người khéo về may vá, đồ điện tử nhỏ, xe đạp, đồ gia dụng và đồ gỗ. Mỗi mảng chỉ cần một hai người là bắt đầu được.",
        "hours": 4,
        "skills": [
          "sửa chữa",
          "điện tử",
          "may vá"
        ]
      },
      {
        "name": "Dựng các bàn sửa đồ",
        "description": "Mỗi bàn cần một mặt bàn, đúng bộ đồ nghề, đủ sáng và có điện. Xếp những món sửa giống nhau về cùng một chỗ. Dán bảng tên rõ ràng cho từng bàn.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Chốt một ngày lặp lại đều đặn",
        "description": "Mỗi tháng một lần là vừa đẹp. Chọn một chỗ cố định — thư viện, xưởng chung, nhà văn hóa — để mọi người biết mang đồ tới đâu.",
        "hours": 1
      },
      {
        "name": "Lập cách tiếp nhận đồ",
        "description": "Một người đón tiếp ghi lại từng người và từng món, rồi dẫn tới đúng bàn sửa. Nói rõ ngay từ đầu: ai tới cũng ở lại phụ sửa món của mình khi làm được; đây là chỗ để học nghề, không phải chỗ gửi đồ.",
        "hours": 2,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Lo phần an toàn và nói trước điều làm được",
        "description": "Ghi rõ rằng có món không cứu được, và ở đây là cố sửa chứ không hứa chắc sửa xong. Có quy ước an toàn cho đồ điện và đồ dùng pin. Để sẵn một hộp sơ cứu trong tầm tay.",
        "hours": 2
      },
      {
        "name": "Trữ sẵn phụ tùng và vật tư hay dùng",
        "description": "Luôn có sẵn chỉ, cầu chì, keo, ốc vít, ruột xe và miếng vá. Ghi lại thứ nào hay hết để còn mua bù.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "rides-transportation",
    "name": "Đưa đón và giúp nhau đi lại",
    "purpose": "Đưa hàng xóm tới nơi khám bệnh, đi chợ và làm những việc cần thiết khi xe cộ và tiền bạc đều là trở ngại.",
    "whoItServes": "Người không có xe, hàng xóm khuyết tật, người lớn tuổi, và bất cứ ai mắc kẹt ở chỗ xe cộ không tới.",
    "whatYoullNeed": "Những người lái xe sẵn lòng góp một tay, một cách nhận và điều chuyến, cùng vài quy ước rõ ràng về an toàn và bảo hiểm. Chở hàng xóm là trách nhiệm rất lớn — hãy xem tận mắt bằng lái và bảo hiểm của từng người, xét kỹ ai sẽ chở người dễ bị tổn thương, và tuyệt đối không lấy một chuyến xe hàng xóm thay cho xe cấp cứu trong trường hợp cấp cứu y tế.",
    "setupHours": 18,
    "defaultCategory": "transport",
    "firstSteps": "Trước chuyến xe đầu tiên là hai vòng trò chuyện: ngồi lại với từng người muốn cầm lái để xem bằng lái, xem bảo hiểm và nói thẳng chuyện xét lý lịch; rồi trò chuyện với chính những người cần được đưa đón — và với hội người cao tuổi, các phòng khám vẫn quen họ — về những điểm đến, giờ giấc và nhu cầu đi lại có thật. Chuyện xét lý lịch nói ngay từ đầu như một nếp chung sẽ dễ hơn nhiều so với áp thành luật về sau.",
    "commonPitfalls": "Mạng lưới đưa đón hỏng ở khâu điều chuyến chứ không phải ở tay lái: mọi lời nhờ dồn hết vào điện thoại của một người cho tới khi người đó đuối, và cùng hai người lái xe đáng tin nhận mọi chuyến trong khi những người khác từ chối một lần rồi không bao giờ được gọi lại nữa. Hãy thay phiên nhau làm người điều phối, chia lời nhờ ra có chủ ý, và đừng bao giờ để câu hỏi bảo hiểm chờ tới sau cú va quẹt đầu tiên.",
    "pairsWith": [
      "health-navigation",
      "community-bike-workshop",
      "court-support"
    ],
    "learnMore": [
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Rủ người lái xe và xét kỹ từng người",
        "description": "Xác nhận mỗi người lái đều có bằng lái còn hạn, có bảo hiểm và một chiếc xe an toàn. Với những chuyến chở người dễ bị tổn thương, hãy hỏi người quen làm chứng hoặc kiểm tra lý lịch theo lệ thường ở nơi bạn sống.",
        "hours": 5,
        "skills": [
          "lái xe"
        ]
      },
      {
        "name": "Giải quyết chuyện bảo hiểm và trách nhiệm",
        "description": "Xem bảo hiểm riêng của mỗi người lái có nhận phần chở giúp không công hay không. Cân nhắc một bản cam kết đơn giản và hỏi một phòng trợ giúp pháp lý gần đó — việc này che chắn cho tất cả mọi người.",
        "hours": 4,
        "skills": [
          "giấy tờ"
        ]
      },
      {
        "name": "Lập cách nhận lời nhờ chở",
        "description": "Chọn một kênh duy nhất để nhờ chuyến xe (một số điện thoại, một mẫu điền trên mạng, một nhóm chat) kèm thời gian báo trước (ví dụ 48 giờ). Ghi lại giờ đón, các điểm đến, nhu cầu đi lại và cách liên lạc.",
        "hours": 2,
        "skills": [
          "tổ chức",
          "công nghệ"
        ]
      },
      {
        "name": "Dựng nếp điều chuyến",
        "description": "Có một người điều phối (thay phiên nhau) ghép lời nhờ với người lái đang rảnh và xác nhận với cả hai bên từ hôm trước. Giữ sẵn một danh sách người lái dự phòng cho những lúc hủy chuyến.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "tổ chức"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Nói rõ những chuyến nào nhận",
        "description": "Quyết định những chuyến nào được nhận (đi khám bệnh, đi chợ, việc cần thiết) và phạm vi đi lại. Nói rõ về thời gian chờ và việc người lái có phụ xách đồ hay không.",
        "hours": 1,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Lo phần chi phí",
        "description": "Quyết định xăng xe được lo thế nào — một quỹ chung nhỏ, người đi xe góp tùy tâm, hay không thu gì cả. Giữ mọi thứ minh bạch và đừng bao giờ để nó thành rào cản với người cần đi.",
        "hours": 2,
        "follows": [
          4
        ]
      },
      {
        "name": "Giữ an toàn cho cả người đi xe lẫn người lái",
        "description": "Đặt quy ước: người lái không vào nhà một mình, không cầm tiền ngoài phần chi phí đã thỏa thuận, và có một lần hỏi thăm sau những chuyến chở người dễ bị tổn thương. Ghi lại từng chuyến xe.",
        "hours": 2,
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "tenant-union",
    "name": "Nghiệp đoàn người thuê nhà và mạng lưới chống đuổi nhà",
    "purpose": "Tập hợp những người thuê nhà để cùng nhau chống lại việc bị đuổi khỏi nhà, chỗ ở mất an toàn và những lần tăng tiền thuê vô lý.",
    "whoItServes": "Người thuê nhà, nhất là ở những tòa nhà có chủ bỏ mặc hoặc vắng mặt, và bất cứ ai đang bị đòi đuổi khỏi nhà.",
    "whatYoullNeed": "Một nhóm nòng cốt đứng ra tổ chức, thông tin chính xác về quyền của người thuê nhà ở địa phương, một đầu mối trợ giúp pháp lý, và một cách liên lạc thật nhanh. Dự án này đứng bên cạnh người thuê nhà và chia sẻ thông tin pháp luật công khai; nó không thay được tư vấn pháp lý. Mọi trường hợp cụ thể luôn phải được chuyển tới nơi trợ giúp pháp lý đủ chuyên môn trước khi hết hạn.",
    "setupHours": 30,
    "defaultCategory": "housing",
    "firstSteps": "Nói chuyện với chính những người thuê nhà đang chịu ảnh hưởng trước mọi tiếp xúc với chủ nhà, luôn luôn như vậy — gõ cửa từng nhà, nghe xem người ta thật sự sợ gì và muốn gì, và để người trong mỗi tòa nhà tự định nhịp đi, vì rủi ro bị trả đũa nằm trên vai họ chứ không phải trên vai người đứng ra tổ chức. Song song đó, hãy làm quen sớm với phòng trợ giúp pháp lý gần nhất; mối quan hệ ấy cần có trước khi tờ giấy báo đuổi nhà đầu tiên tới, chứ không phải sau.",
    "commonPitfalls": "Cách một nghiệp đoàn người thuê nhà làm hại người khác là đi nhanh hơn chính những người thuê nhà: một cuộc đối đầu nổ ra khi cả tòa nhà chưa sẵn sàng sẽ đẩy những hàng xóm yếu thế nhất vào cảnh bị trả đũa mà họ chưa từng nhận lời. Thất bại lặng lẽ hơn là trượt dần từ chia sẻ thông tin pháp luật sang tư vấn pháp lý — hãy chuyển mọi trường hợp cụ thể tới nơi trợ giúp pháp lý đủ chuyên môn trước khi hết hạn, lần nào cũng vậy.",
    "pairsWith": [
      "legal-aid-clinic",
      "mutual-aid-moving-crew",
      "solidarity-fund"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Lập một ban nòng cốt đứng ra tổ chức",
        "description": "Tìm 3–6 người thuê nhà thật sự gắn bó để giữ nhịp cho cả việc. Hãy nhắm những người được cả tòa nhà nể trọng. Thống nhất phần việc của từng người, nhịp họp và mục tiêu chung.",
        "hours": 5,
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Vẽ bản đồ các tòa nhà và những chuyện người thuê đang gặp",
        "description": "Gõ cửa hoặc làm khảo sát để biết tòa nhà nào đang có vấn đề và vấn đề gì (sửa chữa bị làm ngơ, thu phí trái luật, quấy rối). Theo dõi những gì lặp lại và tìm ra người dẫn dắt tự nhiên trong mỗi tòa nhà.",
        "hours": 8,
        "skills": [
          "kết nối",
          "phỏng vấn"
        ]
      },
      {
        "name": "Gom thông tin chính xác về quyền của người thuê nhà",
        "description": "Tổng hợp luật thật sự đang áp dụng ở vùng bạn về thời hạn báo trước khi đuổi nhà, việc sửa chữa, tiền đặt cọc và quy định tiền thuê. Nhờ một phòng trợ giúp pháp lý kiểm chứng lại. Đây là thông tin chia sẻ, không phải tư vấn pháp lý — hãy nói rõ điều đó với mọi thành viên.",
        "hours": 4,
        "skills": [
          "giấy tờ",
          "viết lách"
        ]
      },
      {
        "name": "Dựng cách liên lạc ứng phó thật nhanh",
        "description": "Lập một chuỗi gọi điện hoặc một nhóm chat để người vừa nhận giấy báo đuổi nhà hay bị khóa cửa không cho vào có thể tìm tới nghiệp đoàn thật nhanh. Thống nhất ai trả lời và trong bao lâu.",
        "hours": 3,
        "skills": [
          "tổ chức",
          "rành máy tính"
        ]
      },
      {
        "name": "Tổ chức buổi “biết quyền của mình”",
        "description": "Chạy một buổi (tốt nhất là cùng một người bên trợ giúp pháp lý) đi qua từng quyền của người thuê nhà và cách xử lý khi nhận giấy tờ của tòa. Phát tài liệu in mang về bằng những thứ tiếng đang được nói ở đó.",
        "hours": 4,
        "recurringCadence": "event",
        "skills": [
          "dạy học",
          "điều phối"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Lập quy ước ứng phó khi bị đuổi nhà",
        "description": "Viết một bản từng bước thật gọn cho lúc ai đó bị đòi đuổi khỏi nhà: ghi lại mọi thứ, liên hệ trợ giúp pháp lý trước hạn, huy động hàng xóm đứng cạnh, và không bao giờ bỏ một ngày ra tòa.",
        "hours": 3,
        "skills": [
          "viết lách"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Nối với trợ giúp pháp lý và chỗ dựa lâu dài",
        "description": "Xây quan hệ chuyển tiếp với luật sư chuyên về nhà thuê, các nơi trợ giúp pháp lý và người tư vấn về nhà ở, để nghiệp đoàn chuyển được những trường hợp cần chuyên môn. Giữ danh sách liên lạc luôn mới.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      }
    ]
  },
  {
    "id": "childcare-collective",
    "name": "Nhóm trông trẻ chung và giữ trẻ luân phiên",
    "purpose": "Chia nhau việc trông trẻ trong vòng tin cậy giữa các nhà, để cha mẹ có thể đi làm, nghỉ ngơi hay lo việc gấp mà không phải trả tiền.",
    "whoItServes": "Cha mẹ và người chăm trẻ, nhất là những nhà chỉ có một người lớn nuôi con, người làm theo ca và những nhà thu nhập thấp.",
    "whatYoullNeed": "Một nhóm gia đình đã được xét kỹ, một chỗ an toàn (hoặc luân phiên từng nhà), một cách xếp lịch và những quy ước an toàn rõ ràng. Trông con của người khác là trách nhiệm rất lớn — hãy giữ quy ước trông coi thật chặt, xét kỹ người chăm trẻ, và làm theo quy định ở địa phương bạn về việc trông trẻ không chính thức.",
    "setupHours": 28,
    "defaultCategory": "childcare",
    "suggestsWorkDays": true,
    "firstSteps": "Dự án này được dựng lên trong phòng khách trước khi được dựng ở bất cứ đâu khác: hãy tụ các gia đình sáng lập lại và nói cho hết những chuyện khó nói — xét lý lịch, cách trông coi, cách dạy dỗ khi trẻ hư, chuyện gì xảy ra khi một đứa nhỏ bị thương — trước khi có ai xếp lịch dù chỉ một giờ trông trẻ. Ngay trong đợt đầu ấy, hãy tra luôn quy định ở địa phương về việc trông trẻ không chính thức, để cách làm mà cả nhóm chọn là cách các bạn giữ được thật.",
    "commonPitfalls": "Có hai thứ lặng lẽ phá hỏng các nhóm trông trẻ chung: giờ giấc lệch nhau, khi vẫn cùng mấy nhà đó nhận trẻ về nhà mình cho tới lúc họ ấm ức; và những quy ước an toàn mềm dần đi khi ai cũng đã quen thân — cái ngoại lệ “chỉ lần này thôi” với quy ước không bao giờ để một người lớn ở riêng với trẻ chính là chỗ niềm tin đổ vỡ. Hãy để số giờ của từng nhà ai cũng nhìn thấy, và giữ quy ước an toàn chặt nhất đúng với những nhà bạn thân nhất.",
    "pairsWith": [
      "toy-library",
      "time-bank",
      "youth-mentorship"
    ],
    "learnMore": [
      "what-is-balance"
    ],
    "tasks": [
      {
        "name": "Tụ các gia đình sáng lập và thống nhất cách làm",
        "description": "Rủ những gia đình đã quen nhau hoặc có thể dựng được lòng tin với nhau. Chọn cách làm: luân phiên trông trẻ cho nhau, nơi cha mẹ tích và tiêu giờ trông trẻ, hay trông chung theo lịch cố định.",
        "hours": 4,
        "skills": [
          "kết nối",
          "điều phối"
        ]
      },
      {
        "name": "Đặt chuẩn an toàn và cách xét người",
        "description": "Thống nhất cách xét bất cứ ai sẽ trông trẻ: hỏi người quen làm chứng, kiểm tra lý lịch khi cần, và một quy ước cứng rằng không bao giờ có một người lớn ở riêng với con của nhà khác mà không ai hay. Đặt tỉ lệ mấy người lớn cho mấy trẻ.",
        "hours": 6,
        "skills": [
          "trông trẻ"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tìm một chỗ và làm cho an toàn với trẻ nhỏ",
        "description": "Chọn một địa điểm hoặc đặt chuẩn cho những nhà nhận trông. Rà các mối nguy, bịt ổ điện, neo chắc tủ kệ nặng, khóa kỹ thuốc men và hóa chất, và xem lại khoảng sân ngoài trời có an toàn không nếu có dùng.",
        "hours": 4,
        "skills": [
          "trông trẻ",
          "sửa nhà"
        ]
      },
      {
        "name": "Lập cách xếp lịch và ghi giờ",
        "description": "Dùng một cuốn lịch chung hoặc một ứng dụng cho nhóm. Nếu tính theo giờ, một giờ trông trẻ là một giờ được ghi lại. Theo dõi nhà nào nhận trẻ vào lúc nào để phần việc chia ra cho công bằng.",
        "hours": 3,
        "skills": [
          "tổ chức",
          "nhập liệu"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Đặt quy ước về sức khỏe, dị ứng và lúc cấp cứu",
        "description": "Thu thập thông tin dị ứng, thuốc đang dùng, số gọi lúc cấp cứu và danh sách ai được phép đón từng đứa trẻ. Viết rõ quy ước khi trẻ bị bệnh và cách xử lý khi có chuyện cấp cứu về sức khỏe.",
        "hours": 3,
        "skills": [
          "giấy tờ",
          "viết lách"
        ]
      },
      {
        "name": "Chỉ cho người trông trẻ những điều căn bản",
        "description": "Đi qua cách trông coi, cách đặt bé sơ sinh ngủ an toàn, cách xử lý khi dị ứng hay có chuyện cấp cứu, và các quy ước an toàn. Khuyến khích mỗi buổi có ít nhất một người lớn đã học sơ cứu và CPR cho trẻ.",
        "hours": 5,
        "skills": [
          "dạy học",
          "sơ cứu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Chạy một buổi thử và hỏi lại mọi người",
        "description": "Làm một buổi thử ngắn với vài gia đình, rồi ngồi lại nói chuyện. Sửa những chỗ chưa chạy trước khi làm lớn hơn. Hỏi han đều đặn để lòng tin và sự an toàn luôn vững.",
        "hours": 3,
        "skills": [
          "trông trẻ"
        ],
        "follows": [
          2,
          5
        ]
      }
    ]
  },
  {
    "id": "community-composting",
    "name": "Chương trình ủ phân của cộng đồng",
    "purpose": "Gom rác nhà bếp để bớt đổ ra bãi rác và làm ra phân ủ miễn phí cho các mảnh vườn quanh xóm.",
    "whoItServes": "Những nhà không có chỗ ủ phân, các vườn cộng đồng, và chính môi trường quanh mình.",
    "whatYoullNeed": "Một chỗ để ủ, thùng để gom, ít đồ nghề cơ bản, và một nhóm nhỏ thay phiên chăm nom.",
    "setupHours": 22,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Hãy nói chuyện với chủ khu đất và với những nhà hàng xóm ở trong tầm ngửi thấy trước khi cái thùng đầu tiên được đưa tới — nỗi sợ mùi hôi và chuột giết chết các chỗ ủ phân, và một cuộc trò chuyện thật thà từ sớm hóa giải nó tốt hơn mọi tờ rơi. Sau đó hãy tìm nơi phân ủ sẽ về (một vườn cộng đồng đang cần) và ít nhất một người từng thật sự nuôi sống một đống ủ nóng; con mắt của người đó sẽ định cách các bạn chọn.",
    "commonPitfalls": "Dự án ủ phân chết khi không ai nhận việc đảo đống: đống ủ ì ra hoặc bắt đầu bốc mùi, một nhà hàng xóm lên tiếng, rồi chủ đất rút lời cho mượn chỗ — chuỗi ấy chạy nhanh hơn bạn tưởng. Hãy cân lượng rác gom vào cho vừa đúng sức nhóm thay phiên xử lý được, và coi một mẻ bị lẫn rác sai là lỗi của tấm bảng chỉ dẫn cần sửa, chứ không phải lỗi của người tới góp một tay.",
    "pairsWith": [
      "community-garden",
      "community-meal"
    ],
    "tasks": [
      {
        "name": "Tìm một chỗ để ủ phân",
        "description": "Kiếm cho được một khoảnh có chỗ rộng và có nắng — một góc vườn cộng đồng, một mảnh đất trống, hay một khoảnh sân ai đó sẵn lòng cho mượn. Xin phép cho chắc và tra quy định địa phương về việc ủ phân.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Chọn cách ủ",
        "description": "Chọn cách hợp với quy mô của bạn: hệ ba ngăn ủ nóng, thùng ủ quay, hay thùng nuôi trùn quế. Cách ủ phải khớp với lượng nguyên liệu bạn dự tính và với công đảo bạn kham nổi.",
        "hours": 3,
        "skills": [
          "ủ phân"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Kiếm thùng và đồ nghề",
        "description": "Đóng hoặc mua thùng gom và cả khối ủ. Gom thêm một cây chĩa xới, một cái nhiệt kế và chất nâu (lá khô, bìa các-tông) để cân với rác nhà bếp.",
        "hours": 4,
        "skills": [
          "mộc",
          "lái xe"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Lập cách gom rác nhà bếp",
        "description": "Quyết định rác tới bằng đường nào: một thùng nhận có giờ mở, hay một vòng đi gom do người trong nhóm chạy. Đưa cho mỗi nhà một cái xô nhỏ để trong bếp và một lịch bỏ rác rõ ràng.",
        "hours": 4,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Nói rõ thứ gì được nhận",
        "description": "Dán một bảng có/không thật đơn giản (có: trái cây, rau, bã cà phê, vỏ trứng; không: thịt, sữa và đồ từ sữa, dầu mỡ, phân thú nuôi). Bảng rõ ràng ngăn được chuyện lẫn rác sai làm hỏng cả mẻ.",
        "hours": 2,
        "skills": [
          "viết lách",
          "dịch thuật"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Lập nhóm thay phiên chăm nom và chỉ họ cách làm",
        "description": "Đống ủ cần được đảo đều, kiểm độ ẩm, và cân giữa chất xanh với chất nâu. Dựng một cuốn lịch chung và chỉ những điều căn bản cho người tới góp một tay, để đống ủ không bốc mùi hay ì ra.",
        "hours": 3,
        "skills": [
          "ủ phân",
          "dạy học"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Chia phân ủ đã xong",
        "description": "Khi phân đã hoai, chia miễn phí cho những nhà đã góp rác và cho các vườn cộng đồng. Báo ngày tới lấy và nhắc mọi người mang bao hay xô theo.",
        "hours": 2,
        "skills": [
          "lái xe"
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "free-little-library",
    "name": "Tủ sách nhỏ miễn phí và góc đổi sách",
    "purpose": "Có sách miễn phí suốt ngày đêm để mọi người đọc và chia nhau, không cần thẻ thư viện, không mất phí.",
    "whoItServes": "Trẻ nhỏ, các gia đình và người đọc ở mọi lứa tuổi, nhất là ở những khu ít có sách.",
    "whatYoullNeed": "Một tủ sách chịu được mưa nắng, một ít sách ban đầu, một chỗ đặt có người nhận, và một chút công chăm nom.",
    "setupHours": 7.5,
    "defaultCategory": "education",
    "firstSteps": "Bắt đầu bằng hai cuộc trò chuyện ngắn: một với người có bức tường hay khoảnh sân sẽ nhận tủ sách, về chỗ đặt và về chuyện gì xảy ra nếu tủ xuống cấp; một với các gia đình và trường học gần đó, về những cuốn sách người ta thật sự sẽ mang về nhà. Hãy tìm được người chăm nom — người sẽ ghé xem mỗi tuần — trước khi dựng tủ, chứ không phải sau.",
    "commonPitfalls": "Tủ sách nhỏ không chết vì thiếu sách — chúng chết vì sách sai: có người trút vào một thùng giáo trình cũ mèm, những cuốn hay bị vùi mất, mưa lọt vào, rồi người ta lặng lẽ thôi không ghé nữa. Một lượt ghé năm phút mỗi tuần của người chăm nom ngăn được gần hết những chuyện đó; cái tủ cần một con người hơn là cần sách quyên góp.",
    "pairsWith": [
      "seed-library",
      "books-to-prisoners"
    ],
    "tasks": [
      {
        "name": "Đóng hoặc kiếm một tủ sách chịu được mưa nắng",
        "description": "Đóng hoặc mua một cái tủ chắc chắn, không thấm nước, gắn lên cột hoặc lên tường. Một cái tủ cũ tận dụng hay một hộp đựng báo đều dùng được. Thêm cánh cửa trong suốt và mái dốc để sách luôn khô.",
        "hours": 4,
        "skills": [
          "mộc"
        ]
      },
      {
        "name": "Chọn và dọn chỗ đặt",
        "description": "Chọn một chỗ có người qua lại và có người đồng ý cho đặt — sân trước nhà bạn, một nhà văn hóa, hay mép một công viên. Neo tủ cho thật chắc và hỏi cho rõ là được phép.",
        "hours": 1,
        "skills": [
          "kết nối"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Gom số sách ban đầu",
        "description": "Xin sách quyên góp qua một đợt kêu gọi nhỏ. Hãy cố có đủ loại: sách thiếu nhi, truyện được nhiều người thích, và sách chỉ dẫn việc thực tế. Chỉ xếp đầy nửa tủ để còn chỗ cho người khác thêm vào.",
        "hours": 1.5,
        "skills": [
          "kết nối"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Gắn một tấm bảng và vài quy ước đơn giản",
        "description": "Dán dòng chữ “Lấy một cuốn, để lại một cuốn — tất cả đều miễn phí”. Giữ giọng ấm áp và ít luật lệ. Thêm một dòng mời mọi lứa tuổi và mọi thứ tiếng.",
        "hours": 0.5,
        "skills": [
          "viết lách"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tìm một người chăm nom",
        "description": "Nhờ một người ở gần ghé xem tủ mỗi tuần: dọn lại cho gọn, bỏ ra những cuốn hỏng hay không hợp, và cân lại số sách. Năm phút mỗi tuần là đủ giữ cho tủ luôn khỏe.",
        "hours": 0.5,
        "skills": [
          "kết nối"
        ]
      }
    ]
  },
  {
    "id": "community-first-aid-training",
    "name": "Học sơ cứu và ứng phó quá liều cho cả cộng đồng",
    "purpose": "Chỉ cho hàng xóm cách sơ cứu, làm CPR và cứu người quá liều, để cộng đồng ứng phó được trong những phút trước khi người có chuyên môn tới.",
    "whoItServes": "Tất cả mọi người; đặc biệt đáng giá ở nơi xe cấp cứu tới chậm hoặc có nhiều ca quá liều.",
    "whatYoullNeed": "Người dạy có chứng chỉ, vật tư, một chỗ học, và một lịch lặp lại đều. Mọi nội dung y tế đều phải do người có chứng chỉ dạy; dự án này đứng ra lo liệu và mở chỗ cho việc dạy đó, chứ không thay thế nó.",
    "setupHours": 17,
    "defaultCategory": "education",
    "firstSteps": "Cuộc trò chuyện đầu tiên là với chính những người sẽ đứng lớp — Hội Chữ thập đỏ, cơ quan y tế địa phương, hay một nhóm giảm tác hại. Hỏi họ cần gì ở nơi đứng ra tổ chức và mở được những ngày nào, rồi nói chuyện với những người nhiều khả năng chứng kiến một ca nguy kịch nhất — người nhà của những ai đang dùng ma túy, nhân viên các cửa hàng gần đó — để các buổi đầu tiên được dựng quanh chính họ.",
    "commonPitfalls": "Dự án này lụi dần khi nó thành một sự kiện lớn duy nhất không bao giờ lặp lại — tay nghề rỉ sét và naloxone hết hạn mà không ai để ý. Và hãy cưỡng lại ý muốn tự mình dạy phần y tế; việc của nhóm là mở chỗ và lo liệu cho người có chứng chỉ đứng lớp, chứ không phải đứng thay họ.",
    "pairsWith": [
      "harm-reduction-supplies",
      "emergency-preparedness"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Bắt tay với người dạy có chứng chỉ",
        "description": "Kết nối với người có chuyên môn — Hội Chữ thập đỏ, cơ quan y tế địa phương, hay một tổ chức giảm tác hại. Họ dạy phần y tế thật sự; việc của bạn là đứng ra lo liệu và mở chỗ.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Kiếm vật tư",
        "description": "Kiếm các hộp sơ cứu, mô hình tập CPR (người dạy thường cho mượn) và naloxone. Nhiều chương trình y tế công phát naloxone miễn phí — hãy hỏi cơ quan y tế địa phương hoặc các nhóm giảm tác hại.",
        "hours": 3,
        "skills": [
          "kết nối",
          "lái xe"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Tìm chỗ và xếp lịch các buổi",
        "description": "Giữ một phòng đủ rộng để thực hành bằng tay — nhà văn hóa, thư viện, hay một phòng khám. Đặt những ngày lặp lại đều để mọi người xếp được quanh giờ làm.",
        "hours": 2
      },
      {
        "name": "Rủ người tới học",
        "description": "Loan tin thật rộng và ưu tiên những người nhiều khả năng chứng kiến ca nguy kịch. Giữ việc ghi tên thật dễ và miễn phí, và mở nhiều khung giờ cho người làm theo ca.",
        "hours": 2,
        "skills": [
          "kết nối"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Chạy các buổi học",
        "description": "Mở chỗ cho các buổi do người dạy đứng lớp, lo phần bày biện và điểm danh, và trông chừng để ai cũng được thực hành bằng tay. Phát thẻ nhắc mang về.",
        "hours": 4,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          0,
          1,
          3
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Phát hộp sơ cứu và mở buổi ôn lại",
        "description": "Để người đã học mang về một hộp sơ cứu và naloxone ở nơi có sẵn. Xếp lịch ôn lại đều đặn để tay nghề không rỉ sét.",
        "hours": 2,
        "recurringCadence": "session",
        "follows": [
          4
        ]
      }
    ]
  },
  {
    "id": "time-bank",
    "name": "Ngân hàng thời gian",
    "purpose": "Để mọi thành viên trao đổi việc giúp nhau bằng thời gian: một giờ cho đi bằng đúng một giờ nhận về, phần đóng góp của ai cũng có giá trị như nhau.",
    "whoItServes": "Bất cứ ai, nhất là những người dư thời gian và sở trường nhưng eo hẹp tiền bạc.",
    "whatYoullNeed": "Một danh sách thành viên, một cách ghi chép, một người điều phối, và những quy ước đã thống nhất.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Hãy bắt đầu bằng trò chuyện, đừng bắt đầu bằng phần mềm: ngồi lại với mười hay mười lăm người hàng xóm và hỏi từng người sẽ giúp được gì và sẽ nhờ gì. Nếu những cuộc trò chuyện ấy chưa ra được sự đa dạng — đưa đón, kèm học, sửa chữa, nấu ăn — thì cứ rủ thêm người đã, rồi mới bắt tay dựng cách vận hành.",
    "commonPitfalls": "Ngân hàng thời gian hiếm khi chết vì tai tiếng; nó chết vì im lặng — người ta vào rồi không ai mở lời nhờ trước, thế là mọi thứ nguội đi. Hãy để một người điều phối chủ động ghép việc trong những tháng đầu, và giữ vững lằn ranh một giờ bằng một giờ: ngay khi có người tranh luận rằng giờ của thợ ống nước lớn hơn giờ của người trông trẻ, nó thôi không còn là ngân hàng thời gian nữa.",
    "pairsWith": [
      "skill-share",
      "childcare-collective"
    ],
    "learnMore": [
      "what-is-balance",
      "negative-balance"
    ],
    "tasks": [
      {
        "name": "Rủ thành viên sáng lập và ghi lại sở trường của từng người",
        "description": "Tụ một nhóm ban đầu và hỏi từng người giúp được gì (đưa đón, kèm học, sửa chữa, nấu ăn, làm vườn) và đang cần gì. Chính sự đa dạng của những lời ngỏ giúp đỡ làm cho việc này chạy được.",
        "hours": 5,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Chọn một cách ghi chép",
        "description": "Chọn cách ghi lại số giờ: phần mềm riêng cho ngân hàng thời gian, một bảng tính chung, hay một cuốn sổ đơn giản. Nó phải ghi được ai đã cho và ai đã nhận giờ.",
        "hours": 4,
        "skills": [
          "rành máy tính",
          "nhập liệu"
        ]
      },
      {
        "name": "Thống nhất các quy ước",
        "description": "Thống nhất nguyên tắc cốt lõi (một giờ là một giờ, bất kể việc gì), cách thành viên nhờ và xác nhận một lần trao đổi, và chuyện gì xảy ra khi số giờ của ai đó xuống thấp.",
        "hours": 4,
        "skills": [
          "điều phối",
          "viết lách"
        ]
      },
      {
        "name": "Đón thành viên mới vào",
        "description": "Làm một buổi giới thiệu ngắn để mọi người hiểu tinh thần và cách vận hành. Cho mỗi người vài giờ hạt giống để các lần trao đổi bắt đầu được ngay.",
        "hours": 4,
        "skills": [
          "dạy học"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Mở danh bạ ai giúp được việc gì",
        "description": "Đưa ra một danh sách tra được, cho biết ai sẵn lòng giúp việc gì. Giữ nó luôn mới để thành viên tự tìm được người giúp mà không phải hỏi người điều phối mỗi lần.",
        "hours": 4,
        "skills": [
          "nhập liệu"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Điều phối và ghép các lần trao đổi",
        "description": "Để một người điều phối giúp ghép việc cần giúp với lời ngỏ giúp đỡ, nhất là thời gian đầu, và khẽ nhắc những thành viên đang lặng lẽ. Lâu dần, mọi người tự tìm đến nhau.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "tổ chức"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Dựng nếp giữ an toàn và lòng tin",
        "description": "Đặt quy ước cho những lần trao đổi diễn ra trong nhà hoặc với thành viên dễ bị tổn thương (hỏi người quen làm chứng, không gặp riêng khi thấy chưa yên tâm). Thêm một cách đơn giản để gắn cờ khi có chuyện chưa ổn.",
        "hours": 4,
        "skills": [
          "điều phối"
        ]
      }
    ]
  },
  {
    "id": "solidarity-fund",
    "name": "Quỹ tương trợ (giúp nhau bằng tiền mặt)",
    "purpose": "Góp tiền lại để trao thẳng tiền mặt, không kèm điều kiện nào, cho hàng xóm đang gặp khủng hoảng.",
    "whoItServes": "Những người gặp chuyện khẩn cấp — thiếu tiền thuê nhà, một hóa đơn viện phí, bị cắt điện nước.",
    "whatYoullNeed": "Một cách giữ tiền minh bạch, một nhóm nhỏ trông coi quỹ, kế hoạch gây quỹ và tiêu chí rõ ràng. Cầm tiền chung của mọi người là trách nhiệm thật sự — mỗi khoản chi cần hai người cùng ký duyệt, ghi chép rõ ràng, giữ kín danh tính người nhận, và hỏi ý kiến chuyên môn về mặt pháp lý và thuế cho quỹ của bạn.",
    "setupHours": 23,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Trước khi gom đồng nào, hãy ngồi lại với vài người bạn tin tưởng để cùng giữ tiền chung và nói thẳng với nhau: hai người cùng ký duyệt sẽ làm thế nào, công khai những gì, và làm sao khi số người xin nhiều hơn số tiền đang có. Sau đó tìm một tổ chức phi lợi nhuận ở địa phương hoặc một người làm kế toán để họ chỉ cho bạn phần pháp lý và thuế, trước khi mở tài khoản.",
    "commonPitfalls": "Không gì làm mất lòng tin nhanh bằng tiền — một khoản chi không giải thích được hay một cuốn sổ ghi cẩu thả có thể chấm dứt cả quỹ, dù chẳng ai làm gì sai. Và gần như lúc nào số người cần cũng nhiều hơn số tiền có; nếu tiêu chí không được thống nhất từ trước, việc từ chối từng trường hợp một sẽ làm cả nhóm kiệt sức và sinh ra oán trách.",
    "pairsWith": [
      "resource-hub-dispatch",
      "tenant-union",
      "free-tax-prep"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Lập một nhóm nhỏ trông coi quỹ",
        "description": "Rủ vài người đáng tin cậy cùng lo cho quỹ. Phân vai rõ ràng và cùng cam kết minh bạch ngay từ ngày đầu — ở đây lòng tin là tất cả.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Lo cách giữ tiền minh bạch",
        "description": "Mở một tài khoản riêng hoặc nhờ một tổ chức đứng ra bảo trợ tài chính. Mỗi khoản chi cần hai người duyệt, ghi sổ thu chi rõ ràng, và xem cách tổ chức của bạn có kéo theo nghĩa vụ thuế hay pháp lý nào không — hỏi một tổ chức phi lợi nhuận ở địa phương hoặc một người làm kế toán.",
        "hours": 5,
        "skills": [
          "kế toán",
          "giấy tờ"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Định ra tiêu chí xin và trao tiền",
        "description": "Quyết định ai được xin, mức tiền thường trao, bao lâu một người được xin lại, và chọn ai đến trước nhận trước hay ưu tiên theo mức cần. Giữ rào cản thấp và tránh đòi giấy tờ chứng minh hoàn cảnh khi có thể.",
        "hours": 4,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Làm một mẫu đơn xin ngắn gọn, ít rào cản",
        "description": "Làm một mẫu đơn ngắn, kín đáo, chỉ hỏi những gì cần thiết. Mở nhiều cách nộp (trên mạng, gọi điện, gặp trực tiếp) và giữ kín thông tin của người xin.",
        "hours": 2,
        "skills": [
          "viết lách"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Bắt đầu gây quỹ",
        "description": "Kết hợp những khoản góp nhỏ đều đặn của thành viên với vài đợt quyên góp thỉnh thoảng. Nói rõ với người quyên góp rằng tiền đi thẳng tới hàng xóm đang cần.",
        "hours": 4,
        "skills": [
          "kết nối"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Dựng cách quyết định và chi tiền",
        "description": "Đặt thời hạn trả lời, một vòng xem xét nhanh của cả nhóm, và những cách chi tiền tới tay nhanh. Trong lúc khủng hoảng, nhanh là quan trọng. Ghi lại mỗi quyết định thật đơn giản.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Báo lại minh bạch cho mọi người",
        "description": "Chia sẻ bản tóm tắt đều đặn — tiền vào, tiền ra, bao nhiêu hàng xóm đã được giúp — mà không để lộ danh tính người nhận. Minh bạch giữ cho mọi người tiếp tục góp.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "viết lách",
          "kế toán"
        ]
      }
    ]
  },
  {
    "id": "diaper-hygiene-bank",
    "name": "Kho tã và đồ vệ sinh",
    "purpose": "Phát miễn phí tã, đồ dùng cho kỳ kinh nguyệt và đồ vệ sinh cá nhân — những thứ mà hầu hết các khoản trợ giúp thực phẩm không mua được.",
    "whoItServes": "Gia đình thu nhập thấp, trẻ sơ sinh, người đang có kinh nguyệt và hàng xóm không có chỗ ở.",
    "whatYoullNeed": "Chỗ cất trữ, nguồn hàng đều đặn, các điểm phát và người góp một tay.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Hãy nói chuyện trước với những người vẫn gặp các gia đình này — phòng khám nhi, điểm phát thực phẩm, nhà thờ — và hỏi xem cỡ nào, món nào thật sự hay thiếu, và họ có nhận làm điểm phát không. Chỉ một cuộc nói chuyện đó thôi cũng tiết kiệm cho bạn nhiều tháng mò mẫm.",
    "commonPitfalls": "Điều làm đau nhất là sự thất thường: một đợt quyên góp lớn, kệ đầy ắp, rồi mấy tháng trống trơn đúng lúc các gia đình đã bắt đầu trông cậy vào bạn. Cũng để mắt tới hàng thật sự còn trong kho — tã cỡ sơ sinh chất đống trong khi cỡ lớn thì hết — và đừng bao giờ đòi giấy chứng minh hoàn cảnh; giữ thể diện cho người nhận là một phần của việc này.",
    "pairsWith": [
      "welcome-wagon",
      "laundry-shower-access"
    ],
    "tasks": [
      {
        "name": "Tìm chỗ cất trữ và một điểm phát",
        "description": "Kiếm một chỗ cất trữ khô ráo, có khóa, và một nơi để trao đồ — một kho nhỏ ở phòng khám, nhà thờ hay nhà văn hóa. Chỗ trao đồ nên kín đáo và giữ thể diện cho người nhận.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Gây dựng nguồn hàng",
        "description": "Kết hợp mua sỉ, các đợt quyên góp và mối quan hệ với mạng lưới kho tã hay nhà bán buôn. Theo dõi nguồn nào ổn định để không bị đứt hàng.",
        "hours": 3,
        "skills": [
          "kết nối",
          "lái xe"
        ]
      },
      {
        "name": "Phân loại và đếm theo cỡ, theo món",
        "description": "Sắp tã theo cỡ, cùng với đồ dùng cho kỳ kinh nguyệt và đồ vệ sinh. Giữ một bảng đếm liên tục để biết cần xin gì. Cỡ cho bé lớn thường hay thiếu.",
        "hours": 1.5,
        "skills": [
          "tổ chức",
          "nhập liệu"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Đặt ra cách chia công bằng",
        "description": "Quyết định mỗi gia đình nhận bao nhiêu và bao lâu một lần, không đặt rào cản chứng minh hoàn cảnh. Làm sao cho đều đặn để mọi người trông cậy được.",
        "hours": 1,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Xếp lịch phát và bố trí người",
        "description": "Chọn những ngày phát cố định, rủ người tới trao đồ, và giữ không khí ấm áp, không phán xét.",
        "hours": 2.5,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-bike-workshop",
    "name": "Xưởng xe đạp của cộng đồng",
    "purpose": "Mở chỗ, cho mượn đồ nghề và giúp mọi người sửa, lắp và tự làm để có xe đạp, để việc đi lại vừa túi tiền và dễ với mọi người.",
    "whoItServes": "Người không có ô tô, các bạn trẻ, người đi làm xa và bất cứ ai cần phương tiện đi lại rẻ.",
    "whatYoullNeed": "Một chỗ làm, đồ nghề, xe đạp và phụ tùng được cho tặng, cùng vài người biết sửa xe.",
    "setupHours": 20,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Trước khi đi tìm mặt bằng, hãy nói chuyện với những người sẽ dùng xưởng và những người biết sửa xe sẽ đứng ra chỉ nghề — và nếu ở thành phố gần đó có một xưởng xe đạp cộng đồng, hãy ghé thăm và hỏi họ sẽ làm khác đi điều gì. Với chủ mặt bằng, hãy thống nhất trước chuyện cất xe, giờ ra vào và bảo hiểm.",
    "commonPitfalls": "Xưởng chết khi người giúp cứ sửa xe thay vì chỉ cho người ta tự sửa: nó thành một tiệm sửa xe miễn phí, hàng chờ dài ra, và những người biết nghề thì kiệt sức. Cũng coi chừng bị ngập trong đống xe cũ nát được cho — hãy loại thẳng tay — và đừng để chiếc xe nào lăn bánh ra khỏi cửa mà chưa kiểm phanh và lốp.",
    "pairsWith": [
      "repair-cafe",
      "rides-transportation",
      "tool-lending-library"
    ],
    "tasks": [
      {
        "name": "Tìm một chỗ làm xưởng",
        "description": "Kiếm một nhà xe, tầng hầm, thùng container hay một chỗ sinh hoạt chung đủ rộng để làm việc và cất xe. Xác nhận rõ giờ ra vào và các yêu cầu bảo hiểm nếu có.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Gom đồ nghề và một giá đỡ sửa xe",
        "description": "Gom một bộ đồ nghề xe đạp cơ bản và ít nhất một giá đỡ sửa xe, bằng cách xin tặng hoặc trích một khoản nhỏ. Sắp đồ nghề sao cho dễ lấy và dễ trả về chỗ cũ.",
        "hours": 5,
        "skills": [
          "lái xe"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Nhận xe đạp và phụ tùng được cho",
        "description": "Kêu gọi mọi người cho xe đạp không dùng nữa và phụ tùng còn xài được. Chia thành “sửa được”, “lấy phụ tùng” và “chạy được ngay”. Kho phụ tùng chính là thứ nuôi cái xưởng.",
        "hours": 4,
        "skills": [
          "sửa chữa",
          "lái xe"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Rủ người biết sửa xe đến chỉ nghề",
        "description": "Tìm vài người biết sửa xe đạp và, quan trọng hơn, biết chỉ lại cho người khác. Mục tiêu là giúp mọi người học cách tự sửa xe của mình, chứ không phải sửa hộ họ.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Định giờ mở cửa và cách tự sửa lấy xe",
        "description": "Chọn những giờ mở cửa đều đặn. Cân nhắc một chương trình “tự sửa lấy xe”: người tham gia học nghề sửa qua vài buổi rồi mang về chiếc xe do chính tay mình sửa.",
        "hours": 2,
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Dựng nếp làm việc an toàn",
        "description": "Bắt buộc đeo kính bảo hộ, đặt quy tắc dùng đồ nghề, và luôn có một hộp cứu thương. Lúc nào cũng kiểm tra an toàn (phanh, lốp, bộ cổ lái) trước khi một chiếc xe rời xưởng.",
        "hours": 2,
        "skills": [
          "viết lách"
        ]
      }
    ]
  },
  {
    "id": "newcomer-translation-network",
    "name": "Mạng lưới giúp người mới đến và phiên dịch",
    "purpose": "Giúp người nhập cư và người tị nạn xoay xở ở một nơi hoàn toàn mới — phiên dịch, giấy tờ, chỉ đường chỉ lối và kết nối với cộng đồng.",
    "whoItServes": "Người nhập cư và người tị nạn vừa mới đến, cùng những hàng xóm chưa nói được tiếng địa phương.",
    "whatYoullNeed": "Người giúp biết hai thứ tiếng trở lên, các tổ chức cùng đồng hành, tài liệu chỉ dẫn ban đầu, và một cách tiếp nhận lời nhờ. Hãy đặc biệt cẩn thận với chuyện riêng tư: không thu thập tình trạng cư trú, chuyển mọi câu hỏi pháp lý sang luật sư di trú có chuyên môn, và để chính người trong cộng đồng nói ra họ thật sự muốn được giúp điều gì.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Hãy bắt đầu bằng việc nói chuyện với chính các cộng đồng mới đến và những tổ chức đang đồng hành cùng họ — để họ nói ra họ muốn được giúp gì, thay vì bạn thiết kế sẵn cho họ. Và trước khi có lời nhờ đầu tiên, hãy chuẩn bị sẵn chỗ để chuyển tiếp: những luật sư di trú có chuyên môn mà bạn có thể gửi mọi câu hỏi pháp lý sang.",
    "commonPitfalls": "Rủi ro nghiêm trọng nhất là những người giúp đầy thiện chí trượt từ phiên dịch sang cho lời khuyên pháp lý hay y tế mà họ không đủ chuyên môn — một lời chỉ dẫn sai về di trú có thể khiến người ta trả giá rất đắt. Và chỉ thu thập lượng thông tin tối thiểu: một dòng ghi chép bất cẩn về tình trạng cư trú của ai đó có thể đẩy họ vào nguy hiểm thật sự.",
    "pairsWith": [
      "welcome-wagon",
      "legal-aid-clinic",
      "health-navigation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Rủ người biết hai thứ tiếng trở lên",
        "description": "Tìm những người giúp nói được các thứ tiếng phổ biến ở khu bạn và có thể giúp phiên dịch, điền giấy tờ và đi cùng. Hãy chọn đúng những thứ tiếng mà nơi bạn ở thật sự cần.",
        "hours": 4,
        "skills": [
          "dịch thuật",
          "kết nối"
        ]
      },
      {
        "name": "Lập bản đồ những nơi giúp được ở địa phương",
        "description": "Dựng một cuốn danh bạ: phòng khám, trường học, nơi trợ giúp pháp lý, lớp học tiếng, chỗ nhận thực phẩm và các tổ chức làm việc với người nhập cư. Người mới đến thường chỉ cần biết có những gì và tới đó bằng cách nào.",
        "hours": 5,
        "skills": [
          "kết nối",
          "nhập liệu"
        ]
      },
      {
        "name": "Dựng cách tiếp nhận và ghép người",
        "description": "Tạo một cách đơn giản để người mới đến ngỏ lời nhờ giúp và được ghép với một người giúp theo ngôn ngữ và việc cần. Mở cả cách gọi điện và gặp trực tiếp, không chỉ trên mạng.",
        "hours": 3,
        "skills": [
          "tổ chức",
          "rành máy tính"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Làm tài liệu chỉ dẫn cho người mới",
        "description": "Soạn những cuốn cẩm nang bằng lời lẽ đơn giản, bằng các thứ tiếng cần thiết, nói về đi lại, trường học, khám chữa bệnh và quyền của mình. Dùng nhiều hình để ai đọc chữ ít cũng hiểu.",
        "hours": 4,
        "skills": [
          "viết lách",
          "dịch thuật"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Đi cùng khi có lịch hẹn",
        "description": "Thu xếp để có người đi cùng tới các buổi hẹn khám bệnh, gặp nhà trường hay đi làm giấy tờ, để phiên dịch và làm chỗ dựa. Dặn kỹ người đi cùng: dịch cho đúng, đừng cho lời khuyên ngoài chuyên môn của mình.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "dịch thuật"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Đặt nếp giữ kín và giữ an toàn",
        "description": "Chỉ thu thập lượng thông tin tối thiểu và đừng bao giờ hỏi hay ghi lại tình trạng cư trú. Cất dữ liệu cho kỹ và chỉ cho người giúp cách xử sự kín đáo trong những tình huống nhạy cảm.",
        "hours": 3,
        "skills": [
          "viết lách"
        ]
      }
    ]
  },
  {
    "id": "community-meal",
    "name": "Bữa cơm cộng đồng / Bếp chung của xóm",
    "purpose": "Cùng nấu và cùng ăn những bữa cơm miễn phí theo lịch đều đặn, không hỏi han gì ai.",
    "whoItServes": "Bất cứ ai đang đói, đang lẻ loi hay bữa no bữa đói; nó cũng nối mọi người trong xóm lại với nhau.",
    "whatYoullNeed": "Một cái bếp, người nấu, nguồn thực phẩm đều đặn, chỗ dọn ăn và một nhóm người góp tay. Nấu ăn cho đông người kéo theo trách nhiệm thật sự về an toàn thực phẩm — hãy tìm hiểu quy định ở địa phương về giấy phép và người có chứng chỉ an toàn thực phẩm, và lần nào cũng giữ đúng cách bảo quản và nhiệt độ.",
    "setupHours": 22,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Hai cuộc nói chuyện đầu tiên của bạn là với nơi cho mượn bếp — hội trường nhà thờ hay nhà văn hóa — về những ngày bạn định nấu, và với cơ quan y tế địa phương về giấy phép cùng cách xử lý thực phẩm; hai điều đó định hình tất cả phần còn lại. Rồi hãy hỏi chính những người sẽ tới ăn xem ngày nào, giờ nào thật sự hợp với họ.",
    "commonPitfalls": "Một sơ suất về an toàn thực phẩm có thể làm ai đó đổ bệnh và chấm dứt cả dự án — quy định về nhiệt độ và bảo quản thì không được bỏ qua, dù chỉ một lần. Cái chết chậm hơn là cứ ba người đó nấu hết bữa này tới bữa khác cho tới lúc kiệt sức, nên hãy mở rộng nhóm và thay phiên nhau làm bếp chính ngay từ đầu.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Tìm một cái bếp và chỗ dọn ăn",
        "description": "Kiếm một cái bếp đủ rộng để nấu cho đông người — hội trường nhà thờ, nhà văn hóa hay một bếp ăn công nghiệp — cùng chỗ để dọn ăn. Xác nhận nơi đó trống vào đúng những ngày bạn định nấu.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Lo an toàn thực phẩm và giấy phép",
        "description": "Tìm hiểu quy định ở địa phương về việc nấu ăn cho đông người. Có thể bạn cần giấy phép, cần một người có chứng chỉ an toàn thực phẩm có mặt, hoặc một cái bếp có phép. Học cách bảo quản và giữ nhiệt độ cho an toàn.",
        "hours": 4,
        "skills": [
          "an toàn thực phẩm"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Dựng nguồn thực phẩm đều đặn",
        "description": "Kết hợp đồ được cửa hàng và quán ăn cho, hàng mua sỉ, và rau trái dư từ vườn hay từ những buổi đi mót. Ghi lại nguồn nào đáng tin để lên thực đơn theo đúng những gì sẽ có.",
        "hours": 3,
        "skills": [
          "kết nối",
          "lái xe"
        ]
      },
      {
        "name": "Lên thực đơn hợp số đông, hợp kiêng khem và dị ứng",
        "description": "Nghĩ ra những món đơn giản, đủ chất, nấu được số lượng lớn và tận dụng được nguyên liệu. Có món chay và ghi rõ những thứ hay gây dị ứng.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "nấu ăn"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Rủ nhóm nấu và nhóm dọn ăn",
        "description": "Gom người lo sơ chế, nấu, dọn ăn và rửa dọn. Mỗi bữa cử một người làm bếp chính và phân vai rõ để buổi ăn chạy trơn tru.",
        "hours": 3,
        "skills": [
          "nấu ăn",
          "tổ chức"
        ]
      },
      {
        "name": "Chốt lịch và loan tin",
        "description": "Chọn một ngày và giờ cố định để mọi người trông cậy được. Loan tin bằng tờ rơi, qua các nhà tạm trú và truyền miệng, giọng ấm áp và mở cửa cho tất cả.",
        "hours": 2,
        "skills": [
          "thiết kế đồ họa"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Nấu bữa ăn và dọn dẹp",
        "description": "Nấu, dọn ăn sao cho ai cũng thấy được trọng (bưng ra tận bàn dễ chịu hơn xếp hàng, khi làm được), và dọn bếp sạch đúng chuẩn. Cất đồ ăn còn dư cho an toàn để chia lại.",
        "hours": 5,
        "skills": [
          "nấu ăn"
        ],
        "follows": [
          3,
          4,
          5
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "seed-library",
    "name": "Thư viện hạt giống và ngày đổi hạt",
    "purpose": "Chia sẻ hạt giống miễn phí để mọi người trồng được cái ăn, đồng thời giữ lại những giống hợp đất địa phương và giống cổ truyền.",
    "whoItServes": "Người trồng rau ở nhà, người mới tập trồng và các vườn rau của cộng đồng.",
    "whatYoullNeed": "Một cách cất trữ và ghi danh mục, hạt giống được cho, một nơi đặt tủ và vài người trông nom.",
    "setupHours": 8,
    "defaultCategory": "food",
    "firstSteps": "Hãy nói chuyện với thư viện hoặc nhà văn hóa về chỗ đặt tủ, và với những người trồng rau lâu năm ở địa phương về những gì thật sự lên được ở vùng bạn — người mới trồng có thành công hay không là nhờ hạt giống hợp vùng. Một vườn ươm hay một vườn rau cộng đồng gần đó thường sẵn lòng cho bạn lứa hạt giống đầu tiên.",
    "commonPitfalls": "Một thư viện hạt giống chết trong lặng lẽ: hạt cũ không nảy mầm, người mới trồng kết luận rằng mình không biết trồng rồi không quay lại nữa. Hãy thay hạt cũ ra không tiếc nuối, và đừng trông vào việc người ta trả hạt về — gần như không ai để giống lại — nên hãy tính chuyện bù hàng bằng nguồn cho tặng, chứ không bằng hạt trả về.",
    "pairsWith": [
      "community-garden",
      "free-little-library"
    ],
    "tasks": [
      {
        "name": "Tìm nơi đặt tủ và cách cất hạt",
        "description": "Bắt tay với một thư viện, nhà văn hóa hay vườn rau để đặt nhờ một cái tủ nhỏ hay bộ ngăn kéo. Cất hạt nơi mát, khô, tối, trong những phong bì có dán nhãn.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Kiếm lứa hạt giống đầu tiên",
        "description": "Gom hạt từ người trồng rau, phần dư của các công ty hạt giống và những gói cuối mùa. Ưu tiên những giống dễ trồng, hợp với vùng, để người mới trồng có thành công.",
        "hours": 2,
        "skills": [
          "kết nối",
          "làm vườn"
        ]
      },
      {
        "name": "Sắp xếp và dán nhãn cả bộ sưu tập",
        "description": "Chia theo loại (rau, rau thơm, hoa) và theo độ khó. Ghi lên mỗi phong bì tên cây, năm và vài dòng về cách trồng. Đánh dấu những giống dễ để lại làm giống.",
        "hours": 2,
        "skills": [
          "làm vườn",
          "nhập liệu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Đặt lệ mượn và chia lại",
        "description": "Giữ cho đơn giản: lấy hạt miễn phí, đem trồng, và nếu được thì để lại ít giống trả về cuối mùa. Dán một trang giấy nói cách nó hoạt động.",
        "hours": 1,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Giữ hạt còn nảy mầm và bù thêm hàng",
        "description": "Hạt giống mất sức nảy mầm theo thời gian. Thay hạt cũ ra, thử nảy mầm với những mẻ đáng ngờ, và bù thêm những giống được lấy nhiều.",
        "hours": 1,
        "skills": [
          "làm vườn"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      }
    ]
  },
  {
    "id": "digital-literacy",
    "name": "Chương trình học dùng máy và cho mượn thiết bị",
    "purpose": "Cho mượn thiết bị và chỉ cách dùng máy, để bắc cầu cho những người không có máy móc hay đường mạng ổn định.",
    "whoItServes": "Người cao tuổi, hàng xóm thu nhập thấp, người đang tìm việc và bất cứ ai bị gạt ra ngoài những thứ chỉ làm được trên mạng.",
    "whatYoullNeed": "Thiết bị được cho tặng, đường mạng, người kèm và một chỗ ngồi.",
    "setupHours": 27,
    "defaultCategory": "tech",
    "firstSteps": "Hãy nói chuyện trước với chính những người bạn muốn tới được — ở thư viện, ở câu lạc bộ người cao tuổi, ở hàng người chờ nhận thực phẩm — và hỏi họ thật sự muốn làm gì: khám bệnh từ xa, nộp hồ sơ xin việc, xem ảnh mấy đứa cháu. Rồi hãy bàn với thư viện về chỗ ngồi và đường mạng, trước khi gom lấy một cái máy nào.",
    "commonPitfalls": "Cho mượn thiết bị mà chưa lo được đường mạng là cho mượn một cục chặn giấy — kết nối là một nửa của dự án. Trong các buổi kèm, lỗi kinh điển là người kèm giành lấy con chuột và nói toàn từ chuyên môn; và đừng bao giờ cho người khác mượn lại một máy chưa xóa sạch, vì để lộ dữ liệu của một người mượn là làm sập toàn bộ lòng tin bạn đã gây dựng.",
    "pairsWith": [
      "community-wifi-mesh",
      "skill-share"
    ],
    "learnMore": [
      "install-app",
      "new-device"
    ],
    "tasks": [
      {
        "name": "Gom và tân trang thiết bị",
        "description": "Gom máy tính xách tay, máy tính bảng và điện thoại được cho tặng. Xóa sạch từng máy, cập nhật và cài đặt cho dễ dùng. Thử cho chạy hết mọi thứ trước khi cho mượn.",
        "hours": 8,
        "skills": [
          "rành máy tính",
          "lái xe"
        ]
      },
      {
        "name": "Dựng cách cho mượn",
        "description": "Làm một sổ mượn đơn giản: ai mượn cái gì, tình trạng ra sao, hẹn trả ngày nào. Định thời gian cho mượn và một lệ trả trễ rộng lượng, đặt trên lòng tin.",
        "hours": 3,
        "skills": [
          "nhập liệu"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Lo đường mạng",
        "description": "Có máy mà không có mạng thì cũng ít dùng được. Cho mượn bộ phát Wi-Fi di động, bắt tay với thư viện, hoặc chỉ cho mọi người các gói mạng giá rẻ và những chỗ có Wi-Fi công cộng miễn phí.",
        "hours": 3,
        "skills": [
          "rành máy tính",
          "kết nối"
        ]
      },
      {
        "name": "Rủ và tập cho người kèm",
        "description": "Tìm những người kiên nhẫn và chỉ cho họ cách dạy mà không dùng từ chuyên môn. Nhấn mạnh: đi theo nhịp của người học và đừng bao giờ giành lấy con chuột.",
        "hours": 4,
        "skills": [
          "dạy học"
        ]
      },
      {
        "name": "Soạn bài học cho người mới bắt đầu",
        "description": "Dựng những bài ngắn về những thứ thiết yếu: email, an toàn trên mạng, nộp hồ sơ xin việc, khám bệnh từ xa, giấy tờ hành chính và gọi video. Có kèm tờ hướng dẫn in sẵn.",
        "hours": 4,
        "skills": [
          "dạy học",
          "viết lách"
        ]
      },
      {
        "name": "Xếp lịch lớp và giờ ghé hỏi",
        "description": "Mở cả lớp học có bài bản lẫn những giờ “ghé hỏi chuyện máy móc” tự do. Đổi giờ cho hợp với người đi làm, và giữ lớp nhỏ.",
        "hours": 3,
        "recurringCadence": "session",
        "skills": [
          "tổ chức"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Đặt lệ về dữ liệu và về việc trả máy",
        "description": "Xóa sạch máy giữa hai người mượn, chỉ cho mọi người thói quen đặt mật khẩu và giữ riêng tư, và nói rõ dữ liệu cá nhân được giữ thế nào. Có sẵn cách xử lý khi máy mất hay hỏng.",
        "hours": 2,
        "skills": [
          "rành máy tính",
          "viết lách"
        ]
      }
    ]
  },
  {
    "id": "weatherization-brigade",
    "name": "Đội sửa nhà và chống nóng chống lạnh",
    "purpose": "Giúp hàng xóm thu nhập thấp, người cao tuổi và người khuyết tật sửa nhà và che chắn cho nhà, để bớt tiền điện nước và ở an toàn hơn.",
    "whoItServes": "Chủ nhà thu nhập thấp, người cao tuổi và hàng xóm khuyết tật không tự làm được và cũng không kham nổi chi phí.",
    "whatYoullNeed": "Người giúp có tay nghề, vật tư, đồ nghề và một cách tiếp nhận lời nhờ. Chỉ nhận những việc trong tầm tay của người không chuyên — việc điện, gas, kết cấu và mái nhà thì chuyển cho thợ có giấy phép.",
    "setupHours": 21,
    "defaultCategory": "housing",
    "suggestsWorkDays": true,
    "firstSteps": "Trước tiên hãy tập hợp những người có tay nghề nhất và cùng nhau vạch ra ranh giới công việc — việc nào mình nhận, việc nào chuyển cho thợ có giấy phép — trước khi nhận bất kỳ lời nhờ nào. Hãy coi lần đầu đến mỗi nhà là một cuộc trò chuyện chứ không phải một cuộc kiểm tra: chủ nhà mới là người quyết định trong nhà mình được động vào những gì.",
    "commonPitfalls": "Cái nguy là việc cứ phình ra: cái “sửa tí thôi” hóa ra là việc điện, gas hay mái nhà, vượt quá tầm tay người không chuyên — đó chính là lúc có người bị thương. Và đừng hứa nhiều buổi hơn sức nhóm làm được; để một cụ già cứ chờ mãi sự giúp đỡ mà họ đã trông cậy còn đau hơn một lời từ chối thật lòng ngay từ đầu.",
    "pairsWith": [
      "community-wood-bank",
      "tool-lending-library"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Rủ những người có tay nghề",
        "description": "Tìm những người quen tay với việc mộc cơ bản, trám khe, cách nhiệt và dán gioăng chắn gió. Vài người dày dạn hơn có thể dẫn dắt số còn lại.",
        "hours": 4,
        "skills": [
          "mộc",
          "sửa nhà"
        ]
      },
      {
        "name": "Vạch ranh giới công việc",
        "description": "Định rõ mình sẽ làm gì và không làm gì. Chỉ nhận những việc an toàn, đơn giản (che chắn mưa gió, lắp tay vịn, sửa vặt) và loại hết những việc cần thợ có giấy phép, như việc điện hay gas lớn.",
        "hours": 2,
        "skills": [
          "sửa nhà"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Dựng cách nhận lời nhờ và đi khảo sát",
        "description": "Tạo một cách để hàng xóm ngỏ lời nhờ, rồi ghé qua một lần cho nhanh để xem việc lớn cỡ nào, liệt kê vật tư và xác nhận nó nằm trong tay nghề và giới hạn an toàn của nhóm.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Kiếm vật tư và đồ nghề",
        "description": "Gom keo trám, gioăng chắn gió, vật liệu cách nhiệt và ốc vít cơ bản qua các nguồn cho tặng, giảm giá hoặc một khoản chi nhỏ. Giữ một bộ đồ nghề dùng chung.",
        "hours": 4,
        "skills": [
          "lái xe"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Lo an toàn và trách nhiệm",
        "description": "Dùng giấy miễn trừ trách nhiệm đơn giản, mang theo đồ sơ cứu, bắt buộc đồ bảo hộ đúng cách, và không bao giờ làm việc vượt quá tay nghề. Hỏi tư vấn về bảo hiểm trách nhiệm cho việc sửa chữa do người giúp làm.",
        "hours": 3,
        "skills": [
          "giấy tờ"
        ]
      },
      {
        "name": "Xếp lịch và chạy những ngày chung tay",
        "description": "Ghép việc với từng nhóm người giúp, xác nhận lại với chủ nhà, và làm xong việc trong một buổi tập trung. Suốt buổi, giữ ý với ngôi nhà và với mong muốn của người đang ở đó.",
        "hours": 5,
        "skills": [
          "tổ chức",
          "sửa nhà"
        ],
        "follows": [
          1,
          2,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "pet-food-bank",
    "name": "Ngân hàng thức ăn cho thú cưng và giúp chăm sóc thú nuôi",
    "purpose": "Cho thức ăn thú cưng miễn phí và giúp chăm sóc cơ bản, để không ai phải bỏ con vật của mình chỉ vì không kham nổi chi phí.",
    "whoItServes": "Người nuôi thú cưng có thu nhập thấp, người già sống bằng khoản trợ cấp cố định, và những hàng xóm không có nhà cửa mà vẫn giữ con vật bên mình.",
    "whatYoullNeed": "Chỗ chứa, một nguồn thức ăn đều đặn, một điểm phát, và các phòng khám thú y cùng chung tay.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Nói chuyện trước với kho thực phẩm cộng đồng đang có về việc phát chung một buổi — thường vẫn là những gia đình ấy cần cả hai thứ — rồi hỏi các phòng khám thú y và cửa hàng thú cưng quanh vùng về chuyện quyên góp, và biết đâu là một đợt tiêm phòng hay giảm giá cùng nhau.",
    "commonPitfalls": "Thất thường mới là thứ làm hỏng nhiều nhất: một đợt quyên góp thật lớn, rồi kệ trống trơn, trong khi người nuôi thú cưng cần trông cậy được vào bạn. Và để ý giọng điệu — bất kỳ lời phán xét kiểu 'người nghèo thì nuôi thú cưng làm gì' cũng giết dự án này nhanh hơn cả việc hết sạch thức ăn hạt.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "community-fridge"
    ],
    "tasks": [
      {
        "name": "Tìm chỗ chứa và một điểm phát",
        "description": "Kiếm một chỗ chứa khô ráo, kín chuột bọ, và một nơi để trao thức ăn tận tay — thường là ngay cạnh một kho thực phẩm cộng đồng hoặc nhà văn hóa sẵn có.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Gây dựng nguồn thức ăn đều đặn",
        "description": "Kết hợp các đợt quyên góp, hàng tặng từ cửa hàng thú cưng và nhà sản xuất, cùng việc mua sỉ. Ghi lại những gì nhận được để còn tính trước các buổi phát.",
        "hours": 3,
        "skills": [
          "kết nối",
          "lái xe"
        ]
      },
      {
        "name": "Phân loại và kiểm đếm theo loài và cỡ con vật",
        "description": "Tách riêng thức ăn cho chó và cho mèo (và các con vật khác), ghi số lượng, và xem hạn dùng. Giữ một bảng đếm luôn cập nhật để biết khi nào cần bổ sung.",
        "hours": 1.5,
        "skills": [
          "tổ chức",
          "nhập liệu"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Đặt ra quy tắc phát thức ăn",
        "description": "Quyết định mỗi nhà nhận bao nhiêu và bao lâu một lần, không đòi ai chứng minh gì cả. Làm sao cho đều đặn để mọi người còn tính trước được.",
        "hours": 1,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Xếp lịch và cắt cử người cho buổi phát",
        "description": "Định giờ phát cố định, rủ thêm người góp một tay, và giữ giọng điệu không phán xét. Nhiều người nhịn ăn để nuôi con vật của mình — hãy đón họ bằng sự tôn trọng.",
        "hours": 2.5,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "youth-mentorship",
    "name": "Dìu dắt trẻ và chương trình sau giờ học",
    "purpose": "Cho trẻ nhỏ và thiếu niên một chỗ an toàn sau giờ học, có người kèm bài, có người dìu dắt và có hoạt động bổ ích.",
    "whoItServes": "Trẻ em ở những nơi thiếu thốn điều kiện, và cha mẹ đi làm cần một chỗ trông con an toàn.",
    "whatYoullNeed": "Một chỗ an toàn, những người lớn đã được kiểm tra lý lịch, các hoạt động và đồ ăn nhẹ. Làm việc với trẻ là trách nhiệm rất nặng — kiểm tra lý lịch người lớn, giữ quy tắc luôn có hai người lớn, làm đúng luật bắt buộc trình báo, và theo đúng quy định của địa phương về chương trình cho trẻ.",
    "setupHours": 28,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Trước khi rủ một người dìu dắt nào, hãy nói chuyện với cha mẹ và với chính các em về điều các em cần, rồi viết ra giấy các quy tắc an toàn — kiểm tra lý lịch, quy tắc luôn có hai người lớn, bắt buộc trình báo. Không người lớn nào được ở cạnh trẻ trước khi qua được cái ngưỡng đó.",
    "commonPitfalls": "Hỏng nặng nhất là đi tắt chuyện an toàn: một người lớn chưa kiểm tra lý lịch, hoặc một người lớn ở riêng với một đứa trẻ — chuyện đó không bao giờ được thương lượng. Thứ hai là người dìu dắt thay đổi xoành xoạch; với những đứa trẻ vốn đã từng bị bỏ rơi, một người lớn biến mất là một vết thương, nên hãy bắt đầu nhỏ và chỉ lớn tới mức bạn còn trông nom và giữ được.",
    "pairsWith": [
      "school-supply-program",
      "childcare-collective",
      "community-music"
    ],
    "learnMore": [
      "how-vouching-works"
    ],
    "tasks": [
      {
        "name": "Giữ được một chỗ an toàn và định giờ giấc",
        "description": "Tìm một nơi phù hợp, dễ tới — một phòng học, thư viện hay nhà văn hóa — và định giờ sau giờ học thật đều đặn để các gia đình trông cậy được.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Đặt chuẩn an toàn cho trẻ và cách kiểm tra người lớn",
        "description": "Yêu cầu kiểm tra lý lịch với người lớn làm việc cùng trẻ, giữ quy tắc luôn có hai người lớn để không ai ở riêng với một đứa trẻ, và đặt rõ quy tắc ứng xử cùng cách trình báo.",
        "hours": 6,
        "skills": [
          "trông trẻ",
          "viết lách"
        ]
      },
      {
        "name": "Rủ và tập huấn cho những người dìu dắt",
        "description": "Tìm những người lớn đáng tin và biết thương trẻ, rồi tập huấn cho họ về ranh giới, an toàn cho trẻ, và cách nâng đỡ mà không làm hộ các em. Hướng tới sự đều đặn tuần này qua tuần khác.",
        "hours": 6,
        "skills": [
          "kết nối",
          "dạy học"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Lên chương trình sinh hoạt",
        "description": "Trộn kèm bài với hoạt động bổ ích — đọc sách, vẽ vời, thể thao, những điều cần cho đời sống. Giữ cho vui và để chính các em góp phần chọn.",
        "hours": 4,
        "skills": [
          "dạy học"
        ]
      },
      {
        "name": "Lo phần ghi danh, dị ứng và thông tin khẩn cấp",
        "description": "Xin cha mẹ cho phép, ghi rõ dị ứng và tình trạng sức khỏe, số gọi khi khẩn cấp, và ai được phép đón từng em. Cất giữ những thứ này thật kín.",
        "hours": 3,
        "skills": [
          "giấy tờ",
          "nhập liệu"
        ]
      },
      {
        "name": "Kiếm đồ ăn nhẹ và vật dụng",
        "description": "Lo một món ăn nhẹ lành mạnh (nhiều em tới lớp khi bụng còn đói) và gom sách, đồ vẽ, trò chơi qua quyên góp hoặc một khoản nhỏ.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Chạy các buổi sinh hoạt và giữ liên lạc với gia đình",
        "description": "Mở cửa, trông nom sát sao, dẫn các hoạt động, và thường xuyên nói với cha mẹ về chuyện của con họ.",
        "hours": 4,
        "skills": [
          "trông trẻ",
          "dạy học"
        ],
        "follows": [
          0,
          2,
          3,
          4
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "gleaning-network",
    "name": "Mạng lưới giải cứu nông sản",
    "purpose": "Thu về phần rau trái dư từ nông trại, vườn cây, vườn nhà và chợ, rồi chia lại cho mọi người trước khi chúng bị bỏ phí.",
    "whoItServes": "Hàng xóm đang thiếu ăn và các dự án thực phẩm như tủ lạnh cộng đồng, kho thực phẩm và bữa cơm chung.",
    "whatYoullNeed": "Người góp một tay, phương tiện chở, mối quan hệ với nhà vườn, và chỗ trữ tạm.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Bắt đầu từ nhà vườn: nông trại, vườn cây và các sạp chợ. Hỏi họ đang dư thứ gì và họ ngại điều gì khi cho người lạ vào vườn — trách nhiệm nếu có chuyện, cây cối bị giẫm hỏng — rồi chốt trước chỗ nhận nông sản (tủ lạnh cộng đồng, kho thực phẩm, bữa cơm chung) trước buổi thu hái đầu tiên.",
    "commonPitfalls": "Hỏng kiểu kinh điển là cứu được đống trái cây rồi để nó thối trong nhà kho của ai đó — chỗ nhận phải chốt trước khi hái, chứ không phải sau. Mùa thu hoạch rất ngắn, nên một đội nhỏ mà đi nhanh hơn hẳn một danh sách dài toàn tên người; và chỉ một buổi hái cẩu thả làm hỏng vườn là mất luôn nhà vườn đó.",
    "pairsWith": [
      "community-fridge",
      "food-preservation",
      "community-meal"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Tìm nguồn rau trái",
        "description": "Liên hệ nông trại, vườn cây, sạp chợ và những hàng xóm có cây trái trĩu quả ăn không hết. Nhiều người mừng vì phần dư được hái đi thay vì rụng thối.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Gom một đội thu hái",
        "description": "Lập danh sách những người góp một tay có thể lên đường nhanh khi rau trái tới lứa. Mùa thu hoạch rất ngắn, nên linh động quan trọng hơn đông người.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Lo xe chở và chỗ trữ",
        "description": "Sắp sẵn xe để chở nông sản và một chỗ mát để giữ tạm. Phối hợp sao cho thực phẩm đi thật nhanh từ vườn tới tay người nhận trước khi hỏng.",
        "hours": 3,
        "skills": [
          "lái xe"
        ]
      },
      {
        "name": "Dựng cách xếp lịch và báo tin",
        "description": "Tạo một cách báo tin và chốt người thật nhanh mỗi khi có buổi thu hái, vì nhà vườn thường báo rất sát giờ. Một nhóm chat hay một danh sách số điện thoại là đủ.",
        "hours": 2,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Giải quyết trách nhiệm và an toàn thực phẩm",
        "description": "Tìm hiểu quy định bảo vệ người quyên góp thực phẩm ở nơi bạn ở, thống nhất vài quy tắc giữ gìn đơn giản, và dùng một tờ miễn trừ trách nhiệm gọn nhẹ để nhà vườn thấy yên tâm khi mở cửa vườn.",
        "hours": 3,
        "skills": [
          "giấy tờ",
          "an toàn thực phẩm"
        ]
      },
      {
        "name": "Dựng các đầu ra để chia",
        "description": "Chốt sẵn nơi nhận nông sản thu về — tủ lạnh cộng đồng, kho thực phẩm, bữa cơm chung, hay đưa thẳng tới các gia đình — để không thứ gì nằm không.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Tổ chức các buổi thu hái và ghi lại số kg",
        "description": "Hái cẩn thận để giữ vườn nguyên vẹn, chia đi ngay, và ghi lại đã cứu được bao nhiêu thực phẩm. Những con số đó giúp rủ thêm người và thêm nhà vườn.",
        "hours": 4,
        "skills": [
          "làm vườn",
          "lái xe"
        ],
        "follows": [
          0,
          2,
          3,
          5
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-mediation",
    "name": "Mạng lưới hòa giải và tháo gỡ bất đồng trong cộng đồng",
    "purpose": "Cho hàng xóm một chỗ hòa giải miễn phí và trung lập, tháo gỡ bất đồng mà không cần tới tòa án hay công an.",
    "whoItServes": "Hàng xóm, người thuê nhà và chủ nhà, người ở chung, và các nhóm trong cộng đồng đang có bất đồng.",
    "whatYoullNeed": "Những người hòa giải đã được tập huấn, một chỗ trung lập, và một cách nhận yêu cầu. Hòa giải chỉ dành cho bất đồng giữa những bên đều tự nguyện — hãy sàng lọc và chuyển mọi tình huống có bạo lực, xâm hại hay nguy hiểm sang đúng người có chuyên môn hoặc sang cấp cứu.",
    "setupHours": 22,
    "defaultCategory": "other",
    "firstSteps": "Nói chuyện trước với một trung tâm hòa giải cộng đồng sẵn có hoặc với người chuyên tập huấn — nghề này không ứng biến được — và trước ca đầu tiên, hãy viết ra giấy lằn ranh sàng lọc của bạn: nhận những bất đồng nào, và chuyển đi đâu mọi chuyện dính tới bạo lực hay xâm hại.",
    "commonPitfalls": "Cái hỏng nguy hiểm là đem hòa giải thứ lẽ ra không được hòa giải: một 'bất đồng hàng xóm' mà thật ra là bạo hành sẽ đẩy ai đó vào nguy hiểm, nên hãy sàng lọc từng yêu cầu. Và giữ kín chuyện là toàn bộ vốn liếng của dự án — chỉ một chi tiết lọt ra là không còn ai tin nữa; cũng nhớ chăm cho chính những người hòa giải, vì việc này bào mòn con người.",
    "pairsWith": [
      "legal-aid-clinic",
      "tenant-union"
    ],
    "learnMore": [
      "disagree-with-member"
    ],
    "tasks": [
      {
        "name": "Rủ và tập huấn cho những người hòa giải",
        "description": "Tìm những người điềm tĩnh, công tâm và cho họ đi học, qua một khóa hòa giải được công nhận hoặc bằng cách bắt tay với một trung tâm hòa giải cộng đồng sẵn có.",
        "hours": 6,
        "skills": [
          "kết nối",
          "điều phối"
        ]
      },
      {
        "name": "Dựng cách nhận yêu cầu và hỏi chuyện ban đầu",
        "description": "Tạo một cách thật đơn giản để mọi người xin hòa giải. Lúc hỏi chuyện ban đầu, nghe những điều cơ bản từ từng bên và xem ca này có hợp để hòa giải không.",
        "hours": 3,
        "skills": [
          "tổ chức",
          "phỏng vấn"
        ]
      },
      {
        "name": "Tìm những chỗ gặp trung lập",
        "description": "Kiếm những nơi yên tĩnh, trung lập — một phòng thư viện hay nhà văn hóa — nơi cả hai bên đều thấy an toàn và ngang hàng nhau.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Xác định phạm vi và giới hạn",
        "description": "Quyết định bạn hòa giải chuyện gì (tiếng ồn, chỗ dùng chung, bất đồng nhỏ) và không nhận chuyện gì. Sàng lọc ra những tình huống có bạo lực, xâm hại hay nguy cơ mất an toàn và chuyển sang đúng người có chuyên môn.",
        "hours": 3,
        "skills": [
          "điều phối",
          "viết lách"
        ]
      },
      {
        "name": "Đặt quy ước giữ kín và các quy tắc chung",
        "description": "Đặt quy tắc rõ ràng: giữ kín, tham gia tự nguyện, nói lần lượt và tôn trọng, và người hòa giải chỉ dẫn dắt chứ không phán quyết. Viết ra giấy cho người tham gia đọc.",
        "hours": 3,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Cho mọi người biết là có chỗ hòa giải",
        "description": "Cho hàng xóm, các nhóm về nhà ở và các tổ chức quanh vùng biết là có hòa giải miễn phí, để mọi người tìm tới trước khi bất đồng bùng lên.",
        "hours": 3,
        "skills": [
          "kết nối",
          "thiết kế đồ họa"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Theo dõi kết quả và chăm cho người hòa giải",
        "description": "Ghi lại tỷ lệ tháo gỡ được (mà không hé lộ chuyện riêng của ai) và ngồi lại với người hòa giải đều đặn. Việc này rút sức, nên hãy luân phiên các ca và luôn có người đỡ lưng.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "nhập liệu",
          "điều phối"
        ]
      }
    ]
  },
  {
    "id": "reentry-support",
    "name": "Mạng lưới nâng đỡ người trở về sau khi mãn hạn tù",
    "purpose": "Giúp người trở về sau khi mãn hạn tù làm lại giấy tờ, có chỗ ở, có việc làm và có cộng đồng, để quãng chuyển tiếp vốn rất khó này bớt nặng.",
    "whoItServes": "Người từng ở tù và gia đình họ.",
    "whatYoullNeed": "Người góp một tay, các tổ chức cùng làm, và một cuốn danh bạ nguồn giúp đỡ thật chắc. Hãy coi quá khứ và hồ sơ của mỗi người là chuyện riêng — lấy sự tôn trọng làm đầu, đi theo mục tiêu của chính họ, và chuyển những chuyện pháp lý cho người có chuyên môn.",
    "setupHours": 28,
    "defaultCategory": "other",
    "firstSteps": "Trước khi dựng bất cứ thứ gì, hãy ngồi xuống với chính những người đã trở về, và với các tổ chức lo việc tái hòa nhập, cơ quan quản lý sau khi ra tù, và những nơi làm việc sẵn lòng cho cơ hội thứ hai đang hoạt động quanh vùng — hỏi xem điều gì thật sự chặn người ta trong mấy tuần đầu, và mạng lưới của bạn nằm ở đâu trong đó. Tìm sẵn ngay một mối liên hệ trợ giúp pháp lý hay một luật sư có chuyên môn, để khi có câu hỏi pháp lý thì đã có chỗ thật để gửi tới.",
    "commonPitfalls": "Dự án này chết khi nó biến thành chuyện gác cửa — người góp một tay ngồi phán ai xứng đáng được giúp — hoặc khi quá khứ của ai đó lọt ra ngoài và làm họ mất việc, mất chỗ trọ. Nó cũng lụi đi âm thầm khi hăng hái nhiều hơn theo tới cùng; một lời hứa gãy làm đau người đang gây dựng lại niềm tin hơn cả việc chẳng hứa gì.",
    "pairsWith": [
      "court-support",
      "books-to-prisoners"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Dựng danh bạ nguồn giúp đỡ và các nơi cùng làm",
        "description": "Vẽ ra bản đồ những nơi lo giấy tờ tùy thân, chỗ ở, việc làm, khám chữa bệnh, cai nghiện và trợ cấp. Xác định nơi làm việc và chủ nhà nào sẵn lòng nhận người từng có tiền án.",
        "hours": 6,
        "skills": [
          "kết nối",
          "nhập liệu"
        ]
      },
      {
        "name": "Rủ và tập huấn cho những người góp một tay",
        "description": "Tìm những người không phán xét và tập huấn cho họ cách nâng đỡ tôn trọng, hiểu về sang chấn. Người trở về cần người đi cùng, không cần người gác cửa.",
        "hours": 5,
        "skills": [
          "kết nối",
          "dạy học"
        ]
      },
      {
        "name": "Làm một buổi đón và hỏi xem cần gì nhất",
        "description": "Dựng một cách đơn giản mà vẫn giữ thể diện để biết mỗi người đang cần gấp nhất điều gì — thường là giấy tờ, một chỗ ngả lưng và chút thu nhập — rồi ưu tiên từ đó.",
        "hours": 3,
        "skills": [
          "phỏng vấn"
        ]
      },
      {
        "name": "Giúp làm giấy tờ và xin trợ cấp",
        "description": "Giúp làm lại giấy tờ tùy thân và thẻ an sinh xã hội, xin trợ cấp, và những thủ tục khác vốn rất khó làm khi không có địa chỉ và không có mạng.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "giấy tờ"
        ]
      },
      {
        "name": "Nối với việc làm và chỗ ở",
        "description": "Giới thiệu ân cần tới những nơi làm việc sẵn lòng cho cơ hội thứ hai và những chỗ ở khả dĩ, rồi giúp làm đơn, viết hồ sơ xin việc và tập trả lời phỏng vấn.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "kết nối",
          "viết lách"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ghép người dìu dắt cùng cảnh ngộ",
        "description": "Nếu được, hãy ghép mỗi người với một người dìu dắt đã tự mình đi qua chặng trở về. Chỗ từng trải chung ấy dựng lòng tin nhanh hơn bất cứ thứ gì.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Đặt nếp giữ kín và giữ ranh giới",
        "description": "Giữ kín tuyệt đối quá khứ của mỗi người, không bao giờ ép ai kể nhiều hơn họ muốn, và chuyển mọi câu hỏi pháp lý cho luật sư có chuyên môn.",
        "hours": 3,
        "skills": [
          "viết lách"
        ]
      }
    ]
  },
  {
    "id": "community-wood-bank",
    "name": "Ngân hàng củi của cộng đồng / giúp nhau sưởi ấm",
    "purpose": "Gom và chia củi, và lo giúp nhau chuyện sưởi ấm để hàng xóm ấm áp suốt mùa đông.",
    "whoItServes": "Các hộ thu nhập thấp và hộ ở vùng quê sưởi bằng củi, và người già không tự đi kiếm hay bổ củi được.",
    "whatYoullNeed": "Một nguồn củi, một chỗ để xử lý và trữ, đồ nghề, một tổ thợ đã được tập huấn, và một kế hoạch giao củi. Cưa máy và máy chẻ củi rất nguy hiểm — chỉ cho người đã được tập huấn cầm máy, bắt buộc mặc đồ bảo hộ, và dặn dò an toàn cho cả tổ trước mỗi buổi.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Bắt đầu bằng việc nói chuyện với các hộ đang sưởi bằng củi — người già ở quê, những gia đình mà nơi trợ cấp chất đốt đã biết — để nắm họ đốt bao nhiêu và khi nào thì hụt, rồi gọi các nhóm cắt tỉa cây quanh vùng hỏi xem gỗ của họ giờ đi đâu. Trước khi có cái cưa nào nổ máy, hãy chọn ra người chịu trách nhiệm an toàn: một người đủ kinh nghiệm để chỉ lại cho cả tổ và đủ cứng để nói không với một người đang hăng hái.",
    "commonPitfalls": "Hai cách dự án này làm hại người ta: một người chưa được tập huấn cầm cưa máy, và giao củi tươi — thứ củi chỉ tỏa khói, đóng muội nhựa lên ống khói và chẳng ấm được bao nhiêu. Cắt vào tháng Mười để đốt tháng Mười Hai nghĩa là củi còn ướt — hỏng về lịch cũng thật như hỏng về an toàn.",
    "pairsWith": [
      "weatherization-brigade",
      "cooling-warming-center"
    ],
    "tasks": [
      {
        "name": "Kiếm một nguồn củi",
        "description": "Lo nguồn từ các nhóm cắt tỉa cây, dọn dẹp sau bão, cây đổ được cho, hoặc những khoảnh rừng trồng có quản lý bền vững. Xác nhận bạn được phép lấy và xử lý số gỗ đó.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Tìm chỗ xử lý và trữ củi",
        "description": "Kiếm một cái sân hay khoảnh đất để cưa, chẻ, xếp và hong khô củi. Bạn cần chỗ vừa giữ khô củi cho mùa này vừa hong củi cho mùa sau.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Lo đồ nghề và đồ bảo hộ",
        "description": "Kiếm hoặc mượn một máy chẻ củi, mấy cái cưa máy, và đồ bảo hộ (quần chống cưa, kính, bịt tai, găng tay). Giữ đồ nghề luôn tốt và để sẵn một túi sơ cứu tại chỗ.",
        "hours": 4,
        "skills": [
          "lái xe",
          "sửa đồ nghề"
        ]
      },
      {
        "name": "Gom và tập huấn cho tổ làm củi",
        "description": "Lập một tổ và giữ chắc rằng chỉ những người đã được tập huấn tử tế mới cầm cưa máy và máy chẻ. Dặn dò an toàn trước mỗi ngày chung tay.",
        "hours": 4,
        "skills": [
          "dạy học",
          "kết nối"
        ]
      },
      {
        "name": "Dựng cách nhận yêu cầu và giao củi",
        "description": "Tạo cách để các hộ xin củi và hẹn giao, vì nhiều người nhận đã già hoặc không có xe tải. Xác nhận chỗ xếp củi gần nhà là an toàn.",
        "hours": 3,
        "skills": [
          "tổ chức",
          "lái xe"
        ]
      },
      {
        "name": "Đặt tiêu chí chia củi",
        "description": "Quyết mỗi hộ nhận bao nhiêu và ưu tiên những người dễ gặp nguy nhất khi trời rét. Giữ cách làm thật đơn giản, không dựng rào cản.",
        "hours": 2,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Xếp lịch những ngày chung tay và việc hong khô",
        "description": "Lên lịch cưa và chẻ thật sớm trước mùa đông, vì củi tươi phải hong hàng tháng trời mới đốt an toàn được. Ghi lại mẻ nào đã khô và sẵn sàng.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "tổ chức"
        ],
        "follows": [
          0,
          1,
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "community-wifi-mesh",
    "name": "Wi-Fi miễn phí cho cộng đồng / mạng mesh",
    "purpose": "Cho mọi người vào mạng miễn phí ở những nơi internet quá đắt hoặc không có.",
    "whoItServes": "Các hộ thu nhập thấp, học sinh sinh viên, người đang tìm việc, và bất kỳ ai bị cắt khỏi một đường mạng ổn định.",
    "whatYoullNeed": "Một đường truyền gốc, router và các điểm phát mesh, những người góp một tay rành kỹ thuật, và các nhà cho đặt máy.",
    "setupHours": 32,
    "defaultCategory": "tech",
    "firstSteps": "Đi bộ qua từng dãy phố bạn muốn phủ sóng và gõ cửa — nói chuyện với các hộ chưa có mạng xem họ sẽ dùng vào việc gì, và với những người có mái nhà hay cửa sổ tầng trên có thể đặt một điểm phát. Trước khi mua thiết bị, hãy nói cho xong chuyện đường truyền: tìm cửa hàng, thư viện hay nhà mạng chịu chia sẻ một đường, và lấy văn bản xác nhận là được phép chia lại.",
    "commonPitfalls": "Mạng mesh thường chết vì không ai bảo dưỡng, chứ không phải vì dựng không xong — người rành kỹ thuật đứng ra lập mạng chuyển đi nơi khác và chẳng ai còn đăng nhập được vào router, nên hãy ghi chép lại mọi thứ và chỉ nghề cho người thứ hai ngay từ ngày đầu. Cái hỏng âm thầm còn lại là dựng ở nơi sóng dễ tới thay vì nơi người ta thật sự thiếu mạng.",
    "pairsWith": [
      "digital-literacy",
      "emergency-preparedness"
    ],
    "tasks": [
      {
        "name": "Vẽ bản đồ nơi cần sóng và nơi còn trống",
        "description": "Xác định dãy phố nào không có mạng vừa túi tiền và sóng có thể tới đâu. Ghi lại những tòa nhà nhìn thẳng được tới nhau và chủ nhà sẵn lòng. Việc này định hình cả thiết kế.",
        "hours": 4,
        "skills": [
          "rành máy tính"
        ]
      },
      {
        "name": "Kiếm một đường truyền gốc",
        "description": "Lo một nguồn băng thông để chia sẻ — một đường của cửa hàng được tặng, một thỏa thuận với nhà mạng, hay một đường nối từ mạng cộng đồng khác. Xác nhận điều khoản cho phép chia lại.",
        "hours": 5,
        "skills": [
          "kết nối",
          "rành máy tính"
        ]
      },
      {
        "name": "Rủ những người góp một tay rành kỹ thuật",
        "description": "Tìm những người quen tay với mạng, biết cấu hình router và gỡ rối. Chỉ cần vài người là bắt đầu được, thêm vài người chịu học.",
        "hours": 3,
        "skills": [
          "kết nối",
          "rành máy tính"
        ]
      },
      {
        "name": "Kiếm và cấu hình thiết bị",
        "description": "Gom router, điểm phát mesh và ăng ten qua quyên góp hoặc một khoản nhỏ. Cấu hình cho một mạng mở hoặc dùng chung đơn giản, rồi thử vùng phủ sóng.",
        "hours": 10,
        "skills": [
          "rành máy tính"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Tìm nhà cho đặt điểm phát",
        "description": "Đặt các điểm phát ở nơi kéo dài được tầm sóng — mái nhà, cửa sổ tầng trên, hiên nhà có điện và có người cho phép. Xin mỗi nhà một cái gật đầu bằng giấy và trả giúp chút tiền điện.",
        "hours": 5,
        "skills": [
          "kết nối"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Đặt lệ dùng mạng và nếp riêng tư",
        "description": "Dán vài quy tắc đơn giản, không ghi lại việc mọi người làm trên mạng, và nói rõ rằng mạng mở thì không kín đáo. Chỉ cho mọi người vài cách tự giữ an toàn như HTTPS và VPN.",
        "hours": 2,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Bảo dưỡng và mở rộng mạng",
        "description": "Kiểm các điểm phát đều đặn, thay thiết bị hỏng, và phủ thêm khi có nhà mới nhận đặt máy. Ghi chép lại cách dựng để người khác cùng bảo dưỡng được.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "rành máy tính"
        ],
        "follows": [
          3,
          4
        ]
      }
    ]
  },
  {
    "id": "mental-health-peer-support",
    "name": "Vòng tròn cùng cảnh nâng đỡ nhau về sức khỏe tinh thần",
    "purpose": "Mở một chỗ an toàn, đều đặn, do chính những người cùng cảnh dẫn dắt, để mọi người kể ra và nâng đỡ nhau — đi kèm chứ không thay cho việc chữa trị chuyên môn.",
    "whoItServes": "Bất kỳ ai đang đi qua căng thẳng, cô đơn, mất mát hay khó khăn về tinh thần và muốn có người cùng cảnh bên cạnh.",
    "whatYoullNeed": "Những người dẫn dắt đã được tập huấn, một chỗ kín đáo, ranh giới rõ ràng và một kế hoạch chuyển tiếp khi có khủng hoảng. Việc cùng cảnh nâng đỡ nhau đi kèm với chăm sóc tinh thần chuyên môn — nó không thay thế được. Người dẫn dắt không phải nhà trị liệu, và luôn phải có sẵn một kế hoạch rõ ràng để nối người đang khủng hoảng tới chuyên gia hoặc tới nguồn cấp cứu.",
    "setupHours": 21,
    "defaultCategory": "emotional_support",
    "firstSteps": "Những cuộc nói chuyện đầu tiên là với những người có thể đứng ra dẫn dắt, và với những nơi chăm sóc sức khỏe tinh thần quanh vùng — một phòng khám, một đường dây khủng hoảng, hay một chuyên gia tâm lý nhận làm nơi bạn chuyển tiếp tới, trước cả buổi họp vòng tròn đầu tiên. Đừng mở cửa cho tới khi người dẫn dắt đã được tập huấn và ai cũng nói được rành mạch vòng tròn này là gì và không phải là gì.",
    "commonPitfalls": "Cái hỏng nguy hiểm là trôi dần: một vòng tròn ấm áp từ từ trở thành chỗ dựa duy nhất của ai đó, người dẫn dắt bắt đầu đóng vai nhà trị liệu, và chẳng có kế hoạch nào cho cái đêm có người thật sự lâm vào khủng hoảng. Cái lặng lẽ hơn là người dẫn dắt kiệt sức — nếu những người giữ chỗ cho mọi người mà không có ai đỡ lưng, vòng tròn tan trong vòng một năm.",
    "pairsWith": [
      "neighborhood-care-network",
      "disability-support-network",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what",
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Rủ và tập huấn cho những người dẫn dắt",
        "description": "Tìm những người ấm áp, vững vàng và cho họ học một khóa về cùng cảnh nâng đỡ hoặc lắng nghe chủ động. Nói rõ rằng người dẫn dắt là người cùng cảnh giữ chỗ cho mọi người, không phải bác sĩ chẩn đoán hay chữa trị.",
        "hours": 5,
        "skills": [
          "điều phối",
          "kết nối"
        ]
      },
      {
        "name": "Xác định phạm vi và ranh giới của vòng tròn",
        "description": "Nói rõ đây là những người cùng cảnh nâng đỡ nhau, không phải trị liệu và cũng không phải cấp cứu tâm lý. Viết ra vòng tròn này để làm gì và điều gì nằm ngoài vai trò của nó, để ai cũng rõ.",
        "hours": 3,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Dựng kế hoạch chuyển tiếp khi có khủng hoảng",
        "description": "Chuẩn bị các bước rõ ràng cho lúc ai đó đau đớn vượt quá sức nâng đỡ của bạn bè cùng cảnh: cách nhẹ nhàng nối họ tới người có chuyên môn hoặc tới đường dây khủng hoảng, và khi nào thì gọi cấp cứu. Luôn giữ sẵn danh sách nơi trợ giúp còn hiệu lực, cả gần lẫn xa.",
        "hours": 3,
        "skills": [
          "viết lách"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tìm một chỗ kín đáo và an toàn",
        "description": "Kiếm một căn phòng yên tĩnh, dễ chịu, kín đáo, nơi mọi người nói được thoải mái. Cùng một chỗ quen thuộc giúp người ta thấy an tâm mà quay lại.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Đặt quy ước giữ kín và các quy tắc chung",
        "description": "Cùng thống nhất: giữ kín, không khuyên bảo trừ khi được hỏi, không cắt lời, và ai cũng có quyền xin bỏ lượt. Nhắc lại vào đầu mỗi buổi.",
        "hours": 3,
        "skills": [
          "điều phối",
          "viết lách"
        ]
      },
      {
        "name": "Xếp lịch và cho mọi người biết",
        "description": "Chọn một giờ cố định, giữ nhóm ở mức vừa phải, và nói về nó theo cách gỡ bớt định kiến. Nói rõ là miễn phí và ai cũng tới được.",
        "hours": 3,
        "skills": [
          "kết nối",
          "tổ chức"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Đỡ lưng cho người dẫn dắt và giữ họ khỏi kiệt sức",
        "description": "Gặp nhau đều đặn để người dẫn dắt trút bớt và nghỉ ngơi trong lòng. Luân phiên người đứng dẫn, và lo cho họ cũng có chỗ dựa của riêng mình.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "điều phối"
        ]
      }
    ]
  },
  {
    "id": "community-cleanup",
    "name": "Dọn dẹp khu phố và hồi sinh mảng xanh",
    "purpose": "Nhặt rác, hồi sinh những khu đất và công viên bỏ hoang, và tạo ra mảng xanh chung.",
    "whoItServes": "Cả khu phố — chỗ nào sạch hơn, an toàn hơn, xanh hơn thì ai cũng được nhờ.",
    "whatYoullNeed": "Người góp một tay, dụng cụ, giấy phép vào khu đất, và kế hoạch đổ rác. Những nơi bỏ hoang có thể chứa mối nguy thật sự — đừng bao giờ nhặt kim tiêm hay hóa chất lạ bằng tay; hãy dùng dụng cụ và hộp đựng vật sắc nhọn, và xử lý những thứ nguy hiểm theo quy định địa phương.",
    "setupHours": 10,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Hãy đi một vòng khu phố cùng những người sống gần các điểm bỏ hoang nhất — họ biết khu đất nào đáng lo, ai là chủ, và trước đây đã thử làm gì — rồi hỏi xem chính quyền địa phương hay một nhóm bạn của công viên đã tổ chức dọn dẹp sẵn để bạn ghép vào chưa. Làm rõ chủ đất, giấy phép, và rác sẽ đi đâu trước khi chốt ngày.",
    "commonPitfalls": "Các buổi dọn dẹp hỏng theo hai kiểu: những bao rác đã gom nằm ngoài lề đường hàng tuần liền vì không ai lo chỗ đổ, và một khu đất vừa dọn quang đẹp đẽ chỉ vài tháng sau đã lại um tùm ngang thắt lưng vì không có kế hoạch nào sau ngày hội lớn. Còn một người góp một tay thò tay trần nhặt kim tiêm có thể biến một buổi sáng đẹp thành chuyến đi bệnh viện.",
    "pairsWith": [
      "community-garden",
      "community-composting"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Tìm và xếp thứ tự các điểm cần dọn",
        "description": "Đi một vòng quanh khu vực và ghi ra những chỗ cần để mắt tới — góc đường đầy rác, khu đất um tùm, công viên bỏ bê. Xếp thứ tự theo mức tác động và mức khả thi.",
        "hours": 1.5
      },
      {
        "name": "Xin phép và lo kế hoạch đổ rác",
        "description": "Xác nhận ai là chủ từng khu đất và xin phép. Thu xếp trước việc chở rác và xà bần đi — hẹn một thùng rác lớn hoặc một chuyến thu gom của chính quyền địa phương để các bao rác không nằm chất đống.",
        "hours": 2,
        "skills": [
          "kết nối",
          "giấy tờ"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Gom dụng cụ và đồ bảo hộ",
        "description": "Gom găng tay, bao rác, kẹp gắp và áo phản quang. Nhớ kèm một hộp cứng đựng vật sắc nhọn và một cách xử lý cho bất cứ thứ nguy hiểm nào nhặt được.",
        "hours": 1.5,
        "skills": [
          "lái xe"
        ]
      },
      {
        "name": "Rủ người và sắp xếp đội hình",
        "description": "Báo tin cho mọi người biết và ghi tên người tham gia. Cắt cử trưởng nhóm và chia khu để ngày hôm đó gọn gàng chứ không rối tung.",
        "hours": 2,
        "skills": [
          "kết nối",
          "tổ chức"
        ]
      },
      {
        "name": "Chạy ngày dọn dẹp hoặc hồi sinh khu đất",
        "description": "Tổ chức buổi hôm đó, giữ cho các nhóm an toàn và đủ nước uống, rồi cùng nhau mừng kết quả nhìn thấy được. Chụp ảnh trước và sau để lần sau mọi người hào hứng đến đông hơn.",
        "hours": 3,
        "skills": [
          "tổ chức",
          "chụp ảnh"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "free-tax-prep",
    "name": "Khai thuế miễn phí và phòng tư vấn tài chính",
    "purpose": "Giúp hàng xóm thu nhập thấp khai thuế miễn phí và nhận đúng những khoản miễn giảm cùng tiền thuế được trả lại mà họ đáng có.",
    "whoItServes": "Người lao động thu nhập thấp, gia đình đủ điều kiện miễn giảm thuế, người lớn tuổi và học sinh sinh viên.",
    "whatYoullNeed": "Người khai thuế đã được tập huấn và cấp chứng nhận, một chỗ làm việc, máy tính và cách xếp lịch hẹn. Tờ khai thuế phải do người giúp có chứng nhận của một chương trình được công nhận lập — phòng tư vấn này giúp những tờ khai thông thường, không giúp các tình huống phức tạp cần đến người làm thuế chuyên nghiệp.",
    "setupHours": 28,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Cuộc gọi đầu tiên là tới một chương trình khai thuế miễn phí đã có tiếng như VITA — nói chuyện với người điều phối của họ về thời hạn cấp chứng nhận, phần mềm, và một điểm khai thuế mới cần những gì, vì việc này không nên tự làm một mình. Sau đó hỏi chính những hàng xóm bạn mong giúp xem khi nào họ đến được thật, và điều gì đã cản họ khai thuế trước giờ.",
    "commonPitfalls": "Một tờ khai sai có thể làm một gia đình mất tiền thuế được trả lại hoặc bị kiểm tra — vì vậy ranh giới mà dự án này không bao giờ được vượt qua là để người chưa có chứng nhận đi lập tờ khai. Những kiểu hỏng nhẹ hơn: mở cửa vào tháng Ba trong khi việc cấp chứng nhận mất mấy tháng, và ai đó đi xe buýt tới nơi rồi bị trả về chỉ vì một giấy tờ không ai dặn mang theo.",
    "pairsWith": [
      "legal-aid-clinic",
      "solidarity-fund"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Cho người khai thuế đi tập huấn và lấy chứng nhận",
        "description": "Để những người giúp hoàn tất một chứng nhận khai thuế miễn phí được công nhận (như chương trình VITA của IRS) để tờ khai vừa đúng vừa được phép nộp. Điều này không thương lượng.",
        "hours": 10,
        "recurringCadence": "cycle",
        "skills": [
          "kế toán"
        ]
      },
      {
        "name": "Kết nối với một chương trình khai thuế miễn phí được công nhận",
        "description": "Gia nhập một chương trình đã có tiếng để có phần mềm, người đỡ đầu và uy tín. Họ đưa cho bạn công cụ nộp tờ khai và khâu soát chất lượng mà bạn không nên tự dựng một mình.",
        "hours": 4,
        "skills": [
          "kết nối",
          "giấy tờ"
        ]
      },
      {
        "name": "Lo chỗ làm việc và máy móc",
        "description": "Kiếm một chỗ có máy tính, mạng chạy ổn định và đủ kín đáo để mọi người thoải mái chia sẻ chuyện tiền nong nhạy cảm.",
        "hours": 3,
        "skills": [
          "rành máy tính"
        ]
      },
      {
        "name": "Dựng cách hẹn lịch và tiếp nhận",
        "description": "Tạo lịch hẹn và một danh sách rõ ràng những giấy tờ mọi người phải mang theo (giấy tùy thân, giấy tờ thu nhập, tờ khai năm trước). Nhờ vậy không ai đi uổng công hay phải chờ lâu.",
        "hours": 3,
        "skills": [
          "tổ chức",
          "nhập liệu"
        ]
      },
      {
        "name": "Báo tin tới những hàng xóm đủ điều kiện",
        "description": "Báo cho mọi người biết thật rộng, nhấn mạnh rằng khai thuế có thể mở ra những khoản tiền trả lại và miễn giảm mà nhiều người bỏ lỡ. Tới được với người lao động, các gia đình và người lớn tuổi, những nhóm thường đủ điều kiện.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "kết nối",
          "thiết kế đồ họa"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Bảo vệ an toàn và riêng tư cho dữ liệu",
        "description": "Giữ kỹ từng mẩu thông tin cá nhân và tài chính: thiết bị an toàn, không sao chép thừa, cất trong tủ khóa, và một quy định rõ về giữ bao lâu rồi hủy thế nào.",
        "hours": 3,
        "skills": [
          "rành máy tính"
        ]
      },
      {
        "name": "Mời thêm phần đồng hành về tài chính",
        "description": "Khi ai đó muốn, hãy nối họ với người giúp lập kế hoạch chi tiêu, mở tài khoản ngân hàng an toàn và rà soát các khoản trợ cấp. Giữ phần này hoàn toàn tùy chọn và chuyển những tình huống phức tạp tới người có chuyên môn.",
        "hours": 2,
        "skills": [
          "kế toán"
        ]
      }
    ]
  },
  {
    "id": "community-market",
    "name": "Chợ cộng đồng / Sạp nông sản miễn phí",
    "purpose": "Chạy đều một cái sạp miễn phí hoặc trả tùy khả năng, phát rau trái tươi và đồ khô thiết yếu.",
    "whoItServes": "Hàng xóm đang chật vật lo bữa ăn và những người ở khu không có đồ tươi giá phải chăng.",
    "whatYoullNeed": "Một nguồn rau trái, một cái sạp hoặc một chỗ đứng, người góp một tay, và một lịch cố định.",
    "setupHours": 15,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Bắt đầu từ những cuộc nói chuyện về nguồn hàng — ghé các nhà vườn, tiệm tạp hóa và vườn cộng đồng để biết thật ra có bao nhiêu đồ dư và dư theo nhịp nào — rồi hỏi bà con trong khu bạn định phục vụ xem họ vốn hay đi qua đâu và món nào họ thật sự sẽ mang về nhà. Chọn chỗ cùng với người sẽ dùng nó, chứ đừng chọn thay họ.",
    "commonPitfalls": "Một cái sạp lúc có lúc không dạy người ta thôi trông cậy vào nó — đều đặn quan trọng hơn dồi dào. Những kiểu hỏng khác: nguồn hàng cạn sau tháng đầu đầy hào hứng, và bất cứ thứ gì trên bàn (giấy tờ, câu hỏi, việc phân loại người) khiến lấy đồ ăn về giống như đi xin xét duyệt.",
    "pairsWith": [
      "gleaning-network",
      "bulk-buying-coop",
      "community-garden"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Lo nguồn rau trái và hàng hóa",
        "description": "Kiếm đồ ăn qua việc đi mót nông sản còn sót lại, vườn cộng đồng, đồ nhà vườn và tiệm tạp hóa cho, và mua sỉ. Nhắm tới đa dạng và đều đặn để sạp không bị trống trơn.",
        "hours": 3,
        "skills": [
          "kết nối",
          "lái xe"
        ]
      },
      {
        "name": "Kiếm chỗ đứng và dựng sạp",
        "description": "Chọn một chỗ dễ thấy, dễ tới và đã xin phép — mé công viên, bãi đậu xe, hay trạm xe buýt. Kê bàn, che nắng và làm bảng hiệu.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Chốt cách làm",
        "description": "Chọn miễn phí hoàn toàn, trả tùy khả năng, hay pha cả hai. Chọn kiểu nào cũng được, miễn là chắc chắn không ai bị từ chối vì không trả nổi.",
        "hours": 1,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Lo bày hàng, cất giữ và an toàn thực phẩm",
        "description": "Giữ rau trái mát mẻ và tươi mắt, xử lý thực phẩm an toàn, và có thùng đá hay chỗ che nắng cho ngày oi bức. Bỏ đi bất cứ thứ gì đã hỏng.",
        "hours": 2,
        "skills": [
          "an toàn thực phẩm"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Rủ người và xếp lịch cho các buổi chợ",
        "description": "Sắp người đi lấy rau trái, dựng sạp, đứng sạp và dọn sạp. Giao vai rõ ràng cho từng buổi chợ.",
        "hours": 2,
        "skills": [
          "tổ chức",
          "kết nối"
        ]
      },
      {
        "name": "Báo tin và chốt một lịch cố định",
        "description": "Chọn một ngày và một giờ không đổi rồi báo cho thật nhiều người biết. Chính sự đoán trước được mới biến một cái sạp thành chỗ dựa đáng tin.",
        "hours": 2,
        "skills": [
          "kết nối",
          "thiết kế đồ họa"
        ],
        "follows": [
          1,
          2
        ]
      },
      {
        "name": "Chạy buổi chợ và lo phần còn dư",
        "description": "Dựng sạp, phát đồ thật ấm áp và không phán xét ai, rồi chuyển phần rau trái còn dư sang tủ lạnh chung, kho thực phẩm hay bếp ăn để không phí thứ gì.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          0,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "welcome-wagon",
    "name": "Đội chào đón: giúp hàng xóm mới và cha mẹ mới sinh con",
    "purpose": "Chào đón người mới đến và cha mẹ mới sinh con bằng sự giúp đỡ thiết thực, thông tin trong vùng, và một lời chào thật lòng vào cộng đồng.",
    "whoItServes": "Người vừa dọn tới, cha mẹ mới sinh con hoặc đang chờ con chào đời, và bất cứ ai cần một khởi đầu ấm áp.",
    "whatYoullNeed": "Người góp một tay, tập thông tin, đồ chào đón được tặng lại, và một cách giới thiệu người mới.",
    "setupHours": 10,
    "defaultCategory": "emotional_support",
    "firstSteps": "Trước hết hãy nói chuyện với những người gặp người mới trước bạn — chủ nhà trọ, văn phòng trường học, phòng khám, nữ hộ sinh và điều dưỡng nhi — về cách họ giới thiệu một người sang khi người đó đồng ý. Rồi hỏi vài người vừa dọn tới và vài cha mẹ mới sinh con xem điều gì thật sự đã giúp được họ trong tháng đầu, và dựng tập thông tin cùng giỏ chào đón quanh câu trả lời của họ.",
    "commonPitfalls": "Chuyện này hỏng khi nó nghe giống như bị dòm ngó — gõ cửa nhà một người lạ mà không hẹn trước, hay chuyền tên người khác đi khi chưa được họ đồng ý, biến một lời chào thành sự xâm phạm. Nó cũng lặng lẽ tàn đi khi những người đi chào đón buổi đầu kiệt sức và người mới đến không ai để ý tới suốt mấy tháng liền.",
    "pairsWith": [
      "newcomer-translation-network",
      "diaper-hygiene-bank",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "invite-someone"
    ],
    "tasks": [
      {
        "name": "Chốt sẽ chào đón ai và chào đón kiểu gì",
        "description": "Xác định phạm vi — người mới dọn tới, cha mẹ mới sinh con, hay cả hai — và lời chào sẽ có hình gì (một lần ghé thăm, một giỏ đồ, một cuộc gọi). Giữ cho người ta được tự chọn tham gia và đừng bao giờ làm phiền.",
        "hours": 1,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Làm một tập thông tin về khu mình",
        "description": "Gom lại một cuốn cẩm nang rõ ràng về các nơi giúp đỡ trong vùng, xe cộ đi lại, trường học, khám chữa bệnh, và chương trình tương trợ của bạn. Làm cả bằng những thứ tiếng người trong vùng đang nói.",
        "hours": 3,
        "skills": [
          "viết lách",
          "dịch thuật"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Sắp các giỏ chào đón",
        "description": "Gom những thứ dùng được — gạo mắm muối và đồ khô, đồ dùng trong nhà, và với cha mẹ mới sinh con thì thêm vài món cho em bé hoặc một bữa cơm nhà nấu. Xin từ những người muốn cho.",
        "hours": 2,
        "recurringCadence": "month",
        "skills": [
          "kết nối",
          "tổ chức"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Rủ và chỉ việc cho người đi chào đón",
        "description": "Tìm những người dễ mến và chỉ cho họ cách giữ sự ấm áp và tôn trọng, cách đọc xem người ta có muốn gần gũi không, và tuyệt đối không thúc ép hay tò mò.",
        "hours": 2,
        "skills": [
          "kết nối",
          "dạy học"
        ]
      },
      {
        "name": "Dựng cách giới thiệu và cách tự ghi tên",
        "description": "Tạo những lối đơn giản để người mới được giới thiệu sang hoặc tự ghi tên — qua chủ nhà trọ, phòng khám, trường học, hay một mẫu ghi tên. Giữ riêng tư cho họ suốt từ đầu tới cuối.",
        "hours": 2,
        "skills": [
          "tổ chức",
          "nhập liệu"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "library-of-things",
    "name": "Thư viện đồ dùng",
    "purpose": "Cho mượn đồ trong nhà và đồ cho tiệc tùng mà người ta hiếm khi cần phải mua riêng — đồ bếp, đồ tiệc và đồ cắm trại, đồ em bé, máy chiếu, và nhiều thứ khác.",
    "whoItServes": "Ai cũng được; nó đỡ tốn tiền, đỡ chật nhà, và bớt lãng phí.",
    "whatYoullNeed": "Chỗ cất đồ, đồ được tặng lại, một danh mục và cách ghi mượn, và vài người trông thư viện.",
    "setupHours": 21,
    "defaultCategory": "infrastructure",
    "firstSteps": "Trước khi gom một món nào, hãy hỏi các thành viên xem họ sẽ thật sự mượn gì — bản hỏi ý đó là nền móng của dự án — và nói chuyện với thư viện công cộng hay nhà văn hóa về việc cho gửi nhờ, vì một nơi có uy tín giải quyết một lúc cả chỗ cất đồ lẫn niềm tin. Hãy rủ được hai người trông thư viện trước khi đồ được đưa tới, chứ đừng để sau.",
    "commonPitfalls": "Thư viện đồ dùng chết vì bừa bộn: gật đầu với mọi món được tặng sẽ làm căn phòng đầy máy làm bánh mì hỏng chẳng ai cần, trong khi cái máy xịt rửa ai cũng hỏi thì vẫn chưa có. Kẻ giết người thứ hai là giờ mở cửa thất thường — nếu người ta không đoán được lúc nào lấy và trả được, họ sẽ lặng lẽ quay về với việc đi mua.",
    "pairsWith": [
      "tool-lending-library",
      "toy-library",
      "free-store"
    ],
    "learnMore": [
      "confirm-exchange"
    ],
    "tasks": [
      {
        "name": "Hỏi cộng đồng muốn mượn những gì",
        "description": "Hỏi các thành viên xem món nào họ sẽ dùng nhưng ngại mua — bàn xếp, một nồi lẩu lớn, một cái lều, máy giặt thảm, một chiếc xe đẩy em bé. Câu trả lời sẽ định ra kho đồ ban đầu.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Kiếm chỗ cất đồ và chốt giờ mở cửa",
        "description": "Lo một cái tủ, một căn phòng hay một thùng chứa để giữ đồ, và chốt giờ lấy trả đều đặn để việc mượn thật dễ.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Gom, lau chùi và thử từng món",
        "description": "Nhận đồ được tặng, rồi lau chùi, chạy thử và soi lại độ an toàn của từng món. Để riêng ra bất cứ thứ gì hỏng, bị thu hồi, hay không sạch sẽ.",
        "hours": 5,
        "skills": [
          "lái xe"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Vào danh mục và chụp ảnh kho đồ",
        "description": "Ghi từng món kèm một tấm ảnh và tình trạng của nó vào bảng tính hoặc một ứng dụng cho mượn. Đánh số từng món để theo dõi lúc ra lúc vào cho dễ.",
        "hours": 4,
        "skills": [
          "nhập liệu",
          "chụp ảnh"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Viết lệ mượn đồ và cách đặt lòng tin",
        "description": "Định thời hạn mượn, giới hạn số lượng, và một lệ trả trễ dễ thở. Hãy dựng trên lòng tin chứ đừng dựng trên tiền phạt, và ghi chú món nào cần giữ gìn hay lau rửa thêm.",
        "hours": 2,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Dựng cách ghi mượn và chỉ việc cho người trông thư viện",
        "description": "Làm một tờ ghi mượn đơn giản (tên, cách liên lạc, món đồ, ngày hẹn trả) kèm một tấm ảnh nhanh về tình trạng. Dắt những người góp một tay đi qua danh mục và từng bước một.",
        "hours": 3,
        "skills": [
          "nhập liệu",
          "dạy học"
        ],
        "follows": [
          3,
          4
        ]
      },
      {
        "name": "Giữ gìn, làm sạch và nuôi lớn bộ sưu tập",
        "description": "Lau chùi và soi lại đồ được trả về, sửa những gì sửa được, và theo thời gian bổ sung những món được hỏi nhiều nhất.",
        "hours": 2,
        "skills": [
          "sửa chữa"
        ],
        "recurringCadence": "session"
      }
    ]
  },
  {
    "id": "laundry-shower-access",
    "name": "Chương trình giặt giũ và tắm rửa miễn phí",
    "purpose": "Mở chỗ giặt giũ và tắm rửa miễn phí để mọi người được sạch sẽ mà vẫn giữ được phẩm giá.",
    "whoItServes": "Hàng xóm không có nhà ở, người không có chỗ giặt tắm dùng được, và những gia đình thu nhập thấp.",
    "whatYoullNeed": "Chỗ dùng máy giặt và nhà tắm (một nơi cùng làm hoặc một xe lưu động), đồ dùng, và người góp một tay. Phẩm giá và sự riêng tư của người đến là trên hết — đừng đòi bất kỳ thông tin cá nhân nào để được dùng, giữ khu tắm kín đáo và an toàn, và theo đúng quy định y tế địa phương cho nơi dùng chung hay xe lưu động.",
    "setupHours": 19,
    "defaultCategory": "infrastructure",
    "suggestsWorkDays": true,
    "firstSteps": "Bắt đầu bằng hai vòng nói chuyện: với những hàng xóm không có nhà ở và những người làm việc với bà con ngoài đường phố, về giờ giấc và địa điểm nào mới thật sự chạy được — và với chủ một tiệm giặt, một phòng tập hay một nơi thờ tự về việc cho mượn chỗ. Cuộc nói chuyện với chủ nơi đó rất tế nhị; hãy thành thật về việc ai sẽ đến và chốt trước những mong đợi về riêng tư, dọn dẹp và giờ giấc trước khi người đầu tiên tới.",
    "commonPitfalls": "Chương trình này chết khi quan hệ với nơi cho mượn chỗ trở nên xấu đi — một lần va chạm mà phía sau không có quy ước nào, thế là mất chỗ — hoặc khi giờ giấc đổi tới lui nhiều đến nỗi người ta đi ngang thành phố tới chỉ để gặp một cánh cửa khóa. Và mỗi tờ giấy bạn đòi ở cửa lại đẩy đi một người cần tắm hơn nhiều so với việc bạn cần biết tên họ.",
    "pairsWith": [
      "free-haircut",
      "cooling-warming-center",
      "diaper-hygiene-bank"
    ],
    "tasks": [
      {
        "name": "Lo chỗ giặt giũ và tắm rửa",
        "description": "Cùng làm với một tiệm giặt, phòng tập, nơi thờ tự, trung tâm thể thao, hoặc thu xếp một xe lưu động. Chốt những khung giờ chắc chắn và chắc rằng chỗ đó đủ kín đáo.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Kiếm đồ dùng",
        "description": "Gom xà phòng giặt, khăn sạch, xà bông, dầu gội và các thứ vệ sinh khác từ người tặng hoặc từ một khoản tiền nhỏ. Kèm thêm ít quần áo sạch nếu được.",
        "hours": 3,
        "skills": [
          "kết nối",
          "lái xe"
        ]
      },
      {
        "name": "Dựng cách ghi tên và chia khung giờ",
        "description": "Tạo một cách công bằng để nhận lượt giặt và lượt tắm, sao cho thời gian chờ vừa phải và ai cũng tới lượt.",
        "hours": 3,
        "skills": [
          "tổ chức",
          "nhập liệu"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Đặt quy ước vệ sinh và an toàn",
        "description": "Định nếp dọn dẹp giữa mỗi lượt, giữ khu tắm kín đáo và an toàn, và giữ phẩm giá cùng sự an toàn cho mọi người suốt từ đầu tới cuối.",
        "hours": 3,
        "skills": [
          "viết lách"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Rủ và chỉ việc cho người góp một tay",
        "description": "Tìm người để lo khâu tiếp đón, coi đồ dùng, và dọn dẹp giữa các lượt. Chỉ cho họ cách đón từng người thật ấm áp và tôn trọng.",
        "hours": 3,
        "skills": [
          "kết nối",
          "dạy học"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Chốt lịch và báo cho mọi người biết",
        "description": "Chọn những khung giờ không đổi và cho người làm việc ngoài đường phố, các nhà tạm trú và hàng xóm đang sống ngoài đường biết chương trình chạy khi nào, ở đâu.",
        "hours": 3,
        "skills": [
          "kết nối"
        ],
        "follows": [
          0
        ]
      }
    ]
  },
  {
    "id": "voter-registration",
    "name": "Đợt đăng ký cử tri và tham gia việc chung",
    "purpose": "Đăng ký cử tri và giúp mọi người tham gia vào bầu cử cùng các quyết định ở địa phương — hoàn toàn phi đảng phái.",
    "whoItServes": "Những người dân đủ điều kiện, nhất là các nhóm xưa nay ít có mặt ở thùng phiếu.",
    "whatYoullNeed": "Người góp một tay đã được chỉ việc, giấy tờ đăng ký, thông tin chính xác về luật lệ, và những chỗ đặt bàn tốt. Giữ đợt này hoàn toàn phi đảng phái và theo đúng từng chữ mọi luật về bầu cử và đăng ký cử tri — chỉ đưa thông tin chính xác và không bao giờ vận động cho một đảng hay một ứng viên nào.",
    "setupHours": 16,
    "defaultCategory": "organizing",
    "firstSteps": "Trước khi ai đó đặt bàn, hãy nói chuyện với cơ quan phụ trách bầu cử ở địa phương — họ sẽ nói chính xác một đợt đăng ký được làm gì và không được làm gì, và có nơi còn bắt phải tập huấn hay ghi danh trước. Rồi kết nối với Hội Nữ cử tri (League of Women Voters) hoặc một nhóm phi đảng phái lâu năm khác; mượn tài liệu và kinh nghiệm của họ hơn hẳn việc tự học luật bầu cử bằng cách sai rồi sửa.",
    "commonPitfalls": "Những kiểu hỏng không thể tha thứ là kiểu vi phạm luật: một xấp đơn đã điền bị bỏ quên trong cốp xe cho tới quá hạn sẽ tước mất lá phiếu của từng người đã tin bạn, và chỉ một người góp một tay tán dương một ứng viên cũng đủ làm vấy cả đợt. Cái sót tinh vi hơn là phát đơn đăng ký mà chẳng bao giờ nhắc tới đi bỏ phiếu ở đâu và bỏ thế nào.",
    "pairsWith": [
      "newcomer-translation-network",
      "legal-aid-clinic"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Học cho rõ luật lệ về các đợt đăng ký cử tri",
        "description": "Tìm hiểu luật ở nơi bạn sống về việc đăng ký cử tri: thời hạn, người góp một tay được làm gì và không được làm gì, đơn phải được giữ và nộp ra sao, và yêu cầu về giấy tờ tùy thân. Theo đúng từng điều là chuyện sống còn.",
        "hours": 3,
        "skills": [
          "giấy tờ"
        ]
      },
      {
        "name": "Chỉ việc cho những người góp một tay giữ thế phi đảng phái",
        "description": "Chỉ cho mọi người cách giúp ai cũng đăng ký được bất kể quan điểm thế nào, và tuyệt đối không quảng bá cho một đảng hay một ứng viên. Giữ thế phi đảng phái là để giữ cả đợt này lẫn lòng tin của cộng đồng.",
        "hours": 3,
        "skills": [
          "dạy học"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Gom giấy tờ và thông tin chính xác",
        "description": "Gom đơn đăng ký cùng thông tin đã kiểm chứng, còn mới về thời hạn, quy định giấy tùy thân, điểm bỏ phiếu và cách bỏ phiếu qua bưu điện. Thông tin sai còn hại hơn không có thông tin.",
        "hours": 2,
        "skills": [
          "viết lách"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Chọn chỗ đông người qua lại và các sự kiện",
        "description": "Đặt bàn nơi những người đủ điều kiện vốn đã tụ về — chợ, bến xe, khuôn viên trường, sự kiện của cộng đồng — kèm mọi giấy phép cần có để đặt bàn.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Đứng bàn đăng ký",
        "description": "Trực bàn, giúp mọi người điền đơn cho đúng, và nộp đơn thật sớm trong thời hạn luật định. Giữ giọng ấm áp và rõ ràng.",
        "hours": 4,
        "skills": [
          "kết nối"
        ],
        "follows": [
          1,
          2,
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Giúp cả những bước tiếp theo",
        "description": "Không dừng ở việc đăng ký, hãy giúp mọi người biết bỏ phiếu thế nào, khi nào và ở đâu, kể cả cách bỏ phiếu qua bưu điện và chuyện đưa đón tới điểm bỏ phiếu. Chỉ đăng ký thôi thì chưa phải là tham gia.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      }
    ]
  },
  {
    "id": "health-navigation",
    "name": "Chương trình dẫn đường y tế cho cộng đồng",
    "purpose": "Giúp hàng xóm tìm được và tới được nơi chữa bệnh — phòng khám, bảo hiểm, thuốc men và lịch hẹn.",
    "whoItServes": "Người không có hoặc thiếu bảo hiểm, người lớn tuổi, người mới tới, và bất cứ ai đang lạc lối giữa hệ thống y tế.",
    "whatYoullNeed": "Người dẫn đường đã được chỉ việc, một cuốn danh bạ các nơi giúp đỡ, quan hệ với các cơ sở y tế, và một cách nhận lời nhờ. Người dẫn đường nối mọi người với nơi chữa bệnh — họ không đưa lời khuyên y khoa hay chẩn đoán. Hãy chuyển mọi câu hỏi về bệnh tình tới người có chuyên môn y tế.",
    "setupHours": 26,
    "defaultCategory": "other",
    "firstSteps": "Hãy bắt đầu bằng việc ghé thăm những phòng khám miễn phí và những nơi thu phí theo khả năng chi trả mà bạn sẽ giới thiệu tới — chào hỏi, hỏi xem loại giới thiệu nào giúp được họ và loại nào làm họ quá tải, và để những cuộc nói chuyện đó gieo mầm cho cuốn danh bạ. Hãy chốt ranh giới trước khi lời nhờ đầu tiên tới: người dẫn đường lo phần đi lại giấy tờ, còn mọi câu hỏi về bệnh tình đều chuyển sang người có chuyên môn, nên phải biết chính xác sẽ chuyển sang đường dây điều dưỡng hay phòng khám nào.",
    "commonPitfalls": "Chỗ sắc nhất là một người dẫn đường đầy thiện ý trượt sang lời khuyên y khoa — một câu buột miệng “nghe không có vẻ gì nặng đâu” có thể làm ai đó mất mấy tuần chữa trị cần thiết. Chuyện này cũng hỏng khi cuốn danh bạ lặng lẽ cũ đi, đẩy người ta tới những phòng khám đã đóng hay những chương trình đã kết thúc; một số điện thoại sai làm mất luôn lần thử cuối cùng của một người vốn đã đuối sức.",
    "pairsWith": [
      "rides-transportation",
      "newcomer-translation-network",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Làm một cuốn danh bạ các nơi chữa bệnh",
        "description": "Tập hợp các phòng khám miễn phí và giá rẻ, những nơi thu phí theo khả năng chi trả, các chương trình giúp trả tiền thuốc, chỗ khám răng và mắt, và nơi chăm sóc sức khỏe tinh thần. Giữ cho danh bạ luôn mới.",
        "hours": 6,
        "skills": [
          "nhập liệu",
          "kết nối"
        ]
      },
      {
        "name": "Rủ và chỉ việc cho người dẫn đường",
        "description": "Tìm những người góp một tay và chỉ cho họ cách nối mọi người với nơi chữa bệnh — chứ không phải cách đưa lời khuyên y khoa. Việc của họ là chỉ lối và lo khâu đi lại giấy tờ, còn câu hỏi về bệnh tình thì chuyển tới người có chuyên môn.",
        "hours": 5,
        "skills": [
          "kết nối",
          "dạy học"
        ]
      },
      {
        "name": "Dựng cách nhận lời nhờ và tiếp nhận",
        "description": "Tạo một lối kín đáo, dễ bước vào để mọi người nhờ giúp và kể hoàn cảnh của mình, có cả cách gọi điện thoại và gặp trực tiếp, chứ không chỉ qua mạng.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Giúp việc bảo hiểm và đăng ký",
        "description": "Cùng mọi người hiểu và xin phần bảo hiểm mà họ đủ điều kiện (như Medicaid hay các gói bảo hiểm mua trên sàn) và gom đủ giấy tờ cần thiết.",
        "hours": 4,
        "recurringCadence": "month",
        "skills": [
          "giấy tờ"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Giúp chuyện lịch hẹn và thuốc men",
        "description": "Giúp đặt lịch hẹn, cài lời nhắc, gỡ chuyện tiền thuốc, và nối với chương trình đưa đón để tới được nơi chữa bệnh.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "tổ chức"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Đặt nếp giữ riêng tư cho thông tin sức khỏe",
        "description": "Coi mọi chi tiết về sức khỏe là cực kỳ nhạy cảm: chỉ lấy phần tối thiểu, cất giữ thật an toàn, và không bao giờ chia sẻ khi chưa được đồng ý. Chỉ cho người dẫn đường cách giữ kín.",
        "hours": 2,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Kết thân với các phòng khám và cơ sở y tế",
        "description": "Xây quan hệ với các phòng khám và cơ sở y tế quanh vùng để việc giới thiệu trôi chảy hơn và để biết tin về những nơi khám chữa giá rẻ mới mở.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      }
    ]
  },
  {
    "id": "toy-library",
    "name": "Thư viện đồ chơi và cho mượn dụng cụ chơi",
    "purpose": "Cho mượn đồ chơi, trò chơi và dụng cụ chơi để các gia đình có nhiều thứ cho con chơi mà không phải mua.",
    "whoItServes": "Các gia đình có con nhỏ, nhất là khi eo hẹp; đồng thời bớt lãng phí và bớt chật nhà.",
    "whatYoullNeed": "Chỗ cất giữ, đồ chơi được tặng, một danh mục và sổ mượn, đồ lau rửa, và người trực thư viện.",
    "setupHours": 10,
    "defaultCategory": "childcare",
    "firstSteps": "Hãy nói chuyện với chính những gia đình bạn mong phục vụ — lúc đón con ở nhà trẻ, trong một buổi kể chuyện, ở một nhóm chơi — xem đồ chơi nào con họ mau chán nhất và khung giờ nào họ thật sự đi được, rồi hỏi một nhà văn hóa, nhà thờ hay thư viện khu phố xin một cái kệ hoặc một căn phòng. Tìm sẵn một người góp một tay rành chuyện trẻ nhỏ để lo phần kiểm tra an toàn trước khi đồ chơi bắt đầu đổ về.",
    "commonPitfalls": "Thư viện đồ chơi hỏng vì hai chuyện: an toàn và mất mảnh. Một món đồ chơi đã bị thu hồi hay một chi tiết nhỏ dễ hóc lọt lưới là niềm tin của các gia đình mất hẳn, còn những bộ xếp hình trả về thiếu mảnh sẽ khiến cả bộ sưu tập thành đồ bỏ đi chỉ sau vài tháng. Soi thật kỹ và túi có đếm mảnh chính là tất cả.",
    "pairsWith": [
      "library-of-things",
      "childcare-collective",
      "school-supply-program"
    ],
    "tasks": [
      {
        "name": "Tìm chỗ cất giữ và giờ mở cửa",
        "description": "Xin được một dãy kệ ở nhà văn hóa, thư viện hay một chỗ chung, rồi định giờ mượn và giờ trả cố định để các gia đình dễ sắp xếp.",
        "hours": 1.5,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Gom, rửa và soi lại an toàn của đồ chơi",
        "description": "Gom đồ được tặng, rồi rửa sạch và soi từng món. Tra xem có bị thu hồi, có chi tiết gãy hay chi tiết dễ hóc không, và để riêng mọi thứ không an toàn cho trẻ nhỏ.",
        "hours": 3.5,
        "skills": [
          "lái xe",
          "trông trẻ"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Ghi danh mục và cho vào túi đủ mảnh",
        "description": "Ghi lại từng món kèm một tấm ảnh và độ tuổi phù hợp, và cho bộ nhiều mảnh vào túi kèm số đếm để không thất lạc gì. Đánh số từng món cho dễ theo dõi.",
        "hours": 2,
        "skills": [
          "nhập liệu",
          "chụp ảnh"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Viết quy ước mượn đồ",
        "description": "Định thời hạn mượn, mỗi lần mượn mấy món, và một quy ước nhẹ nhàng cho chuyện trả trễ hay thiếu mảnh. Giữ nó dựa trên lòng tin và rộng lượng.",
        "hours": 1,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Lập sổ mượn và chỉ việc cho người trực",
        "description": "Làm một phiếu ghi mượn thật gọn (tên, cách liên lạc, món đồ, ngày trả) và dẫn những người góp một tay đi qua danh mục, nếp lau rửa và các quy ước.",
        "hours": 2,
        "skills": [
          "nhập liệu",
          "dạy học"
        ],
        "follows": [
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "food-preservation",
    "name": "Nhóm bảo quản và đóng hũ thực phẩm",
    "purpose": "Cùng nhau học và cùng nhau đóng hũ, bảo quản thực phẩm để đồ dư theo mùa để được lâu và bớt phí đồ ăn.",
    "whoItServes": "Người trồng vườn, người đi mót, và những gia đình muốn kéo dài cái ăn suốt cả năm.",
    "whatYoullNeed": "Một gian bếp, dụng cụ đóng hũ và bảo quản, vài người dẫn dắt có hiểu biết, và nông sản. Bảo quản tại nhà có rủi ro an toàn thực phẩm rất thật, kể cả ngộ độc botulinum, nếu làm sai — hãy luôn theo hướng dẫn mới nhất đã được kiểm chứng từ một nguồn đáng tin, và đừng bao giờ tự chế thời gian hay cách xử lý.",
    "setupHours": 18,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Tìm kiến thức trước khi tìm bếp: gọi cho cơ quan khuyến nông ở địa phương hoặc một người có chứng chỉ về bảo quản thực phẩm, nhờ họ chỉ việc cho những người dẫn dắt của bạn hoặc xem lại kế hoạch, và nói chuyện với người trồng vườn, người đi mót xem thứ gì thật sự rộ vào lúc nào. Hãy đặt lịch mượn bếp theo mùa vụ, chứ không phải ngược lại.",
    "commonPitfalls": "Cái hỏng đáng sợ nhất lại vô hình: một cái hũ đậy bằng cách tự chế hay theo công thức của bà chưa từng được kiểm chứng có thể mang mầm botulinum mà nhìn trên kệ vẫn ngon lành. Cái hỏng thường gặp là lỡ mùa — cà chua chín theo lịch của nó, và một nhóm mãi tới tháng 11 mới họp buổi đầu thì chẳng bảo quản được gì.",
    "pairsWith": [
      "gleaning-network",
      "community-garden",
      "community-fridge"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Mượn được một gian bếp phù hợp",
        "description": "Tìm một gian bếp có bếp nấu, mặt bàn rộng và nước để làm và dọn rửa. Hội trường nhà thờ, nhà văn hóa hay bếp thương mại đều hợp.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Học cho biết cách bảo quản an toàn",
        "description": "Để những người dẫn dắt học các cách đã được kiểm chứng, dựa trên nghiên cứu, từ một nguồn có uy tín (như cơ quan khuyến nông của một trường đại học). Đóng hũ sai cách có thể gây bệnh nặng, nên hãy luôn theo đúng công thức và thời gian xử lý đã kiểm chứng.",
        "hours": 4,
        "skills": [
          "an toàn thực phẩm",
          "nấu ăn"
        ]
      },
      {
        "name": "Gom dụng cụ và hũ",
        "description": "Gom nồi đóng hũ bằng nước sôi và/hoặc nồi áp suất, hũ, nắp và dụng cụ qua đường quyên góp hoặc một khoản nhỏ. Kiểm xem nồi áp suất còn chạy an toàn không.",
        "hours": 3,
        "skills": [
          "kết nối",
          "lái xe"
        ]
      },
      {
        "name": "Tìm nguồn nông sản",
        "description": "Đem về đồ dư theo mùa từ việc đi mót, từ vườn nhà, nông trại hay mua sỉ. Xếp buổi làm vào đúng lúc nông sản nhiều và rẻ.",
        "hours": 2,
        "recurringCadence": "cycle",
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Lên kế hoạch cho các buổi đóng hũ chung",
        "description": "Chọn công thức hợp với nông sản và hợp tay nghề của nhóm, rồi bố trí các trạm để công việc chạy an toàn và trơn tru.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "nấu ăn",
          "tổ chức"
        ],
        "follows": [
          1,
          3
        ]
      },
      {
        "name": "Chỉ việc và giữ cho buổi làm an toàn",
        "description": "Dẫn cả nhóm đi qua từng bước, giữ đúng cách xử lý an toàn, đúng thời gian và đúng cách đậy kín. Hãy làm thành một buổi chỉ việc để tay nghề lan ra.",
        "hours": 4,
        "skills": [
          "nấu ăn",
          "dạy học"
        ],
        "follows": [
          0,
          2,
          4
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Chia đồ đã bảo quản và ghi lại",
        "description": "Chia đồ đã bảo quản cho những người cùng làm và cho các dự án như tủ lạnh chung hay kho thực phẩm. Dán nhãn từng hũ ghi rõ đựng gì và ngày nào, rồi ghi lại điều gì chạy tốt cho lần sau.",
        "hours": 1,
        "recurringCadence": "session",
        "skills": [
          "tổ chức"
        ],
        "follows": [
          5
        ]
      }
    ]
  },
  {
    "id": "free-haircut",
    "name": "Ngày cắt tóc và chăm chút vẻ ngoài miễn phí",
    "purpose": "Cắt tóc và chăm chút vẻ ngoài miễn phí để trả lại phẩm giá, sự tự tin và một khởi đầu mới.",
    "whoItServes": "Hàng xóm đang không có chỗ ở, người đang tìm việc, gia đình thu nhập thấp và người lớn tuổi.",
    "whatYoullNeed": "Thợ tóc và thợ cắt tóc có giấy phép hành nghề chịu góp một tay, một chỗ làm, đồ nghề, và khâu khử trùng.",
    "setupHours": 10,
    "defaultCategory": "skilled_labor",
    "suggestsWorkDays": true,
    "firstSteps": "Bắt đầu bằng hai cuộc trò chuyện: một với một người thợ tóc hoặc thợ cắt tóc có giấy phép sẵn lòng rủ thêm một đồng nghiệp, và một với chính những người bạn mong phục vụ — một nhà tạm trú, trung tâm ban ngày hay chương trình việc làm sẽ cho bạn biết ngày nào và không khí nào thật sự dễ chịu với họ. Khi cả người thợ lẫn nơi cho mượn chỗ đều gật đầu, phần còn lại chỉ là đồ nghề và lịch.",
    "commonPitfalls": "Dự án này vấp khi nó giống một hàng người xếp chờ từ thiện hơn là một tiệm tóc — cắt vội, không được chọn kiểu, máy ảnh chĩa ra để đăng mạng. Hãy hỏi từng người muốn gì, đừng chụp ảnh trừ khi chính họ muốn, và đừng bao giờ để người không có giấy phép cầm kéo cho kịp lượt; chỉ một sự cố vệ sinh là cả chương trình có thể kết thúc.",
    "pairsWith": [
      "laundry-shower-access",
      "reentry-support"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Mời thợ tóc có giấy phép hành nghề",
        "description": "Tìm những người làm nghề sẵn lòng góp tay nghề của mình. Người có giấy phép giữ cho việc cắt an toàn, đẹp và đúng khâu khử trùng.",
        "hours": 2.5,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Tìm một chỗ đủ điều kiện vệ sinh",
        "description": "Xin được một nơi có nước, đèn sáng và mặt sàn, mặt bàn lau chùi được — nhà văn hóa, tiệm tóc ngoài giờ, hay nhà thờ, chùa.",
        "hours": 1.5,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Lo đồ nghề và vật dụng",
        "description": "Gom tông đơ, kéo, áo choàng, lược, gương và đồ dùng một lần. Kèm thêm đồ chăm chút như dao cạo và đồ vệ sinh cá nhân để mọi người mang về.",
        "hours": 2,
        "skills": [
          "kết nối",
          "lái xe"
        ]
      },
      {
        "name": "Lo khâu khử trùng và đúng quy định hành nghề",
        "description": "Định ra cách khử trùng đồ nghề giữa mỗi lượt cắt và làm đúng quy định ở địa phương khi cắt tóc cho mọi người. Sạch sẽ là để giữ cho ai cũng an toàn.",
        "hours": 1.5,
        "skills": [
          "giấy tờ"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tổ chức những ngày chăm chút vẻ ngoài",
        "description": "Tổ chức buổi đó, giữ không khí ấm áp và tôn trọng, và đón mỗi người như một người khách quý chứ không phải người nhận đồ từ thiện.",
        "hours": 2.5,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "mutual-aid-moving-crew",
    "name": "Đội chuyển nhà tương trợ",
    "purpose": "Giúp chuyển nhà cho những người không kham nổi tiền thuê người chuyển nhà — người rời khỏi nơi không an toàn, người bị buộc rời nhà thuê, hay người dọn về chỗ nhỏ hơn.",
    "whoItServes": "Hàng xóm thu nhập thấp, người đang rời khỏi ngôi nhà không an toàn, người lớn tuổi và hàng xóm khuyết tật.",
    "whatYoullNeed": "Người góp một tay có xe và có sức, đồ đạc để chuyển nhà, và những nếp giữ an toàn thật rõ ràng. Với bất kỳ ai đang rời khỏi một nơi không an toàn, hãy giữ kín tuyệt đối địa chỉ mới, ngày giờ và mọi chi tiết, và làm theo ý người đó về thời điểm cũng như cách giữ an toàn.",
    "setupHours": 14,
    "defaultCategory": "transport",
    "suggestsWorkDays": true,
    "firstSteps": "Trước khi kiếm được chiếc xe tải đầu tiên, hãy nói chuyện với những người đã quen nhận các cuộc gọi này — người làm việc với nạn nhân bạo hành gia đình, người tổ chức của hội người thuê nhà, nơi lo cho người lớn tuổi — về việc lời nhờ nên đến với bạn bằng đường nào và họ sẽ mong bạn giữ kín tới đâu, vì có những lần chuyển nhà nghĩa là ai đó đang rời khỏi một mái nhà không an toàn. Rồi gom ba bốn người khỏe tay khỏe lưng cùng một chiếc xe, và cùng nhau ước lượng lần chuyển nhà nhỏ đầu tiên.",
    "commonPitfalls": "Đội chuyển nhà rất mau bị thương hoặc mau kiệt sức: một việc quá sức mà quá ít tay, một người nhấc đồ sai cách, một địa chỉ bị chuyền vào nhóm chat mà lẽ ra không được rời khỏi điện thoại của người điều phối. Hãy giữ mọi lần chuyển nhà trong đúng giới hạn đã nói ra, và coi chi tiết của mỗi lần chuyển nhà liên quan tới an toàn như thứ có thể đẩy một người vào nguy hiểm — vì đúng là có thể.",
    "pairsWith": [
      "tenant-union",
      "free-store"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Gom một đội và những chiếc xe",
        "description": "Gom những người góp một tay có thể nhấc và khiêng an toàn, cùng với xe tải hay xe van mượn được. Giữ một danh sách kèm lúc rảnh để bạn ráp đội thật nhanh.",
        "hours": 2.5,
        "skills": [
          "kết nối",
          "lái xe"
        ]
      },
      {
        "name": "Gom đồ đạc để chuyển nhà",
        "description": "Gom xe đẩy hàng, dây đai bó đồ, chăn bọc đồ và thùng dùng lại được qua đường quyên góp. Đồ dùng chung khiến việc chuyển nhà nhanh hơn và an toàn hơn.",
        "hours": 1.5,
        "skills": [
          "lái xe"
        ]
      },
      {
        "name": "Dựng cách nhận lời nhờ và ước lượng công việc",
        "description": "Làm một đường để mọi người nhờ giúp và để bạn ước lượng từng lần chuyển: bao nhiêu đồ, thang bộ hay thang máy, xa gần, và lúc nào. Nhờ vậy bạn tính được cần bao nhiêu người và đồ nghề gì.",
        "hours": 2,
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Lo chuyện an toàn và trách nhiệm",
        "description": "Chỉ cho mọi người cách nhấc đồ an toàn, dùng một tờ miễn trừ trách nhiệm thật gọn, và kiểm bảo hiểm cho mọi chiếc xe được dùng. Giữ an toàn cho người giúp và người được giúp là chuyện đáng làm.",
        "hours": 2,
        "skills": [
          "giấy tờ"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Sắp lịch và điều người",
        "description": "Ghép lời nhờ với đội đang rảnh và chốt lại với mọi người vào hôm trước. Giữ một danh sách dự phòng vì chuyển nhà không dễ dời ngày.",
        "hours": 1.5,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Định rõ làm gì và không làm gì",
        "description": "Quyết xem bạn nhận việc nào và không nhận việc nào (không hóa chất nguy hiểm, không đàn piano, không việc quá sức an toàn của đội). Những việc đó thì chỉ sang chỗ khác.",
        "hours": 1,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Chuyển nhà và hỏi thăm sau đó",
        "description": "Chuyển nhà an toàn và tôn trọng, rồi xem người đó đã ổn định chưa. Nối họ với các dự án khác (cửa hàng đồ miễn phí, nhóm đón người mới) khi cần.",
        "hours": 3.5,
        "skills": [
          "lái xe"
        ],
        "follows": [
          1,
          3,
          4
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "disability-support-network",
    "name": "Mạng lưới nâng đỡ người khuyết tật và khả năng tiếp cận",
    "purpose": "Tập hợp hàng xóm khuyết tật cùng những người đồng hành để nâng đỡ nhau, mở đường tiếp cận và lên tiếng — do chính người khuyết tật dẫn dắt.",
    "whoItServes": "Hàng xóm khuyết tật và hàng xóm mang bệnh mạn tính.",
    "whatYoullNeed": "Một cách liên lạc mà ai cũng tiếp cận được, những người dẫn dắt cùng cảnh, và một danh bạ nguồn giúp đỡ. Việc giúp nhau giữa những người cùng cảnh chỉ bổ sung chứ không thay cho chăm sóc chuyên môn — hãy chỉ những câu hỏi về y tế, chăm sóc cá nhân và pháp lý sang người có chuyên môn, và coi thông tin sức khỏe của thành viên là chuyện riêng tư.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "firstSteps": "Mạng lưới này chỉ chạy được nếu hàng xóm khuyết tật ngồi cùng bàn ngay từ cuộc trò chuyện đầu tiên — không phải được hỏi ý sau, mà là người quyết định nó là cái gì. Hãy bắt đầu bằng cách mời hai ba người khuyết tật bạn quen cùng đứng ra lập nó với bạn (hoặc, nếu chính bạn là người khuyết tật, thì cùng gánh cho nhẹ), và để nhu cầu tiếp cận của họ định hình buổi gặp đầu tiên: cả hình thức, chỗ gặp lẫn nhịp đi.",
    "commonPitfalls": "Cái hỏng kinh điển là những người đồng hành đầy thiện ý dựng lên một chương trình cho người khuyết tật mà người khuyết tật không hề nhờ, theo những hình thức họ không dùng được. Cái hỏng lặng lẽ hơn là dần trôi thành một nơi chăm sóc không chính thức: việc giúp nhau giữa những người cùng cảnh không thể thay an toàn cho chăm sóc y tế hay chăm sóc cá nhân, nên hãy cứ chỉ những nhu cầu đó sang người có chuyên môn và giữ thông tin sức khỏe của thành viên đúng như thứ riêng tư mà nó vốn là.",
    "pairsWith": [
      "neighborhood-care-network",
      "rides-transportation",
      "health-navigation"
    ],
    "learnMore": [
      "lurking-ok"
    ],
    "tasks": [
      {
        "name": "Đặt người khuyết tật vào vai dẫn dắt",
        "description": "Giữ cho thành viên khuyết tật là người dẫn dắt và định hình mạng lưới. “Không bàn chuyện của người khuyết tật mà thiếu người khuyết tật” là nguyên tắc gốc — người đồng hành nâng đỡ, chứ không chỉ đạo.",
        "hours": 3,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Dựng cách liên lạc ai cũng dùng được",
        "description": "Mở nhiều đường để tham gia (gọi điện, nhắn tin, trên mạng, gặp trực tiếp), viết lời thật giản dị, và giữ cho mọi tài liệu chạy được với trình đọc màn hình và với nhiều nhu cầu khác nhau.",
        "hours": 3,
        "skills": [
          "trợ năng",
          "rành máy tính"
        ]
      },
      {
        "name": "Vẽ ra điều mọi người cần và nguồn giúp đỡ",
        "description": "Tìm hiểu thành viên đang cần gì và lập danh mục nguồn giúp đỡ ở địa phương: xe đi lại tiếp cận được, chỗ có thiết bị, các nơi trợ giúp, và người giúp làm hồ sơ trợ cấp. Chỉ ra những khoảng trống lớn nhất.",
        "hours": 5,
        "skills": [
          "kết nối",
          "nhập liệu"
        ]
      },
      {
        "name": "Mở một chỗ trao đổi nâng đỡ lẫn nhau",
        "description": "Làm một cách để thành viên vừa cho vừa nhận giúp đỡ — chạy việc vặt, có người đi cùng tới các buổi hẹn để lên tiếng giúp, hỏi thăm nhau — ghép theo sức và theo điều đang cần.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Lập kho thiết bị cho mượn",
        "description": "Gom và cho mượn dụng cụ đi lại và thiết bị trợ giúp, khử trùng giữa mỗi lượt mượn. Nhiều thiết bị nằm không sau khi trẻ đã lớn hơn hoặc khi không còn cần tới nữa.",
        "hours": 4,
        "skills": [
          "kết nối",
          "tổ chức"
        ]
      },
      {
        "name": "Đi cùng và lên tiếng giúp khi cần",
        "description": "Giúp thành viên đi qua các khoản trợ cấp, các điều chỉnh chỗ làm chỗ học và các nơi trợ giúp. Chia sẻ thông tin và đi cùng, còn câu hỏi pháp lý hay y tế thì chỉ sang người có chuyên môn.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "giấy tờ"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Đặt chuẩn tiếp cận cho mọi buổi của chương trình",
        "description": "Soạn một bảng kiểm (lối vào, chỗ ngồi, phiên dịch, nhu cầu giác quan, tài liệu) để mọi dự án trong chương trình rộng hơn của bạn đều đón được thành viên khuyết tật.",
        "hours": 3,
        "skills": [
          "trợ năng",
          "viết lách"
        ]
      }
    ]
  },
  {
    "id": "books-to-prisoners",
    "name": "Chương trình gửi sách và viết thư cho người đang ở tù",
    "purpose": "Gửi sách và thư miễn phí tới người đang ở tù để bớt cô quạnh và tiếp sức cho việc học.",
    "whoItServes": "Người đang ở tù và, qua họ, gia đình cùng cộng đồng của họ.",
    "whatYoullNeed": "Sách được tặng, người góp một tay, tiền cước gửi thư, và hiểu biết về quy định nhận thư của từng trại giam. Quy định nhận thư của mỗi trại đều ngặt và mỗi nơi mỗi khác — gói nào phạm quy là bị trả về, nên hãy theo cho thật đúng, và người viết thư luôn dùng địa chỉ của chương trình, đừng bao giờ dùng địa chỉ nhà.",
    "setupHours": 21,
    "defaultCategory": "education",
    "suggestsWorkDays": true,
    "firstSteps": "Trước khi gom cuốn sách đầu tiên, hãy gọi cho một nhóm gửi sách vào tù đã làm lâu năm — phần lớn sẽ vui vẻ kể cho bạn họ phủ những trại nào, quy định nào hay khiến người ta vấp, và ở đâu thư nhờ gửi mãi không ai trả lời. Rồi xin bằng văn bản quy định nhận thư đang có hiệu lực của một hai trại bạn sẽ bắt đầu; chính điều người đang ở tù xin mới nên định hình tủ sách của bạn, chứ không phải thứ người tặng dọn khỏi kệ nhà mình.",
    "commonPitfalls": "Dự án này chết vì những gói bị trả lại: một cuốn sách cũ ở nơi chỉ nhận sách mới, một cuốn bìa cứng, một quy định dán nhãn bị quên — tiền cước đổ sông đổ biển và gói hàng ai đó chờ mãi bị gửi ngược về. Nó cũng có thể làm hại chính người viết thư từ nhà mình; mọi lá thư đều đi bằng địa chỉ của chương trình, không ngoại lệ, thư từ có thân tình tới đâu cũng vậy.",
    "pairsWith": [
      "reentry-support",
      "free-little-library"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Nắm quy định nhận thư của từng trại",
        "description": "Mỗi nhà tù có quy định ngặt và riêng — nhiều nơi bắt sách phải mới và gửi thẳng từ nhà xuất bản hay nhà bán được duyệt, kèm giới hạn về nội dung và số lượng. Hãy tìm hiểu thật kỹ, vì thư từ phạm quy là bị trả về.",
        "hours": 5,
        "skills": [
          "giấy tờ"
        ]
      },
      {
        "name": "Gom sách và một chỗ làm",
        "description": "Gom sách được tặng (trong khuôn khổ quy định của các trại) và dựng một khu phân loại, đóng gói. Giữ tủ sách đa dạng: từ điển, sách học, truyện và sách về tái hòa nhập thường được xin nhiều nhất.",
        "hours": 4,
        "skills": [
          "kết nối",
          "lái xe"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Dựng cách nhận và theo dõi thư xin sách",
        "description": "Làm một cách để nhận và theo dõi thư xin sách từ người đang ở tù, họ viết ra chủ đề hoặc tên sách. Ghép từng lời xin với sách đang có.",
        "hours": 3,
        "skills": [
          "nhập liệu",
          "tổ chức"
        ]
      },
      {
        "name": "Mời người góp một tay và chỉ việc",
        "description": "Chỉ cho những người góp một tay cách ghép sách với lời xin, cách gói đúng quy định từng trại, và cách viết mấy dòng tử tế kèm theo. Đúng quy định thì khỏi phí cước và khỏi bị trả gói.",
        "hours": 3,
        "skills": [
          "kết nối",
          "dạy học"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Lo tiền cước và khâu gửi đi",
        "description": "Tiền cước là khoản tốn đều đặn lớn nhất. Hãy gây quỹ cho nó, chọn cách gửi rẻ nhất mà vẫn đúng quy định, và định những ngày gửi cố định.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Mở chương trình viết thư cho nhau",
        "description": "Ghép những người góp một tay làm bạn qua thư ở nơi có người muốn, kèm hướng dẫn rõ ràng về an toàn và riêng tư (dùng địa chỉ của chương trình, không dùng địa chỉ riêng). Sự kết nối cũng đáng giá như sách.",
        "hours": 3,
        "skills": [
          "viết lách"
        ]
      }
    ]
  },
  {
    "id": "community-music",
    "name": "Chương trình âm nhạc và nhạc cụ cho cộng đồng",
    "purpose": "Cho mượn nhạc cụ, dạy miễn phí và mở những buổi chơi nhạc chung để ai cũng đến được với âm nhạc.",
    "whoItServes": "Trẻ nhỏ và người lớn không kham nổi tiền mua nhạc cụ hay tiền học.",
    "whatYoullNeed": "Nhạc cụ được tặng, những người chịu dạy, một chỗ tập, và một cách cho mượn.",
    "setupHours": 15,
    "defaultCategory": "education",
    "firstSteps": "Hãy bắt đầu từ chính những người chơi nhạc quanh bạn — người ôm ghi ta ở nhà thờ đầu phố, bác chỉ huy ban nhạc đã nghỉ, mấy bạn nhỏ biết chơi — và hỏi họ thích dạy gì, dạy lúc nào. Một cuộc nói chuyện với tiệm nhạc cụ về việc sửa giá mềm, một cuộc nữa với một chỗ chịu được tiếng ồn, là bạn đã đi gần hết đường tới buổi chơi nhạc chung đầu tiên.",
    "commonPitfalls": "Kho nhạc cụ cho mượn lặng lẽ cạn khi đàn đi ra nhanh hơn là quay về trong tình trạng chơi được, nên hãy tính sẵn thời gian sửa ngay từ đầu và giữ quy ước trả đồ vừa rộng lượng vừa thật. Và để ý kẻo lớp học nghiêng dần về phía những người vốn đã tự tin: đứa trẻ chưa từng chạm vào nhạc cụ mới là người cần lời chào ấm nhất, chứ không phải suất ngắn nhất.",
    "pairsWith": [
      "library-of-things",
      "skill-share",
      "youth-mentorship"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Gom và sửa nhạc cụ",
        "description": "Gom nhạc cụ được tặng rồi cho lau chùi, thay dây hay sửa lại để chơi được. Dựng một dàn đủ loại và đủ trình độ.",
        "hours": 5,
        "skills": [
          "sửa chữa",
          "lái xe"
        ]
      },
      {
        "name": "Lập cách cho mượn nhạc cụ",
        "description": "Làm một sổ mượn theo dõi ai đang giữ cây nào, kèm cách giữ gìn và một quy ước trả đồ rộng lượng. Đánh số và ghi lại từng cây.",
        "hours": 2,
        "skills": [
          "nhập liệu"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Mời những người chịu dạy",
        "description": "Tìm những người chơi nhạc sẵn lòng kiên nhẫn dạy người mới. Không cần là dân chuyên — sự hào hứng và vốn cơ bản là đã đi được xa.",
        "hours": 3,
        "skills": [
          "kết nối",
          "âm nhạc"
        ]
      },
      {
        "name": "Tìm chỗ để dạy và chơi nhạc chung",
        "description": "Xin được một phòng mà tiếng ồn không thành vấn đề — nhà văn hóa, trường học, hay hội trường nhà thờ, chùa. Định giờ cố định cho buổi học và buổi chơi mở.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Xếp lịch buổi học và buổi chơi nhạc chung",
        "description": "Mở lớp cho người mới và buổi chơi chung cho mọi trình độ. Giữ việc ghi tên thật dễ và giờ giấc đa dạng cho người đi làm hay đi học.",
        "hours": 2,
        "recurringCadence": "session",
        "skills": [
          "tổ chức"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Nói rõ chuyện giữ gìn và trả đồ",
        "description": "Chỉ cho người mượn cách giữ gìn nhạc cụ cơ bản và phải làm gì khi có thứ hỏng. Giữ mọi thứ dựa trên lòng tin và nâng đỡ, đừng thành trừng phạt.",
        "hours": 1,
        "skills": [
          "viết lách"
        ],
        "follows": [
          1
        ]
      }
    ]
  },
  {
    "id": "school-supply-program",
    "name": "Chương trình đồ dùng học tập và ba lô đến trường",
    "purpose": "Trao đồ dùng học tập và ba lô miễn phí để trẻ vào năm học với đủ đồ và đủ tự tin.",
    "whoItServes": "Các gia đình thu nhập thấp có con đang tuổi đi học.",
    "whatYoullNeed": "Đồ dùng được tặng hoặc tiền, chỗ cất giữ, một điểm phát, và những người góp một tay.",
    "setupHours": 10,
    "defaultCategory": "mutual_aid_drive",
    "suggestsWorkDays": true,
    "firstSteps": "Cuộc nói chuyện đầu tiên của bạn là với một trường học — một thầy cô tư vấn, người liên lạc với phụ huynh, hay người điều phối cha mẹ học sinh, những người nắm danh sách đồ dùng thật và biết nhà nào đang lặng lẽ thiếu. Hãy để họ định hình bạn gom gì và các gia đình nghe tin bằng cách nào; một đợt trao đi qua người mà cha mẹ vốn đã tin sẽ tới được những đứa trẻ mà một tờ rơi không bao giờ tới.",
    "commonPitfalls": "Cái hỏng dễ đoán là một núi bìa hồ sơ được tặng mà không có lấy một cuốn vở như trong danh sách — gom cái dễ cho thay vì cái đang cần. Cái hỏng làm đau là một buổi phát giống như đi xét nghèo; hãy bỏ hết giấy tờ chứng minh thu nhập, để trẻ tự chọn ba lô của mình, và không ai ra về với cảm giác bị soi.",
    "pairsWith": [
      "youth-mentorship",
      "toy-library"
    ],
    "tasks": [
      {
        "name": "Xin danh sách đồ dùng và ước lượng cần bao nhiêu",
        "description": "Bắt tay với các trường quanh vùng để biết danh sách đồ dùng thật của từng khối lớp và ước lượng bao nhiêu gia đình cần giúp. Nhờ vậy đồ được tặng mới đúng thứ đang cần.",
        "hours": 1.5,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Mở đợt quyên góp và mua sỉ",
        "description": "Kết hợp các đợt quyên góp với mua sỉ những món cần nhất. Mua sỉ giúp đồng tiền đi xa nhất với những thứ căn bản như vở và bút chì.",
        "hours": 3,
        "recurringCadence": "cycle",
        "skills": [
          "kết nối",
          "lái xe"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Phân loại và soạn theo khối lớp",
        "description": "Sắp đồ dùng và soạn ba lô khớp với danh sách của từng khối lớp. Một buổi soạn theo dây chuyền với nhiều người góp tay sẽ chạy rất nhanh.",
        "hours": 2,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Lo chỗ cất giữ và một điểm phát",
        "description": "Xin được một chỗ cất khô ráo và một nơi đón người thật dễ chịu để trao ba lô, thường là ở trường, nhà văn hóa, hay ghép cùng một buổi tựu trường khác.",
        "hours": 1.5,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Xếp lịch và bố trí người cho buổi phát",
        "description": "Tổ chức buổi trao trước khi vào năm học, với những người góp một tay niềm nở. Cho trẻ tự chọn ba lô khi có thể — được chọn là thêm phần phẩm giá.",
        "hours": 2,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          2,
          3
        ],
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "legal-aid-clinic",
    "name": "Phòng tư vấn pháp luật miễn phí và chương trình Biết quyền của mình",
    "purpose": "Nối hàng xóm với sự giúp đỡ pháp luật miễn phí, và chỉ cho mọi người biết quyền của mình.",
    "whoItServes": "Bất kỳ ai đang gặp chuyện pháp luật mà không đủ sức thuê luật sư — chuyện nhà ở, di trú, tiền vay mượn, gia đình hay trợ cấp.",
    "whatYoullNeed": "Luật sư và sinh viên luật góp một tay, một chỗ ngồi, các tổ chức trợ giúp pháp lý cùng phối hợp, và việc xếp lịch. Lời khuyên pháp lý cho từng người phải đến từ luật sư có bằng, có giấy phép hành nghề (hoặc sinh viên luật có luật sư kèm) — chương trình này lo phần mở đường và chia sẻ hiểu biết chung về quyền lợi, bản thân nó không phải nơi cho lời khuyên pháp lý.",
    "setupHours": 26,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Chưa có luật sư thì chưa có gì bắt đầu được: những cuộc gọi đầu tiên là tới trung tâm trợ giúp pháp lý ở địa phương, chương trình pro bono (làm miễn phí) của đoàn luật sư, và phòng thực hành của một trường luật — hỏi họ cần gì để tới được, và hỏi những khoảng trống nào mà một phòng tư vấn trong khu phố mới thật sự lấp được. Hãy để những nơi cùng phối hợp đó vạch ra phạm vi của phòng tư vấn cùng bạn, trước khi báo gì với hàng xóm.",
    "commonPitfalls": "Cái hỏng nguy hiểm nhất là một người góp một tay đầy thiện chí trượt từ chỗ đưa thông tin sang chỗ khuyên bảo — một câu “cứ ký đi” có ý tốt cũng đủ làm hỏng vụ việc của ai đó, nên hãy giữ lằn ranh ấy thật rõ và tập nói cho quen. Cái hỏng chậm hơn là số người ghi danh vượt xa số luật sư: một danh sách chờ toàn người đang cùng quẫn mà trong phòng không có luật sư nào sẽ làm mất lòng tin nhanh hơn cả việc chưa từng mở cửa.",
    "pairsWith": [
      "tenant-union",
      "court-support",
      "newcomer-translation-network"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Bắt tay với luật sư và nơi trợ giúp pháp lý",
        "description": "Mời luật sư có giấy phép hành nghề, hoặc sinh viên luật có luật sư kèm, để họ là người đưa ra lời khuyên pháp lý thật sự. Gây dựng mối chuyển tiếp với các tổ chức trợ giúp pháp lý đã có tiếng.",
        "hours": 6,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Vạch rõ phạm vi và đường chuyển tiếp",
        "description": "Quyết xem phòng tư vấn nhận lo những chuyện gì, và đặt sẵn đường chuyển những vụ phức tạp hay cần chuyên môn riêng đi nơi khác. Nói thẳng ngay từ đầu điều gì phòng tư vấn làm được và điều gì không.",
        "hours": 3,
        "skills": [
          "viết lách"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Lo chỗ ngồi và cách tiếp nhận",
        "description": "Tìm một chỗ kín đáo, giữ được chuyện riêng, rồi làm phần tiếp nhận kèm bảng kê giấy tờ cần mang, để luật sư dùng thật khéo khoảng thời gian ít ỏi.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Làm cách đặt hẹn kín đáo",
        "description": "Sắp lịch hẹn sao cho chuyện riêng được che chắn. Chuyện pháp luật rất nhạy cảm, nên giữ gìn thông tin của mọi người thật cẩn thận từ đầu tới cuối.",
        "hours": 3,
        "skills": [
          "tổ chức",
          "nhập liệu"
        ]
      },
      {
        "name": "Soạn tài liệu và buổi học Biết quyền của mình",
        "description": "Làm những bản hướng dẫn rõ ràng, chính xác, và mở các buổi học về những quyền thường gặp (người thuê nhà, người đi làm, di trú, khi gặp cơ quan chức năng). Nói rõ đây là hiểu biết chung, không phải lời khuyên pháp lý cho từng người.",
        "hours": 5,
        "recurringCadence": "event",
        "skills": [
          "viết lách",
          "dạy học"
        ]
      },
      {
        "name": "Loan tin và xếp lịch các buổi tư vấn",
        "description": "Định ngày tư vấn lặp lại đều đặn và loan tin qua các tổ chức cùng phối hợp và cả chương trình tương trợ rộng hơn. Có người phiên dịch cho ai không thạo thứ tiếng đang dùng ở đó.",
        "hours": 3,
        "skills": [
          "kết nối",
          "dịch thuật"
        ],
        "follows": [
          0,
          3
        ]
      },
      {
        "name": "Giữ kín chuyện riêng và soát xung đột lợi ích",
        "description": "Đặt ra quy tắc giữ kín thật chặt và một bước soát xung đột lợi ích cơ bản, để không bao giờ có chuyện cùng một người góp tay lại đi khuyên cả hai bên đối nghịch. Tập cho cả nhóm quen với hai bổn phận này.",
        "hours": 3,
        "skills": [
          "giấy tờ"
        ]
      }
    ]
  },
  {
    "id": "resource-hub-dispatch",
    "name": "Đầu mối tương trợ và điều phối",
    "purpose": "Làm bộ khung điều phối — một chỗ duy nhất để ghép việc cần giúp với lời ngỏ giúp đỡ trên khắp mọi dự án của chương trình.",
    "whoItServes": "Mọi người trong chương trình — thành viên đang cần giúp, người sẵn lòng góp một tay, và những người dẫn dắt dự án cần có ai đó điều phối.",
    "whatYoullNeed": "Một cách tiếp nhận, một danh sách người giúp và nguồn lực, những người điều phối, và một danh bạ gốc. Đầu mối này giữ những chuyện nhạy cảm trong đời sống hàng xóm — chỉ thu thập những gì thật cần, giữ gìn cẩn thận, và chỉ chia chi tiết cho đúng người cần biết để giúp.",
    "setupHours": 27,
    "defaultCategory": "organizing",
    "firstSteps": "Đầu mối là nơi điều phối các dự án, nên hãy bắt đầu bằng việc ngồi xuống với người dẫn dắt từng dự án: họ nhận những lời nhờ nào, họ mong chuyển bớt việc gì đi, và họ muốn nhận các cặp ghép theo cách nào. Cùng nhau thống nhất một cách tiếp nhận chung và một mức nền về giữ kín riêng tư — một đầu mối áp từ trên xuống sẽ bị các dự án đi vòng qua; một đầu mối dựng cùng họ sẽ thành cánh cửa trước.",
    "commonPitfalls": "Đầu mối chết theo hai kiểu: phần tiếp nhận đầy ắp lời nhờ mà chẳng ai theo tới cùng, rồi tiếng đồn lan ra là gọi cũng chẳng để làm gì; hoặc một người điều phối gồng gánh mọi đầu việc cho tới lúc kiệt sức, và cả chương trình mất luôn trí nhớ. Hãy theo từng lời nhờ tới lúc khép lại thật sự, xoay ca sớm, và thu thập ít thông tin hơn mức bạn tưởng là cần.",
    "pairsWith": [
      "emergency-preparedness",
      "rides-transportation",
      "solidarity-fund"
    ],
    "learnMore": [
      "post-something",
      "claim-post"
    ],
    "tasks": [
      {
        "name": "Làm một cửa tiếp nhận duy nhất cho việc cần giúp và lời ngỏ",
        "description": "Mở một cánh cửa trước dễ vào — một số điện thoại, một mẫu điền, và một cách gặp trực tiếp — nơi ai cũng nói được mình cần gì hoặc cho đi được gì. Một lối vào duy nhất giúp không ai bị lọt qua kẽ hở.",
        "hours": 4,
        "skills": [
          "tổ chức",
          "rành máy tính"
        ]
      },
      {
        "name": "Lập danh sách người giúp và nguồn lực",
        "description": "Giữ một danh sách luôn mới về những người giúp (sở trường, lúc rảnh, chỗ ở) và những gì mỗi dự án góp được, để ghép lời nhờ thật nhanh.",
        "hours": 4,
        "skills": [
          "nhập liệu"
        ]
      },
      {
        "name": "Dựng cách ghép việc và chuyển việc",
        "description": "Định rõ một lời nhờ được chuyển tới đúng dự án hay đúng người giúp bằng cách nào và nhanh cỡ nào. Đặt mốc thời gian trả lời và cách theo dõi lời nhờ tới lúc xong.",
        "hours": 4,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          0,
          1
        ]
      },
      {
        "name": "Giữ một danh bạ nguồn lực gốc",
        "description": "Giữ một danh bạ sống về tất cả dự án của bạn cộng thêm các nơi bên ngoài (nhà tạm trú, phòng khám, chỗ có đồ ăn, nơi trợ giúp pháp lý) để đầu mối chỉ đường được tới bất cứ đâu có sự giúp đỡ.",
        "hours": 5,
        "recurringCadence": "month",
        "skills": [
          "nhập liệu"
        ]
      },
      {
        "name": "Mời và tập cho những người điều phối",
        "description": "Dựng một nhóm để thay phiên trực các ca chuyển việc, để đầu mối luôn đáp lời mà không ai kiệt sức. Chỉ cho họ cách làm và cuốn danh bạ.",
        "hours": 3,
        "skills": [
          "kết nối",
          "dạy học"
        ],
        "follows": [
          2,
          3
        ]
      },
      {
        "name": "Đặt nếp giữ riêng tư và theo tới cùng",
        "description": "Quyết xem thu thập những gì, giữ và che chắn ra sao, và xác nhận thế nào rằng một việc cần giúp đã thật sự được lo. Lấy ít nhất có thể và giữ gìn cẩn thận.",
        "hours": 4,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Ghi lại những việc chưa lo được và chỗ còn thiếu",
        "description": "Ghi lại những lời nhờ bạn chưa lo nổi. Những chỗ thiếu lặp đi lặp lại cho thấy chương trình nên mở dự án tiếp theo ở đâu — biến đầu mối thành công cụ để tính đường dài, chứ không chỉ là một tổng đài.",
        "hours": 3,
        "recurringCadence": "month",
        "skills": [
          "nhập liệu"
        ]
      }
    ]
  },
  {
    "id": "harm-reduction-supplies",
    "name": "Phát đồ dùng giảm tác hại",
    "purpose": "Đưa naloxone, que thử và các món đồ giúp dùng an toàn hơn tới tay những người có thể cần — tìm tới hàng xóm ngay ở chỗ họ đang đứng, không kèm theo phán xét nào.",
    "whoItServes": "Những người có dùng ma túy, bạn bè và gia đình họ, và bất cứ ai có thể có mặt lúc ai đó sốc thuốc — mà ở phần lớn khu phố thì đó là bất cứ ai.",
    "whatYoullNeed": "Buổi tập ứng phó khi có người sốc thuốc, một nguồn naloxone (chương trình của bang, nhà thuốc, hay một tổ chức cùng phối hợp), đồ để đóng gói, và một nhóm nhỏ đi phát. Phát đồ dùng không phải là chữa bệnh — ai đi phát cũng phải qua buổi tập ứng phó sốc thuốc trước đã, và luật về những thứ bạn được mang theo (que thử, bơm kim tiêm) khác nhau rất nhiều tùy nơi, nên hãy kiểm tra luật chỗ mình trước khi lấy bất cứ món gì về. Trong mỗi gói luôn kèm số đường dây khủng hoảng và nơi cai nghiện ở địa phương, in sẵn.",
    "setupHours": 20,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Khoan mua gì cả: bước đầu tiên là một cuộc trò chuyện với chương trình giảm tác hại đã có sẵn gần nhất, và với chính những người đang dùng các món đồ này — họ sẽ nói cho bạn biết cái gì đang thiếu, cái gì đã có người lo, và làm sao tới mà không mang theo phán xét. Cho cả nhóm nòng cốt qua buổi tập ứng phó sốc thuốc và kiểm tra luật chỗ mình về que thử và bơm kim tiêm, trước khi đóng gói dù chỉ một túi.",
    "commonPitfalls": "Chuyện này hỏng khi bạn xuất hiện như người lạ — đi phát ở nơi bạn chẳng quen ai, hoặc kèm theo lời răn dạy và điều kiện khiến người ta học cách tránh mặt bạn — và khi bạn đi trước cả luật lẫn phần mình được tập, điều có thể khiến một người góp tay bị buộc tội tàng trữ dụng cụ dùng ma túy. Ở đây, chậm mà có bạn đồng hành luôn thắng nhanh mà đi một mình.",
    "pairsWith": [
      "community-first-aid-training",
      "mental-health-peer-support"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Đi tập và tìm một nơi giảm tác hại cùng phối hợp",
        "description": "Cho nhóm nòng cốt qua một buổi tập ứng phó sốc thuốc và dùng naloxone — nhiều sở y tế và tổ chức giảm tác hại mở các buổi này miễn phí. Bắt tay với một chương trình đã có sẵn; họ đã gỡ xong những vướng mắc về nguồn hàng, pháp lý và lòng tin mà bạn không cần gỡ lại.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Kiểm tra luật chỗ mình về các món đồ",
        "description": "Naloxone gần như ở đâu cũng được pháp luật che chở, nhưng que thử và bơm kim tiêm ở vài nơi vẫn bị xếp vào dụng cụ dùng ma túy. Tìm cho ra chính xác bạn được mang theo và phát ra những gì — tổ chức cùng phối hợp hoặc một phòng tư vấn pháp luật miễn phí sẽ trả lời rất nhanh. Viết ra giấy cho những người đi phát.",
        "hours": 3,
        "skills": [
          "tra cứu"
        ]
      },
      {
        "name": "Tìm nguồn naloxone và đồ đóng gói",
        "description": "Đặt naloxone qua chương trình phân phối của bang, đơn thường trực của nhà thuốc, hoặc tổ chức cùng phối hợp. Thêm bất cứ thứ gì hợp pháp ở chỗ bạn: que thử fentanyl và xylazine, đồ chăm vết thương, đồ vệ sinh.",
        "hours": 4,
        "follows": [
          1
        ]
      },
      {
        "name": "Đóng gói kèm tờ hướng dẫn dễ hiểu",
        "description": "Đóng gói kèm hướng dẫn đơn giản, nhiều thứ tiếng: cách nhận ra người đang sốc thuốc, cách cho dùng naloxone, gọi cấp cứu, đừng bao giờ dùng một mình. Trong mỗi gói có số đường dây khủng hoảng và nơi cai nghiện ở địa phương. Có một bàn đông người thì đóng gói rất nhanh.",
        "hours": 3,
        "skills": [
          "dịch thuật"
        ],
        "follows": [
          2
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Sắp các vòng đi phát và các điểm cố định",
        "description": "Lên các vòng đi bộ hay đi xe đều đặn qua những nơi người ta thật sự có mặt, và nhờ quán bar, quán tạp hóa, thư viện, tụ điểm giữ giúp một chiếc hộp không hỏi han gì. Cửa thấp là toàn bộ cái lý của việc này — không tờ khai, không răn dạy.",
        "hours": 4,
        "skills": [
          "kết nối",
          "lái xe"
        ]
      },
      {
        "name": "Bù hàng, ghi chép và giữ cho phần tập luôn mới",
        "description": "Ghi lại món gì hết nhanh và món gì nằm yên, ghi hạn dùng của naloxone, và mở buổi tập nhắc lại khi có người mới vào. Nếu một gói kéo được ai đó qua cơn sốc thuốc, chuyện đó đáng được ghi lại (thật nhẹ nhàng).",
        "hours": 2,
        "recurringCadence": "month"
      }
    ]
  },
  {
    "id": "court-support",
    "name": "Đi cùng và tiếp sức ở tòa",
    "purpose": "Giữ cho không một người hàng xóm nào phải ra tòa một mình — có người ngồi cùng trong phòng xử, có xe chở đi, có người trông con trong lúc xử, và có thư ủng hộ khi luật sư bào chữa cần tới.",
    "whoItServes": "Hàng xóm có phiên tòa về hình sự, di trú, bị đuổi khỏi nhà thuê hay chuyện gia đình, và cả gia đình họ — tự xoay xở tới tòa một mình có thể khiến người ta mất việc làm, mất chỗ gửi con và mất luôn hy vọng.",
    "whatYoullNeed": "Những người góp một tay đáng tin, một cuốn lịch các phiên tòa, và mối quen với các văn phòng luật sư bào chữa công. Đi cùng ở tòa là sự có mặt và lo phần đi lại, không phải lời khuyên pháp lý — người góp tay không bao giờ bàn chuyện vụ việc và luôn theo đúng ý luật sư của chính người đó. Phòng xử có nội quy rất nghiêm, nên ai vào cũng phải thuộc nằm lòng.",
    "setupHours": 16,
    "defaultCategory": "other",
    "firstSteps": "Bắt đầu từ chính những người có phiên tòa đó: việc đi cùng chỉ diễn ra khi người ra tòa mời, và phải khớp nhịp với luật sư của họ. Hãy tự giới thiệu trước với văn phòng luật sư bào chữa công và với các nhóm quan sát phiên tòa hay quỹ đóng tiền tại ngoại đã có mặt ở tòa, rồi để họ chỉ cho bạn phiên nào cần có người ngồi cùng và làm sao để có ích mà không đụng vào phần pháp lý.",
    "commonPitfalls": "Cái hại ở đây đến từ việc tự ý làm theo ý mình: một người góp tay đứng ngoài hành lang “giảng giải” về một thỏa thuận nhận tội, chi tiết vụ việc bị bàn ở chỗ công tố viên nghe được, một phản ứng lộ ra từ hàng ghế dự khán làm thẩm phán khó chịu — bất cứ điều nào cũng có thể làm hại đúng người mà bạn tới vì họ. Cái hỏng lặng lẽ hơn là chuyện đi lại: một ngày ra tòa chưa xác nhận lại hay một chuyến xe hụt có thể thành một phiên tòa bị vắng mặt và một lệnh bắt.",
    "pairsWith": [
      "legal-aid-clinic",
      "reentry-support",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Bắt liên lạc với luật sư bào chữa công và các nhóm đã ở tòa",
        "description": "Tự giới thiệu với văn phòng luật sư bào chữa công, nơi trợ giúp pháp lý về di trú, và bất cứ nhóm quan sát phiên tòa hay quỹ đóng tiền tại ngoại nào đang làm sẵn. Họ sẽ chỉ cho bạn chỗ nào cần tiếp sức nhất và cách góp vào mà không vướng chân ai.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Viết ra quy tắc nền: tiếp sức, không làm luật",
        "description": "Ghi hẳn ra giấy: người góp tay không bao giờ đưa lời khuyên pháp lý, không bao giờ bàn chi tiết vụ việc ở khu vực công cộng trong tòa, và luôn nhường phần đó cho luật sư của chính người ra tòa. Thêm nội quy phòng xử — tới sớm, ăn mặc giản dị, tắt điện thoại, không phản ứng gì từ hàng ghế dự khán.",
        "hours": 2,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Làm cách tiếp nhận và cuốn lịch phiên tòa",
        "description": "Tạo một cách thật đơn giản để người ta ngỏ lời nhờ đi cùng, và một cuốn lịch chung ghi ngày, phòng xử, và mỗi người cần gì — người ngồi cùng, chuyến xe, người trông con, hay cả ba. Ngày ra tòa đổi liên tục, nên hãy xác nhận lại từ hôm trước.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Tập cho những người đi cùng",
        "description": "Dẫn người góp tay đi thử một vòng tòa án: cửa kiểm tra an ninh, cách tìm phòng xử, chỗ ngồi, và cách chỉ đơn giản là ngồi đó — vững vàng, ấm áp — suốt một cuộc chờ căng thẳng. Ghép mỗi người mới với một người đã quen việc trong lần đầu tiên.",
        "hours": 3,
        "skills": [
          "dạy học"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Lo xe đưa đón và người trông trẻ cho các phiên tòa",
        "description": "Sắp sẵn người lái xe cho những buổi sáng ra tòa và những cặp trông trẻ để coi bọn nhỏ trong lúc xử — nhiều phòng xử không cho trẻ vào, mà lỡ một phiên tòa vì không ai trông con có thể dẫn tới một lệnh bắt.",
        "hours": 3,
        "skills": [
          "lái xe",
          "trông trẻ"
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Gom thư ủng hộ khi luật sư bào chữa cần",
        "description": "Khi luật sư của ai đó xin thư nói về nhân thân hay thư ủng hộ từ cộng đồng, hãy rủ hàng xóm cùng viết — theo đúng từng chữ hướng dẫn của luật sư về nội dung, giọng văn và hạn nộp.",
        "hours": 2,
        "skills": [
          "viết lách"
        ]
      }
    ]
  },
  {
    "id": "cooling-warming-center",
    "name": "Điểm tránh nóng tránh lạnh mở khi cần",
    "purpose": "Mở một nơi trú cho khu phố khi thời tiết trở mặt — một căn phòng mát giữa đợt nắng nóng, một căn phòng ấm giữa đợt lạnh sâu — sẵn sàng trước khi thời tiết trở nên nguy hiểm, chứ không phải sau.",
    "whoItServes": "Người lớn tuổi, hàng xóm không có nhà ở, người không có máy lạnh hay lò sưởi chạy được, người làm việc ngoài trời, và bất cứ ai có chỗ ở không chống nổi thời tiết.",
    "whatYoullNeed": "Một nơi cho mượn chỗ có máy lạnh hoặc lò sưởi và có nhà vệ sinh, đồ dùng, và những người trực ca đã được tập. Người trực ca là hàng xóm, không phải nhân viên y tế — hãy tập cho mọi người nhận ra dấu hiệu kiệt sức vì nóng và hạ thân nhiệt, và gọi cấp cứu sớm chứ đừng muộn; và giải quyết xong chuyện bảo hiểm cùng trách nhiệm của nơi cho mượn chỗ trước lần mở cửa đầu tiên, chứ đừng để tới lúc đang mở.",
    "setupHours": 21,
    "defaultCategory": "other",
    "suggestsWorkDays": true,
    "firstSteps": "Nơi cho mượn chỗ là mối quan hệ mà mọi thứ đều dựa vào, nên hãy bắt đầu từ đó: ngồi xuống với người thủ thư, vị mục sư hay người quản hội trường và cùng đi qua những câu hỏi khó chịu — giờ giấc, chìa khóa, bảo hiểm, chuyện gì xảy ra nếu có người cần ở lại qua đêm — trước khi bản tin thời tiết đầu tiên ép mọi người phải trả lời. Cùng lúc đó, hỏi những người đi thăm hỏi tận nơi và người trông coi khu nhà cho người lớn tuổi xem ai mới thật sự cần chỗ trú, để địa điểm và giờ mở cửa vừa vặn với chính những người mà nó dựng lên vì họ.",
    "commonPitfalls": "Dự án này hỏng ở khoảng trống giữa kế hoạch và thời tiết: một cái mốc mở cửa chưa ai chốt hẳn, thế là điểm trú mở muộn mất một ngày; hoặc một câu hỏi về trách nhiệm bị để lửng cho tới lúc có người ngã quỵ và nơi cho mượn chỗ rút lui hẳn. Hãy ghi mốc mở cửa ra giấy, mở thử một buổi tập dượt trước mùa, và chắc chắn mọi người trực ca đều biết phải gọi cấp cứu sớm, chứ không phải sau cùng.",
    "pairsWith": [
      "emergency-preparedness",
      "community-wood-bank",
      "laundry-shower-access"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Tìm một nơi cho mượn chỗ có máy lạnh và lò sưởi",
        "description": "Hỏi thư viện, nơi thờ tự, hội trường công đoàn và nhà văn hóa xem có phòng nào máy lạnh và lò sưởi chạy tốt, có nhà vệ sinh, và vào được không cần leo bậc. Xin cái gật đầu bằng văn bản, ghi rõ giờ giấc, ai giữ chìa khóa, và tính sao nếu cần mở qua đêm.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Định mốc mở cửa và cách báo tin",
        "description": "Quyết trước thật rõ điều gì làm điểm trú mở cửa — một mức nhiệt độ dự báo, một chỉ số nóng bức, một mức nhiệt độ cảm nhận khi trở lạnh — để không ai phải tự phán đoán lúc nửa đêm. Lập một chuỗi gọi điện hay một nhóm trò chuyện để báo người trực ca sẵn sàng trước một ngày.",
        "hours": 2
      },
      {
        "name": "Gom đủ đồ dùng",
        "description": "Gom nước, gói bù nước điện giải, chăn, giường xếp hoặc ghế ngồi thoải mái, quạt, sạc điện thoại, và một túi sơ cứu. Cất hết ngay tại chỗ trong những thùng có dán nhãn để người trực ca nào cũng tìm ra.",
        "hours": 3,
        "skills": [
          "lái xe"
        ],
        "follows": [
          0
        ]
      },
      {
        "name": "Mời và tập cho người trực ca",
        "description": "Tìm đủ người để mỗi ca có hai người, và tập cho họ: đón người tới mà không cần giấy tờ gì, nhận ra dấu hiệu kiệt sức vì nóng và hạ thân nhiệt, lúc nào thì gọi cấp cứu, và cách hạ nhiệt căng thẳng. Cái ấm áp theo nghĩa con người cũng quan trọng ngang cái máy điều nhiệt.",
        "hours": 4,
        "skills": [
          "dạy học"
        ]
      },
      {
        "name": "Dựng lịch ca thay phiên",
        "description": "Chuẩn bị sẵn một bảng ca có thể bật lên chỉ với một ngày báo trước — người mở cửa, người đóng cửa, và người trực đêm nếu bạn có mở đêm. Giữ thêm một danh sách dự bị, vì đợt nắng nóng cũng quật ngã cả những người góp tay.",
        "hours": 2,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "event"
      },
      {
        "name": "Loan tin trước khi vào mùa",
        "description": "Làm tờ rơi nhiều thứ tiếng ghi rõ mốc mở cửa và địa điểm, rồi đưa tới phòng khám, khu nhà cho người lớn tuổi, những người đi thăm hỏi tận nơi và quán tạp hóa — trước đợt nắng nóng hay đợt lạnh đầu tiên, chứ không phải giữa lúc đang xảy ra.",
        "hours": 3,
        "skills": [
          "thiết kế đồ họa",
          "dịch thuật"
        ]
      },
      {
        "name": "Mở cửa, trực và dọn lại sau mỗi đợt",
        "description": "Giữ điểm trú mở suốt đợt thời tiết ấy: ghi tên người tới thật nhẹ nhàng (chỉ đếm số, không xem giấy tùy thân), giữ đồ dùng luôn có sẵn, và ngó chừng ai đang ngủ. Xong xuôi thì dọn dẹp, bù đồ, và ghi lại món gì đã hụt.",
        "hours": 3,
        "recurringCadence": "event"
      }
    ]
  },
  {
    "id": "community-oral-history",
    "name": "Dự án ghi lại chuyện kể của cộng đồng",
    "purpose": "Ghi lại chuyện của người lớn tuổi và của hàng xóm trước khi những chuyện ấy mất đi — và để chính người kể nắm quyền quyết định số phận của chúng.",
    "whoItServes": "Những người lớn tuổi mang trong mình những câu chuyện chưa ai hỏi tới, những người sống lâu năm ở đây đang nhìn khu phố đổi thay, và mọi hàng xóm sẽ đến sau này.",
    "whatYoullNeed": "Một chiếc điện thoại hay một máy ghi âm đơn giản, một góc yên tĩnh, giấy đồng ý, và một nơi an toàn để cất các tệp. Bản ghi âm là dữ liệu cá nhân — mỗi người tham gia làm chủ câu chuyện của mình, quyết chuyện ấy được chia sẻ ở đâu, và có thể đổi ý về sau. Không gì được đưa ra công khai nếu chưa có cái gật đầu bằng văn bản của họ.",
    "setupHours": 10,
    "defaultCategory": "education",
    "firstSteps": "Bắt đầu với một người lớn tuổi tin cậy bạn và hỏi xem người ấy có muốn kể một câu chuyện không — lần ghi âm đầu tiên đó dạy bạn nhiều hơn mọi kế hoạch, và lời của người ấy sẽ mở đường cho bạn với người kể tiếp theo. Trước khi bấm nút ghi âm với bất kỳ ai, hãy cùng nhau đọc qua giấy đồng ý và hỏi họ muốn chuyện gì xảy ra với bản ghi; chính cuộc trò chuyện đó mới là dự án.",
    "commonPitfalls": "Cách chuyện này làm ai đó tổn thương là khi một câu chuyện đi xa hơn mức người kể đã đồng ý — một đoạn được đăng lên, một cái tên bị gắn vào, một chi tiết vốn chỉ dành riêng cho bạn. Còn cách nó chết lặng lẽ là những bản ghi chất đống không tên trong điện thoại của một người, cho tới ngày chiếc máy thất lạc xóa sạch nhiều năm giọng nói; hãy đặt tên và sao lưu mỗi buổi ghi ngay trong tuần đó.",
    "pairsWith": [
      "neighborhood-care-network",
      "digital-literacy"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Viết một tờ giấy đồng ý bằng lời dễ hiểu",
        "description": "Một trang, không chữ nghĩa luật lệ: ghi lại cái gì, có thể được chia sẻ ở đâu, và quyền của người tham gia được dừng lại, bỏ qua câu hỏi, hay rút bản ghi về sau. Hãy dịch tờ giấy sang những thứ tiếng mà người kể chuyện của bạn thật sự nói.",
        "hours": 2,
        "skills": [
          "viết lách",
          "dịch thuật"
        ]
      },
      {
        "name": "Chuẩn bị đồ nghề và một danh sách câu hỏi",
        "description": "Một chiếc điện thoại có ứng dụng ghi âm là đủ; thêm một chiếc micro cài áo rẻ tiền nếu được. Soạn những câu hỏi mở gợi ra chuyện kể — “kể tôi nghe con phố này hồi mới tới trông ra sao” — và tập với nhau một lần.",
        "hours": 2
      },
      {
        "name": "Ghi lại những buổi kể chuyện",
        "description": "Ngồi với mỗi lần một người kể, ở một nơi yên tĩnh và dễ chịu. Cùng nhau đọc qua giấy đồng ý trước đã, rồi phần lớn thời gian là lắng nghe — những buổi trò chuyện hay nhất là những buổi bạn nói ít nhất.",
        "hours": 4,
        "skills": [
          "lắng nghe"
        ],
        "follows": [
          0,
          1
        ],
        "recurringCadence": "session"
      },
      {
        "name": "Cất giữ và gửi lại, theo ý người kể",
        "description": "Đặt tên cho từng bản ghi kèm ngày, tên người, và điều đã thỏa thuận về chuyện chia sẻ. Giữ hai bản ở nơi an toàn, đưa cho mỗi người kể một bản của riêng họ, và chỉ đưa ra công khai đúng những đoạn từng người đã đồng ý.",
        "hours": 2,
        "follows": [
          2
        ]
      }
    ]
  },
  {
    "id": "community-solar-coop",
    "name": "Hợp tác xã điện mặt trời của cộng đồng",
    "purpose": "Góp chung nguồn lực của hàng xóm vào một nguồn điện sạch dùng chung, giúp mọi nhà bớt tiền điện — nhất là với những người thuê nhà và những gia đình không đời nào đặt được tấm pin lên mái nhà của riêng mình.",
    "whoItServes": "Người thuê nhà, những gia đình thu nhập thấp, và bất cứ ai bị mái nhà, bị chủ nhà, hay bị túi tiền của mình đóng cửa với chuyện lắp pin mặt trời trên mái.",
    "whatYoullNeed": "Những thành viên gắn bó, hiểu biết về kỹ thuật và tiền nong mà bạn có thể mượn hoặc học lấy, một nơi cho mượn mái hoặc một chương trình điện mặt trời cộng đồng đã có sẵn để tham gia, và các tổ chức cùng phối hợp. Có một điều xin nói thẳng: hợp tác xã năng lượng kéo theo những rắc rối thật sự về tiền bạc và pháp lý — hãy hỏi ý kiến những người có chuyên môn về cơ cấu, cách gọi vốn và hợp đồng, trước khi bất kỳ ai ký bất cứ thứ gì.",
    "setupHours": 27,
    "defaultCategory": "infrastructure",
    "firstSteps": "Trước cả tấm pin lẫn giấy tờ, hãy nói chuyện với hai nhóm: những người hàng xóm sẽ thật sự tham gia, để đo mức gắn bó thật, và một hợp tác xã điện mặt trời ở vùng bên hay bang bên đã làm rồi — họ sẽ cho bạn biết mô hình nào hợp với luật lệ vùng bạn và những sai lầm nào đã khiến họ mất tiền. Rồi hãy tự mình đọc những luật lệ ở địa phương, vì chính chúng, chứ không phải lòng hăng hái của bạn, mới quyết được điều gì là khả thi.",
    "commonPitfalls": "Hợp tác xã điện mặt trời chết ở khoảng trống giữa lúc hào hứng và lúc đặt bút ký: cả một năm họp hành về một mô hình mà luật của bang bạn chưa bao giờ cho phép, hoặc một hợp đồng ký mà không có người chuyên môn đọc lại, trói các thành viên vào những điều khoản chẳng ai hiểu. Kẻ giết người còn lại là chuyện tiền nong mù mờ — nếu thành viên không nhìn rõ được mình bỏ vào bao nhiêu và nhận lại bao nhiêu, lòng tin sẽ mòn đi và hợp tác xã rã ra.",
    "pairsWith": [
      "weatherization-brigade",
      "bulk-buying-coop"
    ],
    "tasks": [
      {
        "name": "Gom thành viên và đo mức quan tâm",
        "description": "Mời những gia đình muốn có điện sạch rẻ hơn, rồi tìm hiểu xem họ gắn bó tới đâu — hào hứng chung chung và một thành viên đã ghi tên là hai chuyện khác nhau. Con số của bạn định hình mô hình nào là thực tế, nên hãy đếm cho thật thà trước khi tính đường.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Học các mô hình và luật lệ ở địa phương",
        "description": "Tìm hiểu điện mặt trời cộng đồng chạy thế nào ở nơi bạn sống: luật của bang, cơ chế đo điện hai chiều, các chương trình thuê bao, cách lập hợp tác xã. Luật lệ khác nhau ghê gớm giữa nơi này với nơi kia và chính chúng quyết điều gì thật sự làm được — hãy làm việc này trước khi trót phải lòng bất kỳ mô hình nào.",
        "hours": 5,
        "skills": [
          "tra cứu"
        ]
      },
      {
        "name": "Tìm một chỗ đặt hoặc một chương trình để tham gia",
        "description": "Tìm một mái nhà cho mượn hoặc một mảnh đất để đặt dàn pin chung, hoặc hỏi xem một chương trình điện mặt trời cộng đồng đã có sẵn có nhận nhóm bạn làm thuê bao chung không — tham gia sẵn thường nhanh hơn tự dựng rất nhiều. Cân nhắc cả hai đường cùng với thành viên trước khi chốt.",
        "hours": 4,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Gỡ chuyện vốn liếng và cơ cấu pháp lý",
        "description": "Quyết dự án được gọi vốn và điều hành thế nào, rồi lập hợp tác xã cho đúng cách. Đây là bước có hệ quả pháp lý và tiền bạc thật sự — hãy mời người có chuyên môn đọc lại cơ cấu và từng hợp đồng, và đừng ký cho tới khi họ đọc xong.",
        "hours": 5,
        "skills": [
          "giấy tờ",
          "kế toán"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Bắt tay với thợ lắp đặt và nhà cung cấp",
        "description": "Tìm những thợ lắp đặt hay nhà cung cấp có tiếng tốt, so ít nhất hai bản báo giá, và ghi rõ bằng văn bản phần bảo hành cùng việc chăm sóc lâu dài. Một lần lắp rẻ mà không có kế hoạch bảo dưỡng sẽ thành đắt đỏ sau năm năm.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Dựng cách trừ tiền điện và cách vào hợp tác xã",
        "description": "Tính cho thật rõ phần tiết kiệm hay phần được trừ tới tay thành viên bằng cách nào, và việc vào hợp tác xã cùng chuyện đóng tiền chạy ra sao. Hãy làm cho nó minh bạch và dễ hiểu — một thành viên phải nhìn được, chỉ trên một trang, mình bỏ vào bao nhiêu và nhận lại bao nhiêu.",
        "hours": 3,
        "skills": [
          "kế toán",
          "nhập liệu"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Chỉ cho thành viên cách dùng điện",
        "description": "Giúp thành viên đọc được hóa đơn tiền điện và cắt bớt phần điện tiêu thụ — một kilowatt tiết kiệm được còn hơn một kilowatt làm ra. Đi kèm phần tiết kiệm từ điện mặt trời là những mẹo tiết kiệm giản dị, để các gia đình thấy khác biệt ngay trên tờ giấy.",
        "hours": 3,
        "skills": [
          "dạy học"
        ]
      }
    ]
  },
  {
    "id": "worker-coop-incubator",
    "name": "Vườn ươm hợp tác xã của người lao động và tay nghề đi làm",
    "purpose": "Giúp hàng xóm dựng tay nghề đi làm và mở ra những hợp tác xã do chính người làm việc làm chủ — những kế sinh nhai mà người làm ra việc cũng là người làm chủ chỗ làm và là người quyết định.",
    "whoItServes": "Những người hàng xóm chưa có việc hoặc việc làm bấp bênh, và bất cứ ai muốn có phần thật sự trong nơi mình làm việc.",
    "whatYoullNeed": "Những người dìu dắt có kinh nghiệm làm ăn và kinh nghiệm hợp tác xã, chỗ và tài liệu để dạy, những nguồn giúp lúc khởi đầu mà bạn chỉ đường tới được, và các mối bắt tay — người chuyên gây dựng hợp tác xã, những bên cho vay hiểu về hợp tác xã, và chính chương trình chia sẻ sở trường của bạn.",
    "setupHours": 27,
    "defaultCategory": "education",
    "firstSteps": "Bắt đầu bằng những cuộc trò chuyện, đừng bắt đầu bằng giáo trình: ngồi xuống với các thành viên đang quan tâm để nghe họ làm được gì và muốn dựng nên cái gì, rồi tìm những chùm sở trường thật sự có thể thành một nhóm làm ăn. Cùng lúc đó, tìm người chuyên gây dựng hợp tác xã ở vùng bạn hoặc một hợp tác xã của người lao động đã có sẵn chịu dìu dắt — những vết sẹo của họ chính là giáo trình của bạn, và lập hợp tác xã mà thiếu sự dẫn dắt đó là chỗ các nhóm bị đau.",
    "commonPitfalls": "Chuyện này hỏng theo hai kiểu: thành một chương trình dạy nghề chẳng bao giờ mở ra được cái gì, vì không ai đẩy một chùm sở trường đi tới một nhóm làm ăn thật — hoặc thành một cú mở màn bỏ qua mấy phần buồn tẻ, đăng ký thành lập bằng một mẫu tải trên mạng rồi hai năm sau mới phát hiện mớ bòng bong về cách điều hành và thuế má. Nó cũng chết lặng lẽ khi một người đứng ra tổ chức ôm hết mọi mối quan hệ với người dìu dắt và bên tài trợ; hãy chia những đầu mối ấy ra ngay từ ngày đầu.",
    "pairsWith": [
      "skill-share",
      "solidarity-fund",
      "time-bank"
    ],
    "tasks": [
      {
        "name": "Xem sở trường và mong muốn của thành viên",
        "description": "Ngồi xuống với thành viên và nghe họ làm được gì, muốn dựng nên cái gì. Bạn đang tìm những chùm — ba người biết nấu ăn, một tốp có tay nghề thợ, năm người nhận dọn dẹp — vì một chùm sở trường chính là hạt giống của một nhóm làm ăn theo lối hợp tác xã.",
        "hours": 4,
        "skills": [
          "phỏng vấn"
        ]
      },
      {
        "name": "Mở lớp sẵn sàng đi làm và luyện tay nghề",
        "description": "Mở các buổi về hồ sơ xin việc, phỏng vấn, nghề thợ, việc trên máy tính, và chuyện tính toán tiền nong. Dựa vào chương trình chia sẻ sở trường của bạn và mời người ngoài về dạy những gì không ai ở đây dạy được — đích đến là những thành viên vững tay, dù rồi có lập nên hợp tác xã quanh họ hay không.",
        "hours": 5,
        "skills": [
          "dạy học"
        ]
      },
      {
        "name": "Dạy về lối làm ăn hợp tác xã",
        "description": "Dẫn thành viên đi qua chuyện người làm việc làm chủ và cùng nhau quyết định: lời lãi chia ra sao, quyết định được đưa ra thế nào, và tất cả khác gì một cơ sở làm ăn thông thường. Người ta không chọn nổi một lối mình chưa từng thấy — hãy lấy những hợp tác xã có thật làm ví dụ.",
        "hours": 4,
        "skills": [
          "dạy học",
          "điều phối"
        ]
      },
      {
        "name": "Đỡ một tay khi hợp tác xã hình thành",
        "description": "Khi một nhóm đã sẵn sàng, hãy giúp họ viết kế hoạch làm ăn và chọn hình thức pháp lý. Nối họ với luật sư và kế toán rành hợp tác xã, thay vì tự mò mẫm các bước pháp lý và sổ sách — đăng ký thành lập sai thì gỡ ra rất tốn kém.",
        "hours": 5,
        "skills": [
          "giấy tờ"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Nối với các nguồn giúp lúc khởi đầu",
        "description": "Dựng một danh sách sống về các khoản vay nhỏ, khoản tài trợ, quỹ gây dựng hợp tác xã và vườn ươm, rồi giúp các nhóm nộp hồ sơ thật sự. Phần lớn tiền dành cho hợp tác xã vẫn nằm đó nhưng chẳng có biển chỉ đường — tấm bản đồ của bạn đáng tiền thật.",
        "hours": 3,
        "skills": [
          "tra cứu"
        ]
      },
      {
        "name": "Sắp người dìu dắt",
        "description": "Ghép mỗi nhóm làm ăn mới với một người đã làm hợp tác xã lâu năm hoặc một người dìu dắt về chuyện làm ăn, ghé hỏi han suốt những chặng đầu còn mong manh. Năm đầu tiên là chỗ các hợp tác xã gãy; một người dìu dắt bền bỉ, đã thấy cái nếp ấy trước đây, sẽ đổi hẳn cơ may.",
        "hours": 3
      },
      {
        "name": "Dựng chỗ dựa giữa các nhóm làm ăn",
        "description": "Gom các nhóm làm ăn lại thành một mạng lưới, nơi các hợp tác xã chia nhau bài học, giới thiệu người mua cho nhau, và mua bán qua lại với nhau. Những hợp tác xã có làm ăn với nhau vượt qua được những đợt khó khăn từng giết chết các nhóm đơn độc.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ]
      }
    ]
  },
  {
    "id": "elder-meal-delivery",
    "name": "Đưa cơm và bầu bạn với người cao tuổi",
    "purpose": "Mang bữa ăn đều đặn và những lần ghé thăm ấm áp đến với người cao tuổi không ra khỏi nhà được — bữa ăn là quan trọng, nhưng mười phút trò chuyện ở cửa nhiều khi còn quan trọng hơn.",
    "whoItServes": "Những người cao tuổi sống một mình, không ra khỏi nhà được hoặc đã yếu — và cả gia đình đang lo cho họ từ xa.",
    "whatYoullNeed": "Những người góp một tay đáng tin đã được tìm hiểu kỹ, một nơi lo bữa ăn, các tuyến đi đã lên sẵn, và vài cách xử lý đơn giản cho lúc gõ cửa mà không ai trả lời.",
    "setupHours": 22,
    "defaultCategory": "food",
    "firstSteps": "Hãy bắt đầu từ nơi lo bữa ăn và năm người cao tuổi đầu tiên, đừng bắt đầu bằng một tờ danh sách ghi tên: nói chuyện với nhóm nấu ăn chung của cộng đồng hoặc vài người sẵn lòng nấu xem mỗi tuần họ làm đều được bao nhiêu suất, rồi hỏi những người làm ở các chương trình cho người cao tuổi, y tá của nhà thờ và nhà thuốc trong khu xem ai đang thật sự thiếu bữa. Tìm hiểu kỹ lai lịch những người góp một tay đầu tiên trước chuyến đưa cơm đầu tiên, đừng để sau — lòng tin bạn đang gây dựng sống hay chết là ở chỗ ai bước qua những cánh cửa ấy.",
    "commonPitfalls": "Cái hỏng nguy hiểm nhất là bỏ sót một dấu hiệu — người góp một tay tặc lưỡi bỏ qua cánh cửa không ai mở vì chẳng ai ghi sẵn phải làm gì, hay một thứ dị ứng không bao giờ được ghi lên tờ lộ trình. Cái hỏng chậm rãi là sự thất thường: người cao tuổi sắp xếp cả ngày quanh lần ghé thăm ấy, và một tuyến đi tuần có tuần không dạy họ đừng trông cậy vào bạn nữa. Thà lo trọn cho năm người mỗi tuần đều đặn còn hơn hai mươi người lúc có lúc không.",
    "pairsWith": [
      "community-meal",
      "neighborhood-care-network",
      "rides-transportation"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Tìm ra những người cao tuổi không ra khỏi nhà được",
        "description": "Tìm qua phòng khám, các chương trình cho người cao tuổi, nhóm tôn giáo và lời truyền miệng trong xóm. Giữ sự tôn trọng và hoàn toàn tự nguyện — bạn đang mời một bữa ăn và một người bầu bạn, không phải ghi tên ai vào một danh sách bị dòm ngó.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Mời và tìm hiểu kỹ người góp một tay",
        "description": "Ai bước vào nhà một người cao tuổi cũng phải được tìm hiểu kỹ: hỏi vài người quen biết họ và kiểm tra lý lịch cơ bản, không ngoại lệ cho bạn của bạn. Rồi hãy giữ sự đều đặn — người cao tuổi thấy yên tâm hơn nhiều với cùng một gương mặt quen ở cửa mỗi tuần, thay vì mỗi tuần một người khác.",
        "hours": 4,
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Lo một nơi làm ra bữa ăn",
        "description": "Sắp xếp bữa ăn từ bếp ăn của cộng đồng, những người sẵn lòng nấu tại nhà, hoặc quán ăn chịu tặng vài suất. Để ý chuyện đủ chất và dễ hâm nóng lại, và dán nhãn ghi rõ món trên từng hộp — một hộp cơm không nhãn là một canh bạc với người có cơ địa dị ứng.",
        "hours": 4,
        "skills": [
          "nấu ăn",
          "an toàn thực phẩm"
        ]
      },
      {
        "name": "Lên tuyến đưa cơm và lịch đi",
        "description": "Gom các nhà lại thành những tuyến đi gọn gàng và giữ một nhịp đều đặn — cùng ngày trong tuần, giờ giấc xê xích chút đỉnh thôi. Chừa sẵn vài phút trò chuyện thong thả ở mỗi nhà; với nhiều người cao tuổi, đó mới là thứ thật sự được đưa tới.",
        "hours": 3,
        "skills": [
          "lái xe",
          "tổ chức"
        ],
        "follows": [
          0,
          2
        ]
      },
      {
        "name": "Ghi lại chuyện ăn kiêng, dị ứng và liên lạc khi có chuyện",
        "description": "Với từng người cao tuổi, hãy ghi lại món phải kiêng, thứ bị dị ứng, thuốc nào có liên quan đến chuyện ăn uống, và người cần gọi khi có chuyện. Cất kỹ và chỉ cho ai thật sự cần biết — người lái xe cần biết thứ dị ứng, chứ không cần cả bệnh án.",
        "hours": 3,
        "skills": [
          "nhập liệu"
        ]
      },
      {
        "name": "Định sẵn cách xử lý khi thấy có gì bất thường",
        "description": "Ghi rõ người góp một tay phải làm gì khi gõ cửa không ai trả lời hoặc thấy người cao tuổi có vẻ không khỏe: gọi ai trước, khi nào báo gia đình hoặc gọi cấp cứu, và ghi lại chuyện đã xảy ra thế nào. Bàn trước bao giờ cũng hơn đứng trước cửa mà ứng biến.",
        "hours": 3,
        "skills": [
          "viết lách"
        ],
        "follows": [
          4
        ]
      },
      {
        "name": "Chăm sóc người góp một tay và lắng nghe góp ý",
        "description": "Hỏi thăm những người góp một tay đều đặn, đổi tuyến cho ai cần nghỉ một chặng, và hỏi chính những người cao tuổi xem dự án có thể làm gì tốt hơn cho họ. Họ sẽ kể cho bạn những điều mà người đi giao chẳng bao giờ thấy.",
        "hours": 2
      }
    ]
  },
  {
    "id": "disaster-relief-hub",
    "name": "Điểm tập kết và phân phát hàng cứu trợ",
    "purpose": "Dựng một điểm có thể nhận, phân loại và chuyển hàng cứu trợ thật nhanh khi thiên tai ập tới — vì mấy ngày đầu sau một trận lụt hay một đám cháy được hay thua là ở khâu hậu cần.",
    "whoItServes": "Bà con bị lụt, bão, cháy và các tai họa khác — bắt đầu từ những người khó đi lại nhất và ít chờ được nhất.",
    "whatYoullNeed": "Một mặt bằng đã thỏa thuận sẵn kèm một chỗ dự phòng, các mối lấy hàng, một đội ứng cứu nhanh, và sự phối hợp với mạng lưới sẵn sàng ứng phó — gần như tất cả phải xong trước khi thiên tai xảy ra, vì sau đó thì đã muộn.",
    "setupHours": 24,
    "defaultCategory": "organizing",
    "suggestsWorkDays": true,
    "firstSteps": "Điểm cứu trợ tồn tại trên giấy từ rất lâu trước khi nó tồn tại ngoài bãi xe, nên hãy bắt đầu từ mạng lưới sẵn sàng ứng phó — họ đang giữ cây liên lạc và bức tranh rủi ro — và từ câu hỏi thật lòng: tòa nhà nào sẽ thật sự mở cửa cho bạn vào lúc sáu giờ sáng sau một trận lụt? Hãy chốt thỏa thuận mặt bằng và chỗ dự phòng trước tiên; mọi việc còn lại đều xoay quanh một cái địa chỉ.",
    "commonPitfalls": "Điểm cứu trợ hỏng theo hai hướng: một là cái điểm chỉ tồn tại trên bản kế hoạch chưa ai diễn tập, nên hôm có chuyện thật thì cả ngày đầu tiên cháy sạch vào những câu hỏi mà một buổi tập dượt đã trả lời xong từ lâu — hai là cái điểm mở cửa đón một cơn lũ đồ quyên góp mà mình không phân loại nổi, biến thành nhà kho chứa quần áo không dùng được trong khi bà con đang cần nước uống. Cái hại âm thầm hơn là phát đồ mà dựng rào: giây phút ai đó phải chứng minh mình xứng đáng được giúp, bạn đã dựng lại đúng cái bộ máy mà bạn lập ra chỗ này để đi vòng qua.",
    "pairsWith": [
      "emergency-preparedness",
      "resource-hub-dispatch"
    ],
    "learnMore": [
      "internet-outage"
    ],
    "tasks": [
      {
        "name": "Chọn sẵn mặt bằng và chỗ dự phòng",
        "description": "Tìm một tòa nhà hay khoảnh sân có thể cho xe hàng vào, có chỗ phân loại và có chỗ xếp hàng phát đồ — cộng thêm một chỗ dự phòng phòng khi chỗ đầu bị hư hại hoặc không tới được. Xác nhận chuyện ra vào và chìa khóa với chủ nhà ngay bây giờ, lúc trời còn yên; một mặt bằng mà bạn không vào được thì coi như không có.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Dựng sẵn các mối lấy hàng",
        "description": "Thỏa thuận trước xem nước uống, thức ăn, đồ vệ sinh và đồ dọn dẹp sẽ lấy từ đâu — nhà cung cấp, tổ chức bạn, hay các đợt quyên góp. Quan trọng ngang vậy: một cách để biết bà con thật sự cần gì sau khi có chuyện, để bạn không bị chôn vùi dưới đống đồ sai.",
        "hours": 4,
        "skills": [
          "kết nối",
          "tổ chức"
        ]
      },
      {
        "name": "Sắp đặt khâu nhận, phân loại và theo dõi hàng",
        "description": "Thiết kế cách nhận, phân loại và theo dõi đồ quyên góp ngay từ lúc chiếc xe tải đầu tiên tới. Điểm cứu trợ nào chết ngộp trong đống đồ chưa phân loại cũng đều đã bỏ qua bước này — hãy chốt sẵn nhóm hàng, nhãn dán và cách đếm đơn giản trước khi cần đến.",
        "hours": 4,
        "skills": [
          "tổ chức",
          "nhập liệu"
        ]
      },
      {
        "name": "Dựng cách phân phát hàng",
        "description": "Lên kế hoạch cho đường ra của hàng: công bằng và ít rào cản — không xét giấy tờ tùy thân, không bắt chứng minh mình khó khăn — kèm theo việc chở tận nơi cho người không đến được. Ưu tiên những người ngặt nghèo nhất trước, và ghi thứ tự ưu tiên ấy ra giấy để nó sống sót qua cơn hỗn loạn.",
        "hours": 3,
        "skills": [
          "lái xe",
          "tổ chức"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Lập và huấn luyện đội ứng cứu nhanh",
        "description": "Lập danh sách những người có thể lên đường khi báo gấp, và tập trước cho họ về vai trò, luật an toàn cùng cách nhận và phát hàng của bạn. Một đội mười hai người đã tập làm được nhiều việc hơn một đám năm chục người tốt bụng mà lớ ngớ.",
        "hours": 4,
        "skills": [
          "dạy học"
        ]
      },
      {
        "name": "Bắt nhịp với các lực lượng ứng cứu khác",
        "description": "Giới thiệu điểm cứu trợ với các cơ quan phòng chống thiên tai và các nhóm cứu trợ khác từ trước khi có chuyện. Thống nhất ai lo phần nào, để bạn lấp chỗ trống chứ không làm trùng — sự giúp đỡ lẫn nhau đi nhanh nhất đúng ở chỗ bộ máy chính thức đi chậm nhất.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Tính trước chuyện liên lạc và an toàn",
        "description": "Hãy tính sẵn cho lúc mạng sập: cách liên lạc không cần internet, danh sách in ra giấy, và một đầu nối vào cây liên lạc của mạng lưới sẵn sàng ứng phó. Đặt ra những luật an toàn cứng rắn cho người góp sức — không ai được bước vào công trình đã yếu, không bao giờ — và ghi hết ra giấy.",
        "hours": 3,
        "skills": [
          "viết lách"
        ]
      }
    ]
  },
  {
    "id": "recovery-peer-support",
    "name": "Mạng lưới người cùng cảnh nâng đỡ nhau trên đường cai nghiện",
    "purpose": "Duy trì sự nâng đỡ do chính những người cùng cảnh dẫn dắt, dành cho bà con đang cai nghiện chất hoặc đang muốn bắt đầu — đi kèm với điều trị chuyên môn, không bao giờ thay thế được điều trị.",
    "whoItServes": "Người đang trên đường cai nghiện, người đang cân nhắc bắt đầu, và gia đình cùng bạn bè đang đi bên cạnh họ.",
    "whatYoullNeed": "Những người dẫn nhóm cùng cảnh đã từng trải qua và đã được tập huấn tử tế, một chỗ riêng tư an toàn, các đường chuyển tiếp rõ ràng, và ranh giới nói thẳng ra: sự nâng đỡ giữa những người cùng cảnh đi kèm với điều trị chuyên môn chứ không thay thế được; người dẫn nhóm không phải nhân viên y tế và tuyệt đối không được khuyên gì về cắt cơn hay thuốc men; và luôn có một kế hoạch rõ ràng để đưa người đang khủng hoảng đến với người có chuyên môn hoặc đến chỗ cấp cứu.",
    "setupHours": 22,
    "defaultCategory": "emotional_support",
    "firstSteps": "Hãy bắt đầu từ những người sẽ giữ căn phòng: tìm một hai người trong xóm đã thật sự đi qua chặng đường cai nghiện và giữ vững được, đưa họ đi học một khóa tập huấn dẫn nhóm cùng cảnh đàng hoàng, rồi cùng nhau viết ra phạm vi — mạng lưới này là gì và không phải là gì — trước khi loan báo bất cứ điều gì. Sau đó hãy gặp trực tiếp các chương trình điều trị và nơi trợ giúp lúc khủng hoảng ở địa phương, để đường chuyển tiếp của bạn là một mối quan hệ chứ không phải một số điện thoại trên tờ rơi.",
    "commonPitfalls": "Chuyện hóa nguy hiểm khi lằn ranh nhòe đi — một người dẫn nhóm tốt bụng đi khuyên ai đó chuyện cắt cơn hay thuốc men, điều có thể lấy mạng người, hoặc cả nhóm trôi dần sang chữa trị nghiệp dư vì đường chuyển tiếp chưa bao giờ có thật. Nó hỏng một cách lặng lẽ khi chuyện riêng bị lộ ra ngoài — một câu chuyện lọt ra là căn phòng trống hẳn — và khi chính người dẫn nhóm kiệt sức, lúc người đang giữ sự hồi phục cho mọi người lại chẳng có ai nâng đỡ mình.",
    "pairsWith": [
      "mental-health-peer-support",
      "harm-reduction-supplies"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Mời và tập huấn người dẫn nhóm cùng cảnh",
        "description": "Hãy tìm những người đã thật sự đi qua chặng đường hồi phục và đưa họ qua một khóa tập huấn dẫn nhóm cùng cảnh được công nhận. Nói rõ ngay từ câu chuyện đầu tiên: người dẫn nhóm là bạn đồng cảnh, không phải bác sĩ hay nhân viên y tế, và chính khóa tập huấn là thứ giữ cho lằn ranh ấy an toàn.",
        "hours": 5,
        "skills": [
          "điều phối",
          "dạy học"
        ]
      },
      {
        "name": "Vạch rõ phạm vi và ranh giới",
        "description": "Ghi ra mạng lưới này làm gì — nâng đỡ giữa những người cùng cảnh, kết nối, động viên — và không làm gì: chữa trị, cắt cơn, chăm sóc y tế, khuyên về thuốc men. Một phạm vi viết ra giấy giữ cho thành viên khỏi những lời khuyên tai hại và giữ cho người dẫn nhóm khỏi phải gánh thứ không phải của mình.",
        "hours": 3,
        "skills": [
          "viết lách"
        ]
      },
      {
        "name": "Dựng đường chuyển tiếp và đường xử lý khủng hoảng",
        "description": "Gây dựng quan hệ làm việc với các chương trình điều trị chuyên môn, cơ sở y tế và nơi trợ giúp lúc khủng hoảng, rồi viết ra kế hoạch xử lý khi có người quá liều. Khi ai đó trong phòng cần nhiều hơn những gì bạn đồng cảnh cho được, cú chuyển tiếp phải là một cuộc gọi ấm áp, không phải một tờ giấy gấp.",
        "hours": 4,
        "skills": [
          "kết nối",
          "tra cứu"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tìm một chỗ an toàn, kín đáo, không có chất gây nghiện",
        "description": "Tìm một căn phòng kín đáo, dễ chịu, không phán xét và không có chất gây nghiện — nơi người ta bước vào mà không bị lộ ra điều gì. Thư viện, phòng sinh hoạt cộng đồng và các nơi thờ tự có lối vào riêng đều hợp.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Đặt lệ giữ kín và nếp sinh hoạt của nhóm",
        "description": "Thống nhất mấy lệ nền: chuyện nói ở đây ở lại đây, tôn trọng nhau và không nhét lời khuyên cho ai, ai cũng có quyền kể hoặc quyền im. Nhắc to lại mấy lệ ấy vào đầu mỗi buổi gặp, không sót buổi nào — nếp chỉ che chở được người ta khi nó còn mới trong tai.",
        "hours": 3,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Xếp lịch và loan tin về các buổi gặp",
        "description": "Hãy mở hơn một khung giờ để người làm ca và người đang nuôi con nhỏ cũng tới được, và loan tin bằng lời lẽ mộc mạc, không gán tiếng xấu cho ai — miễn phí, mở cho mọi người, không đòi hỏi gì. Cách bạn viết tờ rơi quyết định ai thấy đủ an toàn để bước tới.",
        "hours": 3,
        "skills": [
          "kết nối"
        ],
        "follows": [
          3
        ]
      },
      {
        "name": "Nâng đỡ người dẫn nhóm và giữ họ khỏi kiệt sức",
        "description": "Hỏi thăm người dẫn nhóm đều đặn, thay phiên nhau đứng lớp, và lo cho họ cũng có chỗ dựa của riêng mình — giữ một căn phòng cho sự hồi phục của người khác là việc nặng, và sự hồi phục của chính người dẫn nhóm bao giờ cũng phải đứng trước.",
        "hours": 2,
        "skills": [
          "lắng nghe"
        ]
      }
    ]
  },
  {
    "id": "community-fitness",
    "name": "Nhóm cùng nhau vận động và giữ sức khỏe",
    "purpose": "Rủ bà con cùng vận động miễn phí — nhóm đi bộ, giãn cơ, chơi thể thao ngẫu hứng, nhảy dân vũ — vì thấy khỏe trong người thì không nên phải tốn một tấm thẻ phòng tập.",
    "whoItServes": "Ai muốn vận động cũng được, nhất là bà con không kham nổi tiền phòng tập, người cao tuổi và những người sống lủi thủi mà với họ, có bạn cũng quý ngang buổi tập.",
    "whatYoullNeed": "Những người góp một tay đứng ra dẫn buổi tập, chỗ tập an toàn và dễ tới, và rất ít dụng cụ. Một lối dẫn dắt niềm nở, không thúc ép còn quan trọng hơn bằng cấp — dù ai dẫn một môn nặng sức thì phải có chuyên môn cho môn đó, và buổi nào cũng cần nước uống, phần khởi động và một túi sơ cứu trong tầm tay.",
    "setupHours": 19,
    "defaultCategory": "other",
    "firstSteps": "Trước khi xếp lịch bất cứ thứ gì, hãy hỏi chính những người bạn mong sẽ tới xem họ thật sự thích gì — nhóm đi bộ, giãn cơ trên ghế, một buổi tối nhảy dân vũ — và cơ thể họ kham được tới đâu; câu trả lời mới là thứ chọn ra môn tập, chứ không phải ngược lại. Rồi tìm một hai người dẫn mà sự niềm nở nặng hơn tay nghề, cùng nhau đi xem mấy chỗ tập, và mở đúng một buổi mỗi tuần thật đều trước khi thêm gì nữa.",
    "commonPitfalls": "Chuyện này chết theo hai đường: nó biến thành cuộc đua — người khỏe nhất dẫn nhịp, câu chuyện trôi sang cân nặng và hình thức, rồi đúng những người mà nó sinh ra để phục vụ lặng lẽ thôi tới — hoặc nó trở nên thất thường, vì không gì giết một nhóm đi bộ nhanh bằng hai lần tới nơi mới hay buổi tập đã hủy. Đường thứ ba là bỏ qua mấy thứ an toàn nhàm chán: không khởi động, không nước uống, không túi sơ cứu, và chỉ một cú ngã là xong hết.",
    "pairsWith": [
      "disability-support-network",
      "neighborhood-care-network"
    ],
    "learnMore": [
      "community-events"
    ],
    "tasks": [
      {
        "name": "Hỏi xem mọi người thích gì và vận động được tới đâu",
        "description": "Hỏi quanh xóm — ở tiệm giặt, khu nhà người cao tuổi, cổng trường — xem mọi người thích kiểu vận động nào và thấy kiểu nào là vừa sức. Hãy để câu trả lời dẫn đường: một cái mẫu đầy môn thể thao chẳng ai xin thì chẳng giúp được ai.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Mời người đứng ra dẫn buổi tập",
        "description": "Tìm những người góp một tay để dẫn buổi đi bộ, giãn cơ, nhảy dân vũ hay đá bóng ngẫu hứng. Với phần lớn các môn, một lối dẫn niềm nở, không thúc ép ăn đứt tay nghề — nhưng ai dẫn môn nặng sức thì phải có chứng chỉ đúng cho môn đó.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Tìm chỗ tập an toàn",
        "description": "Hỏi thăm về công viên, nhà văn hóa và nhà tập của trường học — miễn phí hoặc rẻ, và tới được mà không cần ô tô. Xem mỗi chỗ có hợp với nhiều dạng cơ thể và sức khỏe khác nhau không: nền bằng phẳng, chỗ ngồi, bóng mát, nhà vệ sinh, và một chỗ trú nếu trời trở.",
        "hours": 3
      },
      {
        "name": "Soạn buổi tập hợp với mọi người, mọi mức sức",
        "description": "Thiết kế mỗi buổi sao cho ai cũng theo được nhịp của mình và tự chỉnh thoải mái — một cách tập ngồi ghế cho phần giãn cơ, một vòng ngắn nằm trong vòng đi bộ dài. Giữ câu chuyện ở chỗ thấy khỏe, được vận động và được gần nhau, đừng bao giờ ở chỗ hình thức hay thành tích.",
        "hours": 3
      },
      {
        "name": "Lo chuyện an toàn và sức khỏe",
        "description": "Đưa phần khởi động và uống nước vào mọi buổi tập, luôn có sẵn một túi sơ cứu đầy đủ, và khuyên người mới bắt đầu tập nên hỏi bác sĩ trước. Chỉ cho người dẫn cách nhận ra dấu hiệu quá sức và cách làm cho việc chậm lại thành chuyện bình thường, không có gì ngượng.",
        "hours": 3,
        "skills": [
          "sơ cứu"
        ]
      },
      {
        "name": "Chốt lịch và loan tin",
        "description": "Chọn những khung giờ đều đặn để mọi người tạo được thói quen, rồi giữ đúng lịch. Loan tin rộng — tờ rơi, nhóm chat, truyền miệng — và nói thẳng rằng mọi lứa tuổi, mọi vóc dáng, mọi mức sức khỏe đều được chào đón, vì rất nhiều người mặc định là mình không được.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Gây dựng tình thân và sự đều đặn",
        "description": "Hãy làm cho mỗi buổi tập có hơi người: nhớ tên nhau, chào người mới, chừa vài phút chuyện trò. Mừng vì người ta có mặt, đừng mừng theo con số nào cả — chính sự gắn bó mới giữ người ta quay lại rất lâu sau khi cái mới đã hết mới.",
        "hours": 2,
        "skills": [
          "điều phối"
        ]
      }
    ]
  },
  {
    "id": "urban-orchard",
    "name": "Vườn cây ăn trái trong phố và rừng thức ăn",
    "purpose": "Trồng cây ăn trái, cây lấy hạt và các loại cây lương thực lâu năm trên đất chung — một khu rừng thức ăn mà một khi đã bén rễ sẽ nuôi cả khu phố miễn phí suốt nhiều chục năm.",
    "whoItServes": "Cả cộng đồng, kể cả những người hàng xóm chưa dọn tới — cây trồng năm nay sẽ thành nguồn thức ăn tươi, miễn phí và lâu dài cho tất cả mọi người.",
    "whatYoullNeed": "Quyền dùng đất lâu dài (một cái bắt tay theo từng mùa là không đủ cho cây lâu năm), cây và giống hợp khí hậu, người góp một tay cho những ngày chung tay trồng cây, và một nhóm nhỏ chăm nom cam kết theo năm chứ không theo tháng. Hãy xác nhận có nước tưới trước khi bất cứ thứ gì xuống đất.",
    "setupHours": 21,
    "defaultCategory": "food",
    "suggestsWorkDays": true,
    "firstSteps": "Chuyện đất đai phải đi trước mọi thứ: nói chuyện với các quỹ tín thác đất, cơ quan quản lý công viên, các chùa và nhà thờ còn khoảnh đất bỏ không — bất cứ ai có thể cam kết một mảnh đất trong mười năm chứ không phải một mùa — và tiện thể xác nhận luôn chuyện nước tưới. Song song đó, hãy tìm một người thật sự có kinh nghiệm với cây ăn trái để làm trụ cho bản thiết kế, và hỏi bà con xem họ thật sự sẽ hái và ăn trái gì, vì một vườn toàn thứ chẳng ai thích thì chỉ nuôi ong vò vẽ.",
    "commonPitfalls": "Vườn cây hiếm khi hỏng vào ngày trồng — nó hỏng ở năm thứ hai, thứ ba, khi đám đông đã tan và chẳng ai lo chuyện tưới, thế là mấy cây non lặng lẽ chết trong mùa khô đầu tiên. Hai thứ chết người khác là thỏa thuận đất lỏng lẻo bị rút lại đúng lúc cây bắt đầu cho trái, và những trận cãi vã mùa thu hoạch vì chẳng ai thống nhất lệ chia trước vụ lớn đầu tiên. Hãy chốt lịch thay phiên chăm nom và lệ chia trái từ sớm, lúc còn dễ.",
    "pairsWith": [
      "community-garden",
      "gleaning-network",
      "seed-library"
    ],
    "tasks": [
      {
        "name": "Chốt quyền dùng đất lâu dài",
        "description": "Xin một thỏa thuận bằng giấy tờ có sức bền — một hợp đồng thuê dài hạn, một sắp xếp với quỹ tín thác đất, một cam kết chính thức của chính quyền — vì cây cần nhiều chục năm chứ không phải một cái bắt tay theo từng mùa. Xác nhận nguồn nước tưới ổn định ngay trên mảnh đất đó trước khi ký bất cứ thứ gì.",
        "hours": 5,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Vẽ bản thiết kế vườn",
        "description": "Chọn giống hợp khí hậu nơi bạn ở và thiết kế theo tầng của rừng thức ăn: tầng cây cao, tầng bụi và thảm phủ đất cùng nương nhau. Tính sẵn cây thụ phấn cho nhau và khoảng cách mà cây lớn sẽ cần, chứ không phải khoảng cách vừa cho cây con bạn đang trồng.",
        "hours": 4,
        "skills": [
          "làm vườn"
        ]
      },
      {
        "name": "Tìm nguồn cây giống",
        "description": "Gom cây và giống từ vườn ươm, các khoản tài trợ, đồ tặng và những đợt bán cây rễ trần theo mùa — cây rễ trần và cây còn nhỏ rẻ hơn nhiều so với cây lớn trồng chậu, mà thường lại bén rễ tốt hơn. Đặt sớm; giống ngon hết hàng nhanh.",
        "hours": 3
      },
      {
        "name": "Dọn đất cho sẵn sàng",
        "description": "Làm đất xong trước khi cây về: cải tạo đất, phủ gốc, lắp đường nước, rồi đánh dấu và dọn sạch từng hố trồng theo bản thiết kế. Một mảnh đất đã chuẩn bị biến ngày trồng cây từ mớ hỗn loạn thành một dây chuyền chạy êm.",
        "hours": 4,
        "skills": [
          "làm vườn"
        ],
        "follows": [
          1
        ]
      },
      {
        "name": "Tổ chức những ngày chung tay trồng cây",
        "description": "Tổ chức những ngày chung tay trồng cây với hướng dẫn rõ ràng, để cây nào cũng xuống đúng độ sâu, có bồn tưới quanh gốc và có lớp phủ — trồng sai thì cây chết từ từ và chẳng ai thấy. Hãy làm cho vui như hội; ngày trồng cây chính là lúc cả khu phố bắt đầu thấy vườn này là của mình.",
        "hours": 5,
        "skills": [
          "làm vườn"
        ],
        "follows": [
          3
        ],
        "recurringCadence": "cycle"
      },
      {
        "name": "Sắp xếp việc chăm nom lâu dài",
        "description": "Tổ chức phần việc không hào nhoáng nhưng quyết định vườn sống hay chết: tưới cây non qua mấy mùa nắng đầu, tỉa cành, phủ gốc và trị sâu bệnh, năm này qua năm khác. Một lịch thay phiên chăm nom có tên người hẳn hoi hơn hẳn một danh sách dài toàn người hứa mơ hồ.",
        "hours": 3,
        "skills": [
          "làm vườn"
        ]
      },
      {
        "name": "Bàn trước chuyện chia trái",
        "description": "Hãy thống nhất lệ hái và lệ chia trước vụ lớn đầu tiên, chứ đừng đợi sau trận cãi vã đầu tiên — ai hái, hái khi nào, hái bao nhiêu. Chuyển phần dư sang tủ lạnh chung, kho thực phẩm và những bữa ăn chung để không trái nào thối trên cành.",
        "hours": 2
      }
    ]
  },
  {
    "id": "new-parent-support",
    "name": "Mạng lưới nâng đỡ sau sinh và gia đình mới có con",
    "purpose": "Quây lấy những người sắp làm và mới làm cha mẹ bằng sự giúp đỡ rất thực — bữa ăn để trước cửa, việc vặt chạy giùm, chồng chén rửa xong, và những người cùng cảnh đã đi qua chặng đó — suốt thai kỳ và những tuần đầu rã rời sau sinh.",
    "whoItServes": "Những người sắp sinh và mới sinh con, nhất là những gia đình không có người thân ở gần — mấy tuần sau khi em bé ra đời là lúc cần chỗ dựa nhất mà thường lại được ít nhất.",
    "whatYoullNeed": "Những người góp một tay biết nấu ăn, chạy việc vặt và biết lắng nghe; một cách sắp lịch góp bữa ăn; một cuốn danh bạ chỗ cần tìm; và những người đã làm cha mẹ đứng ra làm bạn đồng cảnh. Sự nâng đỡ giữa những người cùng cảnh không phải là chăm sóc y tế hay tâm lý — rối loạn tâm trạng sau sinh vừa phổ biến vừa nghiêm trọng, nên mỗi người đồng cảnh phải biết các dấu hiệu và biết cách nhẹ nhàng đưa cha mẹ đến với người có chuyên môn. Và hãy tìm hiểu kỹ lai lịch bất cứ ai sẽ vào nhà hay phụ bế em bé, trước khi họ làm một trong hai việc đó.",
    "setupHours": 21,
    "defaultCategory": "childcare",
    "firstSteps": "Hãy bắt đầu bằng việc hỏi những người đã sinh con trong năm qua xem điều gì thật sự đã giúp được họ — câu trả lời (một bữa ăn không kèm theo phải tiếp khách, một người bế bé để họ đi tắm) cụ thể hơn bạn tưởng nhiều. Giới thiệu mạng lưới với các nữ hộ sinh, doula và phòng khám nhi để họ ngỏ lời giúp các gia đình, mời hai ba người đã làm cha mẹ làm những người đồng cảnh đầu tiên, và chốt cách tìm hiểu lai lịch trước khi có ai bước qua cửa nhà người khác.",
    "commonPitfalls": "Cái hỏng kinh điển là sự giúp đỡ phục vụ chính người đi giúp: người tới theo giờ của mình, ngồi quá lâu, và bàn chuyện nuôi con thay vì rửa giùm chồng chén — cha mẹ đã kiệt sức sẽ lặng lẽ thôi ra mở cửa chứ không nói thẳng. Cái nặng hơn là một người đồng cảnh bỏ lỡ dấu hiệu trầm cảm sau sinh vì chẳng ai chỉ cho họ cách nhận ra hay cho họ lời để gọi tên nó. Và một sự nâng đỡ tan biến sau hai tuần, đúng lúc mấy nồi thức ăn hết và phần khó mới bắt đầu, thì chẳng phải nâng đỡ gì cả.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "childcare-collective",
      "welcome-wagon"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Mời người góp một tay và người đồng cảnh",
        "description": "Gom những người biết nấu, người chạy việc vặt và — quan trọng nhất — những người đã làm cha mẹ sẵn lòng làm bạn đồng cảnh. Người còn nhớ tuần thứ ba mất ngủ của chính mình cho được thứ mà không tờ rơi nào cho nổi.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Dựng cách sắp lịch góp bữa ăn",
        "description": "Làm một cách đơn giản để sắp xếp những bữa ăn đưa tới nhà trong mấy tuần sau khi sinh: một cuốn lịch chung, chuyện kiêng khem và dị ứng hỏi đúng một lần, thức ăn có dán nhãn và dễ hâm nóng lại. Để trước cửa nên là cách mặc định — một bữa ăn không bao giờ được buộc người ta phải tiếp khách.",
        "hours": 3,
        "skills": [
          "nấu ăn",
          "tổ chức"
        ]
      },
      {
        "name": "Ngỏ lời giúp những việc rất thực",
        "description": "Sắp người góp một tay cho phần việc không hào nhoáng: chạy việc vặt, giặt giũ, rửa chén, và trông anh chị lớn để cha mẹ được nghỉ hoặc đi khám. Mỗi lần đều hỏi xem nhà cần gì thay vì tự đoán — sự giúp đỡ có ích đi theo danh sách của cha mẹ, không phải danh sách của người đến giúp.",
        "hours": 3,
        "skills": [
          "trông trẻ"
        ]
      },
      {
        "name": "Lập cuốn danh bạ chỗ cần tìm",
        "description": "Gom lại những nơi giúp chuyện cho con bú, nơi chăm sóc sức khỏe tinh thần sau sinh, phòng khám nhi và chỗ xin đồ cho em bé — kể cả ngân hàng tã và nhóm trông trẻ chung nếu cộng đồng bạn có. Giữ cho nó luôn mới; một cuốn danh bạ toàn số chết còn tệ hơn không có.",
        "hours": 4,
        "skills": [
          "nhập liệu"
        ]
      },
      {
        "name": "Mở những vòng tròn cùng cảnh",
        "description": "Bắt đầu những nhóm nhỏ nơi cha mẹ mới sinh con có thể nói thật rằng chuyện này khó tới đâu, với một người đã đi qua giữ lấy không khí của buổi gặp. Hãy tập cho những người đồng cảnh biết dấu hiệu trầm cảm và lo âu sau sinh, và biết cách nhẹ nhàng mà bền bỉ khuyên tìm đến người có chuyên môn — không bao giờ tự chẩn bệnh, không bao giờ chờ xem sao.",
        "hours": 3,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Đặt nếp an toàn và ranh giới",
        "description": "Hãy tìm hiểu kỹ lai lịch mọi người sẽ vào nhà hay phụ bế em bé — ít nhất là hỏi vài người quen biết họ — và ghi ra ranh giới: cha mẹ là người đặt điều kiện, ghé thăm thì ngắn thôi trừ khi được mời ở lâu hơn, và không ai tới mà không báo trước. Sự giúp đỡ không bao giờ được có mùi dòm ngó.",
        "hours": 3
      },
      {
        "name": "Nối với các dự án khác",
        "description": "Nối các gia đình với ngân hàng tã, nhóm trông trẻ chung và nhóm đón người mới, để một đầu mối mở ra được tất cả. Người mới làm cha mẹ lẽ ra không phải tự đi tìm từng chương trình một vào đúng lúc mệt nhất đời mình.",
        "hours": 2,
        "skills": [
          "kết nối"
        ]
      }
    ]
  },
  {
    "id": "foster-kinship-support",
    "name": "Mạng lưới nâng đỡ gia đình nhận nuôi tạm và họ hàng đang nuôi trẻ",
    "purpose": "Đứng sau lưng những gia đình nhận nuôi tạm, những người họ hàng và các gia đình đang nuôi trẻ giùm — quần áo và một chiếc giường khi có đứa trẻ tới ngay trong đêm, những khoảng nghỉ khi người nuôi đã cạn sức, và những người cùng cảnh hiểu công việc này.",
    "whoItServes": "Cha mẹ nhận nuôi tạm, ông bà và họ hàng đang nuôi trẻ — người họ hàng thường bắt đầu bằng một cuộc gọi và vài tiếng báo trước — cùng những đứa trẻ trong vòng tay họ.",
    "whatYoullNeed": "Người góp một tay, đồ quyên góp đủ mọi lứa tuổi và cỡ, người trông trẻ để người nuôi được nghỉ, và mối liên kết với các cơ quan bảo trợ trẻ em và nhà trường. Việc dính tới trẻ đang được chăm sóc thay thế vừa nhạy cảm vừa có luật điều chỉnh: hãy tìm hiểu kỹ lai lịch mọi người làm việc với trẻ, làm đúng từng chữ các quy định về trình báo bắt buộc và giữ kín thông tin, và phối hợp với các cơ quan liên quan chứ đừng đi vòng qua họ.",
    "setupHours": 24,
    "defaultCategory": "childcare",
    "firstSteps": "Hãy bắt đầu bằng một buổi ngồi lại với cơ quan bảo trợ trẻ em ở địa phương hoặc chương trình hướng dẫn dành cho họ hàng nuôi trẻ: học cho rõ các luật chi phối công việc này — tìm hiểu lai lịch, trình báo bắt buộc, giữ kín thông tin — trước khi mời một người góp một tay nào, và để chính họ chỉ cho bạn chỗ nào đang thật sự trống. Rồi hỏi vài gia đình đang nuôi trẻ xem tuần đầu tiên và năm đầu tiên họ cần gì; hãy xây về phía những câu trả lời đó, đừng xây về phía một nhà kho đầy đồ chẳng ai xin.",
    "commonPitfalls": "Dự án này có thể hỏng ầm ĩ hoặc hỏng lặng lẽ. Ầm ĩ: một người chưa được tìm hiểu lai lịch ở gần bọn trẻ, hay chuyện riêng của một gia đình bị kể ra khi chưa được phép — cả hai đều có thể làm hại một đứa trẻ, khiến trẻ phải chuyển đi, và kết liễu dự án trong một ngày. Lặng lẽ: một núi đồ quyên góp chưa phân loại trong khi một người nuôi phải chờ ba tuần mới có chiếc giường cho đứa nhỏ, hoặc coi các cơ quan như đối thủ cho tới khi họ thôi giới thiệu gia đình nào nữa. Ở đây, nhỏ mà kỹ và ăn ý bao giờ cũng thắng lớn mà tùy hứng.",
    "pairsWith": [
      "diaper-hygiene-bank",
      "free-store",
      "childcare-collective"
    ],
    "learnMore": [
      "who-sees-what"
    ],
    "tasks": [
      {
        "name": "Kết nối với các gia đình đang nuôi trẻ",
        "description": "Tìm tới các gia đình đang nuôi trẻ qua các cơ quan bảo trợ, nhà trường và nhóm tôn giáo — nhất là những người họ hàng, vốn hay nhận cháu về nuôi ngay trong đêm, không kịp chuẩn bị gì và gần như không có chỗ dựa chính thức nào. Hãy để lần liên lạc đầu tiên là một lời ngỏ giúp đỡ, đừng bao giờ là một cuộc xét duyệt.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Gây dựng kho quần áo và đồ dùng",
        "description": "Gom quần áo, giường, ghế ô tô cho trẻ và đồ dùng hằng ngày cho đủ mọi lứa tuổi và cỡ, vì người nuôi hiếm khi biết đứa trẻ nào sẽ tới cho đến lúc trẻ tới thật. Hãy soi kỹ những món liên quan đến an toàn — ghế ô tô và cũi đều có hạn sử dụng và có danh sách thu hồi.",
        "hours": 4,
        "skills": [
          "tổ chức"
        ]
      },
      {
        "name": "Dựng cách đưa đồ tới thật nhanh",
        "description": "Chuẩn bị sẵn những túi đồ có thể xách đi ngay — quần áo vài ngày, đồ vệ sinh cá nhân, và một món để ôm cho đỡ sợ như con gấu bông — xếp theo tuổi và cỡ, đưa tới được trong vài tiếng sau khi có trẻ mới về. Một đứa trẻ tới tay không thì không nên phải chờ cả tuần mới có thứ gì là của riêng mình.",
        "hours": 3,
        "follows": [
          1
        ]
      },
      {
        "name": "Tổ chức việc trông trẻ để người nuôi được nghỉ",
        "description": "Lo cho có người trông trẻ an toàn và đã được kiểm tra đàng hoàng, để người nuôi được nghỉ, đi khám đúng hẹn, hay đơn giản là thở một hơi — kiệt sức của người nuôi là một trong những lý do chính khiến trẻ lại phải chuyển đi. Hãy hỏi các cơ quan xem ai được phép trông thay và theo luật nào.",
        "hours": 4,
        "skills": [
          "trông trẻ"
        ]
      },
      {
        "name": "Mở nhóm cùng cảnh cho người nuôi trẻ",
        "description": "Tổ chức những buổi gặp đều đặn để cha mẹ nhận nuôi tạm và họ hàng đang nuôi trẻ trao đổi kinh nghiệm và những lời khuyên thật lòng với người hiểu chuyện — công việc này khiến người ta lủi thủi, và người nuôi ở cách ba con đường có thể đang gánh đúng thứ ấy một mình.",
        "hours": 3,
        "skills": [
          "điều phối"
        ]
      },
      {
        "name": "Lập cuốn danh bạ chỗ cần tìm",
        "description": "Gom lại các nơi trợ giúp, các khoản trợ cấp và những chỗ nâng đỡ hiểu về sang chấn mà gia đình đang nuôi trẻ có thể nhờ tới, rồi giúp họ đi qua những thủ tục rối rắm đến cả người trong nghề cũng lúng túng. Riêng những người họ hàng nuôi trẻ thường đủ điều kiện nhận nhiều thứ mà chẳng ai từng nói cho họ biết.",
        "hours": 3,
        "skills": [
          "nhập liệu"
        ]
      },
      {
        "name": "Đặt nếp giữ an toàn và giữ kín cho trẻ",
        "description": "Ghi ra và làm đúng những điều không thương lượng: tìm hiểu lai lịch bất cứ ai làm việc với trẻ, luật trình báo bắt buộc đòi hỏi gì ở người góp một tay của bạn, và giữ kín tuyệt đối chuyện của các gia đình và bọn trẻ — không ảnh, không kể chuyện, không chi tiết nào lọt ra khi chưa được phép.",
        "hours": 4,
        "skills": [
          "viết lách"
        ]
      }
    ]
  },
  {
    "id": "weather-survival-outreach",
    "name": "Đi phát đồ chống rét, chống nắng cho bà con ngoài đường",
    "purpose": "Đưa đồ cứu mạng đến tận nơi bà con không có chỗ ở khi thời tiết trở nên chết người — chăn và túi sưởi tay lúc rét đậm, nước và gói bù điện giải lúc nắng nóng — mang tới đúng chỗ người ta đang ở.",
    "whoItServes": "Bà con không có chỗ ở và những người sống ngoài đường phải chịu thời tiết khắc nghiệt — với họ, một đợt nắng nóng hay một đợt rét đậm là chuyện sinh tử, không phải chuyện bất tiện.",
    "whatYoullNeed": "Đồ dùng riêng cho từng mùa, những người góp một tay đi phát, các tuyến đã vạch sẵn, và mối liên hệ còn cập nhật với các nơi trú tạm và chỗ trợ giúp. Nóng và rét cực đoan giết người: mỗi người đi phát phải được tập để nhận ra hạ thân nhiệt và say nắng và để gọi người có chuyên môn ngay lập tức — không bao giờ được chờ xem sao.",
    "setupHours": 24,
    "defaultCategory": "mutual_aid_drive",
    "firstSteps": "Trước khi mua một tấm chăn nào, hãy nói chuyện với những người và những nhóm vẫn đang đi các tuyến này — họ giữ lòng tin và sự hiểu biết về chỗ bà con thật sự đang ở, và họ sẽ nói cho bạn biết chỗ nào đã có người lo, chỗ nào còn trống. Hãy thống nhất với họ xem bạn ghép vào đâu, đặt ra ngưỡng dự báo thời tiết nào thì khởi động một chuyến đi, và gom đủ đồ cho cả mùa từ lúc trời còn dịu.",
    "commonPitfalls": "Cái hỏng đoán trước được là bắt đầu cùng lúc với thời tiết: đồ đi gom giữa đợt nắng nóng thì về tới nơi khi hiểm nguy đã qua, còn những người lạ lần đầu xuất hiện giữa cơn hoạn nạn thì nhận lại một cái lắc đầu dè chừng từ những người đã học được sự cảnh giác bằng cách khó nhọc. Những cái hỏng nguy hiểm là người đi phát tự mình xoay xở một ca cấp cứu thay vì gọi người tới ngay, và ép người ta phải dời đi hay phải nhận chỗ trú — hãy ngỏ lời, nói cho rõ, rồi tôn trọng câu trả lời.",
    "pairsWith": [
      "cooling-warming-center",
      "harm-reduction-supplies",
      "resource-hub-dispatch"
    ],
    "tasks": [
      {
        "name": "Gói sẵn túi đồ theo từng mùa",
        "description": "Gói túi đồ hợp với mùa: chăn, vớ ấm, mũ len, găng tay và túi sưởi tay cho mùa rét; nước, gói bù điện giải, kem chống nắng, mũ rộng vành và khăn làm mát cho mùa nóng. Túi nào cũng kèm một tấm thẻ ghi địa chỉ các nơi trú tạm và số điện thoại lúc nguy cấp.",
        "hours": 4
      },
      {
        "name": "Gom nguồn đồ dùng",
        "description": "Mở các đợt quyên góp, mua sỉ, và ngỏ lời xin các cửa hàng và các nhóm tôn giáo — và làm trước mùa, vì đi tìm chăn giữa đợt rét đầu tiên là đã tới muộn. Hãy trữ đủ để còn tiếp thêm giữa mùa.",
        "hours": 4,
        "skills": [
          "kết nối",
          "lái xe"
        ]
      },
      {
        "name": "Vẽ bản đồ chỗ gặp được bà con",
        "description": "Hãy làm cùng những người vẫn đi thăm bà con ngoài đường để biết bà con không có chỗ ở thật sự hay ở đâu — họ có lòng tin và sự hiểu biết gây dựng qua nhiều năm, và đi cùng họ hơn hẳn tự dưng xuất hiện. Giữ tấm bản đồ mềm dẻo và luôn mới; người ta di chuyển, nhất là khi trời xấu.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Mời và tập huấn người đi phát đồ",
        "description": "Tập cho từng người trước chuyến đầu tiên: cách trò chuyện tôn trọng và chấp nhận lời từ chối, cách giữ an toàn cho bản thân và luôn đi thành cặp, và cách nhận ra những ca cấp cứu do thời tiết. Chưa được tập thì chưa ai được đi phát.",
        "hours": 4,
        "skills": [
          "dạy học"
        ]
      },
      {
        "name": "Lên kế hoạch tuyến đi và cách phát đồ",
        "description": "Vạch tuyến và giờ đi cho những ngày trước và trong lúc thời tiết nguy hiểm, tới trước với những người phơi mình nhiều nhất — những người xa các chỗ trợ giúp nhất, ngủ ngoài trời chứ không phải trong xe hay nơi trú tạm. Hãy quyết trước con số dự báo nào thì khởi động một chuyến đi.",
        "hours": 3,
        "skills": [
          "tổ chức"
        ],
        "follows": [
          2
        ]
      },
      {
        "name": "Nối bà con với nơi trú tạm và chỗ trợ giúp",
        "description": "Hãy mang theo thông tin còn mới và đã kiểm chứng về các điểm sưởi ấm và tránh nóng, giường ở nơi trú tạm, và điểm phát đồ dùng chung — giờ giấc và luật lệ đổi liên tục, mà chỉ tới một cánh cửa đóng là mất lòng tin. Ngỏ lời mà không ép; mối quan hệ còn dài hơn một đêm.",
        "hours": 3,
        "skills": [
          "kết nối"
        ]
      },
      {
        "name": "Chuẩn bị cho tình huống cấp cứu",
        "description": "Tập cho từng người nhận ra hạ thân nhiệt và say nắng — lú lẫn, nói líu lưỡi, da nóng khô hoặc lạnh nhớp — và gọi cấp cứu ngay, đừng chờ xem sao. Diễn tập luôn phần phải làm trong lúc chờ người tới: che mát và cho uống nước, hoặc đắp chăn và che chắn gió.",
        "hours": 3,
        "skills": [
          "sơ cứu"
        ]
      }
    ]
  }
];
