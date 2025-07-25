import { useState } from "react";
import Layout from "./Layout";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import MarketPlace from "./pages/MarketPlace";
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
