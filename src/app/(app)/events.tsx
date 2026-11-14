import { Coming } from '@/components/coming';

export default function Events() {
  return (
    <Coming
      label="Events"
      headline={'See you *there.*'}
      line="Everything worth turning up for, in one place."
      points={['Reunions, talks and portfolio days', 'Say you are coming in one tap', 'See which classmates are going', 'A reminder on the day']}
    />
  );
}
