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

  // isTyping이 true로 바뀌면 타이핑 애니메이션 실행
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

  // isTyping이 false일 때 targetContent가 바뀌면 즉시 반영
  useEffect(() => {
    if (!isTyping) {
      setDisplayedContent(targetContent);
    }
  }, [isTyping, targetContent]);

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
