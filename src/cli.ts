import * as path from "path";
import * as fs from "fs";
import { program } from "commander";
import { app } from "./app";

const version = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8")).version;

program
    .version(version, "-v, --version", "output the current version");

program
    .description("VRChat log viewer")
    .option("-f, --filter <word...>", "filter logs with ignore case words")
    .option("-cf, --case-filter <word...>", "filter logs with no ignore case words")
    .option("-i, --import <dir>", "log directory to import additional")
    .option("-V, --verbose", "display full log details")
    .option("-r, --range <range>", "specify the range to display with year/month/week/day/hour. (ex: 4w 7d 24h 60m)")
    .option("-w, --watch <sec>", "update db repeatedly")
    .option("-d, --debug", "show console log")

export async function run(argv: any): Promise<void> {
    program.parse(argv);
    app({
        import: program["import"],
        filter: program["filter"],
        caseFilter: program["caseFilter"],
        verbose: program["verbose"],
        range: program["range"],
        watch: program["watch"],
        debug: program["debug"]
    });
}
