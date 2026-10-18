const vehicleData = [
    {
        title: "Royal Enfield Classic 350",
        description: "The iconic Royal Enfield Classic 350 - perfect for highway cruising and mountain rides. Well maintained with recent service.",
        image: {
            url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
            filename: "royal_enfield"
        },
        pricePerDay: 1200,
        location: "Mumbai, Maharashtra",
        vehicleType: "bike",
        brand: "Royal Enfield",
        model: "Classic 350",
        year: 2022,
        fuelType: "Petrol",
        transmission: "Manual",
        seats: 2,
        features: ["Helmet Included", "Tool Kit", "Insurance Included"],
        available: true,
        instantBook: true,
        rating: 4.8,
        reviewCount: 45,
        geometry: { type: "Point", coordinates: [72.8777, 19.0760] }
    },
    {
        title: "Maruti Swift ZXI",
        description: "Compact and fuel-efficient hatchback, perfect for city drives and short trips. AC, music system, and great mileage.",
        image: {
            url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
            filename: "maruti_swift"
        },
        pricePerDay: 2500,
        location: "Delhi NCR",
        vehicleType: "car",
        brand: "Maruti Suzuki",
        model: "Swift ZXI",
        year: 2023,
        fuelType: "Petrol",
        transmission: "Manual",
        seats: 5,
        features: ["AC", "Music System", "GPS", "USB Charger", "Insurance Included"],
        available: true,
        instantBook: false,
        rating: 4.6,
        reviewCount: 32,
        geometry: { type: "Point", coordinates: [77.2090, 28.6139] }
    },
    {
        title: "Honda Activa 6G",
        description: "Easy to ride automatic scooter, ideal for city commuting and exploring local areas. Great for beginners.",
        image: {
            url: "https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=800",
            filename: "honda_activa"
        },
        pricePerDay: 600,
        location: "Bangalore, Karnataka",
        vehicleType: "scooter",
        brand: "Honda",
        model: "Activa 6G",
        year: 2023,
        fuelType: "Petrol",
        transmission: "Automatic",
        seats: 2,
        features: ["Helmet Included", "USB Charger", "Insurance Included"],
        available: true,
        instantBook: true,
        rating: 4.5,
        reviewCount: 67,
        geometry: { type: "Point", coordinates: [77.5946, 12.9716] }
    },
    {
        title: "Mahindra Thar 4x4",
        description: "The adventure-ready Mahindra Thar - conquer any terrain. Perfect for Ladakh trips and off-road adventures.",
        image: {
            url: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
            filename: "mahindra_thar"
        },
        pricePerDay: 5000,
        location: "Manali, Himachal Pradesh",
        vehicleType: "suv",
        brand: "Mahindra",
        model: "Thar 4x4",
        year: 2023,
        fuelType: "Diesel",
        transmission: "Manual",
        seats: 4,
        features: ["AC", "Music System", "GPS", "First Aid Kit", "Tool Kit", "Insurance Included"],
        available: true,
        instantBook: false,
        rating: 4.9,
        reviewCount: 28,
        geometry: { type: "Point", coordinates: [77.1892, 32.2396] }
    },
    {
        title: "KTM Duke 390",
        description: "High-performance sports bike for thrill seekers. Perfect for mountain twisties and adrenaline-packed rides.",
        image: {
            url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
            filename: "ktm_duke"
        },
        pricePerDay: 2000,
        location: "Pune, Maharashtra",
        vehicleType: "bike",
        brand: "KTM",
        model: "Duke 390",
        year: 2022,
        fuelType: "Petrol",
        transmission: "Manual",
        seats: 2,
        features: ["Helmet Included", "Tool Kit", "Insurance Included"],
        available: true,
        instantBook: true,
        rating: 4.7,
        reviewCount: 19,
        geometry: { type: "Point", coordinates: [73.8567, 18.5204] }
    },
    {
        title: "Toyota Innova Crysta",
        description: "Spacious 7-seater MPV perfect for family trips and group travel. Comfortable, reliable, and feature-rich.",
        image: {
            url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
            filename: "innova"
        },
        pricePerDay: 4500,
        location: "Chennai, Tamil Nadu",
        vehicleType: "van",
        brand: "Toyota",
        model: "Innova Crysta",
        year: 2022,
        fuelType: "Diesel",
        transmission: "Automatic",
        seats: 7,
        features: ["AC", "Music System", "GPS", "USB Charger", "First Aid Kit", "Insurance Included"],
        available: true,
        instantBook: false,
        rating: 4.8,
        reviewCount: 41,
        geometry: { type: "Point", coordinates: [80.2707, 13.0827] }
    }
];

module.exports = { data: vehicleData };
