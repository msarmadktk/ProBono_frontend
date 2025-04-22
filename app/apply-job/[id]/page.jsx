'use client';

import { useParams } from 'next/navigation';

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id;

  return (
    <div>
      <h1>Apply Job Page</h1>
      <p>Job ID: {id}</p>
    </div>
  );
}
