import { InteractiveBox } from '@boxlite-ai/boxlite';

async function main() {
    console.log('=== InteractiveBox Example ===\n');

    console.log('Starting interactive shell...');
    console.log('(Type "exit" to close the session)\n');
    const location = process.cwd();

    const box = new InteractiveBox({
        image: 'alpine:latest',
        shell: '/bin/sh',
        tty: true,
        memoryMib: 512,
        cpus: 1,
        name: "shellbox2",
        volumes: [
            { hostPath: location, guestPath: '/workspace' },
        ],
        network: { "mode": "disabled" },
        //reuseExisting: true,
    });

    try {
        await box.start();

        // Wait for shell to exit
        await box.wait();

        console.log('\nShell exited.');
    } finally {
        await box.stop();
        console.log('Box cleaned up.');
    }
}

// Run the example
main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});