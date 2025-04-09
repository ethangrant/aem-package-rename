import fs from 'fs';

export default class OptionValidator {
  constructor(
    private readonly oldSitename: string,
    private readonly newSitename: string,
    private readonly packagePath: string
  ) {
  }

  /**
   * Checks if the package file exists at the specified path
   * @returns {boolean} true if the package exists, false otherwise
   */
  packageExists(): boolean {
    try {
      return fs.existsSync(this.packagePath);
    } catch (error: unknown) {
      console.error('Error checking if the package exists: ', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}