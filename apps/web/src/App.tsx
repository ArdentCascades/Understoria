/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
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
