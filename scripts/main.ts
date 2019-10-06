import Wichtelbot from './wichtelbot';

class Main
{
    wichtelbot: Wichtelbot|null = null;
    applicationIsRunning = false;

    constructor ()
    {
        const terminateFunction = (): void => this.terminate();

        process.on('exit', terminateFunction);
        process.on('SIGINT', terminateFunction); // Ctrl + C
        process.on('SIGHUP', terminateFunction); // Terminal closed
        process.on('SIGTERM', terminateFunction); // "kill pid" / "killall"
        process.on('SIGUSR1', terminateFunction); // "kill -SIGUSR1 pid" / "killall -SIGUSR1"
        process.on('SIGUSR2', terminateFunction); // "kill -SIGUSR2 pid" / "killall -SIGUSR2"
    }

    /**
     * Terminate all running connections and report about the closing programme.
     */
    terminate (): void
    {
        if (this.applicationIsRunning)
        {
            this.applicationIsRunning = false;

            if (this.wichtelbot)
            {
                this.wichtelbot.terminate();
            }

            console.log("\nWichtelbot closed.");
        }
    }

    run (): void
    {
        console.log('Wichtelbot is starting...');

        this.applicationIsRunning = true;

        this.wichtelbot = new Wichtelbot(
            (loginName): void =>
            {
                console.log(`Wichtelbot started. Logged in as ${loginName}.\n`);
            }
        );
    }
}

const main = new Main();
main.run();
