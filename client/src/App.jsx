import Layout from "./Layout";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import MarketPlace from "./pages/MarketPlace";
import Login from "./pages/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AboutUs from "./pages/AboutUs";

function App() {
  const routes = [
    {
      path: "/",
      element: <Layout />,
      errorElement: <NotFound />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/marketplace",
          element: <MarketPlace />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/aboutus",
          element: <AboutUs />,
        },
      ],
    },
  ];

  const router = createBrowserRouter(routes);
  return (
    <div className="h-screen">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
