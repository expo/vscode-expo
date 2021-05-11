export interface Config {
  autoSlash: boolean;
  mappings: Mapping[];
  showHiddenFiles: boolean;
  withExtension: boolean;
  absolutePathToWorkspace: boolean;
  filesExclude: { [key: string]: string };
}

export interface Mapping {
  key: string;
  value: string;
}
