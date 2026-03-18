# Vibe PDF Editor

現代化、安全、可離線使用的 PDF 編輯器。基於 Vite + React + TypeScript + Zustand，支援 PWA 安裝。

---

## 功能特色

- **PDF 檢視**：縮放、翻頁、頁面縮圖側欄
- **頁面管理**：插入空白頁/圖片頁、刪除、複製、分割、合併、拖曳排序、旋轉
- **手繪標記**：自由繪圖、橡皮擦、顏色/筆寬調整
- **文字標註**：點擊插入可移動、可編輯的文字標籤，hover 刪除
- **表單欄位**：自動偵測 PDF 表單欄位並顯示可填寫的輸入框
- **PDF 匯出**：將標註與繪圖嵌入 PDF 後下載
- **PDF 壓縮**：無損（Object Streams）/ 光柵化（JPEG）兩種模式
- **格式轉換**：匯出為圖片（PNG/JPEG）、Word（.docx）
- **批次操作**：同時對多頁進行匯出、壓縮、刪除、合併
- **復原/重做**：Ctrl+Z / Ctrl+Y
- **安全掃描**：開啟時自動偵測 XFA、嵌入式腳本、多媒體
- **主題**：深色 UI，支援 Indigo/Rose/Emerald/Amber 主題色
- **多語系**：繁體中文 / English
- **PWA**：可安裝至桌面，完整離線使用
- **響應式**：桌面/平板/手機自適應版面

---

## 使用方式

### 線上版（部署後）
用 Chrome / Edge 開啟網址 → 網址列右側出現「安裝」圖示 → 點擊後即安裝為桌面 App，可完全離線使用。

### 本地開發
```bash
npm install
npm run dev      # 開發伺服器 http://localhost:5173
npm run build    # 生產建構 → dist/
npm run preview  # 預覽 dist/
```

---

## 技術架構

| 類別 | 技術 |
|------|------|
| 建構 | Vite 6 |
| 框架 | React 18 + TypeScript |
| 狀態 | Zustand 5 |
| CSS | Tailwind CSS v3（本地，離線可用） |
| PDF 渲染 | pdfjs-dist v4 |
| PDF 編輯 | pdf-lib v1.17.1 |
| 圖示 | @phosphor-icons/react |
| 字體 | @fontsource/inter（離線） |
| 多語系 | react-i18next |
| PWA | vite-plugin-pwa + Workbox |

所有操作皆在瀏覽器端完成，無伺服器，PDF 檔案不會上傳至任何地方。

---

## 專案結構

```
src/
├── App.tsx / main.tsx
├── services/          # 純邏輯層
│   ├── pdfLoader.ts   # 載入 + 安全掃描 + 表單偵測
│   ├── pdfRenderer.ts # PDF.js canvas 渲染
│   ├── pdfPageOps.ts  # 頁面操作
│   ├── pdfExporter.ts # 嵌入標註/繪圖後匯出
│   ├── pdfCompressor.ts
│   ├── imageExporter.ts / wordExporter.ts
│   └── fileSystem.ts  # File API（含 Tauri stub）
├── stores/            # usePdfStore, useEditorStore, useHistoryStore, useUiStore
├── components/
│   ├── editor/        # PdfViewer, DrawingLayer, TextLayer, FormFieldLayer
│   ├── layout/        # AppHeader, LeftToolbar, RightSidebar, Footer, MobileToolbar
│   ├── modals/        # Compress, Batch, Convert, Settings
│   ├── pages/         # PageItem, PageList（縮圖+拖放）
│   ├── toolbars/      # DrawToolbar, AnnotationToolbar
│   └── ui/            # Toast, Spinner, Modal, Button, IconButton
├── i18n/              # zh-TW.json + en.json
└── utils/
public/
├── icon.svg           # PWA icon 來源
├── pwa-*.png          # 由 icon.svg 生成
└── favicon.ico
```

---

## 安全與合規

- 僅處理標準 PDF 結構（ISO 32000-1/2），拒絕 XFA 動態表單與嵌入式腳本
- 開啟檔案時自動掃描並警告非標準內容
- 所有操作皆在本地端，無資料外洩風險

---

## 授權

- pdfjs-dist：Apache 2.0
- pdf-lib：MIT
- 本專案：MIT
