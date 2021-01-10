import { program } from "commander";
import { app } from "./app";

program
    .version("0.1");

program
    .description("VRChat log viewer")
    .option("-f, --filter <name>", "filter result with name")
    .option("--import <dir>", "The directory to append import")

export async function run(argv: any): Promise<void> {
    program.parse(argv);
    app({
        import: program["import"],
        filter: program["filter"]
    });
};
