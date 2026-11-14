import { Coming } from '@/components/coming';

export default function Classes() {
  return (
    <Coming
      dark
      label="Classes"
      headline={'Every class. *Yours.*'}
      line="The SCA class library, for alumni only."
      points={['Around 100 classes to start', 'Search by mentor or subject', 'Pick up where you left off', 'New classes as they are recorded']}
    />
  );
}
