// src/components/FaceUnlockStream.tsx
'use client'; // Đánh dấu đây là Client Component
import { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// Đảm bảo URL này trỏ đến Backend FastAPI của bạn
const WEBSOCKET_URL = 'ws://localhost:8000/ws/unlock';

// Props (để component cha biết khi nào mở khóa)
interface FaceUnlockStreamProps {
  onUnlock: (user: string) => void;
}

export default function FaceUnlockStream({ onUnlock }: FaceUnlockStreamProps) {
  const webcamRef = useRef<Webcam>(null);
  const [message, setMessage] = useState('Đang kết nối đến server...');

  const { sendMessage, lastMessage, readyState } = useWebSocket(WEBSOCKET_URL, {
    onOpen: () => setMessage('Kết nối thành công! Đưa khuôn mặt vào...'),
    onClose: () => setMessage('Mất kết nối server.'),
    onError: (err) => setMessage('Lỗi kết nối WebSocket!'),
    shouldReconnect: (closeEvent) => true, // Tự động kết nối lại
  });

// 1. Gửi frame ảnh liên tục đến Backend
  useEffect(() => {
    const interval = setInterval(() => {
      // Chỉ gửi khi kết nối đã mở và có webcam
      if (readyState === ReadyState.OPEN && webcamRef.current) {

        // Lấy Data URI. Thuộc tính format và quality đã được định nghĩa trong thẻ Webcam bên dưới
        const imageSrc: string | null = webcamRef.current.getScreenshot(); 

        // Gửi chuỗi Data URI nếu nó không rỗng
        if (imageSrc) {
          // Gửi Data URI (ví dụ: data:image/jpeg;base64,....)
          sendMessage(imageSrc); 
        }
      }
    }, 200); // Gửi 5 frame/giây (200ms)

    return () => clearInterval(interval); // Dọn dẹp khi component unmount
  }, [readyState, sendMessage]);

  // 2. Nhận kết quả trả về từ Backend
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);

        if (data.status === 'unlocked') {
          setMessage(`Chào mừng, ${data.user}!`);
          onUnlock(data.user); // Báo cho component cha biết đã mở khóa
        } else {
          setMessage('Không nhận ra bạn...');
        }
      } catch (e) {
        console.error("Lỗi parse JSON:", e);
      }
    }
  }, [lastMessage, onUnlock]);

  // Giao diện
  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        width={640}
        height={480}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.7}
        videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
        style={{ borderRadius: '8px', border: '2px solid #333' }}
      />
      <h2>{message}</h2>
    </div>
  );
}