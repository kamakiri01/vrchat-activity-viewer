import { program } from "commander";
import { app } from "./app";

program
    .version("0.1");

program
    .description("VRChat log viewer")
    .option("-f, --filter <name>", "filter result with name")
    .option("-i, --init", "generate default files")
    .option("--import <dir>", "The directory to append import")

export async function run(argv: any): Promise<void> {
    console.log("1")
    program.parse(argv);
    console.log("2")
    app({
        init: program["init"],
        import: program["import"],
        filter: program["filter"]
    });
};

run(process.argv);