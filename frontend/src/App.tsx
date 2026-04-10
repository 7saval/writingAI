import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "@/App.css";
import { routeList } from "@/utils/routeList";
import Layout from "@/components/layout/Layout";
import Error from "@/components/common/Error";
import { useAuthUserQuery as useAuthQuery } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import ShowAlert from "@/components/common/alert/ShowAlert";
import ShowConfirm from "@/components/common/alert/ShowConfirm";

const router = createBrowserRouter(
  routeList.map((item) => {
    return {
      ...item,
      // export route는 앱 chrome 없이 인쇄 전용 문서만 보여야 해서 Layout을 건너뜁니다.
      element:
        item.useLayout === false ? item.element : <Layout>{item.element}</Layout>,
      errorElement: <Error />,
    };
  }),
);

function App() {
  // 사용자 인증 상태 확인
  useAuthQuery();

  return (
    <>
      <RouterProvider router={router} />
      <ShowAlert />
      <ShowConfirm />
      <Toaster />
    </>
  );
}

export default App;
