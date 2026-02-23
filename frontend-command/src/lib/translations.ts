// Multilingual translation system for FloodSense AI
// Supports 12 Indian languages with key UI strings

export type LangCode = "en" | "hi" | "bn" | "te" | "ta" | "mr" | "gu" | "kn" | "ml" | "pa" | "as" | "or";

export const LANG_MAP: Record<string, LangCode> = {
    "English": "en", "हिन्दी": "hi", "বাংলা": "bn", "తెలుగు": "te",
    "தமிழ்": "ta", "मराठी": "mr", "ગુજરાતી": "gu", "ಕನ್ನಡ": "kn",
    "മലയാളം": "ml", "ਪੰਜਾਬੀ": "pa", "অসমীয়া": "as", "ଓଡ଼ିଆ": "or",
};

interface TranslationSet {
    // Auth & Nav
    citizen_portal: string;
    authority_portal: string;
    login: string;
    signup: string;
    logout: string;
    // Dashboard
    am_i_safe: string;
    you_are_safe: string;
    danger_alert: string;
    moderate_risk: string;
    flood_probability: string;
    quick_actions: string;
    evacuation_route: string;
    nearby_shelters: string;
    send_sos: string;
    alert_family: string;
    // Alerts
    active_alerts: string;
    high_risk: string;
    low_risk: string;
    no_alerts: string;
    // Evacuation
    safe_route: string;
    avoid_flooded: string;
    destination: string;
    distance: string;
    head_north: string;
    turn_right_flyover: string;
    avoid_flooded_zone: string;
    continue_to: string;
    time_to_impact: string;
    min_to_shelter: string;
    min_to_flood: string;
    min_buffer: string;
    open_maps: string;
    your_location: string;
    via_sim_gps: string;
    // Shelters
    shelters_near: string;
    navigate_here: string;
    maps: string;
    open: string;
    full: string;
    // SOS
    emergency_sos: string;
    sos_sent: string;
    rescue_eta: string;
    helplines: string;
    send_sos_alert: string;
    sends_sos_desc: string;
    alert_id: string;
    location: string;
    method: string;
    disaster_mgmt: string;
    emergency: string;
    // Family
    send_safety_status: string;
    send_safety_alert: string;
    family_alerted: string;
    sms_gps_sent: string;
    mom: string;
    dad: string;
    brother: string;
    // Vulnerability
    vulnerable_areas: string;
    elderly: string;
    children: string;
    disabled: string;
    priority_notice: string;
    vulnerability_hotspots: string;
    // Dam
    dam_monitoring: string;
    dam_danger: string;
    dam_overflow: string;
    dams_reservoirs_near: string;
    dam_critical: string;
    no_dams: string;
    river: string;
    capacity: string;
    // Citizen Report
    report_flood: string;
    report_submitted: string;
    waterlogging: string;
    report_from: string;
    gps_auto: string;
    type: string;
    drainage_blocked: string;
    road_flooded: string;
    embankment_breach: string;
    other: string;
    upload_photo: string;
    describe_situation: string;
    submit_report: string;
    report_sent_desc: string;
    // Analytics
    hydromet_analytics: string;
    live_conditions: string;
    rainfall_24h: string;
    temperature: string;
    soil_moisture: string;
    wind_speed: string;
    river_discharge: string;
    seven_day_rain: string;
    rainfall_trend: string;
    forecasting_model: string;
    model: string;
    sources: string;
    accuracy: string;
    infrastructure: string;
    drainage: string;
    embankment: string;
    // Location
    sim_gps_location: string;
    how_it_works: string;
    current_location: string;
    latitude: string;
    longitude: string;
    accuracy_label: string;
    tower_id: string;
    signal: string;
    nearest_towers: string;
    // Mesh
    floodmesh_chat: string;
    mesh_active: string;
    msgs: string;
    mesh_relay_desc: string;
    broadcast_sos: string;
    type_message: string;
    mesh_broadcast_desc: string;
    // Home
    tap_voice_alert: string;
    score: string;
    rain_24h: string;
    temp: string;
    soil: string;
    live: string;
    cached: string;
    offline: string;
    dams_near: string;
    reports_label: string;
    // General
    back: string;
    refresh: string;
    loading: string;
    state_analysis: string;
    view_all: string;
    current_conditions: string;
    recommendation: string;
    copyright: string;
}

