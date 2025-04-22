import React, { useState } from 'react';
import { ArrowDownCircleIcon, ExclamationTriangleIcon, XMarkIcon, CommandLineIcon } from '@heroicons/react/24/outline';

const BulkCloner = ({ repos, darkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const MAX_REPOS = 100;

  const generateBatchFile = () => {
    const chunks = [];
    const totalRepos = Math.min(repos.length, MAX_REPOS);
    
    for (let i = 0; i < totalRepos; i += batchSize) {
      const chunk = repos.slice(i, i + batchSize);
      chunks.push(chunk);
    }

    const batchCommands = [
      '@echo off',
      'echo GitHub Bulk Repository Cloner',
      'echo ============================',
      'echo Total repositories to clone: ' + totalRepos,
      'echo.',
      'where git >nul 2>nul',
      'if %errorlevel% neq 0 (',
      '  echo Error: Git is not installed or not in PATH',
      '  pause',
      '  exit /b 1',
      ')',
      'setlocal EnableDelayedExpansion',
      'set count=0',
      '',
      ...chunks.map((chunk, index) => [
        'echo Batch ' + (index + 1) + ' of ' + chunks.length,
        ...chunk.map(repo => [
          'set /a count+=1',
          'echo !count!/' + totalRepos + ': Cloning ' + repo.name,
          `if exist "${repo.name}" (`,
          `  echo Skipping ${repo.name} - directory already exists`,
          ') else (',
          `  git clone ${repo.clone_url}`,
          '  if !errorlevel! neq 0 (',
          `    echo Failed to clone ${repo.name}`,
          '    pause',
          '    exit /b 1',
          '  )',
          ')',
          'timeout /t 2 /nobreak > nul'
        ]).flat()
      ]).flat(),
      'echo.',
      'echo Cloning complete!',
      'pause'
    ].join('\r\n');

    const blob = new Blob([batchCommands], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clone-repositories.bat';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateShellScript = () => {
    const chunks = [];
    const totalRepos = Math.min(repos.length, MAX_REPOS);
    
    for (let i = 0; i < totalRepos; i += batchSize) {
      const chunk = repos.slice(i, i + batchSize);
      chunks.push(chunk);
    }

    const shellCommands = [
      '#!/bin/bash',
      'set -e',  // Exit on error
      '',
      '# Check if git is installed',
      'if ! command -v git &> /dev/null; then',
      '    echo "Error: Git is not installed"',
      '    exit 1',
      'fi',
      '',
      'echo "GitHub Bulk Repository Cloner"',
      'echo "============================"',
      'echo "Total repositories to clone: ' + totalRepos + '"',
      'echo',
      'count=0',
      '',
      ...chunks.map((chunk, index) => [
        'echo "Batch ' + (index + 1) + ' of ' + chunks.length + '"',
        ...chunk.map(repo => [
          '((count++))',
          'echo "$count/' + totalRepos + ': Cloning ' + repo.name + '"',
          `if [ -d "${repo.name}" ]; then`,
          `  echo "Skipping ${repo.name} - directory already exists"`,
          'else',
          `  if ! git clone ${repo.clone_url}; then`,
          `    echo "Failed to clone ${repo.name}"`,
          '    exit 1',
          '  fi',
          'fi',
          'sleep 2'
        ]).flat()
      ]).flat(),
      'echo',
      'echo "Cloning complete!"',
      'read -p "Press enter to continue..."'
    ].join('\n');

    const blob = new Blob([shellCommands], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clone-repositories.sh';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 w-full text-sm text-gray-700 dark:text-gray-200`}
        disabled={repos.length === 0}
      >
        
        <span>Clone ({repos.length})</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[400px] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Clone {Math.min(repos.length, MAX_REPOS)} Repositories
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {repos.length > MAX_REPOS && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/50 rounded text-sm text-yellow-800 dark:text-yellow-200">
                  <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Limited to {MAX_REPOS} repositories per batch</span>
                </div>
              )}

              {/* Batch Size Selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Repos per batch:
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="flex-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* Download Options */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={generateBatchFile}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 
                    text-white text-sm rounded-md transition-colors"
                >
                  <ArrowDownCircleIcon className="w-4 h-4" />
                  Windows (.bat)
                </button>
                <button
                  onClick={generateShellScript}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 
                    text-white text-sm rounded-md transition-colors"
                >
                  <ArrowDownCircleIcon className="w-4 h-4" />
                  Unix (.sh)
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 text-xs space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">Quick Guide:</p>
                <ol className="list-decimal ml-4 text-gray-600 dark:text-gray-400">
                  <li>Download script for your OS</li>
                  <li>Create a new folder for repos</li>
                  <li>Move script to folder</li>
                  <li>Run script to start cloning</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex text-xs text-gray-500 dark:text-gray-400 items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>Recommended: 5-10 repos per batch to avoid rate limiting</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkCloner;