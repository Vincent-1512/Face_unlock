// src/app/page.tsx
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Tối ưu: Chỉ tải component FaceUnlockStream khi cần (ở client)
// và hiển thị "Đang tải Camera..." khi chờ
const FaceUnlockStream = dynamic(
  () => import('@/components/FaceUnlockStream'),
  { 
    ssr: false, // Không chạy ở Server Side
    loading: () => <h2>Đang tải Camera...</h2> 
  }
);

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockedUser, setUnlockedUser] = useState('');

  // Hàm này sẽ được gọi từ component FaceUnlockStream khi thành công
  const handleUnlock = (user: string) => {
    setIsUnlocked(true);
    setUnlockedUser(user);
  };

  return (
    <main style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Ứng Dụng Mở Khóa Khuôn Mặt</h1>

      {/* Logic hiển thị: */}
      {isUnlocked ? (
        // 2. Nếu đã mở khóa, hiển thị nội dung app
        <div style={{ marginTop: '50px' }}>
          <h2>✅ Mở Khóa Thành Công!</h2>
          <h3>Chào mừng trở lại, {unlockedUser}!</h3>
          <p>Đây là nội dung bí mật của ứng dụng.</p>
        </div>
      ) : (
        // 1. Nếu chưa mở khóa, hiển thị màn hình khóa
        <div>
          <p>Vui lòng xác thực bằng khuôn mặt để tiếp tục.</p>
          <FaceUnlockStream onUnlock={handleUnlock} />
        </div>
      )}
    </main>
  );
}