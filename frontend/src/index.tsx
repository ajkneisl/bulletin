import { createRoot } from "react-dom/client"
import "tailwindcss/tailwind.css"
import React from "react"
import App from "./pages/App"
import { BrowserRouter, Route, Routes } from "react-router"
import Login from "./pages/Login"
import Layout from "./components/Layout"
import Account from "./pages/Account"
import { HelmetProvider } from "react-helmet-async"

const container = document.getElementById("root") as HTMLDivElement
const root = createRoot(container)

root.render(
    <HelmetProvider>
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/*" element={<App />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </HelmetProvider>
)
