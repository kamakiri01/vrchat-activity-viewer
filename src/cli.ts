import { program } from "commander";
import { app } from "./app";

program
    .version("0.1");

program
    .description("VRChat log viewer")
    .option("-f, --filter <name>", "filter result with name")
    .option("--import <dir>", "log directory to additional import")
    .option("-V, --verbose", "display full log details")

export async function run(argv: any): Promise<void> {
    program.parse(argv);
    app({
        import: program["import"],
        filter: program["filter"],
        verbose: program["verbose"]
    });
};
