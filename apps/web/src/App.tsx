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
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import BoardPage from "@/pages/Board";
import DashboardPage from "@/pages/Dashboard";
import ProfilePage from "@/pages/Profile";
import PostFormPage from "@/pages/PostForm";
import PostDetailPage from "@/pages/PostDetail";
import InviteAcceptPage from "@/pages/InviteAccept";
import ProjectNewPage from "@/pages/ProjectNew";
import ProjectDetailPage from "@/pages/ProjectDetail";
import ProjectArchivePage from "@/pages/ProjectArchive";
import MessagesPage from "@/pages/Messages";
import ConversationPage from "@/pages/Conversation";
import MemberDetailPage from "@/pages/MemberDetail";
import HelpPage from "@/pages/Help";
import DisputesPage from "@/pages/Disputes";
import ProposalsPage from "@/pages/Proposals";
import ProposalNewPage from "@/pages/ProposalNew";
import WelcomePage from "@/pages/Welcome";
import { useApp } from "@/state/AppContext";

// Paths a brand-new device is allowed to reach without going through
// the welcome flow first. `/invite` matters because an invited member
// may land on the redemption screen before they've seen anything else.
const PRE_ONBOARDING_PATHS = new Set<string>(["/welcome", "/invite"]);

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { ready, onboarded } = useApp();
  const location = useLocation();
  if (!ready) return <>{children}</>;
  if (!onboarded && !PRE_ONBOARDING_PATHS.has(location.pathname)) {
    return <Navigate to="/welcome" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <OnboardingGate>
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route element={<Layout />}>
          <Route index element={<BoardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/post/new" element={<PostFormPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/project/new" element={<ProjectNewPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/archive" element={<ProjectArchivePage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:memberKey" element={<ConversationPage />} />
          <Route path="/member/:publicKey" element={<MemberDetailPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/proposals" element={<ProposalsPage />} />
          <Route path="/proposals/new" element={<ProposalNewPage />} />
          <Route path="/invite" element={<InviteAcceptPage />} />
          <Route path="*" element={<BoardPage />} />
        </Route>
      </Routes>
    </OnboardingGate>
  );
}
