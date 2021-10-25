import Wichtelbot from './wichtelbot';

class Main
{
    private wichtelbot: Wichtelbot|null = null;
    private applicationIsRunning = false;

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
    public terminate (): void
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

    public async run (): Promise<void>
    {
        console.log('Wichtelbot is starting...');

        this.applicationIsRunning = true;

        this.wichtelbot = new Wichtelbot();

        const loginName = await this.wichtelbot.run();

        console.log(`Wichtelbot started. Logged in as "${loginName}".`);
    }
}

const main = new Main();
void main.run();
