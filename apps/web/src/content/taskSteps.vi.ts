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
// Vietnamese suggested starter steps (i18n Phase 2). Loaded lazily
// via content/bundles/vi.ts — never import this statically from
// app code.
export const TASK_STEPS_VI: Record<string, readonly (readonly string[])[]> = {
  "community-fridge": [
    [
      "Ghi ra ba cửa tiệm, nhà thờ hay phòng khám gần đó có bức tường ngoài được che mưa",
      "Ghé nơi bạn ưng nhất và xin mười phút nói chuyện với chủ hoặc người quản lý",
      "Nói cho hết phần không hào nhoáng: tiền điện, chuyện bày bừa, gọi ai khi tủ hỏng",
      "Kiểm tra ổ cắm là ổ ngoài trời có chống giật và vẫn có điện suốt đêm",
      "Tóm tắt thỏa thuận trong một email ngắn và xin họ đồng ý bằng chữ viết"
    ],
    [
      "Đăng ngay một dòng hỏi xin tủ lạnh còn chạy tốt lên một nhóm ở địa phương",
      "Hẹn trước một người bạn có xe tải nhỏ và xe đẩy cho ngày đi chở tủ",
      "Cắm điện chiếc tủ được tặng, cho chạy trọn một ngày trước khi đóng gì quanh nó",
      "Vẽ phác một mái che đơn giản, chừa sau lưng tủ một khoảng bằng bàn tay cho thoáng",
      "Dựng mái che, neo tủ cho khỏi đổ, rồi cắm điện tại nơi cho đặt nhờ"
    ],
    [
      "Soạn tấm bảng trong ứng dụng ghi chú: lấy thứ mình cần, để lại thứ mình có thể, kèm mục không nhận",
      "Viết lại từng mục không nhận kèm lý do an toàn bên cạnh, để đọc ra sự quan tâm chứ không phải lời mắng",
      "Nhờ hai người hàng xóm dịch tấm bảng sang những thứ tiếng khu mình hay dùng",
      "In ra, ép nhựa và dán ngang tầm mắt",
      "Kẹp sẵn một cây bút và nhãn trắng bên trong để mọi người ghi ngày lên món đồ"
    ],
    [
      "Nhắn cho ba người có thể góp một tay, mỗi người xin một ca 15 phút mỗi tuần",
      "Làm lịch dùng chung với hai tên trong mỗi ca, đừng chỉ một",
      "Để một xô đồ lau dọn ngay cạnh tủ",
      "Dán một cuốn sổ dọn dẹp có ghi ngày ở mặt trong cánh cửa",
      "Lấp nốt những ca còn trống trước ngày mở cửa, dù có phải hỏi tới hai lần"
    ],
    [
      "Liệt kê các tiệm bánh, cửa hàng thực phẩm và quán ăn trong tầm đi bộ",
      "Ghé một nơi vào giờ vắng và hỏi về phần đồ dư cuối ngày",
      "Nếu họ lo phải chịu trách nhiệm, kể về các quy định bảo vệ người tặng thực phẩm",
      "Thống nhất một giờ lấy đồ cố định hằng tuần và ghi vào lịch của bạn",
      "Ghi lại mỗi tuần mối nào thật sự giữ lời"
    ],
    [
      "Gửi một tin nhắn chung hỏi ai sẽ cùng trực đầu mối sự cố",
      "Lập một số chung miễn phí kiểu Google Voice, đừng dùng số riêng của ai",
      "Thống nhất trong bao lâu thì có người trả lời và ai trực thay khi vắng",
      "Viết số lên một nhãn chịu được mưa nắng và dán lên tủ"
    ]
  ],
  "community-garden": [
    [
      "Lần tới đi ngang, chụp một tấm ảnh mảnh đất bạn đang nhắm tới",
      "Tra chủ đất trong hồ sơ đất đai của thành phố, hoặc gõ cửa hỏi thẳng",
      "Xin một giấy cho phép một năm bằng văn bản, dù chỉ là mấy dòng có ký tên",
      "Ghi vào thỏa thuận ai trả tiền nước và phải báo trước bao lâu khi đòi đất",
      "Gõ cửa hai nhà hai bên mảnh đất và hỏi họ nghĩ sao về một khu vườn"
    ],
    [
      "Hỏi trạm khuyến nông gần nhà về gói thử đất và đặt bộ lấy mẫu",
      "Lấy mẫu ở nhiều chỗ, nhất là gần tường cũ có sơn và dọc hàng rào",
      "Gửi bộ mẫu đi trước ngày dựng vườn vài tuần, vì kết quả về chậm",
      "Trong lúc chờ, vẽ ra giấy các luống, lối đi và góc để dụng cụ",
      "Nếu kết quả có chì, hãy tính làm luống nổi với đất sạch mua về"
    ],
    [
      "Đăng lời hỏi xin gỗ chưa xử lý, phân ủ và lớp phủ gốc lên một nhóm địa phương",
      "Từ chối tà vẹt và gỗ tẩm hóa chất cũ; dùng gỗ tuyết tùng, gạch block hay kiện rơm",
      "Chọn ngày chung tay dựng vườn và mời mọi người tới",
      "Tập kết vật liệu và dụng cụ ra vườn từ hôm trước",
      "Cùng cả nhóm lên luống rồi lắp vòi nước hoặc thùng hứng nước mưa"
    ],
    [
      "Nhắn cả nhóm chọn một ngày để ngồi 30 phút bàn cách chia sẻ vườn",
      "Vào buổi họp, đặt ba lựa chọn lên giấy: luống riêng, chung hết, hay pha cả hai",
      "Bàn luôn chuyện một luống sẽ ra sao khi ai đó biến mất giữa mùa",
      "Ghi lại lựa chọn và cách ra quyết định, rồi gửi cho mọi người"
    ],
    [
      "Tra ngay ngày sương giá cuối cùng ở vùng bạn và ghi lại",
      "Chọn năm cây dễ trồng cho vùng mình: rau lá, đậu, bí, cà chua, rau thơm",
      "Vạch thứ tự gieo cách nhau hai tuần để không thu hoạch dồn một lúc",
      "Gieo đợt đầu sau ngày sương giá và cắm nhãn cho từng luống"
    ],
    [
      "Mở một lịch dùng chung và ghi tên mình vào ca đầu tiên",
      "Lấp tháng Bảy và tháng Tám trước, vì đó là lúc lịch thay phiên đổ vỡ",
      "Xin mỗi người đi đều một ca ngắn mỗi tuần, không hơn",
      "Ghi thêm dòng nhắc tưới lúc sáng sớm, đừng tưới giữa trưa",
      "Gắn mỗi ca với một lời nhắc trên điện thoại"
    ],
    [
      "Ghi ngày thu hoạch đầu tiên lên lịch dùng chung",
      "Hỏi tủ lạnh cộng đồng hay một sạp của hàng xóm xem có nhận phần dư trong ngày không",
      "Đặt lời nhắc hai lần mỗi tuần để hái đậu, dưa chuột và bí ngòi",
      "Để riêng một phong bì có ghi nhãn đựng hạt giống cho năm sau"
    ]
  ],
  "tool-lending-library": [
    [
      "Nhắn một người bạn có kho nhỏ hay nhà để xe, hỏi họ có cho đặt một kệ đồ nghề không",
      "Ghé xem chỗ đó, kiểm tra khô ráo, khóa được và không phải leo cầu thang",
      "Hỏi chủ chỗ xem một thùng trả đồ hay một khe bỏ đồ ngoài giờ có ổn không",
      "Thống nhất với chủ chỗ 2–4 giờ mở mỗi tuần và ghi lại"
    ],
    [
      "Đăng một tin trong nhóm chat khu phố, kể ra năm món đồ nghề bạn cần nhất",
      "Chuẩn bị ba thùng dán nhãn giữ lại, đem sửa và bỏ đi trước khi đồ tặng tới",
      "Cắm điện chạy thử từng món chạy điện có tải; món nào đứng máy thì bỏ",
      "Kiểm dây điện sờn và nắp che lưỡi cắt còn ăn khớp trước khi xếp lên kệ"
    ],
    [
      "Mở một bảng tính trống và gõ năm cột: số, món, tình trạng, giá, ảnh",
      "Đánh số mười món bằng băng dính hay bút sơn rồi chụp ảnh từng món cạnh số",
      "Tra giá mua lại của từng món và ghi vào đúng dòng của nó",
      "Đánh dấu tên thư viện lên mọi món để không ai còn phân vân của ai"
    ],
    [
      "Xem trang quy ước của một thư viện đồ nghề khác để lấy chỗ bắt đầu",
      "Viết trong mười dòng: thời hạn mượn, số món tối đa và cách xử lý trễ hẹn nhẹ nhàng",
      "Thêm vào tờ ghi tên một dòng ngắn: người mượn tự chịu rủi ro khi dùng",
      "Liệt kê hai ba món đắt tiền cần đặt cọc hoặc cần dặn dò về an toàn",
      "Nhờ một người sắp mượn đọc bản nháp và chỉ ra chỗ nào khó hiểu"
    ],
    [
      "Lôi ra một cái kẹp giấy và kẹp sẵn một cây bút — đó là bàn cho mượn của bạn",
      "Làm tờ ghi mượn: tên, số điện thoại, số món, ngày mượn, ngày hẹn trả; in mười tờ",
      "Nhắn ngay tại chỗ cho người mượn mới để biết số đó dùng được",
      "Chụp ảnh tình trạng từng món lúc giao, trước khi nó rời khỏi kệ"
    ],
    [
      "Nhắn hai người trực chọn một giờ trong tuần này để đi qua từng bước",
      "Viết một tờ tóm tắt: các bước cho mượn, sổ kê, an toàn cơ bản",
      "Diễn thử cảnh từ chối đồ tặng đã hỏng và ghi hư hỏng mà không đổ lỗi",
      "Chỉ cho họ chỗ để hộp cứu thương và kính bảo hộ",
      "Xem mỗi người làm thử một lượt cho mượn từ đầu tới cuối"
    ],
    [
      "Dán một tờ giấy trắng ở bàn để ghi những món có người hỏi mà chưa có",
      "Ghi ngay lên lịch một ngày mài và tra dầu mỗi tháng",
      "Kiểm đồ nhận về tuần này và nhặt món hư sang thùng chờ sửa",
      "Mỗi tháng xem lại tờ giấy đó và chọn ra món tiếp theo sẽ bổ sung"
    ]
  ],
  "neighborhood-care-network": [
    [
      "Nhắn cho một người quen rộng — cha xứ, bảo vệ hay nhân viên phòng khám — hỏi ai có thể đang lẻ loi",
      "Bắt đầu một danh sách trên giấy ở nhà; đừng để vào tài liệu chung hay nhóm chat",
      "Nhờ hai người hàng xóm được tin cậy giới thiệu, thay vì tự gõ cửa nhà lạ",
      "Tới gặp trực tiếp một ban quản lý tòa nhà hay nhóm tín ngưỡng và để lại số của bạn",
      "Ngỏ lời mời như một lời ngỏ — một cuộc gọi mỗi tuần nhé? — đừng chỉ mặt ai ra"
    ],
    [
      "Nhắn cho ba người bạn đáng tin, hỏi họ có giữ được một lần liên lạc mỗi tuần không",
      "Soạn một tin ngắn tìm người góp tay, nói thẳng ra cần gắn bó tới đâu",
      "Xin hai người quen biết đứng ra nói giúp về bất cứ ai sẽ tới thăm tận nhà",
      "Dành ra một giờ và gọi thật cho từng người ấy — đừng chỉ cất hồ sơ đi",
      "Nói rõ quy ước ngay từ đầu: không ai tự mình cầm tiền hay chìa khóa của hàng xóm"
    ],
    [
      "Mở danh sách và ghi lại tiếng nói, con đường và mức thoải mái của từng người góp tay",
      "Gọi cho từng hàng xóm và hỏi họ thật sự thích gì: gọi điện, chở đi, hay ngồi trò chuyện",
      "Ghép cặp đầu tiên theo khoảng cách gần và tiếng nói chung, rồi ghi lại lý do",
      "Nói với cả hai rằng đây là thử, ai muốn dừng cũng được, không cần giải thích"
    ],
    [
      "Nhắn cho một cặp đã ghép và hỏi ngày nào, giờ nào hợp với cả hai",
      "Cố định mọi buổi hỏi thăm vào cùng một ngày, cùng một giờ để lỡ là thấy ngay",
      "Viết một đoạn lời ba dòng cho lần liên lạc đầu và gửi cho từng người góp tay",
      "Giữ lịch của mọi cặp ở một chỗ mà người điều phối xem được"
    ],
    [
      "Hôm nay hỏi một người hàng xóm: nếu có lúc bạn không bắt máy, nên gọi cho ai?",
      "Ghi lại người cần gọi lúc nguy cấp của từng hàng xóm, và họ có muốn tránh gọi cảnh sát không",
      "Viết một trang: không bắt máy → gọi lại, gọi người thân, rồi khi nào cần báo tiếp",
      "In ra cho từng người góp tay, đừng để bản kế hoạch nằm trong một chiếc điện thoại"
    ],
    [
      "Nhắn cho một người góp tay, hỏi lần ghé vừa rồi có việc gì cứ lặp lại",
      "Mở một danh sách chạy dài những việc lặp lại: chở đi, lấy thuốc, xúc tuyết",
      "Nối từng việc với một người góp tay hay một dự án bạn, rồi xem đã bàn giao xong chưa",
      "Việc thuộc y tế — thuốc men, vết thương, nâng người — hãy nhẹ nhàng chuyển cho người có nghề"
    ],
    [
      "Nhắn cho mọi người góp tay hai ngày để chọn cho buổi ngồi lại",
      "Đặt trước một chỗ ngồi thoải mái và ghi buổi đó vào lịch của mọi người",
      "Nói riêng với từng người góp tay trước khi cả nhóm gặp nhau",
      "Đổi việc ngay cho ai nghe đã căng hết sức, trước khi họ phải bỏ cuộc"
    ]
  ],
  "emergency-preparedness": [
    [
      "Mở bản đồ ngập lụt và cháy rừng chính thức của vùng bạn, chụp lại phần khu mình",
      "Đi dọc con đường nhà bạn, ghi các tòa nhà một lối ra và tầng cao không thang máy",
      "Gõ cửa hỏi ai phải dựa vào điện cho máy thở oxy hay để giữ lạnh thuốc",
      "Đánh dấu tất cả lên một tấm bản đồ giấy: rủi ro một màu, người cần ghé một màu"
    ],
    [
      "Viết dòng của chính nhà bạn trước: tên, số điện thoại, địa chỉ, điều cần lưu ý",
      "Gõ mười cánh cửa với tờ giấy trong tay, xin thông tin liên lạc nếu họ đồng ý",
      "Nhờ mỗi khu phố một người điềm đạm phụ trách chừng mười hộ",
      "In danh sách ra, ghi ai cần gõ cửa thay vì gọi, và cất bản sao ở hai nhà"
    ],
    [
      "Nhắn cho hai người hàng xóm để chọn một điểm hẹn ai cũng đi bộ tới được",
      "Chọn tín hiệu khi mất sóng: gõ cửa, một kênh bộ đàm, một giờ gọi nhau cố định",
      "Mang bộ đàm ra hai đầu xa nhất của khu phố và thử ở đúng khoảng cách thật",
      "In bản kế hoạch một trang và đi phát tận từng nhà"
    ],
    [
      "Bắt đầu ngay: bỏ một cái đèn pin và mấy cục pin dự phòng vào một thùng có dán nhãn",
      "Liệt kê thứ còn thiếu — nước, đồ sơ cứu, đài quay tay, chăn — rồi chia nhau mua",
      "Cất thùng ở chỗ hai ba người lấy được, đừng phụ thuộc vào một người giữ chìa",
      "Dán một ngày thay mới lên nắp thùng và ghi vào lịch chung của nhóm"
    ],
    [
      "Nhớ ra và ghi ba chỗ có thể dùng: một hội trường, một nhà thờ, một công viên có bóng mát",
      "Ghé từng chỗ, hỏi chìa khóa lúc hai giờ sáng, nhiên liệu máy phát và lối cho xe lăn",
      "Xin mỗi cái gật đầu bằng văn bản, kèm tên và số điện thoại của chủ chỗ",
      "Thêm những chỗ đã chắc chắn vào bản kế hoạch in ra"
    ],
    [
      "Nhắn cho chủ chỗ ở điểm an toàn xin một buổi tối trong tháng sau",
      "Chuẩn bị ba góc thực hành: túi đồ đi gấp, tìm van khóa điện nước, và cây liên lạc",
      "Tới tận nơi mời những hàng xóm cần tập nhất",
      "Trong buổi tập, bấm giờ cây liên lạc từ đầu tới cuối và ghi chỗ nào đứt"
    ],
    [
      "Liệt kê các phần việc trên một trang: đi xem người bệnh, mở điểm an toàn, điều phối",
      "Gọi cho từng người và xin một câu đồng ý bằng miệng cho đúng vai của họ",
      "Đặt một người dự bị cho mỗi vai, bắt đầu từ phần đi xem người yếu sức khỏe",
      "Ghi hai ngày xem lại mỗi năm lên lịch và ghim tờ phân vai vào danh sách liên lạc"
    ]
  ],
  "free-store": [
    [
      "Nhắn hai nơi có mặt bằng — hội trường nhà thờ, nhà văn hóa — và hỏi xin một ngày",
      "Ghé xem nơi ưng nhất, kiểm tra lối vào tầng trệt và lề đường tấp xe được",
      "Cùng cả nhóm quyết: đổi đồ một ngày, dựng tạm lặp lại, hay mở thường xuyên",
      "Giữ luôn khung ngày lặp lại đó trước khi rời khỏi tòa nhà"
    ],
    [
      "Chép danh sách nhận / không nhận của một cửa hàng miễn phí hay tiệm đồ cũ làm bản nháp",
      "Thêm vào phía “không nhận”: ghế ô tô cho trẻ đã dùng, mũ bảo hiểm và nệm",
      "Xin cả nhóm gật đầu nhanh cho bản danh sách cuối",
      "In hai bản chữ to: một dán ở cửa nhận đồ, một dán bên trong"
    ],
    [
      "Ghi tên các trạm lên một tờ giấy: nhận đồ, phân loại, bày ra",
      "Hỏi chủ chỗ mượn được bàn và thùng nào, rồi dán nhãn một thùng là “chuyển tiếp”",
      "Vẽ đường đi trong phòng sao cho đồ được xem ngay ở cửa, không phải ở bàn",
      "Rủ hai người phân loại cho giờ đầu tiên, lúc đống đồ cao nhất"
    ],
    [
      "Hỏi nhóm chat xem ai có móc treo và giá treo quần áo dư",
      "Treo quần áo theo cỡ và gắn thẻ ghi cỡ trên từng đoạn giá",
      "Gom đồ dùng trong nhà theo loại, mỗi loại một bàn riêng",
      "Bày ra ít hơn số bạn có và để một thùng bổ sung dưới mỗi bàn"
    ],
    [
      "Nhắn cả danh sách người góp tay ngày mở cửa và ba vai: đón tiếp, phân loại, dọn vòng",
      "Dặn người đón tiếp: đừng bao giờ hỏi vì sao ai đó tới hay họ lấy bao nhiêu",
      "Dán lịch ca để ai cũng biết giờ của mình và đứng ở trạm nào",
      "Đi một vòng giữa buổi và điều người dọn tới chỗ nào trông như vừa bị lục tung"
    ],
    [
      "Gọi cho một tổ chức bạn hoặc nơi tái chế vải và hỏi họ thật sự nhận những gì",
      "Hỏi cho chắc giờ mở cửa của họ vào đúng ngày ngay sau buổi của bạn",
      "Hẹn trước một người lái xe có cốp rộng trước khi mở cửa",
      "Chở hết đi ngay trong ngày để trả lại chỗ trống trơn cho chủ chỗ"
    ]
  ],
  "skill-share": [
    [
      "Ghi hai câu hỏi vào ứng dụng ghi chú: bạn chỉ được gì, bạn muốn học gì",
      "Đổi “bạn giỏi nhất chuyện gì” thành “mọi người hay nhờ bạn giúp chuyện gì”",
      "Hỏi ba người đầu tiên ngay hôm nay — gặp mặt, nhắn tin, cách nào nhanh cũng được",
      "Vừa hỏi vừa đưa từng câu trả lời vào một mẫu hay một bảng đơn giản",
      "Khoanh tròn những chỗ trùng nhau — đó là chương trình học đầu tiên của bạn"
    ],
    [
      "Nhắn cho một người có thể đứng lớp và rủ họ cà phê trong tuần này",
      "Nói với họ một buổi học là cuộc trò chuyện với đôi tay bận, không phải bài giảng",
      "Cùng nhau lên kế hoạch năm phút mở màn, theo từng phút một",
      "Liệt kê vật liệu họ cần và ai sẽ mang thứ nào",
      "Ngỏ ý ghép một người đứng cùng cho ai lần đầu vẫn còn ngại"
    ],
    [
      "Ghi ba chỗ miễn phí để đi hỏi: thư viện, nhà văn hóa, phòng khách nhà ai đó",
      "Nhắn cho từng nơi hỏi về những buổi tối và khung cuối tuần còn trống",
      "Đi xem chỗ và kiểm xem có hợp không — lớp nấu ăn thì cần bồn rửa",
      "Hỏi rõ chính xác ai mở cửa và ai khóa cửa, rồi ghi lại",
      "Giữ luôn khung giờ lặp lại để việc đi học thành nếp"
    ],
    [
      "Mở một bảng trống và ghi từng buổi đã chắc: ngày, chủ đề, người dạy, cần mang gì",
      "Đăng lịch ở nơi mọi người vẫn hay xem, đừng đăng ở một chỗ mới",
      "Giữ việc ghi tên ở mức cứ tới là được hoặc một chạm, đừng nặng hơn",
      "Đặt lời nhắc mỗi tuần để tự mình hỏi lại người dạy của tuần sau"
    ],
    [
      "Ghi ra ba người bạn tưởng sẽ gặp mà họ chưa tới bao giờ",
      "Hỏi thẳng từng người xem cần gì để họ tới được",
      "Gỡ đúng cái rào cản cụ thể bạn nghe nhiều nhất — giờ giấc, con nhỏ, tiếng nói, xe buýt",
      "Thử một buổi vào giờ khác hoặc có người trông trẻ, rồi so xem đông hơn không"
    ]
  ],
  "bulk-buying-coop": [
    [
      "Nhắn ba người hàng xóm: gộp đơn mua chung số lượng lớn cho đỡ tốn chợ nhé?",
      "Ghi lại từng hộ có hứng thú và những món khô họ mua nhiều nhất",
      "Rủ nhiều hơn mức bạn cần chừng một phần năm — sẽ có nhà bỏ lượt mỗi đợt",
      "Chọn một ngày ngồi lại quanh bàn bếp để thống nhất nhịp mua"
    ],
    [
      "Tìm các mối bán sỉ thực phẩm gần bạn và ghi lại ba số điện thoại",
      "Gọi cho nơi đầu tiên, xin bảng hàng và mức đặt tối thiểu",
      "Hỏi từng nơi cách xử lý khi giao thiếu và giá chốt lúc đặt hay lúc giao",
      "Hỏi một nhóm mua chung gần đó xem họ lấy hàng ở đâu và vì sao",
      "So cả ba nơi về mức tối thiểu, cách giao và món khô, trong một bảng nhanh"
    ],
    [
      "Mở một bảng tính trống với các cột: món, đơn giá, hộ, số lượng",
      "Gửi đường dẫn vào nhóm chat, ghi luôn hạn chốt trong tin nhắn",
      "Nhờ đích danh một người điều phối đợt này",
      "Đến hạn chốt, sao bảng ra một bản và khóa sửa trước khi cộng đơn"
    ],
    [
      "Mở một cuốn sổ chung và đặt tên theo các ngày của đợt này",
      "Nhắn cả nhóm: tiền về trước rồi đơn mới đi, không ngoại lệ",
      "Tính giá từng món theo đơn vị đến từng đồng lẻ và làm tròn lên",
      "Ghi từng khoản vào sổ chung ngay lúc nó về tới"
    ],
    [
      "Nhắn một người có nhà để xe hay sân trước để hỏi về ngày giao hàng",
      "Gọi nhà cung cấp hỏi chính xác xe dỡ hàng ra sao — bàn nâng, pa lét, hay thả lề đường",
      "Hẹn ba người tới dỡ hàng, kèm ngày giờ cụ thể",
      "Dọn chỗ từ tối hôm trước: sàn trống, bàn gấp, chừa lối cho xe đẩy"
    ],
    [
      "In danh sách đặt hàng của từng hộ trước khi có ai tới",
      "Dựng mỗi món mua xô một trạm, có cân, có ca múc và túi đựng",
      "Đặt cân về 0 với từng hộp đựng rồi cân thẳng vào túi của từng hộ",
      "Nhờ người thứ hai soát lại từng danh sách trước khi mọi người tới lấy"
    ],
    [
      "Mở một ghi chú tên “việc cần làm mỗi đợt” và ghi ba việc đầu tiên bạn đã làm",
      "Lúc mọi người tới lấy hàng, hỏi ai điều phối đợt sau và ghi tên lại",
      "Bàn giao bản việc cần làm và quyền vào bảng tính trong một lần ngồi lại",
      "Thêm năm phút mỗi lần lấy hàng để xem lại giá và mức tin cậy của nhà cung cấp"
    ]
  ],
  "repair-cafe": [
    [
      "Nhắn cho người hàng xóm biết may vá và người bạn hay mày mò đồ điện tử",
      "Viết danh sách chỗ trống: mảng sửa nào vẫn chưa có ai nhận",
      "Rủ hai người sửa đồ điện tử hoặc đồ gia dụng, đừng chỉ một — bàn đó xếp hàng dài nhất",
      "Hỏi từng người đã nhận lời xem mang được đồ nghề gì và rảnh ngày nào"
    ],
    [
      "Vẽ phác căn phòng ra giấy, đánh dấu từng ổ điện và từng ô cửa sổ",
      "Mỗi bàn sửa cho một cái bàn, một cây đèn và đúng đồ nghề người sửa đã dặn",
      "Đặt chỗ hàn và chỗ làm với pin gần nơi thoáng gió, tránh xa đám đông",
      "Thử từng ổ cắm chống quá tải ở nhà trước khi cắm vào điện của địa điểm",
      "Dán một bảng tên thật to lên mỗi bàn để ai tới cũng tự tìm được chỗ"
    ],
    [
      "Nhắn cho những người sửa đồ hai ngày dự kiến, xem ngày nào nhiều người gật hơn",
      "Chọn một ngày cố định trong tháng — ví dụ thứ Bảy đầu tiên — đừng để ngày trôi nổi",
      "Xin giữ chỗ cho ba buổi kế tiếp chỉ trong một lần hỏi"
    ],
    [
      "Nhờ một người vui vẻ đứng đón tiếp trong buổi đầu tiên",
      "Làm một phiếu nhận đồ nửa trang: tên người, món đồ, hỏng chỗ nào",
      "Thêm vào phiếu một dòng phân loại: chắc sửa được, khó, hay cần thay linh kiện",
      "In lên phiếu dòng “ai mang đồ tới thì ngồi lại cùng sửa” và nói lại ngay ở cửa"
    ],
    [
      "Bỏ một hộp sơ cứu vào túi đồ sẽ mang tới địa điểm",
      "Làm một tấm bảng ở cửa: ở đây cố sửa hết sức, không hứa chắc sửa được",
      "Viết rõ những điều dứt khoát không nhận: đồ điện lưới đã mở ra, pin phồng",
      "Nói với người sửa rằng thấy không chắc mà từ chối là đúng, và bênh họ khi họ nói không"
    ],
    [
      "Nhờ mỗi người sửa nhắn cho bạn ba thứ vật tư họ hay hết nhất",
      "Đi mua một chuyến: chỉ, cầu chì, keo, ốc vít, ruột xe, miếng vá",
      "Đặt ở mỗi bàn một hộp đồ dùng chung và một tờ giấy đánh dấu",
      "Xem lại tờ đánh dấu sau mỗi buổi và mua bù trước buổi sau"
    ]
  ],
  "rides-transportation": [
    [
      "Nhắn cho hai người biết lái xe, hỏi họ có nhận mỗi tháng một chuyến không",
      "Ngồi lại với từng người đã nhận lời, xem tận mắt bằng lái và thẻ bảo hiểm",
      "Chụp ảnh cả hai giấy tờ để lưu — câu “tôi có bảo hiểm rồi” không phải bằng chứng",
      "Hỏi người quen làm chứng trước khi ai đó chở người dễ bị tổn thương",
      "Ghi lại xe của từng người, mấy chỗ ngồi, và có vừa một chiếc xe lăn không"
    ],
    [
      "Gửi email cho bên bảo hiểm của một người lái, hỏi phần chở giúp có được nhận không",
      "Xin câu trả lời bằng văn bản của mọi bên bảo hiểm trước chuyến xe đầu tiên",
      "Nhờ một phòng trợ giúp pháp lý đọc giúp bản nháp cam kết đơn giản",
      "Lưu từng văn bản xác nhận cùng với ảnh bằng lái của người đó"
    ],
    [
      "Chọn một kênh duy nhất để nhờ chở và ghi lại số điện thoại hay đường dẫn của nó",
      "Soạn các câu hỏi lúc nhận: giờ đón, các điểm đến, và cách liên lạc",
      "Lúc nào cũng hỏi ngay từ đầu về chuyến về và về xe lăn hay khung tập đi",
      "Đặt thời gian báo trước — ví dụ 48 giờ — và ghi rõ ở mọi nơi có kênh này",
      "Cho một lời nhờ thử chạy hết cả quy trình trước khi mở thật"
    ],
    [
      "Nhờ thêm một người thay phiên với bạn mỗi tuần một lượt điều phối",
      "Ghép từng lời nhờ với một người lái và xếp sẵn người dự phòng khi có hủy",
      "Xác nhận với người lái và người đi xe từ hôm trước, nói miệng hay nhắn tin",
      "Chia lời nhờ ra khắp danh sách người lái, đừng dồn vào hai người quen tay"
    ],
    [
      "Liệt kê những loại chuyến sẽ nhận: đi khám bệnh, đi chợ, việc cần thiết",
      "Vẽ phạm vi đi lại lên bản đồ và chọn những con đường làm ranh giới thật",
      "Viết rõ những điều không nhận: không ca cấp cứu, không sát giờ, không ra ngoài bản đồ",
      "Thống nhất quy ước về thời gian chờ và việc xách đồ để ai lái cũng trả lời như nhau"
    ],
    [
      "Nhắn hỏi những người lái xem một chuyến thường tốn bao nhiêu tiền xăng",
      "Chọn một cách: một quỹ chung nhỏ, góp tùy tâm, hoặc không thu gì cả",
      "Đừng để tiền xuất hiện trong xe — mọi khoản góp diễn ra chỗ khác, lặng lẽ",
      "Viết quy ước ấy gọn trong một câu và gửi cho cả người lái lẫn người đi xe"
    ],
    [
      "Lập ngay sổ ghi chuyến: ngày, ai lái, ai đi, tới đâu, xong chưa",
      "Viết quy ước: không vào nhà một mình, không cầm tiền ngoài phần đã thỏa thuận",
      "Ghép chuyến đầu của mỗi người lái với người đi xe đã quen hoặc thêm một người nữa",
      "Hỏi thăm người dễ bị tổn thương sau mỗi chuyến và ghi lại điều gì chưa ổn"
    ]
  ],
  "tenant-union": [
    [
      "Viết ra năm người thuê nhà mà hàng xóm vốn đã tin và nể",
      "Tự hỏi ai trong số đó biết giữ kín chuyện — gạch tên người bạn còn ngờ",
      "Mời từng người đi cà phê riêng, đừng gọi vào một cuộc họp chung",
      "Lúc ngồi lại, hỏi họ muốn nghiệp đoàn giành được điều gì trước tiên",
      "Kết lại bằng một đề xuất về nhịp họp và một phần việc cho mỗi người"
    ],
    [
      "In hoặc vẽ bản đồ khu phố và đánh dấu những tòa nhà nghe có tiếng than",
      "Chọn một tòa nhà và cùng một người nữa gõ mười cánh cửa ngay tuần này",
      "Hỏi cái gì đang hỏng, người ta sợ điều gì, và hàng xóm hay tìm ai khi cần",
      "Hỏi ý trước khi ghi lại câu chuyện của bất kỳ ai",
      "Đặt mã cho từng căn trong sổ ghi và giữ bảng tên ở một chỗ tách riêng"
    ],
    [
      "Tìm trang chính thức về quyền của người thuê nhà ở tỉnh thành bạn và lưu lại",
      "Liệt kê những con số quan trọng: hạn báo trước, thời hạn sửa chữa, quy định đặt cọc",
      "Ghi điều luật và ngày bạn tra cạnh từng thông tin",
      "Gửi email nhờ một phòng trợ giúp pháp lý kiểm chứng bản nháp của bạn",
      "Đóng lên mỗi trang dòng chữ “thông tin, không phải tư vấn pháp lý”"
    ],
    [
      "Mở ngay một nhóm chat hoặc lập chuỗi gọi điện cùng ban nòng cốt",
      "Chốt ai trả lời trước và ai đỡ phía sau, ghi rõ tên",
      "Thống nhất một lời hứa trả lời mà nhóm giữ được thật — ví dụ trong hai tiếng",
      "Diễn tập: gửi một tin báo thử và đo xem mọi người trả lời mất bao lâu",
      "Sửa mọi chỗ hỏng buổi diễn tập lộ ra trước khi đưa số điện thoại ra ngoài"
    ],
    [
      "Nhắn cho đầu mối trợ giúp pháp lý xin một người tới nói và hai ngày có thể",
      "Giữ một phòng mà người thuê nhà tới dễ, rồi chốt ngày",
      "In tài liệu mang về bằng những thứ tiếng người trong các tòa nhà đang nói",
      "Soạn sẵn lời kết: cái hạn ở tòa và số cần gọi, nhắc lại hai lần",
      "Mời qua chính những người dẫn dắt trong từng tòa nhà, đừng chỉ dán tờ rơi"
    ],
    [
      "Mở một trang trắng, đặt tên “Nếu bạn nhận giấy đuổi nhà”",
      "Đặt cái hạn phải trả lời tòa lên đầu tiên, in đậm",
      "Liệt kê các bước kế tiếp theo thứ tự: ghi lại mọi thứ, gọi trợ giúp pháp lý, báo nghiệp đoàn",
      "Thêm một dòng riêng: “không bao giờ bỏ một ngày ra tòa”",
      "Nhờ đầu mối trợ giúp pháp lý đọc trước tất cả mọi người"
    ],
    [
      "Lập danh sách luật sư về nhà thuê, nơi trợ giúp pháp lý và người tư vấn nhà ở gần bạn",
      "Gọi từng nơi, xin một người đầu mối có tên, giờ tiếp nhận và sức chứa thật",
      "Ghi rõ nơi nào nhận việc gấp và nơi nào đang có danh sách chờ",
      "Để tờ liên lạc ở nơi ai trong ban nòng cốt cũng lấy được ngay",
      "Đặt lời nhắc ba tháng một lần kiểm lại tờ liên lạc ấy"
    ]
  ],
  "childcare-collective": [
    [
      "Nhắn cho hai nhà bạn tin: đổi công trông trẻ cho nhau thay vì bỏ tiền thuê nhé?",
      "Hẹn một buổi tối ở phòng khách, có chút đồ ăn vặt và một ngày chắc chắn",
      "Trong buổi đó, mời từng nhà nói thành lời cách dạy con và quy ước xem màn hình",
      "Kết buổi bằng một quyết định: luân phiên tính giờ hay trông chung theo lịch",
      "Viết cách làm ấy gọn trong một đoạn và gửi cho mọi người ngay tối đó"
    ],
    [
      "Trước buổi họp, viết quy ước không bao giờ ở riêng một mình lên đầu trang giấy",
      "Liệt kê những gì sẽ hỏi ở mỗi người trông trẻ: người quen làm chứng, kiểm tra khi cần",
      "Thống nhất mấy người lớn cho mấy trẻ theo từng độ tuổi và ghi con số ra",
      "Cùng nói to lên: quy ước này chặt nhất đúng với những nhà mình tin nhất",
      "Để mỗi nhà sáng lập ký hoặc nhắn đồng ý với bản danh sách cuối cùng"
    ],
    [
      "Nhắn cho nhà có phòng khách hợp nhất, xin cùng đi một vòng xem xét",
      "Quỳ xuống bò khắp phòng ở tầm cao của trẻ mới biết đi, ghi ra từng mối nguy",
      "Mua hoặc mượn nắp che ổ điện, khóa tủ và dây neo tủ kệ chỉ trong một chuyến",
      "Khóa thuốc men và đồ tẩy rửa vào một tủ trên cao rồi thử lại cái chốt",
      "Đi một vòng khoảng sân ngoài, ghi lại cổng, khe hở và những chỗ có nước"
    ],
    [
      "Mở một cuốn lịch chung trên điện thoại và thêm một lượt trông thử",
      "Làm một tờ ghi giờ, mỗi nhà một dòng: giờ đã trông, giờ được trông",
      "Chia sẻ tờ ấy để ngay từ ngày đầu nhà nào cũng thấy số giờ của mọi nhà",
      "Ghi lại nhà nào nhận trẻ ở mỗi lượt để phần việc công bằng ai cũng thấy"
    ],
    [
      "Mở một tệp trắng và gõ bốn mục: dị ứng, thuốc, số liên lạc, ai được đón",
      "Điền một dòng cho mỗi mục rồi gửi tờ khai đi với hạn một tuần",
      "Cho các tờ đã điền vào một bìa hồ sơ màu nổi để người đang trực với tay là lấy được",
      "Viết ngay quy ước khi trẻ bị bệnh — sốt, nôn, nổi ban — trước khi một sáng khó khăn thử nó",
      "Viết các bước lúc cấp cứu gọn trong ba dòng và dán vào mặt trong bìa hồ sơ"
    ],
    [
      "Nhắn cả nhóm tìm một ngày mà mọi người trông trẻ đều gặp nhau được hai tiếng",
      "Tìm một lớp sơ cứu và CPR cho trẻ ở gần rồi gửi đường dẫn ghi tên cho nhóm",
      "Đi qua cách trông coi, cách đặt bé ngủ an toàn và cách xử lý dị ứng với tờ khai thật trên tay",
      "Diễn tập bằng lời tình huống cấp cứu: ai gọi, ai ở lại với lũ trẻ, tờ khai để đâu"
    ],
    [
      "Nhắn hai ba nhà để chốt một buổi thử hai tiếng vào một ngày cụ thể",
      "Giữ buổi thử nhỏ thôi: ít trẻ, hai người lớn, mọi quy ước an toàn đều áp dụng",
      "Xong buổi, hỏi chính lũ trẻ xem thế nào, đừng chỉ hỏi cha mẹ",
      "Nói thẳng về những lần suýt xảy ra chuyện và liệt kê những gì cần sửa",
      "Chỉ chốt ngày cho buổi sau khi đã thống nhất xong các chỗ cần sửa"
    ]
  ],
  "community-composting": [
    [
      "Nhắn cho người lo vườn cộng đồng hỏi xem có góc nào còn trống",
      "Đứng tại từng chỗ định chọn, tìm vòi nước gần nhất và cửa sổ hàng xóm gần nhất",
      "Gõ cửa những nhà sát bên, nói chuyện mùi và chuột trước khi họ kịp lo",
      "Xin phép chủ đất bằng văn bản và tra quy định ủ phân ở địa phương"
    ],
    [
      "Nhắn cho người từng nuôi sống một đống ủ nóng, hỏi họ sẽ chọn cách nào cho chỗ này",
      "Ước lượng rác mỗi tuần theo xô: số nhà nhân với chừng một xô mỗi nhà",
      "Nhớ mức một mét khối: thiếu chừng ấy nguyên liệu thì đống ủ chỉ nằm nguội",
      "Chọn cách ủ vừa đúng công đảo nhóm kham nổi và ghi lại quyết định ấy"
    ],
    [
      "Hỏi trong nhóm chat xem ai có pa lét thừa, cây chĩa xới hay nhiệt kế đo đống ủ",
      "Gom sẵn chất nâu ngay bây giờ — hốt lá vào bao, xếp phẳng bìa — trước khi rác tới",
      "Đóng hoặc mua khối thùng ủ và đặt vào đúng chỗ đã thống nhất",
      "Đi một chuyến mua nốt thứ còn thiếu: nhiệt kế, chĩa xới, thùng nhận rác"
    ],
    [
      "Nhắn cho năm nhà nhiều khả năng tham gia, hỏi ngày bỏ rác nào hợp với họ",
      "Phát xô nhỏ để trong bếp, dán lịch bỏ rác lên nắp từng cái",
      "Nhắc mọi người bỏ qua túi lót “phân hủy được” — chúng sống sót thành mảnh nhựa vụn",
      "Ghi giờ nhận rác lên thùng và nhắn luôn vào nhóm chat"
    ],
    [
      "Nháp bảng có/không ra giấy: trái cây, rau, bã cà phê thì có; thịt, sữa, dầu mỡ thì không",
      "Tìm hoặc vẽ một hình cho từng thứ — khúc xương gà gạch chéo hơn cả đoạn văn",
      "In loại chịu mưa nắng và dán lên chính nắp thùng, đừng dán lên cái cột bên cạnh",
      "Nhờ hai người hàng xóm nói các thứ tiếng khác trong vùng đọc lại lời trên bảng"
    ],
    [
      "Hỏi thẳng ba người đáng tin, gọi tên từng người, mỗi tháng nhận một ca đảo đống",
      "Làm một buổi tay chân: cùng đảo đống ủ và chỉ phép thử miếng bọt biển vắt ráo",
      "Điền tên một người cụ thể vào từng tuần trên lịch — “cả nhóm” nghĩa là không ai",
      "Treo tại chỗ một tờ ghi ép nhựa: ngày, nhiệt độ, độ ẩm, ai đảo"
    ],
    [
      "Nhắn cho vườn cộng đồng rằng sắp có một mẻ và hỏi họ dùng được bao nhiêu",
      "Để mẻ ấy hoai thêm vài tuần và sàng bỏ cục lớn trước khi hứa ngày với ai",
      "Báo cho những nhà đã góp một ngày tới lấy: nhớ mang xô hay bao theo",
      "Giữ lại một tấm ảnh đống phân đã xong để lần sau còn rủ thêm người"
    ]
  ],
  "free-little-library": [
    [
      "Tìm trong nhóm cho tặng đồ hay chợ đồ cũ trên mạng một cái tủ hoặc hộp báo miễn phí",
      "Vẽ cái tủ ra giấy: mái dốc, cửa trong suốt, một gờ chặn mưa dưới cánh cửa",
      "Gom vật liệu rồi đóng tủ, bịt kín phần đáy và từng đường ghép",
      "Xịt vòi nước một phút và bịt lại mọi chỗ nước lọt vào"
    ],
    [
      "Nhắn cho người có khoảnh sân hay bức tường bạn đang nhắm, hỏi họ có thuận không",
      "Đứng tại chỗ đó xem xe đẩy em bé hay xe lăn còn qua lọt trên vỉa hè không",
      "Hỏi về giấy phép hay quy định của khu phố nếu đó không phải đất riêng",
      "Dựng cột hoặc bắt giá đỡ, rồi lắc mạnh cái tủ xem đã neo chắc chưa"
    ],
    [
      "Đăng một mẩu tin trong nhóm chat xin sách cũ còn tốt, nhất là sách thiếu nhi",
      "Đặt một thùng có dán chữ ở hiên nhà hay chỗ đặt tủ để nhận sách, chờ một tuần",
      "Loại ra mọi cuốn ố bẩn, mốc hay đã lỗi thời trước khi chúng lên kệ",
      "Xếp nửa tủ đủ loại sách, để sách thiếu nhi ngay chính giữa phía trước"
    ],
    [
      "Viết nháp ra giấy: “Lấy một cuốn, để lại một cuốn — tất cả đều miễn phí”",
      "Thêm một dòng mời mọi lứa tuổi và mọi thứ tiếng",
      "Đọc to lên và cắt bỏ mọi chữ nghe như một bổn phận",
      "Làm tấm bảng cuối cùng và gắn vào mặt trong cánh cửa, nơi mưa không tới"
    ],
    [
      "Nhắn cho người hàng xóm ở gần tủ nhất, xin năm phút mỗi tuần",
      "Hẹn gặp người đó ở chỗ tủ một lần và cùng dọn lại cho gọn",
      "Thống nhất thứ phải bỏ ra ngay: sách mốc, sách người lớn trong tầm tay trẻ con",
      "Nhờ thêm một người làm dự phòng cho những tuần đi vắng hay bị bệnh"
    ]
  ],
  "community-first-aid-training": [
    [
      "Tìm số điện thoại của Hội Chữ thập đỏ ở địa phương và lưu vào danh bạ",
      "Gọi hỏi về việc mở một lớp và xem nhóm cộng đồng có được miễn phí không",
      "Hỏi mức mấy người học chung một mô hình và họ cần gì ở chỗ đứng ra tổ chức",
      "Liên hệ một nhóm giảm tác hại hoặc cơ quan y tế về phần dạy ứng phó quá liều",
      "Ghi những ngày rảnh của từng người dạy vào cùng một chỗ"
    ],
    [
      "Nhắn hỏi người dạy xem họ có tự mang mô hình tập CPR tới không",
      "Gửi email hỏi cơ quan y tế địa phương về chương trình phát naloxone miễn phí",
      "Hỏi giá hộp sơ cứu cơ bản ở hai nơi bán rồi chọn một",
      "Hôm naloxone tới, ghi lại hạn dùng và cất trong nhà ở nhiệt độ thường"
    ],
    [
      "Liệt kê ba chỗ có thể hỏi: thư viện, nhà văn hóa, phòng khám",
      "Ghé xem một chỗ: có sàn trống để quỳ, có bồn rửa, có lối vào cho xe lăn không",
      "Hỏi xem có giữ được cùng một thứ trong tuần mỗi tháng không",
      "Đối chiếu ngày trống của phòng với ngày của người dạy và giữ chỗ hai buổi đầu"
    ],
    [
      "Nhắn cho hai người nhiều khả năng sẽ tới và nhờ mỗi người rủ thêm một người",
      "Nhờ các cửa hàng gần đó và nhóm đồng hành cùng gia đình loan tin ghi tên cho người của họ",
      "Lập một mẫu ghi tên miễn phí với hai khung giờ cho người làm theo ca",
      "Có chỗ trông trẻ và có gì ăn, và nói rõ ngay trong lời mời",
      "Nhận dư vài chỗ và soạn sẵn tin nhắn xác nhận gửi từ hôm trước"
    ],
    [
      "Nhắn cho người dạy trước hai ngày để chốt giờ và số người",
      "Tới sớm một tiếng để dọn sàn, đặt tờ điểm danh và chuẩn bị nước",
      "Mở đầu bằng lời nhắc: chỉ tập trên mô hình, ai cũng ra ngoài được lúc nói về quá liều",
      "Trông chừng để ai tới cũng được thực hành bằng tay, chứ không chỉ ngồi xem",
      "Phát thẻ nhắc mang về khi mọi người ra cửa"
    ],
    [
      "Đếm số hộp sơ cứu và số liều naloxone rồi ghi con số lại",
      "Đưa mỗi người một hộp trước khi họ về, ghi ai nhận naloxone và hạn dùng",
      "Đặt buổi ôn lại đầu tiên lên lịch trong vòng một năm, trước khi mọi người tản đi",
      "Đặt lời nhắc trước hạn naloxone sớm nhất một tháng để kịp lấy lọ mới"
    ]
  ],
  "time-bank": [
    [
      "Viết danh sách mười tới mười lăm người hàng xóm bạn thật sự ngồi lại được",
      "Nhắn cho ba người đầu tiên ngay hôm nay để hẹn nói chuyện riêng thật ngắn",
      "Mỗi lần nói chuyện, xin một điều họ giúp được và nài thêm một điều họ cần",
      "Ghi mọi lời ngỏ giúp đỡ và mọi điều cần giúp vào cùng một tờ, làm tới đâu ghi tới đó",
      "Cứ rủ thêm cho tới khi tờ ấy đủ đa dạng — đưa đón, sửa chữa, kèm học, nấu ăn"
    ],
    [
      "Hỏi người có thể làm điều phối xem họ vốn đã dùng công cụ gì mỗi tuần",
      "Thử ghi ba lần trao đổi giả định vào một bảng tính thường",
      "Chỉ thử một ứng dụng ngân hàng thời gian nếu bảng tính không đủ",
      "Xác nhận bạn xuất được cả cuốn sổ chung ra trước khi chốt bất cứ thứ gì",
      "Chọn cách đơn giản nhất còn trụ được sau khi thử và ghi lại cách nó chạy"
    ],
    [
      "Đưa buổi bàn quy ước lên lịch và mời những thành viên sáng lập",
      "Viết quy ước đầu tiên lên trên cùng: một giờ là một giờ, không ngoại lệ",
      "Thống nhất cách thành viên nhờ, xác nhận và ghi lại một lần trao đổi",
      "Quyết ngay bây giờ: nếu ai rời đi lúc số giờ đang âm hoặc để nó âm sâu thì sao",
      "Gói tất cả trong một trang và đọc to lên trước khi mọi người gật đầu"
    ],
    [
      "Chọn một ngày và nhắn cho mọi người lời mời ngắn tới buổi giới thiệu",
      "Chuẩn bị mười phút đi qua: tinh thần của việc này, rồi ghi thử một lần trao đổi",
      "Nạp vài giờ hạt giống vào số giờ của từng thành viên mới",
      "Trước khi ai ra về, để họ hẹn ngay tại chỗ một lần trao đổi thật",
      "Một tuần sau, hỏi lại những ai chưa có lần trao đổi đầu tiên"
    ],
    [
      "Mở tờ danh sách thành viên và gom mọi lời ngỏ giúp đỡ vào một danh sách",
      "Thêm cột ghi mỗi người rảnh lúc nào và ở đâu",
      "Nhắn cho những thành viên còn thiếu ngày rảnh hoặc phạm vi đi được",
      "Đưa danh bạ ấy lên đúng nơi thành viên vốn đã hay xem",
      "Đặt lời nhắc mỗi tháng trên lịch để dọn bớt những mục đã cũ"
    ],
    [
      "Mở sổ chung và tìm ngay hôm nay một việc cần giúp ghép được với một lời ngỏ",
      "Nhắn cho cả hai thành viên đề xuất cặp ghép ấy và ngỏ ý giới thiệu hai bên",
      "Rà xem ai có giờ mà chưa tiêu bao giờ, rồi nhắn cho từng người, gọi đúng tên",
      "Khẽ nhắc một thành viên đã vào mà chưa trao đổi, kèm một gợi ý thật cụ thể",
      "Ghi lại cặp ghép nào thành, để tháng sau việc ghép nhẹ đi"
    ],
    [
      "Nháp ba quy ước an toàn: người quen làm chứng, gặp lần đầu chỗ đông, từ chối dễ dàng",
      "Thêm một cách từ chối bất kỳ cặp ghép nào mà không cần lý do",
      "Chỉ định một con người — không phải một cái mẫu — để nghe những điều gợn lên",
      "Mang các quy ước ấy tới buổi họp sau và chỉnh lại ngay tại chỗ, thành lời",
      "Dán bản quy ước cuối cùng ở nơi mọi người vào nhóm"
    ]
  ],
  "solidarity-fund": [
    [
      "Ghi ra tên ba hoặc năm người bạn tin tưởng để cùng giữ tiền chung",
      "Nhắn cho từng người, xin một tiếng ngồi nói chuyện về quỹ",
      "Nói thẳng với nhau về các khoản chi, việc công khai và lúc tiền không đủ",
      "Thống nhất: ai có bạn bè hay người nhà nộp đơn thì đứng ngoài quyết định",
      "Giữ số người trong nhóm là số lẻ để bỏ phiếu không bị hòa"
    ],
    [
      "Gửi email cho một tổ chức phi lợi nhuận hoặc người làm kế toán, xin một cuộc gọi tư vấn ngắn",
      "Hỏi phần pháp lý và thuế trước khi mở bất cứ thứ gì",
      "Mở tài khoản riêng hoặc ký với một tổ chức bảo trợ tài chính — không dùng tài khoản cá nhân",
      "Ghi thành văn bản quy tắc: mỗi khoản chi phải có hai người ký",
      "Mở sổ thu chi với các cột: ngày, số tiền, mục đích và ai đã duyệt"
    ],
    [
      "Đặt lịch họp bàn tiêu chí cho cả nhóm ngay trong tuần này",
      "Viết nháp: ai được xin, mức tiền thường trao, bao lâu xin lại một lần",
      "Đặt mức trần cho mỗi lần xin và tổng tối đa mỗi tháng",
      "Bỏ mọi giấy tờ chứng minh hoàn cảnh mà bạn không thật sự cần",
      "Viết tiêu chí cuối cùng gọn trong một trang để cả nhóm cùng nhất trí"
    ],
    [
      "Mở một mẫu đơn trắng và chỉ thêm ba ô: tên, cách liên lạc, cần gì",
      "Thêm một câu hỏi: bạn muốn nhận tiền theo cách nào",
      "Xóa mọi thứ nghe như đòi chứng minh — không số giấy tờ, không giấy chủ nhà",
      "Mở thêm cách nộp qua điện thoại và gặp trực tiếp, không chỉ trên mạng",
      "Nhờ một người ngoài thử điền và nói chỗ nào khiến họ thấy bị dò xét"
    ],
    [
      "Nhắn cho năm thành viên, hỏi họ có góp một khoản nhỏ mỗi tháng được không",
      "Mở sẵn cách góp định kỳ trước khi tính đến đợt quyên góp lớn nào",
      "Viết một câu cho người quyên góp: tiền đi thẳng tới hàng xóm đang gặp khó",
      "Loan tin về quỹ ở nơi thành viên vẫn trò chuyện và nhờ mọi người chia sẻ",
      "Ghi mỗi lời hứa góp vào sổ để cả nhóm liệu trước cho tháng sau"
    ],
    [
      "Nhắn cho cả nhóm một mức thời hạn đề xuất — ví dụ trả lời trong 48 giờ",
      "Định một mức tiền nhỏ để hai người duyệt ngay trong ngày, khỏi cần họp",
      "Liệt kê những cách chi tới tay nhanh nhất — tiền mặt, chuyển khoản, trả thẳng hóa đơn",
      "Viết các bước xem xét gọn trong một trang: ai đọc, ai ký, ai chi",
      "Ghi mỗi quyết định trong một dòng: ngày, số tiền và hai người đã duyệt"
    ],
    [
      "Mở sổ ra và ghi ba con số của tháng: vào, ra, số hàng xóm được giúp",
      "Viết bản tóm tắt ba dòng chỉ bằng con số — không kể chuyện, không bao giờ",
      "Đọc lại và kiểm cho chắc không có gì nhận ra được người nhận",
      "Đăng ở nơi người quyên góp và thành viên vẫn thường xem",
      "Lặp lại đúng ngày đó mỗi tháng để mọi người quen mà chờ"
    ]
  ],
  "diaper-hygiene-bank": [
    [
      "Nhắn cho một người ở phòng khám, nhà thờ hay điểm phát thực phẩm, hỏi xem có kho trống",
      "Đến xem hai chỗ khả quan nhất, kiểm tra ẩm mốc, chuột bọ và cửa có khóa",
      "Đứng ở chỗ các gia đình sẽ nhận đồ, xem có bị cả phòng chờ nhìn thấy không",
      "Xin một câu đồng ý bằng văn bản: kệ hay kho nào là của bạn, ai giữ chìa khóa"
    ],
    [
      "Tìm trên mạng “kho tã” kèm tên khu vực của bạn và ghi lại chỗ gần nhất",
      "Gửi email hỏi mạng lưới hoặc mối bán buôn về giá thùng cho cỡ 4, 5 và 6",
      "Liệt kê ba nơi có thể tổ chức quyên góp — trường, phòng tập, chỗ làm — và nhắn cho một nơi hôm nay",
      "Lập một trang theo dõi: nguồn nào, cho gì, và lâu nay có đều không"
    ],
    [
      "Cầm bút dạ, dán nhãn mỗi kệ hay thùng theo một cỡ tã trước khi mở hộp nào",
      "Vừa xếp lên kệ vừa chia thùng thành từng phần sẵn để trao, đừng đợi ở cửa",
      "Đếm số trên từng kệ và ghi tổng theo cỡ vào một tờ giấy kẹp bảng",
      "Khoanh hai cỡ đang thiếu nhất và chuyển con số đó cho người lo nguồn hàng"
    ],
    [
      "Gọi cho một kho tã gần đó, hỏi họ chốt mỗi tháng mỗi bé bao nhiêu cái",
      "Viết một câu: mỗi bé bao nhiêu, bao lâu một lần, và không đòi giấy tờ gì",
      "Đọc cho hai người giúp và một phụ huynh nghe, sửa chỗ nào nghe như đi thi",
      "Dán con số thật thà đó ở chỗ các gia đình nhìn thấy, để không ai phải hỏi"
    ],
    [
      "Nhắn hỏi nơi cho mượn chỗ xem ngày và giờ cố định nào hợp mỗi tháng",
      "Nhắn cho ba người có thể giúp, kèm ngày cố định, xin một cái gật lâu dài",
      "Đi qua với mọi người đúng một quy tắc: trao gói đồ, không hỏi gì thêm",
      "Đặt chuông nhắc để xác nhận người giúp hai ngày trước mỗi buổi phát"
    ]
  ],
  "community-bike-workshop": [
    [
      "Nhắn cho ba người có thể cho mượn nhà xe, tầng hầm hay một góc bỏ không",
      "Đi xem từng chỗ và đo mảng tường để treo xe dọc lên",
      "Kiểm ổ khóa và hỏi chủ chỗ ban đêm nơi này được khóa thế nào",
      "Thống nhất chuyện cất xe, giờ ra vào và bảo hiểm với chủ chỗ trước khi gật đầu"
    ],
    [
      "Hỏi trong nhóm chat xem ai có đồ nghề xe đạp đang để không trong ngăn kéo",
      "Hỏi một tiệm xe đạp gần nhà xem họ có tặng đồ nghề cũ hay bán rẻ giá đỡ không",
      "Liệt kê những món còn thiếu — cây nạy lốp, cờ lê côn, kìm cắt dây — và hỏi giá",
      "Treo tấm bảng đục lỗ và vẽ hình từng món để lúc đóng cửa biết thiếu cái nào"
    ],
    [
      "Ghi vào ứng dụng ghi chú câu không dứt khoát: không nhận xe siêu thị đã gỉ",
      "Viết lời kêu gọi ngắn, để câu không lên đầu, kèm ngày và địa chỉ nhận xe",
      "Đăng lên hai kênh trò chuyện của khu phố",
      "Phân loại ngay khi xe tới: sửa được, lấy phụ tùng, hay chạy được ngay",
      "Tháo sớm mấy chiếc lấy phụ tùng và xếp phụ tùng theo loại cho dễ tìm"
    ],
    [
      "Nhắn cho hai người sửa xe giỏi nhất bạn quen, xin mỗi người một ca mở cửa",
      "Nhờ từng người chỉ bạn vá một cái lốp mà không tự tay đụng vào bánh xe",
      "Chọn người biết để người mới loay hoay — kiên nhẫn chỉ nghề mới là việc chính",
      "Ghi tên từng người vào một ca mở cửa cụ thể trên lịch"
    ],
    [
      "Hỏi trong nhóm chat xem hai khung giờ nào trong tuần hợp với nhiều người nhất",
      "Viết giờ mở cửa lên cửa và đăng lại trên cùng những kênh đó mỗi tuần",
      "Phác lên một tấm thẻ: đi mấy buổi, học được gì, đến khi nào thì có xe",
      "Làm một thẻ đóng dấu cho mỗi người học để thợ nào cũng đọc được tiến độ"
    ],
    [
      "Bỏ vào một cái túi cho xưởng: hộp cứu thương và hai cặp kính bảo hộ",
      "Viết quy tắc lên một tấm áp phích: đeo kính, buộc tóc, hỏi trước khi dùng máy",
      "Làm thẻ xuất xưởng có dòng ký cho phanh, lốp và bộ cổ lái của từng chiếc xe",
      "Nhờ một người khác, không phải người lắp xe, ký vào lần kiểm tra cuối"
    ]
  ],
  "newcomer-translation-network": [
    [
      "Nhắn cho hai người biết hai thứ tiếng, hỏi họ có phiên dịch giúp đôi lúc không",
      "Ghi ra ba thứ tiếng bạn nghe nhiều nhất ở trường học và hàng quán quanh đây",
      "Nhờ một thầy cô dạy tiếng hoặc một vị trong nhà thờ, nhà chùa loan lời nhắn",
      "Nhờ mỗi người dịch thử một câu về khám bệnh cả hai chiều trước khi tính vào",
      "Ghi lại mỗi lời đồng ý kèm ngôn ngữ, giọng vùng và giờ rảnh vào cùng một chỗ"
    ],
    [
      "Mở một trang ghi chú và liệt kê năm nơi bạn đã biết tên",
      "Hôm nay gọi cho một phòng khám và hỏi ở đó thật sự có người nói tiếng nào",
      "Với mỗi nơi, ghi rõ họ có hỏi giấy tờ tùy thân hay tình trạng cư trú không",
      "Hỏi một tổ chức làm việc với người nhập cư nơi nào đáng tin, nơi nào nên tránh",
      "Gom địa chỉ, giờ mở cửa và một tên người liên hệ vào cùng một cuốn danh bạ chung"
    ],
    [
      "Nhắn hỏi một người giúp xem họ có nhận các cuộc gọi tiếp nhận một tháng thử không",
      "Mở một đường dây điện thoại hoặc một mẫu đơn duy nhất để mọi lời nhờ đổ về đó",
      "Chỉ giữ trong phiếu tiếp nhận: tên gọi, ngôn ngữ, việc cần và số gọi lại",
      "Ghép từng lời nhờ theo ngôn ngữ và việc cần, rồi xác nhận lại với cả hai bên",
      "Nhờ một người bạn gửi một lời nhờ thử và chạy nó qua trọn quy trình"
    ],
    [
      "Ghi ra năm câu hỏi mà người mới đến hay hỏi bạn nhất",
      "Viết một trang lời lẽ đơn giản về chủ đề nóng nhất, hình nhiều hơn chữ",
      "Nhờ một người bản ngữ của mỗi cộng đồng đọc to bản nháp trước khi in",
      "In một đợt nhỏ trước, phát ra, rồi sửa những chỗ khiến người ta lúng túng"
    ],
    [
      "Hỏi một người mới đến sắp có lịch hẹn xem họ có muốn ai đi cùng không",
      "Ghép một người giúp theo ngôn ngữ, xác nhận giờ và chỗ gặp với cả hai bên",
      "Dặn người đi cùng: dịch ở ngôi thứ nhất, không thêm gì, không khuyên gì",
      "Hỏi lại cả hai bên sau đó và ghi lại lần sau nên làm khác chỗ nào"
    ],
    [
      "Viết một dòng ở đầu phiếu tiếp nhận: không bao giờ hỏi tình trạng cư trú",
      "Gạch bỏ mọi ô trong mẫu đơn mà thiếu nó bạn vẫn làm được việc",
      "Quyết định hồ sơ được giữ bao lâu và đánh dấu vào lịch ngày sẽ xóa",
      "Soạn sẵn câu trả lời cho yêu cầu cung cấp hồ sơ: giữ gì, không bao giờ thu gì",
      "Đi qua các quy tắc với từng người giúp trước lời nhờ đầu tiên của họ"
    ]
  ],
  "community-meal": [
    [
      "Liệt kê ba hội trường có bếp: một nhà thờ, một nhà văn hóa, một trường học",
      "Gọi hoặc nhắn cho một nơi để xin đến xem bếp",
      "Lúc đến xem, kiểm bồn rửa tay riêng, nước nóng và chỗ trong tủ lạnh",
      "Xác nhận hội trường trống vào đúng những ngày bạn định nấu",
      "Xin cái gật đầu bằng văn bản, một email ngắn cũng được"
    ],
    [
      "Tìm số điện thoại của cơ quan y tế địa phương và ghi lại",
      "Gọi và hỏi đúng về diện miễn trừ cho bữa ăn nấu phát miễn phí",
      "Ghi danh ngay lớp an toàn thực phẩm — lớp kín chỗ trước cả mấy tuần",
      "Viết quy định về nhiệt độ và bảo quản ở chỗ người nấu nào cũng thấy"
    ],
    [
      "Nhắn cho một cửa hàng hay quán ăn bạn quen và hỏi họ có cho đồ không",
      "Ghé thăm hai nơi cung cấp nữa, gặp trực tiếp vào lúc họ vắng khách",
      "Chốt với từng nơi một ngày và một lượng cụ thể, không phải “còn gì cho nấy”",
      "Hỏi vườn rau của xóm hay nhóm đi mót xem họ gửi được phần dư nào",
      "Giữ một danh sách ai cho gì, khi nào, và cập nhật sau mỗi bữa"
    ],
    [
      "Xem lại danh sách nguồn hàng và ghi ra tuần tới thật sự nhận được những gì",
      "Chọn một món chính vốn đã chay, không hạt cây, không hải sản",
      "Nhân khẩu phần công thức ra giấy và liệt kê lượng cần mua hay cần xin",
      "Viết nhãn ghi chất gây dị ứng cho từng món trước ngày nấu"
    ],
    [
      "Nhắn cho năm người, mỗi người xin một việc cụ thể: sơ chế, nấu, dọn ăn, rửa dọn",
      "Thêm hai tên nữa vào mỗi ca, nhiều hơn mức thật sự cần",
      "Cử người làm bếp chính bữa đầu và một người thứ hai tập nghề ngay từ tuần đầu",
      "Chia danh sách phân việc và xác nhận với mọi người hai ngày trước bữa ăn"
    ],
    [
      "Nhắn cho ba người sẽ tới ăn và hỏi ngày nào, giờ nào hợp với họ",
      "Chọn ngày giờ bạn giữ được suốt một năm, không phải ngày giờ hăng hái nhất",
      "Làm một tờ rơi ấm áp, giản dị: ngày, giờ, chỗ, miễn phí, ai tới cũng quý",
      "Để tờ rơi ở nhà tạm trú, tiệm giặt và tạp hóa đầu phố",
      "Nhờ nơi cho mượn chỗ và các nhóm cùng làm truyền miệng giúp"
    ],
    [
      "Nhắn cho cả nhóm từ hôm trước để xác nhận ca và giờ có mặt",
      "Dán bảng phân việc trong ngày ở bếp: ai sơ chế, nấu, dọn ăn, rửa dọn",
      "Bưng ra tận bàn ở những chỗ làm được, thay vì để mọi người xếp hàng",
      "Chuyển đồ ăn còn dư sang khay nông và cất tủ lạnh trong hai tiếng sau khi dọn",
      "Trả lại cái bếp sạch đến mức kiểm tra cũng đạt và ghi lại thứ gì sắp hết"
    ]
  ],
  "seed-library": [
    [
      "Tìm email hay số điện thoại của thư viện và ghi lại tên người phụ trách",
      "Gửi một tin nhắn hỏi họ có nhận đặt một tủ hạt giống nhỏ hay bộ ngăn kéo không",
      "Đến xem và chọn một góc xa cửa sổ, tường ngoài và miệng gió nóng",
      "Mang tới một hộp phong bì nhỏ và một cây bút dạ để lại cạnh tủ"
    ],
    [
      "Nhắn cho một người trồng rau lâu năm, hỏi giống nào ở đây lên tốt",
      "Gửi email cho một vườn ươm gần đó và một vườn rau cộng đồng xin phần dư cuối mùa",
      "Đăng một lời nhờ xin hạt giống ở nơi mọi người vẫn hay xem",
      "Phân loại hạt ngay khi nhận, để riêng hạt bọc thuốc và giống lai độc quyền"
    ],
    [
      "Lấy thùng hạt được cho và chia các gói thành ba đống: rau, rau thơm, hoa",
      "Viết thật to tên cây và năm lên từng phong bì",
      "Đánh dấu bằng một màu những giống dễ, để người lần đầu tự lấy được",
      "Xếp mỗi ngăn với hạt cũ nhất ở phía trước",
      "Ghi thêm một dòng cách trồng cho những giống khó tính hơn"
    ],
    [
      "Mở một trang giấy trắng và viết ba lệ: lấy miễn phí, đem trồng, trả nếu được",
      "Thêm mức giới hạn mỗi người vài gói cho mỗi giống",
      "Viết chuyện trả hạt như một món quà được đón nhận, không bao giờ là bổn phận",
      "In trang giấy đó và dán vào mặt trong cánh tủ"
    ],
    [
      "Chọn một ngày trong tuần này để ghé xem tủ và ghi vào lịch của bạn",
      "Rút ra mọi phong bì đã quá hai năm",
      "Thử mẻ đáng ngờ: mười hạt trong khăn giấy ẩm suốt một tuần",
      "Bỏ ra bất cứ mẻ nào có chưa tới sáu hạt nảy mầm",
      "Liệt kê ba giống vơi nhất và nhắn cho người cho hạt xin bù thêm"
    ]
  ],
  "digital-literacy": [
    [
      "Đăng một lời nhờ xin máy tính xách tay và máy tính bảng cũ trong nhóm chat sẵn có",
      "Lúc nhận máy, xem người cho đăng xuất iCloud hay Google trước khi máy rời tay",
      "Đặt một thùng “chạy được” và một thùng “lấy linh kiện”, phân loại máy ngay khi tới",
      "Xóa, cập nhật và thử một máy từ đầu tới cuối trước khi làm cả loạt còn lại"
    ],
    [
      "Mở một trang tính trắng và gõ năm cột: ai, máy gì, số máy, tình trạng, ngày trả",
      "Đánh số từng máy và cục sạc thành một bộ bằng những cái nhãn giống nhau",
      "Viết trong hai câu: cho mượn bao lâu, và trả trễ thì không ai bị trách",
      "Làm thử một lượt cho mượn với một người giúp để thấy sổ còn thiếu gì"
    ],
    [
      "Tìm trang cho mượn bộ phát Wi-Fi của thư viện và ghi lại họ có gì",
      "Gọi hai nhà mạng hoặc một chương trình giá rẻ, hỏi hạn mức dữ liệu thật của gói",
      "In nửa trang danh sách các điểm Wi-Fi miễn phí gần nơi người mượn sống",
      "Thử một bộ phát bằng cuộc gọi video mười phút trước khi cho mượn"
    ],
    [
      "Nhắn cho hai người bạn kiên nhẫn, hỏi họ ngồi kèm một người mới mỗi tháng nhé",
      "Viết ba lệ lên một tấm thẻ: người học cầm lái, không từ chuyên môn, không đụng chuột",
      "Diễn thử: mỗi người kèm hướng dẫn xong một việc mà không chạm vào máy",
      "Ghép mỗi người kèm mới với một người học thật và ngồi cùng buổi đầu tiên"
    ],
    [
      "Nhắn cho một người sắp học, hỏi điều họ muốn làm được nhất trên mạng",
      "Chọn bốn chủ đề đứng đầu, mỗi chủ đề một trang riêng — mỗi trang một việc",
      "Chụp đúng những màn hình người học sẽ thấy và dán vào thật to",
      "Đưa một trang nháp cho một người học và xem ngón tay họ ngập ngừng ở đâu"
    ],
    [
      "Nhắn hỏi nơi cho mượn chỗ hai khung giờ mỗi tuần: một ban ngày, một buổi tối",
      "Giới hạn mỗi lớp sáu người ghi danh, để không ai ngồi im lặng ở cuối phòng",
      "Rủ thêm một người giúp đi vòng trong giờ ghé hỏi để lo những ca hóc búa",
      "Đưa lịch lên tờ rơi giấy, dán ở những nơi người học vẫn hay lui tới"
    ],
    [
      "Tra cách khôi phục cài đặt gốc cho hai dòng máy bạn hay gặp nhất",
      "Dán một danh sách ở bàn nhận máy: lưu ảnh của người mượn trước, rồi mới xóa",
      "Viết một đoạn ngắn về chuyện máy mất hay hỏng, vẫn để ngỏ cánh cửa quay lại",
      "Thêm năm phút nói chuyện mật khẩu và riêng tư vào mỗi lần trao máy"
    ]
  ],
  "weatherization-brigade": [
    [
      "Nhắn cho ba người khéo tay nhất bạn quen, xin mỗi tháng một ngày chung tay",
      "Dán lời nhờ lên bảng tin của cửa hàng vật tư và bãi gỗ",
      "Hỏi từng người đã thật sự làm những việc gì, chứ không phải làm được việc gì",
      "Ghép mỗi người mới với một người dày dạn ở một việc đầu tiên ít rủi ro"
    ],
    [
      "Mời hai người dày dạn nhất ngồi một tiếng bàn về ranh giới công việc",
      "Liệt kê những việc sẽ nhận: trám khe, dán gioăng, lắp tay vịn, sửa vặt",
      "Viết danh sách dừng lại và chuyển đi: điện, gas, mái nhà, kết cấu",
      "Thêm sơn có chì và cách nhiệt cũ vào danh sách đó cho nhà xây trước 1978",
      "In hai danh sách gọn trong một trang cho từng người trong nhóm"
    ],
    [
      "Chọn số điện thoại sẽ nhận lời nhờ và nhắn cho cả nhóm xác nhận",
      "Làm một mẫu đơn giấy, để sẵn ở điểm phát thực phẩm và câu lạc bộ người cao tuổi",
      "Soạn một trang danh sách cần xem khi tới nhà: phạm vi việc, vật tư, giới hạn an toàn",
      "Xếp lịch khảo sát theo cặp — hai người cùng đi xem mỗi căn nhà",
      "Chụp ảnh mọi thứ lúc đi xem và nói rằng sẽ chốt kế hoạch sau"
    ],
    [
      "Lấy danh sách vật tư từ buổi khảo sát gần nhất và cộng lại số lượng",
      "Hỏi chủ cửa hàng vật tư xem có giảm giá hay cho tặng cho nhóm không",
      "Mua keo trám và vật tư ít mùi, ít hóa chất bay hơi cho nhà đang có người ở",
      "Dán nhãn một thùng đồ nghề dùng chung và ghi rõ bên trong có gì lên nắp"
    ],
    [
      "Gửi email cho công ty bảo hiểm hỏi bảo hiểm cho việc sửa nhà do người giúp làm",
      "Xin xác nhận bằng văn bản rằng hợp đồng có nêu việc sửa nhà do người giúp làm",
      "Soạn một giấy miễn trừ đơn giản và in cho mỗi chủ nhà và mỗi người giúp",
      "Sắm hoặc kiểm lại hộp cứu thương và đặt lệ dùng thang: có người giữ, không trèo bậc trên cùng"
    ],
    [
      "Chọn một ngày thứ Bảy và ghép hai ba việc đã khảo sát cho các nhóm",
      "Gọi cho từng chủ nhà từ tuần trước để thống nhất kế hoạch và giờ tới",
      "Gọi lại vào đúng sáng hôm đó, để không ai giật mình khi thấy cả nhóm",
      "Mang theo nước, túi đựng rác và đồ dọn dẹp để buổi làm không tốn của nhà ai",
      "Đi xem lại việc đã làm cùng chủ nhà trước khi cả nhóm rời đi"
    ]
  ],
  "pet-food-bank": [
    [
      "Nhắn cho người phụ trách kho thực phẩm cộng đồng, hỏi về việc dùng chung chỗ và chung ngày phát",
      "Đi một vòng xem chỗ đó có khô ráo, không chuột bọ và khóa được không",
      "Hỏi giá thùng đậy kín và một cái kệ hay tấm pa lét để kê thức ăn khỏi mặt sàn",
      "Chốt điểm phát và giờ giấc với nơi cho bạn mượn chỗ"
    ],
    [
      "Gọi cho một cửa hàng thú cưng và hỏi họ làm gì với những bao rách hay móp",
      "Gửi một lời nhờ quyên góp thật ngắn tới hai cửa hàng nữa và một phòng khám thú y",
      "Hẹn một ngày lấy hàng cố định mỗi tháng với tất cả những nơi đã nhận lời",
      "Mở một cuốn sổ đơn giản ghi hàng về mỗi tuần để thấy chỗ nào đang hụt"
    ],
    [
      "Cầm cây bút lông và dán nhãn ba thùng: chó, mèo, con vật khác",
      "Xem hạn dùng từng bao và loại ra hết những bao đã quá hạn",
      "Để riêng thức ăn theo toa và theo chỉ định thú y vào thùng có nhãn riêng",
      "Đếm từng thùng và dán tổng số ở chỗ cả nhóm đều nhìn thấy"
    ],
    [
      "Nhắn cho một người bạn có nuôi thú cưng, hỏi mỗi tháng con vật nhà họ ăn hết bao nhiêu",
      "Định phần theo số con và cỡ con vật, chứ không phải mỗi nhà một bao như nhau",
      "Chốt nhịp phát để mọi người tính trước được — cùng một lượng, cùng một lịch",
      "Viết cách phát gọn trong một đoạn, không đòi ai chứng minh hoàn cảnh"
    ],
    [
      "Nhắn cho hai người góp một tay, hỏi họ nhận được ngày cố định nào",
      "Cố định cùng ngày cùng giờ mỗi tháng để người nuôi thú cưng trông cậy được",
      "Trước mỗi buổi, kiểm lại xem trên bàn có đủ cả thức ăn chó lẫn mèo chưa",
      "Dặn cả nhóm: không bình phẩm lựa chọn của ai — cứ trao thức ăn thôi"
    ]
  ],
  "youth-mentorship": [
    [
      "Gửi email cho trường, thư viện và nhà văn hóa hỏi mượn một phòng cho giờ sau tan học",
      "Tới xem nơi ưng nhất, kiểm lối thoát, nhà vệ sinh và chỗ cho các em chạy nhảy",
      "Xin bằng văn bản vẫn phòng đó suốt cả học kỳ, chứ không phải ký từng tháng",
      "Định giờ sinh hoạt hằng tuần và báo cho các gia đình biết trước khi mở cửa"
    ],
    [
      "Tải về một bản quy tắc bảo vệ trẻ mẫu của một chương trình đã làm lâu năm",
      "Viết rõ yêu cầu kiểm tra lý lịch: chưa qua thì chưa người lớn nào được bắt đầu",
      "Viết quy tắc hai người lớn phủ cả nhà vệ sinh, chuyến xe về nhà và buổi kèm riêng",
      "Tra luật bắt buộc trình báo ở nơi bạn ở và viết các bước trình báo vào quy tắc",
      "Cho mọi người lớn ký vào bản quy tắc trước buổi sinh hoạt đầu tiên của họ"
    ],
    [
      "Nhờ hai nhóm cộng đồng đáng tin, mỗi nhóm giới thiệu cho một người lớn đáng tin",
      "Trong mỗi buổi trò chuyện, hỏi thẳng: bạn theo được mỗi tuần, suốt cả học kỳ chứ",
      "Bắt đầu kiểm tra lý lịch ngay ngày người đó nhận lời",
      "Tổ chức một buổi tập huấn về ranh giới, quy tắc an toàn và cách giúp mà không làm hộ"
    ],
    [
      "Hỏi ba em nhỏ xem sau giờ học các em thật sự thích làm gì",
      "Vẽ nhịp cố định lên một trang giấy: ăn nhẹ, rồi làm bài, rồi hoạt động",
      "Lên hoạt động cho hai tuần đầu, mượn luôn những ý các em vừa nói",
      "Chừa mỗi tuần một khoảng để chính các em tự đứng ra bày trò"
    ],
    [
      "Ghi vào điện thoại những gì tờ khai cần: giấy cho phép, dị ứng, số gọi, ai đón",
      "Soạn tờ ghi danh một trang từ danh sách đó",
      "Đưa tận tay cha mẹ và ngồi cùng điền giúp ai cần ngay tại chỗ",
      "Dán dị ứng nặng ở chỗ người trực thấy vào giờ ăn nhẹ, đừng cất trong tập hồ sơ",
      "Chốt ai được phép đón từng em, rồi khóa tủ cất hết giấy tờ"
    ],
    [
      "Nhắn cho một tiệm tạp hóa hay tiệm bánh hỏi về việc tặng đồ ăn nhẹ mỗi tuần",
      "Viết danh sách đi chợ, mặc định không có hạt cây",
      "Dán nhãn mọi món được tặng mà bạn không nắm chắc thành phần",
      "Đăng lời nhờ sách, đồ vẽ và trò chơi lên nhóm chat của cộng đồng"
    ],
    [
      "Đặt chuông điện thoại để bạn tới trước cả em nhỏ đầu tiên",
      "Bày sẵn tờ điểm danh và đồ ăn nhẹ trước khi mở cửa",
      "Đếm đầu các em lúc tới và trước khi ai về; ghi rõ ai đón em nào",
      "Nói với cha mẹ một điều thật cụ thể và đáng mừng lúc họ tới đón",
      "Đóng cửa xong, ghi hai dòng: điều gì chạy tốt, em nào cần hỏi han thêm"
    ]
  ],
  "gleaning-network": [
    [
      "Nhớ ra và ghi năm nguồn gần nhà: nông trại, vườn cây, sạp chợ, cây trái trĩu quả",
      "Ghé hoặc gọi hai nơi khả thi nhất, hỏi phần dư nào đang không ai hái",
      "Hỏi từng nhà vườn chỗ nào KHÔNG được đụng, đậu xe và đi lối nào",
      "Ghi mỗi lời đồng ý kèm loại cây, mùa áng chừng và một số điện thoại"
    ],
    [
      "Hỏi nhóm chat xem ai bỏ được mọi việc để đi hái vào một sáng giữa tuần",
      "Hỏi từng người đã nhận lời về lịch rảnh thật, không phải ý định tốt",
      "Giữ danh sách những người chắc chắn kèm số gọi — ba người bền hơn mười người lửng lơ",
      "Chạy thử một lần gọi gấp và xem ai thật sự trả lời trong vòng một tiếng"
    ],
    [
      "Nhắn hai người bạn có xe tải hay xe cốp rộng, hỏi ngày giữa tuần họ rảnh",
      "Xin một nhà thờ, quán ăn hay tiệm tạp hóa một góc mát để giữ đồ một ngày",
      "Gom nhiều sọt hơn bạn nghĩ là cần — một cây thôi cũng cho hàng trăm kg",
      "Viết kế hoạch gọn trong một tấm thẻ: ai lái, đồ chờ ở đâu, ai chuyển đi tiếp"
    ],
    [
      "Lập ngay nhóm chat báo tin và thêm những người đã chốt vào đó",
      "Soạn sẵn một mẫu tin báo: loại cây, địa chỉ, khung giờ, mang theo gì",
      "Thống nhất chỉ lời nhận bằng chữ mới tính là đi — một câu trả lời, không phải ngón cái",
      "Gửi một tin báo thử và bấm giờ xem ba người chốt lại nhanh cỡ nào"
    ],
    [
      "Tra quy định bảo vệ người quyên góp thực phẩm ở nơi bạn ở",
      "Mượn một mẫu giấy miễn trừ trách nhiệm của một nhóm thu hái lâu năm",
      "Cùng nhà vườn viết danh sách cấm: rau lá rơi đất thì bỏ, không trộn trái thối",
      "In sẵn giấy miễn trừ và quy tắc giữ gìn cho tập hồ sơ ngày thu hái"
    ],
    [
      "Nhắn một tủ lạnh cộng đồng, kho thực phẩm hay bếp ăn hỏi họ tiêu được bao nhiêu",
      "Hỏi mỗi nơi nhận về sức chứa và giờ nhận hàng, rồi ghi cả hai lại",
      "Ghép mẻ lớn với nơi nhận lớn — kho nhỏ không tiêu nổi 90 kg đào",
      "Chốt ở mỗi nơi nhận một người có tên hẳn hoi, bắt máy vào ngày thu hái"
    ],
    [
      "Tối nay bỏ một cái cân sức khỏe hoặc cân treo vào túi đồ ngày thu hái",
      "Đi một vòng cùng nhà vườn trước và đánh dấu chỗ không được đụng tới",
      "Cân cả mẻ ngay tại vườn trước khi chia — sau này không dựng lại được",
      "Giao trong vài tiếng và nhắn cho mỗi nhà vườn số kg kèm một lời cảm ơn"
    ]
  ],
  "community-mediation": [
    [
      "Tra xem trung tâm hòa giải cộng đồng gần nhất ở đâu và ghi lại cách liên hệ",
      "Gọi hỏi họ về các khóa tập huấn hoặc về việc bắt tay cùng làm",
      "Viết một danh sách ngắn những người điềm tĩnh, công tâm mà bạn dám giao một ca",
      "Hỏi từng người trực tiếp; tìm ai giữ được trung lập cả khi trong bụng không đồng tình",
      "Đặt lịch các buổi tập huấn và chốt ai theo được"
    ],
    [
      "Ghi ra hai lựa chọn cho một đầu mối duy nhất: một email chung hay một số nhận lời nhắn",
      "Dựng cái bạn chọn và tự gửi cho mình một tin nhắn thử",
      "Soạn năm câu hỏi ban đầu, trong đó một câu để lộ nỗi sợ hoặc thế lệch giữa hai bên",
      "Viết ở đầu tờ hỏi chuyện: 'từng bên nói riêng, không bao giờ nói chung'",
      "Chốt ai nhận cuộc gọi ban đầu và bao lâu thì hồi âm"
    ],
    [
      "Gửi email cho thư viện hỏi mượn một phòng họp yên tĩnh",
      "Tới xem có đủ hai lối ra và không có chỗ cho người của một bên đứng chờ không",
      "Chốt rằng phòng đó không thuộc sân nhà bên nào — không phải nhà thờ hay tòa nhà của một bên",
      "Giữ sẵn một phòng thứ hai để lịch hẹn không bao giờ ép bạn nhận phòng xấu"
    ],
    [
      "Viết một câu vào sổ: nhận chuyện gì, chuyển đi chuyện gì",
      "Liệt kê những bất đồng sẽ nhận: tiếng ồn, chỗ dùng chung, va chạm nhỏ giữa hàng xóm",
      "Gọi tên thứ sẽ không đụng tới: mọi chuyện có bạo lực, xâm hại hay nguy hiểm",
      "Dựng ngay danh sách chuyển tiếp: đường dây bạo hành gia đình, luật sư nhà ở, đường dây khủng hoảng",
      "Chia bản phạm vi đã viết cho mọi người hòa giải và người nhận yêu cầu"
    ],
    [
      "Soạn các quy tắc chung thành năm dòng thật gọn trong ứng dụng ghi chú",
      "Quyết ngay bây giờ sẽ làm gì nếu giữa buổi có người kể ra đe dọa hay trẻ bị xâm hại",
      "Viết lời hứa giữ kín kèm đúng giới hạn đó, để không bao giờ hứa quá tay",
      "Dàn thành tờ một trang để người tham gia đọc trước khi bắt đầu"
    ],
    [
      "Nhắn cho một người quản lý nhà cho thuê bạn quen: giờ đã có hòa giải hàng xóm miễn phí",
      "Liệt kê nơi bất đồng nảy ra — ban quản trị, người quản lý, tổ dân phố — rồi ghé từng nơi",
      "Làm một tờ rơi nhỏ ghi rõ: miễn phí, tự nguyện, giữ kín",
      "Nhờ các tổ chức thân quen đưa số của bạn cho cả hai bên của một mâu thuẫn đang nhen"
    ],
    [
      "Mở một ghi chú với ba cột đếm: đã nhận, đã chuyển đi, đã tháo gỡ — không ghi tên ai",
      "Cập nhật ngay sau khi mỗi ca khép lại",
      "Ngồi lại sau mỗi ca khó, chứ không chỉ mỗi tháng một lần",
      "Luân phiên các ca để không ai gánh liền mấy ca nặng",
      "Đặt lịch gặp riêng mỗi tháng với từng người hòa giải, kể cả khi mọi chuyện có vẻ ổn"
    ]
  ],
  "reentry-support": [
    [
      "Ghi năm nơi bạn đã biết: chỗ làm giấy tờ, nhà tạm lánh, cơ quan trợ cấp",
      "Gọi từng nơi để xem còn hoạt động và còn nhận người từng có tiền án không",
      "Ghi tên một người cụ thể ở mỗi nơi, đừng chỉ ghi số máy lễ tân",
      "Hỏi một tổ chức tái hòa nhập xem nơi tuyển dụng và chủ nhà nào làm thật",
      "Thêm ngày 'kiểm lại lần cuối' vào từng dòng trong danh bạ"
    ],
    [
      "Nhắn cho hai người điềm đạm, không phán xét mà bạn dám kể một chuyện khó",
      "Trong mỗi buổi nói chuyện, để ý ai chỉ muốn ra tay sửa chữa — bạn cần người đi cùng",
      "Nhờ một tổ chức tái hòa nhập trong vùng dạy một buổi về hiểu sang chấn cho cả nhóm",
      "Đi qua chuyện giữ kín với từng người trước khi họ gặp bất cứ ai"
    ],
    [
      "Viết câu mở đầu lên một tấm thẻ: 'Ngay lúc này bạn cần gì nhất?'",
      "Giữ tờ khai gọn trong một trang — tên, ba điều cần nhất, cách liên lạc dễ nhất",
      "Tập trước cuộc trò chuyện một lần, nhờ một người đóng vai bên kia",
      "Thống nhất không bao giờ nhắc tới tiền án trừ khi chính người đó nói ra"
    ],
    [
      "Gọi một tổ chức cùng làm, hỏi họ có nhận thư giùm những người bạn đang giúp không",
      "Viết thứ tự ra giấy: địa chỉ nhận thư, giấy khai sinh, giấy tờ tùy thân, rồi trợ cấp",
      "Gom vào một tập những mẫu đơn thật và mức lệ phí thật ở nơi bạn ở",
      "Ngồi cùng từng người suốt bộ hồ sơ đầu tiên, đừng chỉ đưa giấy rồi thôi"
    ],
    [
      "Nhắn cho một nơi tuyển dụng cho cơ hội thứ hai xem tháng này họ còn tuyển không",
      "Giúp viết hồ sơ xin việc một trang, mở đầu bằng sở trường và việc làm gần đây",
      "Cùng nhau tập nói to câu trả lời về quá khứ trước mọi buổi phỏng vấn",
      "Giới thiệu nào cũng ân cần — một cuộc gọi tới người có tên, không phải một đường link",
      "Hỏi han sau mỗi buổi phỏng vấn hay mỗi lần đi xem nhà và ghi lại kết quả"
    ],
    [
      "Hỏi một người đã đi qua chặng trở về xem họ có muốn dìu dắt ai không",
      "Ghép mỗi người dìu dắt với một người thôi, không phải cả một danh sách",
      "Đặt lịch gặp mỗi tháng để chính những người dìu dắt được đỡ lưng",
      "Thống nhất người dìu dắt lo tới đâu và chuyển tiếp cho ai khi vượt quá"
    ],
    [
      "Mở một tài liệu và viết quy tắc đầu tiên: không chia sẻ gì khi người đó chưa đồng ý",
      "Ghi chính xác ai được phép xem hồ sơ và khóa hết những người còn lại",
      "Quyết xem có những điều gì bạn dứt khoát không ghi lại",
      "Chuyển mọi câu hỏi pháp lý cho luật sư đã có tên, đừng bao giờ hỏi chung cả nhóm",
      "Đọc to bản quy tắc cùng mọi người góp một tay trước khi họ bắt đầu"
    ]
  ],
  "community-wood-bank": [
    [
      "Gọi một nhóm cắt tỉa cây trong vùng và hỏi gỗ của họ giờ đi đâu",
      "Ghi thêm các đầu mối khác: đội dọn sau bão, chính quyền địa phương, chủ đất có cây đổ",
      "Tới xem đầu mối tốt nhất và nhìn tận mắt số gỗ — loại cây, cỡ, còn tươi cỡ nào",
      "Xin giấy cho phép ghi rõ bạn được lấy gì và ranh đất chạy tới đâu"
    ],
    [
      "Ghi ba cái sân khả dĩ: sân nhà thờ, một góc trang trại, khoảnh đất quê của một thành viên",
      "Hẹn từng chủ đất cho đi xem một vòng ngay trong tuần này",
      "Đo chỗ cho hai năm củi — đống khô mùa đông này cộng đống hong cho mùa sau",
      "Lúc đi xem, kiểm lối xe tải vào, mức chịu ồn của hàng xóm, và chỗ thoát nước",
      "Xin một cái gật đầu bằng giấy về tiếng cưa, giờ giấc, và củi được để bao lâu"
    ],
    [
      "Viết một danh sách: máy chẻ củi, hai cái cưa, và đồ bảo hộ đủ cho từng người cầm máy",
      "Đăng một lời nhờ cho mượn hoặc cho tặng tới thành viên và các nhóm làm nông, bán củi",
      "Hỏi giá quần chống cưa, kính và bịt tai cho từng người cầm máy — không dùng chung",
      "Nhờ người rành cưa xem lại từng món đồ được tặng trước khi nhận",
      "Sắm một túi sơ cứu và để tất cả vào một chỗ có dán nhãn tại sân"
    ],
    [
      "Nhắn cho thành viên và hàng xóm hỏi ai từng cầm cưa máy thật sự",
      "Chỉ định một người có kinh nghiệm làm đầu mối an toàn, nắm quyền quyết làm hay dừng",
      "Hỏi trạm khuyến nông hay một người thợ cưa về một khóa an toàn cưa máy cơ bản",
      "Chia tổ: người đã tập huấn cầm cưa, những người khác xếp và khuân",
      "Viết sẵn bài dặn dò an toàn năm phút để nói trước mỗi ngày chung tay"
    ],
    [
      "Nhắn vào nhóm hỏi số điện thoại của ai sẽ nhận các lời xin củi",
      "Lúc nhận yêu cầu, hỏi củi để ở đâu và có lối đi khô ráo, thông thoáng không",
      "Liệt kê thành viên có xe tải và ghép mỗi người vào một ngày giao củi",
      "Gọi cho nơi lo trợ cấp chất đốt và nhờ họ chuyển số của bạn tới các hộ",
      "Tự tay xếp chuyến củi đầu tiên để biết một hộ mất bao lâu"
    ],
    [
      "Nhắn hai hộ đang sưởi bằng củi hỏi một tháng rét họ đốt hết bao nhiêu",
      "Phác phần củi bằng thứ đo được — số khối hay số tuần sưởi ấm, đừng nói 'một xe'",
      "Viết ai được trước: người già, người đau bệnh, nhà có trẻ nhỏ, nhà không còn cách sưởi khác",
      "Hỏi thật ít — không giấy tờ, không chứng minh, chỉ tên, địa chỉ và loại bếp sưởi",
      "Ghi vào lịch một lần hỏi han giữa mùa đông cho những hộ từng bị hụt củi"
    ],
    [
      "Đếm ngược từ tháng Mười Một: đánh dấu hạn chót mùa xuân để cưa củi cho mùa đông này",
      "Ghi hai ngày chung tay đầu tiên vào lịch và mời tổ đã được tập huấn",
      "Mở một cuốn sổ đơn giản cho từng đống: ngày chẻ, loại gỗ, ngày dùng được",
      "Dán nhãn đống nào đã khô, đống nào còn tươi để không ai vội mà giao nhầm củi ướt",
      "Đặt nhắc mỗi tháng để cập nhật sổ và chốt ngày chung tay kế tiếp"
    ]
  ],
  "community-wifi-mesh": [
    [
      "In hoặc vẽ tay một tấm bản đồ các dãy phố bạn muốn phủ sóng",
      "Cầm bản đồ đi bộ qua từng dãy, đánh dấu cây cối, tường gạch và nhà cao tầng",
      "Gõ cửa hỏi nhà nào chưa có mạng và họ sẽ dùng mạng vào việc gì",
      "Đánh dấu sao những mái nhà, cửa sổ tầng trên nhìn thẳng được và chủ nhà dễ chịu",
      "Chụp lại tấm bản đồ đã đánh dấu và gửi cho cả nhóm"
    ],
    [
      "Ghi ba nơi có thể dư một đường: một cửa hàng, thư viện, một nhà mạng dễ nói chuyện",
      "Hôm nay gửi email hoặc ghé một nơi và hỏi thẳng chuyện chia băng thông cho hàng xóm",
      "Tự bạn đọc điều khoản của gói mạng xem có cấm chia lại không",
      "Lấy được văn bản cho phép chia lại rồi mới tiêu một đồng nào cho thiết bị"
    ],
    [
      "Nhắn cho hai người quen tay với mạng nhất mà bạn biết và xin họ một tiếng đồng hồ",
      "Đăng một lời nhờ lên các nhóm công nghệ, nhóm chế đồ hay nhóm radio nghiệp dư",
      "Nhắm hai người quản trị khác nghề và khác nhà, cộng thêm một người chịu học",
      "Làm một buổi khởi động ngắn để mỗi người quản trị tự tay đăng nhập vào router thử"
    ],
    [
      "Đăng một lời nhờ xin router cũ còn dùng được lên các nhóm và nhóm chat trong vùng",
      "Liệt kê số điểm phát và ăng ten mà bản đồ đòi, rồi hỏi giá phần không xin được",
      "Đặt mật khẩu quản trị mạnh cho từng router và cất vào kho mật khẩu chung",
      "Cấu hình từng điểm phát ngay trên bàn và dán nhãn nơi sẽ lắp",
      "Thử hai điểm phát bắt mesh với nhau qua chính con đường nhà bạn trước khi leo mái"
    ],
    [
      "Nhắn cho ba chỗ dễ chịu nhất đã đánh dấu sao trên bản đồ để xin ghé xem",
      "Ghé từng nơi, cầm theo một điểm phát, kiểm nguồn điện, chỗ gắn và hướng sóng",
      "Soạn tờ thỏa thuận một trang: lên mái, tiền điện, ai chịu khi máy hỏng",
      "Ký với từng chủ nhà và ngỏ ý trả giúp vài đô tiền điện mỗi tháng"
    ],
    [
      "Mở một trang trắng và viết quy tắc số một: mạng này dựng lên để làm gì",
      "Thêm lời hứa không ghi lại hoạt động và một dòng rằng mạng mở thì không kín đáo",
      "Tắt ghi log trong cài đặt từng router và nhờ người quản trị thứ hai kiểm lại",
      "Thêm một dòng chỉ cách tự giữ an toàn cho mỗi người: dùng HTTPS và VPN",
      "Dán trang đó ở các nhà cho đặt máy và để làm trang chào của mạng"
    ],
    [
      "Đặt nhắc trên điện thoại mỗi tháng để đi kiểm từng điểm phát",
      "Dán nhãn cho mỗi điểm phát ghi vị trí và ngày kiểm",
      "Giữ sẵn một router dự phòng đã cấu hình và sạc đầy để thay chỉ mất vài phút",
      "Vừa làm vừa viết tài liệu, rồi nhờ người quản trị thứ hai làm theo một lần khi vắng bạn",
      "Giữ danh sách chờ các nhà cho đặt máy và thêm một điểm phát mỗi khi mạng chạy êm"
    ]
  ],
  "mental-health-peer-support": [
    [
      "Nhắn cho hai người ấm áp, vững vàng mà bạn quen, hỏi họ có nhận dẫn dắt không",
      "Tìm một khóa học gần nhà về cùng cảnh nâng đỡ hoặc lắng nghe chủ động và ghi ngày",
      "Hỏi từng người xem họ xoay xở ra sao khi cả phòng lặng đi sau một lời tâm sự nặng",
      "Nhẹ nhàng khoan mời những ai còn đang rát lòng vì khủng hoảng của chính mình",
      "Đặt lịch khóa học và chốt cả hai người dẫn dắt dự được mọi buổi"
    ],
    [
      "Hẹn giờ 20 phút và viết nháp những điều vòng tròn sẽ không làm",
      "Viết ranh giới thành lệnh cấm: không chẩn đoán, không sửa chữa ai, không thay trị liệu",
      "Thêm ba dòng thật giản dị về điều nó là: lắng nghe, có nhau, cùng một trải nghiệm",
      "Đọc to bản nháp cho một người dẫn dắt nghe và cắt hết chỗ họ vấp"
    ],
    [
      "Tra đường dây khủng hoảng gần nhà và phòng khám không cần hẹn gần nhất; lưu cả hai số",
      "Tự bạn gọi từng số để xem còn hoạt động không và ghi lại giờ trực",
      "Viết các bước xử lý giữa buổi: tạm dừng nhóm, ra chỗ riêng, trao tay ân cần",
      "In một bản cho từng người dẫn dắt — cái đêm cần tới nó, mạng có thể rớt"
    ],
    [
      "Ghi ba căn phòng khả dĩ: thư viện, một nơi thờ tự, một nhà văn hóa",
      "Tới xem phòng ưng nhất, kiểm cửa có đóng được và không có vách kính",
      "Hỏi chủ nhà xem giờ đó còn ai dùng tòa nhà nữa",
      "Giữ cùng phòng, cùng giờ, mỗi tuần — sự đều đặn giúp người ta quay lại"
    ],
    [
      "Ghi ra năm quy tắc bạn đã biết là cần, bắt đầu bằng chuyện giữ kín",
      "Thêm quyền xin bỏ lượt và không khuyên bảo trừ khi có người hỏi",
      "Nhờ cả hai người dẫn dắt viết lại bản nháp bằng lời giản dị hơn",
      "In cỡ chữ đủ lớn để đọc to lên vào đầu mỗi buổi"
    ],
    [
      "Nhắn cho người dẫn dắt đúng một câu hỏi: tối nào trong tuần bạn giữ được suốt sáu tháng",
      "Tránh tối thứ Sáu và giờ vừa tan làm — chọn một giờ dễ chịu hơn",
      "Viết một lời giới thiệu không định kiến: miễn phí, người cùng cảnh dẫn dắt, không cần chẩn đoán",
      "Gửi tới các phòng khám, nhóm tôn giáo và bảng tin của cộng đồng",
      "Quyết ngay từ giờ mức trần khoảng tám người và cách xoay xở khi đông hơn"
    ],
    [
      "Ghi ngay vào lịch một buổi gặp người dẫn dắt mỗi tháng",
      "Gặp ở đâu đó không phải căn phòng của vòng tròn — quán cà phê cũng được",
      "Hỏi từng người dẫn dắt xem khoảnh khắc nào trong buổi còn đọng lại trong họ",
      "Xếp lịch luân phiên để không ai dẫn ba buổi liền",
      "Để mắt tới người không vắng buổi nào và chẳng nghỉ bao giờ — mời họ nghỉ trước tiên"
    ]
  ],
  "community-cleanup": [
    [
      "Hôm nay trên đường về nhà, chụp một tấm chỗ bừa bộn nhất bạn đi qua",
      "Đi thêm hai dãy nhà và chụp mọi góc đường cần được dọn",
      "Hỏi hai người sống gần đó xem khu đất nào làm họ khó chịu nhất và của ai",
      "Ghé lại các điểm đứng đầu vào giờ khác — sáng và tối kể hai câu chuyện khác nhau",
      "Xếp hạng danh sách theo mức tác động và mức làm xong được trong một ngày"
    ],
    [
      "Tra chủ khu đất đứng đầu trên bản đồ địa chính hoặc hỏi một người sống lâu năm",
      "Gọi hoặc viết thư xin chủ đất cho phép bằng văn bản, kèm ngày bạn đang tính",
      "Gọi cho chính quyền địa phương hỏi chuyến thu gom lớn và ghi lại mã số họ cho",
      "Nếu bên đó không lo được, hỏi giá thuê thùng rác lớn và chốt ngày đưa đến, ngày chở đi bằng văn bản"
    ],
    [
      "Hỏi nhóm chat của xóm xem ai sẵn có găng tay, kẹp gắp và áo phản quang",
      "Mua một hộp cứng đựng vật sắc nhọn và hai đôi găng tay chống đâm thủng",
      "Đối chiếu số bao rác và găng tay với danh sách ghi tên rồi mua bù trong một chuyến",
      "Xếp hết vào thùng có dán nhãn từ tối hôm trước, hộp vật sắc nhọn để trên cùng"
    ],
    [
      "Đăng ngay ngày, chỗ hẹn và giờ lên hai kênh của khu phố",
      "Giữ một danh sách ghi tên và rủ dư ra một phần ba so với số bạn nghĩ là cần",
      "Nhờ ba người chắc chắn làm trưởng nhóm và xác nhận từng người bằng tên",
      "Vẽ phác khu đất thành từng khu và giao cho mỗi trưởng nhóm một khu trước ngày hẹn"
    ],
    [
      "Tối nay viết tấm thẻ dặn dò: khu, trưởng nhóm, nước uống, không nhặt kim tiêm bằng tay",
      "Đến sớm và chụp ảnh “trước” từ một chỗ bạn có thể đứng lại đúng vậy",
      "Đọc tấm thẻ dặn dò cho mọi người nghe, rồi tiễn từng nhóm ra khu của mình cùng trưởng nhóm",
      "Giữa buổi sáng đi một vòng các khu, tiếp thêm bao rác, nước uống và lời động viên",
      "Chụp ảnh “sau” từ đúng chỗ cũ, chia sẻ cặp ảnh, và chốt ngày lần tới"
    ]
  ],
  "free-tax-prep": [
    [
      "Tra ngày cấp chứng nhận VITA năm nay và nơi mở lớp",
      "Hỏi ba người muốn làm người khai thuế xem có theo trọn khóa học được không",
      "Ghi tên tất cả trước khi hết mùa thu — lấy chứng nhận mất mấy tuần, không phải mấy ngày",
      "Hẹn một buổi ôn bài chung trước kỳ thi lấy chứng nhận"
    ],
    [
      "Tìm email của người điều phối khai thuế miễn phí trong vùng và gửi hai dòng chào hỏi",
      "Hẹn một cuộc gọi và hỏi điểm khai thuế mới cần gì: phần mềm, quy định, khâu soát chất lượng",
      "Ghi lại lịch trình của họ trước khi hẹn ngày mở cửa với bất kỳ ai",
      "Gửi lại giấy tờ họ cần để ghi bạn thành một điểm khai thuế"
    ],
    [
      "Nhắn tin cho hai nơi có phòng và Wi-Fi — một thư viện, một nhà văn hóa",
      "Đo tốc độ mạng bằng điện thoại ở từng nơi; phần mềm đứng hình khi tải lên yếu",
      "Đếm ổ điện và bàn, và xem ghế có kê xa nhau được để giữ kín đáo không",
      "Giữ chỗ cho trọn mùa khai thuế, đừng đặt từng tuần một"
    ],
    [
      "Xin chương trình bạn kết nối danh sách giấy tờ bắt buộc chuẩn của họ",
      "Chọn cách đặt hẹn mà gọi điện thoại cũng làm được, không chỉ qua mạng",
      "Đưa danh sách giấy tờ vào mọi tin xác nhận và mọi lời nhắc",
      "Tự đặt thử một cuộc hẹn và sửa chỗ nào gây khó hiểu"
    ],
    [
      "Viết một câu — “Khai thuế miễn phí; biết đâu bạn được trả lại tiền” — rồi thử với một người bạn",
      "In tờ rơi có ngày, địa điểm, và danh sách giấy tờ ở mặt sau",
      "Đưa tờ rơi tới nơi người lao động hay lui tới: tiệm giặt, tạp hóa đầu ngõ, trạm xe buýt",
      "Hướng việc báo tin tới những người nghĩ mình kiếm quá ít nên khỏi khai"
    ],
    [
      "Liệt kê mọi chỗ dữ liệu của người đến có thể nằm: máy tính, ổ cứng, chồng giấy",
      "Viết quy định lưu giữ: không mang gì về nhà, và một ngày cố định để hủy giấy",
      "Đặt hẹn giờ khóa màn hình và tài khoản riêng trên từng máy tính tại điểm khai thuế",
      "Kiếm một hộp có khóa để đựng giấy và một máy hủy giấy cho ngày hủy hồ sơ"
    ],
    [
      "Ghi ba nơi có thể giới thiệu tới: rà soát trợ cấp, ngân hàng an toàn, kế hoạch chi tiêu",
      "Gọi từng nơi xác nhận họ còn nhận người và cách giới thiệu một người sang",
      "Làm một tấm thẻ nhỏ mang về, chỉ đưa khi tờ khai đã xong — đừng đưa ngay tại bàn",
      "Thống nhất với người khai thuế một câu duy nhất để mời, không quảng cáo gì thêm"
    ]
  ],
  "community-market": [
    [
      "Ghi ba nguồn có thể: một nhà vườn, một tiệm tạp hóa, một vườn cộng đồng",
      "Ghé từng nơi và hỏi họ thật sự dư bao nhiêu và dư theo nhịp nào",
      "Chốt bằng văn bản ngày và lượng hàng ước chừng của từng nơi, không nhận “khi nào dư thì báo”",
      "Thêm một nguồn dự phòng để một tuần xui không làm sạp trống trơn"
    ],
    [
      "Ghi ra hai ba chỗ có thể đặt sạp, nơi bà con vốn đã đi qua",
      "Ghé từng chỗ đúng vào giờ chợ họp và đếm xem bao nhiêu người đi ngang",
      "Xem gần đó có bóng mát và chỗ lấy nước không",
      "Xin phép người trông coi chỗ đó và giữ lại bằng tin nhắn hoặc email",
      "Gom bàn, một mái che và một tấm bảng đơn giản"
    ],
    [
      "Nhắn nhóm nòng cốt hẹn một buổi bàn bạc hai mươi phút",
      "Bàn cho ra miễn phí, trả tùy khả năng hay pha cả hai, và “không từ chối ai” nghĩa là gì",
      "Nếu trả tùy khả năng, thống nhất một chiếc hộp trơn, không dán giá gợi ý",
      "Ghi lựa chọn ra thành một câu ai đứng sạp cũng nhắc lại được"
    ],
    [
      "Nhắn một tin cho cả nhóm hỏi ai sẵn có thùng đá, bàn và túi đá gel",
      "Chuẩn bị thùng đá và đá cho mọi thứ rau lá hay đã cắt sẵn",
      "Tính chỗ che nắng cho rau trái: một mái che hoặc phía râm của bãi đất",
      "Thống nhất với cả nhóm lằn ranh bỏ đi: chưa chắc thì đem ủ phân"
    ],
    [
      "Nhắn ba người chắc chắn và hỏi họ muốn nhận phần việc nào ở buổi chợ",
      "Lấp trước những phần không hào nhoáng: chuyến xe lấy hàng sớm và buổi dọn sạp",
      "Đặt một người dự phòng cho mỗi vai để một người vắng không làm hủy buổi chợ",
      "Dán bảng phân vai chỗ ai cũng thấy và xác nhận lại hai ngày trước mỗi buổi chợ"
    ],
    [
      "Nhắn cả nhóm hai lựa chọn ngày giờ và xin mọi người bầu nhanh",
      "Làm một tờ rơi đơn giản có ngày, giờ, địa điểm và “miễn phí, ai đến cũng quý”",
      "Dán nó nơi bà con vốn đi qua: tiệm giặt, trạm xe buýt, tạp hóa đầu ngõ",
      "Nói tận nơi cho những hàng xóm bạn gặp lúc đi tìm chỗ",
      "Đặt buổi chợ thành sự kiện lặp lại trong lịch chung, kể cả tuần thưa hàng"
    ],
    [
      "Trước ngày chợ, nhắn một tủ lạnh chung, kho thực phẩm hay bếp ăn nhận phần còn dư",
      "Đến sớm để kê bàn, dựng mái che và xếp thùng đá",
      "Đón mọi người thật ấm áp, bỏ hết giấy tờ, câu hỏi và việc phân loại ai cả",
      "Xong buổi, chở thẳng phần dư tới chỗ đã hẹn",
      "Ghi lại món nào hết sạch và món nào còn, để tính cho tuần sau"
    ]
  ],
  "welcome-wagon": [
    [
      "Nhắn hai ba hàng xóm đang quan tâm để hẹn giờ nói chuyện trong tuần này",
      "Cùng nhau chọn phạm vi: người mới dọn tới, cha mẹ mới sinh con, hay cả hai",
      "Thống nhất lần tiếp xúc đầu là một mẩu giấy nhắn hay cuộc gọi — không gõ cửa bất ngờ",
      "Viết lời mời gọn một dòng để người ta nói có hay không đều dễ"
    ],
    [
      "Mở một danh sách trên điện thoại: phòng khám, xe cộ, trường học, chỗ xin đồ ăn, chương trình của bạn",
      "Gọi hoặc kiểm tra từng mục để chắc chắn giờ giấc và địa chỉ còn đúng",
      "Ghi ngày và một địa chỉ liên lạc “có gì đổi thì báo về đây” lên trang đầu",
      "Nhờ một hàng xóm biết hai thứ tiếng dịch sang những tiếng người quanh đây đang nói"
    ],
    [
      "Đăng một lời nhờ lên nhóm chat của xóm, xin gạo mắm muối và đồ dùng trong nhà",
      "Chọn một chỗ để gói và chốt ngày sắp năm giỏ đầu tiên",
      "Chọn đồ khô để được lâu và không mùi thơm, trừ khi bạn biết rõ nhà đó",
      "Nhét tập thông tin và một lời chào viết tay vào mỗi giỏ"
    ],
    [
      "Nhắn hai người dễ mến nhất bạn quen và nhờ họ đi chào đón",
      "Gặp nhau một tiếng và tập đóng vai một lần ghé cửa",
      "Tập bản ngắn: đưa giỏ đồ, nói một cách liên lạc với mình, rồi đi",
      "Thống nhất dấu hiệu “người này muốn được yên” và tôn trọng nó"
    ],
    [
      "Ghi ra những nơi gặp người mới trước tiên: chủ nhà trọ, trường học, phòng khám, nữ hộ sinh",
      "Ghé hoặc gọi từng nơi và kể về chương trình chào đón trong hai phút",
      "Nhờ họ xin người mới đồng ý trước khi chuyền bất kỳ cái tên nào sang",
      "Làm một mẫu ghi tên đơn giản và để lại vài bản ở bàn của từng nơi"
    ]
  ],
  "library-of-things": [
    [
      "Gõ mười món có thể có vào ứng dụng ghi chú: bàn, lều, máy giặt thảm, máy khoan",
      "Thêm một dòng để trống và câu hỏi: trong năm vừa rồi bạn đã cần dùng món gì?",
      "Đăng bản hỏi ý lên bảng tin và đưa năm bản giấy cho năm hàng xóm",
      "Sau một tuần đếm câu trả lời và xếp hạng mười món được hỏi nhiều nhất"
    ],
    [
      "Nhắn thư viện công cộng hay nhà văn hóa hỏi xem có tủ hay phòng trống không",
      "Đo hai món cồng kềnh nhất trong danh sách — chúng quyết định chỗ bạn cần",
      "Ghé xem chỗ tốt nhất, mang theo thước dây và đo cả bề rộng cửa ra vào",
      "Thống nhất giờ lấy và trả mà nơi cho gửi nhờ giữ được lâu dài, rồi ghi lại"
    ],
    [
      "Đăng danh sách mười món cần nhất — chứ không phải lời kêu gọi nhận mọi thứ",
      "Chốt một ngày nhận đồ và dặn người cho mang kèm dây, túi và phụ kiện",
      "Cắm điện và chạy thử từng món điện trước khi cho nó một chỗ trên kệ",
      "Đối chiếu đồ có mô tơ và đồ trẻ em với danh sách thu hồi (CPSC)",
      "Đóng thùng những món loại ra để bỏ đi ngay trong ngày, đừng để chất đống"
    ],
    [
      "Đánh số hai mươi nhãn băng keo giấy và dán cái đầu tiên lên một món",
      "Chụp từng món ngay bên cạnh số hiệu của nó, chỗ đủ sáng",
      "Ghi số, tên, tình trạng và ảnh — mỗi món một dòng trong bảng tính",
      "Cho phụ kiện — túi, dây, đầu gắn — những dòng đánh số riêng của chúng"
    ],
    [
      "Ghi năm món được hỏi nhiều nhất và đoán mỗi món quay vòng nhanh cỡ nào",
      "Định thời hạn theo từng món: máy chiếu một cuối tuần, máy giặt thảm một tuần",
      "Viết một lệ trả trễ dễ thở — một lời nhắc thân tình, không bao giờ phạt tiền",
      "Ghi một dòng cho biết món nào cần giữ gìn hay lau rửa thêm lúc trả về",
      "Nhờ một người trông thư viện đọc lệ mượn và cắt bớt chỗ nào khó hiểu"
    ],
    [
      "Kẻ một tờ ghi mượn bốn cột: tên, cách liên lạc, món đồ, ngày hẹn trả",
      "Thêm bước ai cũng bỏ qua: chụp ảnh tình trạng lúc cho mượn và lúc nhận về",
      "Dắt cả hai người trông thư viện qua một lần mượn thử, từ đầu tới cuối",
      "Xem từng người tự chạy một lần cho mượn trước ngày mở cửa"
    ],
    [
      "Dán một tờ “những thứ được hỏi mà chưa có” cạnh tờ ghi mượn",
      "Lau chùi và soi lại từng món được trả về ngay trong ngày, đừng dồn thành đợt",
      "Đặt một giờ sửa đồ mỗi tháng và để những món sửa được ở chỗ bạn nhìn thấy",
      "Mua hoặc lùng cho ra món đứng đầu danh sách chưa có — chứ không theo phỏng đoán của bạn"
    ]
  ],
  "laundry-shower-access": [
    [
      "Ghi ba nơi có thể cho mượn chỗ: một tiệm giặt, một phòng tập, một nơi thờ tự có nhà tắm",
      "Gọi cho nơi dễ chịu nhất và xin ghé thăm mười lăm phút trong tuần này",
      "Đi thử đường từ chỗ ngồi chờ tới cửa phòng tắm — có thật sự kín đáo không?",
      "Nói thẳng với chủ nơi đó ai sẽ đến và nhóm bạn sẽ lo dọn dẹp những gì",
      "Xác nhận lại ngày giờ và các điều đã thống nhất bằng một tin nhắn hay email"
    ],
    [
      "Viết danh sách cần có: xà phòng giặt, khăn, xà bông, dầu gội, dép nhựa",
      "Ghi ngay trong lời kêu gọi tặng đồ: xin loại chai nhỏ đi đường và không mùi thơm",
      "Gọi một nhóm tôn giáo hoặc một cửa hàng hỏi xem có lo giúp tháng đầu được không",
      "Gói đồ nhận được thành từng bộ đi tắm — mỗi người một túi, sẵn sàng trao tay"
    ],
    [
      "Nhắn nơi cho mượn chỗ xác nhận mỗi buổi bạn được bao nhiêu máy giặt và nhà tắm",
      "Làm một tờ ghi tên bằng giấy chỉ hỏi tên gọi — hoặc không hỏi gì cả",
      "Chốt lệ chia lượt cho công bằng — ai tới trước, người quen, hay pha cả hai — rồi dán lên",
      "Chạy thử một buổi bằng giấy trước khi thử thứ gì cầu kỳ hơn"
    ],
    [
      "Hỏi nơi cho mượn chỗ họ yêu cầu dùng những thứ tẩy rửa nào giữa các lượt",
      "Bấm giờ một lần dọn buồng tắm trọn vẹn: khử khuẩn, lau sàn, khăn mới",
      "Tính số phút đó vào từng lượt để không ai phải bước vào buồng tắm bẩn",
      "Viết nếp dọn thành một bảng kiểm và dán bên trong tủ đựng đồ dùng",
      "Thống nhất với nơi cho mượn chỗ ai lo tiếp đồ và ai lo khi hỏng đường nước"
    ],
    [
      "Nhắn ba người điềm tĩnh, kiên nhẫn mà bạn tin có thể ngồi bàn tiếp đón",
      "Kèm từng người mới qua trọn một buổi trước khi để họ tự lo khâu tiếp đón",
      "Cùng tập những tình huống khó xử: có người say, một lượt kéo quá giờ",
      "Thống nhất gọi ai trước — để không ai hoảng lên gọi thẳng nơi cho mượn chỗ",
      "Nói rõ tinh thần: đón người ta như ở một khách sạn, không phải như ở phòng khám"
    ],
    [
      "Nhắn những người góp một tay một câu hỏi: giờ nào mỗi tuần bạn giữ được suốt sáu tháng",
      "Chốt lịch theo mức giữ được lâu dài, chứ không theo mức nghe cho oai",
      "In những tấm thẻ đơn giản ghi giờ và địa điểm — không nhắc tới giấy tờ nào cả",
      "Đưa thẻ cho người làm việc ngoài đường phố, các nhà tạm trú và hàng xóm đang sống ngoài đường",
      "Giữ nguyên khung giờ — chỉ một tuần đổi giờ đã dạy người ta rằng cửa có thể khóa"
    ]
  ],
  "voter-registration": [
    [
      "Tra ngay số điện thoại và email của cơ quan phụ trách bầu cử ở chỗ bạn",
      "Gọi hỏi ở địa phương một đợt đăng ký cử tri được làm gì và không được làm gì",
      "Ghi lại chính xác hạn chót nộp đơn và ai là người được phép nộp",
      "Hỏi xem người góp một tay có phải tập huấn hay ghi danh trước khi đặt bàn không",
      "Gửi email cho một nhóm phi đảng phái lâu năm để mượn tài liệu và xin lời khuyên"
    ],
    [
      "Hôm nay nhắn cho mọi người hai khung giờ có thể tập huấn một tiếng",
      "Viết câu trả lời sẵn cho “tôi nên bầu cho ai?” lên thẻ cho từng người",
      "Cùng nhau đi qua một tờ đơn đăng ký thật, từng ô một",
      "Tập đóng vai một câu hỏi chính trị dồn ép cho tới khi câu trả lời trung lập bật ra dễ dàng"
    ],
    [
      "Mở trang chính thức của cơ quan phụ trách bầu cử và lưu lại",
      "In thời hạn, quy định giấy tùy thân và thông tin bỏ phiếu thẳng từ trang đó",
      "Ghi ngày hôm nay lên mỗi bản in để dễ nhận ra bản cũ",
      "Tới ngay cơ quan phụ trách bầu cử lấy đơn đăng ký trắng"
    ],
    [
      "Ghi năm chỗ mà những người đủ điều kiện vốn đã tụ về — chợ, bến xe, trường học",
      "Nhắn người quản lý từng chỗ xin phép được đặt một cái bàn",
      "Xin cái gật đầu bằng văn bản, dù chỉ là một email, trước khi xếp lịch trực",
      "Ghép từng chỗ đã chốt vào một ngày và một giờ trên lịch"
    ],
    [
      "Viết danh sách đồ mang theo lên điện thoại: đơn, bút, bìa kẹp, tờ thông tin có ghi ngày",
      "Xếp sẵn túi đồ từ tối hôm trước và để cạnh cửa",
      "Nêu tên một người giữ cặp hồ sơ dán kín đựng đơn đã điền suốt buổi",
      "Đọc lại từng tờ đơn cùng người vừa đăng ký trước khi họ rời bàn",
      "Mang cặp hồ sơ tới cơ quan phụ trách bầu cử ngay trong ngày, còn xa hạn chót"
    ],
    [
      "Tra đường dẫn chính thức để tìm điểm bỏ phiếu và lưu vào điện thoại",
      "Soạn một tấm thẻ bỏ túi: ngày bầu cử, đường dẫn tra cứu đó, hạn bỏ phiếu qua bưu điện",
      "In một xấp và để trong túi đồ đặt bàn, ngay cạnh xấp đơn",
      "Đưa cho mỗi người vừa đăng ký một tấm và hỏi họ có cần ai chở đi bầu không"
    ]
  ],
  "health-navigation": [
    [
      "Tìm “phòng khám miễn phí gần đây” và dán ba kết quả đầu vào một tài liệu",
      "Gọi từng nơi hỏi đường dây tiếp nhận trực tiếp và điều kiện nhận bệnh hiện thời",
      "Thêm cột ngôn ngữ, có thu phí theo khả năng chi trả không, và ngày bạn kiểm chứng từng mục",
      "Đặt một lời nhắc lặp lại để soi lại từng mục trước khi nó cũ đi"
    ],
    [
      "Nhắn ba người kiên nhẫn, ngăn nắp bạn quen và hỏi họ có làm người dẫn đường không",
      "Viết ranh giới thành một dòng: đi lại giấy tờ thì có, lời khuyên y khoa thì không bao giờ",
      "Tập cho thuộc đúng câu: “tôi không phải người làm y tế — để tôi nối bạn với đường dây điều dưỡng”",
      "Đóng vai một cuộc gọi của người đang sợ hãi với từng người dẫn đường mới"
    ],
    [
      "Hỏi nhóm chat xem tháng này ai cho mượn được một số điện thoại để tiếp nhận",
      "Cài lời chào hộp thư thoại thật ấm áp, bằng những thứ tiếng bạn phục vụ",
      "Thêm một lối gặp trực tiếp: giờ cố định ở thư viện hay nhà văn hóa",
      "Chốt những gì sẽ không bao giờ ghi lại — bệnh gì, tình trạng cư trú — trước cuộc gọi đầu tiên"
    ],
    [
      "Hôm nay tra xem kỳ đăng ký mở ở vùng bạn có đang mở hay không",
      "In danh sách giấy tờ người ta cần: chứng minh thu nhập, số người trong nhà, giấy tùy thân",
      "Cùng từng người gom đủ giấy tờ trước khi mở hồ sơ cho họ",
      "Tìm một người có chứng nhận về khâu đăng ký để đi kèm trong ca đầu tiên của bạn"
    ],
    [
      "Lưu ngay số liên lạc của chương trình đưa đón vào điện thoại",
      "Hỏi chuyện đi lại ngay trong cuộc gọi đặt lịch hẹn",
      "Đặt một tin nhắn nhắc trước một ngày cho mọi lịch hẹn bạn đặt",
      "Tra hai chương trình giảm giá thuốc và ghi sẵn vào một tấm thẻ"
    ],
    [
      "Viết lệ số một lên một tờ giấy nhớ: lấy tối thiểu, chưa đồng ý thì không chia sẻ",
      "Liệt kê những gì khâu tiếp nhận thật sự cần và cắt hết phần còn lại",
      "Chọn một chỗ có khóa duy nhất — ngoài đời hay đã mã hóa — để cất ghi chép",
      "Đi lại các lệ này với từng người dẫn đường trước cuộc gọi đầu tiên của họ"
    ],
    [
      "Gửi email cho một phòng khám xin mười lăm phút với người phụ trách tiếp nhận",
      "Ghé thăm và hỏi loại giới thiệu nào thật sự giúp được họ và loại nào làm họ quá tải",
      "Cho họ một người liên lạc có tên bên phía bạn để trao tay cho ấm",
      "Hẹn mỗi quý gặp lại một lần để nghe tin về những nơi khám chữa giá rẻ mới mở"
    ]
  ],
  "toy-library": [
    [
      "Nhắn cho nhà văn hóa hay thư viện khu phố hỏi xin một cái kệ trống",
      "Đến tận nơi với một chiếc xe đẩy, xem lối vào — không bậc thang, có chỗ để xe",
      "Hỏi ba cha mẹ lúc đón con: hai khung giờ nào trong tuần họ đi được",
      "Xác nhận cái kệ nằm vừa tầm trẻ và dán bảng giờ mở cửa lên đó"
    ],
    [
      "Lưu sẵn trang thu hồi sản phẩm (CPSC) vào điện thoại của bạn",
      "Đặt một thùng nhận đồ tặng có dán nhãn ngay chỗ cất giữ",
      "Đối chiếu từng món đồ chơi được tặng với danh sách thu hồi trước tiên",
      "Thả chi tiết nhỏ qua lõi giấy vệ sinh; lọt qua thì để riêng khỏi trẻ dưới ba tuổi",
      "Rửa và hong khô từng món giữ lại, bỏ đi món nứt vỡ hay thiếu chi tiết"
    ],
    [
      "Hỏi trong nhóm chat của cộng đồng xin túi zip và một cây bút lông dầu",
      "Chụp ảnh từng món cạnh số của nó và ghi kèm độ tuổi phù hợp",
      "Đếm mảnh của bộ nhiều chi tiết khi cho vào túi và ghi số lên nhãn",
      "Xếp túi lên kệ với nhãn quay ra để lúc trả là thấy ngay số mảnh"
    ],
    [
      "Tìm đọc quy ước mượn của một thư viện đồ chơi khác để lấy chỗ bắt đầu",
      "Viết nháp thời hạn mượn và mỗi nhà mượn mấy món, bằng lời thật giản dị",
      "Viết quy ước thiếu mảnh thành một câu tử tế — không phạt, chỉ cần báo một tiếng",
      "Nhờ hai cha mẹ đọc thử và chỉ ra chỗ nào nghe như đang mắng"
    ],
    [
      "In năm tờ phiếu mượn trống: tên, liên lạc, số món đồ, ngày trả",
      "Dẫn từng người trực làm thử một lượt cho mượn và một lượt nhận trả",
      "Gộp việc đếm mảnh và lau nhanh vào chính bước nhận đồ trả về",
      "Dán nếp lau rửa và các quy ước ngay chỗ người trực ngồi"
    ]
  ],
  "food-preservation": [
    [
      "Nhắn cho một hội trường nhà thờ hay nhà văn hóa hỏi mượn bếp",
      "Đến xem: bếp có chịu nổi một nồi đầy và có sôi bùng lên được không",
      "Xem mặt bàn, bồn rửa, và một góc để hũ nóng nguội yên không ai đụng",
      "Đặt ngày theo lúc mùa vụ rộ, đừng theo lúc căn phòng trống"
    ],
    [
      "Tải bản Hướng dẫn đầy đủ hiện hành của USDA hay của khuyến nông vùng bạn",
      "Xem năm phát hành và ghi năm đó lên bìa",
      "Gọi cơ quan khuyến nông, nhờ chỉ việc cho người dẫn dắt hay xem lại kế hoạch",
      "Thống nhất giữa những người dẫn dắt: chỉ công thức đã kiểm chứng, không nhân lên"
    ],
    [
      "Đăng một lời nhờ xin nồi, hũ và vòng vặn trong một nhóm địa phương bạn đã ở",
      "Đặt lịch kiểm định đồng hồ cho từng nồi áp suất ở khuyến nông — thường miễn phí",
      "Rà ngón tay quanh miệng từng cái hũ được tặng và loại hết hũ bị mẻ",
      "Mua nắp mới cho mọi hũ đã tính dùng và ghi lại còn thiếu vòng vặn, dụng cụ nào"
    ],
    [
      "Nhắn cho một người trồng vườn hay người đi mót hỏi sắp tới thứ gì rộ",
      "Phác nhanh một lịch mùa vụ: thứ gì về ào ạt, vào những tuần nào",
      "Chốt với từng nguồn một lượng cụ thể cho một ngày làm cụ thể",
      "Hẹn lấy hàng trong một hai ngày sau khi hái để không thứ gì nằm chờ mà mềm đi"
    ],
    [
      "Nhắn hỏi cả nhóm ai từng đóng hũ rồi và ai hoàn toàn mới",
      "Chọn một công thức đã kiểm chứng hợp với nông sản và hợp tay non nhất",
      "Ghép món ăn với cách an toàn: nhiều a-xít thì nước sôi, ít a-xít thì áp suất",
      "Vẽ các trạm ra giấy: rửa, sơ chế, vô hũ, xử lý, để nguội",
      "Chỉ định đích danh một người cho mỗi trạm trước khi mọi người tới"
    ],
    [
      "In công thức đã kiểm chứng cùng thời gian xử lý và dán ngang tầm mắt",
      "Mở đầu bằng năm phút nói về an toàn: vì sao giờ và cách làm không co giãn",
      "Cử đích danh một người giữ giờ, ghi từng mẻ lúc vào và lúc ra",
      "Ghép mỗi người mới với một người có kinh nghiệm ở mỗi trạm",
      "Đi quanh phòng, vừa làm vừa kể ra để tay nghề thật sự lan đi"
    ],
    [
      "Cầm bút lông, dán nhãn hũ đầu tiên đã nguội: đựng gì, làm cách nào, ngày nào",
      "Ấn giữa từng cái nắp, hũ nào chưa kín thì để riêng — vào tủ lạnh, không lên kệ",
      "Đếm số hũ cho mỗi người và để riêng phần cho tủ lạnh chung hay kho thực phẩm",
      "Ghi ba dòng khi còn nóng hổi: gì chạy tốt, gì tắc, gì cần đổi"
    ]
  ],
  "free-haircut": [
    [
      "Nhắn cho một người thợ tóc bạn quen, xin mười phút kể về ý tưởng này",
      "Ai gật thì hỏi luôn một buổi cắt thật sự được mấy đầu — thường là sáu tới tám",
      "Nhờ mỗi người vừa nhận lời rủ thêm một đồng nghiệp",
      "Gom số giấy phép và ngày họ đi được vào một danh sách"
    ],
    [
      "Nhắn cho một nhà tạm trú, trung tâm ban ngày hay nhà thờ xin mượn chỗ một buổi chiều",
      "Đi một vòng xem có nước, có đủ sáng, và sàn có quét được không",
      "Đếm ổ cắm có tiếp đất trong tầm dây điện chỗ đặt mỗi cái ghế",
      "Chốt ngày và ai mở cửa trong một tin nhắn để sau này còn xem lại"
    ],
    [
      "Nhắn hỏi các thợ tóc xem họ mang theo đồ gì, để bạn chỉ mua phần còn thiếu",
      "Mua hai bộ cữ và lưỡi tông đơ cho mỗi ghế — một bộ ngâm, một bộ đang cắt",
      "Xin một tiệm bán đồ làm tóc tặng áo choàng, lược và giấy quấn cổ dùng một lần",
      "Gói túi mang về: mỗi túi một dao cạo, xà bông, lăn khử mùi và một cây lược"
    ],
    [
      "Gọi cơ quan cấp phép nghề tóc và hỏi quy định cho buổi cắt miễn phí",
      "Mua đúng loại thuốc khử trùng có đăng ký với EPA họ nêu và ghi thời gian ngâm",
      "Dựng một trạm ngâm cho mỗi ghế: chậu có nhãn, đồng hồ hẹn giờ, giờ ngâm in ra",
      "Viết nếp làm giữa hai lượt cắt lên một tấm thẻ và dán ở mỗi ghế"
    ],
    [
      "Nhắn cho từng thợ tóc và nơi cho mượn chỗ trước hai ngày để chốt lại",
      "Đặt một cái ghế ở chỗ cả phòng không nhìn thấy, cho ai muốn kín đáo",
      "Đưa mỗi người một tấm gương và hỏi “bạn muốn kiểu nào?” trước khi cắt",
      "Điện thoại để trong túi — chỉ chụp ảnh khi chính người khách xin chụp",
      "Kết lại bằng việc gói thêm túi mang về và hẹn ngày kế với nơi cho mượn chỗ"
    ]
  ],
  "mutual-aid-moving-crew": [
    [
      "Nhắn cho bốn người bạn khỏe lưng, hỏi cuối tuần họ có rảnh không",
      "Hỏi quanh xem ai có xe tải, xe van hay rơ-moóc cho mượn được",
      "Lập danh sách: tên, số điện thoại, sức khiêng, xe cộ, ngày thường rảnh",
      "Đánh dấu một nhóm nòng cốt nhỏ đã tin cậy cho những lần chuyển nhà nhạy cảm"
    ],
    [
      "Đăng một lời nhờ lên bảng tin: xe đẩy, dây đai, chăn bọc đồ, thùng chắc",
      "Ưu tiên một chiếc xe đẩy bốn bánh chở đồ nặng — không ai tặng thì mua",
      "Kẻ hoặc viết tên chương trình lên từng món để chúng còn quay về",
      "Chọn một nhà để xe hay một cái kho làm nhà của đồ nghề và báo cả đội biết"
    ],
    [
      "Gõ năm câu hỏi nhận việc vào ghi chú: mấy phòng, thang, quãng đường, ngày",
      "Thêm hai câu ai cũng quên: đã đóng thùng hết chưa, đậu xe hợp lệ cách bao xa",
      "Quyết lời nhờ đến với bạn bằng đường nào — một số điện thoại hơn hẳn cái đơn trên mạng",
      "Thử luồng nhận việc với một người bạn giả vờ nhờ chuyển nhà"
    ],
    [
      "Tìm một video chỉ cách nhấc đồ an toàn và gửi cho cả đội",
      "Viết quy tắc sức nặng trước: quá 23 kg thì không dưới hai người khiêng",
      "Soạn một tờ miễn trừ trách nhiệm một trang, mọi người ký trước lần đầu",
      "Nhờ từng người lái xe xác nhận bảo hiểm của họ có tính cả chuyến chở giúp"
    ],
    [
      "Mở danh sách và đánh dấu ai rảnh vào ngày vừa được nhờ",
      "Gọi cho người đó hôm trước, chốt là đã đóng thùng xong thật, không phải “gần xong”",
      "Giữ hai tên dự phòng cho mỗi lần chuyển; chuyển nhà không dễ dời ngày",
      "Nhắn địa chỉ riêng từng người từ điện thoại người điều phối, đừng vào nhóm chat"
    ],
    [
      "Ghi ra những việc bạn biết là quá sức: piano, hóa chất, nhà chất đầy đồ",
      "Tìm xem ở địa phương ai nhận từng việc đó — nhà xe chuyển nhà, xe chở thuê",
      "Ghép mỗi giới hạn với chỗ chỉ sang đó, để một lời từ chối vẫn có cuộc gọi kế",
      "Đánh máy lại thành nửa trang và gửi cho cả đội"
    ],
    [
      "Nhắn cho cả đội tối hôm trước: mấy giờ, hẹn ở đâu, mặc gì",
      "Chất đồ nội thất nặng nhất lên trước và để xe đẩy gánh phần nặng",
      "Đi một vòng căn nhà cũ cùng người đó lần cuối trước khi lăn bánh",
      "Hỏi thăm vài hôm sau — đã ổn định chưa, cửa hàng đồ miễn phí có giúp được gì",
      "Ghi lại gì trôi chảy và gì đau tay khi lần chuyển còn nóng hổi"
    ]
  ],
  "disability-support-network": [
    [
      "Nhắn cho hai hàng xóm khuyết tật bạn quen, hỏi họ có cùng lập việc này không",
      "Để họ chọn hình thức, chỗ gặp và nhịp cho buổi đầu trước khi bạn chốt gì",
      "Thêm một dòng vào khoản chi cho chi phí tiếp cận và thời gian người dẫn dắt",
      "Nói to lên và thống nhất: người đồng hành nâng đỡ, thành viên khuyết tật quyết"
    ],
    [
      "Hỏi ba thành viên họ muốn được liên lạc kiểu nào: gọi, nhắn, email hay gặp mặt",
      "Mở một kênh cho mỗi kiểu và cử một người chăm nom từng kênh",
      "Nhờ một người quen dùng trình đọc màn hình thử phiếu ghi tên, tờ rơi trước khi gửi",
      "Viết lại thông báo đầu tiên bằng lời giản dị và gửi cùng lúc qua mọi đường"
    ],
    [
      "Hỏi một thành viên tháng này việc gì hay rào cản nào khiến họ mệt nhất",
      "Soạn năm câu ngắn và hỏi thành viên qua điện thoại, tin nhắn và gặp mặt",
      "Liệt kê từng nguồn ở địa phương được nhắc tới, mỗi dòng một nơi kèm liên lạc",
      "Gọi từng nơi đã ghi và hỏi về thang máy, nhà vệ sinh và cách tiếp nhận",
      "Đánh dấu ba khoảng trống lớn nhất giữa điều thành viên cần và cái đang có"
    ],
    [
      "Nhắn cho ba thành viên, hỏi mỗi người một thứ họ giúp được và một thứ họ cần",
      "Làm một tờ hai cột — sẵn lòng giúp và cần giúp — rồi ghi tạm những cặp rõ ràng",
      "Thêm lựa chọn tạm nghỉ không cần lý do để ai cũng lùi lại được một tuần",
      "Tự tay ghép cặp đầu tiên và hỏi thăm cả hai người sau đó"
    ],
    [
      "Đăng lời nhờ xin khung tập đi, gậy và ghế tắm còn để không trong nhóm địa phương",
      "Viết trước danh sách không cho mượn: mọi thứ áp sát hơi thở hay da thịt",
      "Khử trùng từng món, rồi gắn số, số máy và tên chương trình lên đó",
      "Làm một tờ ghi mượn thật gọn: số món, người mượn, liên lạc, ngày mượn"
    ],
    [
      "Lưu số của người tư vấn trợ cấp gần nhất vào điện thoại",
      "Hỏi hai thành viên: tới nơi nào hay làm giấy tờ gì họ muốn có người đi cùng",
      "Ghép mỗi lời nhờ với một người biết ghi chép và biết xin trả lời bằng văn bản",
      "Khi đụng tới quy định tiền bạc hay trợ cấp, chỉ sang người tư vấn thay vì đoán"
    ],
    [
      "Ghi ra chỗ tiếp cận nào ổn và chỗ nào hỏng ở buổi gần nhất bạn đi",
      "Soạn bảng kiểm cùng thành viên khuyết tật: lối vào, chỗ ngồi, nhà vệ sinh, âm thanh",
      "Thêm câu hỏi về nhu cầu tiếp cận vào mọi phần xác nhận tham dự của chương trình",
      "Đưa một sự kiện sắp tới qua bảng kiểm và sửa chỗ hỏng trước ngày diễn ra"
    ]
  ],
  "books-to-prisoners": [
    [
      "Mở điện thoại tìm trang quy định nhận thư của một trại gần bạn",
      "Gọi hay gửi email cho bộ phận nhận thư xin quy định về sách bằng văn bản",
      "Lưu quy định thành một tệp có ghi ngày và ghi lại khi nào phải kiểm lại",
      "Làm lại như vậy với trại thứ hai và ghi ra những quy định khác nhau",
      "Viết các quy định không thể phạm (chỉ sách mới, không bìa cứng) lên một tấm thẻ"
    ],
    [
      "Nhắn cho một người bạn hỏi xin từ điển hay truyện bìa mềm họ muốn tặng",
      "Xin một nhà thờ, thư viện hay nhà để xe một góc có cái bàn để đóng gói",
      "Đăng lời kêu gọi tặng sách chỉ nêu thứ các trại nhận — sách bìa mềm còn lành",
      "Đặt một thùng loại ở cửa cho sách bìa cứng và sách bị viết vẽ, trước khi phân loại",
      "Xếp phần còn lại lên kệ theo nhóm: từ điển, truyện, sách học, tái hòa nhập"
    ],
    [
      "Lấy một cuốn sổ hay mở bảng tính với các cột: tên, số hồ sơ, khu giam, sách xin",
      "Nhập những lá thư đang có, chép từng tên và số đúng y như họ viết",
      "Thêm cột ngày nhận thư và cột đã gửi để không thư nào nằm im không hồi âm",
      "Chọn một cái thùng hay cặp hồ sơ để mọi thư đến rơi vào đó trước khi nhập"
    ],
    [
      "Nhắn cho hai người bạn mê sách và rủ họ tới một buổi tối gói sách",
      "In quy định của trại thành một trang bảng kiểm và dán trên bàn đóng gói",
      "Đứng xem và dẫn từng người mới gói xong một gói đầu tiên",
      "Nói to nếp này lên: một người thứ hai soát mọi thùng trước khi dán băng keo"
    ],
    [
      "Tra cước Media Mail cho một gói sách nặng khoảng một ký",
      "Nhờ nhóm chat góp tiền cước, kèm một con số cụ thể cho mỗi gói",
      "Đặt một ngày gửi cố định lên lịch và rủ hai người tới giúp",
      "Viết một tấm thẻ quy định cho người gói: không kèm thư riêng trong gói Media Mail"
    ],
    [
      "Hỏi một người góp một tay xem họ có muốn mở hàng chương trình bạn qua thư không",
      "Viết hai ranh giới lên một tấm thẻ: chỉ địa chỉ chương trình, chỉ gọi tên riêng",
      "Soạn một câu trả lời tử tế mà dứt khoát cho lời xin tiền hay ngỏ tình, gửi người viết",
      "Ghép cặp đầu tiên và hẹn hỏi thăm sau lá thư qua lại đầu tiên của họ"
    ]
  ],
  "community-music": [
    [
      "Đăng một lời nhờ xin nhạc cụ còn chơi được vào nhóm chat hay nhóm địa phương",
      "Nhắn cho một tiệm nhạc cụ hỏi giá sửa mềm cho một chương trình của cộng đồng",
      "Thử chơi hay mở từng hộp đàn trước khi nhận — bỏ qua piano cho không và nứt lớn",
      "Đi lấy những cây đã gật đầu và gắn nhãn ghi cây nào cần sửa gì",
      "Đem những cây sửa được tới tiệm và ghi lại ngày họ hẹn"
    ],
    [
      "Mở một bảng trống với các cột: số, loại đàn, tình trạng, ai giữ, ngày mượn",
      "Dán một cái nhãn có số lên từng cây đàn",
      "Chụp tình trạng từng cây và lưu ảnh theo số",
      "Viết ba dòng dặn khi cho mượn: giữ gìn ra sao, hạn trả, không bắt trả tiền sửa",
      "Thử chạy cách này bằng việc tự ghi mượn một cây cho chính mình"
    ],
    [
      "Nhắn cho hai người chơi nhạc bạn đã quen, hỏi họ có dạy người mới không",
      "Nhờ nhà thờ, ban nhạc trường và trung tâm người lớn tuổi kể tên người kiên nhẫn",
      "Gặp mỗi người đã gật đầu mười phút để nghe họ dạy gì và dạy lúc nào",
      "Bắt đầu kiểm tra lý lịch ngay cho ai sẽ dạy trẻ nhỏ",
      "Ghi tên, nhạc cụ và giờ rảnh vào một danh sách chung"
    ],
    [
      "Kể ra ba phòng gần đó chịu được tiếng ồn: nhà văn hóa, trường, nhà thờ",
      "Gọi hay ghé từng nơi và hỏi rõ về buổi tối và chiều cuối tuần",
      "Nơi nào dễ chịu nhất thì hỏi thêm một cái tủ có khóa để cất nhạc cụ",
      "Đi thử một vòng phòng đó vào đúng giờ bạn định, xem tiếng ồn và hàng xóm",
      "Xin cái gật đầu bằng văn bản, ghi rõ đúng ngày và giờ của bạn"
    ],
    [
      "Nhắn cho các thầy cô một tin, hỏi hai khung giờ trong tuần hợp nhất với họ",
      "Phác lịch tháng đầu: các buổi học cộng một buổi chơi ghi rõ chỉ dành người mới",
      "Lo chỗ ghi tên: một tờ giấy ở nơi tập và một số điện thoại để nhắn",
      "Chốt lịch với nơi cho mượn chỗ trước khi báo cho ai",
      "Dán lịch ở nơi các gia đình vốn hay nhìn và ghim lên nhóm chat"
    ],
    [
      "Ghi ba điều cần giữ gìn cho loại nhạc cụ bạn rành nhất",
      "Thêm câu quan trọng in đậm: có gì hỏng thì mang về, đừng tự sửa ở nhà",
      "Nhờ một trong các thầy cô soát lại tờ giấy xem thiếu hay sai chỗ nào",
      "In ra nhiều bản và kẹp một bản vào mỗi hộp đàn trước khi nó đi",
      "Nói to câu về nhạc cụ hỏng ở mỗi lần cho mượn"
    ]
  ],
  "school-supply-program": [
    [
      "Tra số điện thoại văn phòng trường gần nhất và lưu vào máy",
      "Gọi hay gửi email xin gặp đích danh thầy cô tư vấn hay người liên lạc phụ huynh",
      "Xin họ danh sách đồ dùng chính xác của từng khối lớp, kể cả nhãn hiệu",
      "Hỏi một con số thực tế: bao nhiêu gia đình sẽ cần một chiếc ba lô",
      "Gõ danh sách và con số vào một tài liệu và chia sẻ với cả dự án"
    ],
    [
      "Mở danh sách đồ dùng ra và khoanh năm món căn bản cần nhất",
      "Hỏi giá cả thùng cho mấy món đó ở hai chỗ bán sỉ",
      "Đặt một đơn sỉ bút chì, giấy và hồ dán trước khi đợt quyên góp bắt đầu",
      "Nhờ hai cửa tiệm hay hai nhà thờ đặt giúp một thùng nhận mấy món vui mắt",
      "Đặt lời nhắc hằng tuần để dọn thùng và ghi lại còn thiếu gì"
    ],
    [
      "In một bản danh sách đồ dùng của mỗi khối lớp",
      "Nhắn cho ba người góp một tay ngày giờ của buổi soạn ba lô",
      "Dựng mỗi khối một cái bàn, dán danh sách ở chỗ người soạn nhìn thấy",
      "Soạn theo dây chuyền, đối chiếu từng chiếc ba lô với danh sách của khối",
      "Để mọi chiếc ba lô không dán kín để trẻ đổi được món lúc nhận"
    ],
    [
      "Nhắn cho hai người có thể có một phòng hay nhà để xe khô ráo, khóa được",
      "Đến xem chỗ ưng nhất: có khô, có khóa, có kệ hay pa-lết không",
      "Đặt thùng lên kệ hay lên pa-lết, đừng bao giờ để thẳng xuống nền",
      "Chọn điểm phát trên tuyến xe buýt các gia đình vốn đi và chốt ngày"
    ],
    [
      "Tra ngày tựu trường và đặt buổi trao trước đó một tới hai tuần",
      "Nhờ người liên lạc của trường loan ngày đó qua các kênh tới các gia đình",
      "Nhắn danh sách người góp một tay hỏi ai nhận được một ca hai giờ",
      "Xếp ba lô theo màu để mỗi đứa trẻ tự chọn cái của mình",
      "Đi thử một vòng hôm trước: cửa vào không giấy tờ gì, chỉ một người đón và một bàn"
    ]
  ],
  "legal-aid-clinic": [
    [
      "Tra số trung tâm trợ giúp pháp lý và chương trình pro bono của đoàn luật sư; lưu cả hai số",
      "Gọi từng nơi, hỏi họ cần gì ở bạn để cử luật sư tới",
      "Gửi email cho phòng thực hành của trường luật gần nhất, hỏi về sinh viên có luật sư kèm",
      "Hỏi mọi luật sư xem bảo hiểm nghề nghiệp có bao cả phần việc làm không công không",
      "Ghi danh vào chương trình của đoàn luật sư nếu đó là điều mở ra bảo hiểm miễn phí"
    ],
    [
      "Nhắn cho các luật sư cùng phối hợp một câu: ba loại vụ việc nào sẽ nhận lo?",
      "Liệt kê những gì nằm ngoài phạm vi và mỗi loại vụ đó nên chuyển đi đâu",
      "Xin tên người liên hệ và thời gian chờ thật lòng ở mọi nơi nhận chuyển tiếp",
      "Viết phạm vi bằng lời mà một người hàng xóm có thể kể lại đúng cho bạn"
    ],
    [
      "Nhắn cho một nơi cùng phối hợp, hỏi mượn một phòng có cửa đóng được để tư vấn",
      "Đứng ở chỗ chờ trong lúc có người nói bên trong — nghe thấy tiếng thì tìm chỗ khác",
      "Soạn bảng kê giấy tờ theo từng loại vụ: hợp đồng thuê, giấy báo, phiếu lương, giấy tùy thân",
      "Làm phần tiếp nhận sao cho luật sư vào buổi nào cũng đã có sẵn giấy tờ xếp gọn"
    ],
    [
      "Vẽ thử tờ lịch hẹn ra giấy: tên và khung giờ, không gì khác",
      "Chọn ai nhận đặt hẹn và tờ danh sách duy nhất ấy nằm ở đâu",
      "Đừng ghi nội dung vụ việc lên bất kỳ tờ dùng chung nào — chi tiết để nói trong phòng",
      "Gọi nhắc chỉ nói giờ và chỗ, không bao giờ nói chuyện pháp lý"
    ],
    [
      "Nhắn cho một tổ chức cùng phối hợp: câu hỏi về quyền nào hay gặp nhất trong việc của họ?",
      "Soạn một tờ hướng dẫn một trang về chủ đề hay gặp nhất, bằng lời thật dễ hiểu",
      "Nhờ một luật sư soát mọi tờ phát tay và ghi ngày lên từng tờ",
      "Mượn phòng và mời người nói cho buổi học đầu tiên",
      "Nói rõ và in rõ: đây là hiểu biết chung, không phải lời khuyên pháp lý"
    ],
    [
      "Nhắn cho các luật sư hai ngày tư vấn dự kiến và hỏi ngày nào giữ được",
      "Chốt ngày lặp lại và thêm vào lịch của cộng đồng",
      "Mời người phiên dịch xong rồi mới loan tin bằng tiếng đó — đừng nhờ con của người đến nhờ",
      "Gửi tờ rơi qua các tổ chức cùng phối hợp, thay vì đăng công khai trên mạng",
      "Xác nhận lại với từng luật sư trước một tuần — buổi tư vấn vắng luật sư làm mất lòng tin"
    ],
    [
      "Lập một danh sách gốc những người đến nhờ giúp, chỉ người điều phối mở được",
      "Viết ra quy tắc: mọi lịch hẹn mới đều phải soát với danh sách đó trước",
      "Soát xung đột lợi ích ngay lúc đặt hẹn, không phải lúc người ta ngồi xuống",
      "Soạn lời cam kết giữ kín dài hai dòng để mọi người góp tay cùng ký",
      "Đi qua cả hai quy tắc với cả nhóm trước khi buổi tư vấn đầu tiên mở cửa"
    ]
  ],
  "resource-hub-dispatch": [
    [
      "Ghi ra một số điện thoại hoặc một đường dẫn mẫu điền sẽ làm cánh cửa trước",
      "Dựng cả ba lối — điện thoại, mẫu điền, gặp trực tiếp — hỏi cùng mấy câu ngắn như nhau",
      "Đặt tên một người và một lịch kiểm tra cho từng kênh trước khi công bố kênh đó",
      "Gửi thử một lời nhờ qua từng kênh và bấm giờ xem bao lâu thì có người thấy"
    ],
    [
      "Mở một bảng với các cột: tên, sở trường, lúc rảnh, cách liên lạc, giới hạn cứng",
      "Nhắn năm người góp tay hỏi lúc nào họ rảnh và thích được liên lạc kiểu gì",
      "Thêm từng người dẫn dắt dự án và những gì dự án của họ góp được thật sự",
      "Hẹn lịch xác nhận lại mỗi quý — danh sách toàn cái gật cũ phần lớn là tưởng tượng"
    ],
    [
      "Lần lại một lời nhờ gần đây trên giấy: ai thấy, ai làm, ai khép lại",
      "Viết quy tắc chuyển việc: loại việc nào đi tới dự án nào hay người giúp nào",
      "Mỗi lời nhờ có đúng một người đứng tên lo tới lúc khép lại thật sự",
      "Đặt mốc thời gian trả lời, thấp nhất cũng có câu “việc này chưa lo được” trong ngày",
      "Theo dõi trạng thái từng lời nhờ ở chỗ cả nhóm cùng nhìn thấy"
    ],
    [
      "Bắt đầu danh sách bằng chính các dự án của bạn — những cái nhớ là viết được",
      "Gọi từng nơi bên ngoài như thể bạn đang cần giúp, và ghi lại giờ mở cửa thật",
      "Ghi điều kiện nhận — họ nhận ai và hỏi giấy gì ngay ở cửa",
      "Ghi ngày lên từng mục và dành một buổi mỗi tháng soát lại những mục cũ nhất"
    ],
    [
      "Nhắn ba người ngăn nắp hỏi họ nhận một ca chuyển việc mỗi tuần không",
      "Viết bản hướng dẫn ca sao cho người điều phối mới chỉ nhìn tờ giấy là trực được",
      "Ngồi cạnh từng người điều phối mới suốt ca đầu, rồi giao hẳn lại cho họ",
      "Xếp vòng thay phiên sao cho không ai trực quá hai ca liền nhau"
    ],
    [
      "Đọc lại mẫu tiếp nhận và gạch bỏ mọi ô mà thiếu nó bạn vẫn làm được",
      "Viết quy tắc xóa: lời nhờ khép lại thì giữ con số, bỏ hết chi tiết",
      "Liệt kê ai được xem các lời nhờ đang mở và khóa cửa với tất cả người khác",
      "Thêm một bước theo lại: xác nhận việc đã thật sự được lo rồi mới khép lại"
    ],
    [
      "Thêm ngay một thẻ hay một cột “chưa lo được” vào bảng theo dõi lời nhờ",
      "Chọn một bộ nhóm cố định để các mục cộng lại được, thay vì tản mát",
      "Ghi mỗi lần hụt ngay lúc nó xảy ra, đừng để cuối tháng ngồi nhớ lại",
      "Cộng số lần hụt mỗi tháng và mang chỗ thiếu lớn nhất tới buổi bàn kế hoạch sau"
    ]
  ],
  "harm-reduction-supplies": [
    [
      "Tìm tổ chức giảm tác hại gần nhất hoặc buổi tập naloxone của sở y tế",
      "Gửi email hay gọi cho họ: giới thiệu nhóm và hỏi khi nào có buổi tập miễn phí tới",
      "Giữ chỗ ở buổi tập cho tất cả những ai sẽ đi phát — không trừ ai",
      "Hỏi về việc đi phát dưới chiếc ô pháp lý và đơn thường trực của họ"
    ],
    [
      "Gửi email cho tổ chức cùng phối hợp hay phòng tư vấn pháp luật: ở đây được mang theo gì?",
      "Hỏi rõ về que thử và bơm kim tiêm, chứ đừng chỉ hỏi naloxone",
      "Ghi lại điều luật hoặc tên người trả lời, kèm ngày bạn hỏi",
      "Biến nó thành một tấm thẻ một trang để mọi người đi phát mang theo"
    ],
    [
      "Tra chương trình phát naloxone của bang hoặc đơn thường trực của nhà thuốc",
      "Đặt hàng, thêm những gì danh sách hợp pháp cho phép: que thử, đồ băng vết thương, đồ vệ sinh",
      "Kiểm hạn dùng ngay hôm thùng hàng về và ghi vào chỗ bạn hay nhìn thấy",
      "Cất hết ở chỗ tránh nóng tránh lạnh — không cốp xe, không nhà kho tôn"
    ],
    [
      "Xin tổ chức cùng phối hợp một tờ hướng dẫn mẫu để chép lại",
      "Soạn tờ của bạn: nhận ra cơn sốc thuốc, cho dùng naloxone, gọi cấp cứu, đừng dùng một mình",
      "Nhờ dịch sang những thứ tiếng hàng xóm quanh bạn thật sự nói",
      "Gọi thử mọi số trên tờ hướng dẫn trước khi in hàng trăm bản",
      "Xếp một dây chuyền, mỗi người một chặng: túi, tờ hướng dẫn, đồ dùng, dán kín"
    ],
    [
      "Nhờ một quán bar hay quán tạp hóa bạn đã quen giữ giúp một hộp không hỏi han",
      "Đi thử đường cùng tổ chức cùng phối hợp, để họ giới thiệu bạn ở những chỗ họ quen",
      "Chọn ngày và giờ cố định cho các vòng đi, tuần nào cũng y hệt",
      "Mỗi hộp gửi ở quán có một người đứng tên lo bù hàng"
    ],
    [
      "Mở một tờ đếm: món đồ, số đã phát, ngày — đếm đồ đã đi, đừng bao giờ đếm người",
      "Ghi mọi hạn dùng của naloxone kèm lời nhắc trước một tháng",
      "Mỗi tháng đi một vòng các điểm cố định và bù hàng trước khi hộp cạn",
      "Mở buổi tập nhắc lại mỗi khi có người mới vào góp tay"
    ]
  ],
  "court-support": [
    [
      "Tra số văn phòng luật sư bào chữa công và nhóm quan sát phiên tòa ở địa phương",
      "Gửi một email ngắn ngỏ ý góp thêm tay và hỏi họ thích được liên lạc kiểu nào",
      "Hỏi từng nhóm điều gì thật sự giúp được — rồi lắng nghe, đừng chào hàng",
      "Tới tòa một lần cùng một người trong nhóm quan sát để xem họ làm thế nào",
      "Ghi tên, vai trò và kênh liên lạc ưa dùng của từng người vào một danh sách chung"
    ],
    [
      "Mở một ghi chú và viết quy tắc lớn nhất: cả nhóm không bao giờ đưa lời khuyên pháp lý",
      "Thêm đúng câu mẫu: “việc này tôi không khuyên được đâu — hỏi luật sư của mình nhé”",
      "Liệt kê nội quy phòng xử: tới sớm, ăn mặc giản dị, tắt điện thoại, không phản ứng",
      "Thêm quy tắc hành lang: không bàn vụ việc ở bất cứ đâu công tố viên nghe được",
      "Gửi bản nháp cho người quen bên luật sư bào chữa công đọc soát nhanh"
    ],
    [
      "Nhắn cả nhóm hỏi xem số điện thoại của ai sẽ nhận các lời nhờ đi cùng",
      "Làm một cuốn lịch chung ghi ngày, phòng xử và mỗi người cần gì",
      "Lưu trang lịch xử án của tòa và tập tra thử một vụ",
      "Đặt lời nhắc thường trực: chiều hôm trước đối chiếu từng ngày với lịch xử án",
      "Hỏi thẳng từng người, đừng hỏi tờ giấy, xem họ có cần xe hay người trông con không"
    ],
    [
      "Nhắn cho người góp tay hai buổi sáng vắng để đi thử một vòng tòa án",
      "Dẫn họ qua cửa an ninh: hàng chờ 30 phút, dao bỏ túi bị cấm, quy định điện thoại",
      "Chỉ cho họ phòng xử: ngồi ở đâu và chờ ba tiếng thế nào cho bình tĩnh",
      "Tập câu mẫu không khuyên bảo theo cặp cho tới lúc buột miệng là ra",
      "Ghép mỗi người mới với một người đã quen việc trong ngày ra tòa đầu tiên"
    ],
    [
      "Nhắn thành viên hỏi ai lái xe được sáng ngày thường và ai trông trẻ được",
      "Lập danh sách ghi buổi sáng rảnh của từng người lái xe và lúc rảnh của từng cặp trông trẻ",
      "Mỗi phiên tòa có một người lái xe chính và một người dự phòng — đừng bao giờ chỉ một",
      "Tối hôm trước lần nào cũng xác nhận lại với người lái xe chính và cặp trông trẻ",
      "Xem phòng xử nào cho trẻ vào, để chuyện trông con khớp với nơi xử"
    ],
    [
      "Trả lời luật sư, xin viết ra giấy nội dung, gửi cho ai và hạn nộp",
      "Liệt kê những hàng xóm hiểu rõ người này và nhắn lời nhờ tới từng người",
      "Gửi cho người viết bản hướng dẫn của luật sư và một lá thư mẫu tốt",
      "Gom mọi lá thư và giữ lại cho luật sư đọc trước khi gửi đi bất cứ thứ gì",
      "Theo dõi ai đã hứa viết thư và nhắc khéo họ trước hạn ba ngày"
    ]
  ],
  "cooling-warming-center": [
    [
      "Kể ra ba chỗ có máy lạnh và lò sưởi thật: thư viện, một nơi thờ tự, một hội trường công đoàn",
      "Gọi một nơi ngay hôm nay, xin hai mươi phút với người giữ chìa khóa",
      "Đi một vòng căn phòng, xem nhà vệ sinh, lối vào không bậc thềm và các ổ điện",
      "Hỏi ngay những câu khó chịu: giờ giấc, chìa khóa, bảo hiểm, ở lại qua đêm",
      "Xin cái gật đầu bằng văn bản và tính thử máy vào một ngày thật khắc nghiệt"
    ],
    [
      "Tra các ngưỡng cảnh báo về chỉ số nóng bức và nhiệt độ cảm nhận của cơ quan khí tượng",
      "Đề ra con số chính xác cho cả nhóm — một mức dự báo, không phải “khi nào thấy tệ”",
      "Chỉ định một người có quyền hô mở cửa, kèm một người dự phòng",
      "Lập nhóm trò chuyện hay chuỗi gọi điện và thử báo tin một lần ngay hôm nay",
      "Viết mốc mở cửa và tên người quyết ở chỗ mọi người trực ca đều thấy"
    ],
    [
      "Viết danh sách: nước, gói điện giải, chăn, giường xếp, quạt, sạc, đồ sơ cứu",
      "Đăng một lời nhờ tới thành viên xem ai cho được món gì, còn lại thì đi hỏi giá",
      "Đi mua một chuyến và chở hết tới nơi cho mượn chỗ",
      "Xếp vào thùng dán nhãn để người trực ca mới toanh tìm gì cũng ra trong vài giây",
      "Dán một tờ kê đồ bên trong cánh cửa kho"
    ],
    [
      "Nhắn thành viên hỏi ai ngồi được một ca bốn tiếng giữa thời tiết khắc nghiệt",
      "Đặt một buổi tập hai tiếng ngay tại chỗ và mời tất cả những ai đã gật đầu",
      "Tập dấu hiệu sốc nhiệt và hạ thân nhiệt tới khi người trực ca kể vanh vách",
      "Nói thẳng: gọi cấp cứu sớm, và không ai bị trách vì đã gọi",
      "Tập theo cặp cách đón người không cần giấy tờ và một câu mẫu hạ nhiệt căng thẳng"
    ],
    [
      "Vẽ bảng ca cho một ngày mở cửa: người mở, các khung ban ngày, người đóng",
      "Điền hai cái tên vào mỗi ô — đừng bao giờ để một người trực một mình",
      "Nhờ thêm ba người đứng tên dự bị, phòng khi thời tiết quật ngã người trực ca",
      "Chia bảng ca lên nhóm trò chuyện và hỏi lại từng người đã thấy ca của mình chưa",
      "Thử hô mở cửa một lần cho quen, xem bảng ca thật sự đầy nhanh cỡ nào"
    ],
    [
      "Kể ra những nơi hàng xóm dễ gặp nguy vẫn hay lui tới: phòng khám, khu nhà, quán tạp hóa",
      "Soạn một tờ rơi lời dễ hiểu, ghi mốc mở cửa, địa chỉ và giờ giấc",
      "Nhờ thành viên dịch sang những thứ tiếng khác trong khu phố",
      "Đưa từng xấp cho người đi giao cơm, người trông coi khu nhà và người đi thăm hỏi",
      "Đi hết một vòng trước khi vào mùa mấy tuần — đừng đợi tới đợt nắng nóng đầu tiên"
    ],
    [
      "Nhắn người trực cùng ca để chốt lại ca và xem ai cầm chìa khóa",
      "Tới sớm một tiếng, bật máy lạnh hay lò sưởi, và để nước ngay cạnh cửa",
      "Đếm người tới thật nhẹ nhàng — chỉ một con số, không xem giấy tùy thân",
      "Nhẹ nhàng lay ai đang ngủ để xem sao; một giấc ngủ trưa có thể che cơn sốc nhiệt",
      "Đóng cửa xong thì dọn dẹp, bù lại các thùng đồ, và ghi lại món gì đã hụt"
    ]
  ],
  "community-oral-history": [
    [
      "Mở một ghi chú trắng và liệt kê bạn sẽ ghi những gì và nó có thể đi tới đâu",
      "Soạn một trang: ghi cái gì, các lựa chọn chia sẻ, quyền dừng, bỏ qua hay rút lại",
      "Tách chuyện chia sẻ thành từng ô: có tên hay không, chỉ trong nhà, công khai trên mạng",
      "Thêm số điện thoại của bạn để người kể có thể đổi ý về sau",
      "Nhờ ai đó dịch sang những thứ tiếng mà người kể chuyện của bạn nói"
    ],
    [
      "Mở ứng dụng ghi âm trên điện thoại và xem còn trống bao nhiêu bộ nhớ",
      "Ghi thử 30 giây trong căn phòng sẽ dùng và nghe lại xem có tiếng ù hay tiếng vang",
      "Viết tám câu hỏi mở, kiểu “kể tôi nghe con phố này hồi mới tới trông ra sao”",
      "Tập trò chuyện mười phút với một người bạn và bỏ những câu hỏi rơi tõm"
    ],
    [
      "Nhắn một người lớn tuổi tin cậy bạn, xin một tiếng bên bàn ăn nhà họ",
      "Sạc điện thoại, dọn bộ nhớ, và bỏ giấy đồng ý cùng danh sách câu hỏi vào túi",
      "Cùng nhau đọc qua giấy đồng ý trước khi bấm nút ghi âm",
      "Nếu câu chuyện chạm chỗ đau, dừng lại và hỏi lại xem đoạn đó có giữ được không",
      "Trước khi về, hẹn buổi sau hoặc hỏi họ muốn giới thiệu bạn với ai"
    ],
    [
      "Đặt lại tên bản ghi tuần này ngay: ngày, tên người kể, thỏa thuận chia sẻ",
      "Chép sang một nơi thứ hai thật sự khác — đám mây và điện thoại, không phải một laptop",
      "Đưa cho người kể một bản của riêng họ, bằng USB hay bằng ứng dụng họ vẫn dùng",
      "Đọc lại giấy đồng ý trước khi đăng công khai bất cứ gì, và tôn trọng mọi thay đổi"
    ]
  ],
  "community-solar-coop": [
    [
      "Nhắn năm người hàng xóm hay than tiền điện, xin mỗi người mười phút",
      "Soạn một mẫu ghi tên hỏi mức gắn bó thật, chứ không chỉ xin địa chỉ email",
      "Mở một buổi nói chuyện bên bàn ăn và đếm xem ai thật sự tới",
      "Xếp câu trả lời thành gắn bó, tò mò, và không — chỉ tính đường quanh nhóm gắn bó"
    ],
    [
      "Tìm tên bang của bạn kèm “luật điện mặt trời cộng đồng” và lưu trang chính thức đầu tiên",
      "Gọi một hợp tác xã điện mặt trời ở vùng bên và hỏi luật cho họ dùng mô hình nào",
      "Viết một tờ tóm tắt: đo điện hai chiều, thuê bao, sở hữu hợp tác xã — ở đây được hay không",
      "Đánh dấu mọi điều luật bạn chưa hiểu để nhờ luật sư giải thích sau"
    ],
    [
      "Kể ra ba mái nhà lớn nhiều nắng ở gần: trường học, nhà thờ, nhà kho",
      "Xem một chương trình điện mặt trời cộng đồng sẵn có có nhận nhóm bạn làm thuê bao không",
      "Đi một vòng nơi ưng nhất cùng chủ nhà, ghi lại tuổi mái và khoảng trống còn lại",
      "Đặt chuyện tự dựng và chuyện tham gia lên cùng một trang rồi mang tới cho thành viên"
    ],
    [
      "Hỏi hiệp hội hợp tác xã của bang xem luật sư nào rành hợp tác xã năng lượng",
      "Hẹn một buổi hỏi ý kiến với luật sư từng lập hợp tác xã năng lượng",
      "Vẽ dòng tiền trên một trang: ai bỏ vào, ai sở hữu gì, ai được trừ tiền điện",
      "So sánh các cơ cấu — hợp tác xã, công ty, thuê bao — cùng những người có chuyên môn",
      "Đừng ký gì cho tới khi luật sư và kế toán đã đọc từng hợp đồng"
    ],
    [
      "Hỏi hai nhà gần đó đã lắp pin xem họ thuê thợ nào và có thuê lại không",
      "Xin ít nhất ba bản báo giá bằng văn bản cho cùng một bộ thông số",
      "Hỏi từng bên báo giá: năm thứ năm ai lo bảo dưỡng và bảo hành che tới đâu",
      "Đưa điều khoản bảo hành và bảo dưỡng vào hợp đồng bằng văn bản"
    ],
    [
      "Mở một bảng tính, mỗi thành viên một dòng: đã bỏ vào, được trừ lại, ngày",
      "Viết quy tắc trừ tiền bằng lời giản dị, thành viên mới đọc một phút là hiểu",
      "Chọn đúng một công cụ cho việc thu tiền và gửi sao kê, rồi giữ nguyên",
      "Ngồi cùng một thành viên đọc tờ sao kê đầu tiên và sửa lại chỗ nào làm họ rối"
    ],
    [
      "Nhờ ba thành viên mang một tờ hóa đơn tiền điện gần đây tới buổi họp sau",
      "Cùng nhau đọc một tờ hóa đơn, từng dòng một",
      "Chia sẻ năm cách sửa rẻ tiền: bóng LED, ổ cắm thông minh, máy điều nhiệt, gioăng cửa",
      "Một tháng sau xem lại hóa đơn để thành viên thấy khác biệt ngay trên giấy"
    ]
  ],
  "worker-coop-incubator": [
    [
      "Hẹn ba cuộc trò chuyện 20 phút với thành viên đang quan tâm ngay trong tuần này",
      "Hỏi từng người: làm được gì, muốn dựng nên cái gì, mỗi tuần rảnh mấy giờ",
      "Ghi mọi câu trả lời vào một bảng chung và tô đậm những sở trường lặp lại",
      "Khoanh mọi chùm từ ba sở trường giống nhau trở lên — đó là một nhóm làm ăn có thể có"
    ],
    [
      "Hỏi thành viên muốn học gì nhất: hồ sơ xin việc, nghề thợ, máy tính, tiền nong",
      "Hỏi chương trình chia sẻ sở trường xem ai dạy được hai thứ được xin nhiều nhất",
      "Mời một người ngoài có chuyên môn cho chủ đề không ai ở đây lo nổi",
      "Xếp lịch buổi đầu tiên và giữ cho nó gọn dưới hai tiếng",
      "Hỏi cảm nhận ngay ở cửa ra và chỉnh lại buổi sau"
    ],
    [
      "Mời một người từ một hợp tác xã của người lao động có thật tới nói chuyện với nhóm",
      "Làm một trang so sánh: hợp tác xã và cơ sở làm ăn thường — lời lãi, quyết định, sở hữu",
      "Đi qua cách một hợp tác xã có thật bỏ phiếu và chia lời, kèm con số cụ thể",
      "Chừa thời gian cho những câu hỏi khó: tiền công, xích mích, người bỏ đi"
    ],
    [
      "Tra người chuyên gây dựng hợp tác xã ở vùng bạn và hẹn một cuộc gọi làm quen",
      "Giúp nhóm phác một trang kế hoạch làm ăn trước khi đụng tới giấy tờ nào",
      "Xin tên một luật sư và một kế toán từng lập hợp tác xã",
      "Cùng những người có chuyên môn ngồi soát lại các lựa chọn cơ cấu",
      "Khoan đăng ký thành lập cho tới khi kế hoạch và những người cố vấn khớp nhau"
    ],
    [
      "Mở một tài liệu chung, liệt kê mọi khoản vay nhỏ, khoản tài trợ và quỹ hợp tác xã bạn biết",
      "Hỏi người chuyên gây dựng hợp tác xã xem bạn còn sót bên tài trợ nào",
      "Ghi hạn nộp, số tiền và điều kiện của từng quỹ",
      "Ngồi với một nhóm làm ăn và cùng họ làm xong bộ hồ sơ đầu tiên"
    ],
    [
      "Ghi ra ba người làm hợp tác xã lâu năm hay chủ cơ sở làm ăn mà bạn có thể ngỏ lời",
      "Mời từng người dìu dắt một nhóm làm ăn, mỗi tháng ghé hỏi han một lần",
      "Ghép người dìu dắt với nhóm làm ăn theo nghề, đừng chỉ theo ai đang rảnh",
      "Ghi buổi hỏi han đầu tiên vào lịch trước khi nhóm làm ăn mở màn"
    ],
    [
      "Mời tất cả các nhóm làm ăn tới một bữa trưa chung hay một buổi gặp mặt buổi tối",
      "Để mỗi nhóm kể một chuyện khó và một chuyện vui",
      "Lập một nhóm trò chuyện để giới thiệu khách và hỏi nhanh",
      "Liệt kê những gì các nhóm mua được của nhau và ghim lên nhóm trò chuyện"
    ]
  ],
  "elder-meal-delivery": [
    [
      "Gọi một câu lạc bộ người cao tuổi hoặc y tá nhà thờ, hỏi ai đang cần bữa ăn và người ghé thăm",
      "Liệt kê phòng khám, nhóm tôn giáo và nhà thuốc hay gặp người cao tuổi sống một mình",
      "Viết một đoạn ngắn mời tự nguyện: một bữa ăn và một lần ghé thăm, miễn phí, không ràng buộc",
      "Gọi hoặc ghé hỏi từng người cao tuổi được giới thiệu — đừng bao giờ tự cho là họ muốn",
      "Lập danh sách những người đã nhận lời, kèm địa chỉ và giờ dễ liên lạc nhất"
    ],
    [
      "Nhắn cho năm người đáng tin mà bạn dám để họ vào nhà bà mình",
      "Ghi rõ luật sàng lọc: hỏi người quen biết cộng kiểm tra lý lịch cơ bản, không ngoại lệ",
      "Áp dụng cho mọi người góp một tay trước chuyến đưa cơm đầu tiên của họ",
      "Xếp cho mỗi người cao tuổi một người ghé thăm cố định, thay vì thay phiên"
    ],
    [
      "Hỏi nhóm nấu ăn chung mỗi tuần họ làm đều được bao nhiêu suất",
      "Tìm sẵn hai người nấu dự phòng hoặc một quán ăn chịu tặng vài suất",
      "Thống nhất số suất, giờ đến lấy và loại hộp dễ hâm nóng lại",
      "Dán nhãn ghi món và ngày lên từng hộp trước khi rời khỏi bếp"
    ],
    [
      "Chấm địa chỉ trong danh sách đã nhận lời lên bản đồ và gom thành những tuyến ngắn",
      "Chọn ngày cố định và khung giờ áng chừng, tuần nào cũng như tuần nào",
      "Chừa mười phút thong thả để trò chuyện ở mỗi điểm dừng",
      "Chạy thử từng tuyến một lượt trước chuyến đưa cơm thật đầu tiên"
    ],
    [
      "Làm một phiếu ghi đơn giản: món kiêng, thứ dị ứng, người cần gọi khi có chuyện",
      "Điền cùng từng người cao tuổi hoặc gia đình họ, gặp trực tiếp hay gọi điện đều được",
      "Cất phiếu trong tủ khóa hoặc để trong tệp có mật khẩu",
      "Người lái xe chỉ cầm phần cần ở cửa: thứ dị ứng và một số điện thoại liên lạc"
    ],
    [
      "Viết dòng đầu tiên: gõ cửa không ai trả lời thì làm gì",
      "Ghi thứ tự gọi: số của người cao tuổi, gia đình, rồi cấp cứu",
      "Thêm phần hướng dẫn ghi lại chuyện đã xảy ra sau mỗi sự việc",
      "In cách xử lý ra thẻ bỏ túi cho từng người góp một tay",
      "Đọc to và đi qua một lượt với cả nhóm trước khi cần đến"
    ],
    [
      "Nhắn cho từng người sau tuần đầu: đi thấy sao, chỗ nào thấy gượng gạo",
      "Hỏi từng người cao tuổi một câu mở: điều gì sẽ làm việc này tốt hơn",
      "Đổi tuyến hoặc cho tạm nghỉ với ai nghe giọng đã đuối",
      "Mỗi tháng kể cho cả nhóm nghe một niềm vui nho nhỏ"
    ]
  ],
  "disaster-relief-hub": [
    [
      "Liệt kê ba tòa nhà có chỗ bốc dỡ hàng: trường học, nhà thờ, nhà văn hóa",
      "Hỏi thẳng từng chủ nhà: sau một trận lụt, sáu giờ sáng mình vào được không",
      "Xin một cái gật đầu bằng giấy và cách lấy chìa khóa cho chỗ ưng nhất và chỗ dự phòng",
      "Đi một vòng cả hai chỗ, ghi lại điện, nước và chỗ xe tải đậu"
    ],
    [
      "Ghi ra nước, thức ăn và đồ vệ sinh sẽ lấy từ đâu: nhà cung cấp, tổ chức bạn hay quyên góp",
      "Gọi một mối bán sỉ, hỏi chuyện đặt hàng số lượng lớn gấp khi có thiên tai",
      "Thống nhất với các tổ chức bạn xem ai lo món gì",
      "Chọn cách nắm nhu cầu thật sau khi có chuyện: một cây gọi điện hay một phiếu ghi"
    ],
    [
      "Chốt ngay các nhóm phân loại: nước, thức ăn, đồ vệ sinh, đồ dọn dẹp, quần áo",
      "Vẽ luồng ra giấy: xe tới, dỡ hàng, phân loại, xếp kệ, đếm",
      "Làm một tờ ghi số một trang cho hàng vào và hàng ra",
      "In bảng tên từng nhóm hàng, kèm băng keo, cất sẵn tại chỗ"
    ],
    [
      "Viết luật ngay đầu trang: không xét giấy tờ, không bắt chứng minh mình khó khăn",
      "Ghi ra giấy ai được nhận trước khi hàng bắt đầu thiếu",
      "Vạch các chuyến chở tận nơi cho người không tới điểm được",
      "Vẽ hàng nhận đồ đi một chiều: vào cửa này, ra cửa kia"
    ],
    [
      "Nhắn cho mười người có thể góp sức: vài tiếng nữa có mặt được không",
      "Viết thẻ vai trò: nhận hàng, phân loại, phát đồ, chở đi, an toàn",
      "Tổ chức một buổi tập hai tiếng với thùng hàng thật",
      "Ghi lại ai làm tốt việc gì và phân vai sẵn cho lúc thật"
    ],
    [
      "Gửi email cho cơ quan phòng chống thiên tai địa phương để giới thiệu điểm cứu trợ",
      "Liệt kê các nhóm cứu trợ quanh vùng và phần việc của từng nhóm",
      "Gặp nhau một buổi và thống nhất ai lấp chỗ trống nào",
      "Trao đổi số liên lạc ngoài giờ và giữ một bản trên giấy"
    ],
    [
      "In danh sách người góp sức và các số quan trọng — cứ coi như không có internet",
      "Chọn một cách xoay khi mất mạng: bộ đàm, bảng nhắn tin, hay người chạy tin",
      "Viết luật an toàn cứng: không ai bước vào công trình đã yếu, không bao giờ",
      "Nối vào cây liên lạc của mạng lưới sẵn sàng ứng phó và thử một lần"
    ]
  ],
  "recovery-peer-support": [
    [
      "Ghi ra một hai người trong xóm đã đi qua chặng cai nghiện và giữ vững được",
      "Hỏi riêng từng người xem có muốn dẫn nhóm không — không ép, không loan báo",
      "Tìm khóa tập huấn dẫn nhóm cùng cảnh gần nhất và ngày mở lớp kế tiếp",
      "Ghi tên mọi người dẫn nhóm tương lai vào lớp trước buổi gặp đầu tiên",
      "Nói to câu ấy ngay từ ngày đầu: bạn đồng cảnh, không phải người chữa bệnh"
    ],
    [
      "Mở một tài liệu hai cột: những việc nhóm mình làm, những việc không bao giờ làm",
      "Đặt chuyện khuyên cắt cơn và thuốc men lên đầu cột không bao giờ",
      "Để từng người dẫn nhóm đọc và ký vào",
      "Đưa bản phạm vi cho một người làm điều trị ở địa phương xem lại cho chắc"
    ],
    [
      "Liệt kê các chương trình điều trị, phòng khám và đường dây nóng ở địa phương",
      "Ghé hoặc gọi từng nơi, tự mình giới thiệu mạng lưới",
      "Hỏi từng nơi: gọi đích danh ai, và có được nhắc tên nơi đó không",
      "Viết kế hoạch xử lý khi có người quá liều và dán ở chỗ nhóm gặp nhau",
      "In danh sách liên lạc và mỗi tháng dò lại một lần"
    ],
    [
      "Liệt kê những phòng có lối vào kín đáo: thư viện, phòng sinh hoạt, nơi thờ tự",
      "Ghé hai chỗ ưng nhất, xem thử độ riêng tư và tiếng ồn",
      "Xác nhận phòng không có chất gây nghiện và mở vào những tối nhóm gặp",
      "Giữ một khung giờ cố định để lúc nào cũng chỉ một căn phòng ấy"
    ],
    [
      "Viết nháp mấy lệ nền: chuyện ở đây ở lại đây, không nhét lời khuyên, được quyền im",
      "Đọc cho những người dẫn nhóm nghe và cắt bỏ chỗ nào nghe như giảng đạo",
      "In gọn vào một tấm thẻ để trong phòng gặp",
      "Định sẵn sẽ đọc to mấy lệ ấy vào đầu từng buổi gặp, không sót buổi nào"
    ],
    [
      "Chọn hai khung giờ gặp: một buổi tối, một buổi ban ngày hoặc cuối tuần",
      "Viết tờ rơi bằng lời mộc mạc: miễn phí, mở cho mọi người, không đòi hỏi gì",
      "Bỏ mọi chữ nghe như trách móc hay như một cái tên bệnh",
      "Dán ở nơi bà con vẫn lui tới: phòng khám, tiệm giặt, quán cà phê",
      "Nhờ các chương trình bạn đưa tận tay cho từng người"
    ],
    [
      "Ghi vào lịch mỗi tháng một buổi trò chuyện riêng với từng người dẫn nhóm",
      "Lập lịch thay phiên đứng lớp để không ai phải ôm hết mọi buổi",
      "Hỏi từng người dẫn nhóm xem chỗ dựa của chính họ ở đâu",
      "Nói trước khi có ai cần đến: lùi lại một bước lúc nào cũng được"
    ]
  ],
  "community-fitness": [
    [
      "Viết năm câu hỏi nhanh: thích vận động kiểu nào và thấy kiểu nào là vừa sức",
      "Tuần này đem đi hỏi ở tiệm giặt, khu nhà người cao tuổi và cổng trường",
      "Đăng đúng mấy câu đó vào một nhóm chat của khu phố",
      "Đếm câu trả lời và khoanh lại hai môn được xin nhiều nhất"
    ],
    [
      "Ghi ra ba người ấm áp, đáng tin có thể dẫn một buổi đi bộ hay giãn cơ",
      "Nhắn từng người một lời nhờ cụ thể: mỗi tuần một buổi, không cần tay nghề gì",
      "Với môn nặng sức, hỏi chuyện chứng chỉ trước khi gật đầu",
      "Ghép mỗi người dẫn mới với một người dự phòng để đỡ tuần vắng"
    ],
    [
      "Ghi ra công viên, nhà văn hóa, nhà tập của trường gần đó, tới được mà không cần ô tô",
      "Gọi hoặc ghé từng nơi hỏi giá, giờ mở cửa và cách giữ chỗ",
      "Đi một vòng hai chỗ ưng nhất, xem nền, chỗ ngồi, bóng mát và nhà vệ sinh",
      "Ghi lại chỗ mọi người có thể trú nếu trời trở",
      "Giữ chỗ ưng nhất trong một tháng thử"
    ],
    [
      "Viết kế hoạch một trang cho buổi đầu tiên, bắt đầu từ bản dễ nhất",
      "Thêm một cách thay thế cho từng động tác: ngồi ghế, hoặc vòng ngắn hơn",
      "Bỏ mọi chữ nhắc tới cân nặng hay hình thức khỏi kế hoạch và tờ rơi",
      "Đưa kế hoạch cho một người cao tuổi và một người mới xem rồi chỉnh lại"
    ],
    [
      "Mua hoặc mượn một túi sơ cứu rồi soi lại bên trong có gì",
      "Ghi phần khởi động năm phút vào đầu kế hoạch của mọi buổi tập",
      "Thêm quãng nghỉ uống nước vào lịch và lời nhắc mang theo chai nước",
      "Dặn người dẫn cách nhận ra quá sức và làm cho việc nghỉ thành bình thường",
      "Viết sẵn một câu khuyên người mới tập nên hỏi bác sĩ trước"
    ],
    [
      "Chọn một ngày và một giờ trong tuần mà bạn giữ được suốt ba tháng",
      "Làm tờ rơi đơn giản, ghi rõ mọi lứa tuổi, vóc dáng và sức khỏe đều được chào đón",
      "Dán ở tiệm giặt, thư viện, khu nhà người cao tuổi và các phòng khám",
      "Chia sẻ vào các nhóm chat và nhờ mỗi người chuyển tiếp một lần",
      "Đặt lời nhắc báo sớm mỗi khi hủy buổi, đừng bao giờ im lặng"
    ],
    [
      "Mở đầu mỗi buổi bằng một vòng nhắc tên thật nhanh",
      "Nhờ một người tập đều đón chào người mới ở mỗi buổi",
      "Chừa năm phút chuyện trò ngay trong lịch buổi tập",
      "Mừng vì người ta đến đều, đừng bao giờ mừng cân nặng hay thành tích"
    ]
  ],
  "urban-orchard": [
    [
      "Ghi ra các mảnh đất khả dĩ: quỹ tín thác đất, đất công viên, chùa và nhà thờ còn đất trống",
      "Gửi email hoặc gọi cho chủ đất sáng nước nhất và xin một buổi gặp",
      "Hỏi thẳng xin dùng đất từ mười năm trở lên và xác nhận trên đất có nước",
      "Đưa các điều khoản vào thỏa thuận bằng giấy trước khi mua một cây nào"
    ],
    [
      "Tra vùng khí hậu nơi bạn ở và ghi ra những cây ăn trái hợp với vùng đó",
      "Hỏi bà con xem trái nào họ thật sự sẽ hái và ăn",
      "Vẽ phác mảnh đất theo tầng: cây cao, cây bụi, thảm phủ đất",
      "Xem từng giống trong danh sách cần cây nào thụ phấn cùng",
      "Chừa khoảng cách theo cỡ cây lúc lớn, đừng theo cỡ cây con"
    ],
    [
      "Tìm các vườn ươm gần nhất và ghi lại mùa bán cây rễ trần của họ",
      "Hỏi giá danh sách cây của bạn: rễ trần so với trồng chậu",
      "Hỏi xem có giảm giá cho nhóm phi lợi nhuận, có tài trợ hay chương trình tặng cây không",
      "Đặt hàng sớm — giống ngon hết rất nhanh"
    ],
    [
      "Cắm cờ hoặc cọc đánh dấu từng hố trồng theo bản thiết kế",
      "Xếp một ngày chung tay để làm cỏ và trải lớp phủ gốc",
      "Thử nguồn nước và trải sẵn vòi tưới hoặc kê thùng chứa",
      "Đặt sẵn phân ủ, dụng cụ và cọc chống cạnh từng hố trồng"
    ],
    [
      "Chọn một ngày trong mùa trồng cây và mời thật rộng",
      "Viết hướng dẫn một trang: đúng độ sâu, bồn tưới quanh gốc, vành phủ gốc",
      "Cắt một người trồng cây có nghề đi vòng kiểm lại từng cây",
      "Lo sẵn nước, đồ ăn vặt và nhạc — làm cho ra hội",
      "Kết thúc ngày bằng một lượt tưới đẫm cho từng cây"
    ],
    [
      "Ghi ra việc quanh năm: tưới, tỉa cành, phủ gốc, soi sâu bệnh",
      "Xin ba người một lời hứa cả năm có ghi tên, không phải sự quan tâm mơ hồ",
      "Lập lịch thay phiên tưới mùa nắng cho mấy cây non",
      "Ghi ngay vào lịch một ngày tỉa cành mùa xuân"
    ],
    [
      "Viết nháp lệ hái đơn giản: ai hái, khi nào hái, hái bao nhiêu",
      "Đem bản nháp ra một buổi họp của cộng đồng trước vụ đầu tiên",
      "Tìm chỗ cho phần dư: tủ lạnh chung, kho thực phẩm, bữa ăn chung",
      "Dán lệ đã thống nhất lên một tấm bảng ngoài vườn"
    ]
  ],
  "new-parent-support": [
    [
      "Ghi ra những người bạn quen biết nấu ăn, biết lái xe, hoặc đã nuôi con nhỏ",
      "Nhắn từng người kèm một vai cụ thể: nấu ăn, chạy việc vặt, hay làm bạn đồng cảnh",
      "Mời hai ba người đã làm cha mẹ làm những người đồng cảnh đầu tiên",
      "Ghi vào một chỗ giờ rảnh và giới hạn của từng người góp một tay"
    ],
    [
      "Chọn một công cụ xếp lịch bữa ăn miễn phí hoặc một cuốn lịch chung rồi chạy thử",
      "Làm một phiếu ngắn hỏi chuyện kiêng khem và dị ứng, chỉ hỏi một lần",
      "Viết lệ giao đồ: mặc định để trước cửa, có dán nhãn, dễ hâm nóng lại",
      "Chạy thử cả quy trình với một gia đình xung phong"
    ],
    [
      "Viết một danh sách những việc có thể nhận: việc vặt, giặt giũ, rửa chén, trông anh chị",
      "Ghép từng việc với người đã ghi tên nhận việc đó",
      "Đặt lệ: mỗi lần tới đều hỏi nhà cần gì và làm theo danh sách của họ",
      "Xếp lịch giúp hai tuần đầu cho gia đình đầu tiên"
    ],
    [
      "Mở một bảng tính đơn giản: tên, giúp việc gì, số điện thoại, giờ mở cửa",
      "Thêm nơi giúp chuyện cho con bú, chỗ chăm sức khỏe tinh thần sau sinh, phòng khám nhi",
      "Thêm chỗ xin đồ cho em bé quanh vùng, kể cả ngân hàng tã",
      "Gọi thử từng số một lần để chắc là còn dùng được",
      "Ghi vào lịch ba tháng một lần soi lại cuốn danh bạ"
    ],
    [
      "Chọn một chỗ nhỏ, dễ chịu và một khung giờ cố định",
      "Nhờ một người đã làm cha mẹ giữ vòng tròn đầu tiên",
      "Tập cho người đồng cảnh biết dấu hiệu trầm cảm và lo âu sau sinh",
      "Thống nhất lệ: khuyên tìm người có chuyên môn, không tự chẩn, không chờ",
      "Mời riêng ba bốn gia đình cho buổi đầu tiên"
    ],
    [
      "Viết ra các bước tìm hiểu lai lịch: ít nhất phải hỏi người quen, với ai vào nhà",
      "Viết ranh giới: cha mẹ đặt điều kiện, ghé ngắn thôi trừ khi được mời ở lâu",
      "Thêm lệ: không bao giờ ghé mà không báo trước",
      "Đi qua các nếp này với từng người trước lần ghé đầu tiên của họ"
    ],
    [
      "Ghi ra các dự án anh em: ngân hàng tã, nhóm trông trẻ chung, nhóm đón người mới",
      "Gặp một người đứng ra tổ chức ở mỗi bên để thống nhất cách chuyển tiếp",
      "Làm một phiếu ghi dùng chung để mỗi nhà chỉ kể chuyện mình một lần",
      "Cho mỗi gia đình đúng một đầu mối liên lạc"
    ]
  ],
  "foster-kinship-support": [
    [
      "Gọi cơ quan bảo trợ trẻ em hoặc chương trình hướng dẫn cho họ hàng và xin một buổi gặp",
      "Nhờ nhà trường và nhóm tôn giáo chuyển lời ngỏ của bạn tới các gia đình đang nuôi trẻ",
      "Viết tin nhắn liên lạc đầu tiên như một lời ngỏ giúp, đừng như một cuộc xét duyệt",
      "Hỏi những gia đình đầu tiên: tuần đầu cần gì, năm đầu cần gì"
    ],
    [
      "Liệt kê theo tuổi: quần áo, giường, ghế ô tô, đồ dùng từ sơ sinh đến tuổi teen",
      "Mở một đợt quyên góp có trọng tâm, ghi rõ cỡ nào món nào đang thiếu",
      "Soi từng ghế ô tô và cũi theo hạn sử dụng và danh sách thu hồi",
      "Phân loại và dán nhãn theo tuổi và cỡ ngay khi đồ về",
      "Tìm một chỗ chứa khô ráo mà báo gấp là có người tới lấy được"
    ],
    [
      "Viết danh sách đồ cần xếp: quần áo vài ngày, đồ vệ sinh, một món để ôm cho ấm",
      "Xếp những túi đầu tiên, chia theo tuổi và cỡ",
      "Mời hai người lái xe trực sẵn, gọi là chở tới trong vài tiếng",
      "Lập đúng một số điện thoại hoặc một hộp thư nhận yêu cầu khi có trẻ mới về",
      "Chạy thử một lần có bấm giờ, từ lúc nhận yêu cầu đến lúc tới cửa"
    ],
    [
      "Hỏi cơ quan xem ai được phép trông thay và theo những luật nào",
      "Mời và kiểm tra người trông thay đúng theo những luật đó",
      "Làm một tờ đặt lịch đơn giản để người nuôi dùng mà không phải năn nỉ ai",
      "Bắt đầu bằng những khoảng ngắn nhưng đều — một buổi tối chắc chắn hơn một cuối tuần hiếm hoi"
    ],
    [
      "Chọn một khung giờ cố định và một chỗ kín đáo, dễ chịu",
      "Nhờ một người đã nuôi trẻ lâu năm cùng đứng ra dẫn buổi gặp",
      "Mời qua cơ quan bảo trợ và nhà trường — đừng bao giờ đưa danh sách gia đình cho ai",
      "Lo người trông trẻ trong lúc gặp mặt để người nuôi thật sự tới được",
      "Mở đầu mỗi buổi bằng một lời nhắc giữ kín chuyện trong phòng"
    ],
    [
      "Mở một bảng tính ghi nơi trợ giúp, khoản trợ cấp và chỗ nâng đỡ hiểu về sang chấn",
      "Thêm những khoản dành riêng cho họ hàng nuôi trẻ mà chẳng ai nói cho họ",
      "Gọi từng chỗ xác nhận còn hiệu lực rồi mới đưa vào danh bạ",
      "Ngỏ lời ngồi cùng các gia đình trong lúc họ làm hồ sơ"
    ],
    [
      "Xin cơ quan bảo trợ bản giấy về luật kiểm tra lai lịch và trình báo bắt buộc",
      "Viết bản quy ước một trang của nhóm: kiểm tra lai lịch, nghĩa vụ trình báo, giữ kín",
      "Đặt lệ riêng tư: không ảnh, không kể chuyện, không chi tiết khi chưa được phép",
      "Đi qua bản quy ước với từng người trước khi họ tiếp xúc với gia đình nào",
      "Ghi vào lịch mỗi năm một lần đọc lại bản quy ước"
    ]
  ],
  "weather-survival-outreach": [
    [
      "Viết hai danh sách đồ: một cho mùa rét, một cho mùa nóng",
      "In thẻ ghi các nơi trú tạm và số điện thoại lúc nguy cấp cho từng túi",
      "Tổ chức một buổi gói đồ và làm xong hai mươi túi đầu tiên",
      "Cất ở chỗ khô ráo mà người đi phát lấy được thật nhanh"
    ],
    [
      "Hỏi giá sỉ chăn, vớ, nước và gói bù điện giải ở hai ba nhà cung cấp",
      "Xin cửa hàng và các nhóm tôn giáo quyên góp trước khi vào mùa",
      "Mở một đợt quyên góp có trọng tâm, gọi tên đúng từng món cần",
      "Để dành đủ hàng cho một đợt tiếp thêm giữa mùa"
    ],
    [
      "Liên lạc với những người đã đi các tuyến này và xin đi cùng một chuyến",
      "Đi theo một hai chuyến trước khi tự mình vẽ bản đồ gì",
      "Ghi vị trí một cách co giãn — người ta di chuyển, nhất là lúc trời xấu",
      "Tập thói quen cập nhật bản đồ sau mỗi chuyến đi"
    ],
    [
      "Viết đề cương buổi tập: trò chuyện tôn trọng, đi thành cặp, xử lý cấp cứu",
      "Nhờ một người dày dạn ngoài đường cùng dẫn buổi tập đầu tiên",
      "Xếp buổi tập trước khi vào mùa",
      "Giữ danh sách ai đã được tập — chưa có tên thì chưa được đi phát"
    ],
    [
      "Chốt những con số dự báo nào thì khởi động một chuyến đi và ghi ra giấy",
      "Vạch tuyến sao cho tới trước với những người phơi mình nhiều nhất",
      "Xếp mỗi tuyến một cặp, và có người dự phòng cho cả hai",
      "Chọn ai theo dõi dự báo và ai bấm tin báo lên đường"
    ],
    [
      "Ghi ra điểm sưởi ấm, điểm tránh nóng, giường ở nơi trú tạm và điểm phát đồ chung",
      "Gọi từng nơi kiểm lại giờ giấc và luật lệ trước khi in bất cứ thứ gì",
      "In thẻ nhỏ để phát dọc đường trong mỗi chuyến đi",
      "Đặt lịch mỗi tuần dò lại — chỉ tới một cánh cửa đóng là mất lòng tin"
    ],
    [
      "In một tấm thẻ bỏ túi ghi dấu hiệu hạ thân nhiệt và say nắng",
      "Tập kỹ luật này trong buổi huấn luyện: gọi cấp cứu ngay, đừng bao giờ chờ xem sao",
      "Tập phần làm trong lúc chờ: che mát và cho uống nước, hoặc đắp chăn và chắn gió",
      "Bảo mọi người lưu sẵn số cấp cứu và số trợ giúp lúc nguy cấp vào điện thoại"
    ]
  ]
};
