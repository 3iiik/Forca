import { ipcMain } from 'electron';
import { ScoreService } from '../services/score.service';
import { SuggestionService } from '../services/suggestion.service';
import { CalendarService } from '../services/calendar.service';
import store from '../store/store';

export function registerStatsIpc(
  scoreService: ScoreService,
  suggestionService: SuggestionService,
  calendarService: CalendarService
) {
  ipcMain.handle('stats:focus-score', async () => {
    return scoreService.getFocusScore();
  });

  ipcMain.handle('stats:weekly-summary', async () => {
    return scoreService.getWeeklySummary();
  });

  ipcMain.handle('stats:streak', async () => {
    return scoreService.getStreakData();
  });

  ipcMain.handle('stats:suggestions', async () => {
    const zones = store.get('zones', []);
    const sessions = store.get('sessions', []);
    const events = await calendarService.getEvents(
      new Date().toISOString().split('T')[0]
    );
    return suggestionService.generateSuggestions(events, zones, sessions);
  });
}
