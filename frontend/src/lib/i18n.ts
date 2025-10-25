import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      dashboard: {
        title: "Farm Dashboard",
        weather: "Today's Weather",
        soilIrrigation: "Soil & Irrigation",
        cropSuitability: "Crop Suitability Score",
        revenue: "Estimated Monthly Revenue",
        suitabilityChart: "Crop Suitability vs Alternatives",
        revenueChart: "Revenue by Crop (Last 12 Months)",
        rainfallChart: "Rainfall vs Yield Potential",
        insights: "Insights & Alerts",
        whatIf: "What-if Scenario",
        assistant: "AI Assistant",
        chat: "Chat",
        voice: "Voice",
      },
      common: {
        loading: "Loading...",
        noData: "No data available",
        error: "Error loading data",
      },
    },
  },
  es: {
    translation: {
      dashboard: {
        title: "Panel de Granja",
        weather: "Clima de Hoy",
        soilIrrigation: "Suelo e Irrigación",
        cropSuitability: "Puntuación de Idoneidad del Cultivo",
        revenue: "Ingresos Mensuales Estimados",
        suitabilityChart: "Idoneidad del Cultivo vs Alternativas",
        revenueChart: "Ingresos por Cultivo (Últimos 12 Meses)",
        rainfallChart: "Lluvia vs Potencial de Rendimiento",
        insights: "Perspectivas y Alertas",
        whatIf: "Escenario Hipotético",
        assistant: "Asistente IA",
        chat: "Chat",
        voice: "Voz",
      },
      common: {
        loading: "Cargando...",
        noData: "No hay datos disponibles",
        error: "Error al cargar datos",
      },
    },
  },
  hi: {
    translation: {
      dashboard: {
        title: "फार्म डैशबोर्ड",
        weather: "आज का मौसम",
        soilIrrigation: "मिट्टी और सिंचाई",
        cropSuitability: "फसल उपयुक्तता स्कोर",
        revenue: "अनुमानित मासिक राजस्व",
        suitabilityChart: "फसल उपयुक्तता बनाम विकल्प",
        revenueChart: "फसल द्वारा राजस्व (पिछले 12 महीने)",
        rainfallChart: "वर्षा बनाम उपज क्षमता",
        insights: "अंतर्दृष्टि और अलर्ट",
        whatIf: "क्या-अगर परिदृश्य",
        assistant: "एआई सहायक",
        chat: "चैट",
        voice: "आवाज",
      },
      common: {
        loading: "लोड हो रहा है...",
        noData: "कोई डेटा उपलब्ध नहीं",
        error: "डेटा लोड करने में त्रुटि",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;