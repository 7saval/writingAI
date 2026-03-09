import { useEffect, useState } from "react";

/**
 * 타이핑 애니메이션을 관리하는 공용 훅
 *
 * @param initialContent - 초기에 화면에 표시될 텍스트 (애니메이션 없이 바로 렌더링)
 * @param initialIsTyping - 마운트 시점부터 타이핑 애니메이션을 시작할지 여부
 * @param speed - 글자당 타이핑 속도 (ms), 기본값 30
 */
export const useTypingAnimation = (
  initialContent: string,
  initialIsTyping: boolean = false,
  speed: number = 30,
) => {
  // 실제로 화면에 표시되는 내용 (애니메이션 진행 중에는 부분 문자열)
  const [displayedContent, setDisplayedContent] = useState(
    initialIsTyping ? "" : initialContent,
  );
  // 타이핑 애니메이션 진행 여부
  const [isTyping, setIsTyping] = useState(initialIsTyping);
  // 애니메이션의 대상이 되는 전체 텍스트
  const [targetContent, setTargetContent] = useState(initialContent);

  // 렌더링 단계에서 프로프 동기화 (Render-phase state update)
  // 외부(부모)에서 initialContent가 변경되면 내부 상태를 즉시 동기화합니다.
  const [prevInitialContent, setPrevInitialContent] = useState(initialContent);
  if (initialContent !== prevInitialContent) {
    setPrevInitialContent(initialContent);
    setTargetContent(initialContent);
    // 타이핑 중이 아닐 때만 화면 내용을 즉시 업데이트
    if (!isTyping) {
      setDisplayedContent(initialContent);
    }
  }

  // 타이핑 애니메이션 실행 (애니메이션이 시작될 때만 동작)
  useEffect(() => {
    if (!isTyping || !targetContent) return;

    let i = 0;
    setDisplayedContent("");

    const interval = setInterval(() => {
      setDisplayedContent(targetContent.slice(0, i + 1));
      i++;
      if (i >= targetContent.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isTyping, targetContent, speed]);

  /**
   * 새로운 텍스트로 타이핑 애니메이션을 시작합니다.
   * @param newContent - 타이핑 애니메이션으로 표시할 새 텍스트
   */
  const playTyping = (newContent: string) => {
    setTargetContent(newContent);
    setIsTyping(true);
  };

  return {
    displayedContent, // 현재 화면에 표시할 내용
    isTyping, // 타이핑 진행 중 여부 (커서 표시 등에 활용)
    playTyping, // 새 내용으로 타이핑 애니메이션 시작
  };
};