const translations: Record<LangCode, TranslationSet> = {
    en: {
        citizen_portal: "Citizen Portal", authority_portal: "NDRF / Authority Portal",
        login: "Login", signup: "Sign Up", logout: "Logout",
        am_i_safe: "Am I Safe?", you_are_safe: "You are safe. No immediate flood risk.",
        danger_alert: "⚠️ DANGER — Move to higher ground immediately!",
        moderate_risk: "Elevated risk. Stay alert and prepare emergency kit.",
        flood_probability: "Flood probability", quick_actions: "Quick Actions",
        evacuation_route: "Evacuation Route", nearby_shelters: "Nearby Shelters",
        send_sos: "Send SOS", alert_family: "Alert Family",
        active_alerts: "Active Alerts", high_risk: "HIGH RISK", low_risk: "LOW RISK",
        no_alerts: "No active alerts. All parameters within safe range.",
        safe_route: "Nearest Safe Route", avoid_flooded: "Avoid flooded roads",
        destination: "Destination", distance: "Distance",
        head_north: "Head North via safe route", turn_right_flyover: "Turn Right onto Elevated Flyover",
        avoid_flooded_zone: "⚠️ Avoid flooded zone (water 2ft+)", continue_to: "Continue to",
        time_to_impact: "Time to Impact", min_to_shelter: "min to shelter",
        min_to_flood: "min to flood", min_buffer: "min buffer",
        open_maps: "Open Maps", your_location: "Your Location", via_sim_gps: "via SIM GPS",
        shelters_near: "Shelters near", navigate_here: "Navigate Here", maps: "Maps",
        open: "Open", full: "Full",
        emergency_sos: "Emergency SOS", sos_sent: "SOS Alert Sent ✓",
        rescue_eta: "Rescue team ETA: ~15 minutes", helplines: "Direct Helplines",
        send_sos_alert: "🚨 SEND SOS ALERT",
        sends_sos_desc: "Sends SOS + GPS location to NDRF & 112.",
        alert_id: "Alert ID", location: "Location", method: "Method",
        disaster_mgmt: "Disaster Mgmt", emergency: "Emergency",
        send_safety_status: "Send safety status via SMS from",
        send_safety_alert: "📩 Send Safety Alert", family_alerted: "Family Alerted ✓",
        sms_gps_sent: "SMS with GPS sent from",
        mom: "Mom", dad: "Dad", brother: "Brother",
        vulnerable_areas: "Vulnerable Areas", elderly: "Elderly", children: "Children", disabled: "Disabled",
        priority_notice: "Higher vulnerability = earlier evacuation alerts. Showing",
        vulnerability_hotspots: "Vulnerability hotspots in",
        dam_monitoring: "Dam & Reservoir Status", dam_danger: "DANGER", dam_overflow: "OVERFLOW",
        dams_reservoirs_near: "Dams & Reservoirs near",
        dam_critical: "dam(s) in critical status near your area",
        no_dams: "No dams/reservoirs linked to",
        river: "River", capacity: "Capacity",
        report_flood: "Report Flood/Waterlogging", report_submitted: "Report Submitted ✓",
        waterlogging: "Waterlogging Detected",
        report_from: "Report from", gps_auto: "GPS auto-attached.",
        type: "Type", drainage_blocked: "Drainage Blocked", road_flooded: "Road Flooded",
        embankment_breach: "Embankment Breach", other: "Other",
        upload_photo: "Upload photo", describe_situation: "Describe the situation...",
        submit_report: "Submit Report to NDRF", report_sent_desc: "Report sent to NDRF. Visible in Authority Dashboard.",
        hydromet_analytics: "Hydromet Analytics", live_conditions: "Live Conditions",
        rainfall_24h: "Rainfall (24h)", temperature: "Temperature",
        soil_moisture: "Soil Moisture", wind_speed: "Wind Speed",
        river_discharge: "River Discharge", seven_day_rain: "7-Day Rain",
        rainfall_trend: "Rainfall Trend (10 days)", forecasting_model: "Forecasting Model",
        model: "Model", sources: "Sources", accuracy: "Accuracy",
        infrastructure: "Infrastructure", drainage: "Drainage", embankment: "Embankment",
        sim_gps_location: "SIM GPS Location",
        how_it_works: "Like 'Where is my Train', your location is detected via mobile network cell tower triangulation.",
        current_location: "Current Location", latitude: "Latitude", longitude: "Longitude",
        accuracy_label: "Accuracy", tower_id: "Tower ID", signal: "Signal",
        nearest_towers: "Nearest Towers",
        floodmesh_chat: "FloodMesh — Emergency Chat", mesh_active: "Mesh Active",
        msgs: "msgs", mesh_relay_desc: "Messages relay through nearby devices via BLE/WiFi mesh · No internet needed",
        broadcast_sos: "Broadcast SOS", type_message: "Type a message...",
        mesh_broadcast_desc: "Messages broadcast to all nearby mesh nodes · TTL: 7 hops",
        tap_voice_alert: "Tap for voice alert in", score: "Score",
        rain_24h: "Rain 24h", temp: "Temp", soil: "Soil",
        live: "Live", cached: "Cached", offline: "Offline",
        dams_near: "Dams Near", reports_label: "Reports",
        back: "Back", refresh: "Refresh", loading: "Loading...",
        state_analysis: "State-wise Analysis", view_all: "View All",
        current_conditions: "Current Conditions", recommendation: "Recommendation",
        copyright: "© 2024 FloodSense AI · NDRF · Govt. of India",
    },
    hi: {
        citizen_portal: "नागरिक पोर्टल", authority_portal: "NDRF / प्राधिकरण पोर्टल",
        login: "लॉगिन", signup: "साइन अप", logout: "लॉग आउट",
        am_i_safe: "क्या मैं सुरक्षित हूँ?", you_are_safe: "आप सुरक्षित हैं। बाढ़ का कोई तत्काल खतरा नहीं।",
        danger_alert: "⚠️ खतरा — तुरंत ऊंचाई पर जाएं!",
        moderate_risk: "मध्यम खतरा। सतर्क रहें और इमरजेंसी किट तैयार रखें।",
        flood_probability: "बाढ़ की संभावना", quick_actions: "त्वरित कार्रवाई",
        evacuation_route: "निकासी मार्ग", nearby_shelters: "निकटतम आश्रय",
        send_sos: "SOS भेजें", alert_family: "परिवार को सचेत करें",
        active_alerts: "सक्रिय अलर्ट", high_risk: "उच्च जोखिम", low_risk: "कम जोखिम",
        no_alerts: "कोई सक्रिय अलर्ट नहीं। सभी मापदंड सुरक्षित सीमा में।",
        safe_route: "निकटतम सुरक्षित मार्ग", avoid_flooded: "जलमग्न सड़कों से बचें",
        destination: "गंतव्य", distance: "दूरी",
        emergency_sos: "आपातकालीन SOS", sos_sent: "SOS अलर्ट भेजा गया ✓",
        rescue_eta: "बचाव दल ETA: ~15 मिनट", helplines: "सीधी हेल्पलाइन",
        vulnerable_areas: "संवेदनशील क्षेत्र", elderly: "बुजुर्ग", children: "बच्चे", disabled: "विकलांग",
        dam_monitoring: "बांध और जलाशय स्थिति", dam_danger: "खतरा", dam_overflow: "ओवरफ्लो",
        report_flood: "बाढ़/जलभराव की रिपोर्ट", report_submitted: "रिपोर्ट जमा ✓",
        waterlogging: "जलभराव का पता चला",
        back: "वापस", refresh: "रिफ्रेश", loading: "लोड हो रहा है...",
        state_analysis: "राज्यवार विश्लेषण", view_all: "सभी देखें",
        current_conditions: "वर्तमान स्थिति", recommendation: "सिफारिश",
        head_north: "सुरक्षित मार्ग से उत्तर की ओर चलें", turn_right_flyover: "फ्लाईओवर पर दाएं मुड़ें",
        avoid_flooded_zone: "⚠️ जलमग्न क्षेत्र से बचें (पानी 2 फीट+)", continue_to: "आगे बढ़ें",
        time_to_impact: "प्रभाव का समय", min_to_shelter: "मिनट आश्रय तक",
        min_to_flood: "मिनट बाढ़ तक", min_buffer: "मिनट अतिरिक्त",
        open_maps: "मैप खोलें", your_location: "आपका स्थान", via_sim_gps: "SIM GPS द्वारा",
        shelters_near: "निकट आश्रय", navigate_here: "यहां नेविगेट करें", maps: "मैप्स",
        open: "खुला", full: "भरा",
        send_sos_alert: "🚨 SOS अलर्ट भेजें",
        sends_sos_desc: "NDRF और 112 को SOS + GPS भेजता है।",
        alert_id: "अलर्ट ID", location: "स्थान", method: "विधि",
        disaster_mgmt: "आपदा प्रबंधन", emergency: "आपातकाल",
        send_safety_status: "SMS द्वारा सुरक्षा स्थिति भेजें",
        send_safety_alert: "📩 सुरक्षा अलर्ट भेजें", family_alerted: "परिवार को सूचित किया ✓",
        sms_gps_sent: "GPS के साथ SMS भेजा गया",
        mom: "माँ", dad: "पिताजी", brother: "भाई",
        priority_notice: "अधिक संवेदनशीलता = पहले निकासी अलर्ट। दिखा रहे हैं",
        vulnerability_hotspots: "संवेदनशीलता हॉटस्पॉट",
        dams_reservoirs_near: "बांध और जलाशय निकट",
        dam_critical: "बांध गंभीर स्थिति में", no_dams: "कोई बांध/जलाशय नहीं",
        river: "नदी", capacity: "क्षमता",
        report_from: "रिपोर्ट", gps_auto: "GPS स्वचालित।",
        type: "प्रकार", drainage_blocked: "नाली अवरुद्ध", road_flooded: "सड़क जलमग्न",
        embankment_breach: "तटबंध टूटा", other: "अन्य",
        upload_photo: "फोटो अपलोड करें", describe_situation: "स्थिति का वर्णन करें...",
        submit_report: "NDRF को रिपोर्ट भेजें", report_sent_desc: "NDRF को रिपोर्ट भेजी गई।",
        hydromet_analytics: "जल-मौसम विश्लेषण", live_conditions: "वर्तमान स्थिति",
        rainfall_24h: "वर्षा (24घं)", temperature: "तापमान",
        soil_moisture: "मिट्टी नमी", wind_speed: "हवा की गति",
        river_discharge: "नदी प्रवाह", seven_day_rain: "7-दिन वर्षा",
        rainfall_trend: "वर्षा प्रवृत्ति (10 दिन)", forecasting_model: "पूर्वानुमान मॉडल",
        model: "मॉडल", sources: "स्रोत", accuracy: "सटीकता",
        infrastructure: "बुनियादी ढांचा", drainage: "जल निकासी", embankment: "तटबंध",
        sim_gps_location: "SIM GPS स्थान",
        how_it_works: "आपका स्थान मोबाइल नेटवर्क सेल टॉवर द्वारा पता लगाया जाता है।",
        current_location: "वर्तमान स्थान", latitude: "अक्षांश", longitude: "देशांतर",
        accuracy_label: "सटीकता", tower_id: "टॉवर ID", signal: "सिग्नल",
        nearest_towers: "निकटतम टॉवर",
        floodmesh_chat: "फ्लडमेश — आपातकालीन चैट", mesh_active: "मेश सक्रिय",
        msgs: "संदेश", mesh_relay_desc: "संदेश BLE/WiFi मेश द्वारा रिले होते हैं · इंटरनेट की जरूरत नहीं",
        broadcast_sos: "SOS प्रसारित करें", type_message: "संदेश टाइप करें...",
        mesh_broadcast_desc: "संदेश सभी मेश नोड्स को प्रसारित · TTL: 7 हॉप्स",
        tap_voice_alert: "वॉइस अलर्ट के लिए टैप करें", score: "स्कोर",
        rain_24h: "वर्षा 24घं", temp: "तापमान", soil: "मिट्टी",
        live: "लाइव", cached: "कैश्ड", offline: "ऑफलाइन",
        dams_near: "निकट बांध", reports_label: "रिपोर्ट",
        copyright: "© 2024 FloodSense AI · NDRF · भारत सरकार",
    },
    bn: {
        citizen_portal: "নাগরিক পোর্টাল", authority_portal: "NDRF / কর্তৃপক্ষ পোর্টাল",
        login: "লগইন", signup: "সাইন আপ", logout: "লগ আউট",
        am_i_safe: "আমি কি নিরাপদ?", you_are_safe: "আপনি নিরাপদ। বন্যার তাৎক্ষণিক ঝুঁকি নেই।",
        danger_alert: "⚠️ বিপদ — এখনই উঁচু জায়গায় যান!",
        moderate_risk: "মাঝারি ঝুঁকি। সতর্ক থাকুন।",
        flood_probability: "বন্যার সম্ভাবনা", quick_actions: "দ্রুত পদক্ষেপ",
        evacuation_route: "নিষ্কাশন পথ", nearby_shelters: "নিকটতম আশ্রয়",
        send_sos: "SOS পাঠান", alert_family: "পরিবারকে সতর্ক করুন",
        active_alerts: "সক্রিয় সতর্কতা", high_risk: "উচ্চ ঝুঁকি", low_risk: "কম ঝুঁকি",
        no_alerts: "কোনো সক্রিয় সতর্কতা নেই।",
        safe_route: "নিকটতম নিরাপদ পথ", avoid_flooded: "প্লাবিত রাস্তা এড়িয়ে চলুন",
        destination: "গন্তব্য", distance: "দূরত্ব",
        emergency_sos: "জরুরি SOS", sos_sent: "SOS সতর্কতা পাঠানো হয়েছে ✓",
        rescue_eta: "উদ্ধার দল ETA: ~১৫ মিনিট", helplines: "সরাসরি হেল্পলাইন",
        vulnerable_areas: "ঝুঁকিপূর্ণ এলাকা", elderly: "বয়স্ক", children: "শিশু", disabled: "প্রতিবন্ধী",
        dam_monitoring: "বাঁধ ও জলাধার অবস্থা", dam_danger: "বিপদ", dam_overflow: "ওভারফ্লো",
        report_flood: "বন্যা/জলাবদ্ধতা রিপোর্ট", report_submitted: "রিপোর্ট জমা ✓",
        waterlogging: "জলাবদ্ধতা শনাক্ত",
        back: "ফিরে যান", refresh: "রিফ্রেশ", loading: "লোড হচ্ছে...",
        state_analysis: "রাজ্যভিত্তিক বিশ্লেষণ", view_all: "সব দেখুন",
        current_conditions: "বর্তমান পরিস্থিতি", recommendation: "সুপারিশ",
        head_north: "নিরাপদ পথে উত্তরে যান", turn_right_flyover: "ফ্লাইওভারে ডানে ঘুরুন",
        avoid_flooded_zone: "⚠️ প্লাবিত এলাকা এড়িয়ে চলুন (পানি ২ ফুট+)", continue_to: "এগিয়ে যান",
        time_to_impact: "প্রভাবের সময়", min_to_shelter: "মিনিট আশ্রয়ে",
        min_to_flood: "মিনিট বন্যায়", min_buffer: "মিনিট বাফার",
        open_maps: "মানচিত্র খুলুন", your_location: "আপনার অবস্থান", via_sim_gps: "SIM GPS দ্বারা",
        shelters_near: "কাছের আশ্রয়", navigate_here: "এখানে নেভিগেট করুন", maps: "মানচিত্র",
        open: "খোলা", full: "পূর্ণ",
        send_sos_alert: "🚨 SOS পাঠান", sends_sos_desc: "NDRF ও 112-এ SOS + GPS পাঠায়।",
        alert_id: "অ্যালার্ট ID", location: "অবস্থান", method: "পদ্ধতি",
        disaster_mgmt: "দুর্যোগ ব্যবস্থাপনা", emergency: "জরুরি",
        send_safety_status: "SMS-এ নিরাপত্তা অবস্থা পাঠান",
        send_safety_alert: "📩 নিরাপত্তা সতর্কতা পাঠান", family_alerted: "পরিবারকে জানানো হয়েছে ✓",
        sms_gps_sent: "GPS সহ SMS পাঠানো হয়েছে", mom: "মা", dad: "বাবা", brother: "ভাই",
        priority_notice: "বেশি ঝুঁকি = আগে সরিয়ে নেওয়া। দেখানো হচ্ছে",
        vulnerability_hotspots: "ঝুঁকিপূর্ণ হটস্পট",
        dams_reservoirs_near: "কাছের বাঁধ ও জলাধার",
        dam_critical: "বাঁধ গুরুতর অবস্থায়", no_dams: "কোনো বাঁধ/জলাধার নেই",
        river: "নদী", capacity: "ধারণক্ষমতা",
        report_from: "রিপোর্ট", gps_auto: "GPS স্বয়ংক্রিয়।",
        type: "ধরন", drainage_blocked: "নর্দমা বন্ধ", road_flooded: "রাস্তা প্লাবিত",
        embankment_breach: "বাঁধ ভাঙা", other: "অন্যান্য",
        upload_photo: "ছবি আপলোড", describe_situation: "পরিস্থিতি বর্ণনা করুন...",
        submit_report: "NDRF-এ রিপোর্ট পাঠান", report_sent_desc: "NDRF-এ রিপোর্ট পাঠানো হয়েছে।",
        hydromet_analytics: "জল-আবহাওয়া বিশ্লেষণ", live_conditions: "বর্তমান পরিস্থিতি",
        rainfall_24h: "বৃষ্টিপাত (২৪ঘণ্টা)", temperature: "তাপমাত্রা",
        soil_moisture: "মাটির আর্দ্রতা", wind_speed: "বায়ু গতি",
        river_discharge: "নদী প্রবাহ", seven_day_rain: "৭-দিন বৃষ্টি",
        rainfall_trend: "বৃষ্টিপাত প্রবণতা (১০ দিন)", forecasting_model: "পূর্বাভাস মডেল",
        model: "মডেল", sources: "উৎস", accuracy: "নির্ভুলতা",
        infrastructure: "অবকাঠামো", drainage: "নিষ্কাশন", embankment: "বাঁধ",
        sim_gps_location: "SIM GPS অবস্থান",
        how_it_works: "মোবাইল নেটওয়ার্ক সেল টাওয়ার দিয়ে আপনার অবস্থান নির্ণয় করা হয়।",
        current_location: "বর্তমান অবস্থান", latitude: "অক্ষাংশ", longitude: "দ্রাঘিমা",
        accuracy_label: "নির্ভুলতা", tower_id: "টাওয়ার ID", signal: "সিগন্যাল",
        nearest_towers: "নিকটতম টাওয়ার",
        floodmesh_chat: "ফ্লাডমেশ — জরুরি চ্যাট", mesh_active: "মেশ সক্রিয়",
        msgs: "বার্তা", mesh_relay_desc: "BLE/WiFi মেশ দিয়ে বার্তা রিলে · ইন্টারনেট লাগে না",
        broadcast_sos: "SOS প্রচার", type_message: "বার্তা টাইপ করুন...",
        mesh_broadcast_desc: "সব মেশ নোডে প্রচার · TTL: ৭ হপ",
        tap_voice_alert: "ভয়েস সতর্কতার জন্য ট্যাপ করুন", score: "স্কোর",
        rain_24h: "বৃষ্টি ২৪ঘণ্টা", temp: "তাপমাত্রা", soil: "মাটি",
        live: "লাইভ", cached: "ক্যাশড", offline: "অফলাইন",
        dams_near: "কাছের বাঁধ", reports_label: "রিপোর্ট",
        copyright: "© ২০২৪ FloodSense AI · NDRF · ভারত সরকার",
    },
    ta: {
        citizen_portal: "குடிமக்கள் போர்டல்", authority_portal: "NDRF / அதிகாரி போர்டல்",
        login: "உள்நுழை", signup: "பதிவு செய்", logout: "வெளியேறு",
        am_i_safe: "நான் பாதுகாப்பாக இருக்கிறேனா?", you_are_safe: "நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள்.",
        danger_alert: "⚠️ ஆபத்து — உடனடியாக உயரமான இடத்திற்கு செல்லுங்கள்!",
        moderate_risk: "மிதமான ஆபத்து. விழிப்புடன் இருங்கள்.",
        flood_probability: "வெள்ள நிகழ்தகவு", quick_actions: "விரைவு நடவடிக்கைகள்",
        evacuation_route: "வெளியேற்ற பாதை", nearby_shelters: "அருகிலுள்ள தங்குமிடங்கள்",
        send_sos: "SOS அனுப்பு", alert_family: "குடும்பத்தை எச்சரி",
        active_alerts: "செயலில் உள்ள எச்சரிக்கைகள்", high_risk: "அதிக ஆபத்து", low_risk: "குறைந்த ஆபத்து",
        no_alerts: "செயலில் எச்சரிக்கைகள் இல்லை.",
        safe_route: "அருகிலுள்ள பாதுகாப்பான பாதை", avoid_flooded: "வெள்ளத்தில் மூழ்கிய சாலைகளை தவிர்க்கவும்",
        destination: "சேருமிடம்", distance: "தூரம்",
        emergency_sos: "அவசர SOS", sos_sent: "SOS எச்சரிக்கை அனுப்பப்பட்டது ✓",
        rescue_eta: "மீட்புக் குழு ETA: ~15 நிமிடங்கள்", helplines: "நேரடி உதவி எண்கள்",
        vulnerable_areas: "பாதிக்கப்படக்கூடிய பகுதிகள்", elderly: "முதியோர்", children: "குழந்தைகள்", disabled: "ஊனமுற்றோர்",
        dam_monitoring: "அணை & நீர்த்தேக்க நிலை", dam_danger: "ஆபத்து", dam_overflow: "வழிந்தோடுதல்",
        report_flood: "வெள்ளம்/நீர்தேக்கம் புகார்", report_submitted: "புகார் சமர்ப்பிக்கப்பட்டது ✓",
        waterlogging: "நீர்தேக்கம் கண்டறியப்பட்டது",
        back: "பின்செல்", refresh: "புதுப்பி", loading: "ஏற்றுகிறது...",
        state_analysis: "மாநில வாரியான பகுப்பாய்வு", view_all: "அனைத்தையும் காட்டு",
        current_conditions: "தற்போதைய நிலைமைகள்", recommendation: "பரிந்துரை",
        head_north: "பாதுகாப்பான பாதையில் வடக்கே செல்லுங்கள்", turn_right_flyover: "மேம்பாலத்தில் வலது திரும்புங்கள்",
        avoid_flooded_zone: "⚠️ வெள்ளப் பகுதியைத் தவிர்க்கவும்", continue_to: "தொடரவும்",
        time_to_impact: "தாக்கத்திற்கான நேரம்", min_to_shelter: "நிமிடம் தங்குமிடம்",
        min_to_flood: "நிமிடம் வெள்ளம்", min_buffer: "நிமிடம் இடைவெளி",
        open_maps: "வரைபடம் திற", your_location: "உங்கள் இருப்பிடம்", via_sim_gps: "SIM GPS வழியாக",
        shelters_near: "அருகிலுள்ள தங்குமிடங்கள்", navigate_here: "இங்கே செல்", maps: "வரைபடம்",
        open: "திறந்தது", full: "நிரம்பியது",
        send_sos_alert: "🚨 SOS அனுப்பு", sends_sos_desc: "NDRF & 112 க்கு SOS அனுப்புகிறது।",
        alert_id: "எச்சரிக்கை ID", location: "இருப்பிடம்", method: "முறை",
        disaster_mgmt: "பேரிடர் மேலாண்மை", emergency: "அவசரம்",
        send_safety_status: "SMS மூலம் பாதுகாப்பு நிலை அனுப்பு",
        send_safety_alert: "📩 பாதுகாப்பு எச்சரிக்கை அனுப்பு", family_alerted: "குடும்பத்திற்கு அறிவிக்கப்பட்டது ✓",
        sms_gps_sent: "GPS உடன் SMS அனுப்பப்பட்டது", mom: "அம்மா", dad: "அப்பா", brother: "சகோதரன்",
        priority_notice: "அதிக பாதிப்பு = முன்கூட்டிய எச்சரிக்கை. காட்டுகிறது",
        vulnerability_hotspots: "பாதிப்பு ஹாட்ஸ்பாட்கள்",
        dams_reservoirs_near: "அருகிலுள்ள அணைகள்", dam_critical: "அணை ஆபத்தான நிலையில்",
        no_dams: "அணைகள் இல்லை", river: "நதி", capacity: "கொள்ளளவு",
        report_from: "அறிக்கை", gps_auto: "GPS தானியங்கி.",
        type: "வகை", drainage_blocked: "வடிகால் அடைப்பு", road_flooded: "சாலை வெள்ளம்",
        embankment_breach: "கரை உடைப்பு", other: "மற்றவை",
        upload_photo: "புகைப்படம் பதிவேற்று", describe_situation: "நிலைமையை விவரிக்கவும்...",
        submit_report: "NDRF க்கு அறிக்கை சமர்ப்பி", report_sent_desc: "NDRF க்கு அறிக்கை அனுப்பப்பட்டது.",
        hydromet_analytics: "நீர்-வானிலை பகுப்பாய்வு", live_conditions: "நிகழ்நிலை",
        rainfall_24h: "மழைப்பொழிவு (24மணி)", temperature: "வெப்பநிலை",
        soil_moisture: "மண் ஈரப்பதம்", wind_speed: "காற்று வேகம்",
        river_discharge: "நதி வெளியேற்றம்", seven_day_rain: "7-நாள் மழை",
        rainfall_trend: "மழை போக்கு (10 நாள்)", forecasting_model: "முன்கணிப்பு மாதிரி",
        model: "மாதிரி", sources: "ஆதாரங்கள்", accuracy: "துல்லியம்",
        infrastructure: "உள்கட்டமைப்பு", drainage: "வடிகால்", embankment: "கரையணை",
        sim_gps_location: "SIM GPS இருப்பிடம்",
        how_it_works: "செல் டவர் மூலம் உங்கள் இருப்பிடம் கண்டறியப்படுகிறது.",
        current_location: "தற்போதைய இருப்பிடம்", latitude: "அட்சரேகை", longitude: "தீர்க்கரேகை",
        accuracy_label: "துல்லியம்", tower_id: "டவர் ID", signal: "சிக்னல்",
        nearest_towers: "அருகிலுள்ள டவர்கள்",
        floodmesh_chat: "ஃப்ளட்மெஷ் — அவசர அரட்டை", mesh_active: "மெஷ் செயலில்",
        msgs: "செய்திகள்", mesh_relay_desc: "BLE/WiFi மெஷ் மூலம் செய்திகள் · இணையம் தேவையில்லை",
        broadcast_sos: "SOS ஒலிபரப்பு", type_message: "செய்தி தட்டச்சு...",
        mesh_broadcast_desc: "அனைத்து மெஷ் நோட்களுக்கும் ஒலிபரப்பு · TTL: 7",
        tap_voice_alert: "குரல் எச்சரிக்கைக்கு தட்டவும்", score: "மதிப்பெண்",
        rain_24h: "மழை 24மணி", temp: "வெப்பம்", soil: "மண்",
        live: "நேரடி", cached: "தற்காலிக", offline: "ஆஃப்லைன்",
        dams_near: "அருகில் அணைகள்", reports_label: "அறிக்கைகள்",
        copyright: "© 2024 FloodSense AI · NDRF · இந்திய அரசு",
    },
    te: {
        citizen_portal: "పౌర పోర్టల్", authority_portal: "NDRF / అధికార పోర్టల్",
        login: "లాగిన్", signup: "సైన్ అప్", logout: "లాగ్ అవుట్",
        am_i_safe: "నేను సురక్షితంగా ఉన్నానా?", you_are_safe: "మీరు సురక్షితంగా ఉన్నారు.",
        danger_alert: "⚠️ ప్రమాదం — వెంటనే ఎత్తైన ప్రాంతానికి వెళ్ళండి!",
        moderate_risk: "మధ్యస్థ ప్రమాదం. అప్రమత్తంగా ఉండండి.",
        flood_probability: "వరద సంభావ్యత", quick_actions: "శీఘ్ర చర్యలు",
        evacuation_route: "తరలింపు మార్గం", nearby_shelters: "సమీపంలోని ఆశ్రయాలు",
        send_sos: "SOS పంపండి", alert_family: "కుటుంబాన్ని హెచ్చరించండి",
        active_alerts: "క్రియాశీల హెచ్చరికలు", high_risk: "అధిక ప్రమాదం", low_risk: "తక్కువ ప్రమాదం",
        no_alerts: "క్రియాశీల హెచ్చరికలు లేవు.",
        safe_route: "సమీపంలోని సురక్షిత మార్గం", avoid_flooded: "వరద నీటిలో మునిగిన రోడ్లను నివారించండి",
        destination: "గమ్యం", distance: "దూరం",
        emergency_sos: "అత్యవసర SOS", sos_sent: "SOS హెచ్చరిక పంపబడింది ✓",
        rescue_eta: "రెస్క్యూ టీమ్ ETA: ~15 నిమిషాలు", helplines: "ప్రత్యక్ష హెల్ప్‌లైన్లు",
        vulnerable_areas: "బాధ్యతాత్మక ప్రాంతాలు", elderly: "వృద్ధులు", children: "పిల్లలు", disabled: "వికలాంగులు",
        dam_monitoring: "ఆనకట్ట & రిజర్వాయర్ స్థితి", dam_danger: "ప్రమాదం", dam_overflow: "ఓవర్‌ఫ్లో",
        report_flood: "వరద/నీటి నిల్వ నివేదన", report_submitted: "నివేదన సమర్పించబడింది ✓",
        waterlogging: "నీటి నిల్వ గుర్తించబడింది",
        back: "వెనుకకు", refresh: "రిఫ్రెష్", loading: "లోడ్ అవుతోంది...",
        state_analysis: "రాష్ట్రవారీ విశ్లేషణ", view_all: "అన్నీ చూడండి",
        current_conditions: "ప్రస్తుత పరిస్థితులు", recommendation: "సిఫారసు",
        head_north: "సురక్షిత మార్గంలో ఉత్తరాన వెళ్ళండి", turn_right_flyover: "ఫ్లైఓవర్‌పై కుడివైపు తిరగండి",
        avoid_flooded_zone: "⚠️ ముంపు ప్రాంతాన్ని నివారించండి", continue_to: "కొనసాగించండి",
        time_to_impact: "ప్రభావ సమయం", min_to_shelter: "నిమిషాలు ఆశ్రయం", min_to_flood: "నిమిషాలు వరద", min_buffer: "నిమిషాలు బఫర్",
        open_maps: "మ్యాప్ తెరవండి", your_location: "మీ స్థానం", via_sim_gps: "SIM GPS ద్వారా",
        shelters_near: "సమీపంలోని ఆశ్రయాలు", navigate_here: "ఇక్కడ నావిగేట్", maps: "మ్యాప్స్", open: "తెరిచి", full: "నిండింది",
        send_sos_alert: "🚨 SOS పంపండి", sends_sos_desc: "NDRF & 112 కు SOS పంపుతుంది.",
        alert_id: "హెచ్చరిక ID", location: "స్థానం", method: "పద్ధతి", disaster_mgmt: "విపత్తు నిర్వహణ", emergency: "అత్యవసరం",
        send_safety_status: "SMS ద్వారా భద్రతా స్థితి పంపండి", send_safety_alert: "📩 భద్రతా హెచ్చరిక పంపండి",
        family_alerted: "కుటుంబానికి తెలియజేయబడింది ✓", sms_gps_sent: "GPS తో SMS పంపబడింది",
        mom: "అమ్మ", dad: "నాన్న", brother: "సోదరుడు",
        priority_notice: "ఎక్కువ బాధ్యత = ముందుగా హెచ్చరిక", vulnerability_hotspots: "బాధ్యత హాట్‌స్పాట్లు",
        dams_reservoirs_near: "సమీపంలోని ఆనకట్టలు", dam_critical: "ఆనకట్ట ప్రమాదకర స్థితిలో",
        no_dams: "ఆనకట్టలు లేవు", river: "నది", capacity: "సామర్థ్యం",
        report_from: "నివేదన", gps_auto: "GPS స్వయంచాలకం.", type: "రకం",
        drainage_blocked: "మురుగు అడ్డుపడింది", road_flooded: "రోడ్డు ముంపు", embankment_breach: "గట్టు తెగింది", other: "ఇతర",
        upload_photo: "ఫోటో అప్‌లోడ్", describe_situation: "పరిస్థితిని వివరించండి...",
        submit_report: "NDRF కు నివేదన పంపండి", report_sent_desc: "NDRF కు నివేదన పంపబడింది.",
        hydromet_analytics: "జల-వాతావరణ విశ్లేషణ", live_conditions: "ప్రస్తుత పరిస్థితులు",
        rainfall_24h: "వర్షపాతం (24గం)", temperature: "ఉష్ణోగ్రత", soil_moisture: "నేల తేమ", wind_speed: "గాలి వేగం",
        river_discharge: "నదీ ప్రవాహం", seven_day_rain: "7-రోజుల వర్షం",
        rainfall_trend: "వర్షపాత ధోరణి (10 రోజులు)", forecasting_model: "అంచనా మోడల్",
        model: "మోడల్", sources: "మూలాలు", accuracy: "ఖచ్చితత్వం",
        infrastructure: "మౌలిక సదుపాయాలు", drainage: "మురుగు", embankment: "గట్టు",
        sim_gps_location: "SIM GPS స్థానం", how_it_works: "సెల్ టవర్ ద్వారా స్థానం గుర్తించబడుతుంది.",
        current_location: "ప్రస్తుత స్థానం", latitude: "అక్షాంశం", longitude: "రేఖాంశం",
        accuracy_label: "ఖచ్చితత్వం", tower_id: "టవర్ ID", signal: "సిగ్నల్", nearest_towers: "సమీప టవర్లు",
        floodmesh_chat: "ఫ్లడ్‌మెష్ — అత్యవసర చాట్", mesh_active: "మెష్ సక్రియం",
        msgs: "సందేశాలు", mesh_relay_desc: "BLE/WiFi మెష్ ద్వారా సందేశాలు · ఇంటర్నెట్ అవసరం లేదు",
        broadcast_sos: "SOS ప్రసారం", type_message: "సందేశం టైప్...", mesh_broadcast_desc: "అన్ని మెష్ నోడ్‌లకు ప్రసారం · TTL: 7",
        tap_voice_alert: "వాయిస్ హెచ్చరిక కోసం ట్యాప్", score: "స్కోర్",
        rain_24h: "వర్షం 24గం", temp: "ఉష్ణం", soil: "నేల", live: "లైవ్", cached: "కాష్", offline: "ఆఫ్‌లైన్",
        dams_near: "సమీప ఆనకట్టలు", reports_label: "నివేదనలు", copyright: "© 2024 FloodSense AI · NDRF · భారత ప్రభుత్వం",
    },
    mr: {
        citizen_portal: "नागरिक पोर्टल", authority_portal: "NDRF / प्राधिकरण पोर्टल",
        login: "लॉगिन", signup: "साइन अप", logout: "लॉग आउट",
        am_i_safe: "मी सुरक्षित आहे का?", you_are_safe: "तुम्ही सुरक्षित आहात.",
        danger_alert: "⚠️ धोका — लगेच उंच ठिकाणी जा!",
        moderate_risk: "मध्यम धोका. सतर्क राहा.",
        flood_probability: "पूर संभाव्यता", quick_actions: "जलद कृती",
        evacuation_route: "निर्वासन मार्ग", nearby_shelters: "जवळचे निवारे",
        send_sos: "SOS पाठवा", alert_family: "कुटुंबाला सूचित करा",
        active_alerts: "सक्रिय सूचना", high_risk: "उच्च धोका", low_risk: "कमी धोका",
        no_alerts: "सक्रिय सूचना नाहीत.",
        safe_route: "जवळचा सुरक्षित मार्ग", avoid_flooded: "पूरग्रस्त रस्ते टाळा",
        destination: "गंतव्य", distance: "अंतर",
        emergency_sos: "आणीबाणी SOS", sos_sent: "SOS सूचना पाठवली ✓",
        rescue_eta: "बचाव पथक ETA: ~15 मिनिटे", helplines: "थेट हेल्पलाइन",
        vulnerable_areas: "संवेदनशील क्षेत्रे", elderly: "ज्येष्ठ", children: "मुले", disabled: "अपंग",
        dam_monitoring: "धरण व जलाशय स्थिती", dam_danger: "धोका", dam_overflow: "ओव्हरफ्लो",
        report_flood: "पूर/जलभराव अहवाल", report_submitted: "अहवाल सादर ✓",
        waterlogging: "जलभराव आढळला",
        back: "मागे", refresh: "रिफ्रेश", loading: "लोड होत आहे...",
        state_analysis: "राज्यनिहाय विश्लेषण", view_all: "सर्व पहा",
        current_conditions: "सध्याची परिस्थिती", recommendation: "शिफारस",
        head_north: "सुरक्षित मार्गाने उत्तरेला जा", turn_right_flyover: "फ्लायओव्हरवर उजवीकडे वळा",
        avoid_flooded_zone: "⚠️ पूरग्रस्त भाग टाळा", continue_to: "पुढे चालू ठेवा",
        time_to_impact: "प्रभावाची वेळ", min_to_shelter: "मिनिटे निवारा", min_to_flood: "मिनिटे पूर", min_buffer: "मिनिटे अतिरिक्त",
        open_maps: "नकाशा उघडा", your_location: "तुमचे स्थान", via_sim_gps: "SIM GPS द्वारे",
        shelters_near: "जवळचे निवारे", navigate_here: "इथे नेव्हिगेट करा", maps: "नकाशे", open: "उघडे", full: "भरलेले",
        send_sos_alert: "🚨 SOS पाठवा", sends_sos_desc: "NDRF आणि 112 ला SOS पाठवतो.",
        alert_id: "सूचना ID", location: "स्थान", method: "पद्धत", disaster_mgmt: "आपत्ती व्यवस्थापन", emergency: "आणीबाणी",
        send_safety_status: "SMS ने सुरक्षा स्थिती पाठवा", send_safety_alert: "📩 सुरक्षा सूचना पाठवा",
        family_alerted: "कुटुंबाला सूचित केले ✓", sms_gps_sent: "GPS सह SMS पाठवला",
        mom: "आई", dad: "बाबा", brother: "भाऊ",
        priority_notice: "अधिक संवेदनशील = आधी सूचना", vulnerability_hotspots: "संवेदनशील हॉटस्पॉट",
        dams_reservoirs_near: "जवळचे धरणे", dam_critical: "धरण गंभीर स्थितीत", no_dams: "कोणतेही धरण नाही",
        river: "नदी", capacity: "क्षमता", report_from: "अहवाल", gps_auto: "GPS स्वयंचलित.",
        type: "प्रकार", drainage_blocked: "गटार बंद", road_flooded: "रस्ता पूरग्रस्त", embankment_breach: "तटबंध फुटला", other: "इतर",
        upload_photo: "फोटो अपलोड", describe_situation: "परिस्थितीचे वर्णन...",
        submit_report: "NDRF ला अहवाल पाठवा", report_sent_desc: "NDRF ला अहवाल पाठवला.",
        hydromet_analytics: "जल-हवामान विश्लेषण", live_conditions: "सध्याची स्थिती",
        rainfall_24h: "पाऊस (24तास)", temperature: "तापमान", soil_moisture: "जमीन ओलावा", wind_speed: "वारा वेग",
        river_discharge: "नदी प्रवाह", seven_day_rain: "7-दिवस पाऊस", rainfall_trend: "पाऊस कल (10 दिवस)",
        forecasting_model: "अंदाज मॉडेल", model: "मॉडेल", sources: "स्रोत", accuracy: "अचूकता",
        infrastructure: "पायाभूत सुविधा", drainage: "गटार", embankment: "तटबंध",
        sim_gps_location: "SIM GPS स्थान", how_it_works: "सेल टॉवरद्वारे तुमचे स्थान शोधले जाते.",
        current_location: "सध्याचे स्थान", latitude: "अक्षांश", longitude: "रेखांश",
        accuracy_label: "अचूकता", tower_id: "टॉवर ID", signal: "सिग्नल", nearest_towers: "जवळचे टॉवर",
        floodmesh_chat: "फ्लडमेश — आणीबाणी चॅट", mesh_active: "मेश सक्रिय",
        msgs: "संदेश", mesh_relay_desc: "BLE/WiFi मेशद्वारे संदेश · इंटरनेट लागत नाही",
        broadcast_sos: "SOS प्रसारित", type_message: "संदेश टाइप...", mesh_broadcast_desc: "सर्व मेश नोड्सला प्रसारित · TTL: 7",
        tap_voice_alert: "व्हॉइस अलर्टसाठी टॅप करा", score: "स्कोर",
        rain_24h: "पाऊस 24तास", temp: "तापमान", soil: "जमीन", live: "लाइव्ह", cached: "कॅश्ड", offline: "ऑफलाइन",
        dams_near: "जवळचे धरणे", reports_label: "अहवाल", copyright: "© 2024 FloodSense AI · NDRF · भारत सरकार",
    },
    gu: {
        citizen_portal: "નાગરિક પોર્ટલ", authority_portal: "NDRF / સત્તામંડળ પોર્ટલ",
        login: "લૉગિન", signup: "સાઇન અપ", logout: "લૉગ આઉટ",
        am_i_safe: "હું સુરક્ષિત છું?", you_are_safe: "તમે સુરક્ષિત છો.",
        danger_alert: "⚠️ જોખમ — તાત્કાલિક ઊંચાઈ પર જાઓ!",
        moderate_risk: "મધ્યમ જોખમ. સતર્ક રહો.",
        flood_probability: "પૂરની સંભાવના", quick_actions: "ઝડપી ક્રિયાઓ",
        evacuation_route: "ખાલી કરાવવાનો માર્ગ", nearby_shelters: "નજીકના આશ્રયસ્થાનો",
        send_sos: "SOS મોકલો", alert_family: "કુટુંબને ચેતવો",
        active_alerts: "સક્રિય ચેતવણીઓ", high_risk: "ઉચ્ચ જોખમ", low_risk: "ઓછું જોખમ",
        no_alerts: "કોઈ સક્રિય ચેતવણીઓ નથી.",
        safe_route: "નજીકનો સુરક્ષિત માર્ગ", avoid_flooded: "પૂરગ્રસ્ત રસ્તાઓ ટાળો",
        destination: "ગંતવ્ય", distance: "અંતર",
        emergency_sos: "કટોકટી SOS", sos_sent: "SOS ચેતવણી મોકલાઈ ✓",
        rescue_eta: "બચાવ ટીમ ETA: ~15 મિનિટ", helplines: "સીધી હેલ્પલાઈન",
        vulnerable_areas: "સંવેદનશીલ વિસ્તારો", elderly: "વૃદ્ધ", children: "બાળકો", disabled: "વિકલાંગ",
        dam_monitoring: "બંધ અને જળાશય સ્થિતિ", dam_danger: "જોખમ", dam_overflow: "ઓવરફ્લો",
        report_flood: "પૂર/જળભરાવ રિપોર્ટ", report_submitted: "રિપોર્ટ સબમિટ ✓",
        waterlogging: "જળભરાવ શોધાયેલ",
        back: "પાછા", refresh: "રિફ્રેશ", loading: "લોડ થઈ રહ્યું...",
        state_analysis: "રાજ્ય મુજબ વિશ્લેષણ", view_all: "બધું જુઓ",
        current_conditions: "વર્તમાન પરિસ્થિતિ", recommendation: "ભલામણ",
        head_north: "સુરક્ષિત માર્ગે ઉત્તર તરફ જાઓ", turn_right_flyover: "ફ્લાયઓવર પર જમણે વળો",
        avoid_flooded_zone: "⚠️ પૂરગ્રસ્ત વિસ્તાર ટાળો", continue_to: "આગળ વધો",
        time_to_impact: "અસરનો સમય", min_to_shelter: "મિનિટ આશ્રય", min_to_flood: "મિનિટ પૂર", min_buffer: "મિનિટ બફર",
        open_maps: "નકશો ખોલો", your_location: "તમારું સ્થાન", via_sim_gps: "SIM GPS દ્વારા",
        shelters_near: "નજીકના આશ્રય", navigate_here: "અહીં નેવિગેટ", maps: "નકશા", open: "ખુલ્લું", full: "ભરેલું",
        send_sos_alert: "🚨 SOS મોકલો", sends_sos_desc: "NDRF અને 112 ને SOS મોકલે છે.",
        alert_id: "ચેતવણી ID", location: "સ્થાન", method: "પદ્ધતિ", disaster_mgmt: "આપત્તિ વ્યવસ્થાપન", emergency: "કટોકટી",
        send_safety_status: "SMS દ્વારા સુરક્ષા સ્થિતિ મોકલો", send_safety_alert: "📩 સુરક્ષા ચેતવણી મોકલો",
        family_alerted: "કુટુંબને જાણ કરાઈ ✓", sms_gps_sent: "GPS સાથે SMS મોકલાયો",
        mom: "મમ્મી", dad: "પપ્પા", brother: "ભાઈ",
        priority_notice: "વધુ સંવેદનશીલ = વહેલી ચેતવણી", vulnerability_hotspots: "સંવેદનશીલ હોટસ્પોટ",
        dams_reservoirs_near: "નજીકના બંધ", dam_critical: "બંધ ગંભીર સ્થિતિમાં", no_dams: "કોઈ બંધ નથી",
        river: "નદી", capacity: "ક્ષમતા", report_from: "રિપોર્ટ", gps_auto: "GPS સ્વચાલિત.",
        type: "પ્રકાર", drainage_blocked: "ગટર બંધ", road_flooded: "રસ્તો પૂરમાં", embankment_breach: "તટબંધ તૂટ્યો", other: "અન્ય",
        upload_photo: "ફોટો અપલોડ", describe_situation: "પરિસ્થિતિ વર્ણવો...",
        submit_report: "NDRF ને રિપોર્ટ મોકલો", report_sent_desc: "NDRF ને રિપોર્ટ મોકલાઈ.",
        hydromet_analytics: "જળ-હવામાન વિશ્લેષણ", live_conditions: "વર્તમાન સ્થિતિ",
        rainfall_24h: "વરસાદ (24કલા)", temperature: "તાપમાન", soil_moisture: "જમીન ભેજ", wind_speed: "પવન ગતિ",
        river_discharge: "નદી પ્રવાહ", seven_day_rain: "7-દિવસ વરસાદ", rainfall_trend: "વરસાદ વલણ (10 દિવસ)",
        forecasting_model: "પૂર્વાનુમાન મોડેલ", model: "મોડેલ", sources: "સ્રોતો", accuracy: "ચોકસાઈ",
        infrastructure: "માળખાકીય સુવિધા", drainage: "ગટર", embankment: "તટબંધ",
        sim_gps_location: "SIM GPS સ્થાન", how_it_works: "સેલ ટાવર દ્વારા તમારું સ્થાન શોધાય છે.",
        current_location: "વર્તમાન સ્થાન", latitude: "અક્ષાંશ", longitude: "રેખાંશ",
        accuracy_label: "ચોકસાઈ", tower_id: "ટાવર ID", signal: "સિગ્નલ", nearest_towers: "નજીકના ટાવર",
        floodmesh_chat: "ફ્લડમેશ — કટોકટી ચેટ", mesh_active: "મેશ સક્રિય",
        msgs: "સંદેશા", mesh_relay_desc: "BLE/WiFi મેશ દ્વારા સંદેશા · ઇન્ટરનેટ જરૂરી નથી",
        broadcast_sos: "SOS પ્રસારિત", type_message: "સંદેશ ટાઇપ...", mesh_broadcast_desc: "બધા મેશ નોડ્સને પ્રસારિત · TTL: 7",
        tap_voice_alert: "વોઇસ ચેતવણી માટે ટેપ", score: "સ્કોર",
        rain_24h: "વરસાદ 24કલા", temp: "તાપમાન", soil: "જમીન", live: "લાઇવ", cached: "કેશ", offline: "ઑફલાઇન",
        dams_near: "નજીકના બંધ", reports_label: "રિપોર્ટ", copyright: "© 2024 FloodSense AI · NDRF · ભારત સરકાર",
    },
    kn: {
        citizen_portal: "ನಾಗರಿಕ ಪೋರ್ಟಲ್", authority_portal: "NDRF / ಅಧಿಕಾರಿ ಪೋರ್ಟಲ್",
        login: "ಲಾಗಿನ್", signup: "ಸೈನ್ ಅಪ್", logout: "ಲಾಗ್ ಔಟ್",
        am_i_safe: "ನಾನು ಸುರಕ್ಷಿತವಾಗಿದ್ದೇನೆಯೇ?", you_are_safe: "ನೀವು ಸುರಕ್ಷಿತ.",
        danger_alert: "⚠️ ಅಪಾಯ — ತಕ್ಷಣ ಎತ್ತರದ ಸ್ಥಳಕ್ಕೆ ಹೋಗಿ!",
        moderate_risk: "ಮಧ್ಯಮ ಅಪಾಯ. ಎಚ್ಚರವಾಗಿರಿ.",
        flood_probability: "ಪ್ರವಾಹ ಸಂಭಾವ್ಯತೆ", quick_actions: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
        evacuation_route: "ಸ್ಥಳಾಂತರ ಮಾರ್ಗ", nearby_shelters: "ಹತ್ತಿರದ ಆಶ್ರಯಗಳು",
        send_sos: "SOS ಕಳುಹಿಸಿ", alert_family: "ಕುಟುಂಬಕ್ಕೆ ಎಚ್ಚರಿಸಿ",
        active_alerts: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು", high_risk: "ಹೆಚ್ಚಿನ ಅಪಾಯ", low_risk: "ಕಡಿಮೆ ಅಪಾಯ",
        no_alerts: "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು ಇಲ್ಲ.",
        safe_route: "ಹತ್ತಿರದ ಸುರಕ್ಷಿತ ಮಾರ್ಗ", avoid_flooded: "ಪ್ರವಾಹಿತ ರಸ್ತೆಗಳನ್ನು ತಪ್ಪಿಸಿ",
        destination: "ಗಮ್ಯಸ್ಥಾನ", distance: "ದೂರ",
        emergency_sos: "ತುರ್ತು SOS", sos_sent: "SOS ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲಾಗಿದೆ ✓",
        rescue_eta: "ರಕ್ಷಣಾ ತಂಡ ETA: ~15 ನಿಮಿಷ", helplines: "ನೇರ ಸಹಾಯವಾಣಿ",
        vulnerable_areas: "ದುರ್ಬಲ ಪ್ರದೇಶಗಳು", elderly: "ವೃದ್ಧರು", children: "ಮಕ್ಕಳು", disabled: "ವಿಕಲಚೇತನರು",
        dam_monitoring: "ಅಣೆಕಟ್ಟು ಸ್ಥಿತಿ", dam_danger: "ಅಪಾಯ", dam_overflow: "ಓವರ್‌ಫ್ಲೋ",
        report_flood: "ಪ್ರವಾಹ ವರದಿ", report_submitted: "ವರದಿ ಸಲ್ಲಿಸಲಾಗಿದೆ ✓",
        waterlogging: "ಜಲನಿಲುಗಡೆ ಪತ್ತೆಯಾಗಿದೆ",
        back: "ಹಿಂದೆ", refresh: "ರಿಫ್ರೆಶ್", loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
        state_analysis: "ರಾಜ್ಯವಾರು ವಿಶ್ಲೇಷಣೆ", view_all: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ",
        current_conditions: "ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿಗಳು", recommendation: "ಶಿಫಾರಸು",
        head_north: "ಸುರಕ್ಷಿತ ಮಾರ್ಗದಲ್ಲಿ ಉತ್ತರಕ್ಕೆ ಹೋಗಿ", turn_right_flyover: "ಫ್ಲೈಓವರ್‌ನಲ್ಲಿ ಬಲಕ್ಕೆ ತಿರುಗಿ",
        avoid_flooded_zone: "⚠️ ಪ್ರವಾಹಿತ ಪ್ರದೇಶ ತಪ್ಪಿಸಿ", continue_to: "ಮುಂದುವರಿಸಿ",
        time_to_impact: "ಪರಿಣಾಮದ ಸಮಯ", min_to_shelter: "ನಿಮಿಷ ಆಶ್ರಯ", min_to_flood: "ನಿಮಿಷ ಪ್ರವಾಹ", min_buffer: "ನಿಮಿಷ ಬಫರ್",
        open_maps: "ನಕ್ಷೆ ತೆರೆಯಿರಿ", your_location: "ನಿಮ್ಮ ಸ್ಥಳ", via_sim_gps: "SIM GPS ಮೂಲಕ",
        shelters_near: "ಹತ್ತಿರದ ಆಶ್ರಯ", navigate_here: "ಇಲ್ಲಿ ನ್ಯಾವಿಗೇಟ್", maps: "ನಕ್ಷೆ", open: "ತೆರೆದಿದೆ", full: "ತುಂಬಿದೆ",
        send_sos_alert: "🚨 SOS ಕಳುಹಿಸಿ", sends_sos_desc: "NDRF & 112 ಗೆ SOS ಕಳುಹಿಸುತ್ತದೆ.",
        alert_id: "ಎಚ್ಚರಿಕೆ ID", location: "ಸ್ಥಳ", method: "ವಿಧಾನ", disaster_mgmt: "ವಿಪತ್ತು ನಿರ್ವಹಣೆ", emergency: "ತುರ್ತು",
        send_safety_status: "SMS ಮೂಲಕ ಸುರಕ್ಷತೆ ಕಳುಹಿಸಿ", send_safety_alert: "📩 ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ",
        family_alerted: "ಕುಟುಂಬಕ್ಕೆ ತಿಳಿಸಲಾಗಿದೆ ✓", sms_gps_sent: "GPS ಜೊತೆ SMS ಕಳುಹಿಸಲಾಗಿದೆ",
        mom: "ಅಮ್ಮ", dad: "ಅಪ್ಪ", brother: "ಸಹೋದರ",
        priority_notice: "ಹೆಚ್ಚಿನ ದುರ್ಬಲತೆ = ಮೊದಲು ಎಚ್ಚರಿಕೆ", vulnerability_hotspots: "ದುರ್ಬಲ ಹಾಟ್‌ಸ್ಪಾಟ್",
        dams_reservoirs_near: "ಹತ್ತಿರದ ಅಣೆಕಟ್ಟುಗಳು", dam_critical: "ಅಣೆಕಟ್ಟು ಅಪಾಯದಲ್ಲಿ", no_dams: "ಅಣೆಕಟ್ಟುಗಳು ಇಲ್ಲ",
        river: "ನದಿ", capacity: "ಸಾಮರ್ಥ್ಯ", report_from: "ವರದಿ", gps_auto: "GPS ಸ್ವಯಂಚಾಲಿತ.",
        type: "ವಿಧ", drainage_blocked: "ಚರಂಡಿ ಮುಚ್ಚಿದೆ", road_flooded: "ರಸ್ತೆ ಮುಳುಗಿದೆ", embankment_breach: "ಒಡ್ಡು ಒಡೆದಿದೆ", other: "ಇತರ",
        upload_photo: "ಫೋಟೋ ಅಪ್‌ಲೋಡ್", describe_situation: "ಪರಿಸ್ಥಿತಿ ವಿವರಿಸಿ...",
        submit_report: "NDRF ಗೆ ವರದಿ ಕಳುಹಿಸಿ", report_sent_desc: "NDRF ಗೆ ವರದಿ ಕಳುಹಿಸಲಾಗಿದೆ.",
        hydromet_analytics: "ಜಲ-ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ", live_conditions: "ಪ್ರಸ್ತುತ ಪರಿಸ್ಥಿತಿ",
        rainfall_24h: "ಮಳೆ (24ಗಂ)", temperature: "ತಾಪಮಾನ", soil_moisture: "ಮಣ್ಣಿನ ತೇವ", wind_speed: "ಗಾಳಿ ವೇಗ",
        river_discharge: "ನದಿ ಹರಿವು", seven_day_rain: "7-ದಿನ ಮಳೆ", rainfall_trend: "ಮಳೆ ಪ್ರವೃತ್ತಿ (10 ದಿನ)",
        forecasting_model: "ಮುನ್ಸೂಚನೆ ಮಾದರಿ", model: "ಮಾದರಿ", sources: "ಮೂಲಗಳು", accuracy: "ನಿಖರತೆ",
        infrastructure: "ಮೂಲಸೌಕರ್ಯ", drainage: "ಚರಂಡಿ", embankment: "ಒಡ್ಡು",
        sim_gps_location: "SIM GPS ಸ್ಥಳ", how_it_works: "ಸೆಲ್ ಟವರ್ ಮೂಲಕ ಸ್ಥಳ ಪತ್ತೆ.",
        current_location: "ಪ್ರಸ್ತುತ ಸ್ಥಳ", latitude: "ಅಕ್ಷಾಂಶ", longitude: "ರೇಖಾಂಶ",
        accuracy_label: "ನಿಖರತೆ", tower_id: "ಟವರ್ ID", signal: "ಸಿಗ್ನಲ್", nearest_towers: "ಹತ್ತಿರದ ಟವರ್",
        floodmesh_chat: "ಫ್ಲಡ್‌ಮೆಶ್ — ತುರ್ತು ಚಾಟ್", mesh_active: "ಮೆಶ್ ಸಕ್ರಿಯ",
        msgs: "ಸಂದೇಶಗಳು", mesh_relay_desc: "BLE/WiFi ಮೆಶ್ ಮೂಲಕ ಸಂದೇಶ · ಇಂಟರ್ನೆಟ್ ಬೇಡ",
        broadcast_sos: "SOS ಪ್ರಸಾರ", type_message: "ಸಂದೇಶ ಟೈಪ್...", mesh_broadcast_desc: "ಎಲ್ಲ ನೋಡ್‌ಗಳಿಗೆ ಪ್ರಸಾರ · TTL: 7",
        tap_voice_alert: "ಧ್ವನಿ ಎಚ್ಚರಿಕೆಗೆ ಟ್ಯಾಪ್", score: "ಸ್ಕೋರ್",
        rain_24h: "ಮಳೆ 24ಗಂ", temp: "ತಾಪ", soil: "ಮಣ್ಣು", live: "ಲೈವ್", cached: "ಕ್ಯಾಶ್", offline: "ಆಫ್‌ಲೈನ್",
        dams_near: "ಹತ್ತಿರದ ಅಣೆಕಟ್ಟು", reports_label: "ವರದಿ", copyright: "© 2024 FloodSense AI · NDRF · ಭಾರತ ಸರ್ಕಾರ",
    },
    ml: {
        citizen_portal: "പൗര പോർട്ടൽ", authority_portal: "NDRF / അധികാരി പോർട്ടൽ",
        login: "ലോഗിൻ", signup: "സൈൻ അപ്പ്", logout: "ലോഗ് ഔട്ട്",
        am_i_safe: "ഞാൻ സുരക്ഷിതനാണോ?", you_are_safe: "നിങ്ങൾ സുരക്ഷിതരാണ്.",
        danger_alert: "⚠️ അപകടം — ഉടൻ ഉയർന്ന പ്രദേശത്തേക്ക് മാറുക!",
        moderate_risk: "മധ്യ അപകടം. ജാഗ്രത പാലിക്കുക.",
        flood_probability: "വെള്ളപ്പൊക്ക സാധ്യത", quick_actions: "ദ്രുത നടപടികൾ",
        evacuation_route: "ഒഴിപ്പിക്കൽ പാത", nearby_shelters: "അടുത്തുള്ള ഷെൽട്ടറുകൾ",
        send_sos: "SOS അയയ്ക്കുക", alert_family: "കുടുംബത്തെ അറിയിക്കുക",
        active_alerts: "സജീവ മുന്നറിയിപ്പുകൾ", high_risk: "ഉയർന്ന അപകടം", low_risk: "കുറഞ്ഞ അപകടം",
        no_alerts: "സജീവ മുന്നറിയിപ്പുകൾ ഇല്ല.",
        safe_route: "അടുത്തുള്ള സുരക്ഷിത പാത", avoid_flooded: "വെള്ളം കയറിയ റോഡുകൾ ഒഴിവാക്കുക",
        destination: "ലക്ഷ്യം", distance: "ദൂരം",
        emergency_sos: "അടിയന്തര SOS", sos_sent: "SOS മുന്നറിയിപ്പ് അയച്ചു ✓",
        rescue_eta: "രക്ഷാ ടീം ETA: ~15 മിനിറ്റ്", helplines: "നേരിട്ട് ഹെൽപ്‌ലൈൻ",
        vulnerable_areas: "ദുർബല പ്രദേശങ്ങൾ", elderly: "വൃദ്ധർ", children: "കുട്ടികൾ", disabled: "വികലാംഗർ",
        dam_monitoring: "ഡാം & റിസർവോയർ സ്ഥിതി", dam_danger: "അപകടം", dam_overflow: "ഓവർഫ്ലോ",
        report_flood: "വെള്ളപ്പൊക്ക റിപ്പോർട്ട്", report_submitted: "റിപ്പോർട്ട് സമർപ്പിച്ചു ✓",
        waterlogging: "ജലസ്തംഭനം കണ്ടെത്തി",
        back: "മടങ്ങുക", refresh: "പുതുക്കുക", loading: "ലോഡ് ചെയ്യുന്നു...",
        state_analysis: "സംസ്ഥാന വിശകലനം", view_all: "എല്ലാം കാണുക",
        current_conditions: "നിലവിലെ സാഹചര്യങ്ങൾ", recommendation: "ശിഫാർശ",
        head_north: "सुरक्षित मार्ग से उत्तर की ओर चलें", turn_right_flyover: "फ्लाईओवर पर दाएं मुड़ें",
        avoid_flooded_zone: "⚠️ जलमग्न क्षेत्र से बचें (पानी 2 फीट+)", continue_to: "आगे बढ़ें",
        time_to_impact: "प्रभाव का समय", min_to_shelter: "मिनट आश्रय तक",
        min_to_flood: "मिनट बाढ़ तक", min_buffer: "मिनट अतिरिक्त",
        open_maps: "मैप खोलें", your_location: "आपका स्थान", via_sim_gps: "SIM GPS द्वारा",
        shelters_near: "निकट आश्रय", navigate_here: "यहां नेविगेट करें", maps: "मैप्स",
        open: "खुला", full: "भरा",
        send_sos_alert: "🚨 SOS अलर्ट भेजें",
        sends_sos_desc: "NDRF और 112 को SOS + GPS भेजता है।",
        alert_id: "अलर्ट ID", location: "स्थान", method: "विधि",
        disaster_mgmt: "आपदा प्रबंधन", emergency: "आपातकाल",
        send_safety_status: "SMS द्वारा सुरक्षा स्थिति भेजें",
        send_safety_alert: "📩 सुरक्षा अलर्ट भेजें", family_alerted: "परिवार को सूचित किया ✓",
        sms_gps_sent: "GPS के साथ SMS भेजा गया",
        mom: "माँ", dad: "पिताजी", brother: "भाई",
        priority_notice: "अधिक संवेदनशीलता = पहले निकासी अलर्ट। दिखा रहे हैं",
        vulnerability_hotspots: "संवेदनशीलता हॉटस्पॉट",
        dams_reservoirs_near: "बांध और जलाशय निकट",
        dam_critical: "बांध गंभीर स्थिति में", no_dams: "कोई बांध/जलाशय नहीं",
        river: "नदी", capacity: "क्षमता",
        report_from: "रिपोर्ट", gps_auto: "GPS स्वचालित।",
        type: "प्रकार", drainage_blocked: "नाली अवरुद्ध", road_flooded: "सड़क जलमग्न",
        embankment_breach: "तटबंध टूटा", other: "अन्य",
        upload_photo: "फोटो अपलोड करें", describe_situation: "स्थिति का वर्णन करें...",
        submit_report: "NDRF को रिपोर्ट भेजें", report_sent_desc: "NDRF को रिपोर्ट भेजी गई।",
        hydromet_analytics: "जल-मौसम विश्लेषण", live_conditions: "वर्तमान स्थिति",
        rainfall_24h: "वर्षा (24घं)", temperature: "तापमान",
        soil_moisture: "मिट्टी नमी", wind_speed: "हवा की गति",
        river_discharge: "नदी प्रवाह", seven_day_rain: "7-दिन वर्षा",
        rainfall_trend: "वर्षा प्रवृत्ति (10 दिन)", forecasting_model: "पूर्वानुमान मॉडल",
        model: "मॉडल", sources: "स्रोत", accuracy: "सटीकता",
        infrastructure: "बुनियादी ढांचा", drainage: "जल निकासी", embankment: "तटबंध",
        sim_gps_location: "SIM GPS स्थान",
        how_it_works: "आपका स्थान मोबाइल नेटवर्क सेल टॉवर द्वारा पता लगाया जाता है।",
        current_location: "वर्तमान स्थान", latitude: "अक्षांश", longitude: "देशांतर",
        accuracy_label: "सटीकता", tower_id: "टॉवर ID", signal: "सिग्नल",
        nearest_towers: "निकटतम टॉवर",
        floodmesh_chat: "फ्लडमेश — आपातकालीन चैट", mesh_active: "मेश सक्रिय",
        msgs: "संदेश", mesh_relay_desc: "संदेश BLE/WiFi मेश द्वारा रिले होते हैं · इंटरनेट की जरूरत नहीं",
        broadcast_sos: "SOS प्रसारित करें", type_message: "संदेश टाइप करें...",
        mesh_broadcast_desc: "संदेश सभी मेश नोड्स को प्रसारित · TTL: 7 हॉप्स",
        tap_voice_alert: "वॉइस अलर्ट के लिए टैप करें", score: "स्कोर",
        rain_24h: "वर्षा 24घं", temp: "तापमान", soil: "मिट्टी",
        live: "लाइव", cached: "कैश्ड", offline: "ऑफलाइन",
        dams_near: "निकट बांध", reports_label: "रिपोर्ट",
        copyright: "© 2024 FloodSense AI · NDRF · भारत सरकार",
    },
    pa: {
        citizen_portal: "ਨਾਗਰਿਕ ਪੋਰਟਲ", authority_portal: "NDRF / ਅਥਾਰਟੀ ਪੋਰਟਲ",
        login: "ਲੌਗਇਨ", signup: "ਸਾਈਨ ਅੱਪ", logout: "ਲੌਗ ਆਊਟ",
        am_i_safe: "ਕੀ ਮੈਂ ਸੁਰੱਖਿਅਤ ਹਾਂ?", you_are_safe: "ਤੁਸੀਂ ਸੁਰੱਖਿਅਤ ਹੋ.",
        danger_alert: "⚠️ ਖ਼ਤਰਾ — ਤੁਰੰਤ ਉੱਚੀ ਥਾਂ ਤੇ ਜਾਓ!",
        moderate_risk: "ਦਰਮਿਆਨਾ ਖ਼ਤਰਾ. ਸੁਚੇਤ ਰਹੋ.",
        flood_probability: "ਹੜ੍ਹ ਦੀ ਸੰਭਾਵਨਾ", quick_actions: "ਤੁਰੰਤ ਕਾਰਵਾਈ",
        evacuation_route: "ਨਿਕਾਸੀ ਰਸਤਾ", nearby_shelters: "ਨੇੜੇ ਦੇ ਆਸਰੇ",
        send_sos: "SOS ਭੇਜੋ", alert_family: "ਪਰਿਵਾਰ ਨੂੰ ਚੇਤਾਵਨੀ",
        active_alerts: "ਸਰਗਰਮ ਚੇਤਾਵਨੀਆਂ", high_risk: "ਉੱਚ ਖ਼ਤਰਾ", low_risk: "ਘੱਟ ਖ਼ਤਰਾ",
        no_alerts: "ਕੋਈ ਸਰਗਰਮ ਚੇਤਾਵਨੀ ਨਹੀਂ.",
        safe_route: "ਨੇੜੇ ਸੁਰੱਖਿਅਤ ਰਸਤਾ", avoid_flooded: "ਪਾਣੀ ਨਾਲ ਭਰੀਆਂ ਸੜਕਾਂ ਤੋਂ ਬਚੋ",
        destination: "ਮੰਜ਼ਿਲ", distance: "ਦੂਰੀ",
        emergency_sos: "ਐਮਰਜੈਂਸੀ SOS", sos_sent: "SOS ਚੇਤਾਵਨੀ ਭੇਜੀ ✓",
        rescue_eta: "ਬਚਾਅ ਟੀਮ ETA: ~15 ਮਿੰਟ", helplines: "ਸਿੱਧੀ ਹੈਲਪਲਾਈਨ",
        vulnerable_areas: "ਸੰਵੇਦਨਸ਼ੀਲ ਖੇਤਰ", elderly: "ਬਜ਼ੁਰਗ", children: "ਬੱਚੇ", disabled: "ਅਪਾਹਜ",
        dam_monitoring: "ਡੈਮ ਅਤੇ ਜਲਾਸ਼ਯ ਸਥਿਤੀ", dam_danger: "ਖ਼ਤਰਾ", dam_overflow: "ਓਵਰਫਲੋ",
        report_flood: "ਹੜ੍ਹ/ਪਾਣੀ ਭਰਨ ਦੀ ਰਿਪੋਰਟ", report_submitted: "ਰਿਪੋਰਟ ਜਮ੍ਹਾ ✓",
        waterlogging: "ਪਾਣੀ ਭਰਨ ਦਾ ਪਤਾ ਲੱਗਿਆ",
        back: "ਪਿੱਛੇ", refresh: "ਤਾਜ਼ਾ ਕਰੋ", loading: "ਲੋਡ ਹੋ ਰਿਹਾ...",
        state_analysis: "ਰਾਜ ਅਨੁਸਾਰ ਵਿਸ਼ਲੇਸ਼ਣ", view_all: "ਸਭ ਵੇਖੋ",
        current_conditions: "ਮੌਜੂਦਾ ਸਥਿਤੀ", recommendation: "ਸਿਫਾਰਿਸ਼",
        head_north: "सुरक्षित मार्ग से उत्तर की ओर चलें", turn_right_flyover: "फ्लाईओवर पर दाएं मुड़ें",
        avoid_flooded_zone: "⚠️ जलमग्न क्षेत्र से बचें (पानी 2 फीट+)", continue_to: "आगे बढ़ें",
        time_to_impact: "प्रभाव का समय", min_to_shelter: "मिनट आश्रय तक",
        min_to_flood: "मिनट बाढ़ तक", min_buffer: "मिनट अतिरिक्त",
        open_maps: "मैप खोलें", your_location: "आपका स्थान", via_sim_gps: "SIM GPS द्वारा",
        shelters_near: "निकट आश्रय", navigate_here: "यहां नेविगेट करें", maps: "मैप्स",
        open: "खुला", full: "भरा",
        send_sos_alert: "🚨 SOS अलर्ट भेजें",
        sends_sos_desc: "NDRF और 112 को SOS + GPS भेजता है।",
        alert_id: "अलर्ट ID", location: "स्थान", method: "विधि",
        disaster_mgmt: "आपदा प्रबंधन", emergency: "आपातकाल",
        send_safety_status: "SMS द्वारा सुरक्षा स्थिति भेजें",
        send_safety_alert: "📩 सुरक्षा अलर्ट भेजें", family_alerted: "परिवार को सूचित किया ✓",
        sms_gps_sent: "GPS के साथ SMS भेजा गया",
        mom: "माँ", dad: "पिताजी", brother: "भाई",
        priority_notice: "अधिक संवेदनशीलता = पहले निकासी अलर्ट। दिखा रहे हैं",
        vulnerability_hotspots: "संवेदनशीलता हॉटस्पॉट",
        dams_reservoirs_near: "बांध और जलाशय निकट",
        dam_critical: "बांध गंभीर स्थिति में", no_dams: "कोई बांध/जलाशय नहीं",
        river: "नदी", capacity: "क्षमता",
        report_from: "रिपोर्ट", gps_auto: "GPS स्वचालित।",
        type: "प्रकार", drainage_blocked: "नाली अवरुद्ध", road_flooded: "सड़क जलमग्न",
        embankment_breach: "तटबंध टूटा", other: "अन्य",
        upload_photo: "फोटो अपलोड करें", describe_situation: "स्थिति का वर्णन करें...",
        submit_report: "NDRF को रिपोर्ट भेजें", report_sent_desc: "NDRF को रिपोर्ट भेजी गई।",
        hydromet_analytics: "जल-मौसम विश्लेषण", live_conditions: "वर्तमान स्थिति",
        rainfall_24h: "वर्षा (24घं)", temperature: "तापमान",
        soil_moisture: "मिट्टी नमी", wind_speed: "हवा की गति",
        river_discharge: "नदी प्रवाह", seven_day_rain: "7-दिन वर्षा",
        rainfall_trend: "वर्षा प्रवृत्ति (10 दिन)", forecasting_model: "पूर्वानुमान मॉडल",
        model: "मॉडल", sources: "स्रोत", accuracy: "सटीकता",
        infrastructure: "बुनियादी ढांचा", drainage: "जल निकासी", embankment: "तटबंध",
        sim_gps_location: "SIM GPS स्थान",
        how_it_works: "आपका स्थान मोबाइल नेटवर्क सेल टॉवर द्वारा पता लगाया जाता है।",
        current_location: "वर्तमान स्थान", latitude: "अक्षांश", longitude: "देशांतर",
        accuracy_label: "सटीकता", tower_id: "टॉवर ID", signal: "सिग्नल",
        nearest_towers: "निकटतम टॉवर",
        floodmesh_chat: "फ्लडमेश — आपातकालीन चैट", mesh_active: "मेश सक्रिय",
        msgs: "संदेश", mesh_relay_desc: "संदेश BLE/WiFi मेश द्वारा रिले होते हैं · इंटरनेट की जरूरत नहीं",
        broadcast_sos: "SOS प्रसारित करें", type_message: "संदेश टाइप करें...",
        mesh_broadcast_desc: "संदेश सभी मेश नोड्स को प्रसारित · TTL: 7 हॉप्स",
        tap_voice_alert: "वॉइस अलर्ट के लिए टैप करें", score: "स्कोर",
        rain_24h: "वर्षा 24घं", temp: "तापमान", soil: "मिट्टी",
        live: "लाइव", cached: "कैश्ड", offline: "ऑफलाइन",
        dams_near: "निकट बांध", reports_label: "रिपोर्ट",
        copyright: "© 2024 FloodSense AI · NDRF · भारत सरकार",
    },
    as: {
        citizen_portal: "নাগৰিক পৰ্টেল", authority_portal: "NDRF / কৰ্তৃপক্ষ পৰ্টেল",
        login: "লগইন", signup: "চাইন আপ", logout: "লগ আউট",
        am_i_safe: "মই সুৰক্ষিত নে?", you_are_safe: "আপুনি সুৰক্ষিত।",
        danger_alert: "⚠️ বিপদ — তৎক্ষণাত ওপৰলৈ যাওক!",
        moderate_risk: "মধ্যমীয়া বিপদ। সতৰ্ক থাকক।",
        flood_probability: "বানপানীৰ সম্ভাৱনা", quick_actions: "দ্ৰুত পদক্ষেপ",
        evacuation_route: "নিষ্কাশন পথ", nearby_shelters: "ওচৰৰ আশ্ৰয়",
        send_sos: "SOS পঠাওক", alert_family: "পৰিয়ালক সতৰ্ক কৰক",
        active_alerts: "সক্ৰিয় সতৰ্কবাণী", high_risk: "উচ্চ বিপদ", low_risk: "কম বিপদ",
        no_alerts: "কোনো সতৰ্কবাণী নাই।",
        safe_route: "ওচৰৰ সুৰক্ষিত পথ", avoid_flooded: "পানীত বুৰি যোৱা ৰাস্তা এৰক",
        destination: "গন্তব্য", distance: "দূৰত্ব",
        emergency_sos: "জৰুৰীকালীন SOS", sos_sent: "SOS পঠোৱা হৈছে ✓",
        rescue_eta: "উদ্ধাৰ দল ETA: ~১৫ মিনিট", helplines: "পোনপটীয়া হেল্পলাইন",
        vulnerable_areas: "দুৰ্বল অঞ্চল", elderly: "বৃদ্ধ", children: "শিশু", disabled: "বিকলাঙ্গ",
        dam_monitoring: "বান্ধ আৰু জলাশয়ৰ অৱস্থা", dam_danger: "বিপদ", dam_overflow: "ওভাৰফ্লো",
        report_flood: "বানপানী ৰিপোৰ্ট", report_submitted: "ৰিপোৰ্ট দাখিল ✓",
        waterlogging: "জলাবদ্ধতা ধৰা পৰিছে",
        back: "উভতি যাওক", refresh: "ৰিফ্ৰেছ", loading: "ল'ড হৈ আছে...",
        state_analysis: "ৰাজ্যভিত্তিক বিশ্লেষণ", view_all: "সকলো চাওক",
        current_conditions: "বৰ্তমান অৱস্থা", recommendation: "পৰামৰ্শ",
        head_north: "सुरक्षित मार्ग से उत्तर की ओर चलें", turn_right_flyover: "फ्लाईओवर पर दाएं मुड़ें",
        avoid_flooded_zone: "⚠️ जलमग्न क्षेत्र से बचें (पानी 2 फीट+)", continue_to: "आगे बढ़ें",
        time_to_impact: "प्रभाव का समय", min_to_shelter: "मिनट आश्रय तक",
        min_to_flood: "मिनट बाढ़ तक", min_buffer: "मिनट अतिरिक्त",
        open_maps: "मैप खोलें", your_location: "आपका स्थान", via_sim_gps: "SIM GPS द्वारा",
        shelters_near: "निकट आश्रय", navigate_here: "यहां नेविगेट करें", maps: "मैप्स",
        open: "खुला", full: "भरा",
        send_sos_alert: "🚨 SOS अलर्ट भेजें",
        sends_sos_desc: "NDRF और 112 को SOS + GPS भेजता है।",
        alert_id: "अलर्ट ID", location: "स्थान", method: "विधि",
        disaster_mgmt: "आपदा प्रबंधन", emergency: "आपातकाल",
        send_safety_status: "SMS द्वारा सुरक्षा स्थिति भेजें",
        send_safety_alert: "📩 सुरक्षा अलर्ट भेजें", family_alerted: "परिवार को सूचित किया ✓",
        sms_gps_sent: "GPS के साथ SMS भेजा गया",
        mom: "माँ", dad: "पिताजी", brother: "भाई",
        priority_notice: "अधिक संवेदनशीलता = पहले निकासी अलर्ट। दिखा रहे हैं",
        vulnerability_hotspots: "संवेदनशीलता हॉटस्पॉट",
        dams_reservoirs_near: "बांध और जलाशय निकट",
        dam_critical: "बांध गंभीर स्थिति में", no_dams: "कोई बांध/जलाशय नहीं",
        river: "नदी", capacity: "क्षमता",
        report_from: "रिपोर्ट", gps_auto: "GPS स्वचालित।",
        type: "प्रकार", drainage_blocked: "नाली अवरुद्ध", road_flooded: "सड़क जलमग्न",
        embankment_breach: "तटबंध टूटा", other: "अन्य",
        upload_photo: "फोटो अपलोड करें", describe_situation: "स्थिति का वर्णन करें...",
        submit_report: "NDRF को रिपोर्ट भेजें", report_sent_desc: "NDRF को रिपोर्ट भेजी गई।",
        hydromet_analytics: "जल-मौसम विश्लेषण", live_conditions: "वर्तमान स्थिति",
        rainfall_24h: "वर्षा (24घं)", temperature: "तापमान",
        soil_moisture: "मिट्टी नमी", wind_speed: "हवा की गति",
        river_discharge: "नदी प्रवाह", seven_day_rain: "7-दिन वर्षा",
        rainfall_trend: "वर्षा प्रवृत्ति (10 दिन)", forecasting_model: "पूर्वानुमान मॉडल",
        model: "मॉडल", sources: "स्रोत", accuracy: "सटीकता",
        infrastructure: "बुनियादी ढांचा", drainage: "जल निकासी", embankment: "तटबंध",
        sim_gps_location: "SIM GPS स्थान",
        how_it_works: "आपका स्थान मोबाइल नेटवर्क सेल टॉवर द्वारा पता लगाया जाता है।",
        current_location: "वर्तमान स्थान", latitude: "अक्षांश", longitude: "देशांतर",
        accuracy_label: "सटीकता", tower_id: "टॉवर ID", signal: "सिग्नल",
        nearest_towers: "निकटतम टॉवर",
        floodmesh_chat: "फ्लडमेश — आपातकालीन चैट", mesh_active: "मेश सक्रिय",
        msgs: "संदेश", mesh_relay_desc: "संदेश BLE/WiFi मेश द्वारा रिले होते हैं · इंटरनेट की जरूरत नहीं",
        broadcast_sos: "SOS प्रसारित करें", type_message: "संदेश टाइप करें...",
        mesh_broadcast_desc: "संदेश सभी मेश नोड्स को प्रसारित · TTL: 7 हॉप्स",
        tap_voice_alert: "वॉइस अलर्ट के लिए टैप करें", score: "स्कोर",
        rain_24h: "वर्षा 24घं", temp: "तापमान", soil: "मिट्टी",
        live: "लाइव", cached: "कैश्ड", offline: "ऑफलाइन",
        dams_near: "निकट बांध", reports_label: "रिपोर्ट",
        copyright: "© 2024 FloodSense AI · NDRF · भारत सरकार",
    },
    or: {
        citizen_portal: "ନାଗରିକ ପୋର୍ଟାଲ", authority_portal: "NDRF / ଅଧିକାରୀ ପୋର୍ଟାଲ",
        login: "ଲଗଇନ", signup: "ସାଇନ ଅପ", logout: "ଲଗ ଆଉଟ",
        am_i_safe: "ମୁଁ ସୁରକ୍ଷିତ କି?", you_are_safe: "ଆପଣ ସୁରକ୍ଷିତ ଅଛନ୍ତି।",
        danger_alert: "⚠️ ବିପଦ — ତୁରନ୍ତ ଉଚ୍ଚ ସ୍ଥାନକୁ ଯାଆନ୍ତୁ!",
        moderate_risk: "ମଧ୍ୟମ ବିପଦ। ସତର୍କ ରୁହନ୍ତୁ।",
        flood_probability: "ବନ୍ୟା ସମ୍ଭାବନା", quick_actions: "ଦ୍ରୁତ ପଦକ୍ଷେପ",
        evacuation_route: "ନିଷ୍କାସନ ପଥ", nearby_shelters: "ନିକଟବର୍ତ୍ତୀ ଆଶ୍ରୟ",
        send_sos: "SOS ପଠାନ୍ତୁ", alert_family: "ପରିବାରକୁ ସତର୍କ କରନ୍ତୁ",
        active_alerts: "ସକ୍ରିୟ ସତର୍କତା", high_risk: "ଅଧିକ ବିପଦ", low_risk: "କମ୍ ବିପଦ",
        no_alerts: "କୌଣସି ସକ୍ରିୟ ସତର୍କତା ନାହିଁ।",
        safe_route: "ନିକଟତମ ସୁରକ୍ଷିତ ପଥ", avoid_flooded: "ବନ୍ୟାପ୍ଲାବିତ ରାସ୍ତା ଏଡ଼ାନ୍ତୁ",
        destination: "ଗନ୍ତବ୍ୟ", distance: "ଦୂରତା",
        emergency_sos: "ଜରୁରୀ SOS", sos_sent: "SOS ପଠାଗଲା ✓",
        rescue_eta: "ଉଦ୍ଧାର ଦଳ ETA: ~15 ମିନିଟ", helplines: "ସିଧା ହେଲ୍ପଲାଇନ",
        vulnerable_areas: "ସଂବେଦନଶୀଳ ଅଞ୍ଚଳ", elderly: "ବୃଦ୍ଧ", children: "ଶିଶୁ", disabled: "ବିକଳାଙ୍ଗ",
        dam_monitoring: "ବନ୍ଧ ଓ ଜଳାଶୟ ସ୍ଥିତି", dam_danger: "ବିପଦ", dam_overflow: "ଓଭରଫ୍ଲୋ",
        report_flood: "ବନ୍ୟା/ଜଳାବଦ୍ଧତା ରିପୋର୍ଟ", report_submitted: "ରିପୋର୍ଟ ଦାଖଲ ✓",
        waterlogging: "ଜଳାବଦ୍ଧତା ଚିହ୍ନଟ",
        back: "ପଛକୁ", refresh: "ରିଫ୍ରେଶ", loading: "ଲୋଡ ହେଉଛି...",
        state_analysis: "ରାଜ୍ୟ ଅନୁଯାୟୀ ବିଶ୍ଳେଷଣ", view_all: "ସବୁ ଦେଖନ୍ତୁ",
        current_conditions: "ବର୍ତ୍ତମାନ ସ୍ଥିତି", recommendation: "ସୁପାରିଶ",
        head_north: "सुरक्षित मार्ग से उत्तर की ओर चलें", turn_right_flyover: "फ्लाईओवर पर दाएं मुड़ें",
        avoid_flooded_zone: "⚠️ जलमग्न क्षेत्र से बचें (पानी 2 फीट+)", continue_to: "आगे बढ़ें",
        time_to_impact: "प्रभाव का समय", min_to_shelter: "मिनट आश्रय तक",
        min_to_flood: "मिनट बाढ़ तक", min_buffer: "मिनट अतिरिक्त",
        open_maps: "मैप खोलें", your_location: "आपका स्थान", via_sim_gps: "SIM GPS द्वारा",
        shelters_near: "निकट आश्रय", navigate_here: "यहां नेविगेट करें", maps: "मैप्स",
        open: "खुला", full: "भरा",
        send_sos_alert: "🚨 SOS अलर्ट भेजें",
        sends_sos_desc: "NDRF और 112 को SOS + GPS भेजता है।",
        alert_id: "अलर्ट ID", location: "स्थान", method: "विधि",
        disaster_mgmt: "आपदा प्रबंधन", emergency: "आपातकाल",
        send_safety_status: "SMS द्वारा सुरक्षा स्थिति भेजें",
        send_safety_alert: "📩 सुरक्षा अलर्ट भेजें", family_alerted: "परिवार को सूचित किया ✓",
        sms_gps_sent: "GPS के साथ SMS भेजा गया",
        mom: "माँ", dad: "पिताजी", brother: "भाई",
        priority_notice: "अधिक संवेदनशीलता = पहले निकासी अलर्ट। दिखा रहे हैं",
        vulnerability_hotspots: "संवेदनशीलता हॉटस्पॉट",
        dams_reservoirs_near: "बांध और जलाशय निकट",
        dam_critical: "बांध गंभीर स्थिति में", no_dams: "कोई बांध/जलाशय नहीं",
        river: "नदी", capacity: "क्षमता",
        report_from: "रिपोर्ट", gps_auto: "GPS स्वचालित।",
        type: "प्रकार", drainage_blocked: "नाली अवरुद्ध", road_flooded: "सड़क जलमग्न",
        embankment_breach: "तटबंध टूटा", other: "अन्य",
        upload_photo: "फोटो अपलोड करें", describe_situation: "स्थिति का वर्णन करें...",
        submit_report: "NDRF को रिपोर्ट भेजें", report_sent_desc: "NDRF को रिपोर्ट भेजी गई।",
        hydromet_analytics: "जल-मौसम विश्लेषण", live_conditions: "वर्तमान स्थिति",
        rainfall_24h: "वर्षा (24घं)", temperature: "तापमान",
        soil_moisture: "मिट्टी नमी", wind_speed: "हवा की गति",
        river_discharge: "नदी प्रवाह", seven_day_rain: "7-दिन वर्षा",
        rainfall_trend: "वर्षा प्रवृत्ति (10 दिन)", forecasting_model: "पूर्वानुमान मॉडल",
        model: "मॉडल", sources: "स्रोत", accuracy: "सटीकता",
        infrastructure: "बुनियादी ढांचा", drainage: "जल निकासी", embankment: "तटबंध",
        sim_gps_location: "SIM GPS स्थान",
        how_it_works: "आपका स्थान मोबाइल नेटवर्क सेल टॉवर द्वारा पता लगाया जाता है।",
        current_location: "वर्तमान स्थान", latitude: "अक्षांश", longitude: "देशांतर",
        accuracy_label: "सटीकता", tower_id: "टॉवर ID", signal: "सिग्नल",
        nearest_towers: "निकटतम टॉवर",
        floodmesh_chat: "फ्लडमेश — आपातकालीन चैट", mesh_active: "मेश सक्रिय",
        msgs: "संदेश", mesh_relay_desc: "संदेश BLE/WiFi मेश द्वारा रिले होते हैं · इंटरनेट की जरूरत नहीं",
        broadcast_sos: "SOS प्रसारित करें", type_message: "संदेश टाइप करें...",
        mesh_broadcast_desc: "संदेश सभी मेश नोड्स को प्रसारित · TTL: 7 हॉप्स",
        tap_voice_alert: "वॉइस अलर्ट के लिए टैप करें", score: "स्कोर",
        rain_24h: "वर्षा 24घं", temp: "तापमान", soil: "मिट्टी",
        live: "लाइव", cached: "कैश्ड", offline: "ऑफलाइन",
        dams_near: "निकट बांध", reports_label: "रिपोर्ट",
        copyright: "© 2024 FloodSense AI · NDRF · भारत सरकार",
    },
};

export function t(lang: string, key: keyof TranslationSet): string {
    const code = LANG_MAP[lang] || "en";
    return translations[code]?.[key] || translations.en[key] || key;
}

export function speak(text: string, lang: string = "English"): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
        "English": "en-IN", "हिन्दी": "hi-IN", "বাংলা": "bn-IN", "తెలుగు": "te-IN",
        "தமிழ்": "ta-IN", "मराठी": "mr-IN", "ગુજરાતી": "gu-IN", "ಕನ್ನಡ": "kn-IN",
        "മലയാളം": "ml-IN", "ਪੰਜਾਬੀ": "pa-IN", "অসমীয়া": "as-IN", "ଓଡ଼ିଆ": "or-IN",
    };
    u.lang = langMap[lang] || "en-IN";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
}
