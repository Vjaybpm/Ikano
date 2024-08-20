import React from 'react';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ErrorIcon from '@mui/icons-material/Error';
import { flatMap, safeArray } from "@laoban/utils";
import { SvgIconComponent } from "@mui/icons-material";
import { LensProps } from "@focuson/state";
import { FileOrFolder, isFolder } from './filelist.domain';
import { styled } from '@mui/material/styles';
import { TreeItem, TreeItem2, TreeItem2Props, treeItemClasses } from "@mui/x-tree-view";
import { TreeItemProps } from "@mui/x-tree-view/TreeItem/TreeItem.types";


export function allIdsForItem ( item: FileOrFolder ): string[] {
  if ( isFolder ( item ) ) {
    return [ item.id, ...flatMap ( safeArray ( item.children ), allIdsForItem ) ]
  } else {
    return [ item.id ]
  }
}
export function allIds ( items: FileOrFolder[] ): string[] {
  return flatMap ( items, allIdsForItem )

}
const getIconForItem = ( item: FileOrFolder ): React.ReactElement<SvgIconComponent> => {
  if ( isFolder ( item ) ) {
    // This is a folder
    return <FolderIcon/>;
  } else {
    // This is a file; check for errors
    if ( safeArray ( item.errors ).length > 0 ) {
      return <ErrorIcon color="error"/>;
    } else {
      return <InsertDriveFileIcon/>;
    }
  }
};


const CustomTreeItem = React.forwardRef (
  ( props: TreeItem2Props, ref: React.Ref<HTMLLIElement> ) => (
    <TreeItem2
      ref={ref}
      {...props}
      slotProps={{
        endIcon: <FolderIcon />,
        icon: <FolderIcon />,
        label: {
          id: `${props.itemId}-label`,
        },
      }}
    />
  ),
);
function findItemWithId ( items: FileOrFolder[], id: string ): FileOrFolder | undefined {
  for ( let item of items ) {
    if ( item.id === id ) {
      return item
    }
    if ( isFolder ( item ) ) {
      let found = findItemWithId ( safeArray ( item.children ), id )
      if ( found ) {
        return found
      }
    }
  }
  return undefined

}
interface FolderTreeProps<S> extends LensProps<S, string, any> {
  rootFolder: FileOrFolder[];
}

export function FolderTree<S> ( { rootFolder, state }: FolderTreeProps<S> ) {
  return <RichTreeView
    slots={{
      item: CustomTreeItem
    }}
    items={rootFolder}
    onSelectedItemsChange={(( event, itemId ) => {
      console.log ( 'Selected item:', itemId )
      if ( itemId ) {
        const item = findItemWithId ( rootFolder, itemId )
        if ( item && !isFolder ( item ) ) {
          console.log ( 'Selected item:', item )
          if ( item.contentType === 'json' )
            state.setJson ( JSON.stringify ( item.contents, null, 2 ), '' )
          else
            state.setJson ( item.contents, '' )
        }
      }
    })}
    defaultExpandedItems={allIds ( rootFolder )}/>
}