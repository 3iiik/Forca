import { memo, useCallback } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

const ToggleSwitch = memo(function ToggleSwitch({ checked, onChange, id }: ToggleSwitchProps) {
  const handleClick = useCallback(() => {
    onChange(!checked);
  }, [checked, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(!checked);
    }
  }, [checked, onChange]);

  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`
        relative inline-flex items-center shrink-0 w-10 h-6 rounded-full
        transition-colors duration-200 ease-in-out outline-none
        focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
        ${checked ? 'bg-primary-600 hover:bg-primary-500' : 'bg-zinc-700 hover:bg-zinc-600'}
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow-sm
          transform transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-[19px]' : 'translate-x-[3px]'}
        `}
        style={{ width: '18px', height: '18px' }}
      />
    </button>
  );
});

export default ToggleSwitch;
