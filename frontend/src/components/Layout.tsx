import { Outlet } from "react-router"
import { useAtom } from "jotai"
import { useEffect } from "react"
import { authorizationToken, getUsername, usernameAtom } from "../api/Account"

/**
 * The primary layout.
 */
export default function Layout() {
    const [token, setToken] = useAtom(authorizationToken)
    const [, setUsername] = useAtom(usernameAtom)

    useEffect(() => {
        const checkToken = async () => {
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
        }

        void checkToken()
    }, [setToken, setUsername, token])

    return (
        <div className="min-h-screen ">
            <Outlet />
        </div>
    )
}
