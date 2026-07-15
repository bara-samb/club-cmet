import React from 'react';
import {
  Dashboard as MuiDashboard,
  MenuBook,
  FolderOpen as MuiFolderOpen,
  Person as MuiPerson,
  Message,
  Notifications,
  ExitToApp,
  Menu as MuiMenu,
  Close,
  ChevronLeft as MuiChevronLeft,
  ChevronRight as MuiChevronRight,
  People,
  Payment,
  HowToReg,
  Description,
  Mail as MuiMail,
  Event,
  PhotoCamera,
  Save as MuiSave,
  Sync,
  ExpandMore,
  ExpandLess,
  Search as MuiSearch,
  FindInPage,
  Visibility,
  GetApp,
  FilterList,
  Schedule,
  ErrorOutlined,
  Image as MuiImage,
  OpenInNew,
  Delete,
  Send as MuiSend,
  CheckCircle,
  Drafts,
  Refresh,
  Phone as MuiPhone,
  LinkedIn as MuiLinkedIn,
  WorkspacePremium,
  TrendingUp as MuiTrendingUp,
  NorthEast,
  AttachMoney,
  Inventory,
  School,
  Add,
  Edit,
  CloudUpload,
  VideoCameraBack,
  ImageNotSupported,
  Warning,
  PersonAdd,
  Shield as MuiShield,
  AdminPanelSettings,
  Check as MuiCheck,
  Home as MuiHome,
  Info as MuiInfo,
  LightMode,
  DarkMode,
  SwapHoriz,
  MoreHoriz
} from '@mui/icons-material';

// Helper wrapper to map 'size' prop to 'sx={{ fontSize: size }}'
const wrapIcon = (Component) => {
  const WrappedComponent = React.forwardRef(({ size, sx, className, ...props }, ref) => {
    // If className contains w- or h-, we don't force a font size to allow tailwind sizing
    const hasSizeClass = className && (className.includes('w-') || className.includes('h-'));
    const fontSize = size !== undefined ? size : (hasSizeClass ? undefined : 20); // default to 20px if no size or tailwind size

    return (
      <Component
        ref={ref}
        className={className}
        sx={{
          ...(fontSize !== undefined ? { fontSize } : {}),
          ...sx
        }}
        {...props}
      />
    );
  });
  WrappedComponent.displayName = `MuiIconWrapper(${Component.displayName || Component.name || 'Icon'})`;
  return WrappedComponent;
};

export const LayoutDashboard = wrapIcon(MuiDashboard);
export const BookOpen = wrapIcon(MenuBook);
export const FolderOpen = wrapIcon(MuiFolderOpen);
export const User = wrapIcon(MuiPerson);
export const MessageSquare = wrapIcon(Message);
export const Bell = wrapIcon(Notifications);
export const LogOut = wrapIcon(ExitToApp);
export const Menu = wrapIcon(MuiMenu);
export const X = wrapIcon(Close);
export const ChevronLeft = wrapIcon(MuiChevronLeft);
export const ChevronRight = wrapIcon(MuiChevronRight);
export const Users = wrapIcon(People);
export const CreditCard = wrapIcon(Payment);
export const UserCheck = wrapIcon(HowToReg);
export const FileText = wrapIcon(Description);
export const Mail = wrapIcon(MuiMail);
export const Calendar = wrapIcon(Event);
export const Camera = wrapIcon(PhotoCamera);
export const Save = wrapIcon(MuiSave);
export const Loader2 = wrapIcon(Sync); // Lucide uses Loader2, we map to Sync (with animate-spin usually)
export const ChevronDown = wrapIcon(ExpandMore);
export const ChevronUp = wrapIcon(ExpandLess);
export const Search = wrapIcon(MuiSearch);
export const FileX = wrapIcon(FindInPage);
export const Eye = wrapIcon(Visibility);
export const Download = wrapIcon(GetApp);
export const Filter = wrapIcon(FilterList);
export const Clock = wrapIcon(Schedule);
export const AlertCircle = wrapIcon(ErrorOutlined);
export const Image = wrapIcon(MuiImage);
export const ImageIcon = wrapIcon(MuiImage);
export const ExternalLink = wrapIcon(OpenInNew);
export const Trash2 = wrapIcon(Delete);
export const Send = wrapIcon(MuiSend);
export const CheckCircle2 = wrapIcon(CheckCircle);
export const MailOpen = wrapIcon(Drafts);
export const RefreshCw = wrapIcon(Refresh);
export const Phone = wrapIcon(MuiPhone);
export const Linkedin = wrapIcon(MuiLinkedIn);
export const Award = wrapIcon(WorkspacePremium);
export const TrendingUp = wrapIcon(MuiTrendingUp);
export const ArrowUpRight = wrapIcon(NorthEast);
export const DollarSign = wrapIcon(AttachMoney);
export const Box = wrapIcon(Inventory);
export const GraduationCap = wrapIcon(School);
export const Plus = wrapIcon(Add);
export const Pencil = wrapIcon(Edit);
export const Upload = wrapIcon(CloudUpload);
export const Video = wrapIcon(VideoCameraBack);
export const ImageOff = wrapIcon(ImageNotSupported);
export const AlertTriangle = wrapIcon(Warning);
export const UserPlus = wrapIcon(PersonAdd);
export const Shield = wrapIcon(MuiShield);
export const ShieldAlert = wrapIcon(AdminPanelSettings);
export const Check = wrapIcon(MuiCheck);
export const Home = wrapIcon(MuiHome);
export const HomeIcon = wrapIcon(MuiHome);
export const Info = wrapIcon(MuiInfo);
export const Sun = wrapIcon(LightMode);
export const Moon = wrapIcon(DarkMode);
export const SwitchView = wrapIcon(SwapHoriz);
export const MoreHorizontal = wrapIcon(MoreHoriz);
