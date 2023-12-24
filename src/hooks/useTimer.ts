import { useCallback, useEffect, useRef, useState } from "react";

export default function useTimer({
  initialSeconds,
  autoStart = true,
}: {
  initialSeconds: number;
  autoStart?: boolean;
}) {
  const [seconds, _setSeconds] = useState(initialSeconds);
  const _seconds = useRef(initialSeconds);
  const setSeconds = (s: number) => {
    _setSeconds(s);
    _seconds.current = s;
  };

  const [isRunning, setIsRunning] = useState(autoStart);

  const pause = useCallback(() => {
    if (_seconds.current == 0) return;
    setIsRunning(false);
  }, []);

  const restart = useCallback((s: number, newAutoStart = true) => {
    setIsRunning(newAutoStart);
    setSeconds(s);
  }, []);

  const resume = useCallback(() => {
    if (_seconds.current == 0) return;
    restart(_seconds.current);
  }, []);

  useEffect(() => {
    let clear: any;
    if (isRunning) {
      clear = setInterval(() => {
        if (_seconds.current - 1 <= 0) {
          setSeconds(0);
          return setIsRunning(false);
        }
        setSeconds(_seconds.current - 1);
      }, 100);
    }

    return () => {
      clearInterval(clear);
    };
  }, [isRunning]);

  return {
    minutes: Math.floor(seconds / 600),
    seconds: Math.floor((seconds % 600) / 10),
    tenths: Math.floor(seconds % 10),
    pause,
    resume,
    restart,
    isRunning,
  };
}