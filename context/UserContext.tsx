"use client";
import {createContext, useContext, useState, useEffect, ReactNode, Context, Dispatch, SetStateAction} from "react";
import {useRouter} from "next/navigation";

interface IUserContext {
  user: IUser | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
  setReload: Dispatch<SetStateAction<boolean>>;
}

const UserContext = createContext<IUserContext>({
  user: null,
  setUser: () => {},    // no-op fallback
  setReload: () => {},  // no-op fallback
});


export function UserProvider({ children } : {children: ReactNode}) {
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

    // const fetchFavorites = async () => {
    //     try {
    //         const res = await fetch("/api/favorites");
    //         const data = await res.json();
    //         if (data.success) {
    //             const productIds = data.favorites.map((template:ITemplate) => template._id);
    //             setFavoriteTemplates(productIds);
    //         }
    //     } catch (error) {
    //         console.error("Failed to fetch favorites:", error);
    //     }
    // };
    //
    // // Fetch visitor count and increment it
    // const fetchVisitorCount = async () => {
    //     try {
    //         // Check if we already counted a visit today
    //         const today = new Date();
    //         today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    //         const todayStr = today.toISOString().split("T")[0];
    //         // Get the last visit date from localStorage
    //         const lastVisitDate = localStorage.getItem("lastVisitDate");
    //         // If we haven't visited today, increment the count
    //         if (lastVisitDate !== todayStr) {
    //             // First increment the count
    //             await fetch("/api/visitors", { method: "POST" });
    //             // Store today's date in localStorage
    //             localStorage.setItem("lastVisitDate", todayStr);
    //         }
    //     } catch (error) {
    //         return;
    //     }
    // };
    //
    // // Add a product to favorites
    // const addToFavorites = async (productId) => {
    //     try {
    //         // Optimistically update UI
    //         setFavoriteProducts((prev) => {
    //             if (!prev.includes(productId)) return [...prev, productId];
    //             return prev;
    //         });
    //
    //         // Send request to API
    //         const res = await fetch("/api/favorites", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ productId }),
    //         });
    //
    //         const data = await res.json();
    //         if (!data.success) {
    //             // Revert if failed
    //             setFavoriteProducts((prev) => prev.filter((id) => id !== productId));
    //             console.error("Failed to add to favorites:", data.error);
    //         }
    //     } catch (error) {
    //         // Revert if failed
    //         setFavoriteProducts((prev) => prev.filter((id) => id !== productId));
    //         console.error("Error adding to favorites:", error);
    //     }
    // };
    //
    // // Remove a product from favorites
    // const removeFromFavorites = async (productId) => {
    //     try {
    //         // Optimistically update UI
    //         setFavoriteProducts((prev) => prev.filter((id) => id !== productId));
    //
    //         // Send request to API
    //         const res = await fetch(`/api/favorites?productId=${productId}`, {
    //             method: "DELETE",
    //         });
    //
    //         const data = await res.json();
    //         if (!data.success) {
    //             // Revert if failed
    //             setFavoriteProducts((prev) => [...prev, productId]);
    //             console.error("Failed to remove from favorites:", data.error);
    //         }
    //     } catch (error) {
    //         // Revert if failed
    //         setFavoriteProducts((prev) => [...prev, productId]);
    //         console.error("Error removing from favorites:", error);
    //     }
    // };
    //
    // // Toggle favorite status
    // const toggleFavorite = (productId) => {
    //     if (!user) return router.push("/login?message=unauthorized");
    //     if (favoriteProducts.includes(productId)) removeFromFavorites(productId);
    //     else addToFavorites(productId);
    // };

    useEffect(() => {
        fetchUser();
        // fetchVisitorCount();
    }, [reload]);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                setReload,
                // favoriteProducts,
                // setFavoriteProducts,
                // addToFavorites,
                // removeFromFavorites,
                // toggleFavorite,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
