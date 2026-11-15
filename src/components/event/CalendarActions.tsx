import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { downloadIcs, googleCalendarUrl } from '../../utils/calendar';

export default function CalendarActions({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3" role="group" aria-label="Add the event to your calendar">
      <Button href={googleCalendarUrl()} external variant="ghost" onDark={onDark} small>
        <Icon name="calendar" /> Google Calendar
      </Button>
      <Button onClick={downloadIcs} variant="ghost" onDark={onDark} small>
        <Icon name="download" /> Download .ics
      </Button>
    </div>
  );
}
