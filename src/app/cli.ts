import * as path from "path";
import * as fs from "fs";
import { program } from "commander";
import { app } from "./app";

const version = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../..", "package.json"), "utf8")).version;

program
    .version(version, "-v, --version", "output the current version");

program
    .description("VRChat log viewer")
    .option("-f, --filter <word...>", "filter logs with any words")
    .option("-cf, --case-filter", "use case sensitive filter")
    .option("-ia, --instance-all", "include same instance user names, world enter log")
    .option("-ie, --instance-enter", "include world enter log")
    .option("-i, --import-dir <dir>", "specify log directory (default: VRChat App path)")
    .option("-V, --verbose", "display full log details")
    .option("-r, --range <range>", "specify the range to display with year/month/week/day/hour. (ex: 4w 7d 24h 60m)")
    .option("-w, --watch <sec>", "update db repeatedly")
    .option("-d, --debug", "show console log")

export async function run(argv: any): Promise<void> {
    program.parse(argv);
    app({
        importDir: program["importDir"],
        filter: program["filter"],
        caseFilter: program["caseFilter"],
        instanceAll: program["instanceAll"],
        instanceEnter: program["instanceEnter"],
        verbose: program["verbose"],
        range: program["range"],
        watch: program["watch"],
        debug: program["debug"]
    });
}
