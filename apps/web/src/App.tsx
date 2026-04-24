import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import BoardPage from "@/pages/Board";
import DashboardPage from "@/pages/Dashboard";
import ProfilePage from "@/pages/Profile";
import PostFormPage from "@/pages/PostForm";
import PostDetailPage from "@/pages/PostDetail";
import InviteAcceptPage from "@/pages/InviteAccept";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BoardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/post/new" element={<PostFormPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/invite" element={<InviteAcceptPage />} />
        <Route path="*" element={<BoardPage />} />
      </Route>
    </Routes>
  );
}
