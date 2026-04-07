import boldFontUrl from "@/assets/fonts/NotoSansKR-Bold.ttf?url";
import regularFontUrl from "@/assets/fonts/NotoSansKR-Regular.ttf?url";

// jsPDF 내부에서 사용할 폰트 패밀리명과 VFS 등록용 파일명입니다.
const PDF_FONT_FAMILY = "NotoSansKR";
const PDF_FONT_REGULAR_FILE = "NotoSansKR-Regular.ttf";
const PDF_FONT_BOLD_FILE = "NotoSansKR-Bold.ttf";

type PdfFontStyle = "normal" | "bold";

interface JsPdfFontLoader {
  addFileToVFS(filename: string, filecontent: string): void;
  addFont(
    postScriptName: string,
    id: string,
    fontStyle: PdfFontStyle,
    fontWeight?: number | string,
  ): void;
}

// 같은 폰트를 여러 번 불러오지 않도록 로딩 Promise를 캐시합니다.
const fontFileCache = new Map<string, Promise<string>>();

// jsPDF VFS 등록 형식에 맞게 ArrayBuffer를 binary string으로 변환합니다.
function arrayBufferToBinaryString(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let result = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    result += String.fromCharCode(...chunk);
  }

  return result;
}

// 번들된 폰트 파일을 한 번만 읽어와 재사용할 수 있게 감싼 로더입니다.
function loadFontFile(fontUrl: string) {
  const cached = fontFileCache.get(fontUrl);

  if (cached) {
    return cached;
  }

  const pending = fetch(fontUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load font: ${fontUrl}`);
      }

      return response.arrayBuffer();
    })
    .then(arrayBufferToBinaryString);

  fontFileCache.set(fontUrl, pending);

  return pending;
}

// PDF 생성 전에 일반/볼드 한글 폰트를 jsPDF 문서 인스턴스에 등록합니다.
export async function ensurePdfFonts(doc: JsPdfFontLoader) {
  const [regularFont, boldFont] = await Promise.all([
    loadFontFile(regularFontUrl),
    loadFontFile(boldFontUrl),
  ]);

  doc.addFileToVFS(PDF_FONT_REGULAR_FILE, regularFont);
  doc.addFont(PDF_FONT_REGULAR_FILE, PDF_FONT_FAMILY, "normal");

  doc.addFileToVFS(PDF_FONT_BOLD_FILE, boldFont);
  doc.addFont(PDF_FONT_BOLD_FILE, PDF_FONT_FAMILY, "bold");
}

// PDF 렌더링 코드에서 동일한 패밀리명을 재사용할 수 있도록 export합니다.
export const pdfFontFamily = PDF_FONT_FAMILY;
