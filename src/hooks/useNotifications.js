import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPermission,
  isNotificationSupported,
  loadSettings,
  requestPermission,
  runDueChecks,
  saveSettings,
} from "../utils/notifications";

// A minute is plenty: the digest only needs to land near its hour, and a task
// can only cross into "overdue" at midnight.
const CHECK_INTERVAL_MS = 60_000;

export function useNotifications(tasks) {
  const [settings, setSettings] = useState(loadSettings);
  const [permission, setPermission] = useState(getPermission);

  // Lets the interval below read the latest tasks without being torn down and
  // recreated every time a task changes.
  const tasksRef = useRef(tasks);
  useEffect(() => { tasksRef.current = tasks; }, [tasks]);

  useEffect(() => { saveSettings(settings); }, [settings]);

  const active = settings.enabled && permission === "granted";

  // Check immediately whenever the task list changes, so completing or
  // rescheduling something is reflected right away.
  useEffect(() => {
    if (!active) return;
    runDueChecks(tasks, { digestHour: settings.digestHour });
  }, [active, tasks, settings.digestHour]);

  // …and on a timer, to catch the digest hour and midnight rollover while the
  // app just sits open.
  useEffect(() => {
    if (!active) return;
    const timerId = setInterval(
      () => runDueChecks(tasksRef.current, { digestHour: settings.digestHour }),
      CHECK_INTERVAL_MS
    );
    return () => clearInterval(timerId);
  }, [active, settings.digestHour]);

  const enable = useCallback(async () => {
    const result = await requestPermission();
    setPermission(result);
    if (result === "granted") setSettings(prev => ({ ...prev, enabled: true }));
    return result;
  }, []);

  const disable = useCallback(() => setSettings(prev => ({ ...prev, enabled: false })), []);

  const setDigestHour = useCallback(hour => setSettings(prev => ({ ...prev, digestHour: hour })), []);

  return {
    settings,
    permission,
    supported: isNotificationSupported(),
    active,
    enable,
    disable,
    setDigestHour,
  };
}
