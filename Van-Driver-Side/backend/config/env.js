const normalizeUrl = (value) => value.replace(/\/$/, '');

const requireValue = (value, name) => {
    if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value.trim();
};

const requireUrl = (value, name) => normalizeUrl(requireValue(value, name));

const getMongoUri = () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    return requireValue(mongoUri, 'MONGO_URI');
};

const getPassengerBaseUrl = () => requireUrl(process.env.PASSENGER_BASE_URL, 'PASSENGER_BASE_URL');

module.exports = {
    getMongoUri,
    getPassengerBaseUrl
};
