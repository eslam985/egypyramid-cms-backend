// config/gracefulShutdown.js
const gracefulShutdown = (server, pool) => {
    const shutdown = async (signal) => {
        console.log(`\n${signal} received...`);
        server.close(async () => {
            await pool.end();
            console.log("DB pool closed, bye!");
            process.exit(0);
        });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
};

module.exports = gracefulShutdown;
