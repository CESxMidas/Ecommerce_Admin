export const dashboardProductsMock = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    name: "Nike Air Max",
    category: "Shoes",
    subCategory: "Sneakers",
    price: "$120",
    sales: 230,
    stock: 70,
    rating: 4.5,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    name: "Apple Watch",
    category: "Electronics",
    subCategory: "Smartwatch",
    price: "$540",
    sales: 120,
    stock: 45,
    rating: 4.8,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    name: "Headphone",
    category: "Audio",
    subCategory: "Wireless",
    price: "$89",
    sales: 310,
    stock: 90,
    rating: 4.2,
  },
];

export const dashboardOrdersMock = [
  {
    id: "#ORD-1025",
    paymentId: "PAY-784512",
    name: "John Carter",
    phone: "+1 234 567 890",
    address: "New York, USA",
    total: "$420.00",
    status: "Completed",
    products: [
      {
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5",
        name: "Gaming Headset",
        qty: 1,
        price: "$120",
      },
      {
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae",
        name: "Mechanical Keyboard",
        qty: 2,
        price: "$300",
      },
    ],
  },
];

export const dashboardChartMock = [
  { name: "Jan", uv: 4000, pv: 2400 },
  { name: "Feb", uv: 3000, pv: 1398 },
  { name: "Mar", uv: 2000, pv: 9800 },
  { name: "Apr", uv: 2780, pv: 3908 },
  { name: "May", uv: 1890, pv: 4800 },
  { name: "Jun", uv: 2390, pv: 3800 },
];
