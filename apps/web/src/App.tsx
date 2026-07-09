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
import CalendarPage from "@/pages/Calendar";
import OrganizerDeskPage from "@/pages/OrganizerDesk";
import InfrastructurePage from "@/pages/Infrastructure";
import PrintInvitePage from "@/pages/PrintInvite";
import PrintBoardPage from "@/pages/PrintBoard";
import PrintEventFlyerPage from "@/pages/PrintEventFlyer";
import PrintShiftRosterPage from "@/pages/PrintShiftRoster";
import { CalendarEventPanel } from "@/components/CalendarEventPanel";
import { BoardPostPanel } from "@/components/BoardPostPanel";
import DashboardPage from "@/pages/Dashboard";
import ProfilePage from "@/pages/Profile";
import SettingsPage from "@/pages/Settings";
import InvitesPage from "@/pages/Invites";
import PostFormPage from "@/pages/PostForm";
import InviteAcceptPage from "@/pages/InviteAccept";
import AddDevicePage from "@/pages/AddDevice";
import PairDevicePage from "@/pages/PairDevice";
import RecoverIdentityPage from "@/pages/RecoverIdentity";
import GrowRootPage from "@/pages/GrowRoot";
import ProjectNewPage from "@/pages/ProjectNew";
import ProjectDetailPage from "@/pages/ProjectDetail";
import TaskDetailPage from "@/pages/TaskDetail";
import ProjectArchivePage from "@/pages/ProjectArchive";
import MyTasksPage from "@/pages/MyTasks";
import MyProjectsPage from "@/pages/MyProjects";
import EventNewPage from "@/pages/EventNew";
import EventDetailPage from "@/pages/EventDetail";
import MessagesShell, { MessagesEmptyPane } from "@/pages/Messages";
import ConversationPage from "@/pages/Conversation";
import MemberDetailPage from "@/pages/MemberDetail";
import HelpPage from "@/pages/Help";
import DisputesPage from "@/pages/Disputes";
import ProposalsPage from "@/pages/Proposals";
import ProposalNewPage from "@/pages/ProposalNew";
import WelcomePage from "@/pages/Welcome";
import NotFoundPage from "@/pages/NotFound";
import { useApp } from "@/state/AppContext";

// Paths a brand-new device is allowed to reach without going through
// the welcome flow first. `/invite` matters because an invited member
// may land on the redemption screen before they've seen anything else.
const PRE_ONBOARDING_PATHS = new Set<string>([
  "/welcome",
  "/invite",
  "/pair-device",
]);

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { ready, onboarded } = useApp();
  const location = useLocation();
  if (!ready) return <>{children}</>;
  if (!onboarded && !PRE_ONBOARDING_PATHS.has(location.pathname)) {
    return <Navigate to="/welcome" replace />;
  }
  return <>{children}</>;
}

// Scroll container for the one route that renders OUTSIDE the Layout
// app shell. The document itself can never scroll (`overflow: clip`
// on html/body — the fix for iOS detaching bottom-anchored chrome),
// and Layout's <main> is the scroller everywhere else; a standalone
// route must bring its own or any step taller than the viewport is
// simply cut off (found live on the welcome flow's profile step on
// desktop). `relative` for the same reason <main> is relative:
// absolutely-positioned descendants (sr-only) must resolve their
// containing block inside the scroller, not the clipped document.
function StandaloneScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-dvh overflow-y-auto overscroll-contain">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <OnboardingGate>
      <Routes>
        <Route
          path="/welcome"
          element={
            <StandaloneScroll>
              <WelcomePage />
            </StandaloneScroll>
          }
        />
        <Route element={<Layout />}>
          <Route path="/" element={<BoardPage />}>
            {/* The docked post panel - the board stays mounted while
                the post renders beside it (full-screen below lg).
                This nests the CANONICAL post URL: /post/:id keeps
                working everywhere (links, shares, QR) and simply
                gains the board behind it. /post/new stays a separate
                static route below and outranks the :id param. */}
            <Route path="post/:id" element={<BoardPostPanel />} />
          </Route>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />}>
            {/* The docked event panel - calendar stays mounted while
                the event renders beside it (full-screen below lg).
                /events/:eventId below remains the canonical page. */}
            <Route
              path="event/:eventId"
              element={<CalendarEventPanel />}
            />
          </Route>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/desk" element={<OrganizerDeskPage />} />
          <Route path="/infrastructure" element={<InfrastructurePage />} />
          {/* Print surfaces (desktop-power-tools plan 5): normal
              routes in the normal shell; @media print hides the
              chrome, so what prints is just the sheet. */}
          <Route path="/print/invite" element={<PrintInvitePage />} />
          <Route path="/print/board" element={<PrintBoardPage />} />
          <Route
            path="/print/event/:eventId"
            element={<PrintEventFlyerPage />}
          />
          <Route
            path="/print/event/:eventId/roster"
            element={<PrintShiftRosterPage />}
          />
          <Route path="/invites" element={<InvitesPage />} />
          <Route path="/add-device" element={<AddDevicePage />} />
          <Route path="/post/new" element={<PostFormPage />} />
          <Route path="/project/new" element={<ProjectNewPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route
            path="/project/:id/task/:taskId"
            element={<TaskDetailPage />}
          />
          <Route path="/projects/archive" element={<ProjectArchivePage />} />
          <Route path="/my-tasks" element={<MyTasksPage />} />
          <Route path="/my-projects" element={<MyProjectsPage />} />
          <Route path="/events/new" element={<EventNewPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          {/* Phase 3.1: nested so at lg+ the conversation renders inside
              the MessagesShell's right pane via <Outlet />. Below lg the
              shell collapses to single-pane based on URL — see Messages.tsx */}
          <Route path="/messages" element={<MessagesShell />}>
            <Route index element={<MessagesEmptyPane />} />
            <Route path=":memberKey" element={<ConversationPage />} />
          </Route>
          <Route path="/member/:publicKey" element={<MemberDetailPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/proposals" element={<ProposalsPage />} />
          <Route path="/proposals/new" element={<ProposalNewPage />} />
          <Route path="/invite" element={<InviteAcceptPage />} />
          <Route path="/pair-device" element={<PairDevicePage />} />
          <Route path="/recover" element={<RecoverIdentityPage />} />
          <Route path="/grow-root" element={<GrowRootPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </OnboardingGate>
  );
}
