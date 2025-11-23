import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="w-full h-[calc(100vh-8rem)] -m-6">
        <iframe
          src="https://lookerstudio.google.com/embed/reporting/2ef6b11e-02d0-4d7d-b705-9811a0a9dc4c/page/B4UgF"
          className="w-full h-full border-0"
          title="Operations Dashboard"
          allowFullScreen
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

