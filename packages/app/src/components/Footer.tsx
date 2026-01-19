import { FC } from 'react';

export const Footer: FC = () => (
  <footer className="footer footer-center border-base-300 border-t p-4">
    <p>© {new Date().getFullYear()} Simple Upload · GPL-3.0</p>
  </footer>
);
