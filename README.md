# Vibe PDF Editor

一個現代化、安全、合規的 PDF 編輯器，基於 PDF.js 與 PDF-Lib，支援標準 PDF 編輯、壓縮、頁面管理，嚴格遵循 ISO 32000-1/2 規範。

---

## 功能特色

- 支援標準 PDF 內容（文字、向量圖、圖片、標準表單）
- 拖曳開啟 PDF，前端沙盒處理，保障隱私
- 頁面縮圖、拖曳排序、插入空白頁/圖片
- 文字標註、手寫繪圖、頁面旋轉、刪除
- PDF 壓縮（無損/光柵化）
- 主題切換、即時 toast 訊息、loading spinner
- 嚴格遵循 ISO 32000-1/2，完全不支援 XFA
- 匯出 PDF 自動移除非標準物件，安全合規

---

## 技術架構

- 前端：PDF.js（Apache 2.0）、PDF-Lib（MIT）
- UI：Tailwind CSS、Phosphor Icons、Inter 字體
- 無伺服器，所有操作皆在瀏覽器端完成

---

## 安全與合規

- 僅處理標準 PDF 結構，拒絕 XFA 與嵌入式腳本
- 匯出時自動檢查並移除非標準內容
- 所有檔案操作皆在本地端，無資料外洩風險

---

## 安裝與使用

1. 下載或 clone 本專案
2. 直接以瀏覽器開啟 `index.html`
3. 拖曳 PDF 檔案或點擊「開啟 PDF」開始編輯

---

## 開發者須知

- 嚴格遵循 ISO 32000-1/2，請勿嘗試支援 XFA
- 如需後端批次處理，可考慮 PDFium（Google Chrome 使用的引擎）
- 歡迎 issue/PR 提出建議與改進

---

## 授權

- PDF.js：Apache 2.0
- PDF-Lib：MIT
- 本專案：MIT

---

## 參考資料

- [ISO 32000-1/2 PDF 標準](https://www.iso.org/standard/51502.html)
- [PDF.js 官方文件](https://mozilla.github.io/pdf.js/)
- [PDF-Lib 官方文件](https://pdf-lib.js.org/)
- [PDFium](https://pdfium.googlesource.com/pdfium/)

---

## 預覽

![Vibe PDF Editor 預覽](./preview.png)

---

## 聯絡與貢獻

- 歡迎 issue/PR
- 作者：colinjen88
