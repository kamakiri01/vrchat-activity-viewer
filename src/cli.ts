import { program } from "commander";
import { app } from "./app";

program
    .version("0.0.1", "-v, --version", "output the current version");

program
    .description("VRChat log viewer")
    .option("-f, --filter <word...>", "filter logs with words")
    .option("-i, --import <dir>", "log directory to import additional")
    .option("-V, --verbose", "display full log details")
    .option("-r, --range <hours>", "specify the range to display", "24")

export async function run(argv: any): Promise<void> {
    program.parse(argv);
    app({
        import: program["import"],
        filter: program["filter"],
        verbose: program["verbose"],
        range: program["range"]
    });
};
