import AtSignIcon from "lucide-solid/icons/at-sign";
import CalendarIcon from "lucide-solid/icons/calendar";
import ChartColumnIcon from "lucide-solid/icons/chart-column";
import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import CircleAlertIcon from "lucide-solid/icons/circle-alert";
import CircleCheckIcon from "lucide-solid/icons/circle-check";
import ClipboardIcon from "lucide-solid/icons/clipboard";
import CrownIcon from "lucide-solid/icons/crown";
import HashIcon from "lucide-solid/icons/hash";
import InfinityIcon from "lucide-solid/icons/infinity";
import InfoIcon from "lucide-solid/icons/info";
import Layers2Icon from "lucide-solid/icons/layers-2";
import LoaderCircleIcon from "lucide-solid/icons/loader-circle";
import LockKeyholeIcon from "lucide-solid/icons/lock-keyhole";
import LogOutIcon from "lucide-solid/icons/log-out";
import MenuIcon from "lucide-solid/icons/menu";
import MountainIcon from "lucide-solid/icons/mountain";
import NotebookPenIcon from "lucide-solid/icons/notebook-pen";
import PlusIcon from "lucide-solid/icons/plus";
import EditIcon from "lucide-solid/icons/square-pen";
import StarIcon from "lucide-solid/icons/star";
import TrashIcon from "lucide-solid/icons/trash-2";
import TrophyIcon from "lucide-solid/icons/trophy";
import UserStarIcon from "lucide-solid/icons/user-star";
import UsersIcon from "lucide-solid/icons/users";
import WheatIcon from "lucide-solid/icons/wheat";

export const ICON_MAP = {
  atSign: AtSignIcon,
  calendar: CalendarIcon,
  chart: ChartColumnIcon,
  chevronLeft: ChevronLeftIcon,
  circleAlert: CircleAlertIcon,
  circleCheck: CircleCheckIcon,
  copy: ClipboardIcon,
  crown: CrownIcon,
  delete: TrashIcon,
  edit: EditIcon,
  hash: HashIcon,
  infinity: InfinityIcon,
  info: InfoIcon,
  loaderCircle: LoaderCircleIcon,
  lockKeyhole: LockKeyholeIcon,
  logOut: LogOutIcon,
  menu: MenuIcon,
  mountain: MountainIcon,
  notebookPen: NotebookPenIcon,
  plus: PlusIcon,
  stack: Layers2Icon,
  star: StarIcon,
  trophy: TrophyIcon,
  userStar: UserStarIcon,
  users: UsersIcon,
  wheat: WheatIcon,
} as const;

export type Icon = keyof typeof ICON_MAP;
