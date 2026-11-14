import { Coming } from '@/components/coming';

export default function Jobs() {
  return (
    <Coming
      label="Jobs"
      headline={'Work from people you *trust.*'}
      line="Roles and briefs from inside the alumni network."
      points={['Any member can post a job', 'Marc approves each one before it goes live', 'Every job carries a "Marc says" line', 'Interested? Marc makes the introduction']}
    />
  );
}
