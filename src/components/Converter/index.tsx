/**
 * Converter - 파일 변환 메인 컴포넌트
 * React Island (client:load)로 마운트
 */

import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { FileUploader } from './FileUploader';
import { ActionButton } from './ActionButton';
import { useConversion } from '../../hooks/useConversion';
import type { SelectedFileInfo } from './types';

export function Converter() {
  const [selectedFile, setSelectedFile] = useState<SelectedFileInfo | null>(
    null
  );
  const { state, startConversion, copyToClipboard, retry, reset } =
    useConversion();

  const handleFileSelect = useCallback((file: SelectedFileInfo) => {
    setSelectedFile(file);
  }, []);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    reset();
  }, [reset]);

  const handleActionClick = useCallback(() => {
    if (!selectedFile) return;

    switch (state.buttonState) {
      case 'idle':
        startConversion(selectedFile.file);
        break;
      case 'completed':
        copyToClipboard();
        break;
      case 'failed':
        retry(selectedFile.file);
        break;
      // copied 상태는 자동으로 completed로 복귀
    }
  }, [selectedFile, state.buttonState, startConversion, copyToClipboard, retry]);

  const isUploaderDisabled =
    state.buttonState === 'converting' ||
    state.buttonState === 'completed' ||
    state.buttonState === 'copied';

  return (
    <>
      {/* Toast 컨테이너 */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#191919',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '14px',
          },
        }}
      />

      <section
        id="convert"
        style={{
          margin: '64px auto',
          padding: '40px',
          border: '1px solid #e3e2de',
          borderRadius: '8px',
          background: '#ffffff',
          maxWidth: '720px',
        }}
      >
        {/* 타이틀 */}
        <h2
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: '22px',
            fontWeight: 400,
            textAlign: 'center',
            marginBottom: '4px',
          }}
        >
          파일 변환
        </h2>
        <p
          style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#999',
            marginBottom: '28px',
          }}
        >
          PDF를 업로드하면 Notion 호환 마크다운으로 변환합니다
        </p>

        {/* 파일 업로더 */}
        <FileUploader
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          disabled={isUploaderDisabled}
        />

        {/* 액션 버튼 */}
        <ActionButton
          state={state.buttonState}
          progress={state.progress}
          disabled={!selectedFile}
          onClick={handleActionClick}
        />
      </section>
    </>
  );
}

export default Converter;
