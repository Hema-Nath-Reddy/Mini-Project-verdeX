import Layout from "./Layout";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import MarketPlace from "./pages/MarketPlace";
import Login from "./pages/Login";
import AboutUs from "./pages/AboutUs";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
        {
          path: "/account",
          element: <Account />,
        },
        {
          path: "/admin",
          element: <Admin />,
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
