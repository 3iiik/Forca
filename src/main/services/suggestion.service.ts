import { Suggestion, FocusSession, CalendarEvent, FocusZone } from '../../shared/types';

export class SuggestionService {
  generateSuggestions(events: CalendarEvent[], zones: FocusZone[], sessions: FocusSession[]): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Analyze calendar patterns
    const freeBlocks = this.findFreeBlocks(events);

    // Suggest focus times in free blocks
    for (const free of freeBlocks) {
      if (free.duration >= 30) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'focus-time',
          title: 'Schedule Focus Block',
          description: `You have ${free.duration} minutes free between your meetings. Great for a focus session!`,
          suggestedTime: free.start.toISOString(),
          suggestedDuration: Math.min(free.duration, 120),
          confidence: 0.85,
        });
      }
    }

    // Detect back-to-back meetings
    const backToBack = this.detectBackToBack(events);
    for (const b2b of backToBack) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'recovery-break',
        title: 'Recovery Break Needed',
        description: `You have ${b2b.count} back-to-back meetings. Schedule a 10-minute recovery break.`,
        suggestedTime: b2b.endTime.toISOString(),
        suggestedDuration: 10,
        confidence: 0.9,
      });
    }

    // Analyze past performance for timing suggestions
    const bestTimes = this.analyzeBestFocusTimes(sessions);
    if (bestTimes.length > 0) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'schedule-optimization',
        title: 'Optimal Focus Time',
        description: `Your most productive window is around ${bestTimes[0]}. Schedule deep work then.`,
        confidence: 0.7,
      });
    }

    return suggestions.slice(0, 5);
  }

  private findBusyBlocks(events: CalendarEvent[]): Array<{ start: Date; end: Date }> {
    const sorted = events
      .filter(e => !e.isAllDay)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const blocks: Array<{ start: Date; end: Date }> = [];
    let current: { start: Date; end: Date } | null = null;

    for (const event of sorted) {
      if (!current) {
        current = { start: event.start, end: event.end };
      } else if (event.start <= current.end) {
        current.end = new Date(Math.max(current.end.getTime(), event.end.getTime()));
      } else {
        blocks.push(current);
        current = { start: event.start, end: event.end };
      }
    }
    if (current) blocks.push(current);

    return blocks;
  }

  private findFreeBlocks(events: CalendarEvent[]): Array<{ start: Date; duration: number }> {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const busyBlocks = this.findBusyBlocks(events);
    const freeBlocks: Array<{ start: Date; duration: number }> = [];

    let cursor = new Date(now);
    cursor.setMinutes(Math.ceil(cursor.getMinutes() / 15) * 15, 0, 0);

    if (cursor < now) cursor = new Date(cursor.getTime() + 15 * 60 * 1000);

    for (const busy of busyBlocks) {
      if (busy.start > cursor) {
        const duration = (busy.start.getTime() - cursor.getTime()) / 60000;
        if (duration >= 15) {
          freeBlocks.push({ start: new Date(cursor), duration });
        }
      }
      cursor = new Date(Math.max(cursor.getTime(), busy.end.getTime()));
    }

    if (cursor < endOfDay) {
      const duration = (endOfDay.getTime() - cursor.getTime()) / 60000;
      if (duration >= 15) {
        freeBlocks.push({ start: new Date(cursor), duration });
      }
    }

    return freeBlocks;
  }

  private detectBackToBack(events: CalendarEvent[]): Array<{ count: number; endTime: Date }> {
    const sorted = events
      .filter(e => !e.isAllDay)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const result: Array<{ count: number; endTime: Date }> = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1].start.getTime() - sorted[i].end.getTime();
      if (gap <= 15 * 60 * 1000) {
        let count = 2;
        let endTime = sorted[i + 1].end;
        for (let j = i + 2; j < sorted.length; j++) {
          if (sorted[j].start.getTime() - endTime.getTime() <= 15 * 60 * 1000) {
            count++;
            endTime = sorted[j].end;
          } else {
            break;
          }
        }
        result.push({ count, endTime });
        i += count - 1;
      }
    }

    return result;
  }

  private analyzeBestFocusTimes(sessions: FocusSession[]): string[] {
    if (sessions.length < 5) return [];

    const hourScores: Record<number, number[]> = {};

    for (const session of sessions) {
      const hour = new Date(session.startTime).getHours();
      if (!hourScores[hour]) hourScores[hour] = [];
      hourScores[hour].push(session.score);
    }

    const hourAverages = Object.entries(hourScores)
      .map(([hour, scores]) => ({
        hour: parseInt(hour),
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length,
      }))
      .filter(h => h.count >= 3)
      .sort((a, b) => b.avg - a.avg);

    return hourAverages.slice(0, 3).map(h => {
      const period = h.hour >= 12 ? 'PM' : 'AM';
      const hour12 = h.hour > 12 ? h.hour - 12 : h.hour === 0 ? 12 : h.hour;
      return `${hour12}:00 ${period}`;
    });
  }
}
