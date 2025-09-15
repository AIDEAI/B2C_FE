import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import axios from 'axios';
import * as pdfjs from 'pdfjs-dist';

import { Document, Page} from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js';



const DocumentItem = ({ document, index, moveDocument, removeDocument }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [pdfThumbnail, setPdfThumbnail] = useState(null);



  const [{ isDragging }, drag] = useDrag({
    type: 'DOCUMENT',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'DOCUMENT',
    hover: (item, monitor) => {
      if (item.index !== index) {
        moveDocument(item.index, index);
        item.index = index;
      }
    },
  });
  useEffect(() => {
    if (document.type === 'pdf' && document.file) {
      const generatePdfThumbnail = async () => {
        try {
          setIsLoading(true);
          
          // Convert file to ArrayBuffer
          const arrayBuffer = await document.file.arrayBuffer();
          
          // Load the PDF document
          const loadingTask = pdfjs.getDocument(arrayBuffer);
          const pdf = await loadingTask.promise;
          
          // Get the first page
          const page = await pdf.getPage(1);
          
          // Set the scale for the thumbnail
          const viewport = page.getViewport({ scale: 0.5 });
          
          // Create a canvas element
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // Render the PDF page to the canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          await page.render(renderContext).promise;
          
          // Convert canvas to data URL
          const thumbnailUrl = canvas.toDataURL('image/png');
          setPdfThumbnail(thumbnailUrl);
          setNumPages(pdf.numPages);
          setIsLoading(false);
          setLoadError(false);
        } catch (error) {
          console.error('Error generating PDF thumbnail:', error);
          setIsLoading(false);
          setLoadError(true);
        }
      };
      
      generatePdfThumbnail();
    }
  }, [document]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setLoadError(false);

  };
  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setIsLoading(false);
    setLoadError(true);
  };

  const nextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className={`relative w-[150px] h-[180px] rounded overflow-hidden shadow-md bg-gray-50 transition-transform ${isDragging ? 'opacity-50 scale-95' : ''}`}
    >
      <div className="w-full h-full flex flex-col relative">
        {document.type === 'pdf' ? (
            <>
            <div className="w-full h-[150px] flex justify-center items-center relative bg-gray-100">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full w-full p-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-2"></div>
                  <span className="text-xs text-gray-500">Loading PDF...</span>
                </div>
              ) : loadError ? (
                <div className="flex flex-col items-center justify-center h-full w-full p-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 384 512" 
                    className="w-16 h-16 text-red-500 mb-2"
                    fill="currentColor"
                  >
                    <path d="M181.9 256.1c-5-16-4.9-46.9-2-46.9 8.4 0 7.6 36.9 2 46.9zm-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7 18.3-7 39-17.2 62.9-21.9-12.7-9.6-24.9-23.4-34.5-40.8zM86.1 428.1c0 .8 13.2-5.4 34.9-40.2-6.7 6.3-29.1 24.5-34.9 40.2zM248 160h136v328c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V24C0 10.7 10.7 0 24 0h200v136c0 13.2 10.8 24 24 24zm-8 171.8c-20-12.2-33.3-29-42.7-53.8 4.5-18.5 11.6-46.6 6.2-64.2-4.7-29.4-42.4-26.5-47.8-6.8-5 18.3-.4 44.1 8.1 77-11.6 27.6-28.7 64.6-40.8 85.8-.1 0-.1.1-.2.1-27.1 13.9-73.6 44.5-54.5 68 5.6 6.9 16 10 21.5 10 17.9 0 35.7-18 61.1-61.8 25.8-8.5 54.1-19.1 79-23.2 21.7 11.8 47.1 19.5 64 19.5 29.2 0 31.2-32 19.7-43.4-13.9-13.6-54.3-9.7-73.6-7.2zM377 105L279 7c-4.5-4.5-10.6-7-17-7h-6v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-74.1 255.3c4.1-2.7-2.5-11.9-42.8-9 37.1 15.8 42.8 9 42.8 9z"/>
                  </svg>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {document.file.name.length > 15 
                      ? document.file.name.substring(0, 15) + '...' 
                      : document.file.name}
                  </span>
                </div>
              ) : pdfThumbnail ? (
                <img 
                  src={pdfThumbnail} 
                  alt="PDF thumbnail" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full w-full p-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 384 512" 
                    className="w-16 h-16 text-red-500 mb-2"
                    fill="currentColor"
                  >
                    <path d="M181.9 256.1c-5-16-4.9-46.9-2-46.9 8.4 0 7.6 36.9 2 46.9zm-1.7 47.2c-7.7 20.2-17.3 43.3-28.4 62.7 18.3-7 39-17.2 62.9-21.9-12.7-9.6-24.9-23.4-34.5-40.8zM86.1 428.1c0 .8 13.2-5.4 34.9-40.2-6.7 6.3-29.1 24.5-34.9 40.2zM248 160h136v328c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V24C0 10.7 10.7 0 24 0h200v136c0 13.2 10.8 24 24 24zm-8 171.8c-20-12.2-33.3-29-42.7-53.8 4.5-18.5 11.6-46.6 6.2-64.2-4.7-29.4-42.4-26.5-47.8-6.8-5 18.3-.4 44.1 8.1 77-11.6 27.6-28.7 64.6-40.8 85.8-.1 0-.1.1-.2.1-27.1 13.9-73.6 44.5-54.5 68 5.6 6.9 16 10 21.5 10 17.9 0 35.7-18 61.1-61.8 25.8-8.5 54.1-19.1 79-23.2 21.7 11.8 47.1 19.5 64 19.5 29.2 0 31.2-32 19.7-43.4-13.9-13.6-54.3-9.7-73.6-7.2zM377 105L279 7c-4.5-4.5-10.6-7-17-7h-6v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-74.1 255.3c4.1-2.7-2.5-11.9-42.8-9 37.1 15.8 42.8 9 42.8 9z"/>
                  </svg>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {document.file.name.length > 15 
                      ? document.file.name.substring(0, 15) + '...' 
                      : document.file.name}
                  </span>
                </div>
              )}
            </div>
            <div className="p-1 text-center text-xs text-gray-600 bg-white border-t border-gray-200 flex-grow flex items-center justify-center">
              PDF
            </div>
          </>
        ) : (
          <img src={document.preview} alt={`Upload ${index + 1}`} className="w-full h-[150px] object-cover" />
        )}
        <button 
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black bg-opacity-50 text-white border-none text-lg flex items-center justify-center transition-colors hover:bg-red-600 hover:bg-opacity-70 z-10"
          onClick={() => removeDocument(index)}
          aria-label="Remove document"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const DocumentGalleryModal = ({ isOpen, onClose, onUpload,setDocuments,documents,isUploading }) => {
  console.log('DocumentGalleryModal rendered with props:', { isOpen, documents: documents?.length, isUploading });
  

  // Close modal with escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    // Validate file types
    // const validFiles = files.filter(file => 
    //   file.type.startsWith('image/') || file.type === 'application/pdf'
    // );
    
    // if (validFiles.length !== files.length) {
    //   toast.error('Only image and PDF files are allowed');
    // }
    
    const newDocuments = files?.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      type: file.type.startsWith('image/') ? 'image' : 'pdf'
    }));
    
    setDocuments(prev => [...prev, ...newDocuments]);
    
    // Reset file input
    e.target.value = '';
  }, []);

  const moveDocument = useCallback((fromIndex, toIndex) => {
    setDocuments(prevDocuments => {
      const result = [...prevDocuments];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  }, []);

  const removeDocument = useCallback((index) => {
    setDocuments(prevDocuments => {
      const newDocuments = [...prevDocuments];
      // Revoke the object URL to avoid memory leaks
      if (newDocuments[index].preview) {
        URL.revokeObjectURL(newDocuments[index].preview);
      }
      newDocuments.splice(index, 1);
      return newDocuments;
    });
  }, []);



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-lg w-[90%] max-w-[800px] max-h-[90vh] flex flex-col shadow-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 m-0">Upload Documents</h2>
          <button className="bg-transparent border-none text-2xl text-gray-500 hover:text-gray-800 cursor-pointer transition-colors" onClick={onClose}>×</button>
        </div>
        
        <DndProvider backend={HTML5Backend}>
          <div className="p-5 overflow-y-auto flex-1">
            <div className="mb-2">
              <label className="inline-block cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="inline-block bg-blue-500 text-white py-2 px-4 rounded font-medium hover:bg-blue-600 transition-colors">
                  Add Images & PDFs
                </span>
              </label>
              <p className="mt-2 text-sm text-gray-600">Supported formats: JPG, PNG, GIF, PDF, DOCX, DOC</p>
            </div>
            
            {documents.length > 0 && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Drag items to reorder. </p>
                  {/* <p className="text-sm text-gray-600">You can upload up to 10 files at a time. </p */}

                </div>
                
                <div className="flex flex-wrap gap-4 mb-5">
                  {documents.map((doc, index) => (
                    <DocumentItem
                      key={index}
                      document={doc}
                      index={index}
                      moveDocument={moveDocument}
                      removeDocument={removeDocument}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </DndProvider>
        
        <div className="flex justify-end p-4 border-t border-gray-200 gap-3">
          <button 
            className="bg-gray-100 text-gray-800 border border-gray-300 py-2 px-4 rounded font-medium hover:bg-gray-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          <button 
            className="bg-blue-500 text-white py-2 px-4 rounded font-medium  transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={onUpload}
            disabled={isUploading || documents.length === 0}
          >
            {isUploading ? 'Uploading...' : 'Upload Documents'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentGalleryModal;