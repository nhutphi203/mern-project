const axios = require('axios');

describe('Chatbot Public Dashboard - AI Assistant', () => {
    const apiUrl = 'http://localhost:5000/api/v1/chat/public'; // Sửa lại nếu backend port khác

    const testCases = [
        {
            id: 1,
            user_question: 'Giờ làm việc của bệnh viện là gì?',
            expected_response: 'giờ làm việc',
            test_category: 'tra cứu thông tin',
            priority: 'High',
        },
        {
            id: 2,
            user_question: 'Địa chỉ bệnh viện ở đâu?',
            expected_response: 'địa chỉ',
            test_category: 'tra cứu thông tin',
            priority: 'High',
        },
        {
            id: 3,
            user_question: 'Tôi bị đau đầu, nên khám khoa nào?',
            expected_response: 'khoa thần kinh',
            test_category: 'y tế đơn giản',
            priority: 'Medium',
        },
        {
            id: 4,
            user_question: '!!!@@@###',
            expected_response: 'không hiểu',
            test_category: 'dữ liệu không hợp lệ',
            priority: 'Low',
        },
        {
            id: 5,
            user_question: '',
            expected_response: 'không được để trống',
            test_category: 'dữ liệu không hợp lệ',
            priority: 'High',
        },
        {
            id: 6,
            user_question: 'Thời tiết hôm nay thế nào?',
            expected_response: 'ngoài phạm vi',
            test_category: 'ngoài phạm vi',
            priority: 'Low',
        },
        {
            id: 7,
            user_question: 'Tôi muốn đặt lịch khám',
            expected_response: 'đăng nhập hoặc đăng ký',
            test_category: 'hướng dẫn quy trình',
            priority: 'High',
        },
        {
            id: 8,
            user_question: 'Tôi bị đau ngực, khó thở, phải làm sao?',
            expected_response: 'gọi cấp cứu',
            test_category: 'hỗ trợ khẩn cấp',
            priority: 'High',
        },
        {
            id: 9,
            user_question: 'Bệnh viện có wifi miễn phí không?',
            expected_response: 'wifi',
            test_category: 'FAQ',
            priority: 'Low',
        },
        {
            id: 10,
            user_question: 'Tôi muốn xem điểm của mình',
            expected_response: 'ngoài phạm vi',
            test_category: 'ngoài phạm vi',
            priority: 'Medium',
        },
    ];

    testCases.forEach(({ id, user_question, expected_response, test_category, priority }) => {
        test(`[${id}] (${priority}) ${test_category}: ${user_question}`, async () => {
            const res = await axios.post(apiUrl + '?mode=public', { message: user_question });
            expect(res.status).toBe(200);
            const botReply = res.data?.data?.message?.toLowerCase() || '';
            expect(botReply).toContain(expected_response);
        });
    });

    test('Người dùng hỏi liên tiếp nhiều câu', async () => {
        const questions = [
            'Giờ làm việc?',
            'Địa chỉ bệnh viện?',
            'Tôi muốn đặt lịch khám',
        ];
        for (const q of questions) {
            const res = await axios.post(apiUrl + '?mode=public', { message: q });
            expect(res.status).toBe(200);
            expect(res.data?.data?.message).toBeTruthy();
        }
    });
});
