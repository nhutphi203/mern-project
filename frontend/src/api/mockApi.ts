// src/api/mockApi.ts

// --- ABOUT PAGE DATA ---
export const getAboutData = async () => {
    console.log("API: Fetching about data...");
    // Giả lập độ trễ mạng
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        title: "Giới thiệu về HealthCare Center",
        content: `
      <p class="mb-4">Chào mừng bạn đến với <strong>HealthCare Center</strong>, nơi chúng tôi đặt sức khỏe của bạn lên hàng đầu. Với đội ngũ y bác sĩ chuyên môn cao, giàu kinh nghiệm cùng hệ thống trang thiết bị y tế hiện đại, chúng tôi cam kết mang đến những dịch vụ chăm sóc sức khỏe toàn diện, chất lượng và đáng tin cậy.</p>
      <img src="/images/eugene-va-heathcare-center-01-1440x785.jpg" alt="Hình ảnh phòng khám" class="rounded-lg shadow-md my-6 w-full object-cover" />
      <h3 class="text-2xl font-bold mt-6 mb-3 text-emerald-700">Sứ mệnh của chúng tôi</h3>
      <p class="mb-4">Sứ mệnh của HealthCare Center là cung cấp dịch vụ y tế xuất sắc, dễ tiếp cận và giá cả hợp lý cho mọi người. Chúng tôi không ngừng nỗ lực cải tiến chất lượng dịch vụ, ứng dụng công nghệ tiên tiến và xây dựng một môi trường y tế thân thiện, an toàn và chuyên nghiệp.</p>
      <h3 class="text-2xl font-bold mt-6 mb-3 text-emerald-700">Giá trị cốt lõi</h3>
      <ul class="list-disc list-inside space-y-2">
        <li><strong>Tận tâm:</strong> Luôn đặt lợi ích và sức khỏe của bệnh nhân lên trên hết.</li>
        <li><strong>Chuyên nghiệp:</strong> Đội ngũ y bác sĩ được đào tạo bài bản, tuân thủ nghiêm ngặt các quy trình y khoa.</li>
        <li><strong>Đổi mới:</strong> Luôn cập nhật và áp dụng các phương pháp điều trị, công nghệ mới nhất.</li>
        <li><strong>Thấu cảm:</strong> Lắng nghe, chia sẻ và đồng hành cùng bệnh nhân trong suốt quá trình điều trị.</li>
      </ul>
    `
    };
};

// --- SERVICES PAGE DATA ---
export const getServicesData = async () => {
    console.log("API: Fetching services data...");
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
        { id: "svc001", name: "Khám tổng quát", description: "Kiểm tra sức khỏe toàn diện, phát hiện sớm các nguy cơ bệnh lý.", imageUrl: "/images/kham-tong-quat-1.jpg" },
        { id: "svc002", name: "Nha khoa thẩm mỹ", description: "Cải thiện nụ cười với các dịch vụ tẩy trắng, bọc răng sứ, niềng răng.", imageUrl: "/images/ranghammat.jpg" },
        { id: "svc003", name: "Khám chuyên khoa Mắt", description: "Chẩn đoán và điều trị các bệnh về mắt, đo thị lực, tư vấn kính thuốc.", imageUrl: "/images/khammat.jpg" },
        { id: "svc004", name: "Tư vấn dinh dưỡng", description: "Xây dựng chế độ ăn uống khoa học, phù hợp với thể trạng và bệnh lý.", imageUrl: "/images/dinhduong.jpg" },
        { id: "svc005", name: "Vật lý trị liệu", description: "Phục hồi chức năng vận động sau chấn thương hoặc do bệnh lý xương khớp.", imageUrl: "/images/vatlitrilieu.jpg" },
        { id: "svc006", name: "Xét nghiệm y khoa", description: "Cung cấp các dịch vụ xét nghiệm máu, nước tiểu... chính xác và nhanh chóng.", imageUrl: "/images/xetnghiem.jpg" },
    ];
};

// --- DOCTORS PAGE DATA ---
export const getDoctorsData = async () => {
    console.log("API: Fetching doctors data...");
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
        { id: "doc123", name: "BS. Nguyễn Văn An", specialty: "Nội tổng quát", avatarUrl: "https://placehold.co/400x400/a7f3d0/14532d?text=Dr.+An", availableDays: ["Thứ 2", "Thứ 4", "Thứ 6"] },
        { id: "doc124", name: "BS. Trần Thị Bình", specialty: "Nha khoa", avatarUrl: "https://placehold.co/400x400/a7f3d0/14532d?text=Dr.+Binh", availableDays: ["Thứ 3", "Thứ 5", "Thứ 7"] },
        { id: "doc125", name: "BS. Lê Minh Cường", specialty: "Chuyên khoa Mắt", avatarUrl: "https://placehold.co/400x400/a7f3d0/14532d?text=Dr.+Cuong", availableDays: ["Thứ 2", "Thứ 5"] },
        { id: "doc126", name: "BS. Phạm Thu Duyên", specialty: "Nội tổng quát", avatarUrl: "https://placehold.co/400x400/a7f3d0/14532d?text=Dr.+Duyen", availableDays: ["Thứ 3", "Thứ 6"] },
        { id: "doc127", name: "BS. Hoàng Văn Em", specialty: "Vật lý trị liệu", avatarUrl: "https://placehold.co/400x400/a7f3d0/14532d?text=Dr.+Em", availableDays: ["Thứ 4", "Thứ 7"] },
        { id: "doc128", name: "BS. Vũ Thị Giang", specialty: "Nha khoa", avatarUrl: "https://placehold.co/400x400/a7f3d0/14532d?text=Dr.+Giang", availableDays: ["Thứ 2", "Thứ 3", "Thứ 4"] },
    ];
};
