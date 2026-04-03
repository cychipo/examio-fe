import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/landing/HomePage";
import AboutPage from "@/pages/landing/AboutPage";
import ContactPage from "@/pages/landing/ContactPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import KRootRedirect from "@/pages/k/KRootRedirect";
import DashboardStudentPage from "@/pages/k/DashboardStudentPage";
import DashboardTeacherPage from "@/pages/k/DashboardTeacherPage";
import ProfilePage from "@/pages/k/ProfilePage";
import VerifyPage from "@/pages/k/VerifyPage";
import SubscriptionPage from "@/pages/k/SubscriptionPage";
import MyMaterialsPage from "@/pages/k/MyMaterialsPage";
import FlashcardsPage from "@/pages/k/FlashcardsPage";
import HistoryPage from "@/pages/k/HistoryPage";
import AITeacherPage from "@/pages/k/AITeacherPage";
import ExamHistoryPage from "@/pages/k/ExamHistoryPage";
import PDFHistoryPage from "@/pages/k/PDFHistoryPage";
import FlashcardStudyPage from "@/pages/study-flashcard/FlashcardStudyPage";
import ExamSessionPage from "@/pages/exam-session/ExamSessionPage";
import ExamQuizPage from "@/pages/exam-session/ExamQuizPage";
import ManageExamPage from "@/pages/k/ManageExamPage";
import ManageQuizSetDetailPage from "@/pages/k/ManageQuizSetDetailPage";
import ManageFlashcardSetDetailPage from "@/pages/k/ManageFlashcardSetDetailPage";
import AIToolPage from "@/pages/k/AIToolPage";
import ManageExamRoomPage from "@/pages/k/ManageExamRoomPage";
import ManageExamRoomDetailPage from "@/pages/k/ManageExamRoomDetailPage";
import ExamRoomSessionAnalyticsPage from "@/pages/k/ExamRoomSessionAnalyticsPage";
import MyExamsPage from "@/pages/k/MyExamsPage";
import { PublicLayout } from "@/routes/layouts/PublicLayout";
import { AuthLayout } from "@/routes/layouts/AuthLayout";
import { KLayout } from "@/routes/layouts/KLayout";
import { PublicRoute } from "@/routes/guards/PublicRoute";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center p-4 text-center">
    <div>
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">Không tìm thấy trang.</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicLayout>
        <HomePage />
      </PublicLayout>
    ),
  },
  {
    path: "/about",
    element: (
      <PublicLayout>
        <AboutPage />
      </PublicLayout>
    ),
  },
  {
    path: "/contact",
    element: (
      <PublicLayout>
        <ContactPage />
      </PublicLayout>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <AuthLayout>
          <RegisterPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicRoute>
        <AuthLayout>
          <ForgotPasswordPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <PublicRoute>
        <AuthLayout>
          <ResetPasswordPage />
        </AuthLayout>
      </PublicRoute>
    ),
  },
  {
    path: "/k",
    element: (
      <ProtectedRoute>
        <KLayout>
          <KRootRedirect />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/dashboard-student",
    element: (
      <ProtectedRoute>
        <KLayout>
          <DashboardStudentPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/dashboard-teacher",
    element: (
      <ProtectedRoute>
        <KLayout>
          <DashboardTeacherPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/profile",
    element: (
      <ProtectedRoute>
        <KLayout>
          <ProfilePage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/verify",
    element: (
      <ProtectedRoute>
        <KLayout>
          <VerifyPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/subscription",
    element: (
      <ProtectedRoute>
        <KLayout>
          <SubscriptionPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/my-materials",
    element: (
      <ProtectedRoute>
        <KLayout>
          <MyMaterialsPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/flash-card",
    element: (
      <ProtectedRoute>
        <KLayout>
          <FlashcardsPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/history",
    element: (
      <ProtectedRoute>
        <KLayout>
          <HistoryPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/ai-teacher",
    element: (
      <ProtectedRoute>
        <KLayout>
          <AITeacherPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/history/exam",
    element: (
      <ProtectedRoute>
        <KLayout>
          <ExamHistoryPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/history/pdf",
    element: (
      <ProtectedRoute>
        <KLayout>
          <PDFHistoryPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/study-flashcard/:id",
    element: <FlashcardStudyPage />,
  },
  {
    path: "/exam-session/:id",
    element: <ExamSessionPage />,
  },
  {
    path: "/exam-session/:id/quiz",
    element: <ExamQuizPage />,
  },
  {
    path: "/k/manage-exam",
    element: (
      <ProtectedRoute>
        <KLayout>
          <ManageExamPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/manage-quiz-set/:id",
    element: (
      <ProtectedRoute>
        <KLayout>
          <ManageQuizSetDetailPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/manage-flashcard-set/:id",
    element: (
      <ProtectedRoute>
        <KLayout>
          <ManageFlashcardSetDetailPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/ai-tool",
    element: (
      <ProtectedRoute>
        <KLayout>
          <AIToolPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/manage-exam-room",
    element: (
      <ProtectedRoute>
        <KLayout>
          <ManageExamRoomPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/manage-exam-room/:id",
    element: (
      <ProtectedRoute>
        <KLayout>
          <ManageExamRoomDetailPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/manage-exam-room/:id/session/:sessionId",
    element: (
      <ProtectedRoute>
        <KLayout>
          <ExamRoomSessionAnalyticsPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/k/my-exams",
    element: (
      <ProtectedRoute>
        <KLayout>
          <MyExamsPage />
        </KLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
