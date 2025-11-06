"use client";
import { createContext, useContext, useState, useEffect, ReactNode, Context, Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { IUser } from "@/types";

interface IUserContext {
    user: IUser | null;
    setUser: Dispatch<SetStateAction<IUser | null>>;
    setReload: Dispatch<SetStateAction<boolean>>;
    favoriteTemplates: String[];
    purchasedTemplates: String[];
    addToFavorites: (templateId: string) => void;
    removeFromFavorites: (templateId: string) => void;
    toggleFavorite: (templateId: string) => void;
}

const UserContext = createContext<IUserContext>({
    user: null,
    setUser: () => { },
    setReload: () => { },
    favoriteTemplates: [],
    purchasedTemplates: [],
    addToFavorites: () => { },
    removeFromFavorites: () => { },
    toggleFavorite: () => { },
});


export function UserProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<IUser | null>(null);
    const [reload, setReload] = useState(false);
    const [favoriteTemplates, setFavoriteTemplates] = useState<String[]>([]);
    const [purchasedTemplates, setPurchasedTemplates] = useState([]);

    const fetchUser = async () => {
        try {
            const res = await fetch("/api/user");
            const data = await res.json();
            setUser(data.user);
            return data.user;
        } catch (error) {
            setUser(null);
        }
    };

    const fetchPurchasedTemplates = async () => {
        try {
            const res = await fetch(`/api/user/purchased-templates`);
            const data = await res.json();
            if (data.success) {
                setPurchasedTemplates(data.data.map((template: any) => template._id));
            }
        } catch (error) {
            setPurchasedTemplates([]);
        }
    }

    const fetchFavorites = async () => {
        try {
            const res = await fetch(`/api/user/favorites`);
            const data = await res.json();
            if (data.success) {
                setFavoriteTemplates(data.data.map((template: any) => template._id));
            }
        } catch (error) {
            setFavoriteTemplates([]);
        }
    };

    const addToFavorites = async (templateId: string) => {
        if (!user) return;
        setFavoriteTemplates((prev) => [...prev, templateId] as String[]);
        try {
            const res = await fetch("/api/user/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user?._id, templateId, action: "add" }),
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
        if (!user) return router.push("/signin?message=unauthorized");
        if (favoriteTemplates.includes(templateId)) removeFromFavorites(templateId);
        else addToFavorites(templateId);
    };

    useEffect(() => {
        fetchUser().then((u) => {
            fetchFavorites();
            fetchPurchasedTemplates();
        });
    }, [reload]);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                setReload,
                favoriteTemplates,
                purchasedTemplates,
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
