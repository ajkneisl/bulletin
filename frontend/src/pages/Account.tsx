import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useAtom } from "jotai"
import { authorizationToken, usernameAtom } from "../api/Editor"

export default function Account() {
    const nav = useNavigate()
    const [token, setToken] = useAtom(authorizationToken)
    const [username, setUsername] = useAtom(usernameAtom)

    const [newUsername, setNewUsername] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [accounts, setAccounts] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        ;(async () => {
            try {
                // const result = await getAllAccounts(token)
                setAccounts(result)
            } catch (e) {
                setError("Failed to fetch accounts.")
            }
        })()
    }, [token])

    const handleUsernameUpdate = async () => {
        try {
            // await updateUsername(token, newUsername)
            setUsername(newUsername)
            setNewUsername("")
        } catch {
            setError("Failed to update username.")
        }
    }

    const handlePasswordUpdate = async () => {
        try {
            // await updatePassword(token, newPassword)
            setNewPassword("")
        } catch {
            setError("Failed to update password.")
        }
    }

    const handleDelete = async () => {
        try {
            // await deleteAccount(token)
            setToken(null)
            setUsername(null)
            nav("/login")
        } catch {
            setError("Failed to delete account.")
        }
    }

    const handleLogout = () => {
        // logout()
        setToken(null)
        setUsername(null)
        nav("/login")
    }

    return (
        <main className="flex min-h-[calc(100vh-48px)] items-center justify-center">
            <div className="w-full max-w-sm">
                <div className="card bg-base-100 shadow-2xl">
                    <div className="card-body space-y-4">
                        <h1 className="card-title justify-center">Account</h1>

                        {error && (
                            <div className="alert alert-error">{error}</div>
                        )}

                        <div>
                            <label className="label">Change Username</label>
                            <input
                                className="input input-bordered w-full"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="New username"
                            />
                            <button
                                onClick={handleUsernameUpdate}
                                className="btn btn-primary btn-sm mt-2 w-full"
                            >
                                Update Username
                            </button>
                        </div>

                        <div>
                            <label className="label">Change Password</label>
                            <input
                                type="password"
                                className="input input-bordered w-full"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                            />
                            <button
                                onClick={handlePasswordUpdate}
                                className="btn btn-primary btn-sm mt-2 w-full"
                            >
                                Update Password
                            </button>
                        </div>

                        <div>
                            <label className="label">Other Accounts</label>
                            <ul className="list-disc list-inside">
                                {accounts.map((user, idx) => (
                                    <li key={idx}>{user}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={handleDelete}
                                className="btn btn-error"
                            >
                                Delete Account
                            </button>
                            <button
                                onClick={handleLogout}
                                className="btn btn-ghost"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
