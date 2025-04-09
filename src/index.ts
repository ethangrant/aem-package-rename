#! /usr/bin/env node
import { Command } from "commander";
import figlet from "figlet";
import OptionValidator from "./OptionValidator";
import PackageModifier from "./PackageModifier";

const program = new Command();

console.log(figlet.textSync("AEM Package Rename"));

program
  .version("1.0.0")
  .description("Rename an AEM import package site name")
  .requiredOption("-o, --old-sitename <value>", "Site name you want to change in the package")
  .requiredOption("-n, --new-sitename <value>", "Replacement site name for the package")
  .requiredOption("-p, --package-path <value>", "Path of package to rename")
  .option("-u, --unzipped-path <value>", "Path to unzip the package", 'pkg_unzipped')
  .parse(process.argv);

const options = program.opts();
const { oldSitename, newSitename, packagePath, unzippedPath } = options;

const validator = new OptionValidator(oldSitename, newSitename, packagePath);
const exists = validator.packageExists();
if (!exists) {
  console.error(`Package path does not exist: ${packagePath}`);
  process.exit();
}

const modifier = new PackageModifier(packagePath, oldSitename, newSitename, unzippedPath);
modifier.renamePackage();