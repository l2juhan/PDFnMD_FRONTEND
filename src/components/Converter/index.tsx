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
        className="my-16 p-10 border border-gray-300 rounded-lg bg-white
                   max-w-[720px] mx-auto max-sm:p-6 max-sm:my-12"
      >
        {/* 타이틀 */}
        <h2 className="font-serif text-[22px] font-normal text-center mb-1">
          파일 변환
        </h2>
        <p className="text-center text-sm text-gray-500 mb-7">
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
