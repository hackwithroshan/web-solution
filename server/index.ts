// FIX: Import exit from process to resolve typing issue.
import { exit } from 'process';

console.error("\n--- STARTUP ERROR ---\n");
console.error("You have attempted to start the server from the deprecated 'server' directory.");
console.error("This is the incorrect entry point and will not work.");
console.error("\nACTION REQUIRED:");
console.error("1. Stop this process (Ctrl+C).");
console.error("2. Navigate to the correct directory: cd backend");
console.error("3. Start the server: npm run dev\n");
console.error("---------------------\n");

// Exit the process to prevent the broken server from running and causing confusion.
exit(1);
