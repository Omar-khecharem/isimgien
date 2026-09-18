import { useState, useMemo } from "react";
import styles from "./PremiumCalendar.module.css";

interface PremiumCalendarProps {
  attendanceData: any[];
  upcomingTrainings?: any[];
  upcomingEvents?: any[];
  compact?: boolean;
}

export function PremiumCalendar({ attendanceData, upcomingTrainings, upcomingEvents, compact }: PremiumCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthLabel = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  const attendanceDates = useMemo(() => {
    const set = new Set<number>();
    attendanceData.forEach((r) => {
      const d = new Date(r.checkIn?.time ?? r.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [attendanceData, month, year]);

  const upcomingDates = useMemo(() => {
    const set = new Set<number>();
    (upcomingTrainings ?? []).forEach((t: any) => {
      const d = new Date(t.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        set.add(d.getDate());
      }
    });
    (upcomingEvents ?? []).forEach((e: any) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [upcomingTrainings, upcomingEvents, month, year]);

  const dayItems = useMemo(() => {
    const map: Record<number, { type: string; title: string; time: string }[]> = {};
    (upcomingTrainings ?? []).forEach((t: any) => {
      const d = new Date(t.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({ type: "training", title: t.title, time: t.startTime });
      }
    });
    (upcomingEvents ?? []).forEach((e: any) => {
      const d = new Date(e.date);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({ type: "event", title: e.title, time: e.startTime });
      }
    });
    return map;
  }, [upcomingTrainings, upcomingEvents, month, year]);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const weekDays = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

  return (
    <div className={`${styles.calendar} ${compact ? styles.calendarCompact : ""}`}>
      <div className={styles.calendarHeader}>
        <button className={styles.calendarNav} onClick={prevMonth}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h3 className={styles.calendarTitle}>{monthLabel}</h3>
        <button className={styles.calendarNav} onClick={nextMonth}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div className={styles.calendarGrid}>
        {weekDays.map((d) => (
          <span key={d} className={styles.calendarWeekday}>{d}</span>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <span key={`empty-${i}`} className={styles.calendarDayEmpty} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const hasAttendance = attendanceDates.has(day);
          const hasUpcoming = upcomingDates.has(day);
          const isToday = isCurrentMonth && today.getDate() === day;
          const items = dayItems[day] ?? [];
          return (
            <span
              key={day}
              className={`${styles.calendarDay} ${hasAttendance ? styles["calendarDay--active"] : ""} ${hasUpcoming && !hasAttendance ? styles["calendarDay--upcoming"] : ""} ${isToday ? styles["calendarDay--today"] : ""}`}
            >
              {day}
              {hasAttendance && <span className={styles.calendarDot} />}
              {hasUpcoming && !hasAttendance && <span className={styles.calendarDotUpcoming} />}
              {items.length > 0 && (
                <div className={styles.calendarTooltip}>
                  <div className={styles.calendarTooltipTitle}>
                    <span className={styles.calendarTooltipTitleDot} />
                    {day} {currentDate.toLocaleDateString("fr-FR", { month: "short" })}
                  </div>
                  {items.map((item, idx) => (
                    <div key={idx} className={styles.calendarTooltipItem}>
                      <span className={`${styles.calendarTooltipItemType} ${item.type === "training" ? styles["calendarTooltipItemType--training"] : styles["calendarTooltipItemType--event"]}`}>
                        {item.type === "training" ? "Form." : "Évén."}
                      </span>
                      <span className={styles.calendarTooltipItemTitle}>{item.title}</span>
                      <span className={styles.calendarTooltipItemTime}>{item.time}</span>
                    </div>
                  ))}
                </div>
              )}
              {items.length === 0 && hasAttendance && (
                <div className={styles.calendarTooltip}>
                  <div className={styles.calendarTooltipTitle}>
                    <span className={styles.calendarTooltipTitleDot} />
                    {day} {currentDate.toLocaleDateString("fr-FR", { month: "short" })}
                  </div>
                  <div className={styles.calendarTooltipEmpty}>Présence enregistrée</div>
                </div>
              )}
            </span>
          );
        })}
      </div>
      <div className={styles.calendarLegend}>
        <span className={styles.calendarLegendItem}>
          <span className={styles.calendarLegendDot} /> Aujourd'hui
        </span>
        <span className={styles.calendarLegendItem}>
          <span className={`${styles.calendarLegendDot} ${styles["calendarLegendDot--upcoming"]}`} /> À venir
        </span>
        <span className={styles.calendarLegendItem}>
          <span className={`${styles.calendarLegendDot} ${styles["calendarLegendDot--attended"]}`} /> Présent
        </span>
      </div>
    </div>
  );
}
