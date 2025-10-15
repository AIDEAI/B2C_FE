import React, { useEffect, useMemo, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const deriveBasePath = () => {
  const publicUrl = process.env.PUBLIC_URL;
  if (publicUrl && publicUrl.trim().length > 0) {
    return publicUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      return `/${segments[0]}`;
    }
  }
  return '';
};

const TinyMCEWithMathType = ({ value, onChange, placeholder = '' }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const basePath = deriveBasePath();
  const tinymceScriptSrc = `${basePath}/tinymce/tinymce.min.js`;
  const wirisPluginUrl = `${basePath}/wiris/plugin.min.js`;

  useEffect(() => {
    if (window.tinymce) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${tinymceScriptSrc}"]`);
    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        setScriptLoaded(true);
      } else {
        existingScript.addEventListener('load', () => {
          existingScript.dataset.loaded = 'true';
          setScriptLoaded(true);
        });
      }
      return;
    }

    const scriptTag = document.createElement('script');
    scriptTag.src = tinymceScriptSrc;
    scriptTag.referrerPolicy = 'origin';
    scriptTag.async = true;
    scriptTag.dataset.loaded = 'false';
    scriptTag.addEventListener('load', () => {
      scriptTag.dataset.loaded = 'true';
      setScriptLoaded(true);
    });
    scriptTag.addEventListener('error', () => {
      console.error('Failed to load TinyMCE script', tinymceScriptSrc);
    });
    document.body.appendChild(scriptTag);

    return () => {
      scriptTag.removeEventListener('load', () => {});
      scriptTag.removeEventListener('error', () => {});
    };
  }, [tinymceScriptSrc]);

  const initConfig = useMemo(() => ({
    height: 400,
    menubar: false,
    branding: false,
    plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount tiny_mce_wiris',
    toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | tiny_mce_wiris_formulaEditor tiny_mce_wiris_formulaEditorChemistry | code preview fullscreen',
    extended_valid_elements: '*[*]',
    draggable_modal: true,
    placeholder,
    license_key: 'gpl',
    external_plugins: {
      tiny_mce_wiris: wirisPluginUrl
    },
    base_url: `${basePath}/tinymce`,
    suffix: '.min'
  }), [basePath, wirisPluginUrl, placeholder]);

  const handleEditorChange = (content) => {
    if (onChange) {
      onChange(content);
    }
  };

  if (!scriptLoaded) {
    return <div>Loading editor...</div>;
  }

  return (
    <Editor
      tinymceScriptSrc={tinymceScriptSrc}
      value={value}
      init={initConfig}
      onEditorChange={handleEditorChange}
    />
  );
};

export default TinyMCEWithMathType;
