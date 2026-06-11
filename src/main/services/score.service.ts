import { FocusSession, FocusScore, WeeklySummary, StreakData } from '../../shared/types';
import store from '../store/store';

export class ScoreService {
  static calculateSessionScore(session: FocusSession): number {
    const durationRatio = session.durationPlanned > 0
      ? session.durationCompleted / session.durationPlanned
      : 0;

    const interruptionPenalty = Math.min(session.interruptions * 10, 30);

    const durationScore = durationRatio * 60;
    const baseScore = durationScore - interruptionPenalty;

    return Math.max(0, Math.min(100, Math.round(baseScore)));
  }

  getFocusScore(): FocusScore {
    const sessions = store.get('sessions', []);
    const today = new Date().toISOString().split('T')[0];

    const todaySessions = sessions.filter(s => s.date === today);
    const weekSessions = this.getWeekSessions(sessions);
    const monthSessions = this.getMonthSessions(sessions);

    return {
      session: todaySessions.length > 0
        ? ScoreService.calculateSessionScore(todaySessions[todaySessions.length - 1])
        : 0,
      daily: todaySessions.length > 0
        ? Math.round(todaySessions.reduce((a, s) => a + s.score, 0) / todaySessions.length)
        : 0,
      weekly: weekSessions.length > 0
        ? Math.round(weekSessions.reduce((a, s) => a + s.score, 0) / weekSessions.length)
        : 0,
      monthly: monthSessions.length > 0
        ? Math.round(monthSessions.reduce((a, s) => a + s.score, 0) / monthSessions.length)
        : 0,
    };
  }

  getWeeklySummary(): WeeklySummary {
    const sessions = this.getWeekSessions(store.get('sessions', []));
    const weekStart = this.getWeekStart();

    const totalDeepWorkHours = sessions.reduce((a, s) => a + s.durationCompleted, 0) / 60;

    const dayMap: Record<string, number> = {};
    for (const s of sessions) {
      dayMap[s.date] = (dayMap[s.date] || 0) + s.durationCompleted;
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let mostProductiveDay = '';
    let maxDuration = 0;
    for (const [date, duration] of Object.entries(dayMap)) {
      if (duration > maxDuration) {
        maxDuration = duration;
        const day = new Date(date).getDay();
        mostProductiveDay = dayNames[day];
      }
    }

    const avgLength = sessions.length > 0
      ? sessions.reduce((a, s) => a + s.durationCompleted, 0) / sessions.length
      : 0;

    const bestScore = sessions.length > 0
      ? Math.max(...sessions.map(s => s.score))
      : 0;

    return {
      weekStart,
      totalDeepWorkHours: Math.round(totalDeepWorkHours * 10) / 10,
      mostProductiveDay: mostProductiveDay || 'N/A',
      averageZoneLength: Math.round(avgLength),
      totalSessions: sessions.length,
      bestScore,
    };
  }

  getStreakData(): StreakData {
    const sessions = store.get('sessions', []);
    const currentStreak = store.get('currentStreak', 0);
    const longestStreak = store.get('longestStreak', 0);
    const streakLastDate = store.get('streakLastDate', '');
    const today = new Date().toISOString().split('T')[0];

    const todayCompleted = sessions.some(s => s.date === today);

    // Update streak if needed
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (todayCompleted && streakLastDate !== today) {
      const newStreak = streakLastDate === yesterdayStr ? currentStreak + 1 : 1;
      store.set('currentStreak', newStreak);
      store.set('longestStreak', Math.max(longestStreak, newStreak));
      store.set('streakLastDate', today);
    }

    return {
      currentStreak: store.get('currentStreak', 0),
      longestStreak: store.get('longestStreak', 0),
      lastSessionDate: streakLastDate || today,
      todayCompleted,
    };
  }

  private getWeekSessions(sessions: FocusSession[]): FocusSession[] {
    const weekStart = this.getWeekStart();
    return sessions.filter(s => s.date >= weekStart);
  }

  private getMonthSessions(sessions: FocusSession[]): FocusSession[] {
    const monthStart = new Date();
    monthStart.setDate(1);
    const startStr = monthStart.toISOString().split('T')[0];
    return sessions.filter(s => s.date >= startStr);
  }

  private getWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }
}
