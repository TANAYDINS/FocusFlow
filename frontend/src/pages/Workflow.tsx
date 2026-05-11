import WorkflowTable from '../components/dashboard/WorkflowTable';

const Workflow = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-anthracite">İş Akışı ve Dağılımı</h1>
        <p className="text-anthracite/60 text-sm">Tüm ekibin görevlerini ve planlanmış akışını buradan takip edin.</p>
      </div>
      <WorkflowTable />
    </div>
  );
};

export default Workflow;
