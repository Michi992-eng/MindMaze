import type { Metadata, Viewport } from 'next';
import MindMazeSite from '@/components/mindmaze/MindMazeSite';

export const metadata: Metadata = {
  title: { absolute: 'MindMaze' },
  description:
    'MindMaze teaches children to think through hands-on puzzles: traditional Mongolian wooden puzzles, logic grids and strategy games that reward patience.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d1324',
};

export default function Page() {
  return <MindMazeSite />;
}
