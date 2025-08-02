import React, { useState } from "react"
import { login } from "../api/Account"
import { useAtom } from "jotai"
import { authorizationToken } from "../api/Editor"
import { useNavigate } from "react-router"

export default function Login() {
    const nav = useNavigate()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [, setToken] = useAtom(authorizationToken)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        if (!username || !password) {
            setError("Please enter both username and password.")
            return
        }

        try {
            setSubmitting(true)

            const loginToken = await login(username, password)

            setToken(loginToken)

            nav("/")
        } catch (e) {
            setError("Login failed. Try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="flex min-h-[calc(100vh-48px)] items-center justify-center">
            <div className="w-full max-w-sm">
                <div className="card bg-base-100 shadow-2xl">
                    <div className="card-body">
                        <h1 className="card-title mb-4 justify-center">
                            Sign in
                        </h1>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Username</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    autoComplete="username"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Password</span>
                                </label>
                                <input
                                    type="password"
                                    className="input input-bordered"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                />
                            </div>

                            {error && (
                                <div className="alert alert-error py-2 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="form-control mt-6">
                                <button
                                    type="submit"
                                    className={`btn btn-primary ${
                                        submitting ? "loading" : ""
                                    }`}
                                    disabled={submitting}
                                >
                                    {submitting ? "Logging in…" : "Login"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}
