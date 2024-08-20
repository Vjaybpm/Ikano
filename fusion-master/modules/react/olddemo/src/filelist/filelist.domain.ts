
export type AFile = {
  id: string;
  label: string;
  contents: any
  contentType: 'json' | 'string'
  errors: string[]
};

export type AFolder = {
  id: string;
  label: string;
  children?: FileOrFolder[] // is is undefined if we haven't loaded the children yet
};
export function isFolder ( item: FileOrFolder ): item is AFolder {
  return 'children' in item
}

export type FileOrFolder = AFile | AFolder;