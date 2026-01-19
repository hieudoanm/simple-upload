import { Theme, useTheme } from '@simple-upload/hooks/use-theme';
import Link from 'next/link';

export const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar border-base-300 border-b px-8">
      <div className="flex-1">
        <span className="text-xl font-bold">📦 Simple Upload</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="https://hieudoanm.github.io/simple-upload/#/"
          target="_blank"
          className="btn btn-ghost">
          📖 Docs
        </Link>

        <Link
          href="https://github.com/hieudoanm/simple-upload/"
          target="_blank"
          className="btn btn-ghost">
          💻 GitHub
        </Link>

        <button type="button" className="btn btn-ghost" onClick={toggleTheme}>
          {theme === Theme.DARK ? '☀️ Light' : '🌗 Dark'}
        </button>
      </div>
    </nav>
  );
};
