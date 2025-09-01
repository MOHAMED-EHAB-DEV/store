"use client";
import { createContext, useContext, useState, useEffect, ReactNode, Context, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";

interface IUserContext {
    user: IUser | null;
    setUser: Dispatch<SetStateAction<IUser | null>>;
    setReload: Dispatch<SetStateAction<boolean>>;
    favoriteTemplates: String[];
    addToFavorites: (templateId: string) => void;
    removeFromFavorites: (templateId: string) => void;
    toggleFavorite: (templateId: string) => void;
}

const UserContext = createContext<IUserContext>({
    user: null,
    setUser: () => { },
    setReload: () => { },
    favoriteTemplates: [],
    addToFavorites: () => { },
    removeFromFavorites: () => { },
    toggleFavorite: () => { },
});


export function UserProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [reload, setReload] = useState(false);
    const [favoriteTemplates, setFavoriteTemplates] = useState([]);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user");
            const data = await res.json();
            setUser(data.user);
            return data.user;
        } catch (error) {
            console.error("Failed to fetch user:", error);
        }
    };

    const fetchFavorites = async (userId: string) => {
        try {
            const res = await fetch(`/api/user/favorites?userId=${userId}`);
            const data = await res.json();
            if (data.success) {
                setFavoriteTemplates(data.data.map((template: any) => template._id));
            }
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
        }
    };

    const addToFavorites = async (templateId: string) => {
        if (!user) return;
        setFavoriteTemplates((prev) => [...prev, templateId]);
        try {
            const res = await fetch("/api/user/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user._id, templateId, action: "add" }),
            });
            const data = await res.json();
            if (!data.success) {
                setFavoriteTemplates((prev) => prev.filter((id) => id !== templateId));
                console.error("Failed to add to favorites:", data.error);
            }
        } catch (error) {
            setFavoriteTemplates((prev) => prev.filter((id) => id !== templateId));
            console.error("Error adding to favorites:", error);
        }
    };

    const removeFromFavorites = async (templateId: string) => {
        if (!user) return;
        setFavoriteTemplates((prev) => prev.filter((id) => id !== templateId));
        try {
            const res = await fetch("/api/user/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user._id, templateId, action: "remove" }),
            });
            const data = await res.json();
            if (!data.success) {
                setFavoriteTemplates((prev) => [...prev, templateId]);
                console.error("Failed to remove from favorites:", data.error);
            }
        } catch (error) {
            setFavoriteTemplates((prev) => [...prev, templateId]);
            console.error("Error removing from favorites:", error);
        }
    };

    const toggleFavorite = (templateId: string) => {
        if (!user) return router.push("/login?message=unauthorized");
        if (favoriteTemplates.includes(templateId)) removeFromFavorites(templateId);
        else addToFavorites(templateId);
    };

    useEffect(() => {
        fetchUser().then((u) => {
            if (u?._id) fetchFavorites(u._id);
        });
    }, [reload]);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                setReload,
                favoriteTemplates,
                addToFavorites,
                removeFromFavorites,
                toggleFavorite,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
