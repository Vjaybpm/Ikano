import { UrlFolder } from '@itsmworkbench/urlstore';
import { FileOrFolderDetails } from './file.explorer';

//export type FileOrFolderDetails = {
//   id: string;
//   label: string;
//   children?: FileOrFolderDetails[];
//   fileType?: FileType;
// };
//export type UrlFolder = {
//     name: string;
//     children: UrlFolder[];
// };
export function convertUrlFolderToFileExplorer ( u: UrlFolder, allIds?: string[], path?: string ): FileOrFolderDetails {
  const id = path ? `${path}/${u.name}` : u.name;
  if ( allIds ) allIds.push ( id )
  const fileType = u.children?.length>0 ? 'folder' : (u.name.includes ( '.' )) ? 'article' : 'folder';
  console.log(u.name, fileType)
  return {
    id: id,
    label: u.name,
    fileType,
    children: u.children ? u.children.map ( u => convertUrlFolderToFileExplorer ( u, allIds, id ) ) : undefined
  }
}