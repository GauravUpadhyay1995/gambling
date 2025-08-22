'use client';

import { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'summernote/dist/summernote-lite.css';
import 'summernote/dist/summernote-lite.js';

interface SummernoteEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  fullWidth?: boolean;
}

export default function SummernoteEditor({
  value,
  onChange,
  height = 500,
  fullWidth = false,
}: SummernoteEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const $editor = $(editorRef.current!);

    $editor.summernote({
      placeholder: 'Write description...',
      tabsize: 2,
      height,
      width: fullWidth ? '100%' : undefined,
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video']],
        ['view', ['fullscreen', 'codeview', 'help']],
      ],
      callbacks: {
        onChange: function (contents: string) {
          onChange(contents);
        },
      },
    });

    // Set initial value
    $editor.summernote('code', value);

    return () => {
      $editor.summernote('destroy');
    };
  }, []);

  // 💡 Inject dark mode styles
  const applyDarkMode = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: white)').matches;
    const iframe = document.querySelector('.note-editable') as HTMLElement;

    if (isDark && iframe) {
      iframe.style.backgroundColor = '#1f2937'; // Tailwind dark:bg-gray-800
      iframe.style.color = '#f3f4f6'; // Tailwind text-gray-100
    }
  };

  applyDarkMode();
  // Update editor content when `value` changes
  useEffect(() => {
    const $editor = $(editorRef.current!);
    if ($editor.summernote('isEmpty') && value) {
      $editor.summernote('code', value);
    }
  }, [value]);

  return <div ref={editorRef} className={fullWidth ? 'w-full' : ''} />;
}
