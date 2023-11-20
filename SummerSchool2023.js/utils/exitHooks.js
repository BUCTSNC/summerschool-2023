import process from "node:process";

let taskQueue = [];

export function addExitHook(fn, ...args) {
  taskQueue = [...taskQueue, [fn, ...args]];
}

export function removeExitHook(toRemove) {
  taskQueue = taskQueue.filter(([fn, ...args]) => toRemove !== fn);
}

process.on("SIGINT", async () => {
    for (const task of taskQueue) {
        const [fn, ...args] = task
        await fn(...args)
    }
    process.exit(0)
})
