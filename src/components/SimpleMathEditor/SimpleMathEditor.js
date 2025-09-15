import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import 'mathlive';
import './SimpleMathEditor.css';
import { suppressResizeObserverErrors } from '../../utils/errorSuppression';

// Apply error suppression when component loads
suppressResizeObserverErrors();

const SimpleMathEditor = ({ 
  value = '', 
  onChange, 
  placeholder = "Type your answer here... Switch to Math mode for equations.",
  rows = 4,
  className = "",
  readOnly = false
}) => {
  const mathfieldRef = useRef(null);
  const textareaRef = useRef(null);
  const helpSectionRef = useRef(null);
  const helpIconRef = useRef(null);
  const [mode, setMode] = useState('text'); // 'text' or 'math'
  const [textValue, setTextValue] = useState(value || '');
  const [showSymbolPanel, setShowSymbolPanel] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpPosition, setHelpPosition] = useState({ top: 0, left: 0 });
  const isTypingRef = useRef(false);
  const timeoutRef = useRef(null);

  // Update textValue when value prop changes, but only if we're not actively typing
  useEffect(() => {
    if (!isTypingRef.current) {
      setTextValue(value || '');
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calculate popup position and close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpSectionRef.current && !helpSectionRef.current.contains(event.target)) {
        setShowHelp(false);
      }
    };

    const updateHelpPosition = () => {
      if (helpIconRef.current && showHelp) {
        const rect = helpIconRef.current.getBoundingClientRect();
        setHelpPosition({
          top: rect.bottom + 8,
          left: rect.right - 320 // Assuming popup width is 320px
        });
      }
    };

    if (showHelp) {
      updateHelpPosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', updateHelpPosition);
      window.addEventListener('resize', updateHelpPosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updateHelpPosition);
      window.removeEventListener('resize', updateHelpPosition);
    };
  }, [showHelp]);

  // Initialize MathLive field when switching to math mode
  useEffect(() => {
    if (mathfieldRef.current && mode === 'math') {
      const mf = mathfieldRef.current;
      
      // Configure MathLive options to prevent ResizeObserver issues
      try {
        mf.setOptions({
          virtualKeyboardMode: 'off', // Completely disable virtual keyboard
          virtualKeyboards: 'none', // No virtual keyboards
          virtualKeyboardLayout: 'none', // No layout
          virtualKeyboardToggle: 'none', // Hide toggle button
          smartFence: true,
          smartSuperscript: true,
          removeExtraneousParentheses: true,
        });
      } catch (error) {
        console.warn('MathLive options setting failed:', error);
      }
      
      // Set initial value
      if (textValue) {
        try {
          mf.value = textValue;
        } catch (error) {
          console.warn('Setting initial value failed:', error);
        }
      }

      // Listen for input changes
      const handleInput = () => {
        try {
          const latex = mf.value;
          
          // Set typing flag to prevent external updates
          isTypingRef.current = true;
          
          // Update local state immediately for instant UI response
          setTextValue(latex);
          
          // Call onChange to update parent state
          if (onChange) {
            onChange({ target: { value: latex } });
          }
          
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Reset typing flag after a short delay
          timeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
          }, 150);
        } catch (error) {
          console.warn('Input handling failed:', error);
        }
      };

      mf.addEventListener('input', handleInput);

      // Focus the field
      setTimeout(() => {
        try {
          mf.focus();
        } catch (error) {
          console.warn('Focus failed:', error);
        }
      }, 100);

      // Cleanup
      return () => {
        if (mf) {
          mf.removeEventListener('input', handleInput);
        }
      };
    }
  }, [mode, textValue, onChange]);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    
    // Set typing flag to prevent external updates
    isTypingRef.current = true;
    
    // Update local state immediately for instant UI response
    setTextValue(newValue);
    
    // Call onChange to update parent state
    if (onChange) {
      onChange({ target: { value: newValue } });
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Reset typing flag after a short delay
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 150);
  };

  const switchToMathMode = () => {
    setMode('math');
  };

  const switchToTextMode = () => {
    setMode('text');
    // Focus text area when switching to text mode
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const insertMathSymbol = (latex) => {
    if (mathfieldRef.current && mode === 'math') {
      try {
        mathfieldRef.current.insert(latex);
        mathfieldRef.current.focus();
      } catch (error) {
        console.warn('Insert symbol failed:', error);
      }
    }
  };

  // Extended math symbols organized by category
  const symbolCategories = {
    basic: [
      { latex: '\\frac{#@}{#?}', name: 'Fraction', display: '½' },
      { latex: '#@^{#?}', name: 'Power', display: 'x²' },
      { latex: '#@_{#?}', name: 'Subscript', display: 'x₁' },
      { latex: '\\sqrt{#@}', name: 'Square Root', display: '√' },
      { latex: '\\sqrt[#@]{#?}', name: 'Nth Root', display: '∛' },
      { latex: '\\pm', name: 'Plus/Minus', display: '±' },
      { latex: '\\times', name: 'Times', display: '×' },
      { latex: '\\div', name: 'Division', display: '÷' },
    ],
    calculus: [
      { latex: '\\int_{#@}^{#?}', name: 'Integral', display: '∫' },
      { latex: '\\sum_{#@}^{#?}', name: 'Sum', display: '∑' },
      { latex: '\\prod_{#@}^{#?}', name: 'Product', display: '∏' },
      { latex: '\\lim_{#@}', name: 'Limit', display: 'lim' },
      { latex: '\\frac{d}{dx}', name: 'Derivative', display: 'd/dx' },
      { latex: '\\frac{\\partial}{\\partial x}', name: 'Partial', display: '∂/∂x' },
    ],
    greek: [
      { latex: '\\pi', name: 'Pi', display: 'π' },
      { latex: '\\alpha', name: 'Alpha', display: 'α' },
      { latex: '\\beta', name: 'Beta', display: 'β' },
      { latex: '\\gamma', name: 'Gamma', display: 'γ' },
      { latex: '\\delta', name: 'Delta', display: 'δ' },
      { latex: '\\epsilon', name: 'Epsilon', display: 'ε' },
      { latex: '\\theta', name: 'Theta', display: 'θ' },
      { latex: '\\lambda', name: 'Lambda', display: 'λ' },
      { latex: '\\mu', name: 'Mu', display: 'μ' },
      { latex: '\\sigma', name: 'Sigma', display: 'σ' },
      { latex: '\\phi', name: 'Phi', display: 'φ' },
      { latex: '\\omega', name: 'Omega', display: 'ω' },
    ],
    relations: [
      { latex: '\\leq', name: 'Less Equal', display: '≤' },
      { latex: '\\geq', name: 'Greater Equal', display: '≥' },
      { latex: '\\neq', name: 'Not Equal', display: '≠' },
      { latex: '\\approx', name: 'Approximately', display: '≈' },
      { latex: '\\propto', name: 'Proportional', display: '∝' },
      { latex: '\\in', name: 'Element of', display: '∈' },
      { latex: '\\subset', name: 'Subset', display: '⊂' },
      { latex: '\\infty', name: 'Infinity', display: '∞' },
    ],
    functions: [
      { latex: '\\sin(#@)', name: 'Sine', display: 'sin' },
      { latex: '\\cos(#@)', name: 'Cosine', display: 'cos' },
      { latex: '\\tan(#@)', name: 'Tangent', display: 'tan' },
      { latex: '\\log(#@)', name: 'Log', display: 'log' },
      { latex: '\\ln(#@)', name: 'Natural Log', display: 'ln' },
      { latex: '\\exp(#@)', name: 'Exponential', display: 'exp' },
    ]
  };

  return (
    <div className={`simple-math-editor-container ${className}`}>
      {/* Mode Toggle */}
      <div className="editor-toolbar">
        <div className="mode-buttons">
          <button
            type="button"
            onClick={switchToTextMode}
            className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
            title="Text Mode - For regular text and simple answers"
          >
            📝 Text
          </button>
          <button
            type="button"
            onClick={switchToMathMode}
            className={`mode-btn ${mode === 'math' ? 'active' : ''}`}
            title="Math Mode - For mathematical expressions and equations"
          >
            🔢 Math
          </button>
        </div>
        {mode === 'math' && (
          <div className="math-controls mr-8 ">
            <button
              type="button"
              onClick={() => setShowSymbolPanel(!showSymbolPanel)}
              className={`symbol-panel-btn ${showSymbolPanel ? 'active' : ''}`}
              title="Toggle Symbol Panel"
            >
              ⌨️ Symbols
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      {mode === 'text' ? (
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly}
          className="text-editor"
        />
      ) : (
        <div className="math-editor-section">
          {/* Math Input Field */}
          <math-field
            ref={mathfieldRef}
            className="math-field"
            style={{
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px',
              minHeight: `${rows * 25}px`,
              width: '100%',
              fontFamily: 'inherit',
              display: 'block'
            }}
          />

          {/* Advanced Symbol Panel */}
          {showSymbolPanel && (
            <div className="advanced-symbol-panel">
              <div className="symbol-panel-header">
                <button
                  type="button"
                  onClick={() => setShowSymbolPanel(false)}
                  className="close-panel-btn"
                  title="Close Panel"
                >
                  ×
                </button>
              </div>
              
              <div className="symbol-categories">
                {Object.entries(symbolCategories).map(([category, symbols]) => (
                  <div key={category} className="symbol-category">
                    <h4 className="category-title">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h4>
                    <div className="symbols-grid">
                      {symbols.map((symbol, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => insertMathSymbol(symbol.latex)}
                          className="symbol-btn"
                          title={symbol.name}
                        >
                          {symbol.display}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Icon */}
      <div className="help-section" ref={helpSectionRef}>
        <button
          ref={helpIconRef}
          type="button"
          className={`help-icon ${showHelp ? 'active' : ''}`}
          onClick={() => setShowHelp(!showHelp)}
          title="Click for help"
        >
          💡
        </button>
      </div>
      
      {/* Help Text Popup - Rendered as Portal */}
      {showHelp && createPortal(
        <div 
          className="help-popup-portal"
          style={{
            position: 'fixed',
            top: helpPosition.top,
            left: helpPosition.left,
            zIndex: 999999
          }}
        >
          <div className="help-popup-content-portal">
            {/* Arrow pointing up to the icon */}
            <div className="help-arrow-up"></div>
            
            {mode === 'text' ? (
              <div>
                <h4>Text Mode Help</h4>
                <p>• Type normal text and numbers</p>
                <p>• Switch to Math mode for equations</p>
                <p>• Examples: (-3, 7), 35, 145</p>
              </div>
            ) : (
              <div>
                <h4>Math Mode Help</h4>
                <p>• Type LaTeX directly: \frac&#123;1&#125;&#123;2&#125;, x^2, \sqrt&#123;x&#125;</p>
                <p>• Click "⌨️ Symbols" for quick access</p>
                <p>• Use categories: Basic, Calculus, Greek, etc.</p>
                <p>• Examples: ∫, ∑, π, α, ≤, ≥</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="help-close-btn"
            >
              ×
            </button>
          </div>
        </div>,
        document.body
      )}
     
    </div>
  );
};

export default SimpleMathEditor;