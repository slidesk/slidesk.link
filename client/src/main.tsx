import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/App";
import { Providers } from "@/app/providers";
import "@/styles/globals.css";

// biome-ignore lint/style/noNonNullAssertion: #root always exists in index.html
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </React.StrictMode>,
);
