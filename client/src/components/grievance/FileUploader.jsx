import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

export const FileUploader = ({
  files = [],
  onChange,
  maxFiles = 4,
  maxSizeMB = 5,
  className = '',
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndAddFiles = (newFileList) => {
    setErrorMessage('');
    const validFiles = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    if (files.length + newFileList.length > maxFiles) {
      setErrorMessage(`You can upload a maximum of ${maxFiles} images.`);
      return;
    }

    for (const file of Array.from(newFileList)) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage(`"${file.name}" is not a supported image format (JPEG, PNG, WebP only).`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the ${maxSizeMB}MB file limit.`);
        return;
      }
      validFiles.push(file);
    }

    onChange([...files, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
    // Reset file input value so re-selecting same file triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    setErrorMessage('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drag & Drop Area */}
      {files.length < maxFiles && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all duration-200 text-center ${
            dragActive
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 bg-slate-50/60 dark:bg-slate-900/40'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            Click or drag & drop photographic evidence here
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            JPEG, PNG, or WebP &bull; Up to {maxFiles} images (Max {maxSizeMB}MB each)
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <p className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}

      {/* Uploaded File Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {files.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);

            return (
              <div
                key={idx}
                className="relative group rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 p-1.5 shadow-sm"
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-rose-600 text-white rounded-md transition-colors"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="pt-1.5 px-1">
                  <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
