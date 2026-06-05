import { ipcMain } from 'electron';
import { CalendarService } from '../services/calendar.service';

export function registerCalendarIpc(calendarService: CalendarService) {
  ipcMain.handle('calendar:auth', async () => {
    return calendarService.authenticate();
  });

  ipcMain.handle('calendar:events', async (_event, date: string) => {
    return calendarService.getEvents(date);
  });

  ipcMain.handle('calendar:check-meeting-end', async () => {
    return calendarService.checkMeetingEnded();
  });
}
