/**
 * RichTextEditor.tsx — Tiptap 富文本編輯器封裝
 *
 * 支援工具列：B / S / I / 無序清單 / 有序清單 / 對齊（左/中/右/兩端）
 * 外框風格與 DropdownSelect / SearchField 統一（浮動 label + 1px border）
 */
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect } from 'react';

// ── 工具列 Icon SVG（Lucide 同款線條風格）────────────────────────────────────

function IconBold() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function IconStrikethrough() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 6H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H7" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  );
}

function IconItalic() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function IconListUnordered() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconListOrdered() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" /><path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

function IconAlignLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  );
}

function IconAlignCenter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function IconAlignRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" />
      <line x1="6" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconAlignJustify() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// ── 工具列按鈕元件 ────────────────────────────────────────────────────────────
interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // 防止 editor 失去 focus
        onClick();
      }}
      title={title}
      className={`
        flex items-center justify-center w-[28px] h-[28px] rounded-[6px] transition-colors shrink-0
        ${active
          ? 'bg-[#1c252e] text-white'
          : 'text-[#637381] hover:bg-[rgba(145,158,171,0.12)] hover:text-[#1c252e]'
        }
      `}
    >
      {children}
    </button>
  );
}

// ── 分隔線 ────────────────────────────────────────────────────────────────────
function ToolbarSep() {
  return <div className="w-[1px] h-[20px] bg-[rgba(145,158,171,0.24)] shrink-0 mx-[2px]" />;
}

// ── 主元件 ────────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  label: string;
  value: string;          // HTML string
  onChange: (html: string) => void;
  error?: boolean;
  minHeight?: number;     // 編輯區最低高度（px），預設 180
}

export function RichTextEditor({
  label,
  value,
  onChange,
  error = false,
  minHeight = 180,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // 外部 value 變更時同步（例如 Reset 時）
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const borderColor = error ? '#ff5630' : 'rgba(145,158,171,0.2)';
  const labelColor  = error ? '#ff5630' : '#637381';

  return (
    <div className="relative w-full flex flex-col">
      {/* 外框 border overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[8px] border border-solid z-0"
        style={{ borderColor }}
      />

      {/* 浮動 label */}
      <div className="absolute flex items-center left-[14px] px-[2px] top-[-5px] z-10">
        <div className="absolute bg-white h-[2px] left-0 right-0 top-[5px]" />
        <p style={{ fontSize: '12px', fontWeight: 600, color: labelColor, position: 'relative' }}>
          {label}
        </p>
      </div>

      {/* 工具列 */}
      <div className="flex items-center gap-[2px] px-[10px] pt-[14px] pb-[8px] shrink-0 border-b border-[rgba(145,158,171,0.12)]">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive('bold')}
          title="粗體 (Bold)"
        >
          <IconBold />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive('strike')}
          title="刪除線 (Strikethrough)"
        >
          <IconStrikethrough />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive('italic')}
          title="斜體 (Italic)"
        >
          <IconItalic />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive('bulletList')}
          title="無序清單"
        >
          <IconListUnordered />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive('orderedList')}
          title="有序清單"
        >
          <IconListOrdered />
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
          active={editor?.isActive({ textAlign: 'left' })}
          title="靠左對齊"
        >
          <IconAlignLeft />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
          active={editor?.isActive({ textAlign: 'center' })}
          title="置中對齊"
        >
          <IconAlignCenter />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
          active={editor?.isActive({ textAlign: 'right' })}
          title="靠右對齊"
        >
          <IconAlignRight />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
          active={editor?.isActive({ textAlign: 'justify' })}
          title="兩端對齊"
        >
          <IconAlignJustify />
        </ToolbarButton>
      </div>

      {/* 編輯區 */}
      <EditorContent
        editor={editor}
        className="rte-content px-[14px] py-[12px] outline-none"
        style={{ minHeight }}
      />

      {/* 全域樣式（Tiptap prose）*/}
      <style>{`
        .rte-content .ProseMirror {
          outline: none;
          min-height: ${minHeight}px;
          font-family: 'Public Sans', 'Noto Sans JP', sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: #1c252e;
        }
        .rte-content .ProseMirror p { margin: 0 0 8px 0; }
        .rte-content .ProseMirror p:last-child { margin-bottom: 0; }
        .rte-content .ProseMirror strong { font-weight: 700; }
        .rte-content .ProseMirror em { font-style: italic; }
        .rte-content .ProseMirror s { text-decoration: line-through; }
        .rte-content .ProseMirror ul { list-style: disc; padding-left: 20px; margin: 0 0 8px 0; }
        .rte-content .ProseMirror ol { list-style: decimal; padding-left: 20px; margin: 0 0 8px 0; }
        .rte-content .ProseMirror li { margin-bottom: 4px; }
        .rte-content .ProseMirror p.is-editor-empty:first-child::before {
          color: #919eab;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
