const isElectron = () => {
  return typeof window !== 'undefined' && window.electron !== undefined;
};

export const exportDocument = async (format: string, content: string) => {
  if (isElectron()) {
    return await window.electron!.exportFile(format, content);
  } else {
    // 웹 브라우저 환경에서의 다운로드 처리 (예시: Blob 이용)
    console.log('웹 환경: 브라우저 기본 다운로드 로직 실행');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true };
  }
};

export const showWinNotification = (title: string, body: string) => {
  if (isElectron()) {
    window.electron!.showNotification(title, body);
  } else {
    console.log('웹 환경 알림:', title, body);
  }
};
