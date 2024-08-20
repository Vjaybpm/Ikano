import * as React from 'react';
import clsx from 'clsx';
import { animated, useSpring } from '@react-spring/web';
import { alpha, styled } from '@mui/material/styles';
import { TransitionProps } from '@mui/material/transitions';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderRounded from '@mui/icons-material/FolderRounded';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { unstable_useTreeItem2 as useTreeItem2, UseTreeItem2Parameters, } from '@mui/x-tree-view/useTreeItem2';
import { TreeItem2Content, TreeItem2IconContainer, TreeItem2Label, TreeItem2Root, } from '@mui/x-tree-view/TreeItem2';
import { TreeItem2Icon } from '@mui/x-tree-view/TreeItem2Icon';
import { TreeItem2Provider } from '@mui/x-tree-view/TreeItem2Provider';
import { RichTreeViewPropsBase } from "@mui/x-tree-view/RichTreeView/RichTreeView.types";

type FileType = 'image' | 'pdf' | 'doc' | 'video' | 'folder' | 'pinned' | 'trash' | string; //OK it's just a string, but this is documentation too...

export type FileOrFolderDetails = {
  id: string;
  label: string;
  children?: FileOrFolderDetails[];
  fileType?: FileType;
};
function DotIcon () {
  return (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: '70%',
        bgcolor: 'warning.main',
        display: 'inline-block',
        verticalAlign: 'middle',
        zIndex: 1,
        mx: 1,
      }}
    />
  );
}
declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}

const StyledTreeItemRoot = styled ( TreeItem2Root ) ( ( { theme } ) => ({
  color:
    theme.palette.mode === 'light'
      ? theme.palette.grey[ 800 ]
      : theme.palette.grey[ 400 ],
  position: 'relative',
  [ `& .${treeItemClasses.groupTransition}` ]: {
    marginLeft: theme.spacing ( 3.5 ),
  },
}) ) as unknown as typeof TreeItem2Root;

const CustomTreeItemContent = styled ( TreeItem2Content ) ( ( { theme } ) => ({
  flexDirection: 'row-reverse',
  borderRadius: theme.spacing ( 0.7 ),
  marginBottom: theme.spacing ( 0.5 ),
  marginTop: theme.spacing ( 0.5 ),
  padding: theme.spacing ( 0.5 ),
  paddingRight: theme.spacing ( 1 ),
  fontWeight: 500,
  [ `& .${treeItemClasses.iconContainer}` ]: {
    marginRight: theme.spacing ( 2 ),
  },
  [ `&.Mui-expanded ` ]: {
    '&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.primary.main
          : theme.palette.primary.dark,
    },
    '&::before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: '16px',
      top: '44px',
      height: 'calc(100% - 48px)',
      width: '1.5px',
      backgroundColor:
        theme.palette.mode === 'light'
          ? theme.palette.grey[ 300 ]
          : theme.palette.grey[ 700 ],
    },
  },
  '&:hover': {
    backgroundColor: alpha ( theme.palette.primary.main, 0.1 ),
    color: theme.palette.mode === 'light' ? theme.palette.primary.main : 'white',
  },
  [ `&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused` ]: {
    backgroundColor:
      theme.palette.mode === 'light'
        ? theme.palette.primary.main
        : theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
}) );

const AnimatedCollapse = animated ( Collapse );

function TransitionComponent ( props: TransitionProps ) {
  const style = useSpring ( {
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  } );

  return <AnimatedCollapse style={style} {...props} />;
}

const StyledTreeItemLabelText = styled ( Typography ) ( {
  color: 'inherit',
  fontFamily: 'General Sans',
  fontWeight: 500,
} ) as unknown as typeof Typography;

interface CustomLabelProps {
  children?: React.ReactNode;
  icon?: React.ElementType;
  expandable?: boolean;
}

function CustomLabel ( {
                         icon: Icon,
                         expandable,
                         children,
                         ...other
                       }: CustomLabelProps ) {
  return (
    <TreeItem2Label
      {...other}
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {Icon && (
        <Box
          component={Icon}
          className="labelIcon"
          color="inherit"
          sx={{ mr: 1, fontSize: '1.2rem' }}
        />
      )}

      <StyledTreeItemLabelText variant="body2">{children}</StyledTreeItemLabelText>
      {expandable && <DotIcon/>}
    </TreeItem2Label>
  );
}

const isExpandable = ( reactChildren: React.ReactNode ) => {
  if ( Array.isArray ( reactChildren ) ) {
    return reactChildren.length > 0 && reactChildren.some ( isExpandable );
  }
  return Boolean ( reactChildren );
};

export type GetIconFromFileOrFolderDetails = ( details: FileOrFolderDetails ) => React.ElementType;
export const defaultGetIconFromFileOrFolderDetails: GetIconFromFileOrFolderDetails = ( { fileType }: FileOrFolderDetails ) => {
  switch ( fileType ) {
    case 'image':
      return ImageIcon;
    case 'pdf':
      return PictureAsPdfIcon;
    case 'doc':
      return ArticleIcon;
    case 'video':
      return VideoCameraBackIcon;
    case 'folder':
      return FolderRounded;
    case 'pinned':
      return FolderOpenIcon;
    case 'trash':
      return DeleteIcon;
    default:
      return ArticleIcon;
  }
};

interface CustomTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const CustomTreeItem = ( getIcon: GetIconFromFileOrFolderDetails ) => React.forwardRef ( function CustomTreeItem (
  props: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
          getRootProps,
          getContentProps,
          getIconContainerProps,
          getLabelProps,
          getGroupTransitionProps,
          status,
          publicAPI,
        } = useTreeItem2 ( { id, itemId, children, label, disabled, rootRef: ref } );

  const item = publicAPI.getItem ( itemId );
  const expandable = isExpandable ( children );
  let icon;
  if ( expandable ) {
    icon = FolderRounded;
  } else {
    icon = getIcon ( item );
  }
const CastProvider = TreeItem2Provider as any;
  return (<div>{<CastProvider itemId={itemId}>
      <StyledTreeItemRoot {...getRootProps ( other )}>
        <CustomTreeItemContent
          {...getContentProps ( {
            className: clsx ( 'content', {
              'Mui-expanded': status.expanded,
              'Mui-selected': status.selected,
              'Mui-focused': status.focused,
              'Mui-disabled': status.disabled,
            } ),
          } )}
        >
          <TreeItem2IconContainer {...getIconContainerProps ()}>
            <TreeItem2Icon status={status}/>
          </TreeItem2IconContainer>

          <CustomLabel
            {...getLabelProps ( { icon, expandable: expandable && status.expanded } )}
          />
        </CustomTreeItemContent>
        {children && <TransitionComponent {...getGroupTransitionProps ()} />}
      </StyledTreeItemRoot>
    </CastProvider>}</div>
  );
} );

export type FileExplorerProps = RichTreeViewPropsBase & {
  items: FileOrFolderDetails[];
  getIcon?: GetIconFromFileOrFolderDetails
  expandIds?: string[]
}
export  function FileExplorer ( { items, getIcon, expandIds,...props }: FileExplorerProps ) {
  const actualGetIcon = getIcon || defaultGetIconFromFileOrFolderDetails;
  return (
    <RichTreeView
      defaultExpandedItems={expandIds}
      // aria-label="file explorer"
      // sx={{ height: 'fit-content', flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
      // defaultExpandedItems={[ '1' ]}
      {...props}
      items={items}
      slots={{ item: CustomTreeItem ( actualGetIcon )}}
    />
  );
}