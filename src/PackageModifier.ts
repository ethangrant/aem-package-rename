import AdmZip from "adm-zip";
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export default class PackageModifier {
  constructor(
    private readonly packagePath: string,
    private readonly oldSitename: string,
    private readonly newSitename: string,
    private readonly unzippedPath: string,
  ) {
  }

  /**
   * Renames the package
   * @throws Error if any step in the process fails
   */
  renamePackage() {
    try {
      this.unzipPackage();
      this.renameFolders();
      this.renameInFiles();
      this.zipPackage();
    } catch (error) {
      throw new Error(`Package renaming failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Unzips the package file
   * @returns {string} the path to the unzipped package
   * @throws Error if unzipping fails
   */
  private unzipPackage(): string {
    try {
      const zip = new AdmZip(this.packagePath);
      zip.extractAllTo(this.unzippedPath, true);
      return this.unzippedPath;
    } catch (error) {
      throw new Error(`Failed to unzip package: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Renames all folders in the unzipped package
   * @throws Error if folder renaming fails
   */
  private renameFolders() {
    let isRenamed = false;
    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      
      files.forEach((file: string) => {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          // Check if directory name contains old sitename
          if (file.includes(this.oldSitename)) {
            const newPath = path.join(dir, file.replace(this.oldSitename, this.newSitename));
            fs.renameSync(fullPath, newPath);
            console.log(chalk.green(`✓ Renamed directory: ${chalk.cyan(fullPath)} -> ${chalk.cyan(newPath)}`));
            isRenamed = true;

            // Use the new path for subsequent operations
            walkDir(newPath);
          } else {
            // Recursively walk subdirectories
            walkDir(fullPath);
          }
        }
      });
    };

    try {
      walkDir(this.unzippedPath);
      if (!isRenamed) {
        throw new Error('No files or folders were renamed. The old sitename was not found in the package.');
      }
    } catch (error) {
      throw new Error(`Failed to rename folders: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Finds instance of old sitename and replaces it with the new sitename
   * @throws Error if file content renaming fails
   */
  private renameInFiles() {
    let isRenamed = false;
    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      
      files.forEach((file: string) => {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          // Recursively walk subdirectories
          walkDir(fullPath);
        } else {
          // Read and replace content in files
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(this.oldSitename)) {
            const newContent = content.replace(new RegExp(this.oldSitename, 'g'), this.newSitename);
            fs.writeFileSync(fullPath, newContent, 'utf8');
            console.log(chalk.blue(`✓ Updated content in file: ${chalk.cyan(fullPath)}`));
            isRenamed = true;
          }
        }
      });
    };

    try {
      walkDir(this.unzippedPath);

      if (!isRenamed) {
        throw new Error('No files or folders were renamed. The old sitename was not found in the package.');
      }
    } catch (error) {
      throw new Error(`Failed to rename content in files: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Zips the modified package contents back into a zip file
   * @throws Error if zipping fails
   */
  private zipPackage() {
    try {
      const zip = new AdmZip();
      
      // Add the jcr_root and META-INF directories to the zip
      const jcrRootPath = path.join(this.unzippedPath, 'jcr_root');
      const metaInfPath = path.join(this.unzippedPath, 'META-INF');
      
      if (fs.existsSync(jcrRootPath)) {
        zip.addLocalFolder(jcrRootPath, 'jcr_root');
      }
      
      if (fs.existsSync(metaInfPath)) {
        zip.addLocalFolder(metaInfPath, 'META-INF');
      }
      
      // Write the zip file to current directory
      const currentDirPath = path.join(process.cwd(), path.basename(`modified-${this.packagePath}`));
      zip.writeZip(currentDirPath);
      console.log(chalk.green(`✓ Created zip file at: ${chalk.cyan(currentDirPath)}`));
    } catch (error) {
      throw new Error(`Failed to create zip file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
