import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/MainLayout";

const Index = () => {
  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
};

export default Index;
