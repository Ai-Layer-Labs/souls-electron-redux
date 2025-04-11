import React, { useEffect, useRef, useState } from 'react';
import { CanvasContentData } from './CanvasStore';

interface TerminalComponentProps {
  data: CanvasContentData;
}

const TerminalComponent: React.FC<TerminalComponentProps> = ({ data }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const promptText = data.terminalOptions?.prompt || '$ ';

  // Handle initial text
  useEffect(() => {
    if (data.terminalOptions?.initialText) {
      setTerminalOutput(data.terminalOptions.initialText.split('\n'));
    } else {
      setTerminalOutput(['Welcome to the Terminal Emulator', 'Type "help" for a list of available commands']);
    }
  }, [data.terminalOptions?.initialText]);

  // Define command outputs
  const getCommandOutput = (cmd: string, args: string[]): string[] => {
    // Check for custom commands first
    if (data.terminalOptions?.customCommands?.[cmd.toLowerCase()]) {
      return data.terminalOptions.customCommands[cmd.toLowerCase()](args).split('\n');
    }

    // Default commands
    switch (cmd.toLowerCase()) {
      case 'help':
        const customCommands = data.terminalOptions?.customCommands
          ? Object.keys(data.terminalOptions.customCommands).map(cmd =>
            `  ${cmd.padEnd(8)} - Custom command`
          )
          : [];

        return [
          'Available commands:',
          '  help     - Show this help message',
          '  clear    - Clear the terminal screen',
          '  echo     - Echo the arguments',
          '  date     - Show current date and time',
          '  whoami   - Show current user',
          '  ls       - List files (simulated)',
          '  pwd      - Print working directory (simulated)',
          ...(customCommands.length > 0 ? ['', 'Custom commands:', ...customCommands] : []),
        ];
      case 'clear':
        return ['__CLEAR__']; // Special marker to clear terminal
      case 'echo':
        return [args.join(' ')];
      case 'date':
        return [new Date().toLocaleString()];
      case 'whoami':
        return ['guest@terminal'];
      case 'ls':
        return [
          'Documents/',
          'Downloads/',
          'Pictures/',
          'README.md',
          'package.json',
        ];
      case 'pwd':
        return ['/home/guest'];
      default:
        return [`Command not found: ${cmd}. Type "help" for available commands.`];
    }
  };

  const handleCommand = (command: string) => {
    if (!command.trim()) return;

    // Add command to history
    const newHistory = [...commandHistory, command];
    setCommandHistory(newHistory);

    // Process command
    const [cmd, ...args] = command.split(' ');
    const output = getCommandOutput(cmd, args);

    if (output[0] === '__CLEAR__') {
      setTerminalOutput([]);
    } else {
      setTerminalOutput(prev => [
        ...prev,
        `${promptText}${command}`,
        ...output
      ]);
    }

    setCurrentCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
    }
  };

  return (
    <div className="w-full h-full p-4 bg-[rgba(var(--color-bg-surface-1),var(--tw-bg-opacity))]">
      <div className="font-mono p-4 rounded-lg shadow-md h-full overflow-auto border border-[rgba(var(--color-border),var(--tw-border-opacity))] dark:bg-[#1a1a1a] text-gray-200 bg-[#f5f5f5] text-gray-800">
        <div className="mb-4">
          {terminalOutput.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">{line}</div>
          ))}
        </div>
        <div className="flex items-center">
          <span className={'dark:text-green-400 text-green-600'}>{promptText}</span>
          <input
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent border-none outline-none focus:ring-0 dark:text-gray-200 text-gray-800`}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalComponent;