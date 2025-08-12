import { Outlet } from "react-router"
import { useAtom } from "jotai"
import { authorizationToken, usernameAtom } from "api/Editor"
import { useEffect } from "react"
import { getUsername } from "../api/Account"

export default function Layout() {
    const [token, setToken] = useAtom(authorizationToken)
    const [, setUsername] = useAtom(usernameAtom)

    useEffect(() => {
        ;(async () => {
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
        })()
    }, [setToken, setUsername, token])

    return (
        <div className="min-h-screen ">
            <Outlet />
        </div>
    )
}
