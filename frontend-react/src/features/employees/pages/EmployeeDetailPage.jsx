import { useParams } from 'react-router-dom';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Employee #{id}</h1>
      <div className="rounded border p-4 bg-white">Employee details go here.</div>
    </div>
  );
}


