const dhabaData = [
    {
        title: "Baba Ka Dhaba",
        description: "Authentic Punjabi dhaba serving delicious parathas, dal makhani, and butter chicken since 1985. A true highway legend!",
        image: {
            url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
            filename: "baba_dhaba"
        },
        location: "GT Road, Murthal, Haryana",
        cuisine: ["North Indian", "Punjabi"],
        category: "Dhaba",
        priceRange: "₹₹",
        specialties: ["Butter Chicken", "Dal Makhani", "Aloo Paratha", "Lassi"],
        timings: { open: "6:00 AM", close: "12:00 AM" },
        features: ["Parking", "Outdoor Seating", "Family Friendly", "Non-Veg Available"],
        contact: "+91 98765 43210",
        rating: 4.7,
        reviewCount: 234,
        verified: true,
        geometry: { type: "Point", coordinates: [77.0266, 28.8925] }
    },
    {
        title: "South Indian Express",
        description: "Authentic South Indian cuisine with the crispiest dosas and fluffiest idlis. Filter coffee that will wake your soul!",
        image: {
            url: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
            filename: "south_indian"
        },
        location: "Koramangala, Bangalore",
        cuisine: ["South Indian"],
        category: "Restaurant",
        priceRange: "₹",
        specialties: ["Masala Dosa", "Filter Coffee", "Idli Sambar", "Vada"],
        timings: { open: "7:00 AM", close: "10:00 PM" },
        features: ["AC Dining", "Pure Veg", "Family Friendly", "Takeaway"],
        contact: "+91 80 4567 8901",
        rating: 4.5,
        reviewCount: 189,
        verified: true,
        geometry: { type: "Point", coordinates: [77.6101, 12.9352] }
    },
    {
        title: "Sharma Ji Ki Chai",
        description: "The best cutting chai on the highway! Hot samosas, pakoras, and the warmth of a roadside tea stall.",
        image: {
            url: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800",
            filename: "chai_stall"
        },
        location: "Mumbai-Pune Expressway",
        cuisine: ["Street Food"],
        category: "Tea Stall",
        priceRange: "₹",
        specialties: ["Cutting Chai", "Bun Maska", "Samosa", "Vada Pav"],
        timings: { open: "5:00 AM", close: "11:00 PM" },
        features: ["Parking", "Outdoor Seating", "Pure Veg", "Takeaway"],
        contact: "+91 98211 12345",
        rating: 4.3,
        reviewCount: 456,
        verified: false,
        geometry: { type: "Point", coordinates: [73.3812, 18.7557] }
    },
    {
        title: "Rajasthani Rasoi",
        description: "Experience the royal flavors of Rajasthan. Dal Baati Churma, Gatte ki Sabzi, and authentic Rajasthani thali.",
        image: {
            url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
            filename: "rajasthani"
        },
        location: "Jaipur, Rajasthan",
        cuisine: ["Rajasthani", "North Indian"],
        category: "Restaurant",
        priceRange: "₹₹",
        specialties: ["Dal Baati Churma", "Gatte ki Sabzi", "Ker Sangri", "Ghevar"],
        timings: { open: "11:00 AM", close: "11:00 PM" },
        features: ["AC Dining", "Pure Veg", "Family Friendly", "Parking"],
        contact: "+91 141 456 7890",
        rating: 4.6,
        reviewCount: 312,
        verified: true,
        geometry: { type: "Point", coordinates: [75.7873, 26.9124] }
    },
    {
        title: "Highway Haveli",
        description: "Premium dhaba experience on NH-44. Live kitchen, cultural ambiance, and the best Punjabi food on Indian highways.",
        image: {
            url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
            filename: "highway_haveli"
        },
        location: "NH-44, Near Panipat",
        cuisine: ["North Indian", "Punjabi", "Multi-Cuisine"],
        category: "Dhaba",
        priceRange: "₹₹₹",
        specialties: ["Tandoori Chicken", "Paneer Tikka", "Makki di Roti", "Sarson da Saag"],
        timings: { open: "24 Hours", close: "24 Hours" },
        features: ["Parking", "Outdoor Seating", "Family Friendly", "Non-Veg Available", "AC Dining"],
        contact: "+91 98765 00000",
        rating: 4.8,
        reviewCount: 567,
        verified: true,
        geometry: { type: "Point", coordinates: [76.9635, 29.3909] }
    },
    {
        title: "Gujju Bhai Farsan",
        description: "Authentic Gujarati snacks and sweets. Famous for Dhokla, Khandvi, Fafda-Jalebi, and handmade sweets.",
        image: {
            url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
            filename: "gujarati"
        },
        location: "Ahmedabad, Gujarat",
        cuisine: ["Gujarati", "Street Food"],
        category: "Sweet Shop",
        priceRange: "₹",
        specialties: ["Dhokla", "Khandvi", "Fafda-Jalebi", "Thepla"],
        timings: { open: "8:00 AM", close: "9:00 PM" },
        features: ["Pure Veg", "Takeaway", "Home Delivery", "Family Friendly"],
        contact: "+91 79 2345 6789",
        rating: 4.4,
        reviewCount: 289,
        verified: true,
        geometry: { type: "Point", coordinates: [72.5714, 23.0225] }
    }
];

module.exports = { data: dhabaData };
