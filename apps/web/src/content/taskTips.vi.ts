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
// Vietnamese per-task tips (i18n Phase 2). Loaded lazily via
// content/bundles/vi.ts — never import this statically from app
// code.
export const TASK_TIPS_VI: Record<string, readonly string[]> = {
  "community-fridge": [
    "Kiểm tra cho chắc ổ cắm là ổ ngoài trời riêng có chống giật (GFCI) và vẫn có điện sau giờ đóng cửa — rất nhiều ổ ngoài mặt tiền được nối vào một công tắc bên trong mà tối đến ai đó tắt đi, sáng ra tủ đã ấm lên rồi.",
    "Cắm thử chiếc tủ được tặng và cho chạy trọn một ngày trước khi đóng gì bao quanh nó — và chừa một khoảng rộng bằng bàn tay phía sau lưng tủ, vì dàn nóng bị bịt kín sẽ quá nhiệt rồi tắt ngay đợt nắng nóng đầu tiên.",
    "Ép nhựa tấm bảng, không thì sau trận mưa đầu tiên nó nát bét — và viết danh sách “không nhận” theo hướng an toàn chứ đừng như lời mắng, để mọi người tin chiếc tủ thay vì thấy mình bị soi.",
    "Ghi hai tên vào mỗi ca, đừng ghi một — chỉ một người bận việc là chiếc tủ cả tuần không được lau. Một cuốn sổ ghi ngày dán bên trong giúp người sau biết lần dọn gần nhất là khi nào.",
    "Kể cho những cửa hàng còn e ngại nghe về các quy định bảo vệ người tặng thực phẩm — nỗi sợ phải chịu trách nhiệm thường là lý do của cái lắc đầu, biết mình được che chắn là họ gật. Rồi chốt một giờ đi lấy cố định.",
    "Dùng một số chung hoặc một số Google Voice miễn phí, đừng dùng số riêng của một người góp tay — khi người đó chuyển đi hay đuối sức, số dán trên tủ không nên chết theo."
  ],
  "community-garden": [
    "Ghi vào giấy hai điều mà những cái bắt tay hay bỏ qua: ai trả tiền nước, và chủ đất phải báo trước bao lâu trước khi lấy lại mảnh đất — một khu vườn bị đòi giữa mùa là mất trắng công cả năm.",
    "Lấy mẫu ở nhiều chỗ chứ đừng chỉ một — chì đọng lại gần những bức tường sơn cũ và dọc hàng rào. Gửi mẫu đi trước ngày dựng vườn vài tuần, vì kết quả về chậm mà chưa có nó thì chưa vẽ luống được.",
    "Đừng dùng tà vẹt đường sắt và gỗ cũ đã tẩm hóa chất cho luống trồng đồ ăn — chúng ngấm creosote và thạch tín vào thức ăn của bạn. Gỗ tuyết tùng chưa xử lý, gạch block hay kiện rơm thì an toàn hơn.",
    "Hãy viết ngay những điều khoản khô khan: một luống sẽ ra sao khi có người biến mất giữa mùa, và dụng cụ về tay ai nếu nhóm tan. Quyết khi mọi người còn thân nhau là cách giữ lại tình thân về sau.",
    "Neo lịch của bạn vào ngày sương giá cuối cùng ở vùng mình, đừng theo tờ lịch hay gói hạt giống từ một vùng khí hậu khác — một đợt sương giá bất ngờ có thể quét sạch cả đợt gieo ngày mở vườn.",
    "Xếp người cho tháng Bảy và tháng Tám trước tiên — đó mới là lúc lịch thay phiên đổ vỡ và các luống chết, chứ không phải mùa xuân. Tưới lúc sáng sớm chứ đừng tưới giữa trưa, để nước ngấm xuống thay vì bốc hơi trên lá đang nóng.",
    "Hái thường xuyên ngay cả khi chưa ai đói — đậu, dưa chuột và bí ngòi ngừng ra trái ngay khi bị để già lấy hạt. Đưa phần dư sang tủ lạnh trong ngày; rau héo thì chẳng giúp được ai."
  ],
  "tool-lending-library": [
    "Chọn chỗ khô ráo và khóa được, và giải quyết chuyện trả đồ trước ngày mở: một thùng trả đồ có dán nhãn hay một khe bỏ đồ ngoài giờ nghĩa là bạn không còn là cánh cửa duy nhất dẫn tới cả kho đồ.",
    "Cắm điện và cho chạy thử mọi món chạy điện trước khi nhận — cái khoan quay không tải thì ngon mà có lực vào là đứng máy chỉ là sắt vụn. Kiểm cả dây điện có bị sờn và nắp che lưỡi cắt còn ăn khớp không; đó chính là những tai nạn bạn sẽ phải gánh.",
    "Ghi luôn giá mua lại của từng món vào sổ kê — đó là con số bạn sẽ cần khi cân nhắc có nên đi đòi một món không thấy quay về hay không. Đánh dấu tên thư viện lên từng món để chuyện “tôi tưởng là của mình” không xảy ra được.",
    "Một dòng cam kết tự chịu rủi ro lúc ghi tên còn quan trọng hơn tiền phạt trễ — hãy nói rõ người mượn tự chịu rủi ro khi dùng đồ. Đừng bắt đặt cọc với đồ thường ngày để chi phí không thành rào cản; chỉ giữ tiền cọc cho một hai món đắt tiền.",
    "Xin một số điện thoại mà sau này bạn nhắn được thật, chứ đừng chỉ xin cái tên — chính lời nhắc nhẹ mới kéo đồ nghề quay về, mà bạn không nhắn được cho một chữ ký. Hãy thử nhắn ngay tại chỗ.",
    "Hãy chỉ cả những phần khó xử, đừng chỉ mỗi cách cho mượn: cách từ chối một món đồ tặng đã hỏng sao cho dễ chịu, và cách ghi lại hư hỏng lúc nhận về mà không làm người mượn thấy như bị buộc tội. Chỉ cho họ chỗ để hộp cứu thương và kính bảo hộ.",
    "Ghi lại mọi câu “có… không?” mà bạn chưa đáp được — chính danh sách đó, chứ không phải phỏng đoán của bạn, cho biết nên sắm gì tiếp. Chọn sẵn một ngày cố định để mài và tra dầu, để việc giữ gìn không lặng lẽ thành không bao giờ."
  ],
  "neighborhood-care-network": [
    "Giữ tấm “bản đồ” này trong đầu bạn hoặc ở chỗ có khóa, đừng để trên một bảng tính dùng chung — một danh sách những hàng xóm lẻ loi, dễ tổn thương chính là thứ bạn không muốn lọt ra ngoài. Hãy để những người quen biết được tin cậy giới thiệu giùm, thay vì gõ cửa khi chưa quen ai.",
    "Hãy gọi thật cho những người được nêu tên — đừng chỉ thu về rồi cất đó. Hai người sẵn lòng đứng ra bảo đảm, cộng thêm một quy ước cứng “không ai tự mình cầm tiền hay chìa khóa của hàng xóm”, đủ để chặn lại kẻ xấu hiếm hoi bị hút tới đúng thứ quyền tiếp cận này.",
    "Hãy nói rõ lần ghép đầu là thử, và mở sẵn cho cả hai một lối ra nhẹ nhàng, không cần giải thích — một cặp không hợp mà không ai thoát ra được sẽ thành gánh nặng, và gánh nặng thì bị bỏ ngang.",
    "Cắm buổi hỏi thăm vào một ngày và một giờ cố định, để lần nào lỡ mất là thấy ngay — “người này thứ Ba nào cũng bắt máy” chính là thứ biến một chiếc điện thoại im lặng thành một tín hiệu, thay vì một cái nhún vai.",
    "Hãy hỏi ngay từng hàng xóm xem lúc nguy cấp họ muốn ai được gọi — và liệu đó có phải là người nhà chứ không phải cảnh sát. Một chuyến kiểm tra sức khỏe có thể hóa tồi tệ với hàng xóm chưa có giấy tờ, người khuyết tật hay người da đen; hãy tôn trọng lựa chọn của họ trước khi có chuyện.",
    "Hãy giữ những người góp tay ở phần việc không thuộc chuyên môn y tế — chở đi, đi chợ, dọn quang lối đi. Ngay khi việc trôi sang liều thuốc, thay băng vết thương hay nâng đỡ người, đó là phần của người có chuyên môn, và nói thẳng điều đó là giữ an toàn cho tất cả.",
    "Hãy đổi việc cho người ta trước khi họ cháy sạch, đừng đợi tới lúc họ bỏ cuộc — khi ai đó nói mình đã đuối, thường là họ đã gánh nhiều tháng rồi. Một buổi nói riêng cũng hứng được nỗi buồn khi người hàng xóm họ chăm sóc yếu đi."
  ],
  "emergency-preparedness": [
    "Hãy xem bản đồ ngập lụt và cháy rừng chính thức của vùng bạn thay vì đoán mò — và ghi lại ai đang chạy thiết bị y tế bằng điện, vì bên điện lực có danh sách ưu tiên cấp điện lại mà những hàng xóm đó ghi tên ngay từ bây giờ được.",
    "Cất bản danh sách giấy ở ít nhất hai nhà, đừng để một nhà — cả cây liên lạc thành vô dụng nếu nó nằm đúng căn nhà bị ngập. Ghi thẳng lên tờ giấy ai cần gõ cửa thay vì gọi điện, và bằng tiếng gì.",
    "Hãy thống nhất một kênh bộ đàm duy nhất và một giờ gọi nhau cố định — “đầu mỗi giờ” — không thì ai cũng phát vào khoảng không. Và hãy thử bộ đàm thật, ở đúng khoảng cách thật của khu phố, trước khi trông cậy vào chúng.",
    "Nước và pin đều có hạn — dán một ngày thay mới lên thùng đồ và ghi vào cùng cuốn lịch với ngày làm mới danh sách liên lạc. Cất ở chỗ hai ba người với tới được, để không có cánh cửa khóa nào chắn giữa bạn và đồ dự phòng.",
    "Hãy hỏi cho rõ ba điều mà một cái bắt tay thường bỏ qua: ai giữ chìa khóa lúc hai giờ sáng, máy phát có sẵn nhiên liệu không, và chỗ đó xe lăn vào được không. Một điểm an toàn mà bạn không vào nổi thì chỉ là một tòa nhà.",
    "Hãy để mọi người tự tay tìm ra van khóa gas, khóa nước nhà mình và cái mỏ lết cần dùng — đọc về nó thì không tính. Bấm giờ chạy thử cây liên lạc từ đầu tới cuối; bạn sẽ tìm ra mắt xích đứt ngay bây giờ, thay vì giữa cơn lụt.",
    "Hãy đặt sẵn một người dự bị cho mỗi vai — người phụ trách khu phố có thể lại đúng là người đang kẹt lại hay đi vắng khi chuyện xảy tới. Nhất là hãy để hai người cho phần đi xem những ai yếu về sức khỏe; đó là danh sách không thể chờ."
  ],
  "free-store": [
    "Hãy ưu tiên chỗ ở tầng trệt và có lề đường để tấp xe vào — bạn sẽ khuân từng xe đồ ra vào, còn một căn tầng ba không thang máy thì vắt kiệt người góp tay trước cả khi mở cửa. Một ngày cố định lặp lại tạo ra thói quen giữ cho việc này sống.",
    "Dán danh sách “không nhận” ngay ở cửa nhận đồ, đừng chỉ dán bên trong — phân loại là đã quá muộn. Thêm vào đó ghế ngồi ô tô cho trẻ đã dùng, mũ bảo hiểm và nệm: độ an toàn của chúng hết hạn một cách vô hình, và một con rệp giường trong một món đồ tặng có thể đóng cửa cả cửa hàng.",
    "Hãy phân loại ngay ở cửa, trước khi món nào chạm tới mặt bàn — một cái lò nướng hỏng mà lọt lên kệ chỉ thành rắc rối của bạn hai lần. Giữ một thùng dán nhãn “chuyển tiếp” mở suốt buổi để đống đồ loại ra không bao giờ thành núi.",
    "Hãy bày ra ít hơn số bạn có và bổ sung dần từ phía sau khi vơi — một cái bàn vơi nửa mà gọn gàng đọc ra là đi chọn đồ đàng hoàng; một đống chất cao đổ ào ra thì đọc ra là “đồ bỏ đi của cả nhà đây”.",
    "Dặn những người đón tiếp đừng bao giờ hỏi vì sao ai đó tới hay họ lấy bao nhiêu — không hỏi han gì chính là toàn bộ ý nghĩa, và chỉ một người tọc mạch là hỏng hết. Để một người đi vòng dọn lại, để căn phòng không bao giờ trông như vừa bị lục tung.",
    "Hãy hỏi trước buổi mở cửa, đừng hỏi sau, về giờ mở của bên nhận và thứ họ thật sự lấy — rất nhiều nơi không nhận nệm, đồ điện hay bộ đồ thiếu món. Chở đi ngay trong ngày để trả lại chỗ trống trơn và giữ được chủ chỗ."
  ],
  "skill-share": [
    "Những người dạy hay nhất thường bảo sở trường của mình “chẳng có gì ghê gớm”. Đừng hỏi “bạn giỏi nhất chuyện gì?”, hãy hỏi mọi người vẫn hay tìm tới họ nhờ giúp chuyện gì.",
    "Nỗi sợ là khoảng lặng, nên hãy cùng người lần đầu lên kế hoạch cho năm phút mở màn theo từng phút; khi tay đã bận và mọi người đã nói chuyện, sự hồi hộp tự nó tan đi.",
    "Hãy so căn phòng với thứ buổi học thật sự cần trước khi đặt chỗ — lớp nấu ăn trong phòng không có bồn rửa sẽ hỏng giữa chừng. Và hỏi cho rõ ai mở cửa, ai khóa cửa.",
    "Hãy hỏi lại từng người đứng lớp vào tuần trước buổi của họ. Một người dạy vắng mặt khi giờ đã đăng lên sẽ khiến bạn mất chính những người đã tới — và vài người trong số đó sẽ không quay lại.",
    "Hãy hỏi đúng những người đang không tới, chứ đừng hỏi căn phòng đã tới rồi. Rào cản thường chỉ là một điều rất cụ thể — chuyến xe buýt cuối lúc bảy giờ, hay không có ai trông con."
  ],
  "bulk-buying-coop": [
    "Hãy rủ nhiều hơn mức tối thiểu của nhà cung cấp chừng một phần năm. Đợt nào cũng có vài nhà bỏ lượt, mà một đơn hụt mức thì hoặc không được giao, hoặc giao với giá tệ hơn cho tất cả mọi người.",
    "Hãy hỏi mức tối thiểu để được giao, cách xử lý khi giao thiếu, và giá chốt lúc đặt hay lúc giao. Một “giá tốt” còn trôi nổi tới lúc giao có thể phá tan cách bạn chia tiền.",
    "Hãy khóa bảng lại đúng hạn chốt — sao ra một bản rồi tắt quyền sửa — để không có thay đổi muộn nào làm lệch số lượng sau khi người điều phối đã cộng đơn và trả tiền cho nhà cung cấp.",
    "Tính giá từng đơn vị đến từng đồng lẻ và làm tròn lên, đừng làm tròn xuống. Những phần lẻ bạn tự gánh sẽ cộng dồn suốt một đợt, còn khoản đệm là để bù một bao gạo rách, chứ không phải để đó thành tiền dôi.",
    "Hãy hỏi cho rõ xe tải dỡ hàng bằng cách nào — bàn nâng thủy lực, xe nâng tay, hay chỉ thả xuống lề đường. Một pa lét nặng nửa tấn mà không có cách nào đưa xuống là chuyện rất mệt để học vào sáng ngày giao hàng.",
    "Hãy đặt cân về 0 với từng cái hộp đựng và cân thẳng vào chính cái túi mỗi hộ mang về. Ước chừng “khoảng nửa ký” một món đắt tiền bằng mắt chính là chỗ mà lòng tin lẫn tiền bạc lặng lẽ rò đi.",
    "Hãy ghi lại người điều phối đợt này thật sự đã làm những gì, khi còn nhớ rõ. Vai này chỉ luân phiên êm thấm khi người kế tiếp nhận được một bản việc cần làm, chứ không phải một câu đố."
  ],
  "repair-cafe": [
    "Người sửa đồ điện tử và đồ gia dụng luôn có hàng dài nhất và kiệt sức sớm nhất — hãy rủ cho được hai người trước ngày mở, rồi đẩy những việc dễ ăn như khâu lại đường viền hay vặn con ốc lỏng sang những bàn tay mới.",
    "Để chỗ hàn, chỗ có nhiệt và chỗ làm với pin tránh xa đám đông và gần nơi thoáng gió, rồi lấy điện qua vài ổ cắm chống quá tải mà bạn đã thử trước — nhảy cầu dao một cái là mọi bàn đứng hình cùng lúc.",
    "Một ngày cố định trong tháng — ví dụ thứ Bảy đầu tiên — hơn hẳn một ngày trôi nổi. Mọi người nhớ theo nhịp, và những người sửa đồ có thể giữ sẵn chỗ trống đó trước cả mấy tháng thay vì lần nào cũng phải hẹn lại.",
    "Ngay lúc nhận đồ, hãy ghi một dòng phân loại nhanh — chắc sửa được, khó, hay cần thay linh kiện — để không ai xếp hàng cả tiếng rồi mới nghe tin cái lò nướng của mình vô phương cứu chữa.",
    "Vạch một lằn ranh cứng với đồ cắm điện lưới đã bị mở ra và pin phồng: người sửa nào thấy không chắc thì nói không, và đó là quyết định đúng, không phải thất bại. Dán quy ước ấy lên tường để không ai nhận lời từ chối như chuyện cá nhân.",
    "Mỗi bàn để một hộp đồ dùng chung và một tờ giấy đánh dấu mỗi lần lấy. Miếng vá hay cầu chì bao giờ cũng hết đúng hôm không ai kiểm, và câu “lần trước ai mua chỉ” là cuộc cãi nhau nên chặn từ trước."
  ],
  "rides-transportation": [
    "Hãy xem tận mắt giấy tờ thật — đừng nghe suông câu “yên tâm, tôi có bảo hiểm rồi”. Một tấm ảnh chụp bằng lái và thẻ bảo hiểm còn hạn lưu trong hồ sơ mới là thứ che chắn cho mọi người vào đúng cái ngày có chuyện thật.",
    "Hỏi bằng văn bản bên bảo hiểm của từng người lái xem phần chở giúp không công có được nhận hay không. Nhiều hợp đồng cá nhân loại trừ mọi thứ trông giống việc kinh doanh, và bạn cần câu trả lời ấy trước khi phải đòi bồi thường chứ không phải sau.",
    "Hỏi ngay từ đầu về chuyến về và về mọi dụng cụ đi lại. Một người mắc kẹt ở phòng khám vì chiếc xe lăn không vừa cái xe là thất bại người ta nhớ lâu nhất.",
    "Xác nhận lại với cả người lái lẫn người đi xe từ hôm trước, nói miệng hay nhắn tin đều được. Cứ lặng lẽ cho rằng chuyến xe vẫn còn đó chính là cách một người lỡ mất buổi chạy thận.",
    "Nói thẳng những gì nhóm không làm — không nhận ca cấp cứu, không nhận sát giờ, không đi ra ngoài vùng — để một lời từ chối rơi xuống như một quy ước ai cũng biết, chứ không phải một cú hắt hủi giữa lúc ngặt nghèo.",
    "Đừng bao giờ để lộ ra việc một người không góp nổi tiền xăng. Giữ mọi khoản góp thật sự tùy tâm và không ai thấy ngay lúc lên xe, nếu không bạn đã lặng lẽ dựng lại đúng cái rào cản mình định dỡ bỏ.",
    "Chuyến đầu tiên của một người lái nên ghép với người đi xe đã quen mặt hoặc có thêm một người nữa đi cùng, và nhớ hỏi thăm lại sau đó. Cuốn sổ ghi chuyến không phải thủ tục rườm rà — đó là thứ bạn sẽ ước mình có nếu có chuyện gợn lên."
  ],
  "tenant-union": [
    "Hãy chọn những người biết giữ kín chuyện, chứ không phải chỉ những giọng nói to nhất. Việc này sống nhờ chuyện người thuê nhà dám giao cho ban nòng cốt một rủi ro bị trả đũa có thật, và chỉ một lần lộ tin là niềm tin ấy tan.",
    "Đừng bao giờ viết tên một người thuê nhà cạnh lời than phiền của họ ở nơi chủ nhà có thể thấy — hãy đặt mã cho từng căn, giữ bảng đối chiếu ở chỗ khác, và hỏi ý trước khi ghi lại chuyện của bất kỳ ai.",
    "Ghi ngày tháng cho từng thông tin và ghi luôn điều luật đứng sau nó. Luật về nhà thuê thay đổi, và “năm ngoái có người bảo tôi thế” chính là cách một nghiệp đoàn phát ra một cái hạn đã sai từ lâu.",
    "Diễn tập trước khi cần đến, và chỉ hứa một mức trả lời mà nhóm giữ được. Một chuỗi gọi điện chưa ai thử bao giờ sẽ im bặt đúng vào lúc có người đang bị khóa cửa ngoài chính nhà mình.",
    "Kết buổi bằng bước đi cụ thể đầu tiên cho người vừa nhận giấy tờ của tòa — cái hạn và số điện thoại cần gọi — vì đó là thứ duy nhất một người đang hoảng thật sự mang được về nhà tối hôm ấy.",
    "Đặt cái hạn phải trả lời tòa lên đầu tiên và in đậm. Lỡ hạn đó thường là thua ngay vì vắng mặt, dù lẽ phải nghiêng về phía người thuê nhà đến đâu.",
    "Hãy nắm giờ tiếp nhận và sức chứa thật của từng nơi, chứ không chỉ số điện thoại. Chuyển người tới một phòng đã kín chỗ hoặc thứ Hai mới mở thì không phải là chuyển giao, khi cái hạn rơi vào thứ Sáu."
  ],
  "childcare-collective": [
    "Hãy nói ngay bây giờ, nói thành lời, về khác biệt trong cách dạy con và chuyện cho xem màn hình. Chuyện nổ ra hiếm khi vì cái lịch — mà vì cái ngày có người dạy con bạn theo lối bạn không bao giờ cho phép.",
    "Hãy viết quy ước không bao giờ ở riêng một mình với trẻ như thứ bạn giữ chặt nhất đúng với những nhà bạn tin nhất. Cái ngoại lệ “chỉ lần này thôi” với một người bạn thân chính là chỗ những nhóm như thế này vỡ.",
    "Hạ người xuống ngang tầm mắt một đứa nhỏ rồi bò khắp phòng — dây điện, tủ kệ dễ đổ, cái túi của khách tới chơi có thuốc bên trong. Mối nguy người lớn nhìn lướt qua chính là thứ đứa bé tìm thấy đầu tiên.",
    "Cho mọi nhà thấy số giờ của nhau ngay từ ngày đầu. Ấm ức lớn lên trong lặng lẽ, còn một nhà tự thấy mình đang nhận nhiều hơn cho sẽ tự nhận trông trẻ trước khi có ai phải mở lời.",
    "Giữ tờ ghi dị ứng và thuốc của từng đứa trẻ ở chỗ người đang trực trông với tay là lấy được trong vài giây, và chốt quy ước khi trẻ bị bệnh trước khi một buổi sáng con sốt ép cả nhóm phải quyết vội trong ấm ức.",
    "Diễn tập đúng tình huống cấp cứu — ai gọi, ai ở lại với những đứa còn lại, tờ thông tin cất ở đâu. Biết cách đặt bé sơ sinh ngủ an toàn cũng ít nghĩa lý nếu không ai rõ sáu mươi giây đầu tiên phải làm gì.",
    "Hỏi cả lũ trẻ xem buổi đó thế nào, chứ đừng chỉ hỏi cha mẹ, và nói thẳng về những lần suýt xảy ra chuyện. Một buổi thử trôi êm vì né hết ca khó thì chưa thử được đúng thứ sẽ thật sự làm căng lòng tin."
  ],
  "community-composting": [
    "Hãy đứng ngay tại chỗ định làm và tìm xem vòi nước gần nhất ở đâu, cửa sổ nhà hàng xóm gần nhất ở đâu; một đống ủ khó tưới nước, hay nằm ngay dưới phòng ngủ của người ta, là đống bạn sẽ phải dời đi trước khi hết mùa nóng.",
    "Một đống ủ nóng cần chừng một mét khối nguyên liệu thì mới nóng lên thật và diệt được hạt cỏ dại — ít hơn thế là bạn đã dựng một đống ủ nguội cứ nằm ì ra đó, dù cái thùng có tên gọi là gì đi nữa.",
    "Hãy gom sẵn chất nâu trước khi mẩu rác đầu tiên tới — một đống lá khô hay một chồng bìa các-tông để rút dần — vì rác nhà bếp thì ngày nào cũng có, còn lá khô mỗi năm chỉ rụng một mùa.",
    "Nhắc mọi người bỏ qua mấy loại túi lót “phân hủy được”; chúng không rã trong một đống ủ ở nhà và biến thành đúng những mảnh nhựa bạn phải nhặt ra khỏi phân đã hoai suốt mấy tháng trời.",
    "Dán bảng những thứ không nhận lên ngay nắp thùng, đừng dán lên tấm áp phích ở đâu đó, và hãy dùng hình vẽ — một khúc xương gà bị gạch chéo đọc nhanh hơn cả đoạn văn, ở bất cứ thứ tiếng nào.",
    "Chỉ cho mọi người phép thử độ ẩm kiểu miếng bọt biển vắt ráo, và giao mỗi tuần cho một người có tên hẳn hoi, đừng giao cho “cả nhóm” — việc chung không tên là tuần đống ủ bị bỏ quên.",
    "Hãy để mẻ phân đã xong hoai thêm vài tuần nữa và sàng bỏ những cục lớn trước khi đem chia — phân còn đang “chín” sẽ làm cháy chính những cây con mà nó đáng ra phải nuôi, và câu chuyện đó lan rất nhanh."
  ],
  "free-little-library": [
    "Chỗ dột làm hỏng sách không phải cái mái — mà là khe cửa và nước ngấm ngược lên từ cái cột; hãy bịt kín đáy, thêm một gờ chặn dưới cánh cửa, và xịt thử bằng vòi nước trước khi xếp sách vào.",
    "Đặt tủ ở nơi người ta vốn đã đi chậm lại — một bến xe buýt, một cổng trường — chứ không phải nơi người ta phóng xe qua, và chừa lối đi thoáng để xe lăn hay xe đẩy em bé qua lọt.",
    "Sách thiếu nhi ra nhanh nhất và về ít nhất, nên hãy trữ dư loại đó; và lặng lẽ đem đi tái chế những cuốn ố nước hay giáo trình từ thập niên 1990 trước khi chúng vào tủ — chỉ một ngăn toàn sách bỏ đi là người ta thôi mở cửa tủ.",
    "Tấm bảng viết gì thì viết, cứ để nó đọc lên như một lời mời chứ không phải một bổn phận — người ta sẽ lấy sách mà không để lại cuốn nào, và như thế cũng được; nếu họ thấy mình còn thiếu một cuốn, họ sẽ không lấy cuốn họ đang cần, mà ý nghĩa của cả việc này là không dựng lên rào cản nào.",
    "Hãy tìm sẵn thêm một người chăm nom dự phòng, và dặn cả hai những gì phải bỏ ra ngay khi thấy: bất cứ cuốn nào mốc, cuốn nào có ai đó viết số điện thoại lạ vào trong, và sách cho người lớn nằm trong cái tủ trẻ con thò tay vào."
  ],
  "community-first-aid-training": [
    "Hỏi họ lấy bao nhiêu và có miễn cho nhóm cộng đồng không — nhiều nơi có miễn — rồi chốt mức mấy người học chung một mô hình, vì một lớp CPR mà hơn tám người chung một cái thì chỉ là đứng xem chứ không phải tập.",
    "Kiểm hạn dùng của naloxone ngay hôm nhận và ghi lại ở chỗ bạn thật sự sẽ nhìn thấy — và đừng cất trong ô tô nóng hay nhà kho lạnh giá; nhiệt độ quá mức làm hỏng thuốc trước cả cái hạn ghi trên hộp.",
    "Bạn cần khoảng sàn trống để quỳ xuống ép tim, chứ không chỉ bàn với ghế — hãy xem phòng có chỗ đó không, cùng với một bồn rửa tay và một lối vào mà xe lăn đi được, trước khi giữ phòng.",
    "Lớp miễn phí thường vắng 30-40% so với danh sách, nên hãy nhắc lại từ hôm trước và nhận dư một chút; có chỗ trông trẻ và có gì ăn kéo được người bạn mong có mặt nhất hơn mọi tờ rơi.",
    "Nói ngay từ đầu rằng chỉ tập trên mô hình, không ai phải chạm vào người khác, và ai cũng có thể ra ngoài trong phần nói về quá liều — trong phòng có người đã mất người thân, và bạn muốn họ còn quay lại lần sau.",
    "Giữ một danh sách đơn giản ai đã nhận naloxone và hạn dùng đến khi nào, để nhắc lấy lọ mới trước khi hết hạn, và xếp buổi ôn lại đầu tiên trong vòng một năm — đôi tay quên nhịp ép tim nhanh hơn người ta tưởng."
  ],
  "time-bank": [
    "Hãy đẩy mọi người nói ra cả điều họ sẽ nhờ, chứ đừng chỉ điều họ cho đi — ai cũng liệt kê thứ mình giúp được và không ai chịu nhận là mình đang cần, mà một ngân hàng không ai tiêu giờ thì cũng không ai kiếm được giờ.",
    "Chọn thứ đơn giản nhất mà người điều phối thật sự giữ được cho luôn mới, và chắc chắn rằng bạn xuất được cả cuốn sổ chung ra — cái ngày người rành máy tính duy nhất chuyển đi xa, một ứng dụng đóng kín sẽ mang theo toàn bộ lịch sử.",
    "Hãy quyết ngay từ bây giờ chuyện gì xảy ra khi một người rời đi lúc số giờ đang âm hoặc để nó âm sâu — viết quy ước ấy lúc mọi người còn vui vẻ dễ hơn nhiều so với nghĩ ra nó đúng lúc chuyện đã gợn.",
    "Hãy để mỗi thành viên mới hẹn được một lần trao đổi thật trước khi rời buổi giới thiệu — tinh thần chỉ thấm khi người ta đã tiêu một giờ, chứ không phải khi vừa nghe xong bài nói.",
    "Ghi cả lúc nào và ở đâu mỗi người rảnh, chứ đừng chỉ ghi họ làm được gì — “sửa ống nước” chẳng giúp được ai nếu người ấy chỉ rảnh sáng thứ Ba và không có xe, còn một cuốn danh bạ cũ mèm lặng lẽ dạy mọi người thôi mở nó ra.",
    "Để mắt tới những thành viên có giờ mà chưa bao giờ tiêu, hay vào rồi chưa trao đổi lần nào, và nhắn cho từng người, gọi đúng tên — những người lặng lẽ không than phiền, họ chỉ trôi dần ra xa, và bạn chỉ nhận ra khi họ đã đi rồi.",
    "Với những lần trao đổi diễn ra trong nhà, hãy mời gặp lần đầu ở chỗ đông người và mở sẵn một lối từ chối dễ dàng, không cần lý do — và để lời than phiền tới một con người chứ không phải một cái mẫu điền, nếu không người ta sẽ lặng lẽ thôi xuất hiện."
  ],
  "solidarity-fund": [
    "Giữ nhóm nhỏ và số người lẻ để bỏ phiếu không bị hòa, và thống nhất trước rằng ai có bạn bè hay người nhà nộp đơn thì đứng ngoài quyết định đó — chỉ cần trông giống thiên vị thôi cũng đủ làm sập một quỹ nhanh như thiên vị thật.",
    "Đừng bao giờ cho tiền chạy qua Venmo hay tài khoản cá nhân của một người giúp, dù tiện đến mấy — làm vậy khiến không ai rõ tiền là của ai, gây rắc rối thuế cho người đó, và trông sai hoàn toàn khi có người bắt đầu hỏi han.",
    "Đặt cả mức trần cho mỗi lần xin lẫn tổng số tiền tối đa mỗi tháng, để vài khoản lớn lúc đầu không vét sạch quỹ rồi đến tuần thứ ba bạn phải nói không với tất cả mọi người.",
    "Hãy hỏi họ muốn nhận tiền theo cách nào, và đừng hỏi gì bạn không thật sự cần — không số giấy tờ tùy thân, không giấy xác nhận của chủ nhà; mỗi thứ giấy tờ bạn đòi là một gia đình lặng lẽ bỏ cuộc và không nộp đơn nữa.",
    "Hãy dựa vào những lời hứa góp nhỏ đều đặn hơn là một đợt quyên góp lớn duy nhất — một quỹ nhận 200 đô la mỗi tháng có thể hứa giúp được vào tháng sau, còn quỹ gom một lần 5.000 đô la thì đến mùa thu đã phải chia ra từng chút một.",
    "Đặt ra một mức tiền nhỏ mà hai người có thể duyệt ngay trong ngày, không cần họp đủ nhóm — khi nhà ai đó bị cắt điện vào thứ Sáu, một quyết định phải chờ tới cuộc gọi nhóm hôm thứ Ba thì không còn là giúp, mà là thủ tục giấy tờ.",
    "Chỉ báo con số và tổng, đừng bao giờ kể chuyện — ngay cả một mẩu chuyện “đã giấu tên” về một bà mẹ đơn thân ở cuối phố cũng đủ để hàng xóm nhận ra, và chỉ một người nhận thấy mình bị phơi bày sẽ làm mười người cần giúp tiếp theo không dám tới."
  ],
  "diaper-hygiene-bank": [
    "Tã và băng vệ sinh hút ẩm và dễ dẫn dụ chuột bọ, nên hãy chọn chỗ cất thật sự khô ráo và kín — và đặt điểm trao đồ sao cho một gia đình không phải nhận đồ ngay trước mặt cả phòng chờ.",
    "Hỏi xem có mạng lưới kho tã hay mối bán buôn nào bán cho bạn theo giá thùng không — các đợt quyên góp thường đổ về ngập tã cỡ sơ sinh, còn cỡ 4, 5, 6 mà các gia đình thật sự hay hết thì hầu như bạn sẽ phải mua.",
    "Chia thùng lớn thành từng phần sẵn để trao ngay khi hàng về, đừng đợi tới lúc đứng ở cửa — và đếm theo từng cỡ mỗi lần, vì “mình còn tã” chẳng có nghĩa gì khi tất cả đều là cỡ 1 mà ai cũng xin cỡ 5.",
    "Nói thẳng ngay từ đầu rằng phần mỗi tháng (thường khoảng 25-50 cái tã) là phần đỡ đần thêm, không phải đủ dùng cả tháng — các gia đình liệu tính dễ hơn với một con số thật thà, so với câu mơ hồ “có bao nhiêu phát bấy nhiêu”.",
    "Hãy phát vào đúng ngày, đúng giờ mỗi đợt để các gia đình sắp xếp cả tháng quanh nó, và dặn người giúp cứ trao gói đồ là xong — không hỏi han về em bé, không giấy tờ, không bắt ai kể chuyện đời mình."
  ],
  "community-bike-workshop": [
    "Chỉ chục chiếc xe được cho là kín cả nền nhà — hãy đo tường để bắt móc treo dọc trước khi nhận chỗ, và kiểm xem nơi đó khóa có chắc không, kẻo cả giá khung xe biến mất sau một đêm.",
    "Vẽ hình từng món đồ nghề lên tấm bảng treo đục lỗ, để lúc đóng cửa nhìn là biết thiếu cái cờ lê nào — xưởng mở cho mọi người rất mau mất đồ, và cả buổi mất đà chỉ vì đi tìm cái cờ lê 15.",
    "Đặt ra một câu “không” dứt khoát với mấy chiếc xe siêu thị rẻ tiền đã gỉ sét trước khi kêu gọi — chúng ngốn nhiều giờ hơn giá trị của một chiếc xe chạy được, và câu “để đó rồi tính” chính là cách một cái sân đầy dần sắt vụn.",
    "Người sửa giỏi nhất và người chỉ hay nhất hiếm khi là một — hãy để ý xem người đó có ngồi yên được để người mới lóng ngóng vặn con ốc hay không, vì ở đây đó mới là toàn bộ công việc.",
    "Phát cho mỗi người trong chương trình “tự sửa lấy xe” một tấm thẻ đóng dấu hoặc một bảng ghi giờ mà thợ nào cũng đọc được — tiến độ chỉ nằm trong trí nhớ của một người sẽ bay mất đúng tuần người đó ốm.",
    "Biến việc kiểm phanh và lốp thành một dòng có chữ ký trên tấm thẻ, tốt nhất do một người khác chứ không phải người vừa lắp chiếc xe ký — mắt mới sẽ thấy cái chốt tháo nhanh còn lỏng mà người ngồi với nó cả buổi chiều không thấy."
  ],
  "newcomer-translation-network": [
    "Nói chuyện trôi chảy khác với dịch trôi chảy — hãy nhờ người đó chuyển một câu về khám bệnh hay nhà ở theo cả hai chiều trước khi tính họ vào danh sách, và ghép cả giọng vùng chứ không chỉ ngôn ngữ.",
    "Với mỗi nơi, hãy ghi lại họ có hỏi giấy tờ tùy thân hay tình trạng cư trú không và thật sự có người nói được thứ tiếng nào — gửi ai đó tới một nơi rồi bị chối ngay ở cửa sẽ làm mất lòng tin mà bạn khó gây lại được.",
    "Chỉ ghi tên gọi và một số điện thoại để gọi lại, không gì hơn — một bảng tính gọn gàng ghi ai cần gì, gắn với danh tính thật, chính là thứ hồ sơ có thể bị lộ hoặc bị tòa yêu cầu nộp.",
    "Hãy nhờ một người trong mỗi cộng đồng ngôn ngữ đọc to bản nháp trước khi in — dịch máy hay dịch từng chữ phần về quyền lợi và đường sá đọc lên nghe ngớ ngẩn, hoặc tệ hơn, thành chỉ dẫn sai.",
    "Dặn người đi cùng nói lại mọi câu ở ngôi thứ nhất và không thêm gì cả — ngay khi người phiên dịch bắt đầu trả lời thay cho bác sĩ hay thay cho người mình đi cùng, cả hai bên đều thôi tin vào căn phòng đó, và người bệnh chịu thiệt.",
    "Hãy viết ra bạn giữ mỗi thứ trong bao lâu và với ai thì có thể nói “chỗ tôi không thu thập cái đó” — hãy quyết định câu trả lời cho một yêu cầu cung cấp hồ sơ ngay bây giờ, lúc còn bình tĩnh, chứ không phải lúc một cán bộ đang đứng ngay trước bàn."
  ],
  "community-meal": [
    "Trước khi mê một hội trường đẹp, hãy kiểm những thứ chẳng hào nhoáng mà người đi kiểm tra sẽ soi: bồn rửa tay riêng, nước nóng và đủ chỗ trong tủ lạnh — một cái bếp không qua nổi khâu kiểm tra là cái bếp bạn không dùng được.",
    "Hãy hỏi cơ quan y tế đúng câu về diện miễn trừ cho bữa ăn nấu phát miễn phí — nhiều nơi có đường đi nhẹ nhàng hơn cho bếp của bà con — và ghi danh lớp chứng chỉ an toàn thực phẩm ngay bây giờ, vì lớp thường kín chỗ trước cả mấy tuần.",
    "Hãy chốt với từng nơi cho đồ một ngày và một lượng cụ thể, thay vì “còn gì cho nấy” — thực đơn dựng trên một lời hứa không tới nơi nghĩa là tuần nào cũng phải chạy ra chợ trước giờ dọn ăn một tiếng.",
    "Một món chính vốn đã là món chay, không có hạt cây và không có hải sản để ai cũng ăn được thì hơn hẳn một “đĩa riêng cho người dị ứng” mà lúc tất bật bạn sẽ quên — hãy nấu theo mức kiêng ngặt nhất, rồi vẫn dán nhãn.",
    "Hãy xếp nhiều người hơn mức một ca thật sự cần, và tập cho một người bếp chính thứ hai ngay từ tuần đầu — bữa cơm phụ thuộc vào một người duy nhất có mặt thì chỉ cách một trận cúm là phải hủy.",
    "Hãy chọn ngày giờ bạn giữ được suốt một năm, chứ không phải ngày giờ hăng hái nhất — người ta sắp cả tuần quanh một bữa cơm họ trông cậy được, và một buổi tối bị hủy dạy họ đừng trông cậy vào bạn nữa.",
    "Hãy chuyển đồ ăn còn dư sang khay nông và cất tủ lạnh trong vòng hai tiếng — thức ăn để âm ấm ngoài bàn “dọn xong rồi tính” chính là cách một bữa cơm ngon làm ai đó đổ bệnh vào hôm sau."
  ],
  "seed-library": [
    "Đặt tủ tránh xa tường ngoài, cửa sổ nắng và miệng gió nóng — thứ giết hạt giống là độ ẩm và nhiệt độ lên xuống, chứ không chỉ là tuổi hạt, nên mát và khô đáng giá hơn một chỗ đứng bắt mắt.",
    "Bỏ qua loại hạt đã xử lý thuốc bọc màu hồng hay xanh và các giống lai có bằng độc quyền — hạt xử lý thuốc không cầm nắm qua loa được, còn giống lai thì không ra đúng giống nếu ai đó thử để lại làm giống.",
    "Viết năm thật to lên mỗi phong bì và xếp hạt cũ ra phía trước — khi cả một nhóm được đánh dấu bằng màu là “dễ cho người mới”, người lần đầu tới có thể tự lấy mà không cần ai đứng kèm bên cạnh.",
    "Giới hạn mỗi người lấy bao nhiêu gói của cùng một giống, để một người mê quá không vét sạch ngăn kéo, và hãy nói về chuyện trả hạt như một món quà, không phải một khoản nợ — làm người mượn thấy áy náy chỉ khiến họ thôi không tới nữa.",
    "Thử một mẻ đáng ngờ bằng mười hạt đặt trong khăn giấy ẩm suốt một tuần — nếu chưa tới sáu hạt nảy mầm, hãy bỏ mẻ đó ra thay vì để người mới trồng mang về nhà thứ hạt vốn chẳng bao giờ lên nổi."
  ],
  "digital-literacy": [
    "Hãy nhờ người cho máy đăng xuất khỏi tài khoản iCloud hay Google của họ ngay trước khi máy rời tay — một cái máy tính bảng còn khóa kích hoạt là cục chặn giấy mà xóa sạch cũng không cứu được, và tìm lại người ta sau đó hiếm khi thành.",
    "Dán nhãn cho từng máy và ghi số máy vào cùng dòng cho mượn — và cho mượn cả cục sạc như một bộ có đánh số, vì thứ hay “mất” nhất không phải cái máy, mà là cục sạc chẳng ai ghi lại.",
    "Hãy xem kỹ hạn mức dữ liệu trước khi đưa một bộ phát Wi-Fi — gói bị bóp băng thông sau vài GB không trụ nổi một cuộc gọi khám bệnh từ xa, và người mượn sẽ trách cái máy chứ không trách gói cước.",
    "Hãy diễn thử một lượt: người kèm phải nói cho một người mới đang hồi hộp làm xong một việc mà không được chạm vào máy — thói quen khó bỏ nhất là với tay lấy con chuột, và tốt nhất là bỏ được nó trước khi có người học thật ngồi vào ghế.",
    "Hãy chụp đúng những màn hình mà người học sẽ thấy rồi in thật to — một tờ hướng dẫn “cách dùng email” chung chung sẽ làm người ta rối ngay khi màn hình của họ trông khác đi, và mỗi trang một việc thì hơn cả cuốn sổ chẳng ai mở.",
    "Hãy để một người giúp thứ hai rảnh tay đi vòng trong những giờ ghé hỏi — nếu không, một ca hóc búa kiểu “tài khoản tôi bị khóa rồi” sẽ nuốt trọn cả buổi trong khi những người khác ngồi chờ rồi nản mà bỏ về.",
    "Hãy xóa máy cả lúc nhận về lẫn lúc đưa đi, và nhắc người mượn lưu ảnh cùng tài liệu của họ trước — người ta hay quên rằng mọi thứ đều nằm trong cái máy đó, và một lần khôi phục cài đặt gốc ngày trả máy xóa mất ảnh của đứa cháu là một vết đau."
  ],
  "weatherization-brigade": [
    "Hãy thử người mới ở một việc ít rủi ro trước khi để họ vào nhà người khác, và để ý ai hăm hở nhận nhiều hơn ranh giới cho phép — thứ làm hỏng nhà của chủ nhà là sự tự tin quá đà, chứ không phải sự thiếu kinh nghiệm.",
    "Hãy thêm sơn có chì và vật liệu cách nhiệt cũ vào danh sách “dừng lại và chuyển đi”, bên cạnh gas và điện — động vào chúng trong một căn nhà xây trước năm 1978 mà không được huấn luyện là vừa phạm luật vừa hại sức khỏe thật sự, và chúng nấp đúng ở những bề mặt bạn định trám.",
    "Cử hai người đi mỗi lần khảo sát, chụp ảnh mọi thứ, và đừng hứa ngày giờ ngay ở ngưỡng cửa — cái “trám vài khe cho nhanh” mà mở ra thấy nấm mốc hay dây điện kiểu cũ thì cần một cái nhìn thứ hai tỉnh táo, chứ không phải một cái gật hăng hái.",
    "Hãy mua theo danh sách vật tư của buổi khảo sát chứ không mua áng chừng, và chọn loại ít mùi, ít hóa chất bay hơi cho những căn nhà đang có người ở — một cụ già không thể mở toang cửa cả ngày, còn keo trám ngoài trời chọn sai thì mùa đông sau đã bong.",
    "Hãy xin xác nhận bằng văn bản rằng bảo hiểm của bạn có nêu đúng việc sửa nhà do người giúp làm — nhiều hợp đồng trách nhiệm chung lặng lẽ loại trừ nó — và hãy coi cái thang là mối nguy thật sự ở đây, vì thứ đưa những nhóm như thế này vào phòng cấp cứu là cú ngã, không phải máy khoan.",
    "Hãy gọi xác nhận ngay sáng hôm đó, chứ không chỉ trước một tuần — một cụ già đang lo lắng mà quên mất là bạn sẽ tới thì có thể không mở cửa — và mang theo nước uống cùng đồ dọn dẹp của mình, để buổi làm không đội thêm hóa đơn cho nhà người ta."
  ],
  "pet-food-bank": [
    "Thức ăn thú cưng dụ chuột còn dữ hơn cả kho thực phẩm cho người — cất trong thùng đậy kín và kê cao khỏi mặt sàn, không thì bạn đang nuôi lũ chuột trước cả hàng xóm.",
    "Hỏi các cửa hàng thú cưng về những bao rách hay móp mà họ không bán được — chỗ thức ăn đó thường vẫn còn tốt nguyên, và là nguồn đều đặn hơn hẳn mấy đợt quyên góp lẻ tẻ.",
    "Để riêng và dán nhãn rõ những loại thức ăn theo toa hay theo chỉ định của bác sĩ thú y — chúng không thay thế cho nhau được, và cho nhầm có thể làm con vật đang ốm nặng thêm.",
    "Hỏi nhà đó nuôi mấy con và con to cỡ nào rồi hãy định phần — nhà hai con mèo và nhà một con chó to không thể chung 'một bao như nhau'.",
    "Buổi nào cũng có sẵn cả thức ăn cho mèo lẫn cho chó, và để mọi người chỉ lấy đúng thứ con vật nhà mình ăn được — chẳng gì tủi bằng nhận về phần thức ăn mà thú cưng của mình không ăn nổi."
  ],
  "youth-mentorship": [
    "Chốt cho chắc là vẫn phòng đó suốt cả học kỳ, chứ không riêng tháng này — những đứa trẻ từng bị thất hứa cần cái chỗ ấy có mặt đều đặn từng tuần một.",
    "Viết quy tắc hai người lớn sao cho phủ cả nhà vệ sinh, chuyến xe về nhà và những buổi kèm riêng — 'ở riêng với một đứa trẻ' xảy ra ở đó, chứ không phải giữa phòng sinh hoạt.",
    "Chọn người theo được trọn học kỳ hơn là người nói hay lúc phỏng vấn — một người dìu dắt bỏ ngang giữa chừng làm các em đau hơn nhiều so với một người bình thường nhưng bền bỉ.",
    "Dựng một nhịp quen thuộc — ăn nhẹ, rồi làm bài, rồi hoạt động — để các em luôn biết tiếp theo là gì; những khoảng trống không có gì làm chính là lúc trông nom lơi ra.",
    "Dán những trường hợp dị ứng nặng ở chỗ người trực nhìn thấy vào giờ ăn nhẹ, chứ đừng chỉ kẹp trong tập hồ sơ, và chốt ai được phép đón từng em trước ngày đầu tiên.",
    "Mặc định đồ ăn nhẹ không có hạt cây, và dán nhãn mọi thứ bạn không nắm chắc thành phần — tính trước cho một em dị ứng rẻ hơn nhiều so với chạy chữa khi đã lên cơn.",
    "Đếm đầu các em lúc tới và đếm lại trước khi ai ra về, ghi rõ ai đón em nào — một câu hỏi han nhanh với cha mẹ bắt được rắc rối từ lúc còn nhỏ."
  ],
  "gleaning-network": [
    "Hỏi từng nhà vườn chính xác chỗ nào KHÔNG được đụng tới, đậu xe ở đâu và đi lối nào — cách mất một nông trại nhanh nhất là để ai đó giẫm nát một luống mà người ta chưa hề cho.",
    "Rủ những người có thể bỏ hết mọi việc vào một buổi sáng giữa tuần, chứ không phải chỉ rảnh cuối tuần — trái chín không đợi tới thứ Bảy.",
    "Chuẩn bị nhiều sọt và nhiều chỗ trên xe hơn bạn tưởng — chỉ một cây 'nhỏ' cũng có thể cho hàng trăm kg, và rau trái để trong xe nóng tới trưa thì chiều đã thành phân xanh.",
    "Ghi lại những cái gật đầu chắc chắn, đừng ghi những cái 'để xem' — mười người có thể tới chẳng bằng gì trước khung hai tiếng của nhà vườn; hãy biết rõ ba người sẽ tới thật.",
    "Thống nhất trước danh sách cấm — rau lá rụng xuống đất thì bỏ, trái thối tuyệt đối không trộn vào — vì chỉ một mẻ hỏng ở tủ lạnh cộng đồng là xóa sạch nhiều năm tin cậy.",
    "Ghép loại nông sản với nơi nhận trước khi hái — một kho thực phẩm nhỏ không tiêu nổi 90 kg đào chín, nhưng một bữa cơm chung hoặc vài cái tủ lạnh cộng đồng thì được.",
    "Cân cả mẻ ngay tại vườn trước khi chia — con số kg ấy sẽ rủ được nhà vườn và người góp một tay tiếp theo, và sau này bạn không dựng lại được nữa."
  ],
  "community-mediation": [
    "Thứ khó dạy nhất là giữ trung lập khi trong bụng mình đã thấy một bên đúng — hãy chọn những người ngồi yên được với cảm giác đó thay vì nhảy vào phân xử.",
    "Nói riêng với từng bên lúc hỏi chuyện ban đầu — không ai nói ra nỗi sợ hay chuyện bên kia mạnh thế hơn khi người kia đang ngồi ngay đó.",
    "Chọn một phòng không thuộc sân nhà bên nào, có hai lối ra và không ai chờ sẵn bên ngoài — chỗ mà bạn bè của một bên lảng vảng thì không còn trung lập nữa.",
    "Viết danh sách nơi chuyển tiếp trước ca đầu tiên — ghi rõ đường dây nóng về bạo hành gia đình, một luật sư về nhà ở, đường dây khủng hoảng — để người hòa giải trao tận tay ngay, khỏi phải ứng biến.",
    "Quyết trước xem sẽ làm gì nếu giữa buổi có người kể ra một lời đe dọa hay chuyện trẻ bị xâm hại — 'mọi thứ đều được giữ kín' không hoàn toàn đúng, và hứa như vậy có thể trói chân bạn.",
    "Tìm tới nơi bất đồng nảy ra — ban quản trị chung cư, người quản lý nhà cho thuê, tổ dân phố — chứ không chỉ dán tờ rơi; đó mới là những người đứng cạnh một cuộc cãi vã lúc nó bắt đầu.",
    "Ngồi lại sau mỗi ca khó, đừng đợi mỗi tháng một lần — người hòa giải mang bất đồng của người khác về tận nhà, và kiệt sức hiện ra thành sự chua chát trước khi ai đó chịu thừa nhận."
  ],
  "reentry-support": [
    "Gọi từng nơi trong danh bạ để xem còn thật và còn nhận người từng có tiền án không, rồi ghi tên một người cụ thể — một đầu mối đã chết làm phí mấy tuần đầu vốn quý nhất.",
    "Loại bớt những người muốn làm đấng cứu rỗi — người muốn sửa chữa đời người khác sẽ kiệt sức rồi quay ra gác cửa; hãy tìm người đi được theo mục tiêu của người khác mà không lái.",
    "Hỏi họ muốn gì trước, trước cả khi nhìn vào hồ sơ — để chính họ gọi tên điều cần nhất thay vì dò từng ô trong tờ khai; sự tôn trọng ở đây định đoạt cả mối quan hệ về sau.",
    "Gỡ chuyện địa chỉ nhận thư trước tiên — địa chỉ của một tổ chức cùng làm hoặc một hộp thư bưu điện — vì gần như mọi hồ sơ giấy tờ và trợ cấp đều tắc nếu thiếu nó.",
    "Cùng nhau chuẩn bị thật thà cho câu hỏi về quá khứ trước buổi phỏng vấn, và hỏi lại xem tháng này nơi tuyển dụng có còn thật sự mở cửa không — một lời từ chối kiểu hứa hão cắt sâu hơn cả việc không có manh mối nào.",
    "Đỡ lưng cho cả những người dìu dắt cùng cảnh ngộ — vừa làm chỗ dựa cho người khác vừa lo chặng trở về của chính mình là rất nặng, nên đừng để một người gánh tới năm người.",
    "Viết rõ ai được phép biết quá khứ của một người và không bao giờ chia sẻ hồ sơ khi chưa có cái gật đầu rành mạch của họ — một câu lỡ miệng trong nhóm chat có thể làm họ mất việc."
  ],
  "community-wood-bank": [
    "Xin bằng giấy trắng mực đen rằng số gỗ đó bạn được lấy và ranh đất chạy tới đâu — một câu 'cứ lấy đi' bằng miệng rất nhanh thành rắc rối xâm phạm đất hay lấy trộm gỗ.",
    "Bạn cần chỗ cho hai năm củi cùng lúc — đống khô cho mùa đông này và đống đang hong cho mùa sau — không thì lúc nào cũng phải đốt củi tươi.",
    "Tính tiền quần chống cưa, kính và bịt tai cho từng người cầm máy trước khi mua cái cưa thứ hai — đồ bảo hộ mà 'chuyền tay nhau' thì thế nào cũng có người cưa mà chẳng có gì che.",
    "Chỉ định một người nắm quyền quyết làm hay dừng và đủ cứng để nói không với một người đang hăng hái — hăng hái cộng cưa máy mà không ai cầm cương là lúc người ta bị thương.",
    "Lúc nhận yêu cầu, hỏi luôn củi nên để ở đâu và có lối đi khô ráo, thông thoáng tới đó không — đổ một đống củi mà cụ già 80 tuổi không xê dịch nổi thì chẳng giúp được ai.",
    "Định phần bằng thứ đo được — số khối củi, hay số tuần sưởi ấm — chứ đừng nói 'một xe', và hỏi lại vào giữa mùa đông; hộ nào hụt hồi tháng Giêng là hộ đầu tiên cần lo cho mùa sau.",
    "Cưa xong củi cho mùa đông này ngay trong mùa xuân, đừng đợi tới mùa thu — gỗ cứng cần hơn sáu tháng mới khô; củi cắt tháng Mười để đốt tháng Mười Hai chỉ tỏa khói, phí hơi ấm và đóng muội nhựa lên ống khói."
  ],
  "community-wifi-mesh": [
    "Vẽ bản đồ từ dưới vỉa hè, đừng vẽ từ ảnh vệ tinh — hàng cây, một bức tường gạch hay một mái nhà chờ xe buýt cũng chặn đứng đường sóng mà nhìn từ trên xuống tưởng thông thoáng. Ghi lại phía nào của con đường có những mái nhà hướng nắng.",
    "Xin phép chia lại đường truyền bằng văn bản, và tự bạn đọc điều khoản của nhà mạng — nhiều gói cho nhà ở và cho cửa hàng cấm chia lại, và chỉ một thông báo cắt mạng cũng đủ xóa sổ cả mạng lưới sau một đêm.",
    "Rủ ít nhất hai người rành kỹ thuật không sống chung nhà và không làm cùng một chỗ — mạng chết đúng cái tuần người quản trị duy nhất chuyển đi hoặc nhận ca đêm.",
    "Đặt mật khẩu quản trị cho từng router và cất vào kho mật khẩu chung trước khi lắp bất cứ thứ gì — một điểm phát còn nguyên mật khẩu gốc nằm trên mái nhà là một ca leo thang hai người mới sửa được.",
    "Ký một tờ thỏa thuận một trang với chủ nhà, ghi rõ chuyện lên mái, vài đô tiền điện mỗi tháng, và ai chịu nếu máy hỏng — một câu 'ừ được' bằng miệng bay hơi ngay khi nhà đó đổi chủ.",
    "Dán lời hứa không ghi lại hoạt động ở chỗ mọi người nhìn thấy, và tắt ghi log thật sự — nếu bạn không bao giờ thu thập dữ liệu hoạt động, thì lúc có ai tới hỏi xin cũng chẳng có gì để đưa.",
    "Dán nhãn cho từng điểm phát ghi vị trí và ngày kiểm gần nhất, và luôn giữ sẵn một router dự phòng đã sạc đầy — cái hỏng bạn gặp thật sẽ là một điểm phát chết, không phải dựng lại cả mạng, và thay nó chỉ nên mất vài phút."
  ],
  "mental-health-peer-support": [
    "Chọn theo sự vững vàng, chứ không chỉ theo chuyện từng trải — người còn đang rát lòng vì khủng hoảng của chính mình có thể bị kéo chìm khi giữ chỗ cho người khác. Hãy hỏi họ xoay xở thế nào khi cả phòng lặng đi sau một lời tâm sự nặng.",
    "Viết ranh giới thành những điều vòng tròn sẽ không làm — không chẩn đoán, không sửa chữa ai, không thay cho một nhà trị liệu — vì với một người đang đau, danh sách những điều không làm rõ ràng hơn hẳn một lời tuyên ngôn ấm áp.",
    "Tự tay gọi thử từng số máy khủng hoảng để kiểm, và in kế hoạch ra giấy cho từng người dẫn dắt — đúng cái đêm cần tới nó thì mạng lại rớt, hoặc số máy đã ngừng cả năm nay.",
    "Chọn phòng có cửa đóng được và không có vách kính, rồi hỏi xem giờ đó còn ai dùng tòa nhà — một cái sảnh chung hay một người quen đi ngang là chuyện giữ kín đã hỏng trước khi ai kịp nói.",
    "Đọc to các quy tắc chung ở mỗi buổi, kể cả với người đã quen — người mới cần cái 'quyền xin bỏ lượt' nhất lại chính là người ngại tới mức không dám hỏi có quyền đó không.",
    "Giữ nhóm quanh tám người — đông hơn thì người ít nói chẳng bao giờ tới lượt — và chọn giờ không phải tối thứ Sáu hay ngay lúc tan làm, khi người cô đơn thấy thấm nhất mà lại khó đi lại nhất.",
    "Cho người dẫn dắt một chỗ trút bớt của riêng họ, không phải chính vòng tròn, và để mắt tới người không vắng buổi nào và cũng chẳng nghỉ buổi nào — kiệt sức chính là thứ sẽ lấy mất họ."
  ],
  "community-cleanup": [
    "Ghé các điểm dự tính vào những giờ khác nhau trước khi chốt — một khu đất yên ắng lúc 10 giờ sáng có thể là chỗ ngủ của ai đó hoặc một bãi đổ trộm được lấp đầy lại mỗi đêm, và điều đó thay đổi toàn bộ kế hoạch.",
    "Chốt chỗ đổ rác cuối cùng trước ngày hẹn — một thùng rác lớn đã đặt chắc hoặc một chuyến thu gom đã hẹn kèm mã số tra cứu — nếu không, số bao rác gom được sẽ nằm ngoài lề đường cho tới khi bục ra.",
    "Mang theo một hộp cứng đựng vật sắc nhọn và găng tay dày chống đâm thủng, chứ không chỉ găng làm vườn — và dặn rõ mọi người rằng kim tiêm và hộp lạ thì báo cho trưởng nhóm, tuyệt đối không nhặt bằng tay.",
    "Chia khu và cắt cử một trưởng nhóm cho từng tốp người trước ngày hẹn, và rủ dư ra một phần ba — buổi dọn dẹp chạy được nhờ những người thật sự có mặt, vốn ít hơn số người đã ghi tên.",
    "Chụp ảnh “trước” từ một chỗ đứng cố định mà bạn có thể đứng lại đúng vậy để chụp ảnh “sau” — hai góc trùng khớp mới làm khác biệt hiện ra không cãi được và kéo mọi người quay lại lần sau."
  ],
  "free-tax-prep": [
    "Bắt đầu lấy chứng nhận từ mùa thu — khóa học và kỳ thi của VITA kéo dài mấy tuần, và người bắt đầu vào tháng Một thì vừa kịp sẵn sàng khi mùa khai thuế đã đi được nửa đường.",
    "Gia nhập một chương trình đã có tiếng trước khi hẹn ngày với bất kỳ ai — họ đặt ra yêu cầu cho một điểm khai thuế, và chính phần mềm cùng khâu soát chất lượng của họ giữ cho một tờ khai sai không phá hỏng khoản tiền thuế trả lại của cả một gia đình.",
    "Đo tốc độ tải lên thật ở chỗ đó, chứ không chỉ xem có Wi-Fi hay không — phần mềm khai thuế đứng hình khi mạng yếu, và một phòng đầy người ngồi nhìn vòng xoay là cách lòng tin mòn đi.",
    "Kèm danh sách giấy tờ bắt buộc vào mọi lời nhắc và đưa tận tay lúc đặt hẹn — chuyện đau lòng thường gặp nhất là có người đi xe buýt tới nơi rồi bị trả về vì thiếu thẻ an sinh xã hội hay tờ khai năm ngoái.",
    "Hướng việc báo tin tới những người cứ nghĩ mình kiếm quá ít nên khỏi khai làm gì — họ thường lại là những người đáng được nhận khoản miễn giảm lớn nhất, và câu “bạn không cần khai đâu” đúng là lời đồn đang lấy mất tiền của họ.",
    "Viết quy định giữ và hủy giấy tờ trước ngày mở cửa — không để hồ sơ cá nhân trên màn hình máy tính, không mang gì về nhà, và một ngày cố định để hủy giấy — vì lỗ hổng bạn gây ra sẽ là chiếc máy tính quên đăng xuất, chứ không phải tin tặc.",
    "Giữ phần đồng hành sau đó hoàn toàn tự nguyện và chỉ mời khi tờ khai đã xong, không bao giờ là điều kiện — người ta đến vì khoản tiền thuế trả lại, và một lời chào mời lập kế hoạch chi tiêu ngay tại bàn dễ khiến sự giúp đỡ miễn phí giống một cái bẫy bán hàng."
  ],
  "community-market": [
    "Chốt bằng giấy trắng mực đen nhịp và lượng hàng của từng nơi, chứ đừng nhận một câu tử tế “khi nào dư thì báo” — một cái sạp dựng trên phần dư không đoán trước được thì không thể hứa với bà con một cái bàn đáng công đi bộ tới.",
    "Đi xem chỗ đó có bóng mát và chỗ lấy nước không, và đếm người qua lại đúng vào giờ chợ họp — một góc đông nghịt giờ tan tầm có thể vắng tanh lúc 2 giờ chiều, và rau trái thì chín rục trong bãi đất không có bóng mát.",
    "Nếu chọn trả tùy khả năng, chỉ để một chiếc hộp trơn không ghi gì và đừng bao giờ dán giá gợi ý ngang tầm mắt — ngay khi việc trả tiền trông như điều đương nhiên, những người cần đồ ăn nhất sẽ thôi không đến nữa.",
    "Mang thùng đá và đá cho mọi thứ rau lá hay đã cắt sẵn, và đặt một lằn ranh bỏ đi thật đơn giản cho mọi người — “chưa chắc thì đem ủ phân” vừa giữ an toàn cho bà con vừa giữ tiếng cho cái sạp.",
    "Rủ người cho những phần việc không hào nhoáng trước — chuyến xe đi lấy hàng sớm và buổi dọn sạp — vì đó là chỗ hay đứt gánh, và đặt một người dự phòng cho mỗi phần để một người vắng không làm hủy cả buổi chợ.",
    "Chốt một ngày một giờ và giữ đúng cả vào tuần thưa hàng — một cái sạp vơi mà tuần nào cũng có mặt xây được nhiều lòng tin hơn một cái sạp đầy ắp nhưng bỏ một thứ Bảy không báo trước.",
    "Thu xếp chỗ nhận rau trái còn dư từ trước ngày chợ, đừng để tới lúc xong — hẹn sẵn một tủ lạnh chung, một kho thực phẩm hay một bếp ăn nhận phần dư, để lúc dọn sạp chỉ mất năm phút ghé giao, chứ không phải một cốp xe đầy rau úng."
  ],
  "welcome-wagon": [
    "Đặt mặc định là lần tiếp xúc đầu tiên thật nhẹ nhàng — một mẩu giấy nhắn hay một cuộc gọi trước bất kỳ lần ghé cửa nào — để người mới đến có thể nhận giỏ đồ mà không thấy như sắp có người lạ xuất hiện trước nhà mình.",
    "Ghi ngày lên tập thông tin và ghi rõ báo cho ai khi một mục không còn đúng — một cuốn cẩm nang đưa người ta tới phòng khám đã dời đi hay tuyến xe buýt đã đổi thì hại hơn là không có cẩm nang nào.",
    "Bỏ qua đồ tươi mau hỏng và đồ có mùi thơm trừ khi bạn biết rõ nhà đó — cha mẹ mới sinh con có thể bị dị ứng, phải kiêng, hay bếp còn trống trơn, nên đồ khô để được lâu hơn hẳn một món nấu sẵn đầy thiện ý mà không ăn được.",
    "Chỉ cho người đi chào đón cách đọc khung cửa trong mười giây — đưa giỏ đồ, nói một cách liên lạc với mình, rồi đi, trừ khi được mời vào; lời chào ấm nhất là lời chào biết lúc nào nên dừng.",
    "Nhắc những nơi giới thiệu người sang phải xin người mới đồng ý trước khi chuyền tên đi — một chủ nhà trọ hay một phòng khám chia sẻ thông tin mà chưa hỏi sẽ biến lời chào thành sự dòm ngó, và tiếng đó lan rất nhanh."
  ],
  "library-of-things": [
    "Làm bản hỏi ý thành một danh sách những món cụ thể cộng thêm một dòng để trống, và hỏi họ “trong năm vừa rồi” đã có lúc nào cần dùng — hỏi vậy mới bắt được nhu cầu thật, chứ không phải một danh sách mơ mộng.",
    "Đo món cồng kềnh nhất trước — bàn xếp, xe đẩy em bé, máy giặt thảm. Một cái tủ chứa được năm mươi món nhỏ vẫn không nhét nổi đúng cái món mà ai cũng hỏi.",
    "Tra danh sách sản phẩm bị thu hồi (CPSC) cho mọi thứ có mô tơ, có dây điện, hay dành cho trẻ nhỏ, và cắm điện chạy thử thật sự từng món điện trước khi cho nó một chỗ trên kệ.",
    "Chụp từng món ngay bên cạnh số hiệu của nó để lúc trả về khớp với hồ sơ trong vài giây, và ghi phụ kiện — túi, dây, đầu gắn — thành dòng riêng để không thứ gì biến mất.",
    "Định thời hạn mượn theo tốc độ quay vòng của từng món, chứ không một con số chung cho tất cả — máy giặt thảm một tuần, máy chiếu một cuối tuần — để những món đắt khách cứ luân chuyển đều.",
    "Chụp ảnh tình trạng cả lúc cho mượn LẪN lúc nhận về; tự nó giải quyết câu “xước sẵn từ trước rồi”, nên không người trông thư viện nào phải làm kẻ xấu.",
    "Giữ một danh sách chạy dài những thứ người ta hỏi mà chưa có — chính danh sách chờ đó, chứ không phải phỏng đoán của bạn, mới cho biết món tiếp theo thật sự đáng mua."
  ],
  "laundry-shower-access": [
    "Đi thử đúng đường mà người đến sẽ đi, từ chỗ ngồi chờ tới cửa phòng tắm — một buồng tắm kín nằm cuối hành lang mà ai cũng thấy được người nào bước vào thì thật ra chẳng kín đáo gì.",
    "Mua loại chai nhỏ đi đường và không mùi thơm — mùi hương làm một số người khó chịu, và chai lớn thì đi mất trong khi chai nhỏ dùng được lâu lại mang theo được. Thêm dép nhựa cho phòng tắm dùng chung.",
    "Cho người ta giữ một khung giờ chỉ bằng tên gọi, hoặc không cần gì cả; một tờ ghi tên đòi họ tên đầy đủ và số điện thoại sẽ làm vắng đúng cái hàng bạn đang muốn lấp đầy.",
    "Chừa ra số phút thật để dọn giữa các lượt tắm — khử khuẩn, lau sàn, khăn mới — và tính luôn số phút đó vào độ dài mỗi lượt, nếu không cái lịch sẽ lặng lẽ đẩy người ta vào một buồng tắm bẩn.",
    "Tập trước những tình huống khó xử — có người say, một lượt kéo quá giờ — để phản xạ đầu tiên của người góp một tay không phải là cú gọi hoảng hốt làm đứt quan hệ với nơi cho mượn chỗ.",
    "Chọn những khung giờ bạn giữ được hàng tháng trời và dán chúng ở nơi người ta thật sự có mặt; chỉ đổi giờ một lần thôi cũng dạy mọi người rằng cửa có thể khóa khi họ tới."
  ],
  "voter-registration": [
    "Ghi lại chính xác hạn chót nộp đơn và ai là người được phép nộp; có nơi bắt phải nộp trong vài ngày, tính từ lúc cử tri ký chứ không phải lúc bạn gửi đi.",
    "Cho mỗi người góp một tay một câu trả lời sẵn cho “tôi nên bầu cho ai?” — một câu ấm áp kiểu “điều đó tôi không nói được, nhưng đây là cách tìm hiểu về các ứng viên” — để không ai ứng biến rồi đẩy cả đợt vào rắc rối.",
    "Lấy thời hạn, quy định giấy tùy thân và thông tin bỏ phiếu thẳng từ trang của cơ quan phụ trách bầu cử và ghi ngày lên bản in; thông tin nghe lại kiểu “tôi nghe nói” sẽ đẩy ai đó tới một điểm bỏ phiếu đã đóng.",
    "Xin chỗ đó cho phép bằng văn bản trước khi đặt bàn — một cái chợ hay một khuôn viên trường có thể mời bạn đi giữa buổi, và câu “cứ tưởng là được” làm bạn mất chỗ đó vĩnh viễn.",
    "Giữ các đơn đã điền trong một cặp hồ sơ dán kín, không bao giờ rời khỏi tay một người đã được nêu tên, và nộp trong thời hạn luật định dù chỉ gom được ba tờ.",
    "Đưa cho mỗi người vừa đăng ký một tấm thẻ ghi điểm bỏ phiếu của họ, ngày bầu cử, và hạn bỏ phiếu qua bưu điện; một người đăng ký mà không có kế hoạch đi bầu thì thường ở nhà."
  ],
  "health-navigation": [
    "Ghi lại đường dây tiếp nhận trực tiếp và điều kiện nhận bệnh hiện thời, chứ không chỉ số tổng đài, và ghi cả ngày bạn kiểm chứng từng mục — một phòng khám đã đóng vẫn còn bắt máy số cũ suốt mấy tháng.",
    "Tập cho thuộc đúng câu “tôi không phải người làm y tế — để tôi nối bạn với đường dây điều dưỡng”, vì lúc khó nhất là khi một người đang sợ hãi ở đầu dây chỉ muốn bạn nói rằng chẳng có gì đâu.",
    "Hãy mở một số điện thoại thật và có người nghe máy, chứ không chỉ một mẫu đơn — những người lạc lối nhất giữa hệ thống thường lại là những người khó điền nổi một mẫu tiếp nhận trên mạng.",
    "Xem kỳ đăng ký trước khi mở hồ sơ cho ai: các gói bảo hiểm trên sàn khóa lại ngoài kỳ đăng ký mở, còn Medicaid thì xét theo thu nhập và số người trong nhà, nên hãy gom giấy tờ trước đã.",
    "Hỏi chuyện đi lại ngay lúc đặt lịch hẹn, đừng để sau — một lịch hẹn đã chốt mà không có cách nào tới nơi chính là cái hẹn lỡ vừa thiệt cho người bệnh vừa đốt mất một suất khám.",
    "Hãy chốt xem bạn sẽ KHÔNG ghi lại những gì — bệnh gì, tình trạng cư trú — trước khi bắt đầu tiếp nhận; mẩu thông tin sức khỏe an toàn nhất là mẩu bạn không bao giờ thu thập.",
    "Hỏi từng phòng khám xem loại giới thiệu nào thật sự giúp được họ và loại nào làm họ quá tải, và cho họ một người liên lạc có tên bên phía bạn — trao tay ấm áp hơn hẳn việc đẩy người lạ tới bàn tiếp nhận của họ."
  ],
  "toy-library": [
    "Chọn chỗ vừa tầm với của trẻ và đủ rộng cho xe đẩy; một cái kệ nằm trên một tầng lầu mà không có chỗ để xe đẩy là cái kệ mà cha mẹ đã mệt sẽ lặng lẽ bỏ qua.",
    "Mở sẵn danh sách sản phẩm bị thu hồi (CPSC) và thả thử từng chi tiết nhỏ qua một lõi giấy vệ sinh — lọt qua được là chi tiết dễ hóc với trẻ dưới ba tuổi, món đồ chơi có dễ thương tới đâu cũng vậy.",
    "Đếm số mảnh rồi ghi lên nhãn túi và đếm lại lúc nhận về; một bộ xếp hình ghi rõ “24 mảnh” chỉ mất ba mươi giây để kiểm, thay vì tin đại rồi hỏng dần trong im lặng.",
    "Nói thẳng ra quy ước cho chuyện thiếu mảnh và giữ nó nhẹ nhàng — trẻ con làm mất mảnh là chuyện thường, còn một gia đình sợ bị phạt thì sẽ thôi không đến nữa thay vì mang bộ đồ chơi trả lại.",
    "Gộp luôn việc đếm mảnh và lau qua một lượt vào chính bước nhận đồ trả về, để không món nào lên kệ mà chưa đếm hoặc còn dính nhớp cho gia đình sau."
  ],
  "food-preservation": [
    "Kiểm xem bếp có chịu nổi sức nặng của một nồi đóng hũ đầy và có sôi bùng lên được không, và bạn có bật hút mùi hàng giờ được không; một hội trường nhà thờ đẹp mà bếp yếu là cả ngày đóng hũ áp suất phải đứng chờ.",
    "Neo mọi thứ vào một nguồn đã kiểm chứng còn hiệu lực — Hướng dẫn đầy đủ của USDA hay của cơ quan khuyến nông — và ghi năm phát hành lên đó; thời gian xử lý cũ đã được sửa lại, còn “bà mình xưa làm vậy” chính là lối botulinum đi vào.",
    "Cho kiểm định đồng hồ áp suất của từng cái nồi — cơ quan khuyến nông làm việc này, thường là miễn phí — và chỉ dùng nắp mới; nắp cũ đem dùng lại chính là nguyên nhân âm thầm khiến hũ không kín.",
    "Chốt nguồn nông sản cho một ngày làm cụ thể và xử lý trong vòng một hai ngày sau khi hái; một vụ trúng mà để cả tuần thì mất luôn cái chất lượng và cái biên an toàn mà bạn đóng hũ vì nó.",
    "Ghép công thức với đúng cách an toàn cho món đó — đồ nhiều a-xít thì luộc hũ trong nước sôi, rau củ và thịt ít a-xít thì chỉ dùng áp suất — và đừng bao giờ nhân một công thức đã kiểm chứng lên quá mức nó từng được kiểm.",
    "Giao cho một người bấm giờ và ghi lại thời gian xử lý của từng mẻ; trong một gian bếp bận rộn, cái nồi “chắc là đủ giờ rồi” chính là cái nồi bạn phải đổ bỏ.",
    "Dán nhãn mỗi hũ ghi rõ đựng gì, làm cách nào, ngày nào, và dặn mọi người kiểm nắp rồi cất tủ lạnh sau khi mở; hũ nào chưa kín thì đánh dấu để ăn sớm, đừng để lên kệ."
  ],
  "free-haircut": [
    "Hỏi từng người thợ một buổi họ cắt được thật sự bao nhiêu đầu — phần lớn làm được sáu tới tám là tay đã mỏi — rồi mời người theo đúng con số đó, đừng theo đám đông bạn đang hy vọng.",
    "Xem có ổ cắm có tiếp đất trong tầm dây điện của mỗi cái ghế không, và sàn có cứng để quét được giữa mỗi lượt cắt không — thảm trải và một ổ cắm ở xa âm thầm phá hỏng một buổi vốn đã sắp xếp tốt.",
    "Mua hai bộ cữ tông đơ và lưỡi tông đơ cho mỗi ghế để một bộ ngâm khử trùng trong khi bộ kia đang cắt — dùng chung một bộ giữa những lượt cắt là chỗ hàng người chậm lại và rủi ro vệ sinh len vào.",
    "Gọi thẳng cho cơ quan cấp phép nghề tóc của bang, đừng chỉ gọi cho cơ quan ở thành phố — nhiều nơi bắt buộc dùng thuốc khử trùng có đăng ký với EPA đúng thời gian ngâm, và vẫn coi một buổi làm miễn phí như một tiệm có giấy phép.",
    "Đưa mỗi người một tấm gương và hỏi kỹ họ muốn kiểu gì trước nhát kéo đầu tiên, và để riêng một cái ghế mà cả phòng không nhìn thấy — phẩm giá nằm ở chỗ được chọn, và có người sẽ không thoải mái khi bị nhìn."
  ],
  "mutual-aid-moving-crew": [
    "Với những lần chuyển đi khỏi nhà không an toàn, hãy chọn người từ một nhóm nòng cốt nhỏ đã được tin cậy, đừng lấy từ danh sách ghi tên mở — người vừa thoát khỏi nguy hiểm không bao giờ nên phải băn khoăn liệu một người lạ trong đội có biết địa chỉ mới của mình.",
    "Một chiếc xe đẩy bốn bánh chở đồ nặng cho ra hồn ngăn được nhiều chấn thương hơn mọi bài nhắc nhở về cách nhấc đồ — hãy ưu tiên nó, và viết tên chương trình lên mọi món để chúng thật sự quay về.",
    "Hỏi hai câu ai cũng quên: còn thứ gì chưa đóng thùng không, và chỗ đậu xe hợp lệ cách cửa bao xa? Đồ chưa đóng thùng và một quãng khiêng dài chính là thứ biến hai giờ thành sáu giờ.",
    "Hãy viết một quy tắc cứng về sức nặng — không món nào nặng quá chừng 23 kg mà lại để dưới hai người khiêng — trước cả khi viết tờ miễn trừ. Một tờ giấy đã ký không chữa được cái lưng đã hỏng; cái giới hạn thì có.",
    "Trong cuộc gọi hôm trước, hãy chốt xem người đó đã đóng thùng xong thật chưa, không phải “gần xong” — một căn hộ chưa đóng thùng là lý do thường gặp nhất khiến cả đội đứng chờ và cả lịch đổ vỡ.",
    "Đi kèm mỗi giới hạn là một chỗ để chỉ sang — cây đàn piano, căn hộ tầng bốn không thang máy, căn nhà chất đầy đồ — để mỗi lần từ chối vẫn đưa cho người ta một cuộc gọi kế tiếp thay vì một ngõ cụt.",
    "Hãy đi một vòng căn nhà cũ cùng người đó lần cuối trước khi lăn bánh — cái tủ bị quên và cái sạc điện thoại bỏ sót chỉ tìm được lúc này hoặc không bao giờ, còn quay lại sau thì hiếm khi xảy ra."
  ],
  "disability-support-network": [
    "Ngay từ ngày đầu, hãy dành sẵn khoản chi cho chi phí tiếp cận và cho thời gian của những người dẫn dắt — cái “vai dẫn dắt” không được trả công sẽ lặng lẽ rơi vào tay ai kham nổi việc làm không công, mà đó hiếm khi là những hàng xóm khuyết tật chịu ảnh hưởng nặng nhất.",
    "Hãy nhờ một người thật sự dùng trình đọc màn hình thử toàn bộ trước khi mở — máy dò tự động cho qua khối trang mà dùng thì khổ sở, còn tờ rơi chỉ có hình thì chặn hẳn người ta ở ngoài.",
    "Hãy kiểm xem từng nguồn có thật sự tiếp cận được không trước khi ghi vào danh bạ — gọi hỏi về thang máy, nhà vệ sinh, cách tiếp nhận. Một cuốn danh bạ đẩy người ta tới một cái thang máy hỏng làm mất nhiều lòng tin hơn là gây dựng được.",
    "Hãy thiết kế sẵn một cách tạm nghỉ thật dễ, không cần lý do — bệnh mạn tính khiến sức khỏe lên xuống theo từng tuần, và một thành viên không lùi lại được cho êm thì sẽ biến mất hẳn.",
    "Đừng cho mượn thứ gì áp sát hơi thở hay da thịt — mặt nạ thở CPAP đã dùng, nệm — và hãy ghi lại số máy, vì thiết bị trợ giúp cũng bị thu hồi và bạn sẽ cần tìm người đang giữ thật nhanh.",
    "Hãy nắm các ngưỡng cắt trợ cấp trước khi khuyên ai — một món quà, một việc làm hay khoản tiết kiệm vượt mức có thể làm mất bảo hiểm của người ta. Chưa chắc thì chỉ họ tới người tư vấn trợ cấp thay vì đoán.",
    "Đặt một câu hỏi về nhu cầu tiếp cận vào phần xác nhận tham dự của mọi sự kiện, và đặt người phiên dịch hay phụ đề trực tiếp ngay khi vừa chốt ngày — người làm phụ đề giỏi bị đặt trước cả mấy tuần, còn “không kịp tìm được ai” chính là cách cái chuẩn lặng lẽ tuột đi."
  ],
  "books-to-prisoners": [
    "Xin quy định bằng văn bản và ghi ngày lên đó — các trại đổi quy định mà không báo, và một trang photo từ năm ngoái đúng là loại bằng chứng không cứu nổi một thùng bị trả về. Vài tháng lại kiểm tra lại một lần.",
    "Hãy loại ngay ở cửa sách bìa cứng, sách ố nước và sách bị viết vẽ lên — phần lớn các trại không nhận, và một phòng đóng gói chôn dưới đống sách không gửi được thì chậm hơn cả phòng chỉ có nửa số sách.",
    "Hãy chép tên, số hồ sơ và khu giam của từng người đúng y như họ viết, từng chữ một — chỉ đảo một chữ số là cả gói bị trả về sau mấy tuần mà không còn cách nào báo cho họ biết vì sao.",
    "Dán một bảng kiểm quy định lên tường và để một người thứ hai soát mọi gói trước khi dán băng keo — người mới đều có lòng nhưng vẫn gói sai, mà lỗi thì tới lúc gói bị trả về mới lộ ra.",
    "Media Mail (cước bưu điện rẻ dành cho sách) rẻ hơn nhiều, nhưng theo luật thì không được kèm thư riêng — chỉ kẹp mấy dòng ở nơi cả trại lẫn quy định bưu điện đều cho phép, nếu không cái giá hời sẽ thành một gói bị trả về.",
    "Trước lá thư đầu tiên, hãy dặn kỹ người viết hai ranh giới khó — không cho địa chỉ nhà hay họ tên đầy đủ, và có sẵn một câu trả lời tử tế mà dứt khoát cho những lời xin tiền hay ngỏ tình — để sự ấm áp không bao giờ biến thành cảm giác bị mắc kẹt."
  ],
  "community-music": [
    "Hãy thử chơi hoặc mở hộp đàn ra trước khi nhận bất cứ thứ gì — một cái cần đàn vênh hay một miếng đệm nứt có khi tốn hơn cả một cây đàn mới cho người mới, còn đàn piano “cho không” thì gần như không bao giờ đáng công chở và lên dây.",
    "Hãy chụp lại tình trạng từng cây đàn lúc cho mượn — nó gỡ êm mọi câu chuyện “cây này xước sẵn rồi mà”, và đó cũng chính là bằng chứng bạn sẽ cần nếu có cây không bao giờ quay về.",
    "Nếu lớp có trẻ nhỏ, hãy kiểm tra lý lịch trước buổi đầu tiên, không ngoại lệ — đó là bước chẳng hào nhoáng gì nhưng giữ an toàn cho trẻ và cho cả chương trình, mà thêm vào sau khi ai đó đã dạy rồi thì khó hơn nhiều.",
    "Hãy chắc rằng chỗ đó là của bạn vào đúng những giờ bạn thật sự dùng — một hội trường trống sáng thứ Ba thì vô ích với trẻ tan học — và hỏi luôn về một cái tủ có khóa để kho nhạc cụ ở ngay nơi người ta chơi.",
    "Hãy có ít nhất một buổi chơi chung ghi rõ là dành cho người mới — thả một tay chơi nhanh và một người lần đầu vào cùng một vòng thì người mới thường về nhà lặng lẽ và không quay lại nữa.",
    "Hãy nói thẳng với người mượn: có gì hỏng thì mang về đây, đừng tự sửa — một vết keo dán ở nhà hay một sợi dây lên căng quá mới là cái làm hỏng thật, còn sợ bị bắt đền là thứ khiến người ta giấu đi."
  ],
  "school-supply-program": [
    "Xin bằng được danh sách chính xác, kể cả nhãn hiệu — cô giáo dặn vở dòng kẻ rộng thì sẽ trả về nhà cuốn vở dòng kẻ hẹp bạn đã mua — và hỏi thầy cô tư vấn một con số gia đình thật để bạn khỏi đoán số lượng.",
    "Những món căn bản chẳng hào nhoáng — bút chì, giấy dòng kẻ rộng, hồ dán — thì bạn tự mua sỉ, còn đợt quyên góp cứ để mang về mấy món vui mắt; chính mấy thứ căn bản đó là cái thùng quyên góp không bao giờ gom đủ.",
    "Dán danh sách của từng khối ngay tại mỗi bàn soạn và để ba lô không dán kín — đứa trẻ cần kéo cho người thuận tay trái hay cần cỡ lớn hơn phải đổi được ngay lúc nhận, chứ không phải bóc một cái túi đã dán băng keo.",
    "Giữ hàng không để sát nền, ở chỗ khô ráo và có khóa — bìa các tông hút ẩm, còn một trận ngập trong nhà để xe là công gom cả mùa hè đổ đi — và chọn điểm phát nằm trên tuyến xe buýt các gia đình vốn hay đi.",
    "Hãy làm buổi trao trước ngày tựu trường một hai tuần, đừng để tới cuối tuần cuống cuồng ngay trước đó, và bỏ hết mọi tờ khai thu nhập — để trẻ tự chọn màu ba lô, thì không ai ra về với cảm giác bị soi."
  ],
  "legal-aid-clinic": [
    "Hỏi từng luật sư xem bảo hiểm trách nhiệm nghề nghiệp của họ có bao cả phần việc làm không công không — nhiều chương trình pro bono của đoàn luật sư bao miễn phí, nhưng chỉ khi phòng tư vấn ghi danh trước. Một luật sư không có bảo hiểm sẽ lặng lẽ từ chối những vụ khó.",
    "Trước khi mở cửa, hãy xin cho được tên một người cụ thể và thời gian chờ thật lòng ở từng nơi nhận chuyển tiếp, đừng chỉ lấy số tổng đài — câu “gọi trung tâm trợ giúp pháp lý đi” mà sau lưng là danh sách chờ ba tháng nghe như một cái phẩy tay với người đang cùng quẫn.",
    "Đứng ở chỗ ngồi chờ và thử xem có nghe được giọng nói bình thường từ phòng tư vấn không — một cái bàn chung hay một phòng cửa kính âm thầm xóa sạch sự kín đáo mà cả phòng tư vấn dựa vào.",
    "Đừng ghi nội dung vụ việc lên phiếu đặt hẹn — một tờ lịch dùng chung mà ghi “bị đuổi khỏi nhà, không giấy tờ” là một vụ lộ chuyện chỉ chờ ngày xảy ra. Chỉ tên và giờ hẹn thôi; chi tiết để nói trong phòng.",
    "Ghi ngày lên mọi tờ tài liệu phát tay và nhờ một luật sư soát lại trước khi in — luật về quyền lợi thay đổi, và một tờ rơi dẫn điều luật đã bị bãi bỏ sẽ đẩy người ta ra tòa với niềm tin vào thứ không còn đúng nữa.",
    "Chắc chắn đã mời được người phiên dịch rồi mới loan tin buổi tư vấn bằng thứ tiếng đó, và đừng bao giờ để con của người đến nhờ giúp dịch những chi tiết pháp lý — hãy tìm một người lớn phiên dịch, hoặc dời buổi hẹn.",
    "Soát xung đột lợi ích với danh sách người đến nhờ giúp trước buổi hẹn, chứ không phải lúc người ta đã ngồi xuống — trong một khu phố nhỏ, sớm muộn bạn sẽ xếp lịch cho cả chủ nhà lẫn người thuê nhà của họ, mà tới bàn rồi thì đã muộn."
  ],
  "resource-hub-dispatch": [
    "Giao cho từng kênh một người thật và một lịch kiểm tra trước khi công bố kênh đó — một hộp thư thoại không ai nghe hay một mẫu điền không ai đọc dạy mọi người rằng đầu mối chỉ là diễn, và cái tiếng đó rất khó gỡ.",
    "Ghi lại giới hạn cứng và cách liên lạc mà từng người giúp thích, chứ không chỉ ghi sở trường — và xác nhận lại cả danh sách mỗi quý, vì một danh sách toàn người gật đầu từ tám tháng trước thì phần lớn chỉ là tưởng tượng.",
    "Giao mỗi lời nhờ cho đúng một người điều phối có tên, người đó theo tới lúc khép lại — “cả nhóm đang lo” nghĩa là chẳng ai lo. Ngay cả một câu “việc này chưa lo được” trong vòng một ngày cũng hơn hẳn sự im lặng để ai đó chờ vô vọng.",
    "Gọi thử từng mục trong danh bạ như thể bạn là người đang cần giúp, rồi ghi lại điều kiện nhận và giờ mở cửa thật — danh bạ mục nát rất nhanh, và đẩy ai đó đi ngang thành phố tới một nơi đã đóng hoặc không nhận họ là phí đúng cái lòng tin bạn đang gây dựng.",
    "Viết cách chuyển việc ra giấy để một người điều phối mới chỉ nhìn tờ giấy là trực được một ca — rủi ro thật của đầu mối không phải một ngày vắng khách, mà là mọi quyết định chuyển việc chỉ nằm trong đầu một người đã kiệt sức.",
    "Quyết xem cái gì bị xóa và xóa khi nào, chứ không chỉ giữ ra sao — hồ sơ đã dọn đi thì không thể bị tòa trưng tập, bị lộ hay bị đánh cắp. Khép một lời nhờ lại, giữ con số kết quả, bỏ hết chi tiết riêng tư.",
    "Ghi mỗi việc chưa lo được vào một nhóm cố định ngay lúc nó xảy ra, chứ đừng cuối tháng ngồi nhớ lại — câu “việc này cứ mãi không lo nổi” chỉ thành một lý do đủ sức xin tiền cho dự án mới khi các mục cộng lại thành một con số."
  ],
  "harm-reduction-supplies": [
    "Hỏi xem nhóm bạn có được đi phát dưới chiếc ô pháp lý và đơn thường trực của tổ chức cùng phối hợp không — thường thì phần che chở pháp lý khi ứng phó sốc thuốc của họ sẽ phủ luôn sang nhóm bạn, và bạn bớt được mấy tháng ngồi gỡ đúng đống giấy tờ đó một mình.",
    "Ghi lại đúng điều luật, hoặc tên người đã nói với bạn, kèm ngày tháng — câu “nghe nói que thử không sao đâu” chẳng giúp được gì cho một người góp tay đang phải giải thích với cảnh sát về một ba lô đầy que thử, mà mấy luật này thì năm nào cũng đổi.",
    "Kiểm hạn dùng ngay hôm naloxone về và cất chỗ tránh nóng tránh lạnh — một liều bị hầm trong cốp xe mùa hè hay đông cứng giữa mùa lạnh có thể hỏng đúng vào lúc cần tới nó.",
    "Gọi thử mọi số đường dây khủng hoảng và nơi cai nghiện trước khi in vài trăm tờ hướng dẫn — một số đã cắt hay của huyện khác mà phát hiện ra giữa lúc có người sốc thuốc là một bất ngờ tàn nhẫn, còn in lại cả loạt gói thì mệt hơn hẳn một buổi chiều ngồi bấm số.",
    "Giữ nguyên đường đi và giờ giấc ở mỗi vòng để người ta biết lúc nào tìm được bạn — sự đều đặn chính là toàn bộ mối quan hệ. Và mỗi chỗ giữ hộp cố định hãy có một người đứng tên lo đi bù hàng, không thì hộp cạn dần rồi âm thầm biến mất.",
    "Đếm số món đã phát đi, đừng đếm người đã nhận — một tờ ký tên hay một câu hỏi giấy tùy thân ngay tại bàn sẽ dựng lại đúng cái rào bạn vừa phá bỏ. Chuyện kéo được ai đó qua cơn sốc thuốc chỉ đáng ghi lại khi chính người ta tự nguyện kể ra."
  ],
  "court-support": [
    "Hỏi văn phòng luật sư bào chữa công xem họ muốn được liên lạc bằng cách nào và điều gì thật sự giúp được — hãy tới như những đôi tay phụ thêm, đừng tới như người đi chấm điểm công việc của họ, không thì mối quan hệ khép lại trước khi kịp mở ra.",
    "Tập nói cho quen đúng mấy chữ “việc này tôi không khuyên được đâu — hỏi luật sư của mình nhé” cho tới lúc buột miệng là ra; câu hỏi ngoài hành lang tới rất nhanh và rất thân tình, mà chính cái bản năng muốn giúp mới là thứ làm hỏng một vụ việc.",
    "Đối chiếu từng ngày và từng phòng xử với chính lịch xử án của tòa từ chiều hôm trước — đừng dựa vào trí nhớ của người ra tòa. Phiên tòa bị dời và phòng bị đổi liên tục, mà một lần vắng mặt dù ngay tình cũng có thể thành một lệnh bắt.",
    "Dẫn người mới đi qua cửa an ninh trước lần đầu của họ — xếp hàng mất 30 phút, dao bỏ túi và đôi khi cả điện thoại đều bị chặn lại, và một phiên tòa có thể là ba tiếng chờ để đổi lấy hai phút trong phòng xử.",
    "Mỗi buổi sáng ra tòa hãy có sẵn một người lái xe dự phòng và xác nhận lại với người chính từ tối hôm trước — một chuyến xe hụt ở đây không phải chuyện bất tiện, đó là một phiên tòa bị lỡ và có thể là một lệnh bắt.",
    "Xin luật sư viết ra giấy hướng dẫn về nội dung, gửi cho ai và hạn nộp, rồi giữ mọi lá thư lại cho luật sư đọc trước khi gửi đi — một câu có ý tốt mà nhận lỗi hoặc trái với hướng bào chữa có thể gây hại thật sự."
  ],
  "cooling-warming-center": [
    "Thử máy lạnh hay lò sưởi vào một ngày thời tiết thật khắc nghiệt, đừng thử vào ngày dịu — một căn phòng dễ chịu hồi mùa xuân có thể thua hẳn một đợt nắng 38 độ, và nếu không thử trước thì bạn sẽ biết điều đó lúc đang có người yếu sức ngồi bên trong.",
    "Buộc mốc mở cửa vào một con số cụ thể của cơ quan khí tượng, để nửa đêm không ai còn cãi nhau “đã đủ tệ chưa” — và chỉ định một người có quyền hô mở cửa, để quyết định không bao giờ bị kẹt lại.",
    "Dán nhãn rõ ràng lên từng thùng và dán một tờ kê đồ bên trong cánh cửa kho — giữa lúc đang mở cửa, một người trực ca hoàn toàn mới cần tìm ra túi sơ cứu hay mấy cục sạc trong vài giây, chứ không phải bới tung mấy cái thùng không nhãn.",
    "Tập đi tập lại đúng một quyết định quan trọng nhất: sốc nhiệt và hạ thân nhiệt trông ra sao, và một quy tắc thường trực là gọi cấp cứu sớm. Nói thẳng với người trực ca rằng sẽ không ai bị trách vì đã gọi — chần chừ mới là nguy hiểm, phản ứng quá mức thì không.",
    "Đừng bao giờ xếp một người trực ca một mình — hai người mỗi ca sẽ đỡ nhau lúc nghỉ tay, lúc đi vệ sinh, và lúc có người cần giúp trong khi người kia đang gọi cấp cứu. Giữ một danh sách dự bị có tên, vì chính thời tiết làm đầy điểm trú cũng làm gục những người góp tay.",
    "Đưa tờ rơi qua tay những người thật sự tới được chỗ các cụ sống một mình — người đi giao cơm, người trông coi khu nhà, người đi thăm hỏi tận nơi — bởi những hàng xóm gặp nguy hiểm nhất lại đúng là những người không thấy mấy mẩu tin của bạn trên mạng.",
    "Ngó chừng bất cứ ai đang ngủ, đừng mặc định là người ta chỉ đang nghỉ — không thể phân biệt một giấc ngủ trưa với cơn sốc nhiệt hay hạ thân nhiệt nếu không nhẹ nhàng lay người ta dậy, và chính cái ngó chừng lặng lẽ ấy là lý do điểm trú tồn tại."
  ],
  "community-oral-history": [
    "Chẻ chuyện “chia sẻ” ra thành từng ô đánh dấu cụ thể — có gắn tên hay không, chỉ trong nhà, hay công khai trên mạng — thay vì một cái gật chung chung, và cho người ta một cách liên lạc lại với bạn để đổi ý. Sự đồng ý là một cái núm vặn, không phải cái công tắc.",
    "Ghi thử 30 giây và nghe lại trước buổi thật — một cái tủ lạnh đang ù, một căn phòng vang tiếng, hay một chiếc điện thoại gần đầy bộ nhớ tắt ngóm đúng đoạn hay nhất thì sau đó không sửa được nữa, mà câu chuyện thì hiếm khi kể lại lần hai.",
    "Khi câu chuyện chạm tới chỗ đau hay chỗ riêng tư, hãy dừng lại và hỏi lại xem đoạn đó có giữ được không — một cái gật đầu trước lúc ghi âm có thể rất khác khi lời đã thật sự nói ra thành tiếng, mà hỏi lại thì chẳng mất gì của bạn cả.",
    "Giữ hai bản sao ở hai nơi thật sự khác nhau — một trên điện thoại và một trên tài khoản đám mây, chứ không phải hai thư mục trong cùng một chiếc laptop — và đọc lại giấy đồng ý trước khi đưa bất cứ thứ gì ra công khai, vì ý muốn của người ta trôi đổi theo năm tháng."
  ],
  "community-solar-coop": [
    "Hãy xin những gia đình quan tâm một điều gì đó nhỏ nhưng có thật — một tờ cam kết đã ký hay một khoản đặt cọc trả lại được — và ghi lại công ty điện nào đang bán điện cho từng nhà; một rừng cánh tay giơ lên trong buổi họp sẽ khiến bạn đếm dôi lên gấp rưỡi.",
    "Bắt đầu từ cơ sở dữ liệu DSIRE và chính trang điện mặt trời cộng đồng của công ty điện chỗ bạn, rồi gọi cơ quan năng lượng của bang để xác nhận — một điều luật vừa đổi trong kỳ họp vừa rồi có thể âm thầm làm hỏng cả một năm tính toán.",
    "Trước khi ai đó trót phải lòng một mái nhà, hãy xem tuổi của mái và bóng che — một mái phải thay trong tám năm nữa nghĩa là phải trả tiền tháo cả dàn pin xuống rồi lắp lại giữa chừng. Hỏi các chương trình sẵn có về danh sách chờ trước đã.",
    "Giữ chặt lằn ranh: không thành viên nào ký bất cứ thứ gì — thuê bao, hợp đồng thuê, khoản vay — cho tới khi một luật sư hiểu về hợp tác xã năng lượng đã đọc qua. Hãy tính sẵn tiền cho lần đọc đó ngay từ đầu; nó rẻ hơn bất cứ điều khoản nào nó bắt được.",
    "Gọi hỏi những công trình từ năm năm trước của mỗi thợ lắp đặt, đừng hỏi công trình tháng rồi — thứ bạn đang thuê là cách họ xử lý những trục trặc của năm thứ tư. Hãy bắt họ tính luôn phần bảo dưỡng vào báo giá, chứ đừng nhận lời hứa miệng.",
    "Làm thử một tờ sao kê hằng tháng đúng như thành viên sẽ nhận, trước ngày mở màn, rồi đưa cho người ngại con số nhất trong nhóm đọc thử — và nhớ cho xem cả một tháng mùa đông ít nắng, đừng chỉ đưa ví dụ tháng sáu chan hòa, để về sau không ai thấy mình bị gạt.",
    "Bảo thành viên mang một tờ hóa đơn tiền điện thật tới một buổi cùng ngồi đọc — cùng nhau giải mã các bậc giá và phí truyền tải đọng lại hơn hẳn mọi tờ tài liệu phát tay, và người hàng xóm đã cắt được hai mươi phần trăm chính là người thầy giỏi nhất của bạn."
  ],
  "worker-coop-incubator": [
    "Hỏi cả về những việc không lương và việc không tên, đừng chỉ hỏi lịch sử đi làm — người “chỉ” nấu ăn cho một nhà thờ hai trăm người hay sửa xe cho hết thảy họ hàng đang có tay nghề đủ sức mở một nhóm làm ăn mà họ sẽ không tự nhắc tới.",
    "Mở mỗi buổi ít nhất hai lần, trong đó có một buổi tối hoặc cuối tuần, và lo sẵn người trông trẻ — những thành viên cần lớp này nhất lại đúng là những người bị một buổi sáng ngày thường gạt ra ngoài.",
    "Dẫn cả nhóm tới thăm một hợp tác xã đang chạy và để thành viên tự hỏi han những người vừa làm vừa làm chủ, không có bạn trong phòng — và hãy dạy thật lòng cả những lúc hợp tác xã không phải lối phù hợp, vì phát hiện ra sự lệch pha sau khi đã đăng ký thành lập thì rất tàn nhẫn.",
    "Bắt nhóm viết trước những điều lệ khó chịu nhất — một người rời đi thế nào, bế tắc gỡ ra sao, ai đó bị đưa ra khỏi nhóm bằng cách nào. Những nhóm chỉ soạn luật cho đường đẹp sẽ khám phá ra phần còn lại giữa lúc khủng hoảng.",
    "Với từng nguồn tiền, hãy ghi hạn nộp, giấy tờ nó đòi, và một con người để liên hệ — rồi soát lại mỗi quý. Một nửa số quỹ dành cho hợp tác xã trong bất cứ danh sách nào bạn tìm được đều đã đóng, đã đổi tên, hoặc đã cạn tiền.",
    "Thống nhất nhịp gặp và phạm vi ngay buổi đầu — một tiếng mỗi tháng đã ghi vào lịch, có nội dung sẵn, sống lâu hơn thiện chí. Cố ghép người dìu dắt theo đúng ngành nghề; con số lời lãi của một tiệm bánh làm một người tư vấn ngơ ngác.",
    "Ươm mạng lưới bằng những vụ mua bán thật, đừng chỉ bằng các buổi gặp mặt — cho hợp tác xã dọn dẹp báo giá dọn bếp cho hợp tác xã nấu tiệc, và biến một vòng nhờ giới thiệu khách thành mục cố định trong mọi buổi gặp."
  ],
  "elder-meal-delivery": [
    "Hãy để một gương mặt quen thuộc giới thiệu giùm — y tá của nhà thờ hay người ở câu lạc bộ người cao tuổi vốn đã quen sẵn — vì tiếng gõ cửa của người lạ thường nhận lại một lời từ chối lịch sự, đúng từ những người cần điều này nhất.",
    "Kiểm tra lý lịch thường mất hai đến bốn tuần, nên hãy làm trước khi công bố ngày bắt đầu. Lúc trò chuyện, hãy dò sự bền bỉ hơn là sự hăng hái — hỏi xem họ đã giữ được việc gì đều đặn hằng tuần suốt một năm qua.",
    "Hãy hâm thử một suất mẫu bằng lò vi sóng thường trước khi chốt loại hộp nào — có loại cong vênh, có loại cứ lạnh ngắt ở giữa — và ghi cả ngày lên nhãn, vì chỉ ghi món mà không ghi ngày nấu thì người ta vẫn phải đoán.",
    "Giới hạn mỗi tuyến ở mức còn dư mười phút thong thả cho mỗi nhà — thường là năm sáu điểm dừng — và xếp những người yếu nhất vào đầu tuyến, để một buổi trễ giờ không bao giờ đẩy họ sang ngày hôm sau.",
    "Trên tờ lộ trình chỉ in phần dị ứng và cách vào nhà, phần còn lại cất kỹ dưới khóa — và đặt sẵn một lời nhắc hỏi lại sau mỗi lần nằm viện, vì đó chính là lúc danh sách thuốc thay đổi.",
    "Ngay khi mỗi người cao tuổi tham gia, hãy hỏi luôn ai đang giữ chìa khóa nhà và một số điện thoại dự phòng, đừng đợi tới phen hoảng hồn đầu tiên — và rút gọn cách xử lý vào một tấm thẻ bỏ túi, vì đứng trước cửa nhà thì chẳng ai giở cả tập giấy ra đọc.",
    "Hãy hỏi người cao tuổi trực tiếp, từng người một — gửi phiếu khảo sát qua bưu điện cho nhóm này thì phần lớn là im lặng — và khi một người góp một tay lỡ tuần đầu tiên, hãy coi đó là dịp để trò chuyện chứ không phải một lỗi lầm; thường đó là dấu hiệu sớm của kiệt sức."
  ],
  "disaster-relief-hub": [
    "Đối chiếu cả hai mặt bằng với bản đồ ngập lụt và chọn chỗ dự phòng ở thế đất khác — điểm chính và chỗ dự phòng cùng nằm trên một con đường trũng thì cùng chìm trong một trận bão. Chìa khóa thì tự tay bạn thử.",
    "Mở tài khoản với nhà cung cấp và thương lượng sẵn một thỏa thuận mua hàng từ bây giờ — sau thiên tai, tiền mặt mua đúng thứ đang cần, còn các đợt quyên góp thì đưa tới những thùng đồ hên xui. Hỏi từng nhà cung cấp bằng văn bản: lúc có chuyện họ giữ được cho mình bao nhiêu hàng.",
    "Chốt ngay từ giờ những thứ bạn sẽ từ chối — quần áo cũ là thứ giết chết điểm cứu trợ kinh điển nhất — và viết sẵn lời từ chối nhã nhặn cho người đứng ở cửa. Một tấm bạt kẻ ô bằng bút lông cộng với bảng phấn ghi số ăn đứt phần mềm mà giữa cơn khủng hoảng bạn sẽ bỏ ngang.",
    "Định sẵn mỗi nhà được bao nhiêu trước ngày mở cửa và dán bảng bằng mọi thứ tiếng có ở địa phương — mức giới hạn ai cũng thấy thì đọc ra là công bằng, còn chia phần tùy hứng giữa lúc căng thẳng thì đọc ra là thiên vị, rồi sinh ra những trận cãi vã làm trống cả hàng người đang góp sức.",
    "Mỗi năm hãy diễn tập thật một lần — xe tải, phân loại, một hàng phát đồ giả định — và mỗi vai trò đều có tên người phụ trách kèm một người dự phòng. Một cú thử cây nhắn tin không báo trước sẽ cho bạn biết ai còn thật sự gọi được.",
    "Ghi tên mình vào danh bạ liên lạc của cơ quan phòng chống thiên tai địa phương và dự họp cùng họ ngay từ bây giờ — rồi trao đổi số di động với một người cụ thể ở mỗi nơi, vì sau thiên tai thì tổng đài là thứ chết máy trước tiên.",
    "Giữ bản in ép nhựa của cây liên lạc và sơ đồ mặt bằng ở cả hai chỗ và trong xe của hai người điều phối — và ghi ra giấy cả những luật chống thương tích tầm thường nhất: đeo găng khi phân loại, mỗi món nặng phải hai người khiêng."
  ],
  "recovery-peer-support": [
    "Đặt mức tối thiểu về thời gian giữ vững được cho người dẫn nhóm — nhiều chương trình lấy mốc hai năm — và luôn tập huấn ít nhất hai người, để không buổi gặp nào và không thành viên nào phải phụ thuộc vào tuần khó khăn nhất của một người duy nhất.",
    "Hãy đưa cho người dẫn nhóm đúng một câu để nói khi có ai hỏi chuyện cắt cơn hay thuốc men: “Đó là câu hỏi thuộc về y khoa, và đây là người có thể trả lời an toàn cho bạn.” Lời đã tập trước thì đứng vững được lúc cả căn phòng đang khẩn thiết muốn nghe.",
    "Hãy để sẵn naloxone ở mọi buổi gặp và tập cho từng người dẫn nhóm biết dùng, đồng thời dán các số đường dây nóng lúc khủng hoảng ở chỗ ai cũng thấy — kế hoạch cho tình huống quá liều chỉ có giá trị nếu tối nay, ngay trong căn phòng này, nó chạy được.",
    "Hãy ghé xem chỗ đó đúng vào giờ nhóm sẽ gặp và nhìn quanh xem có những ai — một tòa nhà có đêm quán bar hay sảnh chờ ồn ào lúc bảy giờ tối sẽ xóa sạch sự kín đáo mà buổi tham quan một chiều vắng vẻ đã hứa hẹn.",
    "Hãy nói to cả những ngoại lệ cùng lúc với lời hứa — khi có nguy hiểm cận kề cho chính mình hay cho người khác thì phải đi tìm sự giúp đỡ chứ không im lặng — vì thành viên xứng đáng biết giới hạn của lời hứa giữ kín trước khi họ kể, chứ không phải sau.",
    "Hãy đưa tờ rơi tận tay những người trò chuyện với bà con đúng vào lúc họ phải quyết định — người lo thủ tục xuất viện, người hướng dẫn ở tòa, nhân viên phòng khám — và tuyệt đối không đăng ảnh chụp trong buổi gặp. Một căn phòng và một giờ cố định còn quý hơn tiếng vang rộng.",
    "Hãy sắp một buổi trút bầu tâm sự hằng tháng cho người dẫn nhóm với một người ngoài nhóm, và cùng nhau định trước cách một người dẫn nhóm lùi lại nếu chặng đường của chính họ chao đảo — một lối lui đàng hoàng nghĩ sẵn từ sớm sẽ chặn được một cơn khủng hoảng về sau."
  ],
  "community-fitness": [
    "Hãy hỏi điều gì sẽ khiến người ta không tới được — giờ giấc, con nhỏ không ai trông, sợ bị nhìn ngó — chứ đừng chỉ hỏi cái gì nghe vui. Những rào cản bạn nghe được sẽ định hình chương trình nhiều hơn cả danh sách môn tập.",
    "Hãy xem mỗi người dẫn thử mười phút trước khi chốt — sự niềm nở lộ ra rất nhanh, mà thiếu nó cũng lộ ra nhanh y vậy — và mời hai người dẫn cho mỗi môn, vì một người dẫn duy nhất đi vắng là buổi tập hủy.",
    "Hãy ghé từng chỗ đúng vào giờ định tập — cái công viên râm mát, yên tĩnh của buổi sáng có thể nóng như rang hoặc lởm khởm lúc sáu giờ chiều — và xác nhận giờ đó nhà vệ sinh có thật sự mở.",
    "Hãy làm mẫu bản nhẹ nhất của mỗi động tác trước và coi đó là bản mặc định, không phải bản chỉnh cho người yếu — khi cách tập ngồi ghế đi đầu, không ai phải công khai tự hạ mình xuống mới dám dùng nó.",
    "Người dẫn nên mang theo điện thoại đã sạc đầy và thuộc địa chỉ chính xác hoặc cổng công viên để báo cho cấp cứu — nói “cái sân rộng cạnh trường” là mất mấy phút quý — và giữ một tấm thẻ ghi người cần gọi cho từng người tập đều.",
    "Hãy quyết cách xử lý khi trời xấu trước lúc vào mùa và báo mọi thay đổi ở đúng một chỗ quen — và nhớ rằng một lời “đi với tôi cho vui” lấp được nhiều chỗ hơn mọi tờ rơi; hãy nhờ từng người tập đều rủ thêm một người hàng xóm.",
    "Hãy để ý những buổi ai đó vắng và nói ra — một tin nhắn thân tình “nhớ bạn quá” sau hai buổi vắng kéo người ta trở lại, còn im lặng thì dạy họ rằng chẳng ai để ý mình đi đâu. Nói cho ấm áp, đừng bao giờ nghe như trách móc."
  ],
  "urban-orchard": [
    "Hãy hỏi cây sẽ ra sao nếu mảnh đất đổi chủ, rồi đưa câu trả lời vào chính bản thỏa thuận — một hợp đồng mười năm mà bán đất là hết hiệu lực thì cũng chỉ là cái bắt tay theo mùa mặc áo vest.",
    "Hãy xét nghiệm đất tìm chì và các chất độc, và gọi bên hạ tầng đến dò đường ống ngầm trước khi chốt bản vẽ — một đường ống ga chôn dưới đất hay một chỉ số chì cao sẽ vẽ lại tấm bản đồ của bạn, vậy thì cứ để nó vẽ lại bản trên giấy.",
    "Hãy hỏi trạm khuyến nông xem giống kháng bệnh nào thật sự sống khỏe ở vùng mình, và khó tính với cây được tặng — một cây con miễn phí mang bệnh cháy lá vào vườn non là món quà đắt nhất đời bạn từng nhận.",
    "Hãy phủ bìa các-tông và rơm rạ hoặc dọn sạch từng vòng tròn trồng cây từ mấy tuần trước, đừng để sáng hôm ấy mới làm, và cho nước chảy được tới nơi trước ngày trồng — xách xô cho bốn chục cây mới là bào sức người ta rất nhanh.",
    "Hãy cùng nhau trồng một cây làm mẫu trước khi có ai cầm xẻng, và cắt một người có kinh nghiệm đứng coi năm sáu cây một — lỗi chết người là trồng quá sâu, nên hãy lấy “tìm cho ra cổ rễ” làm câu cửa miệng của cả ngày hôm đó.",
    "Hãy phân việc tưới theo tên người và theo tháng trên một tấm lịch dán công khai — “ai rảnh thì làm” nghĩa là không ai làm — và ghi lại từng lần tưới, vì một cây non cần chừng bốn mươi đến sáu mươi lít nước mỗi tuần trong hai mùa nắng đầu.",
    "Cứ liệu trước là người qua đường sẽ hái trái, và quyết ngay bây giờ xem vậy có sao không — phần lớn vườn treo bảng “hái vài trái, chừa lại cho người sau” đều ổn — và đặt lệ ấy lên tấm bảng ngoài cổng, chứ đừng để trong biên bản họp."
  ],
  "new-parent-support": [
    "Hãy mời làm người đồng cảnh những cha mẹ có con nhỏ nhất đã qua tuổi ẵm ngửa nhưng chưa quá năm tuổi — đủ gần để nhớ thật, đủ xa để còn sức. Người đang giữa cơn mụ mị vì trẻ sơ sinh thì không đỡ nổi cơn của người khác.",
    "Hãy xếp bữa cách hai ba ngày một lần trải suốt sáu tám tuần, thay vì ngày nào cũng có nhưng chỉ trong hai tuần — chặng khó kéo dài hơn cơn lũ thức ăn ban đầu — và gợi ý đặt một thùng giữ lạnh ngoài hiên để người đưa cơm không phải bấm chuông.",
    "Hãy đưa ra một thực đơn cụ thể — “giặt đồ, rửa chén, hay dắt anh ra công viên một tiếng?” — vì câu “nhà cần gì không?” gần như luôn nhận lại “thôi khỏi, nhà ổn mà” từ những người quá mệt để nghĩ ra việc giao cho người lạ.",
    "Với mỗi chỗ, hãy ghi luôn nơi đó nhận bảo hiểm nào, chờ thật sự bao lâu, và hai giờ sáng có ai bắt máy không — cơn khủng hoảng của người mới làm cha mẹ chạy theo giờ của trẻ sơ sinh, mà phần lớn danh bạ chỉ ghi những thông tin ban ngày.",
    "Hãy đưa cho mỗi người đồng cảnh cùng một câu ngắn để gọi tên chuyện đó — “nghe như đây không chỉ là mệt, và cái này chữa được; mình gọi cùng nhau nhé?” — và coi mọi lời nhắc tới chuyện tự làm đau mình là việc phải chuyển đi ngay trong ngày, không bao giờ chờ xem sao.",
    "Hãy gọi thật cho những người quen ấy — hai phút hỏi “bạn có dám để con mình cho người này bế không?” hơn mọi tờ khai — và cho cha mẹ quyền tạm dừng mà không phải giải thích gì; phải biện minh cho một quãng nghỉ đã là một gánh nặng riêng.",
    "Hãy biến mỗi lần chuyển tiếp thành một cú bàn giao ấm áp — một người có tên đang chờ cuộc gọi của họ, chứ không phải một số điện thoại trong danh sách — và chia sẻ vài thông tin cơ bản giữa các chương trình khi gia đình đồng ý, để người đã kiệt sức không phải kể lại câu chuyện của mình từ đầu."
  ],
  "foster-kinship-support": [
    "Nhớ rằng nhiều người họ hàng nuôi trẻ chưa từng đụng tới các cơ quan — hãy tìm họ qua thầy cô phụ trách tư vấn ở trường, bác sĩ nhi và các phòng làm trợ cấp — và mở đầu mọi cuộc gặp bằng một lời ngỏ thật cụ thể, như một chiếc giường đã sẵn, chứ không phải phần mô tả chương trình.",
    "Đừng nhận ghế ô tô nào không rõ lai lịch — va chạm để lại hư hỏng mắt thường không thấy — và đối chiếu từng chiếc ghế, từng cái cũi với danh sách thu hồi ngay hôm nhận. Quần áo thì phân theo cỡ ngay lúc nhận, đừng để “lát nữa”.",
    "Hãy xếp mọi thứ vào một chiếc ba lô hay túi xách tử tế mà đứa trẻ được giữ luôn — trẻ trong hoàn cảnh này quá nhiều lần phải dọn cả đời mình trong túi ni lông đựng rác — và đồ lót, vớ, đồ vệ sinh cá nhân thì luôn luôn là đồ mới, không ngoại lệ.",
    "Hãy hỏi cơ quan cho từng đứa trẻ một, xem ai được phép trông thay, trước khi ngỏ lời — có trường hợp chỉ người có giấy phép mới được trông, và một buổi trông giúp đầy thiện ý mà không đúng phép có thể làm chính chỗ ở của đứa trẻ lung lay.",
    "Hãy lo luôn chỗ trông trẻ ngay tại buổi gặp, do người đã được kiểm tra, nếu không thì đúng những người bạn mong gặp nhất lại không tới được — và thỉnh thoảng hãy mở một vòng riêng cho họ hàng nuôi trẻ, vì người bà đang nuôi con của con gái mình mang những nỗi đau mà cha mẹ nhận nuôi tạm không có.",
    "Hãy để lên đầu cuốn danh bạ những khoản tiền chẳng ai nhắc tới — trợ cấp cấp riêng cho đứa trẻ, khoản tiền quần áo cho trẻ nhận nuôi tạm, các chương trình hướng dẫn dành cho họ hàng — và ghép nó với một người nuôi trẻ lâu năm sẵn lòng dắt người mới qua bộ hồ sơ đầu tiên.",
    "Hãy tập cho từng người góp một tay về trình báo bắt buộc trước ca đầu tiên của họ — phải trình báo chuyện gì, báo cho ai, trong bao lâu — và giữ lệ về ảnh cho thật tuyệt đối: không tấm ảnh nào của một đứa trẻ đang được chăm sóc thay thế được đi bất cứ đâu, không bao giờ."
  ],
  "weather-survival-outreach": [
    "Hãy làm mỗi túi vừa sức để một người đi bộ vác cả ngày — một túi rút dây, không phải một thùng cồng kềnh — và bỏ qua vớ cotton; cotton ướt hút hết hơi ấm khỏi người, còn len thì ẩm vẫn giữ ấm.",
    "Hãy mua đồ cho mỗi mùa vào đợt xả hàng cuối mùa trước — chăn vào tháng ba, thùng đá vào tháng chín, giá chỉ bằng một phần ba — và xin khách sạn, phòng tập những khăn và chăn họ thải ra, xin theo lô.",
    "Hãy giữ tấm bản đồ như một tài liệu nhạy cảm đúng nghĩa — chia sẻ hớ hênh là nó thành bản chỉ đường cho những cuộc dẹp đuổi và quấy nhiễu. Chỉ để trong tay những người đi phát đã được tập, và đừng bao giờ đăng vị trí lên bất kỳ nhóm chat nào.",
    "Hãy ghép mỗi người mới với một người dày dạn trong ba chuyến đầu, và tập đóng vai nghe chữ “không” cho tới khi việc vui vẻ chấp nhận thành phản xạ — người từ chối tối nay ngày mai sẽ nhớ ai đã tôn trọng mình.",
    "Hãy lấy chỉ số nóng bức và nhiệt độ thấp nhất ban đêm làm mốc khởi động, đừng chỉ nhìn cây nhiệt kế — một đêm 13 độ mà mưa ướt sũng vẫn giết người — và đi các tuyến vào ngày trước đỉnh điểm, khi người ta còn kịp dời tới chỗ an toàn.",
    "Hãy gọi kiểm tra giường trống ngay trong ngày, và học cho biết mỗi nơi trú tạm vướng chỗ nào — thú nuôi, bạn đời, giờ giới nghiêm, luật không rượu bia — để nói thật được rằng đi tới đó thì người ta phải bỏ lại gì. Chỉ đường thật thà thì giữ được lòng tin.",
    "Hãy tập kỹ cái dấu hiệu trái khoáy này: người đang run cầm cập mà thôi run là đang nặng thêm, không phải đỡ hơn. Luật vẫn tuyệt đối — gọi cấp cứu trước đã, rồi trong lúc chờ mới che mát cho uống nước, hoặc ủ ấm và chắn gió."
  ]
};
