export const formatDateRange = (
    startStr?: string | null,
    endStr?: string | null,
    preferredMonths?: number[]
) => {
    if (startStr && endStr) {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const year = start.getFullYear();
        const startDay = start.getDate();
        const endDay = end.getDate();
        const startMonth = start.toLocaleString('default', { month: 'short' });

        if (start.getMonth() === end.getMonth()) {
            return `${startDay} - ${endDay} ${startMonth} ${year}`;
        }
        const endMonth = end.toLocaleString('default', { month: 'short' });
        return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }

    if (preferredMonths && preferredMonths.length > 0) {
        const sorted = [...new Set(preferredMonths)].sort((a, b) => a - b);

        const getMonthName = (m: number) => {
            const date = new Date();
            date.setMonth(m - 1);
            return date.toLocaleString('default', { month: 'short' });
        };

        const groups: string[] = [];
        let startGroup = sorted[0];
        let prev = sorted[0];

        for (let i = 1; i <= sorted.length; i++) {
            if (i === sorted.length || sorted[i] !== prev + 1) {
                if (startGroup === prev) {
                    groups.push(getMonthName(startGroup));
                } else {
                    groups.push(`${getMonthName(startGroup)} - ${getMonthName(prev)}`);
                }
                if (i < sorted.length) {
                    startGroup = sorted[i];
                    prev = sorted[i];
                }
            } else {
                prev = sorted[i];
            }
        }

        return groups.join(', ');
    }

    return "TBD";
};