export function playSound() {
  try {
    const audio = new Audio("/sounds/message-notification.mp3");
    audio.volume = 1.0;
    audio.currentTime = 0; // Reset về đầu
    audio.play().catch((error) => {
      console.log("Lỗi khi phát âm thanh", error);
      return;
    });
  } catch (error) {
    console.log("Lỗi khi phát âm thanh", error);
    return;
  }
}
