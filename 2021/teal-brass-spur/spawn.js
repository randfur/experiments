export function rootSpawn(runnable) {
  return spawn(runnable);
}

class CancelError extends Error {}

function spawn(runnable, isOuterStopped=null) {
  let stopped = false;

  function isStopped() {
    return stopped || isOuterStopped?.();
  }
  
  function stop() {
    stopped = true;
  }
  
  let registrations = new Map();
  
  return {
    stopped: (async () => {
      try {
        await {
          ...runnable,

          register({key, cleanUp}) {
            registrations.get(key)?.();
            registrations.set(key, cleanUp);
          },

          async sleep(seconds=0) {
            const start = performance.now();
            while (true) {
              if (isStopped()) {
                throw new CancelError();
              }
              const now = await new Promise(requestAnimationFrame);
              if (now - start > seconds * 1000) {
                return;
              }
            }
          },

          spawn(runnable) {
            return spawn(runnable, isStopped);
          },
          
          stop,
        }.run();
      } catch (error) {
        if (!(error instanceof CancelError)) {
          throw error;
        }
      } finally {
        stopped = true;
        for (const [key, cleanUp] of registrations) {
          cleanUp();
        }
      }
    })(),

    stop,
  };
}