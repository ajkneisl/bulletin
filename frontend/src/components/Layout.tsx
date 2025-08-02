import React, { useEffect } from "react"
import { Outlet } from "react-router"
import { useAtom } from "jotai"
import { authorizationToken, usernameAtom } from "../api/Editor"
import { getUsername } from "../api/Account"

export default function Layout() {
    const [token, setToken] = useAtom(authorizationToken)
    const [, setUsername] = useAtom(usernameAtom)

    useEffect(() => {
        async function loadUsername() {
            if (!token) return

            const request = await getUsername(token)

            if (request !== null) {
                setUsername(request)
            } else {
                // if the request is invalid, must be an invalid token;
                // log them out!
                setUsername(null)
                setToken(null)
            }

            loadUsername()
        }
    }, [setToken, setUsername, token])

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="footer footer-center h-[48px] bg-base-200 p-4 text-sm font-normal text-base-content">
                <div>
                    <p>bulletin {new Date().getFullYear()}</p>
                </div>
            </footer>
        </div>
    )
}
