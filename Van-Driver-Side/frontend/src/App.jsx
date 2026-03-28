import { useState, useEffect } from 'react';
import { isAuthenticated, getDriver, getToken, removeToken } from './services/auth';
import { initSocket, disconnectSocket } from './services/socket';
import { getShiftStatus } from './services/api';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TripList from './pages/TripList';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import PaymentVerification from './pages/PaymentVerification';
import Depart from './pages/Depart';
import EndTrip from './pages/EndTrip';

const SCREENS = {
    LOGIN: 'login',
    REGISTER: 'register',
    HOME: 'home',
    TRIP_LIST: 'trip_list',
    DASHBOARD: 'dashboard',
    CHECKIN: 'checkin',
    PAYMENTS: 'payments',
    DEPART: 'depart',
    END_TRIP: 'end_trip',
    COMPLETE: 'complete'
};

export default function App() {
    const [screen, setScreen] = useState(SCREENS.LOGIN);
    const [driver, setDriver] = useState(null);
    const [van, setVan] = useState(null);
    const [trip, setTrip] = useState(null);
    const [roundsToday, setRoundsToday] = useState(0);

    useEffect(() => {
        if (isAuthenticated()) {
            const savedDriver = getDriver();
            if (savedDriver) {
                setDriver(savedDriver);
                initSocket();
                checkShiftOnMount(savedDriver);
            }
        }
        return () => disconnectSocket();
    }, []);

    const checkShiftOnMount = async (driverData) => {
        try {
            const driverId = driverData?.id;
            if (!driverId) { setScreen(SCREENS.HOME); return; }

            const data = await getShiftStatus(driverId);
            if (data.success && data.shift) {
                setRoundsToday(data.shift.rounds_today || 0);

                if (data.shift.active_trip) {
                    setTrip(data.shift.active_trip);
                    if (data.shift.van) setVan(data.shift.van);
                    setScreen(SCREENS.DASHBOARD);
                    return;
                }

                if (data.shift.has_van && data.shift.van) {
                    setVan(data.shift.van);
                    setScreen(SCREENS.HOME);
                    return;
                }
            }
            setScreen(SCREENS.HOME);
        } catch (err) {
            console.warn('Shift check failed:', err);
            setScreen(SCREENS.HOME);
        }
    };

    const handleLogin = async (driverData) => {
        try {
            setDriver(driverData);
            try { initSocket(); } catch (e) { /* non-fatal */ }
            await checkShiftOnMount(driverData);
        } catch (err) {
            console.error('Login error:', err);
            setScreen(SCREENS.HOME);
        }
    };

    const handleLogout = () => {
        removeToken();
        disconnectSocket();
        setDriver(null);
        setVan(null);
        setTrip(null);
        setRoundsToday(0);
        setScreen(SCREENS.LOGIN);
    };

    const handleVanSelected = (vanData) => {
        setVan(vanData);
        setScreen(SCREENS.TRIP_LIST);
    };

    const handleTripSelected = (tripData) => {
        setTrip(tripData);
        setScreen(SCREENS.DASHBOARD);
    };

    const handleDeparted = () => {
        setTrip(prev => ({ ...prev, status: 'departed' }));
        setScreen(SCREENS.DASHBOARD);
    };

    // After trip complete → Home (van stays bound)
    const handleTripComplete = (summary) => {
        if (summary?.trip_summary?.rounds_today) {
            setRoundsToday(summary.trip_summary.rounds_today);
        }
        if (summary?.van_info) {
            setVan(summary.van_info);
        }
        setTrip(null);
        setScreen(SCREENS.HOME);
    };

    const handleVanChanged = (newVan) => setVan(newVan);

    const renderScreen = () => {
        switch (screen) {
            case SCREENS.LOGIN:
                return <Login onLogin={handleLogin} onGoToRegister={() => setScreen(SCREENS.REGISTER)} />;

            case SCREENS.REGISTER:
                return <Register onRegisterSuccess={() => { }} onGoToLogin={() => setScreen(SCREENS.LOGIN)} />;

            case SCREENS.HOME:
                return (
                    <Home
                        driver={driver} van={van} trip={trip} roundsToday={roundsToday}
                        onVanSelected={handleVanSelected}
                        onSelectTrip={() => setScreen(SCREENS.TRIP_LIST)}
                        onResumeDashboard={() => setScreen(SCREENS.DASHBOARD)}
                        onVanChanged={handleVanChanged}
                        onLogout={handleLogout}
                    />
                );

            case SCREENS.TRIP_LIST:
                return (
                    <TripList
                        driver={driver} van={van} roundsToday={roundsToday}
                        onSelectTrip={handleTripSelected}
                        onBack={() => setScreen(SCREENS.HOME)}
                    />
                );

            case SCREENS.DASHBOARD:
                return (
                    <Dashboard
                        driver={driver} trip={trip} van={van} roundsToday={roundsToday}
                        onCheckIn={() => setScreen(SCREENS.CHECKIN)}
                        onPayments={() => setScreen(SCREENS.PAYMENTS)}
                        onDepart={() => setScreen(SCREENS.DEPART)}
                        onEndTrip={() => setScreen(SCREENS.END_TRIP)}
                        onBack={() => setScreen(SCREENS.HOME)}
                        onTripUpdate={(updatedTrip) => setTrip(updatedTrip)}
                    />
                );

            case SCREENS.CHECKIN:
                return <CheckIn trip={trip} van={van} onBack={() => setScreen(SCREENS.DASHBOARD)} />;

            case SCREENS.PAYMENTS:
                return <PaymentVerification trip={trip} onBack={() => setScreen(SCREENS.DASHBOARD)} />;

            case SCREENS.DEPART:
                return <Depart trip={trip} onDeparted={handleDeparted} onBack={() => setScreen(SCREENS.DASHBOARD)} />;

            case SCREENS.END_TRIP:
                return <EndTrip trip={trip} onComplete={handleTripComplete} onBack={() => setScreen(SCREENS.DASHBOARD)} />;

            default:
                return <Login onLogin={handleLogin} />;
        }
    };

    return (
        <div className="app">
            {renderScreen()}
        </div>
    );
}
