import MockAdapter from 'axios-mock-adapter';
import apiClient from './client.js';

const mock = new MockAdapter(apiClient, { delayResponse: 500 }); // simulate network delay

// Dummy Data
const dummyProducts = [
  {
    _id: "p1",
    name: "Dummy Smartphone X1",
    description: "The best dummy phone on the market.",
    price: 699,
    originalPrice: 899,
    discountPercent: 22,
    stock: 50,
    category: { _id: "c1", name: "Electronics" },
    brand: { _id: "b1", name: "DummyBrand" },
    label: { name: "Trending" },
    images: ["https://placehold.co/400x400/png?text=Smartphone"],
    status: "active",
    createdAt: new Date().toISOString()
  },
  {
    _id: "p2",
    name: "Dummy Noise Cancelling Headphones",
    description: "Listen to the silence with our dummy headphones.",
    price: 199,
    originalPrice: 299,
    discountPercent: 33,
    stock: 120,
    category: { _id: "c1", name: "Electronics" },
    brand: { _id: "b2", name: "DummyAudio" },
    label: { name: "Sale" },
    images: ["https://placehold.co/400x400/png?text=Headphones"],
    status: "active",
    createdAt: new Date().toISOString()
  }
];

const dummyCategories = [
  { _id: "c1", name: "Electronics", image: "https://placehold.co/100x100/png?text=Electronics" },
  { _id: "c2", name: "Fashion", image: "https://placehold.co/100x100/png?text=Fashion" }
];

const dummyBanners = [
  {
    _id: "b1",
    title: "Dummy Sale",
    subtitle: "Up to 50% off",
    description: "This is a detailed description of the dummy sale offering huge discounts on various electronics and fashion items. Enjoy shopping with the best deals around town!".repeat(3),
    image: "https://placehold.co/1200x400/png?text=Hero+Banner",
    link: "/products",
    bannerFor: "hero",
    offerValue: 50,
    offerType: "percentage"
  },
  {
    _id: "b2",
    title: "Special Offer",
    subtitle: "Limited Time Deals",
    description: "Grab these limited time deals before they expire! Massive price drops across all categories.".repeat(3),
    image: "https://placehold.co/800x400/png?text=Offer+Banner",
    link: "/products",
    bannerFor: "offer",
    offerValue: 500,
    offerType: "flat"
  }
];

const dummyUser = {
  _id: "u1",
  name: "Dummy User",
  email: "user@dummy.com",
  phone: "1234567890",
  addresses: []
};

// Mocking Endpoints

// Products
mock.onGet(/\/product\/get-products.*/).reply(200, { data: { products: dummyProducts, hasMore: false, currentPage: 1 }, success: true });
mock.onGet(/\/product\/get-product\/.+/).reply((config) => {
  return [200, { ...dummyProducts[0], success: true }];
});

// Categories
mock.onGet(/\/category\/allcategories.*/).reply(200, { envelop: { data: dummyCategories }, success: true });

// Banners
mock.onGet(/\/banner(\/get-all-banners-by-category)?(\?.*)?$/).reply(200, { data: dummyBanners, success: true });
mock.onGet(/\/offerBanner.*/).reply(200, { data: dummyBanners, success: true });

// User & Auth
mock.onGet(/\/user\/check-user.*/).reply(200, { user: dummyUser, success: true });
mock.onPost(/\/user\/login.*/).reply(200, { user: dummyUser, token: "dummy-token-123", success: true });
mock.onPost(/\/user\/register.*/).reply(200, { user: dummyUser, token: "dummy-token-123", success: true });

// Cart
mock.onGet(/\/cart\/get-cart.*/).reply(200, { cart: { items: [], total: 0 }, success: true });

// Pass through any unmatched requests
mock.onAny().passThrough();

console.log("Mock Adapter Initialized for User App");

export default mock;
