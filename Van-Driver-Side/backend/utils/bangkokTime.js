const BANGKOK_TIME_ZONE = 'Asia/Bangkok';

const getBangkokParts = (date = new Date()) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: BANGKOK_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = {};
    for (const part of formatter.formatToParts(date)) {
        if (part.type !== 'literal') {
            parts[part.type] = part.value;
        }
    }

    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour: Number(parts.hour),
        minute: Number(parts.minute),
        second: Number(parts.second)
    };
};

const toBangkokDate = ({ year, month, day, hour = 0, minute = 0, second = 0 }) =>
    new Date(Date.UTC(year, month - 1, day, hour - 7, minute, second));

const getBangkokDayRange = (date = new Date()) => {
    const { year, month, day } = getBangkokParts(date);
    return {
        dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        start: toBangkokDate({ year, month, day, hour: 0, minute: 0, second: 0 }),
        end: toBangkokDate({ year, month, day, hour: 23, minute: 59, second: 59 })
    };
};

const getBangkokTodayString = (date = new Date()) => getBangkokDayRange(date).dateKey;

const getBangkokDateTime = (hour, minute, second = 0, date = new Date()) => {
    const { year, month, day } = getBangkokParts(date);
    return toBangkokDate({ year, month, day, hour, minute, second });
};

module.exports = {
    BANGKOK_TIME_ZONE,
    getBangkokParts,
    getBangkokDayRange,
    getBangkokTodayString,
    getBangkokDateTime
};
