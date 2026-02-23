// State-District mapping with mock flood risk data for India
export interface DistrictData {
    name: string;
    riskLevel: "HIGH" | "MODERATE" | "LOW";
    riskScore: number;
    population: number;
    rainfall: number; // mm
    waterLevel: number; // meters
    shelters: number;
    lat: number;
    lng: number;
}

export interface StateData {
    name: string;
    code: string;
    lat: number;
    lng: number;
    districts: DistrictData[];
}

export const STATES_DATA: StateData[] = [
    {
        name: "Assam", code: "AS", lat: 26.2006, lng: 92.9376,
        districts: [
            { name: "Kamrup", riskLevel: "HIGH", riskScore: 8.7, population: 1517202, rainfall: 312, waterLevel: 7.2, shelters: 14, lat: 26.14, lng: 91.67 },
            { name: "Nagaon", riskLevel: "HIGH", riskScore: 9.1, population: 2823768, rainfall: 340, waterLevel: 8.1, shelters: 8, lat: 26.35, lng: 92.68 },
            { name: "Dhubri", riskLevel: "MODERATE", riskScore: 6.2, population: 1948632, rainfall: 220, waterLevel: 5.4, shelters: 6, lat: 26.02, lng: 89.98 },
            { name: "Cachar", riskLevel: "LOW", riskScore: 3.1, population: 1736319, rainfall: 150, waterLevel: 3.2, shelters: 10, lat: 24.82, lng: 92.78 },
        ]
    },
    {
        name: "Bihar", code: "BR", lat: 25.0961, lng: 85.3131,
        districts: [
            { name: "Patna", riskLevel: "HIGH", riskScore: 8.3, population: 5838465, rainfall: 280, waterLevel: 6.5, shelters: 22, lat: 25.61, lng: 85.14 },
            { name: "Muzaffarpur", riskLevel: "HIGH", riskScore: 8.9, population: 4801062, rainfall: 310, waterLevel: 7.8, shelters: 12, lat: 26.12, lng: 85.39 },
            { name: "Darbhanga", riskLevel: "HIGH", riskScore: 9.4, population: 3937385, rainfall: 345, waterLevel: 8.6, shelters: 9, lat: 26.17, lng: 86.04 },
            { name: "Bhagalpur", riskLevel: "MODERATE", riskScore: 5.8, population: 3032226, rainfall: 195, waterLevel: 4.8, shelters: 11, lat: 25.24, lng: 86.97 },
            { name: "Gaya", riskLevel: "LOW", riskScore: 2.5, population: 4391418, rainfall: 110, waterLevel: 2.1, shelters: 15, lat: 24.80, lng: 85.01 },
        ]
    },
    {
        name: "Uttarakhand", code: "UK", lat: 30.0668, lng: 79.0193,
        districts: [
            { name: "Chamoli", riskLevel: "HIGH", riskScore: 9.2, population: 391114, rainfall: 380, waterLevel: 9.1, shelters: 5, lat: 30.40, lng: 79.33 },
            { name: "Pithoragarh", riskLevel: "HIGH", riskScore: 8.1, population: 483439, rainfall: 290, waterLevel: 6.8, shelters: 7, lat: 29.58, lng: 80.22 },
            { name: "Uttarkashi", riskLevel: "MODERATE", riskScore: 6.5, population: 330086, rainfall: 240, waterLevel: 5.3, shelters: 4, lat: 30.73, lng: 78.45 },
            { name: "Dehradun", riskLevel: "MODERATE", riskScore: 5.0, population: 1696694, rainfall: 200, waterLevel: 4.2, shelters: 18, lat: 30.32, lng: 78.03 },
        ]
    },
    {
        name: "Kerala", code: "KL", lat: 10.8505, lng: 76.2711,
        districts: [
            { name: "Wayanad", riskLevel: "HIGH", riskScore: 9.5, population: 817420, rainfall: 410, waterLevel: 8.8, shelters: 11, lat: 11.69, lng: 76.08 },
            { name: "Idukki", riskLevel: "HIGH", riskScore: 8.8, population: 1108974, rainfall: 370, waterLevel: 7.5, shelters: 9, lat: 9.85, lng: 76.97 },
            { name: "Ernakulam", riskLevel: "MODERATE", riskScore: 5.9, population: 3282388, rainfall: 210, waterLevel: 4.5, shelters: 24, lat: 10.00, lng: 76.30 },
            { name: "Alappuzha", riskLevel: "MODERATE", riskScore: 6.7, population: 2127789, rainfall: 250, waterLevel: 5.8, shelters: 16, lat: 9.49, lng: 76.34 },
            { name: "Thrissur", riskLevel: "LOW", riskScore: 3.4, population: 3121200, rainfall: 140, waterLevel: 2.9, shelters: 20, lat: 10.52, lng: 76.21 },
        ]
    },
    {
        name: "West Bengal", code: "WB", lat: 22.9868, lng: 87.8550,
        districts: [
            { name: "Malda", riskLevel: "HIGH", riskScore: 8.4, population: 3997970, rainfall: 300, waterLevel: 7.1, shelters: 10, lat: 25.01, lng: 88.14 },
            { name: "Murshidabad", riskLevel: "HIGH", riskScore: 8.0, population: 7103807, rainfall: 275, waterLevel: 6.4, shelters: 13, lat: 24.18, lng: 88.27 },
            { name: "North 24 Parganas", riskLevel: "MODERATE", riskScore: 6.3, population: 10009781, rainfall: 230, waterLevel: 5.1, shelters: 28, lat: 22.62, lng: 88.80 },
            { name: "Howrah", riskLevel: "LOW", riskScore: 3.8, population: 4841638, rainfall: 160, waterLevel: 3.4, shelters: 19, lat: 22.59, lng: 88.26 },
        ]
    },
    {
        name: "Maharashtra", code: "MH", lat: 19.7515, lng: 75.7139,
        districts: [
            { name: "Ratnagiri", riskLevel: "HIGH", riskScore: 7.9, population: 1615069, rainfall: 350, waterLevel: 6.7, shelters: 8, lat: 17.00, lng: 73.30 },
            { name: "Kolhapur", riskLevel: "MODERATE", riskScore: 6.1, population: 3876001, rainfall: 220, waterLevel: 5.0, shelters: 15, lat: 16.70, lng: 74.24 },
            { name: "Pune", riskLevel: "MODERATE", riskScore: 4.8, population: 9426959, rainfall: 180, waterLevel: 3.8, shelters: 32, lat: 18.52, lng: 73.86 },
            { name: "Mumbai Suburban", riskLevel: "MODERATE", riskScore: 6.5, population: 9332481, rainfall: 260, waterLevel: 5.5, shelters: 40, lat: 19.08, lng: 72.89 },
            { name: "Nagpur", riskLevel: "LOW", riskScore: 2.3, population: 4653570, rainfall: 95, waterLevel: 1.8, shelters: 18, lat: 21.15, lng: 79.09 },
        ]
    },
    {
        name: "Gujarat", code: "GJ", lat: 22.2587, lng: 71.1924,
        districts: [
            { name: "Kutch", riskLevel: "MODERATE", riskScore: 5.6, population: 2092371, rainfall: 200, waterLevel: 4.6, shelters: 7, lat: 23.73, lng: 69.86 },
            { name: "Surat", riskLevel: "MODERATE", riskScore: 6.0, population: 6081322, rainfall: 230, waterLevel: 5.2, shelters: 25, lat: 21.17, lng: 72.83 },
            { name: "Vadodara", riskLevel: "LOW", riskScore: 3.5, population: 4157568, rainfall: 130, waterLevel: 2.7, shelters: 16, lat: 22.31, lng: 73.19 },
        ]
    },
    {
        name: "Uttar Pradesh", code: "UP", lat: 26.8467, lng: 80.9462,
        districts: [
            { name: "Gorakhpur", riskLevel: "HIGH", riskScore: 8.6, population: 4440895, rainfall: 305, waterLevel: 7.3, shelters: 11, lat: 26.76, lng: 83.37 },
            { name: "Bahraich", riskLevel: "HIGH", riskScore: 7.8, population: 3487731, rainfall: 270, waterLevel: 6.2, shelters: 6, lat: 27.57, lng: 81.60 },
            { name: "Lucknow", riskLevel: "MODERATE", riskScore: 4.5, population: 4589838, rainfall: 170, waterLevel: 3.6, shelters: 22, lat: 26.85, lng: 80.95 },
            { name: "Varanasi", riskLevel: "MODERATE", riskScore: 5.3, population: 3682194, rainfall: 195, waterLevel: 4.3, shelters: 14, lat: 25.32, lng: 83.01 },
        ]
    },
    {
        name: "Tamil Nadu", code: "TN", lat: 11.1271, lng: 78.6569,
        districts: [
            { name: "Chennai", riskLevel: "HIGH", riskScore: 7.6, population: 4646732, rainfall: 320, waterLevel: 5.9, shelters: 35, lat: 13.08, lng: 80.27 },
            { name: "Cuddalore", riskLevel: "MODERATE", riskScore: 6.4, population: 2605914, rainfall: 240, waterLevel: 5.0, shelters: 12, lat: 11.75, lng: 79.77 },
            { name: "Coimbatore", riskLevel: "LOW", riskScore: 2.8, population: 3458045, rainfall: 100, waterLevel: 2.0, shelters: 20, lat: 11.00, lng: 76.96 },
        ]
    },
    {
        name: "Delhi", code: "DL", lat: 28.7041, lng: 77.1025,
        districts: [
            { name: "East Delhi", riskLevel: "HIGH", riskScore: 7.5, population: 1709346, rainfall: 260, waterLevel: 6.1, shelters: 8, lat: 28.63, lng: 77.30 },
            { name: "Central Delhi", riskLevel: "MODERATE", riskScore: 5.2, population: 578671, rainfall: 190, waterLevel: 4.0, shelters: 6, lat: 28.65, lng: 77.23 },
            { name: "New Delhi", riskLevel: "LOW", riskScore: 3.0, population: 142004, rainfall: 120, waterLevel: 2.5, shelters: 10, lat: 28.61, lng: 77.21 },
        ]
    },
];

// Helper functions
export function getAllDistricts(): (DistrictData & { stateName: string })[] {
    return STATES_DATA.flatMap(state =>
        state.districts.map(d => ({ ...d, stateName: state.name }))
    );
}

export function getHighRiskDistricts(): (DistrictData & { stateName: string })[] {
    return getAllDistricts().filter(d => d.riskLevel === "HIGH").sort((a, b) => b.riskScore - a.riskScore);
}

export function getStateRiskSummary(stateName: string) {
    const state = STATES_DATA.find(s => s.name === stateName);
    if (!state) return null;
    const high = state.districts.filter(d => d.riskLevel === "HIGH").length;
    const moderate = state.districts.filter(d => d.riskLevel === "MODERATE").length;
    const low = state.districts.filter(d => d.riskLevel === "LOW").length;
    const avgRisk = state.districts.reduce((s, d) => s + d.riskScore, 0) / state.districts.length;
    const totalPop = state.districts.reduce((s, d) => s + d.population, 0);
    const totalShelters = state.districts.reduce((s, d) => s + d.shelters, 0);
    return { high, moderate, low, avgRisk: Math.round(avgRisk * 10) / 10, totalPop, totalShelters };
}
