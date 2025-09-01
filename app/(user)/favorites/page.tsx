import FavoritesClient from "./FavoritesClient";

const Page = async () => {
    return (
        <div className="flex flex-col justify-center gap-10 p-8 py-36 overflow-x-hidden w-[100dvw] px-5 md:px-56">
            <h1 className="text-white font-bold text-2xl md:text-4xl">Favorite Templates</h1>

            <FavoritesClient />
        </div>
    )
}
export default Page
