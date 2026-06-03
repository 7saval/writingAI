import * as Sentry from "@sentry/react";
import {
  RouterProvider,
  createBrowserRouter,
  createHashRouter,
} from "react-router-dom";
import "@/App.css";
import { routeList } from "@/utils/routeList";
import Layout from "@/components/layout/Layout";
import ErrorPage from "@/components/common/Error";
import { useAuthUserQuery as useAuthQuery } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import ShowAlert from "@/components/common/alert/ShowAlert";
import ShowConfirm from "@/components/common/alert/ShowConfirm";
import UpdateBanner from "@/components/common/UpdateBanner";

const routerConfig = routeList.map((item) => {
  return {
    ...item,
    // export route는 chrome UI 없이 인쇄 전용 문서만 보여줘야 해서 Layout을 거치지 않는다.
    element:
      item.useLayout === false ? item.element : <Layout>{item.element}</Layout>,
    errorElement: <ErrorPage />,
  };
});

// Electron은 file:// 진입이 기본이라 경로 기반 라우팅보다 hash route가 더 안정적이다.
// 이렇게 하면 hidden export window도 처음부터 index.html#/export/pdf로 진입할 수 있다.
const router = window.electron
  ? createHashRouter(routerConfig)
  : createBrowserRouter(routerConfig);

function App() {
  // 사용자 인증 상태 확인
  useAuthQuery();

  return (
    <>
      <Sentry.ErrorBoundary fallback={<ErrorPage />}>
        <RouterProvider router={router} />
        <ShowAlert />
        <ShowConfirm />
        <Toaster />
        <UpdateBanner />
      </Sentry.ErrorBoundary>
    </>
  );
}

export default App;
