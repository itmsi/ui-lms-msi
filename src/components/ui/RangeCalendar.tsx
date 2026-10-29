import { DayPicker } from 'react-day-picker';
import type { DateRange as DayRange, Matcher } from 'react-day-picker';
import { id } from 'react-day-picker/locale';

import { CalendarChevron } from '@/components/ui/CalendarChevron';
import { CALENDAR_CLASS_NAMES } from '@/components/ui/calendarClassNames';

export type { DayRange };

const YEARS_AHEAD = 5;

interface RangeCalendarProps {
    selected: DayRange | undefined;
    onSelect: (range: DayRange | undefined) => void;
    earliest?: Date;
    latest?: Date;
    numberOfMonths?: number;
}

export const RangeCalendar = ({ selected, onSelect, earliest, latest, numberOfMonths = 1 }: RangeCalendarProps) => {
    const today = new Date();
    const disabled: Matcher[] = [
        ...(earliest === undefined ? [] : [{ before: earliest }]),
        ...(latest === undefined ? [] : [{ after: latest }]),
    ];

    return (
        <DayPicker
            mode="range"
            selected={selected}
            onSelect={onSelect}
            locale={id}
            weekStartsOn={1}
            startMonth={earliest ?? new Date(2014, 0)}
            endMonth={latest ?? new Date(today.getFullYear() + YEARS_AHEAD, 11)}
            numberOfMonths={numberOfMonths}
            defaultMonth={selected?.from ?? earliest ?? latest ?? today}
            disabled={disabled}
            classNames={CALENDAR_CLASS_NAMES}
            components={{ Chevron: CalendarChevron }}
            captionLayout="dropdown"
        />
    );
};
