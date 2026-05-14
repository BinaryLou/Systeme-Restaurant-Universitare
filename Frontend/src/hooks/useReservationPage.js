import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMenuByDate } from "../services/menuApi";
import { createReservation } from "../services/reservationApi";
import { useAuth } from "./useAuth";

const SERVICES = [
    {
        id_service: 1,
        code: "DEJEUNER",
        label: "Déjeuner",
        time: "11:00 - 14:30",
    },
    {
        id_service: 2,
        code: "DINER",
        label: "Dîner",
        time: "17:00 - 20:00",
    },
];

export const useReservationPage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const [selectedDates, setSelectedDates] = useState([]);
    const [selectedServices, setSelectedServices] = useState([
        "DEJEUNER",
        "DINER",
    ]);
    const [menuCache, setMenuCache] = useState({});
    const [hoveredDate, setHoveredDate] = useState(null);
    const [error, setError] = useState("");
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [currentBalance, setCurrentBalance] = useState(
        Number(user?.solde ?? user?.balance ?? 0)
    );

    const mealPrice = 2;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);

    const formatDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (dateKey) => {
        const date = new Date(`${dateKey}T00:00:00`);
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
        });
    };

    const formatLongDate = (dateKey) => {
        const date = new Date(`${dateKey}T00:00:00`);
        return date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getMonthLabel = () => {
        return currentMonth.toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
        });
    };

    const isDateAvailable = (date) => {
        const cleanDate = new Date(date);
        cleanDate.setHours(0, 0, 0, 0);
        return cleanDate >= today && cleanDate <= maxDate;
    };

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        const blanks = Array.from({ length: firstDayIndex }, () => null);
        const days = Array.from({ length: totalDays }, (_, index) => {
            return new Date(year, month, index + 1);
        });

        return [...blanks, ...days];
    };

    const fetchMenuForDate = async (dateKey) => {
        if (menuCache[dateKey]?.data) {
            return menuCache[dateKey].data;
        }

        setMenuCache((prev) => ({
            ...prev,
            [dateKey]: {
                loading: true,
                error: "",
                data: null,
            },
        }));

        try {
            const data = await getMenuByDate(dateKey);

            setMenuCache((prev) => ({
                ...prev,
                [dateKey]: {
                    loading: false,
                    error: "",
                    data,
                },
            }));

            return data;
        } catch (err) {
            const message =
                err.response?.data?.message || "Menu indisponible pour cette date.";

            setMenuCache((prev) => ({
                ...prev,
                [dateKey]: {
                    loading: false,
                    error: message,
                    data: null,
                },
            }));

            return null;
        }
    };

    const getAvailableServicesForDate = (dateKey) => {
        const menuData = menuCache[dateKey]?.data;

        if (!menuData || menuData.is_closed) return [];

        const services = [];

        if (menuData.lunch_content) {
            services.push("DEJEUNER");
        }

        if (menuData.dinner_content) {
            services.push("DINER");
        }

        return services;
    };

    const totalMeals = selectedDates.reduce((total, dateKey) => {
        const availableServices = getAvailableServicesForDate(dateKey);

        const validServices = selectedServices.filter((service) =>
            availableServices.includes(service)
        );

        return total + validServices.length;
    }, 0);

    const totalPrice = totalMeals * mealPrice;
    const afterPayment = currentBalance - totalPrice;

    const handleDateHover = (date) => {
        if (!date || !isDateAvailable(date)) return;

        const dateKey = formatDateKey(date);
        setHoveredDate(dateKey);
        fetchMenuForDate(dateKey);
    };

    const toggleDate = async (date) => {
        if (!date || !isDateAvailable(date)) return;

        const dateKey = formatDateKey(date);

        if (selectedDates.includes(dateKey)) {
            setSelectedDates((prev) => prev.filter((item) => item !== dateKey));
            setError("");
            return;
        }

        const menuData = await fetchMenuForDate(dateKey);

        if (!menuData) {
            setError("Aucun menu disponible pour cette date.");
            return;
        }

        if (menuData.is_closed) {
            setError("Restaurant fermé ce jour.");
            return;
        }

        setError("");
        setSelectedDates((prev) => [...prev, dateKey]);
    };

    const toggleService = (serviceCode) => {
        setSelectedServices((prev) =>
            prev.includes(serviceCode)
                ? prev.filter((item) => item !== serviceCode)
                : [...prev, serviceCode]
        );
    };

    const selectAllAvailable = async () => {
        setError("");

        const dates = getDaysInMonth().filter((date) => date && isDateAvailable(date));
        const validDates = [];

        for (const date of dates) {
            const dateKey = formatDateKey(date);
            const menuData = await fetchMenuForDate(dateKey);

            if (menuData && !menuData.is_closed) {
                validDates.push(dateKey);
            }
        }

        setSelectedDates(validDates);
    };

    const clearSelection = () => {
        setSelectedDates([]);
        setError("");
    };

    const previousMonth = () => {
        setCurrentMonth((prev) => {
            return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
        });
    };

    const nextMonth = () => {
        setCurrentMonth((prev) => {
            return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
        });
    };

    const updateBalance = (newBalance) => {
        updateUser({ solde: newBalance });
        setCurrentBalance(newBalance);
    };

    const handleConfirmReservation = async () => {
        try {
            setConfirmLoading(true);
            setError("");

            if (selectedDates.length === 0) {
                setError("Veuillez sélectionner au moins une date.");
                return;
            }

            if (selectedServices.length === 0) {
                setError("Veuillez sélectionner au moins un service.");
                return;
            }

            const results = [];

            for (const dateKey of selectedDates) {
                const availableServices = getAvailableServicesForDate(dateKey);

                const servicesToReserve = selectedServices.filter((serviceCode) =>
                    availableServices.includes(serviceCode)
                );

                for (const serviceCode of servicesToReserve) {
                    const service = SERVICES.find((item) => item.code === serviceCode);

                    try {
                        const result = await createReservation({
                            date_repas: dateKey,
                            id_service: service.id_service,
                        });

                        const newBalance =
                            result?.remainingBalance ??
                            result?.data?.remainingBalance ??
                            result?.reservation?.remainingBalance;

                        if (newBalance !== undefined && newBalance !== null) {
                            updateBalance(Number(newBalance));
                        }

                        results.push({
                            date: dateKey,
                            service: service.label,
                            time: service.time,
                            result,
                        });
                    } catch (err) {
                        const message =
                            err.response?.data?.message ||
                            err.response?.data?.error ||
                            err.message ||
                            "Erreur lors de la confirmation.";

                        setError(`${dateKey} - ${service.label} : ${message}`);
                        return;
                    }
                }
            }

            if (results.length === 0) {
                setError("Aucun service disponible pour les dates sélectionnées.");
                return;
            }

            setSuccessData(results);
        } finally {
            setConfirmLoading(false);
        }
    };
    const canShowRecap = selectedDates.length > 0 && selectedServices.length > 0;

    return {
        canShowRecap,
        SERVICES,
        navigate,
        selectedDates,
        selectedServices,
        menuCache,
        hoveredDate,
        error,
        confirmLoading,
        successData,
        mealPrice,
        currentBalance,
        totalMeals,
        totalPrice,
        afterPayment,
        calendarCells: getDaysInMonth(),
        formatDateKey,
        formatDisplayDate,
        formatLongDate,
        getMonthLabel,
        isDateAvailable,
        getAvailableServicesForDate,
        handleDateHover,
        setHoveredDate,
        toggleDate,
        toggleService,
        selectAllAvailable,
        clearSelection,
        previousMonth,
        nextMonth,
        handleConfirmReservation,
    };
};
