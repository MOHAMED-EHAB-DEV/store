declare type IUser = {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    createdAt: Date;
    purchasedTemplates: String[];
    favorites: String[]
}

declare type ITemplate = {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    price: number;
    content: string;
    categories: string[];
    tags: string[];
    author: string;
    downloads: number;
    averageRating: number;
}

declare type IOrder = {
    _id: string;
    user: string;
    template: string;
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
}

declare type IReview = {
    _id: string;
    user: string;
    template: string;
    rating: Number;
    comment: String;
}

declare type ICategory = {
    _id: string;
    name: string;
    description: string;
    slug: string;
}
