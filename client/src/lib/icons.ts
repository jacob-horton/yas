import CalendarIcon from "lucide-solid/icons/calendar";
import ChartColumnIcon from "lucide-solid/icons/chart-column";
import ChevronLeftIcon from "lucide-solid/icons/chevron-left";
import ClipboardIcon from "lucide-solid/icons/clipboard";
import CrownIcon from "lucide-solid/icons/crown";
import HashIcon from "lucide-solid/icons/hash";
import InfinityIcon from "lucide-solid/icons/infinity";
import Layers2Icon from "lucide-solid/icons/layers-2";
import MountainIcon from "lucide-solid/icons/mountain";
import PlusIcon from "lucide-solid/icons/plus";
import StarIcon from "lucide-solid/icons/star";
import TrashIcon from "lucide-solid/icons/trash-2";
import TrophyIcon from "lucide-solid/icons/trophy";
import UserStarIcon from "lucide-solid/icons/user-star";
import UsersIcon from "lucide-solid/icons/users";
import WheatIcon from "lucide-solid/icons/wheat";

export const ICON_MAP = {
  calendar: CalendarIcon,
  chart: ChartColumnIcon,
  chevronLeft: ChevronLeftIcon,
  copy: ClipboardIcon,
  crown: CrownIcon,
  delete: TrashIcon,
  hash: HashIcon,
  infinity: InfinityIcon,
  mountain: MountainIcon,
  plus: PlusIcon,
  stack: Layers2Icon,
  star: StarIcon,
  trophy: TrophyIcon,
  userStar: UserStarIcon,
  users: UsersIcon,
  wheat: WheatIcon,
} as const;

export type Icon = keyof typeof ICON_MAP;
