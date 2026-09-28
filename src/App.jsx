import React, { useState, useRef } from 'react';
import Header from './components/Header';
import LandingScreen from './components/LandingScreen';
import UploadScreen from './components/UploadScreen';
import DataPreviewScreen from './components/DataPreviewScreen';
import DashboardScreen from './components/DashboardScreen';
import Footer from './components/Footer';
import { parseSpreadsheetFile } from './utils/fileParser';

export default function App() {
  const [currentStep, setCurrentStep] = useState('landing'); // 'landing' | 'upload' | 'preview' | 'dashboard'
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingError, setParsingError] = useState(null);
  const [parseStatusText, setParseStatusText] = useState('Reading file…');
  const [lastUploadedFile, setLastUploadedFile] = useState(null);

  // Sequence token ref to prevent race conditions when multiple files are uploaded rapidly
  const uploadSeqRef = useRef(0);
  
  // Enter workspace from landing screen
  const handleEnterWorkspace = () => {
    setCurrentStep('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDataset = (dataset) => {
    setParsingError(null);
    setSelectedDataset(dataset);
    setCurrentStep('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCustomFileUpload = async (file) => {
    if (!file) return;

    // Increment upload sequence counter for race condition protection
    const currentSeqToken = uploadSeqRef.current + 1;
    uploadSeqRef.current = currentSeqToken;

    setLastUploadedFile(file);
    setIsParsing(true);
    setParsingError(null);
    setParseStatusText('Reading file…');

    try {
      // Micro-step 1: Reading file
      if (uploadSeqRef.current !== currentSeqToken) return;
      setParseStatusText('Reading file…');

      // Micro-step 2: Parsing data
      setParseStatusText('Parsing data…');
      const parsedDataset = await parseSpreadsheetFile(file);

      if (uploadSeqRef.current !== currentSeqToken) return;

      // Micro-step 3: Analyzing columns
      setParseStatusText('Analyzing columns…');

      // Update state with valid parsed dataset
      if (uploadSeqRef.current === currentSeqToken) {
        setSelectedDataset(parsedDataset);
        setCurrentStep('preview');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      if (uploadSeqRef.current === currentSeqToken) {
        setParsingError(err.message || 'An unexpected error occurred while parsing the file.');
        // Remain on upload screen, preserving existing dataset in state
      }
    } finally {
      if (uploadSeqRef.current === currentSeqToken) {
        setIsParsing(false);
        setParseStatusText('Reading file…');
      }
    }
  };

  const handleRetryLastFile = () => {
    if (lastUploadedFile) {
      handleCustomFileUpload(lastUploadedFile);
    }
  };

  const handleSelectWorksheet = async (sheetName) => {
    if (!selectedDataset?.rawFile) return;
    setIsParsing(true);
    setParsingError(null);

    try {
      const parsedDataset = await parseSpreadsheetFile(selectedDataset.rawFile, {
        selectedSheet: sheetName,
        headerRowIndex: selectedDataset.headerRowIndex || 1
      });
      setSelectedDataset(parsedDataset);
    } catch (err) {
      // If selected worksheet is empty or invalid, update selectedSheet and record error while preserving sheetNames for user selection
      setSelectedDataset(prev => ({
        ...prev,
        selectedSheet: sheetName,
        error: err.message || `Worksheet "${sheetName}" could not be parsed.`,
        rowCount: 0,
        columnCount: 0,
        columns: [],
        previewRows: []
      }));
    } finally {
      setIsParsing(false);
    }
  };

  const handleSelectHeaderRow = async (headerRowIndex) => {
    if (!selectedDataset?.rawFile) return;
    setIsParsing(true);
    setParsingError(null);

    try {
      const parsedDataset = await parseSpreadsheetFile(selectedDataset.rawFile, {
        selectedSheet: selectedDataset.selectedSheet,
        headerRowIndex: headerRowIndex
      });
      setSelectedDataset(parsedDataset);
    } catch (err) {
      // If chosen header row is empty or invalid, display error notice while keeping user on Data Preview
      setSelectedDataset(prev => ({
        ...prev,
        headerRowIndex: headerRowIndex,
        error: err.message || `Header row ${headerRowIndex} is empty or invalid.`,
        rowCount: 0,
        columnCount: 0,
        columns: [],
        previewRows: []
      }));
    } finally {
      setIsParsing(false);
    }
  };

  const handleContinueToDashboard = () => {
    if (isParsing) return;
    if (selectedDataset?.isCustomFile && (!selectedDataset?.isParsed || selectedDataset?.error)) {
      return;
    }
    setCurrentStep('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (isParsing) return;
    setSelectedDataset(null);
    setParsingError(null);
    setCurrentStep('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-app-pattern text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header 
        currentStep={currentStep} 
        setCurrentStep={(step) => !isParsing && setCurrentStep(step)}
        selectedDataset={selectedDataset}
        onReset={handleReset}
        isParsing={isParsing}
      />

      <main className="flex-1">
        {currentStep === 'landing' && (
          <LandingScreen onEnterWorkspace={handleEnterWorkspace} />
        )}

        {currentStep === 'upload' && (
          <UploadScreen 
            onSelectDataset={handleSelectDataset}
            onCustomFileUpload={handleCustomFileUpload}
            isParsing={isParsing}
            parseStatusText={parseStatusText}
            parsingError={parsingError}
            lastUploadedFile={lastUploadedFile}
            onRetry={handleRetryLastFile}
            clearError={() => setParsingError(null)}
          />
        )}

        {currentStep === 'preview' && selectedDataset && (
          <DataPreviewScreen
            dataset={selectedDataset}
            onContinue={handleContinueToDashboard}
            onBack={handleReset}
            onSelectWorksheet={handleSelectWorksheet}
            onSelectHeaderRow={handleSelectHeaderRow}
          />
        )}

        {currentStep === 'dashboard' && (
          <DashboardScreen
            dataset={selectedDataset}
            onChangeDataset={(newDataset) => setSelectedDataset(newDataset)}
            onBackToPreview={() => setCurrentStep('preview')}
            onSelectWorksheet={handleSelectWorksheet}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
